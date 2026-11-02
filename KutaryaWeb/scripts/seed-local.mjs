import { createRequire } from "node:module";
import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import {
  games,
  categories,
  settings,
  announcements,
} from "../functions/catalog.js";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
const { initializeApp } = require("firebase-admin/app"),
  { getAuth } = require("firebase-admin/auth"),
  { getFirestore } = require("firebase-admin/firestore");
initializeApp({ projectId: "demo-kutarya-games" });
const auth = getAuth(),
  db = getFirestore();
const accounts = [];
for (const [role, email, name, verified] of [
  ["admin", "yonetici@kutarya.test", "Kutarya Yönetici", true],
  ["member", "oyuncu@kutarya.test", "Deniz", true],
  ["unverified", "yeni@kutarya.test", "Yeni Oyuncu", false],
]) {
  const password = `Kty-${randomBytes(16).toString("hex")}!`;
  let user;
  try {
    user = await auth.getUserByEmail(email);
    user = await auth.updateUser(user.uid, {
      password,
      emailVerified: verified,
      displayName: name,
    });
  } catch {
    user = await auth.createUser({
      email,
      password,
      emailVerified: verified,
      displayName: name,
    });
  }
  await auth.setCustomUserClaims(user.uid, { gamesAdmin: role === "admin" });
  await db.collection("gameProfiles").doc(user.uid).set({
    uid: user.uid,
    displayName: name,
    bio: "",
    avatar: "spark",
    favorites: [],
    recent: [],
    createdAt: Date.now(),
    suspended: false,
  });
  accounts.push({ role, email, password, uid: user.uid });
}
const batch = db.batch();
// Kullanıcının kaldırılmasını istediği yalnız bu dört eski örnek silinir.
for (const oldId of ["neon-rota", "yorunge", "hafiza-atlasi", "birlesim"]) {
  batch.delete(db.collection("gamesCatalog").doc(oldId));
  batch.delete(db.collection("gamePlayStats").doc(oldId));
}
for (const oldId of ["arcade", "bulmaca", "refleks"])
  batch.delete(db.collection("gameCategories").doc(oldId));
games.forEach((g) => batch.set(db.collection("gamesCatalog").doc(g.id), g));
categories.forEach((c) =>
  batch.set(db.collection("gameCategories").doc(c.id), c),
);
announcements.forEach((a) =>
  batch.set(db.collection("gameAnnouncements").doc(a.id), a),
);
batch.set(db.collection("gameSiteSettings").doc("public"), settings);
await batch.commit();
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/local-credentials.json",
  JSON.stringify(accounts, null, 2),
);
console.log(
  "Yerel ortam hazır: boş başlangıç kataloğu, 6 içerik türü, 3 test hesabı. Kimlik bilgileri yalnız gitignore içindeki artifacts/local-credentials.json dosyasında.",
);
