// Yalnız izole demo projesinde, tarayıcı paket kabulünü denemek için kullanılır.
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fixture } from "../functions/test/fixture.mjs";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
const { initializeApp } = require("firebase-admin/app"),
  { getFirestore } = require("firebase-admin/firestore");
initializeApp({ projectId: "demo-kutarya-games" });
const db = getFirestore();
const root = path.resolve("artifacts", "package-browser-fixture");
const output = path.resolve("public", "games", "paket-denemesi");
const entry = "/games/paket-denemesi/1.0.0/index.html";
if (process.argv[2] === "clean") {
  await db.collection("gamesCatalog").doc("paket-denemesi").delete();
  for (const folder of [root, output]) {
    const parent =
      folder === root
        ? path.resolve("artifacts")
        : path.resolve("public", "games");
    if (!folder.startsWith(parent + path.sep))
      throw new Error("Test temizleme yolu geçersiz.");
    await rm(folder, { recursive: true, force: true });
  }
  console.log("Yerel tarayıcı deneme paketi temizlendi.");
} else if (process.argv[2] === "prepare") {
  await mkdir(root, { recursive: true });
  await writeFile(
    path.join(root, "index.html"),
    '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Paket kabul denemesi</title></head><body style="background:#17151f;color:#e8e4ff;font:20px system-ui;padding:30px"><h1>Paket kabul denemesi</h1><p>Bu sayfa yalnız yerel paket hattını denemek içindir.</p><button id="play" style="padding:16px">Deneme turunu başlat</button><p id="result">Tur başlamadı</p><script src="game.js"></script></body></html>',
  );
  await writeFile(
    path.join(root, "game.js"),
    'document.getElementById("play").addEventListener("click",()=>{document.getElementById("result").textContent="Tur tamamlandı: 1";});',
  );
  execFileSync(
    process.execPath,
    ["scripts/import-game.mjs", root, "paket-denemesi", "1.0.0"],
    { stdio: "inherit" },
  );
  await db
    .collection("gamesCatalog")
    .doc("paket-denemesi")
    .set({
      ...fixture,
      id: "paket-denemesi",
      slug: "paket-denemesi",
      title: "Paket kabul denemesi",
      kind: "web",
      platforms: ["web"],
      engine: "web",
      runtime: entry,
      versions: [],
      status: "draft",
      featured: false,
      order: 999,
    });
  console.log(
    `Deneme paketi hazır: ${entry}. Önce tarayıcıda dene, sonra kabul raporu yaz.`,
  );
} else if (process.argv[2] === "publish") {
  const report = JSON.parse(
    await readFile("artifacts/package-browser-acceptance.json", "utf8"),
  );
  if (report.passed !== true) throw new Error("Önce tarayıcı kabulü gerekli.");
  const draft = (
    await db.collection("gamesCatalog").doc("paket-denemesi").get()
  ).data();
  if (
    !draft?.versions?.some(
      (v) => v.id === "1.0.0" && v.verified === true && v.runtime === entry,
    )
  )
    throw new Error("Önce operatör doğrulanmış sürümü kaydetmeli.");
  await db
    .collection("gamesCatalog")
    .doc("paket-denemesi")
    .update({ status: "published" });
  console.log("Doğrulanmış yerel deneme oyunu geçici olarak katalogda.");
} else
  throw new Error(
    "Kullanım: node scripts/package-browser-fixture.mjs <prepare|publish|clean>",
  );
