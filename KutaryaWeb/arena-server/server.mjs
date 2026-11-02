import http from "node:http";
import { randomBytes } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";
import { Room, VERSION } from "./engine.mjs";

const rooms = new Map(),
  clients = new Set(),
  MAX_CLIENTS = 128,
  MAX_ROOMS = 16;
const allowed = new Set([
  "https://kutarya.com",
  "https://www.kutarya.com",
  "https://kutarya-ai-3169.web.app",
  "https://kutarya-ai-3169.firebaseapp.com",
  "null",
]);
const server = http.createServer((req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.url !== "/health") {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({ ok: true, version: VERSION, protocol: 3, maxPlayers: 8 }),
  );
});
const wss = new WebSocketServer({
  noServer: true,
  maxPayload: 2048,
  perMessageDeflate: false,
});
server.on("upgrade", (req, socket, head) => {
  if (
    req.url !== "/play" ||
    !allowed.has(req.headers.origin) ||
    clients.size >= MAX_CLIENTS
  ) {
    socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
});
const send = (ws, data) => {
  if (ws.readyState !== WebSocket.OPEN || ws.bufferedAmount >= 16384)
    return false;
  ws.send(JSON.stringify(data));
  return true;
};
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.alive = true;
  ws.window = Date.now();
  ws.messages = 0;
  ws.actor = null;
  ws.room = null;
  const handshake = setTimeout(() => {
    if (!ws.actor) ws.close(1008, "Oturum başlamadı");
  }, 10000);
  handshake.unref();
  ws.on("pong", () => (ws.alive = true));
  ws.on("message", (raw) => {
    const now = Date.now();
    if (now - ws.window > 1000) {
      ws.window = now;
      ws.messages = 0;
    }
    if (++ws.messages > 70) {
      ws.close(1008, "Çok fazla mesaj");
      return;
    }
    let m;
    try {
      m = JSON.parse(raw.toString());
      if (!m || Array.isArray(m) || typeof m !== "object") throw Error();
    } catch {
      ws.close(1008, "Geçersiz mesaj");
      return;
    }
    try {
      if (m.type === "ping") {
        send(ws, { type: "pong", at: m.at });
        return;
      }
      if (m.type === "hello") {
        if (ws.actor) throw Error("Oturum zaten açık.");
        if (!["2.0.0", VERSION].includes(m.version))
          throw Error("Oyun sürümünü güncelle ve tekrar dene.");
        let room, actor;
        if (m.resume) {
          room = rooms.get(m.room);
          actor =
            room &&
            [...room.players.values()].find((p) => p.token === m.resume);
          if (!actor || actor.connected || now - actor.disconnectedAt > 30000)
            throw Error("Oturum süresi doldu. Odaya yeniden katıl.");
          actor.connected = true;
          actor.inputAt = now;
          actor.input.f = 0;
          actor.input.r = 0;
        } else if (m.create) {
          if (rooms.size >= MAX_ROOMS)
            throw Error("Arenalar şu an dolu. Biraz sonra tekrar dene.");
          let code;
          do {
            code = randomBytes(4).toString("hex").slice(0, 6).toUpperCase();
          } while (rooms.has(code));
          room = new Room(code, m.create, now);
          actor = room.add(m.name, m.weapon, m.color, now);
          rooms.set(code, room);
        } else {
          if (!/^[A-F0-9]{6}$/.test(m.room || ""))
            throw Error("6 karakterli oda kodunu yaz.");
          room = rooms.get(m.room);
          if (!room) throw Error("Oda bulunamadı veya kapanmış.");
          actor = room.add(m.name, m.weapon, m.color, now);
        }
        ws.room = room;
        ws.actor = actor;
        actor.protocol = m.protocol === 3 ? 3 : 2;
        actor.motionQueue = [];
        actor.motionCredit = 0;
        clearTimeout(handshake);
        ws.lastEvent = room.eventId;
        send(ws, {
          ...room.snapshot(),
          type: "welcome",
          id: actor.id,
          token: actor.token,
          seq: actor.seq,
        });
        return;
      }
      if (!ws.actor || !ws.room) throw Error("Önce odaya katıl.");
      if (m.type === "input") {
        if (ws.actor.protocol !== 2) return;
        ws.room.setInput(ws.actor, m, now);
        return;
      }
      if (m.type === "inputs") {
        if (!ws.room.queueInputs(ws.actor, m.inputs, now))
          send(ws, { type: "error", message: "Hareket girdisi reddedildi." });
        return;
      }
      if (m.type === "rename") {
        const name = ws.room.rename(ws.actor, m.name, now);
        send(ws, { type: "profile", name });
        return;
      }
      if (["start", "reload", "weapon", "grenade"].includes(m.type)) {
        ws.room.command(ws.actor, m);
        return;
      }
      if (m.type === "leave") {
        ws.room.remove(ws.actor.id);
        ws.actor = null;
        ws.room = null;
        ws.close(1000, "Odadan ayrıldı");
      }
    } catch (e) {
      send(ws, { type: "error", message: String(e.message).slice(0, 180) });
    }
  });
  ws.on("error", () => {});
  ws.on("close", () => {
    clients.delete(ws);
    clearTimeout(handshake);
    if (ws.actor && ws.room) ws.room.disconnect(ws.actor);
  });
});
let last = performance.now(),
  sendElapsed = 0;
