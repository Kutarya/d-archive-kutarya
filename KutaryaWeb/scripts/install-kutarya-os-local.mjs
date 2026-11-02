// Yalnız yerel demo emülatörüne yazar; canlı Firebase yayını yapmaz.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  connectStorageEmulator,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  kutaryaOs,
  kutaryaOsFiles,
  kutaryaOsImages,
} from "../projects-src/kutarya-os.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const release = "D:/KutaryaOS/Dagitim";
const artifacts = resolve(root, "artifacts/kutarya-os");
const media = resolve(root, "public/media/projects/kutarya-os");
const sha256 = async (stream) => {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of stream) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  return { sha256: hash.digest("hex").toUpperCase(), bytes };
};
const manifest = JSON.parse(
  await readFile(resolve(release, "paket-bilgisi-0.3.0.json"), "utf8"),
);
const acceptance = JSON.parse(
  await readFile(
    "D:/KutaryaOS/ProjeDosyalari/TestSonuclari/Kurulum/kurulum-kabul.json",
    "utf8",
  ),
);
assert.equal(manifest.version, kutaryaOs.version);
assert.equal(manifest.privateEntries, 0, "Kaynak arşivi özel veri içermemeli.");
assert(
  acceptance.passed && !acceptance.fast && acceptance.count === 10,
  "Tam kurulum kabulü gerekli.",
);
assert.equal(
  acceptance.installerSha,
  manifest.artifacts.find((f) => f.name === kutaryaOsFiles[0].name)?.sha256,
);
assert.equal(
  acceptance.exeSha,
  manifest.artifacts.find((f) => f.name === "KutaryaOS.exe")?.sha256,
);

// Katalog veya Storage değişmeden önce gerçek dağıtım paketlerini doğrula.
const packages = [];
for (const file of kutaryaOsFiles) {
  const expected = manifest.artifacts.find((f) => f.name === file.name);
  assert(expected, `Paket manifestte yok: ${file.name}`);
  const actual = await sha256(createReadStream(resolve(release, file.name)));
  assert.equal(actual.bytes, expected.bytes, file.name);
  assert.equal(actual.sha256, expected.sha256, file.name);
  packages.push({ ...file, ...actual });
}
for (const img of kutaryaOsImages) {
  const size = (await stat(resolve(release, "Goruntuler", img.name))).size;
  assert(size > 0 && size <= 1024 * 1024, `Görsel yükleme sınırı: ${img.name}`);
}
await mkdir(artifacts, { recursive: true });
await mkdir(media, { recursive: true });
for (const file of packages) {
  await copyFile(resolve(release, file.name), resolve(artifacts, file.name));
  assert.deepEqual(
    await sha256(createReadStream(resolve(artifacts, file.name))),
    { sha256: file.sha256, bytes: file.bytes },
  );
}
for (const img of kutaryaOsImages)
  await copyFile(
    resolve(release, "Goruntuler", img.name),
    resolve(media, img.name),
  );
await writeFile(
  resolve(artifacts, "paket-bilgisi-0.3.0.json"),
  JSON.stringify(manifest, null, 2),
);

