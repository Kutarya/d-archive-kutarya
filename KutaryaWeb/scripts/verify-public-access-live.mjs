// Gerçek HTTPS/Edge pipe kabulü; kullanıcı parolası, mail gönderimi ve yerel port yok.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const base = "https://kutarya.com";
const refreshReview = process.argv.includes("--refresh");
const out = resolve(refreshReview ? "artifacts/site-refresh/2026-10-14" : "artifacts/release-2026-10-09-public-access");
const seo = JSON.parse(await readFile("artifacts/seo-2026-10-07/build.json", "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const proof = { at: new Date().toISOString(), base, listeningServerStarted: false, passwordRequested: false, realAdminSignInTested: false, realMailDeliveryTested: false, html: [], views: [], images: [], legacyRoutes: [], guestDownload: null };
for (const page of seo.pages) {
  const r = await fetch(base + page.path);
  assert.equal(r.status, 200, page.path);
  const bytes = Buffer.from(await r.arrayBuffer());
  assert.equal(hash(bytes), page.sha256, `${page.path}: canlı HTML derleme ile farklı.`);
  const text = bytes.toString("utf8");
  assert(!/href="\/(?:auth|hesabim|kutuphanem)(?:[\/"?])/.test(text));
  assert(!/class="[^"]*favorite/.test(text));
  proof.html.push({ path: page.path, status: 200, bytes: bytes.length, sha256MatchesBuild: true });
}
for (const name of ["sitemap.xml", "robots.txt"]) {
  const r = await fetch(`${base}/${name}`); assert.equal(r.status, 200);
  assert.equal(hash(Buffer.from(await r.arrayBuffer())), hash(await readFile(`dist/${name}`)));
}
assert.equal((await fetch(`${base}/assets/kutarya-kabul-bulunmayan.js`)).status, 404);
const endpoint = "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
const apiResponse = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { op: "catalog" } }) });
const apiResult = await apiResponse.json(); assert(apiResponse.ok && !apiResult.error);
const catalog = apiResult.result;
const adminResponse = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: { op: "admin.data" } }) });
const adminResult = await adminResponse.json();
assert.equal(adminResponse.status, 401); assert.equal(adminResult.error?.status, "UNAUTHENTICATED");
proof.anonymousAdminApiBlocked = true;

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: "reduce" });
const page = await context.newPage(), errors = [], ops = [];
page.on("pageerror", e => errors.push(e.message));
page.on("request", request => {
  if (!request.url().includes("/gamesService")) return;
  try { const op = JSON.parse(request.postData() || "{}").data?.op; if (op) ops.push(op); } catch { /* Başka istek verisi kaydedilmez. */ }
});
async function publicControlsAbsent() {
  assert.equal(await page.locator('.favorite,.user-pill,a[href^="/hesabim"],a[href^="/kutuphanem"],a[href^="/auth/"]').count(), 0);
  assert.equal(await page.locator(".topbar").getByRole("link", { name: /Giriş|Yönetim/ }).count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
}
async function imagesReady(path, width) {
  // Tam sayfa ekran görüntüsü, ekran dışındaki lazy görselleri kendiliğinden beklemez.
  const images = page.locator("main img"), count = await images.count();
  for (let index = 0; index < count; index++) await images.nth(index).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => Array.from(document.querySelectorAll("main img")).every(img => img.complete && img.naturalWidth > 0));
  assert.equal(await images.count(), count, `${path}: görsel yerine hata placeholder'ı oluştu.`);
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.querySelectorAll("main img")).map(img => img.decode()));
    await document.fonts.ready;
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  });
  proof.images.push({ path, width, count, loadedAndDecoded: true });
}
try {
  const model = catalog.games.find(g => g.slug === "kutarya-us-beyin");
  const player = catalog.games.find(g => g.slug === "blackjack"); assert(model && player);
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/projeler", `/proje/${model.slug}`, `/oyna/${player.slug}`, "/destek", "/gizlilik"]) {
      await page.goto(base + path);
      await page.locator("main h1").first().waitFor();
      await publicControlsAbsent();
      if (path === "/projeler") assert.equal(await page.locator(".game-card").count(), catalog.games.length);
      if (path === "/" || path === "/projeler" || path === `/proje/${model.slug}`) await imagesReady(path, width);
      if (path === "/" || path === `/proje/${model.slug}`)
        await page.screenshot({ path: resolve(out, `canli-${path === "/" ? "ana-sayfa" : "proje"}-${width}.png`), fullPage: true });
      proof.views.push({ path, width, accountControls: false, horizontalOverflow: false });
    }
    if (width === 390) {
      await page.goto(base); await page.locator("main h1").first().waitFor();
      await page.locator(".mobile-menu").click(); assert.equal(await page.locator(".sidebar.open").count(), 1);
      await publicControlsAbsent(); await page.locator(".mobile-menu").click();
      proof.mobileMenuChecked = true;
    }
    await page.goto(base + "/admin/projeler");
    await page.getByRole("heading", { name: "Yönetim alanı.", exact: true }).waitFor();
    assert.equal(await page.locator(".admin-workspace").count(), 0);
    await page.getByRole("link", { name: "Yönetici girişi", exact: true }).click();
    await page.waitForURL(base + "/admin/auth/login");
    await page.getByRole("heading", { name: "Yönetici girişi.", exact: true }).waitFor();
    assert.equal(await page.getByRole("link", { name: "Hesap oluştur" }).count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: resolve(out, `canli-yonetici-girisi-${width}.png`), fullPage: true });
    proof.views.push({ path: "/admin/auth/login", width, anonymousAdminBlocked: true, registration: false, horizontalOverflow: false });
    console.log(`Canlı ziyaretçi ve yönetici ekranları: ${width}px geçti.`);
  }
  for (const path of ["/hesabim", "/kutuphanem", "/auth/login?next=/admin", "/auth/register", "/auth/verify-email", "/auth/forgot-password"]) {
    await page.goto(base + path); await page.waitForURL(base + "/projeler");
    await page.locator(".game-card").first().waitFor(); await publicControlsAbsent();
    proof.legacyRoutes.push({ path, destination: "/projeler" });
  }
  await page.goto(base + "/admin/auth/register"); await page.waitForURL(base + "/admin/auth/login");
  proof.managementRegistrationUnavailable = true;
  await page.getByRole("link", { name: "Şifremi unuttum" }).click();
  await page.waitForURL(base + "/admin/auth/forgot-password");
  assert.equal(await page.getByRole("button", { name: "Bağlantı gönder" }).count(), 1);
  proof.adminResetRequestPagePresentWithoutSendingMail = true;
  await page.goto(base + "/auth/action?mode=resetPassword&oobCode=kutarya-kabul-gecersiz");
  await page.waitForURL(base + "/admin/auth/action?mode=resetPassword&oobCode=kutarya-kabul-gecersiz");
  await page.getByRole("alert").waitFor();
  proof.oldResetMailQueryPreservedWithInvalidTestCode = true;

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + `/oyna/${player.slug}`);
  const playResponse = page.waitForResponse(response => {
    if (!response.url().includes("/gamesService")) return false;
    try { return JSON.parse(response.request().postData() || "{}").data?.op === "play"; } catch { return false; }
  });
  await page.getByRole("button", { name: "Oyunu yükle" }).click();
  await page.locator(".player-frame iframe").waitFor();
  await page.frameLocator(".player-frame iframe").locator("body").waitFor();
  const playResult = await playResponse;
  assert(playResult.ok() && (await playResult.json()).result?.ok);
  await publicControlsAbsent();
  await page.screenshot({ path: resolve(out, "canli-misafir-player.png"), fullPage: true });
  proof.guestRealPlayerLoaded = true;

  const manifest = JSON.parse(await readFile("artifacts/release-2026-10-09-kutarya-us-beyin/package.json", "utf8"));
  await page.goto(base + `/proje/${model.slug}`);
  await page.getByRole("tab", { name: /^Dosyalar/ }).click();
  const row = page.locator(".download-row").filter({ hasText: manifest.name });
  const event = page.waitForEvent("download", { timeout: 30000 });
  await row.getByRole("button", { name: `${manifest.name} indir`, exact: true }).click();
  const download = await event; assert.equal(download.suggestedFilename(), manifest.name);
  const filePath = await download.path(); assert(filePath);
  let bytes = 0; const digest = createHash("sha256");
  for await (const chunk of createReadStream(filePath)) { bytes += chunk.length; digest.update(chunk); }
  const sha256 = digest.digest("hex"); assert.equal(bytes, manifest.bytes); assert.equal(sha256.toLowerCase(), manifest.sha256.toLowerCase());
  proof.guestDownload = { name: manifest.name, bytes, sha256, viaRealButton: true, fullBytesVerified: true };
  if (refreshReview) {
    const { verifyRefresh } = await import("./site-refresh-live-checks.mjs");
    proof.refresh = await verifyRefresh(page, catalog, out);
    proof.headless = true; proof.temporaryBrowserProfile = true; proof.desktopAutomation = false;
  }
  assert.deepEqual(errors, []);
  assert(!ops.some(op => ["me", "favorite", "recent", "sendCode", "resetPassword"].includes(op)));
  proof.noPersonalProfileOrHistoryRequests = true;
  proof.rendererErrors = errors; proof.catalogProjects = catalog.games.length; proof.passed = true;
  await writeFile(resolve(out, "live-acceptance.json"), JSON.stringify(proof, null, 2) + "\n");
  console.log(JSON.stringify({ passed: true, projects: catalog.games.length, htmlPages: proof.html.length, views: proof.views.length, legacyRoutes: proof.legacyRoutes.length, guestDownload: proof.guestDownload, guestRealPlayerLoaded: true, rendererErrors: errors }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ message: error.message, path: new URL(page.url()).pathname, rendererErrors: errors }));
  throw error;
} finally { await browser.close(); }