const clock = setInterval(() => {
  const now = performance.now(),
    dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  for (const [code, room] of rooms) {
    room.step(dt);
    if (!room.players.size || Date.now() - room.createdAt > 45 * 60 * 1000) {
      for (const ws of clients)
        if (ws.room === room) ws.close(1000, "Oda kapandı");
      rooms.delete(code);
    }
  }
  sendElapsed += dt;
  if (sendElapsed >= 0.05) {
    sendElapsed %= 0.05;
    const packets = new Map();
    for (const ws of clients) {
      if (!ws.room || !ws.actor) continue;
      if (
        ws.room.phase === "lobby" &&
        performance.now() - (ws.lastLobbyPacket || 0) < 250 &&
        ws.lastEvent === ws.room.eventId
      )
        continue;
      if (!packets.has(ws.room)) packets.set(ws.room, ws.room.snapshot());
      const snapshot = packets.get(ws.room);
      const players =
        ws.actor.protocol === 3
          ? snapshot.players.map((p) =>
              p.id === ws.actor.id
                ? p
                : Object.fromEntries(
                    [
                      "id",
                      "name",
                      "team",
                      "color",
                      "weapon",
                      "x",
                      "y",
                      "z",
                      "yaw",
                      "pitch",
                      "hp",
                      "safe",
                      "kills",
                      "deaths",
                      "connected",
                      "life",
                      "walk",
                    ].map((k) => [
                      k,
                      typeof p[k] === "number"
                        ? Math.round(p[k] * 1000) / 1000
                        : p[k],
                    ]),
                  ),
            )
          : snapshot.players;
      const sent = send(ws, {
        ...snapshot,
        players,
        events: snapshot.events.filter((e) => e.id > (ws.lastEvent || 0)),
      });
      if (sent) {
        ws.lastEvent = ws.room.eventId;
        ws.lastLobbyPacket = performance.now();
      }
    }
  }
}, 1000 / 60);
clock.unref();
const heartbeat = setInterval(() => {
  for (const ws of clients) {
    if (!ws.alive) {
      ws.terminate();
      continue;
    }
    ws.alive = false;
    ws.ping();
  }
}, 15000);
heartbeat.unref();
server.listen(Number(process.env.PORT) || 8080, "0.0.0.0", () =>
  console.log(`Kutarya Block Arena ${VERSION} hazır.`),
);
process.on("SIGTERM", () => {
  for (const ws of clients) ws.close(1012, "Sunucu yeniden başlıyor");
  wss.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
});
