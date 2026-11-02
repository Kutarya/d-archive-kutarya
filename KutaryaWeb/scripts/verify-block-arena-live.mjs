// Gerçek HTTPS/Edge kabulü; yerel dinleyici veya ziyaretçi hesabı açılmaz.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { unzipSync } from "fflate";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

import { arenaReleaseDirectory, arenaVersion } from "./arena-release-paths.mjs";
const base = "https://kutarya.com",
  out = resolve(arenaReleaseDirectory);
const manifest = JSON.parse(
  await readFile(resolve(out, "package.json"), "utf8"),
);
const images = JSON.parse(await readFile(resolve(out, "images.json"), "utf8"));
const before = JSON.parse(await readFile(resolve(out, "before.json"), "utf8"));
const seo = JSON.parse(
  await readFile("artifacts/seo-2026-10-07/build.json", "utf8"),
);
const oldRuntime = JSON.parse(
  await readFile("public/games/pixelgun/1.0.0/kutarya-manifest.json", "utf8"),
);
const hash = (b) => createHash("sha256").update(b).digest("hex");
const endpoint =
  "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
async function call(op, data = {}) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { op, ...data } }),
  });
  const j = await r.json();
  assert(r.ok && !j.error, j.error?.message || op);
  return j.result;
}
async function getBytes(url) {
  const r = await fetch(url);
  assert.equal(r.status, 200, new URL(url).pathname);
  return Buffer.from(await r.arrayBuffer());
}
function verifyArchive(bytes, files) {
  const zip = unzipSync(bytes);
  for (const f of files) {
    const keys = Object.keys(zip).filter(
      (k) => k === f.path || k.endsWith("/" + f.path),
    );
    assert.equal(keys.length, 1, f.path);
    assert.equal(zip[keys[0]].length, f.bytes);
    assert.equal(hash(zip[keys[0]]), f.sha256, f.path);
  }
}
const catalog = await call("catalog"),
  game = catalog.games.find((g) => g.id === "pixelgun");
assert.equal(game?.version, arenaVersion);
assert.equal(game.runtime, `/games/pixelgun/${arenaVersion}/index.html`);
assert.equal(game.status, "published");
assert(game.versions.some((v) => v.id === arenaVersion && v.verified));
const prior = before.catalog.find((g) => g.id === "pixelgun").data;
for (const { path, generation, ...publicFile } of prior.files)
  assert.deepEqual(
    game.files.find((x) => x.id === publicFile.id),
    publicFile,
  );
