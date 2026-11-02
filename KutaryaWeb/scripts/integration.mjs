import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import { initializeApp as webApp } from "firebase/app";
import {
  getAuth as webAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getStorage as webStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  getBytes,
} from "firebase/storage";
import { fixture } from "../functions/test/fixture.mjs";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
const require = createRequire(
  new URL("../functions/package.json", import.meta.url),
);
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8085";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";
const { initializeApp } = require("firebase-admin/app"),
  { getAuth: adminAuth } = require("firebase-admin/auth"),
  { getFirestore } = require("firebase-admin/firestore"),
  { getStorage } = require("firebase-admin/storage");
initializeApp({ projectId: "demo-kutarya-games" });
const db = getFirestore(),
  bucket = getStorage().bucket("demo-kutarya-games.appspot.com");
const accounts = JSON.parse(
  await readFile("artifacts/local-credentials.json", "utf8"),
);
const adminAccount = accounts.find((a) => a.role === "admin"),
  memberAccount = accounts.find((a) => a.role === "member"),
  unverified = accounts.find((a) => a.role === "unverified");
// Bir önceki test kod doğrulaması yapar. Yalnız testin sentetik hesabını
// başlangıç durumuna getir; diğer yerel oturumları/şifreleri döndürme.
assert.equal(unverified.email, "yeni@kutarya.test");
const verificationFixture = await adminAuth().getUser(unverified.uid);
assert.equal(verificationFixture.email, unverified.email);
await adminAuth().updateUser(unverified.uid, { emailVerified: false });
async function signIn(a) {
  const res = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=local",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: a.email,
        password: a.password,
        returnSecureToken: true,
      }),
    },
  );
  assert(res.ok);
  return (await res.json()).idToken;
}
async function call(op, data = {}, token) {
  const res = await fetch(
    "http://127.0.0.1:5005/demo-kutarya-games/europe-west1/gamesService",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: { op, ...data } }),
    },
  );
  const json = await res.json();
  return { ok: res.ok, data: json.result, error: json.error };
}
const passed = [];
async function check(name, fn) {
  await fn();
  passed.push(name);
  console.log("GEÇTİ:", name);
}
const admin = await signIn(adminAccount),
  member = await signIn(memberAccount),
  unverifiedToken = await signIn(unverified);
const suffix = randomUUID().slice(0, 8),
  projectId = `integration-${suffix}`,
  browserId = `browser-${suffix}`;
const project = { ...fixture, id: projectId, slug: projectId };
const app = webApp(
    {
      apiKey: "local",
      projectId: "demo-kutarya-games",
      storageBucket: bucket.name,
    },
    `integration-${suffix}`,
  ),
  clientAuth = webAuth(app),
  storage = webStorage(app);
