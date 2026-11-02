// Önceki yedi gerçek projeyi mevcut katalog/dosya API'sine taşır; port açmaz.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { loadEnv } from "vite";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { userGames } from "../games-src/projects.mjs";
import {
  kutaryaOs,
  kutaryaOsFiles,
  kutaryaOsImages,
} from "../projects-src/kutarya-os.mjs";
import {
  kutaryaCep,
  kutaryaCepFiles,
  kutaryaCepImages,
} from "../projects-src/kutarya-cep.mjs";
import {
  kutaryaConvert,
  kutaryaConvertFiles,
} from "../projects-src/kutarya-convert.mjs";
import {
  cloudRequest,
  documentsRoot,
  decodeValue,
  encodeValue,
  listCollection,
} from "./firebase-cloud.mjs";
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, "true");
assert(process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN);
const e = loadEnv("production", process.cwd(), "VITE_");
assert.equal(e.VITE_FIREBASE_PROJECT_ID, "kutarya-ai-3169");
assert.notEqual(e.VITE_USE_EMULATORS, "true");
const bucket = "kutarya-ai-3169.firebasestorage.app",
  endpoint =
    "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
const app = initializeApp(
  {
    apiKey: e.VITE_FIREBASE_API_KEY,
    projectId: "kutarya-ai-3169",
    storageBucket: bucket,
  },
  "catalog-release",
);
const auth = getAuth(app),
  storage = getStorage(app);
