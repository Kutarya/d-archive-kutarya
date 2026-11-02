// Mevcut başsız HTTPS kabulünün ek kontrolleri; yönetici girişi/veri yazımı yok.
import assert from "node:assert/strict";
import { resolve } from "node:path";
export async function verifyRefresh(page, catalog, out) {
  const base = "https://kutarya.com",
    video = catalog.games.find((game) => game.slug === "kutarya-video");
  const proof = {
    capabilities: false,
    browserHistory: false,
    mobileSearchAndNavigation: false,
    galleryKeyboardAndFocus: false,
    currentAndPreviousFiles: false,
    privatePagePreserved: false,
  };
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + "/projeler?olanak=source");
  await page
    .getByRole("button", { name: "Kaynak kod sunan filtresini kaldır" })
    .waitFor();
  const names = await page.locator(".card-title").allTextContents();
  assert(
    names.some((name) => name.includes("Kutarya Mobile")) &&
      names.some((name) => name.includes("Kutarya Convert")),
  );
  const sourceCount = await page.locator(".game-card").count();
  await page.locator(".catalog-filters summary").click();
  await page.getByLabel("Platform", { exact: true }).selectOption("android");
  await page.waitForURL(/platform=android/);
  await page.waitForFunction(
    () => document.querySelectorAll(".game-card").length === 2,
  );
  await page.goBack();
  await page.waitForURL(base + "/projeler?olanak=source");
  await page.waitForFunction(
    (count) => document.querySelectorAll(".game-card").length === count,
    sourceCount,
  );
  proof.capabilities = proof.browserHistory = true;
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(base);
  await page
    .getByRole("searchbox", { name: "Proje ara", exact: true })
    .fill("Kotlin Mobile");
  await page.getByRole("button", { name: "Aramayı yap" }).click();
  await page.waitForURL(/\/projeler\?q=/);
  await page.waitForFunction(
    () => document.querySelectorAll(".game-card").length === 1,
  );
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
  await page.waitForURL(base + "/duyurular");
  await page.locator(".sidebar.open").waitFor({ state: "detached" });
  await page.locator(".mobile-menu").click();
  await page
    .locator(".sidebar")
    .getByRole("link", { name: "Günlük ve yenilikler" })
    .click();
  await page.locator(".sidebar.open").waitFor({ state: "detached" });
  proof.mobileSearchAndNavigation = true;
  await page.goto(base + `/proje/${video.slug}`);
  const trigger = page.locator(".gallery-preview").first();
  await trigger.click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() =>
    document
      .querySelector(".gallery-controls [role=status]")
      ?.textContent.startsWith("2 /"),
  );
  await page.waitForFunction(() => {
    const image = document.querySelector(".gallery-stage img");
    return image?.complete && image.naturalWidth > 0;
  });
  assert(
    await page
      .locator(".modal-scroll")
      .evaluate((element) => element.scrollWidth <= element.clientWidth + 1),
  );
  await page.screenshot({ path: resolve(out, "live-gallery-390.png") });
  await page.keyboard.press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  assert(
    await trigger.evaluate((element) => document.activeElement === element),
  );
  proof.galleryKeyboardAndFocus = true;
  await page.goto(base + `/proje/${video.slug}?sekme=dosyalar`);
  await page.waitForFunction(
    () =>
      document.getElementById("tab-files")?.getAttribute("aria-selected") ===
      "true",
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
  await page.screenshot({
    path: resolve(out, "live-files-390.png"),
    fullPage: true,
  });
  proof.currentAndPreviousFiles = true;
  const privatePage = await fetch(base + "/ozel");
  assert.equal(privatePage.status, 200);
  assert.equal(privatePage.headers.get("x-robots-tag"), "noindex, nofollow");
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  assert(!sitemap.includes("/ozel"));
  proof.privatePagePreserved = true;
  return proof;
}
