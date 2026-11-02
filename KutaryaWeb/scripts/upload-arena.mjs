// Paket/kapak yüklenir, mevcut sürüm kayıtla doğrulanır; etkinleştirme ayrı adımdır.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadEnv } from "vite";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { userGames } from "../games-src/projects.mjs";
import {
  listCollection,
  decodeValue,
  encodeValue,
  cloudRequest,
  documentsRoot,
} from "./firebase-cloud.mjs";
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, "true");
assert(process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN);
const stage = process.argv[2];
assert(["upload", "activate"].includes(stage));
import {
  arenaReleaseDirectory as out,
  arenaVersion,
} from "./arena-release-paths.mjs";
const project = userGames.find((g) => g.id === "pixelgun");
assert.equal(project.version, arenaVersion);
const manifest = JSON.parse(await readFile(`${out}/package.json`, "utf8")),
  images = JSON.parse(await readFile(`${out}/images.json`, "utf8"));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const bytes = await readFile(`${out}/${manifest.name}`);
assert.equal(hash(bytes), manifest.sha256);
const env = loadEnv("production", process.cwd(), "VITE_");
assert.equal(env.VITE_FIREBASE_PROJECT_ID, "kutarya-ai-3169");
assert.notEqual(env.VITE_USE_EMULATORS, "true");
const app = initializeApp(
    {
      apiKey: env.VITE_FIREBASE_API_KEY,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: "kutarya-ai-3169.firebasestorage.app",
    },
    "arena-release",
  ),
  auth = getAuth(app),
  storage = getStorage(app);
const endpoint =
  "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
async function call(op, data = {}, authenticated = true) {
  const headers = { "Content-Type": "application/json" };
  if (authenticated)
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const r = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { op, ...data } }),
    }),
    j = await r.json();
  assert(r.ok && !j.error, j.error?.message || op);
  return j.result;
}
try {
  await signInWithCustomToken(auth, process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN);
  assert(
    auth.currentUser.emailVerified &&
      (await auth.currentUser.getIdTokenResult()).claims.gamesAdmin,
  );
  const before = await call("admin.data"),
    old = before.gamesCatalog.find((g) => g.id === "pixelgun"),
    others = before.gamesCatalog.filter((g) => g.id !== "pixelgun");
  assert(old);
  if (stage === "upload") {
    let existing = old.files.find(
        (f) => f.name === manifest.name && f.version === arenaVersion,
      ),
      fileId;
    if (existing) {
      assert.equal(existing.size, bytes.length);
      fileId = existing.id;
    } else {
      const t = await call("admin.fileBegin", {
        gameId: "pixelgun",
        name: manifest.name,
        size: bytes.length,
        version: arenaVersion,
        role: "portable",
        platform: "web",
      });
      try {
        const task = uploadBytesResumable(ref(storage, t.path), bytes, {
          contentType: "application/octet-stream",
        });
        await new Promise((done, fail) =>
          task.on("state_changed", () => {}, fail, done),
        );
        fileId = (
          await call("admin.fileComplete", {
            gameId: "pixelgun",
            fileId: t.fileId,
          })
        ).file.id;
      } catch (e) {
        await call("admin.fileAbort", {
          gameId: "pixelgun",
          fileId: t.fileId,
        }).catch(() => {});
        throw e;
      }
    }
    const urls = [];
    for (const image of images) {
      const b = await readFile(image.path);
      assert.equal(hash(b), image.sha256);
      urls.push(
        (
          await call("admin.cover", {
            mime: "image/png",
            base64: b.toString("base64"),
          })
        ).url,
      );
    }
    const docs = await listCollection("gamesCatalog"),
      doc = docs.find((d) => d.name.endsWith("/pixelgun"));
    const data = Object.fromEntries(
      Object.entries(doc.fields).map(([k, v]) => [k, decodeValue(v)]),
    );
    const proof = JSON.parse(
      await readFile(`${out}/browser-acceptance.json`, "utf8"),
    );
    assert(proof.passed && proof.version === arenaVersion);
    const runtime = JSON.parse(
      await readFile(
        `public/games/pixelgun/${arenaVersion}/kutarya-manifest.json`,
        "utf8",
      ),
    );
    assert.deepEqual(
      runtime.files.toSorted((a, b) => a.path.localeCompare(b.path)),
      manifest.files.toSorted((a, b) => a.path.localeCompare(b.path)),
    );
    if (!data.versions.some((v) => v.id === arenaVersion)) {
      await cloudRequest(
        `${documentsRoot}/gamesCatalog/pixelgun?updateMask.fieldPaths=versions&currentDocument.updateTime=${encodeURIComponent(doc.updateTime)}`,
        "PATCH",
        {
          fields: {
            versions: encodeValue([
              ...data.versions,
              {
                id: arenaVersion,
                runtime: project.runtime,
                verified: true,
                note: "Paket SHA, WebGL/iframe, gerçek bulut çok oyunculu, klavyeyle ad değiştirme ve kontrollü gecikme kabulü doğrulandı.",
              },
            ]),
          },
        },
      );
    }
    const downloaded = await call(
        "download",
        { gameId: "pixelgun", fileId },
        false,
      ),
      r = await fetch(downloaded.url);
    assert(r.ok);
    const b = Buffer.from(await r.arrayBuffer());
    assert.equal(b.length, manifest.bytes);
    assert.equal(hash(b), manifest.sha256);
    for (const [i, url] of urls.entries()) {
      const r = await fetch(url),
        b = Buffer.from(await r.arrayBuffer());
      assert.equal(hash(b), images[i].sha256);
    }
    await writeFile(
      `${out}/pending-catalog.json`,
      JSON.stringify(
        {
          ...project,
          cover: urls[0],
          gallery: urls.slice(1),
          status: "published",
        },
        null,
        2,
      ),
    );
    await writeFile(
      `${out}/upload-acceptance.json`,
      JSON.stringify(
        {
          at: new Date().toISOString(),
          fileId,
          bytes: manifest.bytes,
          sha256: manifest.sha256,
          images: images.length,
          shaVerified: true,
          activeVersionPreserved: old.version,
        },
        null,
        2,
      ),
    );
    console.log(
      "Arena ZIP ve beş görüntü SHA ile yüklendi; etkin katalog sürümü henüz değiştirilmedi.",
    );
  } else {
    const pending = JSON.parse(
      await readFile(`${out}/pending-catalog.json`, "utf8"),
    );
    const r = await fetch("https://kutarya.com" + pending.runtime);
    assert(r.ok);
    assert.equal(
      hash(Buffer.from(await r.arrayBuffer())),
      manifest.files.find((f) => f.path === "index.html").sha256,
    );
    const live = JSON.parse(
      await readFile(`${out}/live-runtime-acceptance.json`, "utf8"),
    );
    assert(live.passed && live.live);
    const netProof = JSON.parse(
      await readFile(`${out}/live-netcode-acceptance.json`, "utf8"),
    );
    assert(netProof.passed && netProof.live);
    await call("admin.game", { game: pending });
    console.log(
      `Kutarya Block Arena ${arenaVersion} mevcut katalogda etkinleşti.`,
    );
  }
  const after = await call("admin.data");
  assert.deepEqual(
    after.gamesCatalog.filter((g) => g.id !== "pixelgun"),
    others,
  );
  for (const f of old.files)
    assert.deepEqual(
      after.gamesCatalog
        .find((g) => g.id === "pixelgun")
        .files.find((n) => n.id === f.id),
      f,
    );
} finally {
  await signOut(auth).catch(() => {});
  await deleteApp(app);
}
