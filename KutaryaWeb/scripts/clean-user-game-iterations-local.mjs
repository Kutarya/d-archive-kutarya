// Yalnız bu görevin yerel ara sürümleri; kullanıcı kaynaklarına ve canlıya dokunmaz.
import { createRequire } from "node:module";
import { readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
initializeApp({
  projectId: "demo-kutarya-games",
  storageBucket: "demo-kutarya-games.appspot.com",
});
const db = getFirestore(),
  bucket = getStorage().bucket();
const changes = [];
for (const [id, versions, finalVersion] of [
  ["blackjack", ["1.0.0", "1.0.1", "1.0.2"], "1.0.3"],
  ["rulet", ["1.0.0"], "1.0.1"],
]) {
  const ref = db.collection("gamesCatalog").doc(id),
    old = (await ref.get()).data();
  if (old?.version !== finalVersion)
    throw Error("Son sürüm etkin değil; temizleme durdu.");
  const obsolete = (old.files || []).filter(
    (f) =>
      versions.includes(f.version) &&
      f.name === `kutarya-${id}-${f.version}.zip`,
  );
  await writeFile(
    `artifacts/user-games/${id}-iterations-backup.json`,
    JSON.stringify(old, null, 2),
  );
  await ref.update({
    files: old.files.filter((f) => !obsolete.some((x) => x.id === f.id)),
    versions: old.versions.filter((v) => !versions.includes(v.id)),
  });
  for (const f of obsolete) {
    if (!f.path.startsWith("projectAssets/") || !f.path.includes(`/${id}/`))
      throw Error("Beklenmeyen yerel nesne yolu.");
    await bucket.file(f.path).delete({ ignoreNotFound: true });
  }
  for (const version of versions) {
    const target = path.resolve("public/games", id, version),
      root = path.resolve("public/games", id) + path.sep;
    if (!target.startsWith(root)) throw Error("Paket yolu sınır dışında.");
    await rm(target, { recursive: true, force: true });
  }
  changes.push({
    id,
    retiredVersions: versions,
    removedFiles: obsolete.length,
  });
}
await writeFile(
  "artifacts/user-games/iteration-cleanup.json",
  JSON.stringify(
    { at: new Date().toISOString(), productionChanged: false, changes },
    null,
    2,
  ),
);
console.log(
  "Yalnız yerel ara paketler kaldırıldı; son üç oyun sürümü korundu.",
);
process.exit(0);
