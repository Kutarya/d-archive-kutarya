// Sunucu/port açmadan yerel dosyalardan önizleme; yayından sonra gerçek HTTPS kabulü.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, resolve, sep } from "node:path";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const mode = process.argv[2];
assert(["local", "live"].includes(mode));
const base = "https://kutarya.com";
const out = resolve("artifacts/releases/muvv-private/0.4.0-20261012");
const publicRoot = resolve("public");
const payload = JSON.parse(await readFile(resolve(out, "payload.json"), "utf8"));
const seo = JSON.parse(await readFile("artifacts/seo-2026-10-07/build.json", "utf8"));
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const html = await readFile("public/ozel.html", "utf8");
const config = JSON.parse(await readFile("firebase.seo-release.json", "utf8"));
const sitemap = await readFile("dist/sitemap.xml", "utf8");
assert(!sitemap.includes("/ozel"), "Özel sayfa sitemap'te olmamalı.");
assert(!seo.sitemapUrls.some(path => path.startsWith("/ozel")));
assert(!seo.pages.some(page => page.path.startsWith("/ozel")));
assert(html.includes('name="robots" content="noindex, nofollow"'));
assert.equal(config.hosting.rewrites.find(rule => rule.source === "/ozel")?.destination, "/ozel.html");
assert.equal(config.hosting.headers.find(rule => rule.regex?.includes("ozel"))?.headers.find(h => h.key === "X-Robots-Tag")?.value, "noindex, nofollow");
const inboundLinks = [];
for (const page of seo.pages) {
  const path = page.path === "/" ? "dist/index.html" : `dist${page.path}.html`;
  const text = await readFile(path, "utf8");
  assert(!/(?:href|to)=["'](?:https:\/\/kutarya\.com)?\/ozel(?:[\/"'?])/i.test(text), page.path);
  inboundLinks.push({ path: page.path, privatePageLinkAbsent: true });
}
for (const file of payload.files) {
  const name = file.path.slice(1);
  assert.equal(sha(await readFile(resolve("dist", name))), file.sha256, name);
}
const result = { at: new Date().toISOString(), mode, page: `${base}/ozel`, listeningServerStarted: false, publicNavigationLinksAbsent: true, sitemapExcluded: true, publicPagesChecked: inboundLinks.length, files: [], views: [], download: null, pageErrors: [], consoleErrors: [] };

if (mode === "live") {
  for (const path of ["/ozel", "/ozel/"]) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), sha(Buffer.from(html)), path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", path);
    assert.equal(response.headers.get("referrer-policy"), "no-referrer", path);
  }
  for (const file of payload.files) {
    const response = await fetch(base + file.path);
    assert.equal(response.status, 200, file.path);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.length, file.bytes, file.path);
    assert.equal(sha(bytes), file.sha256, file.path);
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow", file.path);
    if (file.path.endsWith(".zip")) {
      assert.match(response.headers.get("content-type"), /(?:application\/zip|application\/octet-stream)/);
      assert.match(response.headers.get("content-disposition"), /attachment.*Muvv-0\.4\.0-Proje-20261012\.zip/);
    }
    result.files.push({ path: file.path, bytes: bytes.length, sha256Matches: true });
  }
  for (const page of seo.pages) {
    const response = await fetch(base + page.path);
    assert.equal(response.status, 200, page.path);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), page.sha256, page.path);
  }
  for (const name of ["sitemap.xml", "robots.txt"]) {
    const response = await fetch(`${base}/${name}`);
    assert.equal(response.status, 200);
    assert.equal(sha(Buffer.from(await response.arrayBuffer())), sha(await readFile(`dist/${name}`)));
  }
  assert.equal((await fetch(`${base}/ozel/olmayan-dosya.js`)).status, 404);
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 940 }, acceptDownloads: true, reducedMotion: "reduce" });
if (mode === "local") {
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml", ".zip": "application/zip" };
  await context.route(`${base}/**`, async route => {
    const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
    const name = pathname === "/ozel" || pathname === "/ozel/" ? "ozel.html" : pathname.slice(1);
    const path = resolve(publicRoot, name);
    assert(path.startsWith(publicRoot + sep));
    try {
      const body = await readFile(path);
      const headers = { "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
      if (name.endsWith(".zip")) headers["Content-Disposition"] = 'attachment; filename="Muvv-0.4.0-Proje-20261012.zip"';
      await route.fulfill({ status: 200, contentType: types[extname(name)] || "application/octet-stream", headers, body });
    } catch {
      await route.fulfill({ status: 404, body: "Dosya bulunamadı." });
    }
  });
}
const page = await context.newPage();
page.on("pageerror", error => result.pageErrors.push(error.message));
page.on("console", message => { if (message.type() === "error") result.consoleErrors.push(message.text()); });
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 940 });
    await page.goto(`${base}/ozel`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Muvv.", exact: true }).waitFor();
    const images = page.locator("main img");
    for (let index = 0; index < await images.count(); index++) await images.nth(index).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll("main img")].every(img => img.complete && img.naturalWidth > 0));
    await page.evaluate(async () => { await Promise.all([...document.querySelectorAll("main img")].map(img => img.decode())); await document.fonts.ready; window.scrollTo(0, 0); });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Yatay taşma: ${width}`);
    assert.equal(await page.locator('a[href="/"],a[href="/projeler"],nav,.topbar,.sidebar').count(), 0);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, nofollow");
    await page.screenshot({ path: resolve(out, `${mode}-${width}.png`), fullPage: true });
    await page.screenshot({ path: resolve(out, `${mode}-${width}-first.png`) });
    result.views.push({ width, imagesDecoded: await images.count(), overflow: false, navigationAbsent: true });
  }
  const zip = payload.files.find(file => file.path.endsWith(".zip"));
  if (mode === "live") {
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Proje ZIP’ini indir" }).click()]);
    assert.equal(download.suggestedFilename(), "Muvv-0.4.0-Proje-20261012.zip");
    assert.equal(await download.failure(), null);
    const stream = await download.createReadStream(), chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const downloaded = Buffer.concat(chunks);
    assert.equal(downloaded.length, zip.bytes);
    assert.equal(sha(downloaded), zip.sha256);
    result.download = { transport: "real_browser_https", filename: download.suggestedFilename(), bytes: downloaded.length, sha256: sha(downloaded), matchesOriginalProjectZip: true };
  } else {
    // Chromium ağ taklidi ek dosya indirmesini tamamlamaz; gerçek indirme canlı kabulde yapılır.
    assert.equal(await page.getByRole("link", { name: "Proje ZIP’ini indir" }).getAttribute("href"), zip.path);
    const bytes = await readFile(resolve(publicRoot, zip.path.slice(1)));
    assert.equal(sha(bytes), zip.sha256);
    result.download = { transport: "local_link_and_file_hash_only", bytes: bytes.length, sha256: sha(bytes), matchesOriginalProjectZip: true, realBrowserDownloadChecked: false };
  }
  await page.getByText("ZIP’in SHA-256 değeri", { exact: true }).click();
  assert.equal(await page.locator("details.checksum").getAttribute("open"), "");
  assert.equal(await page.locator("details.checksum code").textContent(), zip.sha256);
  const [imagePage] = await Promise.all([context.waitForEvent("page"), page.getByRole("link", { name: "DPI ve hız görüntüsünü tam boy aç" }).click()]);
  await imagePage.waitForLoadState("load");
  assert(imagePage.url().endsWith("/dpi.png"));
  await imagePage.close();
  result.fullSizeImageOpens = true;
  assert.deepEqual(result.pageErrors, []);
  assert.deepEqual(result.consoleErrors, []);
  result.successful = true;
  await writeFile(resolve(out, `${mode}-acceptance.json`), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify({ mode, successful: true, widths: result.views.map(view => view.width), publicPagesChecked: result.publicPagesChecked, filesCheckedOverHttps: result.files.length, zipBytes: result.download.bytes, downloadShaMatches: true, errors: 0, listeningServerStarted: false }));
} finally {
  await context.close();
  await browser.close();
}
