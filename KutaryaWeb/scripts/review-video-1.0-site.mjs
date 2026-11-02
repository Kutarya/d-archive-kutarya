// Gerçek React sayfasını dosya olarak derler; Firebase, HTTP sunucusu ve port açılmaz.
// Katalog verisi inceleme düzeneğidir; canlı yayın/indirme kabulü yerine geçmez.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { kutaryaVideo } from "../projects-src/kutarya-video.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = resolve(root, "artifacts/kutarya-video");
const manifest = JSON.parse(
  await readFile(resolve(out, "paket-bilgisi-1.0.0.json"), "utf8"),
);
const images = await Promise.all(
  manifest.images.map(
    async (img) =>
      "data:image/png;base64," +
      (await readFile(resolve(root, "public" + img.path))).toString("base64"),
  ),
);
const project = {
  ...kutaryaVideo,
  cover: images[0],
  gallery: images.slice(1),
  updatedAt: Date.parse(manifest.at),
  files: manifest.artifacts.map((f, i) => ({
    id: `review-${i}`,
    name: f.name,
    size: f.bytes,
    role: f.role,
    platform: f.platform,
    version: manifest.version,
    createdAt: Date.parse(manifest.at),
  })),
};
const catalog = {
  games: [project],
  categories: [{ id: "uygulama", name: "Uygulamalar", order: 1 }],
  announcements: [],
  settings: {
    title: "Kutarya",
    tagline: "",
    notice: "",
    maintenance: false,
    contact: "kutaryaai@gmail.com",
  },
};
const virtualEntry = "\0video-review-entry";
const virtualState = "\0video-review-state";
const virtualFirebase = "\0video-review-firebase";
const entry = `import React from "react"; import {createRoot} from "react-dom/client"; import {MemoryRouter} from "react-router-dom"; import App from "${resolve(root, "src/App.tsx").replaceAll("\\", "/")}";
createRoot(document.getElementById("root")).render(React.createElement(React.Fragment, null,
React.createElement("div", {style:{padding:"10px 20px", background:"#eee8ff", color:"#47336c", textAlign:"center", fontSize:"13px"}}, "Yayın öncesi inceleme · Gerçek site arayüzü ve uygulama fotoğrafları · Canlıya yüklenmedi"),
React.createElement(MemoryRouter, {initialEntries:["/proje/kutarya-video"]}, React.createElement(App))));`;
const state = `export const useApp = () => ({catalog: window.__videoReviewCatalog, loading:false, error:"", reload:async()=>{}, user:null, profile:null, admin:false, authLoading:false, refreshProfile:async()=>{}, favorite:async()=>{}, toast:(text)=>window.alert(text), logout:async()=>{}, local:false}); export function Provider({children}) {return children;}`;
const firebase = `export const local=false, configured=false, auth={currentUser:null}, storage={}; export async function api() {throw new Error("Bu dosya yayın öncesi incelemedir. Paketler aynı klasörde hazır; canlı indirme henüz yayınlanmadı.");}`;
const result = await build({
  configFile: false,
  root,
  logLevel: "warn",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  plugins: [
    {
      name: "offline-video-review",
      enforce: "pre",
      resolveId(id, importer) {
        if (
          id === "video-review-entry" ||
          id.replaceAll("\\", "/").endsWith("/video-review-entry")
        )
          return virtualEntry;
        if (importer && (id.endsWith("/state") || id.endsWith("/state.tsx")))
          return virtualState;
        if (
          id.endsWith("/services/firebase") ||
          id.endsWith("/services/firebase.ts") ||
          (importer?.includes("/services/") && id === "./firebase")
        )
          return virtualFirebase;
      },
      load(id) {
        if (id === virtualEntry) return entry;
        if (id === virtualState) return state;
        if (id === virtualFirebase) return firebase;
      },
      transform(code, id) {
        // İnceleme HTML'i gerçek PNG'leri gömer; üretimde Art'ın Storage URL kuralı korunur.
        if (id.replaceAll("\\", "/").endsWith("/src/components/Art.tsx")) {
          const from = "/^(https?:\\/\\/|\\/uploads\\/)/";
          assert(code.includes(from));
          return code.replace(
            from,
            "/^(data:image\\/|https?:\\/\\/|\\/uploads\\/)/",
          );
        }
      },
    },
    react(),
  ],
  build: {
    write: false,
    lib: {
      entry: "video-review-entry",
      name: "KutaryaVideoReview",
      formats: ["iife"],
    },
    chunkSizeWarningLimit: 1800,
  },
});
const outputs = (Array.isArray(result) ? result : [result]).flatMap(
  (r) => r.output,
);
const js = outputs.find((f) => f.type === "chunk" && f.isEntry).code;
const css = await readFile(resolve(root, "src/style.css"), "utf8");
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Kutarya Video — yayın öncesi inceleme</title><style>${css}</style></head><body><div id="root"></div><script>window.__videoReviewCatalog=${JSON.stringify(catalog).replaceAll("<", "\\u003c")};</script><script>${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
const target = resolve(out, "site-onizleme.html");
await writeFile(target, html);

// Edge, Playwright'ın pipe bağlantısıyla çalışır; TCP debug portu açılmaz.
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const blockedNetwork = [];
await page.route(/^https?:\/\//, (route) => {
  blockedNetwork.push(route.request().url());
  return route.abort();
});
const proof = {
  at: new Date().toISOString(),
  mode: "file:; actual React UI with review data",
  productionChanged: false,
  listeningServerStarted: false,
  liveUploadTested: false,
  liveDownloadTested: false,
  windowsInstallationTested: false,
  galleryImages: 2,
  views: [],
};
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(pathToFileURL(target).href);
    await page
      .getByRole("heading", { name: "Kutarya Video", exact: true })
      .waitFor();
    await page.locator(".gallery img").last().scrollIntoViewIfNeeded();
    await page.waitForFunction(() =>
      Array.from(
        document.querySelectorAll(".detail-cover img, .gallery img"),
      ).every((i) => i.complete && i.naturalWidth > 0),
    );
    assert.equal(await page.locator(".gallery img").count(), 2);
    assert.equal(await page.locator(".detail-cover img").count(), 1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `Yatay taşma: ${width}`);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: resolve(out, `site-${width}.png`),
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Dosyalar (2)" }).click();
    for (const f of manifest.artifacts)
      assert.equal(
        await page.locator(".download-row").filter({ hasText: f.name }).count(),
        1,
      );
    assert.equal(
      await page.locator(".download-row button:disabled").count(),
      0,
    );
    await page.getByRole("tab", { name: "Sürüm notları" }).click();
    await page.getByRole("heading", { name: "Sürüm 1.0.0" }).waitFor();
    await page.getByRole("tab", { name: "Dosyalar (2)" }).click();
    await page.screenshot({
      path: resolve(out, `dosyalar-${width}.png`),
      fullPage: true,
    });
    proof.views.push({
      width,
      coverLoaded: true,
      galleryLoaded: true,
      files: 2,
      tabsWorking: true,
      horizontalOverflow: overflow,
    });
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(blockedNetwork, [], "İnceleme dış ağ isteği üretmemeli.");
  proof.passed = true;
  proof.rendererErrors = errors;
  proof.networkRequests = blockedNetwork;
  await writeFile(
    resolve(out, "site-kabul.json"),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(JSON.stringify(proof, null, 2));
} catch (error) {
  console.error(
    JSON.stringify({
      rendererErrors: errors,
      body: (await page.locator("body").innerText()).slice(0, 300),
    }),
  );
  throw error;
} finally {
  await browser.close();
}
