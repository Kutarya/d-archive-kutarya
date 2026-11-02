// Gerçek HTTPS ve Edge pipe; kullanıcı girişi veya yerel sunucu yok.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { kutaryaMobile } from "../projects-src/kutarya-mobile.mjs";
import { mobileReleaseDirectory as out, mobileManifestPath } from "./mobile-release-paths.mjs";
const base = "https://kutarya.com";
const manifest = JSON.parse(await readFile(mobileManifestPath, "utf8"));
const priorManifest = JSON.parse(await readFile("artifacts/kutarya-mobile/paket-bilgisi-1.1.0.json", "utf8"));
const seo = JSON.parse(await readFile("artifacts/seo-2026-10-07/build.json", "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const endpoint = "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { op: "catalog" } }) });
const result = await response.json(); assert(response.ok && !result.error);
const mobile = result.result.games.find(g => g.id === "kutarya-mobile");
assert(mobile && mobile.status === "published" && mobile.version === kutaryaMobile.version && mobile.kind === "mobile");
assert.equal(mobile.files.length, manifest.artifacts.length + priorManifest.artifacts.length);
assert(seo.projects.includes(mobile.id));
const proof = { at: new Date().toISOString(), siteUrl: base + "/proje/" + mobile.slug, version: mobile.version, html: [], views: [], images: [], downloads: [], listeningServerStarted: false };
for (const item of seo.pages) {
  const r = await fetch(base + item.path); assert.equal(r.status, 200, item.path);
  const bytes = Buffer.from(await r.arrayBuffer()); assert.equal(hash(bytes), item.sha256.toUpperCase(), item.path);
  const text = bytes.toString("utf8");
  assert(!/href="\/(?:auth|hesabim|kutuphanem)(?:[\/"?])/.test(text));
  if (item.path === "/proje/kutarya-mobile") {
    assert(text.includes("Kutarya Mobile") && text.includes("Kutarya-Mobile-1.2.0.apk"));
    assert(text.includes('<link rel="canonical" href="' + proof.siteUrl + '">'));
  }
  proof.html.push({ path: item.path, sha256MatchesBuild: true });
}
for (const name of ["sitemap.xml", "robots.txt"]) {
  const r = await fetch(base + "/" + name); assert.equal(r.status, 200);
  const bytes = Buffer.from(await r.arrayBuffer()); assert.equal(hash(bytes), hash(await readFile("dist/" + name)));
  if (name === "sitemap.xml") assert(bytes.toString("utf8").includes(proof.siteUrl));
}
assert.equal((await fetch(base + "/assets/kutarya-mobile-kabul-bulunmayan.js")).status, 404);
const denied = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { op: "admin.data" } }) });
assert.equal(denied.status, 401); assert.equal((await denied.json()).error.status, "UNAUTHENTICATED");
proof.anonymousAdminBlocked = true;
for (const [i, url] of [mobile.cover, ...mobile.gallery].entries()) {
  const r = await fetch(url); assert(r.ok);
  const bytes = Buffer.from(await r.arrayBuffer()), image = manifest.images[i];
  assert.equal(bytes.length, image.bytes); assert.equal(hash(bytes), image.sha256);
  assert(r.headers.get("content-type")?.startsWith("image/png"));
  proof.images.push({ name: image.name, bytes: bytes.length, sha256Matched: true });
}
await mkdir(resolve(out, "browser-downloads"), { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true, downloadsPath: resolve(out, "browser-downloads") });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: "reduce" });
const page = await context.newPage(), errors = [], ops = [];
page.on("pageerror", error => errors.push(error.message));
page.on("request", request => {
  if (!request.url().includes("/gamesService")) return;
  try { const op = JSON.parse(request.postData() || "{}").data?.op; if (op) ops.push(op); } catch { /* İçerik ve token kaydedilmez. */ }
});
async function checkView() {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('.favorite,.user-pill,a[href^="/hesabim"],a[href^="/kutuphanem"]').count(), 0);
}
async function loadImages() {
  const images = page.locator("main img");
  for (let i = 0; i < await images.count(); i++) {
    const img = images.nth(i); await img.scrollIntoViewIfNeeded();
    await img.evaluate(async el => {
      if (!el.complete) await new Promise((done, fail) => { el.addEventListener("load", done, { once: true }); el.addEventListener("error", fail, { once: true }); });
      await el.decode(); if (!el.naturalWidth) throw new Error("Görsel açılamadı.");
    });
  }
  await page.evaluate(() => scrollTo(0, 0));
}
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/projeler"); await page.locator("main h1").first().waitFor();
    const card = page.locator('.card-title[href="/proje/kutarya-mobile"]'); await card.waitFor();
    assert.equal(await page.locator(".game-card").count(), result.result.games.length);
    await checkView();
    await card.click(); await page.getByRole("heading", { name: "Kutarya Mobile", exact: true }).waitFor();
    await loadImages(); await checkView();
    await page.screenshot({ path: resolve(out, "canli-mobile-" + width + ".png"), fullPage: true });
    proof.views.push({ width, cardOpenedRealProject: true, horizontalOverflow: false });
    await page.getByRole("tab", { name: /^Dosyalar/ }).click();
    assert.equal(await page.locator(".download-row").count(), mobile.files.length);
    for (let i = 0; i < manifest.artifacts.length; i++)
      assert((await page.locator(".download-row").nth(i).innerText()).includes(manifest.artifacts[i].name), "Yeni sürüm dosyaları başta olmalı.");
    await checkView();
    await page.screenshot({ path: resolve(out, "canli-dosyalar-" + width + ".png"), fullPage: true });
  }
  for (const file of [...manifest.artifacts, ...priorManifest.artifacts]) {
    const row = page.locator(".download-row").filter({ hasText: file.name });
    assert.equal(await row.count(), 1);
    const event = page.waitForEvent("download", { timeout: 90000 });
    await row.getByRole("button", { name: "İndir", exact: true }).click();
    const download = await event; assert.equal(download.suggestedFilename(), file.name);
    const filePath = await download.path(); assert(filePath);
    let bytes = 0; const digest = createHash("sha256");
    for await (const chunk of createReadStream(filePath)) { bytes += chunk.length; digest.update(chunk); }
    const sha256 = digest.digest("hex").toUpperCase();
    assert.equal(bytes, file.bytes); assert.equal(sha256, file.sha256);
    proof.downloads.push({ name: file.name, bytes, sha256, viaRealButton: true, fullBytesVerified: true });
  }
  assert.deepEqual(errors, []);
  assert(!ops.some(op => ["me", "favorite", "recent", "sendCode", "resetPassword"].includes(op)));
  proof.rendererErrors = errors; proof.catalogProjects = result.result.games.length; proof.passed = true;
  await writeFile(resolve(out, "live-acceptance.json"), JSON.stringify(proof, null, 2) + "\n");
  console.log(JSON.stringify({ passed: true, htmlPages: proof.html.length, widths: proof.views.map(v => v.width), downloads: proof.downloads, rendererErrors: errors }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ message: error.message, path: new URL(page.url()).pathname, rendererErrors: errors }));
  throw error;
} finally { await browser.close(); }