// Proje, kimlik ve tüm hedefler sabittir; ortam değişkeniyle üretime yönlenmez.
const app = initializeApp({
  apiKey: "local",
  projectId: "demo-kutarya-games",
  storageBucket: "demo-kutarya-games.appspot.com",
});
const auth = getAuth(app),
  storage = getStorage(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectStorageEmulator(storage, "127.0.0.1", 9199);
const account = JSON.parse(
  await readFile(resolve(root, "artifacts/local-credentials.json"), "utf8"),
).find((a) => a.role === "admin");
assert(account, "Önce yerel demo servislerini ve admin hesabını başlat.");
await signInWithEmailAndPassword(auth, account.email, account.password);
async function call(op, data = {}, authenticated = true) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated)
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const res = await fetch(
    "http://127.0.0.1:5005/demo-kutarya-games/europe-west1/gamesService",
    {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { op, ...data } }),
    },
  );
  const json = await res.json();
  assert(res.ok && !json.error, json.error?.message || op);
  return json.result;
}
const before = await call("admin.data");
const others = before.gamesCatalog.filter((g) => g.id !== kutaryaOs.id);
assert(
  before.gameCategories.some((c) => c.id === kutaryaOs.category),
  "Uygulamalar kategorisi bulunamadı.",
);
let old = before.gamesCatalog.find((g) => g.id === kutaryaOs.id);
if (!old) {
  await call("admin.game", { game: kutaryaOs });
  old = (await call("admin.data")).gamesCatalog.find(
    (g) => g.id === kutaryaOs.id,
  );
}
for (const file of packages) {
  const existing = old.files.find(
    (f) =>
      f.name === file.name &&
      f.version === kutaryaOs.version &&
      f.role === file.role &&
      f.platform === "windows",
  );
  if (existing) {
    assert.equal(
      existing.size,
      file.bytes,
      "Mevcut paket farklı: silmeden önce incele.",
    );
    file.fileId = existing.id;
    continue;
  }
  const ticket = await call("admin.fileBegin", {
    gameId: kutaryaOs.id,
    name: file.name,
    size: file.bytes,
    version: kutaryaOs.version,
    role: file.role,
    platform: "windows",
  });
  try {
    await uploadBytes(
      ref(storage, ticket.path),
      await readFile(resolve(artifacts, file.name)),
      { contentType: "application/octet-stream" },
    );
    const complete = await call("admin.fileComplete", {
      gameId: kutaryaOs.id,
      fileId: ticket.fileId,
    });
    file.fileId = complete.file.id;
    console.log(`${file.name}: yerel Storage yüklemesi doğrulandı.`);
  } catch (error) {
    await call("admin.fileAbort", {
      gameId: kutaryaOs.id,
      fileId: ticket.fileId,
    }).catch(() => {});
    throw error;
  }
}
// Görseller ilk eklemede gerçek PNG dosyalarından yüklenir; tekrar çalıştırma kopya üretmez.
let cover = old.cover;
let gallery = old.gallery || [];
if (!cover || gallery.length !== kutaryaOsImages.length - 1) {
  const urls = [];
  for (const img of kutaryaOsImages) {
    const result = await call("admin.cover", {
      mime: "image/png",
      base64: (await readFile(resolve(media, img.name))).toString("base64"),
    });
    urls.push(result.url);
  }
  [cover, ...gallery] = urls;
}
await call("admin.game", {
  game: { ...kutaryaOs, cover, gallery, status: "published" },
});

// Oturum açmadan alınabilen gerçek indirmeleri uçtan uca boyut/SHA ile doğrula.
const downloads = [];
for (const file of packages) {
  const { url } = await call(
    "download",
    { gameId: kutaryaOs.id, fileId: file.fileId },
    false,
  );
  assert(
    new URL(url).origin === "http://127.0.0.1:9199",
    "Yerel Storage dışına çıkılamaz.",
  );
  const res = await fetch(url);
  assert(res.ok, file.name);
  assert(
    res.headers.get("content-disposition")?.includes(file.name),
    "İndirme dosya adı eşleşmedi.",
  );
  const actual = await sha256(res.body);
  assert.equal(actual.sha256, file.sha256, file.name);
  assert.equal(actual.bytes, file.bytes, file.name);
  downloads.push({
    ...file,
    contentType: res.headers.get("content-type"),
    contentDisposition: res.headers.get("content-disposition"),
    verified: true,
  });
}
const imageProof = [];
for (const [index, url] of [cover, ...gallery].entries()) {
  assert(new URL(url).origin === "http://127.0.0.1:9199");
  const res = await fetch(url);
  assert(res.ok && res.headers.get("content-type")?.startsWith("image/png"));
  const actual = await sha256(res.body);
  assert.deepEqual(
    actual,
    await sha256(createReadStream(resolve(media, kutaryaOsImages[index].name))),
  );
  imageProof.push({ name: kutaryaOsImages[index].name, ...actual });
}
const after = await call("admin.data");
assert.deepEqual(
  after.gamesCatalog.filter((g) => g.id !== kutaryaOs.id),
  others,
  "Diğer projeler değişmemeli.",
);
const current = after.gamesCatalog.find((g) => g.id === kutaryaOs.id);
assert.equal(current.status, "published");
assert.equal(
  current.files.filter((f) => f.version === kutaryaOs.version).length,
  3,
);
await writeFile(
  resolve(artifacts, "local-install.json"),
  JSON.stringify(
    {
      at: new Date().toISOString(),
      projectId: "demo-kutarya-games",
      productionChanged: false,
      project: current.id,
      version: current.version,
      downloads,
      images: imageProof,
      otherProjectsUnchanged: others.map((g) => g.id),
      siteUrl: "http://127.0.0.1:5180/proje/kutarya-os",
    },
    null,
    2,
  ),
);
console.log(
  "Kutarya OS: 3 indirme ve 5 görsel SHA/boyut doğrulamasını geçti; diğer projeler korundu. Canlı yayın yapılmadı.",
);
process.exit(0);
