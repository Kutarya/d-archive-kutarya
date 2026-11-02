// Gerçek React/Provider ile dosya üzerinden kabul; servisler yalnız kontrollü taklittir.
// Canlı katalog salt okunur alınır. HTTP/debug portu, gerçek giriş veya mail gönderimi yok.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { chromium } from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const root = process.cwd();
const previewOnly = process.argv.includes("--prepare-only");
const gameNightReview = process.argv.includes("--game-night");
const refreshReview = previewOnly || process.argv.includes("--refresh");
const out = resolve(
  gameNightReview
    ? "artifacts/releases/blackjack/2.0.0/site-review"
    : refreshReview
    ? "artifacts/site-refresh/2026-10-14"
    : "artifacts/release-2026-10-09-public-access",
);
await mkdir(out, { recursive: true });
const response = await fetch(
  "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { op: "catalog" } }),
  },
);
const result = await response.json();
assert(response.ok && !result.error, "Genel katalog alınamadı.");
const catalog = result.result;
assert(catalog.games.length > 0);
await writeFile(
  resolve(out, "public-catalog.json"),
  JSON.stringify(catalog, null, 2) + "\n",
);
const images = new Map();
const urls = [
  ...new Set(
    catalog.games
      .flatMap((g) => [g.cover, ...(g.gallery || [])])
      .filter((u) => /^https:\/\//.test(u)),
  ),
];
for (let i = 0; i < urls.length; i += 4) {
  await Promise.all(
    urls.slice(i, i + 4).map(async (url) => {
      const r = await fetch(url);
      assert(r.ok, "Katalog görseli alınamadı.");
      images.set(
        url,
        `data:${r.headers.get("content-type")};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`,
      );
    }),
  );
}
const reviewCatalog = structuredClone(catalog);
for (const g of reviewCatalog.games) {
  g.cover = images.get(g.cover) || g.cover;
  g.gallery = (g.gallery || []).map((url) => images.get(url) || url);
  if (["web", "unity"].includes(g.engine))
    g.runtime =
      "data:text/html;charset=utf-8," +
      encodeURIComponent(
        "<!doctype html><html lang='tr'><body>Kontrollü tarayıcı paketi kabul düzeneği</body></html>",
      );
}
if (gameNightReview) {
  const { userGames } = await import("../games-src/projects.mjs");
  const source = userGames.find(g => g.id === "blackjack");
  const game = reviewCatalog.games.find(g => g.id === "blackjack");
  assert(source && game);
  for (const key of ["title", "subtitle", "description", "tags", "version", "controls", "requirements", "changelog"]) game[key] = source[key];
  game.runtime = "data:text/html;charset=utf-8," + encodeURIComponent(await readFile("artifacts/releases/blackjack/2.0.0/runtime/index.html", "utf8"));
  game.cover = "data:image/png;base64," + (await readFile("artifacts/releases/blackjack/2.0.0/local-home-1366.png")).toString("base64");
  game.gallery = [game.cover];
}
const hero =
  "data:image/png;base64," +
  (await readFile("public/media/kutarya-studio.png")).toString("base64");
const entryId = "\0public-access-review-entry",
  firebaseId = "\0public-access-review-firebase",
  authId = "\0public-access-review-auth",
  storageId = "\0public-access-review-storage";
const entry = `import React,{useEffect} from "react";
import {createRoot} from "react-dom/client";
import {MemoryRouter,useLocation} from "react-router-dom";
import App from "${resolve(root, "src/App.tsx").replaceAll("\\", "/")}";
import {Provider} from "${resolve(root, "src/state.tsx").replaceAll("\\", "/")}";
function Location(){const location=useLocation();useEffect(()=>{window.__reviewLocation=location.pathname+location.search;},[location]);return null;}
const path=new URL(location.href).searchParams.get("path")||"/";
${gameNightReview ? 'if(new URL(location.href).searchParams.has("qa-game"))window.__reviewCatalog.games.find(g=>g.id==="blackjack").runtime="https://kutarya.com/__blackjack-review";' : ''}
createRoot(document.getElementById("root")).render(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(Provider,{initialCatalog:new URL(location.href).searchParams.has("no-catalog")?undefined:window.__reviewCatalog},React.createElement(Location),React.createElement(App))));`;
const firebase = `import {auth} from "public-access-review-auth"; export {auth};
export const local=false,configured=true,storage={};
window.__reviewCalls=[];
window.__reviewRequests=[];
export async function api(op,data={}){
  window.__reviewCalls.push(op);
  if(op==="download")window.__reviewRequests.push({op,gameId:data.gameId,fileId:data.fileId});
  if(op==="catalog"){
    if(window.__reviewCatalogFailure??new URL(location.href).searchParams.has("catalog-error"))throw new Error("Kontrollü katalog yenileme hatası.");
    return window.__reviewCatalog;
  }
  if(op==="me")return {uid:auth.currentUser.uid,displayName:"Kabul yöneticisi",bio:"",avatar:"spark",favorites:[],recent:[],suspended:false};
  if(op==="admin.data"){
    if(!auth.currentUser?.reviewAdmin||!auth.currentUser.emailVerified)throw new Error("Yönetim yetkisi gerekli.");
    return {gamesCatalog:window.__reviewCatalog.games,gameCategories:window.__reviewCatalog.categories,gameAnnouncements:[],gameProfiles:[],gameReports:[],gameAdminAudit:[],gamePlayStats:[]};
  }
  if(op==="download")return {url:"data:text/plain;charset=utf-8,Kutarya%20kontrollu%20indirme%20duzenegi"};
  if(op==="admin.game"){
    if(!auth.currentUser?.reviewAdmin)throw new Error("Yönetim yetkisi gerekli.");
    const game=structuredClone(data.game),index=window.__reviewCatalog.games.findIndex(g=>g.id===game.id);
    if(index<0)window.__reviewCatalog.games.push(game);else window.__reviewCatalog.games[index]=game;
    return {ok:true};
  }
  if(op==="verifyCode")auth.currentUser.emailVerified=true;
  if(["play","sendCode","verifyCode","resetPassword"].includes(op))return {ok:true};
  throw new Error("Kabul düzeneğinde beklenmeyen işlem: "+op);
}`;
const auth = `const listeners=new Set();
const scenario=new URL(location.href).searchParams.get("session")||"guest";
function user(email,admin,verified=true){return {uid:admin?"review-admin":"review-visitor",email,emailVerified:verified,reviewAdmin:admin,
  async getIdTokenResult(){return {claims:{gamesAdmin:admin}};},async reload(){},async getIdToken(force){if(force)notify();return "review-only";}};}
export const auth={currentUser:scenario==="guest"?null:user(scenario==="visitor"?"visitor@kutarya.test":"admin@kutarya.test",scenario!=="visitor",scenario!=="unverified")};
async function notify(){await Promise.all([...listeners].map(fn=>fn(auth.currentUser)));window.__reviewAuthReady=true;}
export function onIdTokenChanged(_,fn){listeners.add(fn);queueMicrotask(notify);return ()=>listeners.delete(fn);}
export async function signInWithEmailAndPassword(_,email){auth.currentUser=user(email,email==="admin@kutarya.test");await notify();return {user:auth.currentUser};}
export async function signOut(){auth.currentUser=null;window.__reviewSignOuts=(window.__reviewSignOuts||0)+1;await notify();}
export async function verifyPasswordResetCode(_,code){window.__reviewActionCode=code;return "admin@kutarya.test";}
export async function confirmPasswordReset(){window.__reviewPasswordReset=true;}
export async function applyActionCode(){window.__reviewEmailAction=true;}
`;
const compiled = await build({
  configFile: false,
  root,
  logLevel: "warn",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  plugins: [
    {
      name: "public-access-review",
      enforce: "pre",
      resolveId(id) {
        if (
          id === "public-access-review-entry" ||
          id.replaceAll("\\", "/").endsWith("/public-access-review-entry")
        )
          return entryId;
        if (id === "public-access-review-auth") return authId;
        if ([entryId, firebaseId, authId, storageId].includes(id)) return id;
        if (id === "firebase/auth") return authId;
        if (id === "firebase/storage") return storageId;
        if (/\/services\/firebase(?:\.ts)?$/.test(id.replaceAll("\\", "/")))
          return firebaseId;
      },
      load(id) {
        if (id === entryId) return entry;
        if (id === firebaseId) return firebase;
        if (id === authId) return auth;
        if (id === storageId)
          return 'export function ref(){throw new Error("Yükleme kabulü bu düzeneğe dahil değil.");} export const uploadBytesResumable=ref;';
      },
      transform(code, id) {
        if (id.replaceAll("\\", "/").endsWith("/src/components/Art.tsx"))
          code = code.replace(
            "/^(https?:\\/\\/|\\/uploads\\/)/",
            "/^(data:image\\/|https?:\\/\\/|\\/uploads\\/)/",
          );
        if (/\/src\/(?:App|pages\/Auth)\.tsx$/.test(id.replaceAll("\\", "/")))
          code = code.replaceAll(
            'src="/media/kutarya-studio.png"',
            `src=${JSON.stringify(hero)}`,
          );
        return code;
      },
    },
    react(),
  ],
  build: {
    write: false,
    lib: {
      entry: "public-access-review-entry",
      name: "KutaryaPublicAccessReview",
      formats: ["iife"],
    },
  },
});
const outputs = (Array.isArray(compiled) ? compiled : [compiled]).flatMap(
  (r) => r.output,
);
const js = outputs.find((f) => f.type === "chunk" && f.isEntry).code;
const css = await readFile("src/style.css", "utf8");
const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Kutarya — yerel geliştirme incelemesi</title><style>${css}</style></head><body><div style="padding:8px;text-align:center;background:#eee8ff;color:#38304c">Yerel inceleme · Servisler kontrollü taklit · Canlıya yayımlanmadı</div><div id="root"></div><script>window.__reviewCatalog=${JSON.stringify(reviewCatalog).replaceAll("<", "\\u003c")};</script><script>${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
const target = resolve(out, "inceleme.html");
await writeFile(target, html);
if (previewOnly) {
  console.log(
    `Yalnız yerel önizleme hazırlandı: ${target}. Tarayıcı testi çalıştırılmadı.`,
  );
  process.exit(0);
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [],
  blockedNetwork = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.route(/^https?:\/\//, (route) => {
  blockedNetwork.push(route.request().url());
  return route.abort();
});
async function visit(path, session = "guest", expected = path) {
  const url = new URL(pathToFileURL(target));
  url.searchParams.set("path", path);
  url.searchParams.set("session", session);
  await page.goto(url.href);
  await page.waitForFunction(
    (expected) =>
      window.__reviewAuthReady &&
      window.__reviewLocation === expected &&
      !document.querySelector("main .loading"),
    expected,
  );
}
async function publicOnly() {
  assert.equal(
    await page
      .locator(
        '.favorite,.user-pill,a[href^="/hesabim"],a[href^="/kutuphanem"],a[href^="/auth/"]',
      )
      .count(),
    0,
  );
  const calls = await page.evaluate(() => window.__reviewCalls);
  assert(
    !calls.includes("me") &&
      !calls.includes("favorite") &&
      !calls.includes("recent"),
  );
  assert.equal(
    await page
      .locator(".topbar")
      .getByRole("link", { name: /Giriş|Yönetim/ })
      .count(),
    0,
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
}
// Yayın öncesi Blackjack2'nin eski1.x dosyaları bilerek kapalı eski bölümündedir.
// Genel indirme regresyonu güncel paketi mevcut başka projeyi kullanır.
const detail = catalog.games.find((g) => g.files?.length && (!gameNightReview || g.id !== "blackjack"));
// Yeni Blackjack'in gerçek Player kabulü review-game-night'ta yapılır;
// bu regresyon grubu kendi kontrollü, ağ istemeyen runtime'ını seçer.
const player = catalog.games.find((g) => ["web", "unity"].includes(g.engine) && (!gameNightReview || g.id !== "blackjack"));
assert(detail && player);
const proof = {
  at: new Date().toISOString(),
  productionChanged: false,
  listeningServerStarted: false,
  realFirebaseAuthTested: false,
  realMailTested: false,
  liveDownloadTested: false,
  sourceCatalogProjects: catalog.games.length,
  views: [],
  actions: {},
};
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/projeler",
      `/proje/${detail.slug}`,
      `/oyna/${player.slug}`,
      "/destek",
      "/gizlilik",
      "/kullanim-kosullari",
    ]) {
      await visit(path, "visitor");
      await publicOnly();
      if (["/", `/proje/${detail.slug}`].includes(path))
        await page.screenshot({
          path: resolve(
            out,
            `${path === "/" ? "ana-sayfa" : "proje"}-${width}.png`,
          ),
          fullPage: true,
        });
      proof.views.push({
        path,
        width,
        oldVisitorSession: true,
        accountControls: false,
        personalProfileOrHistoryRequests: false,
        horizontalOverflow: false,
      });
    }
    for (const path of [
      "/hesabim",
      "/kutuphanem",
      "/auth/login?next=/admin",
      "/auth/register",
      "/auth/verify-email",
      "/auth/forgot-password",
    ]) {
      await visit(path, "guest", "/projeler");
      await publicOnly();
      proof.views.push({ path, width, destination: "/projeler" });
    }
    await visit("/admin", "guest");
    assert.equal(
      await page.getByRole("link", { name: "Yönetici girişi" }).count(),
      1,
    );
    await page.getByRole("link", { name: "Yönetici girişi" }).click();
    await page
      .getByRole("heading", { name: "Yönetici girişi.", exact: true })
      .waitFor();
    assert.equal(
      await page.getByRole("link", { name: "Hesap oluştur" }).count(),
      0,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: resolve(out, `yonetici-girisi-${width}.png`),
      fullPage: true,
    });
    console.log(
      `Ziyaretçi yolları, eski adresler ve yönetim giriş ekranı: ${width}px geçti.`,
    );
  }
  await visit(`/proje/${detail.slug}`);
  await page.getByRole("tab", { name: /^Dosyalar/ }).click();
  await page.locator(".download-row button").first().click();
  await page.waitForFunction(() => window.__reviewCalls.includes("download"));
  proof.actions.guestDownloadRequestWithSimulatedService = true;
  await visit(`/oyna/${player.slug}`, "visitor");
  await page.getByRole("button", { name: /^(Oyunu|Uygulamayı) yükle/ }).click();
  await page.waitForFunction(() => window.__reviewCalls.includes("play"));
  await publicOnly();
  proof.actions.playerStartsWithSimulatedRuntimeAndNoPersonalHistory = true;
  await visit("/admin/auth/login?next=/hesabim");
  await page.getByLabel("E-posta adresin").fill("visitor@kutarya.test");
  await page.getByLabel("Şifren", { exact: true }).fill("review-only-password");
  await page.getByRole("button", { name: "Yönetim paneline gir" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Bu hesapta proje yönetimi yetkisi bulunmuyor." })
    .waitFor();
  assert.equal(await page.evaluate(() => window.__reviewSignOuts), 1);
  assert(!(await page.evaluate(() => window.__reviewCalls)).includes("me"));
  proof.actions.nonAdminSignInRejectedWithoutProfileCreation = true;
  await page.getByLabel("E-posta adresin").fill("admin@kutarya.test");
  await page.getByRole("button", { name: "Yönetim paneline gir" }).click();
  await page.getByRole("heading", { name: "Kutarya’yı yönet." }).waitFor();
  assert.equal(await page.evaluate(() => window.__reviewLocation), "/admin");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert(
    (await page.evaluate(() => window.__reviewCalls)).includes("admin.data"),
  );
  await page.screenshot({
    path: resolve(out, "yonetim-390.png"),
    fullPage: true,
  });
  proof.actions.adminSignInReturnsToManagement = true;
  await page.getByRole("button", { name: "Çıkış yap" }).click();
  await page.getByRole("link", { name: "Yönetici girişi" }).waitFor();
  proof.actions.adminLogout = true;
  await visit("/admin/auth/register", "guest", "/admin/auth/login");
  assert.equal(
    await page.getByRole("link", { name: "Hesap oluştur" }).count(),
    0,
  );
  proof.actions.managementRegistrationUnavailable = true;
  await visit(
    "/auth/action?mode=resetPassword&oobCode=review-action",
    "guest",
    "/admin/auth/action?mode=resetPassword&oobCode=review-action",
  );
  await page.getByLabel("Yeni şifren").waitFor();
  assert.equal(
    await page.evaluate(() => window.__reviewActionCode),
    "review-action",
  );
  proof.actions.existingResetMailQueryPreserved = true;
  await visit("/admin/auth/verify-email", "unverified");
  await page.getByRole("button", { name: "Kodu tekrar gönder" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Doğrulama kodu e-posta adresine gönderildi." })
    .waitFor();
  await page.getByLabel("Altı haneli doğrulama kodu").fill("123456");
  await page.getByRole("button", { name: "E-postamı doğrula" }).click();
  await page.getByRole("heading", { name: "Kutarya’yı yönet." }).waitFor();
  proof.actions.adminVerificationWithSimulatedService = true;
  assert.deepEqual(errors, []);
  assert.deepEqual(blockedNetwork, []);
  proof.rendererErrors = errors;
  proof.browserNetworkRequests = blockedNetwork;
  proof.passed = true;
  await writeFile(
    resolve(out, "kabul.json"),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        passed: true,
        projects: catalog.games.length,
        views: proof.views.length,
        actions: proof.actions,
        rendererErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
