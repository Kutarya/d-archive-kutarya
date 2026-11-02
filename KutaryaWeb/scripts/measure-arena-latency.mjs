// Ham WebSocket ile tarayıcı ana iş parçacığı ayrı ölçülür; yerel port açılmaz.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { WebSocket } from "../arena-server/node_modules/ws/wrapper.mjs";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const phase = process.argv[2] || "before",
  version = phase === "before" ? "2.0.0" : "2.1.0";
const out = resolve("artifacts/releases/block-arena/2.1.0");
await mkdir(out, { recursive: true });
const endpoint =
  process.env.ARENA_MEASURE_URL ||
  "https://kutarya-block-arena-faferhidua-ew.a.run.app";
const summary = (a) => {
  const x = a.toSorted((a, b) => a - b);
  return {
    samples: x.length,
    min: Math.round(x[0]),
    median: Math.round(x[Math.floor(x.length / 2)]),
    p95: Math.round(x[Math.floor(x.length * 0.95)]),
    max: Math.round(x.at(-1)),
  };
};
const ws = new WebSocket(endpoint.replace("https:", "wss:") + "/play", {
  origin: "https://kutarya.com",
});
const raw = [],
  pending = new Map();
ws.on("message", (bytes) => {
  const m = JSON.parse(bytes);
  if (m.type === "pong" && pending.has(m.at)) {
    raw.push(performance.now() - pending.get(m.at));
    pending.delete(m.at);
  }
});
await new Promise((done, fail) => {
  ws.once("open", done);
  ws.once("error", fail);
});
try {
  ws.send(
    JSON.stringify({
      type: "hello",
      version,
      name: "ÖLÇÜM",
      create: { map: 0, mode: 0, duration: 180 },
    }),
  );
  for (let i = 0; i < 20; i++) {
    pending.set(i, performance.now());
    ws.send(JSON.stringify({ type: "ping", at: i }));
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 500));
} finally {
  ws.send(JSON.stringify({ type: "leave" }));
  ws.close();
}
assert(raw.length >= 15);
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const proof = {
  at: new Date().toISOString(),
  phase,
  version,
  endpoint,
  rawRtt: summary(raw),
  browser: {},
  rendererErrors: errors,
};
try {
  proof.live = !process.argv.includes("--local");
  await page.goto(
    proof.live
      ? "https://kutarya.com/games/pixelgun/" + version + "/index.html"
      : pathToFileURL(resolve(out, "runtime/index.html")).href,
  );
  await page.waitForFunction(
    () => typeof arenaNet !== "undefined" && arenaNet.setup && gl,
  );
  await page.locator('[data-page="online"]').click();
  await page.locator("#onlineName").click();
  await page.keyboard.press("ControlOrMeta+A");
  await page
    .locator("#onlineName")
    .pressSequentially("Yunus ASD RQ 12", { delay: 20 });
  proof.browser.typedName = await page.locator("#onlineName").inputValue();
  assert.equal(proof.browser.typedName, "Yunus ASD RQ 12");
  await page.locator("#createRoom").click();
  await page.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  proof.browser.nameDisabledInRoom = await page
    .locator("#onlineName")
    .isDisabled();
  await page.evaluate(() => {
    window.latencySamples = [];
    window.packetBytes = [];
    window.frameSamples = [];
    window.probePending = new Map();
    let prev = performance.now();
    function sample(t) {
      frameSamples.push(t - prev);
      prev = t;
      if (frameSamples.length < 1600) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
    arenaNet.socket.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.type === "pong" && probePending.has(m.at)) {
        latencySamples.push(performance.now() - probePending.get(m.at));
        probePending.delete(m.at);
      }
      if (m.type === "snapshot") packetBytes.push(e.data.length);
    });
    window.latencyTimer = setInterval(() => {
      const now = performance.now(),
        at = -now;
      probePending.set(at, now);
      arenaNet.send({ type: "ping", at });
    }, 300);
  });
  await page.waitForTimeout(4500);
  const sample = await page.evaluate(() => ({
    rtt: latencySamples,
    frames: frameSamples.filter((n) => n > 0),
    packets: packetBytes,
    fps: currentFps,
    name: profile.name,
  }));
  proof.browser.lobby = {
    rtt: summary(sample.rtt),
    frameMs: summary(sample.frames),
    snapshotBytes: sample.packets.length ? summary(sample.packets) : null,
    fps: Math.round(sample.fps),
  };
  await page.evaluate(() => {
    clearInterval(latencyTimer);
    arenaNet.leave();
  });
  await page.screenshot({ path: resolve(out, phase + "-online.png") });
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(out, phase + "-latency.json"),
    JSON.stringify(proof, null, 2),
  );
  console.log(JSON.stringify(proof));
} finally {
  await browser.close();
}
