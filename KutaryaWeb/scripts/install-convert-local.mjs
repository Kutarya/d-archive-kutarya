// Yalnız sabit demo emülatörü; üretim hedefi veya yayını yoktur.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
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
  kutaryaConvert,
  kutaryaConvertFiles,
} from "../projects-src/kutarya-convert.mjs";
const mode = process.argv[2];
assert(
  ["draft", "publish"].includes(mode),
  "Kullanım: node scripts/install-convert-local.mjs draft|publish",
);
const root = resolve(fileURLToPath(new URL("../", import.meta.url))),
  artifacts = resolve(root, "artifacts/convert");
await mkdir(artifacts, { recursive: true });
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
assert(account, "Yerel admin hesabı yok.");
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
const before = await call("admin.data"),
  others = before.gamesCatalog.filter((g) => g.id !== kutaryaConvert.id);
assert(before.gameCategories.some((c) => c.id === kutaryaConvert.category));
let old = before.gamesCatalog.find((g) => g.id === kutaryaConvert.id);
if (!old) {
  await call("admin.game", { game: kutaryaConvert });
  old = (await call("admin.data")).gamesCatalog.find(
    (g) => g.id === kutaryaConvert.id,
  );
}
if (mode === "publish") {
  const proof = JSON.parse(
    await readFile(resolve(artifacts, "browser-acceptance.json"), "utf8"),
  );
  const manifest = JSON.parse(
    await readFile(
      resolve(root, "public/games/kutarya-convert/1.0.0/kutarya-manifest.json"),
      "utf8",
    ),
  );
  const runtime = await readFile(
    resolve(root, "public/games/kutarya-convert/1.0.0/index.html"),
  );
  assert(
    proof.passed &&
      proof.gameId === kutaryaConvert.id &&
      proof.version === kutaryaConvert.version,
  );
  assert.equal(
    createHash("sha256").update(runtime).digest("hex"),
    proof.htmlSha256,
  );
  assert(
    old.versions.some((v) => v.id === kutaryaConvert.version && v.verified),
    "Önce kabul ve operatör sürüm kaydı gerekli.",
  );
  assert.equal(manifest.entry, "/games/kutarya-convert/1.0.0/index.html");
  const downloads = [];
  for (const file of kutaryaConvertFiles) {
    const bytes = await readFile(resolve(artifacts, file.name)),
      sha256 = createHash("sha256").update(bytes).digest("hex");
    let stored = old.files.find(
      (f) =>
        f.name === file.name &&
        f.version === kutaryaConvert.version &&
        f.role === file.role,
    );
    if (!stored) {
      const ticket = await call("admin.fileBegin", {
        gameId: kutaryaConvert.id,
        name: file.name,
        size: bytes.length,
        version: kutaryaConvert.version,
        role: file.role,
        platform: "web",
      });
      try {
        await uploadBytes(ref(storage, ticket.path), bytes, {
          contentType: "application/octet-stream",
        });
        stored = (
          await call("admin.fileComplete", {
            gameId: kutaryaConvert.id,
            fileId: ticket.fileId,
          })
        ).file;
      } catch (error) {
        await call("admin.fileAbort", {
          gameId: kutaryaConvert.id,
          fileId: ticket.fileId,
        }).catch(() => {});
        throw error;
      }
    }
    assert.equal(stored.size, bytes.length);
    downloads.push({ ...file, id: stored.id, bytes: bytes.length, sha256 });
  }
  const coverBytes = await readFile(
    resolve(root, "public/media/projects/kutarya-convert/uygulama.jpg"),
  );
  assert(coverBytes.length <= 1024 * 1024);
  const cover =
    old.cover ||
    (
      await call("admin.cover", {
        mime: "image/jpeg",
        base64: coverBytes.toString("base64"),
      })
    ).url;
  await call("admin.game", {
    game: {
      ...kutaryaConvert,
      cover,
      runtime: manifest.entry,
      status: "published",
    },
  });
  for (const file of downloads) {
    const { url } = await call(
      "download",
      { gameId: kutaryaConvert.id, fileId: file.id },
      false,
    );
    assert.equal(new URL(url).origin, "http://127.0.0.1:9199");
    const response = await fetch(url);
    assert(response.ok);
    const actual = Buffer.from(await response.arrayBuffer());
    assert.equal(actual.length, file.bytes);
    assert.equal(
      createHash("sha256").update(actual).digest("hex"),
      file.sha256,
    );
    file.verified = true;
  }
  await writeFile(
    resolve(artifacts, "local-install.json"),
    JSON.stringify(
      {
        at: new Date().toISOString(),
        projectId: "demo-kutarya-games",
        productionChanged: false,
        project: kutaryaConvert.id,
        version: kutaryaConvert.version,
        downloads,
        otherProjectsUnchanged: others.map((g) => g.id),
        siteUrl: "http://127.0.0.1:5180/proje/kutarya-convert",
      },
      null,
      2,
    ),
  );
}
const after = await call("admin.data");
assert.deepEqual(
  after.gamesCatalog.filter((g) => g.id !== kutaryaConvert.id),
  others,
  "Diğer projeler değişti.",
);
console.log(
  mode === "draft"
    ? "Convert yerel taslağı hazır; diğer beş proje korundu."
    : "Convert yerel katalogda: 2 indirme SHA/boyut doğrulandı, diğer projeler korundu. Canlı yayın yok.",
);
process.exit(0);
