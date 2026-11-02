// Bu betik yalnız demo emülatörüne yazar. Canlı yayın değildir.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
} from "firebase/storage";
import { userGames } from "../games-src/projects.mjs";
import {
  arenaReleaseDirectory as arenaFolder,
  arenaVersion,
} from "./arena-release-paths.mjs";
const stage = process.argv[2];
const only = process.argv.find((arg) => arg.startsWith("--game="))?.slice(7);
assert(!only || userGames.some((game) => game.id === only), "Bilinmeyen oyun.");
assert(
  ["draft", "publish"].includes(stage),
  "draft veya publish aşamasını seç.",
);
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
  await readFile("artifacts/local-credentials.json", "utf8"),
).find((a) => a.role === "admin");
await signInWithEmailAndPassword(auth, account.email, account.password);
async function call(op, data = {}) {
  const token = await auth.currentUser.getIdToken();
  const res = await fetch(
    "http://127.0.0.1:5005/demo-kutarya-games/europe-west1/gamesService",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: { op, ...data } }),
    },
  );
  const json = await res.json();
  assert(res.ok, json.error?.message || op);
  return json.result;
}
const existing = (await call("admin.data")).gamesCatalog;
const report = [];
for (const project of userGames.filter((game) => !only || game.id === only)) {
  const old = existing.find((g) => g.id === project.id);
  if (stage === "draft") {
    if (!old) await call("admin.game", { game: project });
    continue;
  }
  assert(old, "Önce draft aşamasını çalıştır.");
  const arena2 = project.id === "pixelgun" && project.version === arenaVersion;
  const proofPath = arena2
    ? `${arenaFolder}/browser-acceptance.json`
    : `artifacts/user-games/${project.id}-browser.json`;
  const proof = JSON.parse(await readFile(proofPath, "utf8"));
  assert(
    proof.passed &&
      proof.gameId === project.id &&
      proof.version === project.version,
    "Gerçek tarayıcı kabulü gerekli.",
  );
  if (!old.versions.some((v) => v.id === project.version)) {
    const r = spawnSync(
      process.execPath,
      [
        "scripts/operator.mjs",
        "register-version",
        "demo-kutarya-games",
        `public/games/${project.id}/${project.version}/kutarya-manifest.json`,
        proofPath,
      ],
      { encoding: "utf8" },
    );
    assert(r.status === 0, r.stderr);
    console.log(r.stdout.trim());
  }
  let cover = old.cover;
  if (!cover || process.argv.includes("--refresh-covers"))
    cover = (
      await call("admin.cover", {
        mime: arena2 ? "image/png" : "image/jpeg",
        base64: (
          await readFile(
            arena2
              ? `public/media/games/pixelgun/${arenaVersion}/kapak.png`
              : `public/media/games/${project.id}.jpg`,
          )
        ).toString("base64"),
      })
    ).url;
  const name = arena2
    ? `Kutarya-Block-Arena-${arenaVersion}.zip`
    : `kutarya-${project.id}-${project.version}.zip`;
  let file = old.files.find((f) => f.name === name);
  if (!file) {
    const bytes = await readFile(
      arena2 ? `${arenaFolder}/${name}` : `artifacts/user-games/${name}`,
    );
    const ticket = await call("admin.fileBegin", {
      gameId: project.id,
      name,
      size: bytes.length,
      version: project.version,
      role: "portable",
      platform: "web",
    });
    await uploadBytes(ref(storage, ticket.path), bytes, {
      contentType: "application/octet-stream",
    });
    file = (
      await call("admin.fileComplete", {
        gameId: project.id,
        fileId: ticket.fileId,
      })
    ).file;
  }
  await call("admin.game", {
    game: { ...project, cover, status: "published" },
  });
  report.push({
    id: project.id,
    fileId: file.id,
    name,
    cover,
    version: project.version,
  });
  console.log(`${project.title}: oynama, kapak ve ZIP kaydedildi.`);
}
const settings = (await call("catalog")).settings;
await call("admin.settings", {
  settings: { ...settings, contact: "kutaryaai@gmail.com" },
});
if (stage === "publish")
  await writeFile(
    "artifacts/user-games/local-install.json",
    JSON.stringify(
      { at: new Date().toISOString(), productionChanged: false, games: report },
      null,
      2,
    ),
  );
process.exit(0);
