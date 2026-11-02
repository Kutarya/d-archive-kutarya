import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { arenaReleaseDirectory } from "./arena-release-paths.mjs";
const out = resolve(arenaReleaseDirectory),
  live = process.argv.includes("--live");
const wrapper = resolve(out, "iframe-review.html");
await writeFile(
  wrapper,
  `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#121925"><iframe title="Kutarya Block Arena" sandbox="allow-scripts allow-pointer-lock" allow="autoplay;fullscreen" src="runtime/index.html" style="border:0;width:100vw;height:100vh"></iframe></body></html>`,
);
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  }),
  page = await ctx.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(
    live ? "https://kutarya.com/oyna/pixelgun" : pathToFileURL(wrapper).href,
  );
  if (live) await page.getByRole("button", { name: "Oyunu yükle" }).click();
  await page.locator("iframe").waitFor();
  const frame = await page.locator("iframe").elementHandle();
  const game = await frame.contentFrame();
  await game.waitForFunction(() => typeof gl !== "undefined" && gl && map);
  assert.equal(await game.locator("#fatal").isVisible(), false);
  await game.locator('[data-page="online"]').click();
  await game.locator("#onlineName").click();
  await game.locator("#onlineName").press("ControlOrMeta+A");
  await game.locator("#onlineName").pressSequentially("Şahin ASD 42");
  assert.equal(await game.locator("#onlineName").inputValue(), "Şahin ASD 42");
  await game.locator("#createRoom").click();
  await game.waitForFunction(
    () => arenaNet.active && arenaNet.room,
    {},
    { timeout: 40000 },
  );
  const origin = await game.evaluate(() => location.origin);
  assert.equal(await game.locator("#onlineName").isDisabled(), false);
  await game.locator("#onlineName").press("ControlOrMeta+A");
  await game.locator("#onlineName").pressSequentially("Çağrı İframe");
  await game.locator("#saveOnlineName").click();
  await game.waitForFunction(() => profile.name === "Çağrı İframe");
  assert.equal(
    await page.locator("iframe").getAttribute("sandbox"),
    "allow-scripts allow-pointer-lock",
  );
  await page.screenshot({
    path: resolve(out, `${live ? "live" : "local"}-iframe-online.png`),
    fullPage: true,
  });
  await game.evaluate(() => arenaNet.leave());
  await game.locator("#onlineBack").click();
  await game.locator('[data-page="setup"]').click();
  await game.locator("#startMatch").click();
  await game.waitForFunction(() => state === "playing" && bots.length > 0);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(500);
    const bounds = await game.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
      canvas: document.getElementById("world").clientWidth,
      glError: gl.getError(),
    }));
    assert(bounds.scroll <= bounds.width + 1);
    assert.equal(bounds.glError, 0);
  }
  await game.evaluate(() => quitMatch());
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(out, `${live ? "live" : "local"}-iframe-acceptance.json`),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        passed: true,
        live,
        origin,
        onlineRoomInSandbox: true,
        realKeyboardNameAndRenameInSandbox: true,
        sandboxUnchanged: true,
        offlineRuntime: true,
        viewports: [1280, 390],
        errors,
      },
      null,
      2,
    ),
  );
  console.log("Korumalı iframe: gerçek online oda ve iki boyutta WebGL geçti.");
} finally {
  await browser.close();
}
