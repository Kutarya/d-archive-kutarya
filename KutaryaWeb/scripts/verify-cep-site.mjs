// Gerçek browser sayfası ve İndir düğmelerinin APK/ZIP/PDF byte-SHA kabulü.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const out = new URL("../artifacts/kutarya-cep/", import.meta.url);
await mkdir(out, { recursive: true });
const manifest = JSON.parse(
  await readFile(new URL("paket-bilgisi-1.0.0.json", out), "utf8"),
);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = "http://127.0.0.1:5180";
const proof = { downloads: [], views: [], admin: false };
try {
  await page.goto(base + "/proje/kutarya-cep");
  await page
    .getByRole("heading", { name: "Kutarya Cep", exact: true })
    .waitFor();
  await page.locator(".gallery img").last().scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll(".gallery img")).every(
      (i) => i.complete && i.naturalWidth > 0,
    ),
  );
  assert.equal(await page.locator(".gallery img").count(), 5);
  await page.getByRole("tab", { name: "Dosyalar (3)" }).click();
  for (const file of manifest.artifacts) {
    const row = page.locator(".download-row").filter({ hasText: file.name });
    assert.equal(await row.count(), 1);
    const event = page.waitForEvent("download");
    await row.getByRole("button", { name: "İndir", exact: true }).click();
    const download = await event;
    assert.equal(download.suggestedFilename(), file.name);
    const path = await download.path();
    const bytes = await readFile(path);
    assert.equal(bytes.length, file.bytes);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex").toUpperCase(),
      file.sha256,
    );
    proof.downloads.push({
      name: file.name,
      bytes: bytes.length,
      sha256: file.sha256,
    });
  }
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/proje/kutarya-cep");
    await page
      .getByRole("heading", { name: "Kutarya Cep", exact: true })
      .waitFor();
    await page.locator(".gallery img").last().scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll(".gallery img")).every(
        (i) => i.complete && i.naturalWidth > 0,
      ),
    );
    assert.equal(await page.locator(".gallery img").count(), 5);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForFunction(() => window.scrollY === 0);
    const size = await page.evaluate(() => ({
      inner: innerWidth,
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert(size.scroll <= size.client);
    proof.views.push({ width, ...size, galleryImages: 5 });
    await page.screenshot({
      path: new URL(
        width === 390 ? "site-mobile.png" : "site-desktop.png",
        out,
      ).pathname.slice(1),
      fullPage: true,
    });
  }
  await page.goto(base + "/koleksiyon/mobile");
  await page
    .getByRole("link", { name: /Kutarya Cep/ })
    .first()
    .waitFor();
  const accounts = JSON.parse(
    await readFile(new URL("../local-credentials.json", out), "utf8"),
  );
  const admin = accounts.find((a) => a.role === "admin");
  assert(admin);
  await page.goto(base + "/auth/login?next=%2Fadmin%2Fprojeler");
  await page.getByLabel("E-posta adresin").fill(admin.email);
  await page.getByLabel("Şifren", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
  await page.waitForURL("**/admin/projeler");
  await page.getByText("Kutarya Cep", { exact: true }).first().waitFor();
  proof.admin = true;
  assert.deepEqual(errors, []);
  proof.pageErrors = errors;
  proof.at = new Date().toISOString();
  proof.productionChanged = false;
  await writeFile(
    new URL("browser-kabul.json", out),
    JSON.stringify(proof, null, 2),
  );
  console.log(JSON.stringify(proof, null, 2));
} finally {
  await browser.close();
}
