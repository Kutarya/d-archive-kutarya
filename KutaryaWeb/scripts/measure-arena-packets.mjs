// Aynı sekiz oyunculu oda, aynı sunucu: eski tam paket ve yeni oyuncu paketi.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { WebSocket } from "../arena-server/node_modules/ws/wrapper.mjs";
import {
  arenaReleaseDirectory as out,
  arenaVersion,
} from "./arena-release-paths.mjs";
const { url } = JSON.parse(await readFile(`${out}/service.json`, "utf8")),
  clients = [];
async function connect(protocol, hello) {
  const ws = new WebSocket(url.replace("https:", "wss:") + "/play", {
      origin: "https://kutarya.com",
    }),
    c = { ws, packets: [], s: null };
  clients.push(c);
  ws.on("message", (raw) => {
    const s = JSON.parse(raw);
    if (["snapshot", "welcome"].includes(s.type)) {
      c.s = s;
      if (s.type === "snapshot" && s.players.length === 8)
        c.packets.push(raw.length);
    }
  });
  ws.on("error", () => {});
  await new Promise((done, fail) => {
    ws.once("open", done);
    ws.once("error", fail);
  });
  ws.send(
    JSON.stringify({
      type: "hello",
      version: protocol === 2 ? "2.0.0" : arenaVersion,
      protocol,
      name: "ÖLÇÜM " + clients.length,
      ...hello,
    }),
  );
  const until = Date.now() + 20000;
  while (!c.s && Date.now() < until)
    await new Promise((r) => setTimeout(r, 50));
  assert(c.s);
  return c;
}
try {
  const legacy = await connect(2, {
      create: { map: 0, mode: 0, duration: 180 },
    }),
    modern = await connect(3, { room: legacy.s.room });
  for (let i = 0; i < 6; i++) await connect(3, { room: legacy.s.room });
  await new Promise((r) => setTimeout(r, 1800));
  assert(legacy.packets.length >= 3 && modern.packets.length >= 3);
  const median = (a) => a.toSorted((a, b) => a - b)[Math.floor(a.length / 2)],
    oldBytes = median(legacy.packets),
    newBytes = median(modern.packets);
  assert(newBytes < oldBytes * 0.6);
  const proof = {
    at: new Date().toISOString(),
    passed: true,
    realCloud: true,
    sameRoom: true,
    players: 8,
    legacyMedianBytes: oldBytes,
    compactMedianBytes: newBytes,
    reductionPercent: Math.round((1 - newBytes / oldBytes) * 100),
    legacySamples: legacy.packets.length,
    compactSamples: modern.packets.length,
  };
  await writeFile(
    `${out}/packet-acceptance.json`,
    JSON.stringify(proof, null, 2),
  );
  console.log(JSON.stringify(proof));
} finally {
  for (const c of clients) {
    if (c.ws.readyState === 1) c.ws.send(JSON.stringify({ type: "leave" }));
    c.ws.close();
  }
}