const proof = {
  at: new Date().toISOString(),
  passed: false,
  version: game.version,
  siteUrl: base + "/proje/" + game.slug,
  catalogProjects: catalog.games.length,
  html: [],
  runtime: [],
  images: [],
  views: [],
  downloads: [],
  listeningServerStarted: false,
  physicalDeviceTested: false,
};
for (const item of seo.pages) {
  const bytes = await getBytes(base + item.path);
  assert.equal(hash(bytes), item.sha256, item.path);
  const html = bytes.toString("utf8");
  assert(!/href="\/(?:auth|hesabim|kutuphanem)(?:[\/"?])/.test(html));
  if (item.path === "/proje/pixelgun") {
    assert(html.includes(manifest.name) && html.includes("Online"));
    assert(
      html.includes('<link rel="canonical" href="' + proof.siteUrl + '">'),
    );
  }
  proof.html.push({ path: item.path, sha256MatchesBuild: true });
}
for (const name of ["sitemap.xml", "robots.txt"]) {
  const bytes = await getBytes(base + "/" + name);
  assert.equal(hash(bytes), hash(await readFile("dist/" + name)));
  if (name === "sitemap.xml")
    assert(bytes.toString("utf8").includes(proof.siteUrl));
}
for (const [version, files] of [
  ["1.0.0", oldRuntime.files],
  [
    "2.0.0",
    JSON.parse(
      await readFile(
        "public/games/pixelgun/2.0.0/kutarya-manifest.json",
        "utf8",
      ),
    ).files,
  ],
  [arenaVersion, manifest.files],
]) {
  for (const file of files) {
    const bytes = await getBytes(
      `${base}/games/pixelgun/${version}/${file.path}`,
    );
    assert.equal(bytes.length, file.bytes);
    assert.equal(hash(bytes), file.sha256);
    proof.runtime.push({ version, path: file.path, sha256Matched: true });
  }
}
assert.equal(
  (await fetch(base + "/assets/arena-kabul-bulunmayan.js")).status,
  404,
);
const denied = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: { op: "admin.data" } }),
});
assert.equal(denied.status, 401);
assert.equal((await denied.json()).error.status, "UNAUTHENTICATED");
proof.anonymousAdminBlocked = true;
for (const [i, url] of [game.cover, ...game.gallery].entries()) {
  const bytes = await getBytes(url);
  assert.equal(bytes.length, images[i].bytes);
  assert.equal(hash(bytes), images[i].sha256);
  proof.images.push({
    name: images[i].name,
    bytes: bytes.length,
    sha256Matched: true,
  });
}
await mkdir(resolve(out, "browser-downloads"), { recursive: true });
const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  downloadsPath: resolve(out, "browser-downloads"),
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
  reducedMotion: "reduce",
});
const page = await context.newPage(),
  errors = [],
  ops = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (!r.url().includes("/gamesService")) return;
  try {
    const op = JSON.parse(r.postData() || "{}").data?.op;
    if (op) ops.push(op);
  } catch {
    /* Token/istek gövdesi raporlanmaz. */
  }
});
async function checkView() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.equal(
    await page
      .locator(
        '.favorite,.user-pill,a[href^="/hesabim"],a[href^="/kutuphanem"]',
      )
      .count(),
    0,
  );
}
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/projeler");
    await page.locator("main h1").first().waitFor();
    const card = page.locator('.card-title[href="/proje/pixelgun"]');
    await card.waitFor();
    assert.equal(
      await page.locator(".game-card").count(),
      catalog.games.length,
    );
    await checkView();
    await card.click();
    await page
      .getByRole("heading", { name: game.title, exact: true })
      .waitFor();
    const imgs = page.locator("main img");
    for (let i = 0; i < (await imgs.count()); i++) {
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await imgs.nth(i).evaluate(async (el) => {
        await el.decode();
        if (!el.naturalWidth) throw new Error("Görüntü açılamadı.");
      });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await checkView();
    await page.screenshot({
      path: resolve(out, `live-project-${width}.png`),
      fullPage: true,
    });
    await page.getByRole("tab", { name: /^Dosyalar/ }).click();
    assert.equal(
      await page.locator(".download-row").count(),
      game.files.length,
    );
    assert(
      (await page.locator(".download-row").first().innerText()).includes(
        manifest.name,
      ),
    );
    await checkView();
    await page.screenshot({
      path: resolve(out, `live-files-${width}.png`),
      fullPage: true,
    });
    proof.views.push({
      width,
      projectCardOpened: true,
      imagesDecoded: true,
      downloadsShown: game.files.length,
      horizontalOverflow: false,
    });
  }
  for (const f of game.files) {
    const row = page.locator(".download-row").filter({ hasText: f.name });
    assert.equal(await row.count(), 1);
    const event = page.waitForEvent("download", { timeout: 60000 });
    await row.getByRole("button", { name: "İndir", exact: true }).click();
    const download = await event;
    assert.equal(download.suggestedFilename(), f.name);
    const bytes = await readFile(await download.path());
    assert.equal(bytes.length, f.size);
    if (f.version === arenaVersion) {
      assert.equal(hash(bytes), manifest.sha256);
      verifyArchive(bytes, manifest.files);
    } else {
      const runtime = JSON.parse(
        await readFile(
          `public/games/pixelgun/${f.version}/kutarya-manifest.json`,
          "utf8",
        ),
      );
      verifyArchive(bytes, runtime.files);
      if (f.version === "2.0.0") {
        const original = JSON.parse(
          await readFile(
            "artifacts/releases/block-arena/2.0.0/package.json",
            "utf8",
          ),
        );
        assert.equal(hash(bytes), original.sha256);
      }
    }
    proof.downloads.push({
      name: f.name,
      version: f.version,
      bytes: bytes.length,
      sha256: hash(bytes),
      viaRealButton: true,
      fullBytesAndContentsVerified: true,
    });
  }
  assert.deepEqual(errors, []);
  assert(
    !ops.some((op) =>
      ["me", "favorite", "recent", "sendCode", "resetPassword"].includes(op),
    ),
  );
  proof.rendererErrors = errors;
  proof.passed = true;
  await writeFile(
    resolve(out, "live-acceptance.json"),
    JSON.stringify(proof, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: true,
      version: game.version,
      htmlPages: proof.html.length,
      runtimeFiles: proof.runtime.length,
      images: proof.images.length,
      views: proof.views.length,
      downloads: proof.downloads,
      rendererErrors: errors,
    }),
  );
} catch (e) {
  console.error(
    JSON.stringify({
      message: e.message,
      path: new URL(page.url()).pathname,
      rendererErrors: errors,
    }),
  );
  throw e;
} finally {
  await browser.close();
}
