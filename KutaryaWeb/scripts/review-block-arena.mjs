// Gerçek WebGL + gerçek bulut WebSocket; yerel HTTP/debug sunucusu açılmaz.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { arenaReleaseDirectory, arenaVersion } from "./arena-release-paths.mjs";
const out = resolve(arenaReleaseDirectory);
await mkdir(out, { recursive: true });
const live = process.argv.includes("--live");
const url = live
  ? `https://kutarya.com/games/pixelgun/${arenaVersion}/index.html`
  : pathToFileURL(resolve(out, "runtime/index.html")).href;
const errors = [];
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const proof = {
  at: new Date().toISOString(),
  gameId: "pixelgun",
  version: arenaVersion,
  url,
  live,
  views: [],
  offline: [],
  online: {},
  listeningServerStarted: false,
  physicalDeviceTested: false,
};
async function ready(p) {
  await p.goto(url);
  await p.waitForFunction(
    () =>
      typeof gl !== "undefined" &&
      gl &&
      map &&
      document.querySelector("#home.active"),
  );
  assert.equal(await p.locator("#fatal").isVisible(), false);
}
async function view(id, width, height) {
  await page.setViewportSize({ width, height });
  await page.evaluate((id) => showPage(id), id);
  const dimensions = await page.locator(".screen.active").evaluate((el) => ({
    width: innerWidth,
    client: el.clientWidth,
    scroll: el.scrollWidth,
  }));
  assert(
    dimensions.scroll <= dimensions.client + 1,
    `${id} ${width}: yatay taşma`,
  );
  proof.views.push({ id, width, height, horizontalOverflow: false });
}
try {
  await ready(page);
  for (const [width, height] of [
    [1280, 800],
    [390, 844],
    [844, 390],
  ])
    for (const id of [
      "home",
      "setup",
      "online",
      "loadout",
      "settings",
      "help",
      "stats",
    ])
      await view(id, width, height);
  for (const width of [1280, 390]) {
    await view("home", width, 800);
    await page.screenshot({
      path: resolve(out, `${live ? "live" : "local"}-home-${width}.png`),
    });
    await view("online", width, 800);
    await page.screenshot({
      path: resolve(out, `${live ? "live" : "local"}-online-${width}.png`),
    });
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  for (let i = 0; i < 3; i++) {
    await page.evaluate((i) => {
      showPage("setup");
      selectMap(i);
    }, i);
    await page.locator("#startMatch").click();
    await page.waitForFunction(
      () => state === "playing" && bots.length > 0 && player.hp > 0,
    );
    await page.waitForTimeout(1200);
    const sample = await page.evaluate(() => ({
      map: mapIndex,
      bots: bots.length,
      hp: player.hp,
      vertices: staticMesh.count,
      error: gl.getError(),
    }));
    assert.equal(sample.error, 0);
    assert(sample.vertices > 10000);
    proof.offline.push(sample);
    await page.screenshot({
      path: resolve(out, `${live ? "live" : "local"}-arena-${i}.png`),
    });
    await page.evaluate(() => quitMatch());
  }
  await page.evaluate(() => showPage("online"));
  await page.locator("#onlineName").fill("KABUL MAVİ");
  await page.locator("#createRoom").click();
  await page.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  const room = await page.evaluate(() => arenaNet.room);
  proof.online.roomCreated = true;
  const second = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const guest = await second.newPage();
  guest.on("pageerror", (e) => errors.push(e.message));
  await ready(guest);
  await guest.evaluate(() => showPage("online"));
  await guest.locator("#onlineName").fill("KABUL MERCAN");
  await guest.locator("#roomInput").fill(room);
  await guest.locator("#joinRoom").click();
  await guest.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  await page.waitForFunction(
    () => document.querySelectorAll("#roomPlayers .room-player").length === 2,
  );
  assert.equal(await guest.locator("#onlineStart").isDisabled(), true);
  proof.online.guestJoined = true;
  proof.online.nonHostStartBlocked = true;
  await page.locator("#onlineStart").click();
  await Promise.all([
    page.waitForFunction(() => arenaNet.phase === "playing"),
    guest.waitForFunction(() => arenaNet.phase === "playing"),
  ]);
  proof.online.countdownAndStart = true;
  // Sadece normal oyun girdileri; sunucuya konum/hasar/eleme yazılmaz.
  await page.evaluate(() => {
    if (state === "paused") resumeGame();
  });
  const before = await page.evaluate(() => ({
    x: arenaNet.goal.x,
    z: arenaNet.goal.z,
  }));
  await page.keyboard.down("KeyW");
  await page.waitForTimeout(800);
  await page.keyboard.up("KeyW");
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    x: arenaNet.goal.x,
    z: arenaNet.goal.z,
    id: arenaNet.id,
  }));
  assert(
    Math.hypot(after.x - before.x, after.z - before.z) > 0.3,
    "Online hareket sunucuda ilerlemedi.",
  );
  await guest.waitForFunction(
    ({ id, x, z }) =>
      bots.some((p) => p.id === id && Math.hypot(p.x - x, p.z - z) < 1),
    after,
  );
  proof.online.movementReplicated = true;
  const ammo = await page.evaluate(() => player.ammo[player.weapon].mag);
  await page.evaluate(() => {
    if (state === "paused") resumeGame();
  });
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(200);
  assert((await page.evaluate(() => player.ammo[player.weapon].mag)) < ammo);
  proof.online.serverAmmoAndShot = true;
  // Kullanıcının oyunda görebildiği oturum davranışı: kısa kopma ve otomatik dönüş.
  const id = await page.evaluate(() => arenaNet.id);
  await page.evaluate(() =>
    arenaNet.socket.close(4000, "Kabul bağlantı kesintisi"),
  );
  await page.waitForFunction(
    (id) =>
      arenaNet.active &&
      !arenaNet.connecting &&
      arenaNet.socket?.readyState === 1 &&
      arenaNet.id === id,
    id,
    { timeout: 30000 },
  );
  await page.waitForFunction(() => arenaNet.lastSnapshot > arenaNet.startedAt);
  proof.online.reconnectPreservesActor = true;
  await page.evaluate(() => {
    if (state === "paused") resumeGame();
  });
  await page.keyboard.down("Tab");
  await page.locator("#scoreboard.active").waitFor();
  await page.screenshot({
    path: resolve(out, `${live ? "live" : "local"}-online-match.png`),
  });
  await page.keyboard.up("Tab");
  proof.online.sessions = 2;
  proof.online.differentInternetNetworksTested = false;
  await page.evaluate(() => arenaNet.leave());
  await guest.evaluate(() => arenaNet.leave());
  await second.close();
  assert.deepEqual(errors, []);
  proof.rendererErrors = errors;
  proof.passed = true;
  await writeFile(
    resolve(
      out,
      live ? "live-runtime-acceptance.json" : "browser-acceptance.json",
    ),
    JSON.stringify(proof, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: true,
      views: proof.views.length,
      offlineMaps: 3,
      online: proof.online,
      errors,
    }),
  );
} finally {
  await browser.close();
}
