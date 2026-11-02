// Yalnız bu görevde oluşturulan iki yerel kabul kaydını kaldırır.
import { createRequire } from "node:module";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
process.env.STORAGE_EMULATOR_HOST = "http://127.0.0.1:9199";
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const app = initializeApp({
  projectId: "demo-kutarya-games",
  storageBucket: "demo-kutarya-games.appspot.com",
});
const db = getFirestore(app),
  bucket = getStorage(app).bucket();
const ids = ["yerel-kabul-projesi", "paket-denemesi"];
for (const projectId of ids) {
  const ref = db.collection("gamesCatalog").doc(projectId);
  const project = (await ref.get()).data();
  const objects = new Set();
  for (const file of project?.files || []) {
    if (
      !file.path.startsWith("projectAssets/") ||
      !file.path.includes(`/${projectId}/`)
    )
      throw new Error("Kabul dosyasının yolu eşleşmiyor.");
    objects.add(file.path);
  }
  for (const url of [project?.cover, ...(project?.gallery || [])].filter(
    Boolean,
  )) {
    const parsed = new URL(url);
    if (parsed.hostname !== "127.0.0.1" || parsed.port !== "9199")
      throw new Error("Yerel olmayan kabul görseli silinmez.");
    const name = decodeURIComponent(parsed.pathname.split("/o/")[1] || "");
    if (!/^games\/covers\/[a-f0-9-]+\.(png|jpe?g|webp)$/.test(name))
      throw new Error("Görsel yolu eşleşmiyor.");
    objects.add(name);
  }
  const tickets = await db
    .collection("projectUploads")
    .where("projectId", "==", projectId)
    .get();
  for (const ticket of tickets.docs) {
    const t = ticket.data();
    if (!t.path.startsWith(`projectAssets/${t.uid}/${projectId}/`))
      throw new Error("Kabul yükleme yolu eşleşmiyor.");
    objects.add(t.path);
  }
  for (const name of objects)
    await bucket.file(name).delete({ ignoreNotFound: true });
  const batch = db.batch();
  batch.delete(ref);
  batch.delete(db.collection("gamePlayStats").doc(projectId));
  if (project?.slug)
    batch.delete(db.collection("projectSlugs").doc(project.slug));
  tickets.docs.forEach((ticket) => batch.delete(ticket.ref));
  await batch.commit();
}
for (const profile of (await db.collection("gameProfiles").get()).docs) {
  const data = profile.data();
  await profile.ref.update({
    favorites: (data.favorites || []).filter((id) => !ids.includes(id)),
    recent: (data.recent || []).filter((item) => !ids.includes(item.id)),
  });
}
console.log(
  "İki yerel kabul kaydı ve bağlı dosyaları temizlendi; diğer projeler korunuyor.",
);
