// Bu betik yalnız açıkça seçilen hedefte çalışır; ortak Auth claim'leri korunur.
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  games,
  categories,
  settings,
  announcements,
} from "../functions/catalog.js";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
const { initializeApp, applicationDefault } = require("firebase-admin/app"),
  { getAuth } = require("firebase-admin/auth"),
  { getFirestore } = require("firebase-admin/firestore");
const [operation, project, argument, acceptance] = process.argv.slice(2);
if (
  !project ||
  !["seed", "grant-admin", "register-version"].includes(operation)
)
  throw new Error(
    "Kullanım: node scripts/operator.mjs <seed|grant-admin|register-version> <projectId> <UID|manifest-yolu> [tarayıcı-kabul-raporu]",
  );
if (
  project !== "demo-kutarya-games" &&
  process.env.KUTARYA_RELEASE_APPROVED !== "true"
)
  throw new Error(
    "Üretim değişikliği için açık yayın onayı ve KUTARYA_RELEASE_APPROVED=true gerekir.",
  );
if (project === "demo-kutarya-games") {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  initializeApp({ projectId: project });
} else initializeApp({ projectId: project, credential: applicationDefault() });
const db = getFirestore(),
  auth = getAuth();
if (operation === "seed") {
  const batch = db.batch();
  for (const [collection, items] of [
    ["gamesCatalog", games],
    ["gameCategories", categories],
    ["gameAnnouncements", announcements],
  ])
    for (const item of items) {
      const ref = db.collection(collection).doc(item.id);
      if (!(await ref.get()).exists) batch.set(ref, item);
    }
  const ref = db.collection("gameSiteSettings").doc("public");
  if (!(await ref.get()).exists) batch.set(ref, settings);
  await batch.commit();
  console.log("Eksik başlangıç verileri eklendi; mevcut veriler korunuyor.");
}
if (operation === "grant-admin") {
  const user = await auth.getUser(argument);
  if (!user.emailVerified) throw new Error("Admin hesabı önce doğrulanmalı.");
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    gamesAdmin: true,
  });
  console.log(
    "Oyun yönetimi yetkisi atandı. Yeni token için yeniden giriş gerekir.",
  );
}
if (operation === "register-version") {
  const manifest = JSON.parse(await readFile(argument, "utf8"));
  if (
    !/^[a-z0-9][a-z0-9-]{0,63}$/.test(manifest.gameId || "") ||
    !/^[a-z0-9][a-z0-9.-]{0,39}$/.test(manifest.version || "") ||
    manifest.version.includes("..") ||
    manifest.entry !==
      `/games/${manifest.gameId}/${manifest.version}/index.html` ||
    !Array.isArray(manifest.files) ||
    !manifest.files.length
  )
    throw new Error("Manifest kimlik/sürüm/yol bilgisi geçersiz.");
  const folder = path.resolve(path.dirname(argument));
  for (const file of manifest.files) {
    const target = path.resolve(folder, file.path);
    if (!target.startsWith(folder + path.sep))
      throw new Error("Manifest paket sınırını aşıyor.");
    let bytes = 0;
    const hash = createHash("sha256");
    for await (const chunk of createReadStream(target)) {
      bytes += chunk.length;
      hash.update(chunk);
    }
    if (bytes !== file.bytes || hash.digest("hex") !== file.sha256)
      throw new Error(`Paket değişmiş: ${file.path}`);
  }
  if (!acceptance) throw new Error("Gerçek tarayıcı kabul raporu gereklidir.");
  const proof = JSON.parse(await readFile(acceptance, "utf8"));
  if (
    proof.gameId !== manifest.gameId ||
    proof.version !== manifest.version ||
    proof.passed !== true ||
    !proof.url ||
    !proof.at
  )
    throw new Error("Kabul raporu bu oyun/sürüm için geçerli değil.");
  const ref = db.collection("gamesCatalog").doc(manifest.gameId);
  await db.runTransaction(async (tx) => {
    const old = (await tx.get(ref)).data();
    if (!old) throw new Error("Önce admin panelinden taslak oluştur.");
    const versions = old.versions || [];
    if (versions.some((v) => v.id === manifest.version))
      throw new Error("Sürüm zaten kayıtlı.");
    tx.update(ref, {
      versions: [
        ...versions,
        {
          id: manifest.version,
          runtime: manifest.entry,
          verified: true,
          note: "Dosya kontrolü ve operatör tarayıcı kabulü tamamlandı.",
        },
      ],
    });
  });
  console.log(
    "Doğrulanmış sürüm kayıtlı; admin panelinden etkinleştirilebilir.",
  );
}
