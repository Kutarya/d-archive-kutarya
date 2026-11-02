// Yayın onayı ve mevcut gamesService/admin hattı gerekir. Sunucu veya yerel port açmaz.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { kutaryaJenerik } from "../projects-src/kutarya-jenerik.mjs";
import { jenerikArtifactDirectory as out, jenerikImageDirectory } from "./jenerik-release-paths.mjs";

if (process.env.KUTARYA_RELEASE_APPROVED !== "true")
  throw new Error(
    "Önce docs/YAYIN.md yayın kapıları ve kullanıcı onayı tamamlanmalı. Bu betik onay yerine geçmez.",
  );
const customToken = process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN;
if (!customToken)
  throw new Error(
    "Mevcut doğrulanmış gamesAdmin hesabının kısa ömürlü custom token'ı bellekte gerekli; şifre veya token dosyaya yazılmaz.",
  );
const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(resolve(out, `paket-bilgisi-${kutaryaJenerik.version}.json`), "utf8"),
);
assert.equal(manifest.gameId, kutaryaJenerik.id);
assert.equal(manifest.version, kutaryaJenerik.version);
const bucket = "kutarya-ai-3169.firebasestorage.app";
const endpoint =
  "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
async function digest(stream) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of stream) {
    bytes += chunk.length;
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest("hex").toUpperCase() };
}
for (const f of manifest.artifacts) {
  assert(
    !f.name.includes("/") && !f.name.includes("\\") && !f.name.includes(".."),
  );
  assert.deepEqual(await digest(createReadStream(resolve(out, f.name))), {
    bytes: f.bytes,
    sha256: f.sha256,
  });
}
for (const img of manifest.images) {
  assert(
    !img.name.includes("/") &&
      !img.name.includes("\\") &&
      !img.name.includes(".."),
  );
  assert.deepEqual(
    await digest(
      createReadStream(
        resolve(jenerikImageDirectory, img.name),
      ),
    ),
    { bytes: img.bytes, sha256: img.sha256 },
  );
}
const e = loadEnv("production", root, "VITE_");
assert.equal(e.VITE_FIREBASE_PROJECT_ID, "kutarya-ai-3169");
assert.notEqual(e.VITE_USE_EMULATORS, "true");
assert(e.VITE_FIREBASE_API_KEY);
const app = initializeApp(
  {
    apiKey: e.VITE_FIREBASE_API_KEY,
    projectId: "kutarya-ai-3169",
    authDomain: "kutarya-ai-3169.firebaseapp.com",
    appId: e.VITE_FIREBASE_APP_ID,
    storageBucket: bucket,
  },
  "kutarya-jenerik-release",
);
const auth = getAuth(app),
  storage = getStorage(app);