connectAuthEmulator(clientAuth, "http://127.0.0.1:9099", {
  disableWarnings: true,
});
connectStorageEmulator(storage, "127.0.0.1", 9199);
const rulesEnvironment = await initializeTestEnvironment({
  projectId: "demo-kutarya-games",
  storage: {
    host: "127.0.0.1",
    port: 9199,
    rules: await readFile("firebase/storage.rules", "utf8"),
  },
});
const cleanupPaths = [];
try {
  await check("Eski dört örnek katalogda bulunmaz", async () => {
    const c = (await call("catalog")).data;
    assert(
      !c.games.some((g) =>
        ["neon-rota", "yorunge", "hafiza-atlasi", "birlesim"].includes(g.id),
      ),
    );
    assert(c.categories.some((c) => c.id === "uygulama"));
  });
  await check("Misafir yönetim verisini okuyamaz", async () =>
    assert.equal((await call("admin.data")).ok, false),
  );
  await check("Üye yönetim verisini okuyamaz", async () =>
    assert.equal((await call("admin.data", {}, member)).ok, false),
  );
  await check("Yönetici proje taslağı oluşturur", async () => {
    const r = await call("admin.game", { game: project }, admin);
    assert(r.ok, r.error?.message);
  });
  await check("Taslak katalogda ve dosya indirmede gizlidir", async () => {
    assert(!(await call("catalog")).data.games.some((g) => g.id === projectId));
    assert.equal(
      (await call("download", { gameId: projectId, fileId: "fake" })).ok,
      false,
    );
  });
  await check("Dosyasız kurulum projesi yayınlanamaz", async () =>
    assert.equal(
      (
        await call(
          "admin.game",
          {
            game: {
              ...project,
              status: "published",
              files: [{ id: "fake", version: "1.0.0" }],
            },
          },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check("Aynı adresi iki proje kullanamaz", async () =>
    assert.equal(
      (
        await call(
          "admin.game",
          { game: { ...project, id: `duplicate-${suffix}` } },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check(
    "Eşzamanlı oluşturmalarda adres yalnız bir projeye atanır",
    async () => {
      const results = await Promise.all(
        ["a", "b"].map((k) =>
          call(
            "admin.game",
            {
              game: {
                ...project,
                id: `race-${k}-${suffix}`,
                slug: `race-${suffix}`,
              },
            },
            admin,
          ),
        ),
      );
      assert.equal(results.filter((r) => r.ok).length, 1);
    },
  );
  await check("Üye yükleme kaydı oluşturamaz", async () =>
    assert.equal(
      (
        await call(
          "admin.fileBegin",
          {
            gameId: projectId,
            name: "source.zip",
            size: 8,
            role: "source",
            platform: "all",
            version: "1.0.0",
          },
          member,
        )
      ).ok,
      false,
    ),
  );
  await check("HTML ve büyük paket sunucudan reddedilir", async () => {
    for (const change of [
      { name: "site.html", size: 8 },
      { name: "source.zip", size: 501 * 1024 * 1024 },
    ])
      assert.equal(
        (
          await call(
            "admin.fileBegin",
            {
              gameId: projectId,
              role: "source",
              platform: "all",
              version: "1.0.0",
              ...change,
            },
            admin,
          )
        ).ok,
        false,
      );
  });
  await signInWithEmailAndPassword(
    clientAuth,
    memberAccount.email,
    memberAccount.password,
  );
  await check("Üyenin doğrudan Storage yüklemesi reddedilir", async () => {
    await assert.rejects(
      uploadBytes(
        ref(
          storage,
          `projectAssets/${memberAccount.uid}/${projectId}/fake/source.zip`,
        ),
        new Uint8Array([80, 75, 3, 4, 0, 0, 0, 0]),
        { contentType: "application/octet-stream" },
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await signInWithEmailAndPassword(
    clientAuth,
    adminAccount.email,
    adminAccount.password,
  );
  await check("Admin kendi kapsamı dışına yükleyemez", async () => {
    await assert.rejects(
      uploadBytes(
        ref(
          storage,
          `projectAssets/${memberAccount.uid}/${projectId}/fake/source.zip`,
        ),
        new Uint8Array([80, 75, 3, 4, 0, 0, 0, 0]),
        { contentType: "application/octet-stream" },
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  let ticket, file;
  await check(
    "Admin gerçek paket yükler ve sunucu dosyaya kaydeder",
    async () => {
      const bytes = new Uint8Array([80, 75, 3, 4, 0, 0, 0, 0, 1, 2, 3, 4]);
      const r = await call(
        "admin.fileBegin",
        {
          gameId: projectId,
          name: "source.zip",
          size: bytes.length,
          role: "source",
          platform: "all",
          version: "1.0.0",
        },
        admin,
      );
      assert(r.ok, r.error?.message);
      ticket = r.data;
      cleanupPaths.push(ticket.path);
      await uploadBytes(ref(storage, ticket.path), bytes, {
        contentType: "application/octet-stream",
      });
      const complete = await call(
        "admin.fileComplete",
        { gameId: projectId, fileId: ticket.fileId },
        admin,
      );
      assert(complete.ok, complete.error?.message);
      file = complete.data.file;
      assert.equal(file.size, bytes.length);
      assert(!file.path);
    },
  );
  await check("Kayıtlı paketin üzerine yazılamaz", async () => {
    await assert.rejects(
      uploadBytes(
        ref(storage, ticket.path),
        new Uint8Array([80, 75, 3, 4, 0, 0, 0, 0]),
        { contentType: "application/octet-stream" },
      ),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await check("Tamamlanmış dosya ikinci kez eklenemez", async () =>
    assert.equal(
      (
        await call(
          "admin.fileComplete",
          { gameId: projectId, fileId: ticket.fileId },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check("Aynı sürümde aynı dosya tekrar eklenemez", async () =>
    assert.equal(
      (
        await call(
          "admin.fileBegin",
          {
            gameId: projectId,
            name: "source.zip",
            size: file.size,
            role: "source",
            platform: "all",
            version: "1.0.0",
          },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check(
    "EXE uzantılı HTML içeriği tamamlamada reddedilir ve iptal temizlenir",
    async () => {
      const r = await call(
        "admin.fileBegin",
        {
          gameId: projectId,
          name: "invalid.exe",
          size: 8,
          role: "installer",
          platform: "windows",
          version: "1.0.0",
        },
        admin,
      );
      assert(r.ok);
      cleanupPaths.push(r.data.path);
      await uploadBytes(
        ref(storage, r.data.path),
        new TextEncoder().encode("<html>xx"),
        { contentType: "application/octet-stream" },
      );
      assert.equal(
        (
          await call(
            "admin.fileComplete",
            { gameId: projectId, fileId: r.data.fileId },
            admin,
          )
        ).ok,
        false,
      );
      assert(
        (
          await call(
            "admin.fileAbort",
            { gameId: projectId, fileId: r.data.fileId },
            admin,
          )
        ).ok,
      );
      assert.equal((await bucket.file(r.data.path).exists())[0], false);
    },
  );
  await check(
    "Yüklenen dosyayla proje yayınlanır; katalog depolama yolunu açığa çıkarmaz",
    async () => {
      const r = await call(
        "admin.game",
        { game: { ...project, status: "published" } },
        admin,
      );
      assert(r.ok, r.error?.message);
      const g = (await call("catalog")).data.games.find(
        (g) => g.id === projectId,
      );
      assert.equal(g.files.length, 1);
      assert(!g.files[0].path);
    },
  );
  await check("Misafir gerçek dosyayı attachment olarak indirir", async () => {
    const r = await call("download", { gameId: projectId, fileId: file.id });
    assert(r.ok, r.error?.message);
    const res = await fetch(r.data.url);
    assert(res.ok);
    assert.match(res.headers.get("content-disposition"), /attachment/);
    assert.equal((await res.arrayBuffer()).byteLength, file.size);
  });
  await check("Yayındaki paket doğrudan kaldırılamaz", async () =>
    assert.equal(
      (
        await call(
          "admin.fileRemove",
          { gameId: projectId, fileId: file.id },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check("Misafir Storage SDK ile özel nesne okuyamaz", async () => {
    await signOut(clientAuth);
    await assert.rejects(
      getBytes(ref(storage, ticket.path)),
      (e) => e.code === "storage/unauthorized",
    );
  });
  await check("Doğrulanmamış üye favori yazamaz", async () =>
    assert.equal(
      (
        await call(
          "favorite",
          { gameId: projectId, enabled: true },
          unverifiedToken,
        )
      ).ok,
      false,
    ),
  );
  await check(
    "Favori UID sınırı ve profil rol enjeksiyonu korunur",
    async () => {
      assert(
        (
          await call(
            "favorite",
            { gameId: projectId, enabled: true, uid: adminAccount.uid },
            member,
          )
        ).ok,
      );
      assert((await call("me", {}, member)).data.favorites.includes(projectId));
      assert(!(await call("me", {}, admin)).data.favorites.includes(projectId));
      assert(
        (
          await call(
            "profile",
            {
              displayName: "Deniz",
              bio: "Projeler",
              avatar: "leaf",
              gamesAdmin: true,
            },
            member,
          )
        ).ok,
      );
      assert.equal((await call("admin.data", {}, member)).ok, false);
    },
  );
  await check("Son incelenen proje geçmişi kaydedilir", async () => {
    assert((await call("recent", { gameId: projectId }, member)).ok);
    assert.equal((await call("me", {}, member)).data.recent[0].id, projectId);
  });
  await check(
    "Yanıltıcı görsel MIME ve üye kapak yüklemesi reddedilir",
    async () => {
      for (const token of [admin, member])
        assert.equal(
          (
            await call(
              "admin.cover",
              { mime: "image/png", base64: "dGVzdA==" },
              token,
            )
          ).ok,
          false,
        );
    },
  );
  await check("Gerçek görsel Storage üzerinde saklanır", async () => {
    const r = await call(
      "admin.cover",
      {
        mime: "image/png",
        base64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTocAAAAASUVORK5CYII=",
      },
      admin,
    );
    assert(r.ok);
    cleanupPaths.push(
      decodeURIComponent(new URL(r.data.url).pathname.split("/o/")[1]),
    );
    const res = await fetch(r.data.url);
    assert(res.ok);
    assert.equal(res.headers.get("content-type"), "image/png");
  });
  await check("Doğrulanmamış Unity paketi yayınlanamaz", async () =>
    assert.equal(
      (
        await call(
          "admin.game",
          {
            game: {
              ...project,
              id: `unity-${suffix}`,
              slug: `unity-${suffix}`,
              engine: "unity",
              runtime: "/games/test/1.0/index.html",
              status: "published",
            },
          },
          admin,
        )
      ).ok,
      false,
    ),
  );
  await check("İndirilebilir proje oyun açılışı sayılmaz", async () =>
    assert.equal(
      (await call("play", { gameId: projectId, session: randomUUID() })).ok,
      false,
    ),
  );
  await check("Tarayıcı açılışı aynı oturum için tekrar sayılmaz", async () => {
    await db
      .collection("gamesCatalog")
      .doc(browserId)
      .set({
        ...project,
        id: browserId,
        slug: browserId,
        kind: "web",
        engine: "web",
        status: "published",
        runtime: `/games/${browserId}/1.0.0/index.html`,
      });
    const data = { gameId: browserId, session: randomUUID() };
    assert.equal((await call("play", data)).data.counted, true);
    assert.equal((await call("play", data)).data.counted, false);
  });
  await check("Referanslı kategori kaldırılamaz", async () =>
    assert.equal(
      (await call("admin.category", { id: "uygulama", remove: true }, admin))
        .ok,
      false,
    ),
  );
  await check(
    "Destek mesajı ve yönetim durum değişikliği çalışır",
    async () => {
      assert(
        (
          await call(
            "report",
            { gameId: projectId, message: `Entegrasyon ${suffix}`, email: "" },
            member,
          )
        ).ok,
      );
      const r = (await call("admin.data", {}, admin)).data.gameReports.find(
        (r) => r.message === `Entegrasyon ${suffix}`,
      );
      assert(r);
      assert(
        (
          await call(
            "admin.report",
            { id: r.id, status: "closed", note: "Test tamamlandı" },
            admin,
          )
        ).ok,
      );
    },
  );
  await check(
    "Üye kısıtı ortak Auth hesabını değiştirmeden uygulanır",
    async () => {
      assert(
        (
          await call(
            "admin.user",
            { uid: memberAccount.uid, suspended: true },
            admin,
          )
        ).ok,
      );
      assert.equal(
        (await call("favorite", { gameId: projectId, enabled: true }, member))
          .ok,
        false,
      );
      assert(
        (
          await call(
            "admin.user",
            { uid: memberAccount.uid, suspended: false },
            admin,
          )
        ).ok,
      );
    },
  );
  await check(
    "Yerel kod maili, yanlış/doğru kod ve tekrar kullanma kontrolü",
    async () => {
      const r = await call("sendCode", {}, unverifiedToken);
      assert(r.ok, r.error?.message);
      const mails = (
        await db
          .collection("gamesLocalMail")
          .where("to", "==", unverified.email)
          .get()
      ).docs
        .map((d) => d.data())
        .sort((a, b) => b.at - a.at);
      assert(mails[0].simulated);
      const code = mails[0].body.match(/<h2>(\d{6})<\/h2>/)[1];
      assert.equal(
        (await call("verifyCode", { code: "000000" }, unverifiedToken)).ok,
        false,
      );
      assert((await call("verifyCode", { code }, unverifiedToken)).ok);
      assert.equal(
        (await call("verifyCode", { code }, unverifiedToken)).ok,
        false,
      );
    },
  );
  await check(
    "Parola sıfırlama özel Kutarya işlem sayfasını üretir",
    async () => {
      assert((await call("resetPassword", { email: memberAccount.email })).ok);
      const docs = await db
        .collection("gamesLocalMail")
        .where("to", "==", memberAccount.email)
        .get();
      assert(
        docs.docs.some((d) =>
          d.data().body.includes("/auth/action?mode=resetPassword"),
        ),
      );
    },
  );
  await check("Doğrudan Firestore erişimi reddedilir", async () => {
    const res = await fetch(
      `http://127.0.0.1:8085/v1/projects/demo-kutarya-games/databases/(default)/documents/gamesCatalog/${projectId}`,
    );
    assert.equal(res.status, 403);
  });
  await check(
    "Arşivlenen proje katalogdan ve indirme API’sinden kaldırılır",
    async () => {
      assert(
        (
          await call(
            "admin.game",
            { game: { ...project, status: "archived" } },
            admin,
          )
        ).ok,
      );
      assert(
        !(await call("catalog")).data.games.some((g) => g.id === projectId),
      );
      assert.equal(
        (await call("download", { gameId: projectId, fileId: file.id })).ok,
        false,
      );
    },
  );
  await check(
    "Taslak/arşiv paketi yönetici tarafından kaldırılabilir",
    async () => {
      assert(
        (
          await call(
            "admin.fileRemove",
            { gameId: projectId, fileId: file.id },
            admin,
          )
        ).ok,
      );
      assert.equal(
        (await db.collection("gamesCatalog").doc(projectId).get()).data().files
          .length,
        0,
      );
    },
  );
  await check("Yönetim işlemleri denetim kaydı üretir", async () => {
    const rows = (await call("admin.data", {}, admin)).data.gameAdminAudit;
    assert(
      rows.some(
        (a) =>
          a.action === "admin.fileComplete" && a.target.startsWith(projectId),
      ),
    );
  });
  await writeFile(
    "artifacts/integration-results.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        environment: "local-firebase-emulators",
        passed,
        realEmailDelivery: false,
        production: false,
      },
      null,
      2,
    ),
  );
  console.log(`Entegrasyon: ${passed.length}/${passed.length} geçti.`);
} finally {
  for (const path of cleanupPaths)
    await bucket.file(path).delete({ ignoreNotFound: true });
  for (const id of [
    projectId,
    browserId,
    `race-a-${suffix}`,
    `race-b-${suffix}`,
  ]) {
    await db.collection("gamesCatalog").doc(id).delete();
    await db.collection("gamePlayStats").doc(id).delete();
  }
  for (const slug of [projectId, `race-${suffix}`])
    await db.collection("projectSlugs").doc(slug).delete();
  await signOut(clientAuth);
  await rulesEnvironment.cleanup();
}
