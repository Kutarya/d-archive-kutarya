// Gerçek bulut servisine yalnız normal oyun protokolü. Konum/hasar/skor yazılmaz.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { WebSocket } from "../arena-server/node_modules/ws/wrapper.mjs";
import { createWorld } from "../arena-server/rules.mjs";
import {
  arenaReleaseDirectory as out,
  arenaVersion,
} from "./arena-release-paths.mjs";
const { url } = JSON.parse(await readFile(`${out}/service.json`, "utf8"));
assert.equal(
  (await (await fetch(url + "/health")).json()).version,
  arenaVersion,
);
const clients = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, message, ms = 15000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (fn()) return;
    await sleep(100);
  }
  throw Error(message);
}
async function connect(hello) {
  const ws = new WebSocket(url.replace("https:", "wss:") + "/play", {
    origin: "https://kutarya.com",
  });
  const c = {
    ws,
    id: null,
    token: null,
    s: null,
    error: null,
    seq: 0,
    events: [],
    control: null,
  };
  clients.push(c);
  ws.on("message", (raw) => {
    const s = JSON.parse(raw);
    if (s.type === "error") c.error = s.message;
    if (["welcome", "snapshot"].includes(s.type)) {
      c.s = s;
      c.events.push(...(s.events || []));
      if (c.events.length > 500) c.events.splice(0, c.events.length - 500);
      if (s.type === "welcome") {
        c.id = s.id;
        c.token = s.token;
        c.seq = s.seq || 0;
      }
    }
  });
  ws.on("error", () => {});
  await new Promise((done, fail) => {
    ws.once("open", done);
    ws.once("error", () => fail(Error("WebSocket açılamadı")));
  });
  ws.send(
    JSON.stringify({
      type: "hello",
      version: arenaVersion,
      protocol: 3,
      name: "KABUL",
      ...hello,
    }),
  );
  await until(() => c.s || c.error, "Oturum yanıt vermedi", 30000);
  return c;
}
function send(c, m) {
  if (m.type === "input")
    m = {
      type: "inputs",
      inputs: [0, 1, 2].map((i) => ({ ...m, seq: m.seq * 3 - 2 + i })),
    };
  if (c.ws.readyState === 1) c.ws.send(JSON.stringify(m));
}
function state(c) {
  return c.s?.players.find((p) => p.id === c.id);
}
function path(map, from, to) {
  const start = map.toCell(from.x, from.z),
    goal = map.toCell(to.x, to.z),
    key = (p) => p.join(","),
    queue = [start],
    parent = new Map([[key(start), null]]);
  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    if (key(p) === key(goal)) {
      const result = [];
      let cur = p;
      while (parent.get(key(cur))) {
        const [x, z] = map.toWorld(...cur);
        result.unshift({ x, z });
        cur = parent.get(key(cur));
      }
      return result;
    }
    for (const n of [
      [p[0] + 1, p[1]],
      [p[0] - 1, p[1]],
      [p[0], p[1] + 1],
      [p[0], p[1] - 1],
    ])
      if (
        n[0] > 0 &&
        n[1] > 0 &&
        n[0] < map.N - 1 &&
        n[1] < map.N - 1 &&
        !map.grid[n[1]][n[0]] &&
        !parent.has(key(n))
      ) {
        parent.set(key(n), p);
        queue.push(n);
      }
  }
  return [];
}
let pump;
const proof = {
  at: new Date().toISOString(),
  version: arenaVersion,
  url,
  realCloud: true,
  serverAuthoritative: true,
  actions: {},
};
try {
  const legacy=await connect({version:"2.0.0",protocol:2,name:"ESKİ SÜRÜM",create:{map:0,mode:0,duration:180}});
  assert(legacy.s && !legacy.error);proof.actions.oldVersionStillConnects=true;send(legacy,{type:"leave"});legacy.ws.close();
  const a = await connect({
      name: "KABUL ATLAS",
      create: { map: 2, mode: 0, duration: 180 },
    }),
    room = a.s.room;
  const b = await connect({ name: "KABUL UFUK", room });
  await until(() => a.s.players.length === 2, "İkinci oyuncu görünmedi");
  send(b, { type: "start" });
  await until(() => b.error, "Yetkisiz başlatma yanıtı yok");
  assert(/sahibi/.test(b.error));
  b.error = null;
  proof.actions.nonHostStartDenied = true;
  // Sınır gerçek bağlantılarda ölçülür; test oturumları maçtan önce ayrılır.
  const extra = [];
  for (let i = 0; i < 6; i++)
    extra.push(await connect({ name: `KABUL ${i + 3}`, room }));
  const ninth = await connect({ name: "KABUL 9", room });
  assert(ninth.error?.includes("dolu"));
  ninth.ws.close();
  proof.actions.eightPlayerRoomAndNinthDenied = true;
  for (const c of extra) {
    send(c, { type: "leave" });
    c.ws.close();
  }
  await until(() => a.s.players.length === 2, "Ek test oturumları ayrılmadı");
  send(a, { type: "start" });
  await until(() => a.s.phase === "playing", "Maç başlamadı");
  const w = createWorld(2),
    map = w.map;
  const before = state(a);
  send(a, {
    type: "input",
    seq: ++a.seq,
    f: 0,
    r: 0,
    yaw: 0,
    pitch: 0,
    fire: false,
    ads: false,
    sprint: false,
    jump: false,
    dash: false,
    x: 9000,
    hp: 9999,
    kills: 999,
  });
  await sleep(180);
  assert.equal(state(a).hp, 100);
  assert.equal(state(a).kills, 0);
  assert(Math.abs(state(a).x) < 25);
  proof.actions.injectedScoreAndTeleportIgnored = true;
  let route = [],
    lastRoute = 0,
    fire = true;
  pump = setInterval(() => {
    for (const c of [a, b]) {
      const p = state(c);
      if (!p || c.s.phase !== "playing") continue;
      let f = 0,
        yaw = p.yaw,
        pitch = 0,
        shoot = false;
      if (c === a && p.hp > 0) {
        const target = b.s.players.find((t) => t.id === b.id),
          dx = target.x - p.x,
          dz = target.z - p.z,
          distance = Math.hypot(dx, dz);
        const dy = target.y + 1 - p.y - 1.47,
          dir = [dx, dy, dz].map((v) => v / (Math.hypot(dx, dy, dz) || 1));
        const clear =
          w.wallRay([p.x, p.y + 1.47, p.z], dir, distance + 0.5) >=
          distance - 0.1;
        if (clear && distance < 38) {
          yaw = Math.atan2(dx, -dz);
          pitch = Math.atan2(dy, distance);
          shoot = fire && target.hp > 0;
        } else {
          if (Date.now() - lastRoute > 800) {
            route = path(map, p, target);
            lastRoute = Date.now();
          }
          while (
            route.length &&
            Math.hypot(route[0].x - p.x, route[0].z - p.z) < 0.45
          )
            route.shift();
          if (route.length) {
            yaw = Math.atan2(route[0].x - p.x, -(route[0].z - p.z));
            f = 1;
          }
        }
      }
      send(c, {
        type: "input",
        seq: ++c.seq,
        f,
        r: 0,
        yaw,
        pitch,
        fire: shoot,
        ads: true,
        sprint: false,
        jump: false,
        dash: false,
      });
    }
  }, 50);
  await until(
    () => state(a).kills >= 1 && state(b).deaths >= 1,
    "Gerçek eleme gerçekleşmedi",
    65000,
  );
  proof.actions.realHitAndKill = true;
  proof.actions.sameScoreOnBothClients =
    a.s.players.find((p) => p.id === a.id).kills ===
    b.s.players.find((p) => p.id === a.id).kills;
  fire = false;
  await until(
    () => state(b).hp > 0 && state(b).safe > 0,
    "Yeniden doğma gerçekleşmedi",
    6000,
  );
  proof.actions.serverRespawn = true;
  const stats = state(a);
  assert(stats.shots > 0 && stats.hits > 0);
  proof.actualCombat = {
    kills: stats.kills,
    shots: stats.shots,
    hits: stats.hits,
  };
  console.log(
    "Bulutta gerçek hareket/vuruş/eleme/yeniden doğma geçti; üç dakikalık maç sonucu bekleniyor.",
  );
  await until(
    () => a.s.phase === "results" && b.s.phase === "results",
    "Gerçek maç sonucu gelmedi",
    190000,
  );
  assert.equal(a.s.elapsed, 180);
  assert.equal(b.s.elapsed, 180);
  proof.actions.realTimedResults = true;
  send(a, { type: "start" });
  await until(() => a.s.round === 2 && b.s.round === 2, "Rövanş başlamadı");
  proof.actions.rematch = true;
  clearInterval(pump);
  pump = null;
  for (const c of [a, b]) {
    send(c, { type: "leave" });
    c.ws.close();
  }
  // Takım ayarı ve gerçek takımlar aynı serviste ayrı odada doğrulanır.
  const t = await connect({
      name: "KABUL TAKIM",
      create: { map: 1, mode: 1, duration: 180 },
    }),
    u = await connect({ name: "KABUL RAKİP", room: t.s.room });
  send(t, { type: "start" });
  await until(() => t.s.phase === "playing", "Takım maçı başlamadı");
  assert.notEqual(state(t).team, state(u).team);
  proof.actions.teamRoom = true;
  proof.passed = true;
  await writeFile(
    `${out}/protocol-acceptance.json`,
    JSON.stringify(proof, null, 2),
  );
  console.log(JSON.stringify(proof));
} finally {
  if (pump) clearInterval(pump);
  for (const c of clients) {
    send(c, { type: "leave" });
    c.ws.close();
  }
}