async function sha(stream) {
  let bytes = 0;
  const h = createHash("sha256");
  for await (const c of stream) {
    bytes += c.length;
    h.update(c);
  }
  return { bytes, sha256: h.digest("hex").toUpperCase() };
}
async function json(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
const projects = [];
for (const game of userGames)
  projects.push({
    project: game,
    folder: "artifacts/user-games",
    files: [
      {
        name: `kutarya-${game.id}-${game.version}.zip`,
        role: "portable",
        platform: "web",
      },
    ],
    images: [`public/media/games/${game.id}.jpg`],
    proof: `artifacts/user-games/${game.id}-browser.json`,
  });
projects.push({
  project: kutaryaOs,
  folder: "artifacts/kutarya-os",
  files: kutaryaOsFiles.map((f) => ({ ...f, platform: "windows" })),
  images: kutaryaOsImages.map(
    (i) => `public/media/projects/kutarya-os/${i.name}`,
  ),
  expected: (await json("artifacts/kutarya-os/paket-bilgisi-0.3.0.json"))
    .artifacts,
});
projects.push({
  project: {
    ...kutaryaCep,
    changelog: kutaryaCep.changelog.replace(
      " Yerel katalog paylaşımı; Firebase deploy yapılmadı.",
      "",
    ),
  },
  folder: "artifacts/kutarya-cep",
  files: kutaryaCepFiles.map((f) => ({
    ...f,
    platform: f.role === "installer" ? "android" : "all",
  })),
  images: kutaryaCepImages.map(
    (i) => `public/media/projects/kutarya-cep/${i.name}`,
  ),
  expected: (await json("artifacts/kutarya-cep/paket-bilgisi-1.0.0.json"))
    .artifacts,
});
projects.push({
  project: {...kutaryaConvert, runtime: `/games/${kutaryaConvert.id}/${kutaryaConvert.version}/index.html`},
  folder: "artifacts/convert",
  files: kutaryaConvertFiles.map((f) => ({
    ...f,
    platform: f.role === "portable" ? "web" : "all",
  })),
  images: ["public/media/projects/kutarya-convert/uygulama.jpg"],
  expected: (await json("artifacts/convert/local-install.json")).downloads,
  proof: "artifacts/convert/browser-acceptance.json",
});
// Tüm gerçek dosyalar önce doğrulanır; bir eksik/bozuk paket varken katalog değiştirilmez.
for (const p of projects) {
  for (const f of p.files) {
    Object.assign(f, await sha(createReadStream(resolve(p.folder, f.name))));
    const x = p.expected?.find((x) => x.name === f.name);
    if (p.expected) {
      assert(x, f.name);
      assert.equal(f.bytes, x.bytes);
      assert.equal(f.sha256, x.sha256.toUpperCase());
    }
  }
  for (const path of p.images) {
    const b = await readFile(path);
    assert(b.length > 0 && b.length <= 1024 * 1024, path);
  }
  if (["web", "unity"].includes(p.project.engine)) {
    p.manifest = await json(
      `public/games/${p.project.id}/${p.project.version}/kutarya-manifest.json`,
    );
    p.acceptance = await json(p.proof);
    assert(
      p.acceptance.passed &&
        p.acceptance.gameId === p.project.id &&
        p.acceptance.version === p.project.version,
    );
    assert.equal(p.manifest.entry, p.project.runtime);
    for (const f of p.manifest.files) {
      const target = resolve(
        `public/games/${p.project.id}/${p.project.version}`,
        f.path,
      );
      assert(
        target.startsWith(
          resolve(`public/games/${p.project.id}/${p.project.version}`) + "\\",
        ),
      );
      const x = await sha(createReadStream(target));
      assert.equal(x.bytes, f.bytes);
      assert.equal(x.sha256, f.sha256.toUpperCase());
    }
  }
}
async function call(op, data = {}, authenticated = true) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated)
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const r = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: { op, ...data } }),
  });
  const j = await r.json();
  assert(r.ok && !j.error, j.error?.message || op);
  return j.result;
}
async function version(p) {
  const docs = await listCollection("gamesCatalog"),
    doc = docs.find((d) => d.name.endsWith("/" + p.project.id));
  assert(doc);
  const data = Object.fromEntries(
    Object.entries(doc.fields).map(([k, v]) => [k, decodeValue(v)]),
  );
  if ((data.versions || []).some((v) => v.id === p.project.version)) return;
  const versions = [
    ...(data.versions || []),
    {
      id: p.project.version,
      runtime: p.project.runtime,
      verified: true,
      note: "Paket SHA/boyut ve önceki gerçek tarayıcı kabulü doğrulandı; canlı runtime yayın kabulünde kontrol edilir.",
    },
  ];
  await cloudRequest(
    `${documentsRoot}/gamesCatalog/${p.project.id}?updateMask.fieldPaths=versions&currentDocument.updateTime=${encodeURIComponent(doc.updateTime)}`,
    "PATCH",
    { fields: { versions: encodeValue(versions) } },
  );
}
const report = [];
try {
  await signInWithCustomToken(auth, process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN);
  const claims = (await auth.currentUser.getIdTokenResult()).claims;
  assert(auth.currentUser.emailVerified && claims.gamesAdmin === true);
  const before = await call("admin.data"),
    ids = projects.map((p) => p.project.id);
  const others = before.gamesCatalog.filter((g) => !ids.includes(g.id));
  for (const p of projects) {
    let old = (await call("admin.data")).gamesCatalog.find(
      (g) => g.id === p.project.id,
    );
    if (!old) {
      await call("admin.game", { game: p.project });
      old = (await call("admin.data")).gamesCatalog.find(
        (g) => g.id === p.project.id,
      );
    }
    for (const f of p.files) {
      const existing = old.files.find(
        (x) =>
          x.name === f.name &&
          x.version === p.project.version &&
          x.role === f.role &&
          x.platform === f.platform,
      );
      if (existing) {
        assert.equal(existing.size, f.bytes);
        f.id = existing.id;
        continue;
      }
      const t = await call("admin.fileBegin", {
        gameId: p.project.id,
        name: f.name,
        size: f.bytes,
        role: f.role,
        platform: f.platform,
        version: p.project.version,
      });
      try {
        const upload = uploadBytesResumable(
          ref(storage, t.path),
          await readFile(resolve(p.folder, f.name)),
          { contentType: "application/octet-stream" },
        );
        await new Promise((done, fail) =>
          upload.on("state_changed", () => {}, fail, done),
        );
        f.id = (
          await call("admin.fileComplete", {
            gameId: p.project.id,
            fileId: t.fileId,
          })
        ).file.id;
      } catch (error) {
        await call("admin.fileAbort", {
          gameId: p.project.id,
          fileId: t.fileId,
        }).catch(() => {});
        throw error;
      }
      console.log(`${p.project.title}: ${f.name} yüklendi.`);
    }
    const urls = [];
    if (old.cover && (old.gallery || []).length === p.images.length - 1)
      urls.push(old.cover, ...old.gallery);
    else
      for (const path of p.images) {
        const b = await readFile(path);
        urls.push(
          (
            await call("admin.cover", {
              mime: path.endsWith(".png") ? "image/png" : "image/jpeg",
              base64: b.toString("base64"),
            })
          ).url,
        );
      }
    if (p.manifest) await version(p);
    await call("admin.game", {
      game: {
        ...p.project,
        cover: urls[0],
        gallery: urls.slice(1),
        status: "published",
      },
    });
    for (const f of p.files) {
      const { url } = await call(
        "download",
        { gameId: p.project.id, fileId: f.id },
        false,
      );
      assert.equal(
        new URL(url).origin,
        "https://firebasestorage.googleapis.com",
      );
      const r = await fetch(url);
      assert(r.ok);
      const x = await sha(r.body);
      assert.equal(x.bytes, f.bytes);
      assert.equal(x.sha256, f.sha256);
    }
    for (const [i, url] of urls.entries()) {
      const r = await fetch(url);
      assert(r.ok);
      assert.deepEqual(
        await sha(r.body),
        await sha(createReadStream(p.images[i])),
      );
    }
    report.push({
      id: p.project.id,
      version: p.project.version,
      files: p.files.map((f) => ({
        name: f.name,
        bytes: f.bytes,
        sha256: f.sha256,
      })),
      images: urls.length,
      downloadVerified: true,
    });
  }
  const after = await call("admin.data");
  assert.deepEqual(
    after.gamesCatalog.filter((g) => !ids.includes(g.id)),
    others,
  );
  await writeFile(
    "artifacts/release-2026-10-07/catalog-upload.json",
    JSON.stringify(
      {
        at: new Date().toISOString(),
        projectId: "kutarya-ai-3169",
        projects: report,
        listeningServerStarted: false,
        passwordRequested: false,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `${report.length} önceki gerçek proje Firebase'e aktarıldı; tüm paketler/görseller SHA ile indirildi.`,
  );
} finally {
  await signOut(auth).catch(() => {});
  await deleteApp(app);
}
