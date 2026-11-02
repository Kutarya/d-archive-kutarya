// Ayrı geçici profil ve başsız tarayıcı; masaüstü kontrolü veya HTTP sunucusu yok.
// Gerçek React + genel katalog, servisler kontrollü taklit. Canlı kabul ayrı yapılır.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const out = resolve("artifacts/site-refresh/2026-10-14");
const target = pathToFileURL(resolve(out, "inceleme.html"));
const catalog = JSON.parse(
  await readFile(resolve(out, "public-catalog.json"), "utf8"),
);
const video = catalog.games.find((g) => g.slug === "kutarya-video");
const mobile = catalog.games.find((g) => g.slug === "kutarya-mobile");
assert(video && mobile && video.gallery.length > 1);
const proof = {
  at: new Date().toISOString(),
  headless: true,
  temporaryBrowserProfile: true,
  desktopAutomation: false,
  listeningServerStarted: false,
  simulatedServices: true,
  views: [],
  actions: {},
  errors: [],
  unexpectedNetwork: [],
};
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  acceptDownloads: true,
  serviceWorkers: "block",
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
page.on("pageerror", (error) => proof.errors.push(error.message));
await context.route(/^https?:/, (route) => {
  proof.unexpectedNetwork.push(route.request().url());
  return route.abort();
});
async function visit(path, session = "guest", extras = {}) {
  const url = new URL(target);
  url.searchParams.set("path", path);
  url.searchParams.set("session", session);
  for (const [key, value] of Object.entries(extras))
    url.searchParams.set(key, String(value));
  await page.goto(url.href);
  await page.waitForFunction(
    (expected) =>
      window.__reviewAuthReady &&
      window.__reviewLocation === expected &&
      !document.querySelector("main .loading"),
    path,
  );
}
async function checkView(path, width, theme) {
  assert.equal(
    await page.evaluate(
      () =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        ) >
        innerWidth + 1,
    ),
    false,
    `${path} ${width} ${theme}: yatay taşma`,
  );
  assert.equal(await page.locator("main h1").count(), 1);
  const images = page.locator("main img");
  const count = await images.count();
  for (let i = 0; i < count; i++) await images.nth(i).scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll("main img")].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  assert.equal(await images.count(), count, "Görsel hata alanına dönüşmüş.");
  await page.evaluate(async () => {
    await Promise.all(
      [...document.querySelectorAll("main img")].map((image) => image.decode()),
    );
    window.scrollTo(0, 0);
  });
  proof.views.push({
    path,
    width,
    theme,
    images: count,
    horizontalOverflow: false,
  });
}
try {
  for (const width of process.argv.includes("--actions-only")
    ? []
    : [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "warm", "dark"]) {
      for (const path of [
        "/",
        "/projeler",
        `/proje/${video.slug}`,
        `/proje/${mobile.slug}`,
      ]) {
        await visit(path);
        await page.getByLabel("Görünüm teması").selectOption(theme);
        await page.waitForFunction(
          (value) => document.documentElement.dataset.theme === value,
          theme,
        );
        await checkView(path, width, theme);
        if (path === "/" && [390, 1280].includes(width))
          await page.screenshot({
            path: resolve(out, `home-${width}-${theme}.png`),
            fullPage: true,
          });
        if (
          path === `/proje/${video.slug}` &&
          theme === "light" &&
          [390, 1280].includes(width)
        )
          await page.screenshot({
            path: resolve(out, `detail-${width}.png`),
            fullPage: true,
          });
      }
    }
    console.log(
      `${width}px: üç tema, ana sayfa/katalog/masaüstü/mobil proje geçti.`,
    );
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await visit("/");
  assert(
    await page
      .getByRole("searchbox", { name: "Proje ara", exact: true })
      .isVisible(),
  );
  await page
    .getByRole("searchbox", { name: "Proje ara", exact: true })
    .fill("Kotlin Mobile");
  await page.getByRole("button", { name: "Aramayı yap" }).click();
  await page.waitForFunction(() =>
    window.__reviewLocation.startsWith("/projeler?q="),
  );
  assert.equal(await page.locator(".game-card").count(), 1);
  assert(
    (await page.locator(".card-title").textContent()).includes(
      "Kutarya Mobile",
    ),
  );
  await page.locator(".mobile-menu").click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Günlük ve yenilikler" })
    .click();
  await page.waitForFunction(() => window.__reviewLocation === "/duyurular");
  assert.equal(await page.locator(".sidebar.open").count(), 0);
  proof.actions.mobileSearchAndDailyNavigation = true;

  await page.setViewportSize({ width: 1280, height: 900 });
  await visit("/projeler?olanak=source");
  assert(
    (await page.locator(".card-title").allTextContents()).some((text) =>
      text.includes("Kutarya Mobile"),
    ),
  );
  assert(
    (await page.locator(".card-title").allTextContents()).some((text) =>
      text.includes("Kutarya Convert"),
    ),
  );
  await page.locator(".catalog-filters summary").click();
  await page.getByLabel("Platform", { exact: true }).selectOption("android");
  await page.waitForFunction(
    () =>
      window.__reviewLocation.includes("platform=android") &&
      document.querySelectorAll(".game-card").length === 2,
  );
  assert.equal(await page.locator(".game-card").count(), 2);
  await page
    .getByRole("button", { name: "Liste görünümü", exact: true })
    .click();
  await page.waitForFunction(() =>
    window.__reviewLocation.includes("gorunum=liste"),
  );
  assert(
    (await page.evaluate(() => window.__reviewLocation)).includes(
      "gorunum=liste",
    ),
  );
  assert.equal(await page.locator(".list-view").count(), 1);
  await page
    .getByRole("button", { name: "Tümünü temizle", exact: true })
    .click();
  await page.waitForFunction(
    (count) => document.querySelectorAll(".game-card").length === count,
    catalog.games.length,
  );
  assert.equal(await page.locator(".game-card").count(), catalog.games.length);
  await page.getByLabel("Projeleri sırala").selectOption("title");
  await page.waitForFunction(() =>
    window.__reviewLocation.includes("sirala=title"),
  );
  const titles = await page.locator(".card-title").allTextContents();
  assert.deepEqual(
    titles,
    [...titles].sort((a, b) => a.localeCompare(b, "tr")),
  );
  proof.actions.capabilityFiltersAndViewUrl = true;

  await visit(`/proje/${video.slug}`);
  const recommended = video.files.find(
    (file) => file.version === video.version && file.role === "installer",
  );
  await page
    .getByRole("button", { name: "Windows için indir", exact: true })
    .click();
  await page.waitForFunction(() => window.__reviewRequests.length > 0);
  assert.deepEqual(await page.evaluate(() => window.__reviewRequests[0]), {
    op: "download",
    gameId: video.id,
    fileId: recommended.id,
  });
  await page.getByRole("button", { name: /^Tüm dosyalar/ }).click();
  await page.waitForFunction(() =>
    window.__reviewLocation.includes("sekme=dosyalar"),
  );
  assert.equal(
    await page.locator(".previous-files").getAttribute("open"),
    null,
  );
  assert.equal(
    await page.locator(".download-row:visible").count(),
    video.files.filter((file) => file.version === video.version).length,
  );
  await page.locator(".previous-files summary").click();
  assert.equal(
    await page.locator(".download-row:visible").count(),
    video.files.length,
  );
  await page.getByRole("tab", { name: /^Dosyalar/ }).focus();
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(
    () =>
      document.getElementById("tab-about")?.getAttribute("aria-selected") ===
      "true",
  );
  assert.equal(
    await page
      .getByRole("tab", { name: "Genel bakış" })
      .getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("End");
  await page.waitForFunction(
    () =>
      document.getElementById("tab-updates")?.getAttribute("aria-selected") ===
      "true",
  );
  assert.equal(
    await page
      .getByRole("tab", { name: "Sürüm notları" })
      .getAttribute("aria-selected"),
    "true",
  );
  proof.actions.currentPackageOldVersionsAndKeyboardTabs = true;

  await visit(`/proje/${video.slug}`);
  const imageTrigger = page.locator(".gallery-preview").first();
  await imageTrigger.click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() =>
    document
      .querySelector(".gallery-controls [role=status]")
      ?.textContent.startsWith("2 /"),
  );
  assert.equal(
    await page.locator(".gallery-controls [role=status]").textContent(),
    `2 / ${video.gallery.length}`,
  );
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.waitForFunction(
    (count) =>
      document
        .querySelector(".gallery-controls [role=status]")
        ?.textContent.startsWith(`${count} /`),
    video.gallery.length,
  );
  assert.equal(
    await page.locator(".gallery-controls [role=status]").textContent(),
    `${video.gallery.length} / ${video.gallery.length}`,
  );
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press("Tab");
    assert(
      await page.evaluate(() =>
        Boolean(document.activeElement.closest("dialog")),
      ),
    );
  }
  await page.screenshot({ path: resolve(out, "gallery-modal.png") });
  await page.setViewportSize({ width: 390, height: 900 });
  assert(await page.locator(".modal-scroll").evaluate((element) => element.scrollWidth <= element.clientWidth + 1));
  await page.screenshot({ path: resolve(out, "gallery-modal-390.png") });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert(
    await imageTrigger.evaluate(
      (element) => element === document.activeElement,
    ),
  );
  assert.equal(await page.evaluate(() => document.body.style.overflow), "");
  proof.actions.galleryArrowsFocusEscape = true;

  await visit("/", "guest", { "catalog-error": 1 });
  await page.locator(".catalog-update-warning").waitFor();
  assert.equal(await page.locator(".game-card").count(), 6);
  await page.evaluate(() => {
    window.__reviewCatalogFailure = false;
  });
  await page.getByRole("button", { name: /Tekrar dene/ }).click();
  await page.locator(".catalog-update-warning").waitFor({ state: "detached" });
  await visit("/", "guest", { "catalog-error": 1, "no-catalog": 1 });
  await page.getByRole("heading", { name: "Kataloğa bağlanamadık." }).waitFor();
  await page.evaluate(() => {
    window.__reviewCatalogFailure = false;
  });
  await page.getByRole("button", { name: "Tekrar dene", exact: true }).click();
  await page.locator(".discovery-hero").waitFor();
  proof.actions.catalogFailureFallbackAndRetry = true;

  await visit("/admin/projeler", "admin");
  await page
    .getByRole("button", { name: "Düzenle", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Proje adı", { exact: true })
    .fill("Yerel Taslak Önizlemesi");
  await page.getByRole("button", { name: "Önizle", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("heading", { name: "Yerel Taslak Önizlemesi", exact: true })
    .waitFor();
  assert(
    !(await page.evaluate(() => window.__reviewCalls)).includes("admin.game"),
  );
  await page.screenshot({
    path: resolve(out, "admin-preview.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 900 });
  assert(await page.locator(".modal-scroll").evaluate((element) => element.scrollWidth <= element.clientWidth + 1));
  await page.screenshot({ path: resolve(out, "admin-preview-390.png") });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Önizlemeyi kapat" }).click();
  await page
    .getByRole("button", { name: "Projelere dön", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Kaydedilmemiş değişiklikler var" })
    .waitFor();
  await page.getByRole("button", { name: "Düzenlemeye dön" }).click();
  assert.equal(
    await page.getByLabel("Proje adı", { exact: true }).inputValue(),
    "Yerel Taslak Önizlemesi",
  );
  await page
    .locator(".header-nav")
    .getByRole("link", { name: "Günlük", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Kaydedilmemiş değişiklikler var" })
    .waitFor();
  await page.getByRole("button", { name: "Düzenlemeye dön" }).click();
  await page
    .getByRole("button", { name: "Projeyi kaydet", exact: true })
    .click();
  await page.getByText("Değişiklikler kaydedildi", { exact: true }).waitFor();
  await page
    .getByLabel("Proje adı", { exact: true })
    .fill("Bırakılacak değişiklik");
  await page
    .getByRole("button", { name: "Projelere dön", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Değişiklikleri bırak", exact: true })
    .click();
  await page.locator(".project-editor").waitFor({ state: "detached" });
  proof.actions.adminPreviewUnsavedGuardAndSimulatedSave = true;

  assert.deepEqual(proof.errors, []);
  assert.deepEqual(proof.unexpectedNetwork, []);
  proof.passed = true;
  await writeFile(
    resolve(
      out,
      process.argv.includes("--actions-only")
        ? "refresh-actions.json"
        : "refresh-acceptance.json",
    ),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      passed: true,
      views: proof.views.length,
      actions: proof.actions,
      desktopAutomation: false,
      errors: proof.errors,
    }),
  );
} finally {
  await browser.close();
}