async function call(op, data = {}, authenticated = true) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated)
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: { op, ...data } }),
  });
  assert(
    res.ok,
    `gamesService erişimi: HTTP ${res.status}; önce servis yayınını doğrula.`,
  );
  const json = await res.json();
  assert(!json.error, json.error?.message || op);
  assert(json.result, op);
  return json.result;
}
async function readDownload(url) {
  assert.equal(new URL(url).origin, "https://firebasestorage.googleapis.com");
  assert(new URL(url).pathname.startsWith(`/v0/b/${bucket}/o/`));
  const r = await fetch(url);
  assert(r.ok, `İndirme: HTTP ${r.status}`);
  return { response: r, ...(await digest(r.body)) };
}
try {
  await signInWithCustomToken(auth, customToken);
  const claims = (await auth.currentUser.getIdTokenResult()).claims;
  assert(
    auth.currentUser.emailVerified && claims.gamesAdmin === true,
    "Mevcut doğrulanmış gamesAdmin hesabı gerekli.",
  );
  const before = await call("admin.data");
  const others = before.gamesCatalog.filter((g) => g.id !== kutaryaJenerik.id);
  assert(
    before.gameCategories.some((c) => c.id === kutaryaJenerik.category),
    "Önce Uygulamalar kategorisini mevcut yayın akışıyla hazırla.",
  );
  await writeFile(
    resolve(out, "production-before.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        game: before.gamesCatalog.find((g) => g.id === kutaryaJenerik.id) || null,
      },
      null,
      2,
    ) + "\n",
  );
  let old = before.gamesCatalog.find((g) => g.id === kutaryaJenerik.id);
  if (!old) {
    await call("admin.game", { game: kutaryaJenerik });
    old = (await call("admin.data")).gamesCatalog.find(
      (g) => g.id === kutaryaJenerik.id,
    );
  }
  const files = [];
  for (const f of manifest.artifacts) {
    const existing = old.files.find(
      (x) =>
        x.name === f.name &&
        x.version === manifest.version &&
        x.role === f.role &&
        x.platform === f.platform,
    );
    if (existing) {
      assert.equal(
        existing.size,
        f.bytes,
        "Mevcut aynı sürüm dosyası değişmiş; üzerine yazılmaz.",
      );
      files.push({ ...f, fileId: existing.id });
      continue;
    }
    const ticket = await call("admin.fileBegin", {
      gameId: kutaryaJenerik.id,
      name: f.name,
      size: f.bytes,
      version: manifest.version,
      role: f.role,
      platform: f.platform,
    });
    try {
      const upload = uploadBytesResumable(
        ref(storage, ticket.path),
        await readFile(resolve(out, f.name)),
        { contentType: "application/octet-stream" },
      );
      let last = -1;
      await new Promise((done, fail) =>
        upload.on(
          "state_changed",
          (s) => {
            const p = Math.floor((s.bytesTransferred / s.totalBytes) * 10);
            if (p !== last) {
              last = p;
              console.log(`${f.name}: %${p * 10}`);
            }
          },
          fail,
          done,
        ),
      );
      const completed = await call("admin.fileComplete", {
        gameId: kutaryaJenerik.id,
        fileId: ticket.fileId,
      });
      files.push({ ...f, fileId: completed.file.id });
    } catch (error) {
      await call("admin.fileAbort", {
        gameId: kutaryaJenerik.id,
        fileId: ticket.fileId,
      }).catch(() => {});
      throw error;
    }
  }
  let cover = old.cover,
    gallery = old.gallery || [];
  let imagesMatch = !!cover && gallery.length === manifest.images.length - 1;
  if (imagesMatch) {
    for (const [i, url] of [cover, ...gallery].entries()) {
      const existing = await readDownload(url);
      if (existing.sha256 !== manifest.images[i].sha256) { imagesMatch = false; break; }
    }
  }
  if (!imagesMatch) {
    const urls = [];
    for (const img of manifest.images) {
      const bytes = await readFile(
        resolve(jenerikImageDirectory, img.name),
      );
      urls.push(
        (
          await call("admin.cover", {
            mime: "image/png",
            base64: bytes.toString("base64"),
          })
        ).url,
      );
    }
    [cover, ...gallery] = urls;
  }
  await call("admin.game", {
    game: { ...kutaryaJenerik, cover, gallery, status: "published" },
  });
  const downloads = [];
  for (const f of files) {
    const { url } = await call(
      "download",
      { gameId: kutaryaJenerik.id, fileId: f.fileId },
      false,
    );
    const actual = await readDownload(url);
    assert.equal(actual.bytes, f.bytes);
    assert.equal(actual.sha256, f.sha256);
    assert(
      actual.response.headers.get("content-disposition")?.includes(f.name),
    );
    downloads.push({ ...f, verified: true });
  }
  const images = [];
  for (const [i, url] of [cover, ...gallery].entries()) {
    const actual = await readDownload(url),
      img = manifest.images[i];
    assert.equal(actual.bytes, img.bytes);
    assert.equal(actual.sha256, img.sha256);
    assert(
      actual.response.headers.get("content-type")?.startsWith("image/png"),
    );
    images.push({
      name: img.name,
      sha256: actual.sha256,
      bytes: actual.bytes,
      verified: true,
    });
  }
  const after = await call("admin.data");
  assert.deepEqual(
    after.gamesCatalog.filter((g) => g.id !== kutaryaJenerik.id),
    others,
    "Diğer katalog kayıtları değişti.",
  );
  const current = after.gamesCatalog.find((g) => g.id === kutaryaJenerik.id);
  assert.equal(current.status, "published");
  assert.equal(
    current.files.filter((f) => f.version === manifest.version).length,
    manifest.artifacts.length,
  );
  await writeFile(
    resolve(out, "production-upload.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        projectId: "kutarya-ai-3169",
        gameId: kutaryaJenerik.id,
        version: manifest.version,
        downloads,
        images,
        otherProjectsUnchanged: others.map((g) => g.id),
        listeningServerStarted: false,
        siteUrl: "https://kutarya.com/proje/kutarya-jenerik",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Kutarya Jenerik ${manifest.version}: canlı katalog, ${files.length} gerçek indirme ve ${images.length} fotoğraf byte/SHA ile doğrulandı. Hosting görsel kabulü ayrıca yapılmalı.`);
} finally {
  await signOut(auth).catch(() => {});
  await deleteApp(app);
}
