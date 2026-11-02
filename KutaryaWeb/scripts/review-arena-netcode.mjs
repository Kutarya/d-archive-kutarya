// Gerçek bulut + iki tarayıcı; ek paket gecikmesi kontrollü testtir, farklı ağ ölçümü değildir.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { arenaReleaseDirectory, arenaVersion } from "./arena-release-paths.mjs";
const out = resolve(arenaReleaseDirectory),
  live = process.argv.includes("--live");
const url = live
  ? `https://kutarya.com/games/pixelgun/${arenaVersion}/index.html`
  : pathToFileURL(resolve(out, "runtime/index.html")).href;
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const contexts = await Promise.all([
  browser.newContext({ viewport: { width: 1280, height: 800 } }),
  browser.newContext({ viewport: { width: 1280, height: 800 } }),
]);
const [a, b] = await Promise.all(contexts.map((c) => c.newPage())),
  errors = [];
for (const p of [a, b]) p.on("pageerror", (e) => errors.push(e.message));
async function name(p, id, text) {
  const el = p.locator("#" + id);
  await el.click();
  await p.keyboard.press("ControlOrMeta+A");
  await el.pressSequentially(text, { delay: 12 });
  assert.equal(await el.inputValue(), text);
}
const proof = {
  at: new Date().toISOString(),
  version: arenaVersion,
  live,
  realCloud: true,
  controlledDelay: { uplinkMs: 120, downlinkMs: 120 },
  actions: {},
  rendererErrors: errors,
};
try {
  for (const p of [a, b]) {
    await p.goto(url);
    await p.waitForFunction(() => gl && map && arenaNet.setup);
    await p.locator('[data-page="online"]').click();
  }
  await name(a, "onlineName", "Çağrı ASD RQ 12");
  await a.locator("#createRoom").click();
  await a.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  const room = await a.evaluate(() => arenaNet.room);
  await name(b, "onlineName", "Şahin 42");
  await b.locator("#roomInput").pressSequentially(room);
  await b.locator("#joinRoom").click();
  await b.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  await a.waitForFunction(
    () => document.querySelectorAll("#roomPlayers .room-player").length === 2,
  );
  proof.actions.realKeyboardNamesAndRoomCode = true;
  assert.equal(await a.locator("#onlineName").isDisabled(), false);
  assert.equal(await b.locator("#onlineName").isDisabled(), false);
  await name(a, "onlineName", "Yunus Oyuncu");
  await a.locator("#saveOnlineName").click();
  await b.waitForFunction(() =>
    document.querySelector("#roomPlayers").textContent.includes("Yunus Oyuncu"),
  );
  await name(b, "onlineName", "Yunus Oyuncu");
  await b.locator("#saveOnlineName").click();
  await b.waitForFunction(() => profile.name === "Yunus Oyuncu 2");
  assert.equal(await a.evaluate(() => profile.name), "Yunus Oyuncu");
  proof.actions.eachActorRenamedAndDuplicateSeparated = true;
  await a.locator("#onlineStart").click();
  await Promise.all([
    a.waitForFunction(() => arenaNet.phase === "playing"),
    b.waitForFunction(() => arenaNet.phase === "playing"),
  ]);
  await a.locator("#gamePause").click();
  await name(a, "pauseName", "Çağrı Arena");
  await a.locator("#pauseSaveName").click();
  await b.waitForFunction(() => bots.some((p) => p.name === "Çağrı Arena"));
  proof.actions.renameDuringMatchFromMenu = true;
  await a.locator("#resume").click();
  await a.evaluate(() => {
    if (state === "paused") resumeGame();
  });
  await a.evaluate(() => {
    const ws = arenaNet.socket,
      send = ws.send.bind(ws),
      receive = ws.onmessage;
    ws.send = (data) =>
      setTimeout(() => {
        if (ws.readyState === 1) send(data);
      }, 120);
    ws.onmessage = (event) => setTimeout(() => receive(event), 120);
    window.responseSamples = [];
  });
  await a.waitForFunction(() => arenaNet.ping > 220, {}, { timeout: 6000 });
  proof.delayedRttMs = await a.evaluate(() => arenaNet.ping);
  const key = await a.evaluate(() => {
    const p = player,
      dirs = [
        ["KeyW", Math.sin(p.yaw), -Math.cos(p.yaw)],
        ["KeyS", -Math.sin(p.yaw), Math.cos(p.yaw)],
        ["KeyD", Math.cos(p.yaw), Math.sin(p.yaw)],
        ["KeyA", -Math.cos(p.yaw), -Math.sin(p.yaw)],
      ];
    return dirs.find(([, dx, dz]) =>
      [0.5, 1, 1.5, 2.5].every((d) => !blocked(p.x + dx * d, p.z + dz * d)),
    )?.[0];
  });
  assert(key, "Hareket için açık yön yok.");
  const start = await a.evaluate(() => {
    window.responseStart = { at: performance.now(), x: player.x, z: player.z };
    return responseStart;
  });
  await a.keyboard.down(key);
  await a.waitForFunction(
    () =>
      Math.hypot(player.x - responseStart.x, player.z - responseStart.z) >
      0.035,
  );
  proof.firstMovementResponseMs = Math.round(
    await a.evaluate(() => performance.now() - responseStart.at),
  );
  assert(proof.firstMovementResponseMs < 110);
  await a.waitForTimeout(350);
  await a.keyboard.up(key);
  const moved = await a.evaluate(() =>
    Math.hypot(player.x - responseStart.x, player.z - responseStart.z),
  );
  assert(moved > 1);
  await a.waitForTimeout(1000);
  const settled = await a.evaluate(() => ({
    error: Math.hypot(player.x - arenaNet.goal.x, player.z - arenaNet.goal.z),
    pending: arenaNet.pending.length,
    ack: arenaNet.goal.motionSeq,
    seq: arenaNet.seq,
  }));
  assert(settled.error < 0.2);
  assert(settled.pending < 60);
  proof.actions.responsiveWithControlledDelay = true;
  proof.actions.reconciledToAuthority = true;
  proof.movement = { distance: moved, ...settled };
  await a.evaluate(() => {
    if (state === "paused") resumeGame();
  });
  await a.mouse.move(640, 400);
  await a.mouse.down();
  await a.waitForTimeout(60);
  assert((await a.evaluate(() => recoil)) > 0.01);
  await a.mouse.up();
  proof.actions.immediateShotRecoil = true;
  await a.screenshot({
    path: resolve(out, `${live ? "live" : "local"}-delayed-match.png`),
  });
  await a.waitForFunction(
    () => player.ammo[player.weapon].mag < WEAPONS[player.weapon].mag,
  );
  proof.actions.serverConfirmedAmmo = true;
  await a.evaluate(() => arenaNet.leave());
  await b.evaluate(() => arenaNet.leave());
  assert.deepEqual(errors, []);
  proof.passed = true;
  await writeFile(
    resolve(out, `${live ? "live" : "local"}-netcode-acceptance.json`),
    JSON.stringify(proof, null, 2),
  );
  console.log(JSON.stringify(proof));
} catch (e) {
  console.error(JSON.stringify({ message: e.message, rendererErrors: errors }));
  throw e;
} finally {
  await browser.close();
}
