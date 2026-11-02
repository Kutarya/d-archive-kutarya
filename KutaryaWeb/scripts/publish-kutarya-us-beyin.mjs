// Mevcut admin/Storage hattı; yalnız seçilen kaynak paketi ve katalog kaydı.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { zipSync, unzipSync } from "fflate";
import {
  kutaryaUsBeyin,
  kutaryaUsBeyinPackage,
} from "../projects-src/kutarya-us-beyin.mjs";
import { normalizeGame, fileSpec } from "../functions/policy.js";

const mode = process.argv[2];
assert(["prepare", "backup", "upload", "verify"].includes(mode));
const profile = process.argv[3];
assert(profile === undefined || profile === "kty-step10000");
const checkpointRelease = profile === "kty-step10000";
const checkpointProject = checkpointRelease
  ? await import("../projects-src/kutarya-us-kty-1-0.mjs")
  : null;
const project = checkpointProject?.kutaryaKtyCheckpoint || kutaryaUsBeyin;
const spec =
  checkpointProject?.kutaryaKtyCheckpointPackage || kutaryaUsBeyinPackage;
const out = resolve(
  checkpointRelease
    ? "artifacts/release-2026-10-09-kty-step10000"
    : "artifacts/release-2026-10-09-kutarya-us-beyin",
);
const siteUrl = `https://kutarya.com/proje/${project.slug}`;
const endpoint =
  "https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService";
const bucket = "kutarya-ai-3169.firebasestorage.app";
const json = async (name) =>
  JSON.parse(await readFile(resolve(out, name), "utf8"));
const record = async (name, value) =>
  writeFile(resolve(out, name), JSON.stringify(value, null, 2) + "\n");
const digest = (bytes) =>
  createHash("sha256").update(bytes).digest("hex").toUpperCase();
async function fileDigest(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex").toUpperCase();
}
await mkdir(out, { recursive: true });

function inspectArchive(bytes, source, manifest) {
  const entries = unzipSync(bytes);
  if (checkpointRelease) {
    assert.equal(manifest.step, 10000);
    assert.equal(manifest.parameters, 50055680);
    assert.equal(manifest.trainingDataIncluded, false);
    assert.equal(manifest.inferenceOnly, true);
    assert.deepEqual(Object.keys(entries), manifest.entries);
    for (const item of manifest.fileMetadata) {
      assert.equal(entries[item.name].length, item.bytes);
      assert.equal(digest(entries[item.name]), item.sha256);
    }
    assert.deepEqual(manifest.entries, [
      "kty-1.0-step10000.pt",
      "model.py",
      "tokenizer.py",
      "config.py",
      "generate.py",
      "README.md",
      "requirements.txt",
      "manifest.json",
    ]);
    return;
  }
  assert.deepEqual(
    Object.keys(entries),
    [spec.source],
    "Paket yalnız Python beyni içermeli.",
  );
  assert.deepEqual(
    Buffer.from(entries[spec.source]),
    source,
    "Paket içindeki kod aslıyla aynı olmalı.",
  );
}

if (mode === "prepare") {
  if (checkpointRelease) {
    const manifest = await json("package.json");
    const acceptance = await json("local-acceptance.json");
    assert(
      acceptance.strictLoadPassed &&
        acceptance.weightsIdenticalToOriginal &&
        acceptance.cliGenerationPassed &&
        acceptance.originalUnchanged,
    );
    const bytes = await readFile(resolve(out, spec.name));
    assert.equal(digest(bytes), manifest.sha256);
    assert.equal(await fileDigest(spec.source), manifest.source.sha256);
    inspectArchive(bytes, null, manifest);
    normalizeGame(project, null, [project.category]);
    fileSpec({ ...spec, size: bytes.length, version: project.version });
    console.log(
      JSON.stringify({
        prepared: spec.name,
        bytes: bytes.length,
        parameters: manifest.parameters,
        step: manifest.step,
        siteUrl,
      }),
    );
  } else {
    const source = await readFile(spec.source);
    let bytes;
    try {
      bytes = await readFile(resolve(out, spec.name));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (bytes) inspectArchive(bytes, source);
    else {
      bytes = Buffer.from(zipSync({ [spec.source]: source }, { level: 9 }));
      inspectArchive(bytes, source);
      await writeFile(resolve(out, spec.name), bytes);
    }
    const normalized = normalizeGame(project, null, [project.category]);
    assert.equal(normalized.kind, "source");
    fileSpec({ ...spec, size: bytes.length, version: project.version });
    await record("package.json", {
      gameId: project.id,
      version: project.version,
      name: spec.name,
      bytes: bytes.length,
      sha256: digest(bytes),
      source: {
        name: spec.source,
        bytes: source.length,
        sha256: digest(source),
      },
      entries: [spec.source],
      trainingDataIncluded: false,
      trainedWeightsIncluded: false,
    });
    console.log(
      JSON.stringify({
        prepared: spec.name,
        bytes: bytes.length,
        entries: [spec.source],
        siteUrl,
      }),
    );
  }
} else {
  const cloud = await import("./firebase-cloud.mjs");
  const {
    cloudGet,
    cloudRequest,
    cloudAdmin,
    listCollection,
    projectId,
    operatorEmail,
    decodeValue,
  } = cloud;
  assert.equal(projectId, "kutarya-ai-3169");
  const { auth: adminAuth } = await cloudAdmin();
  const admin = await adminAuth.getUserByEmail("kutaryaai@gmail.com");
  assert(
    admin.emailVerified && admin.customClaims?.gamesAdmin === true,
    "Mevcut doğrulanmış gamesAdmin hesabı gerekli.",
  );

  async function functionsSnapshot() {
    const data = await cloudGet(
      `https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`,
    );
    return data.functions
      .map((f) => ({
        name: f.name,
        state: f.state,
        uri: f.serviceConfig?.uri,
        runtime: f.buildConfig?.runtime,
        updateTime: f.updateTime,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  async function rulesSnapshot() {
    const firestore = await cloudGet(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
    );
    const releases = await cloudGet(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`,
    );
    const storage = releases.releases.find(
      (r) => r.name.includes("firebase.storage/") && r.name.endsWith(bucket),
    );
    assert(firestore.rulesetName && storage?.rulesetName);
    return { firestore: firestore.rulesetName, storage: storage.rulesetName };
  }
  async function hostingSnapshot() {
    const data = await cloudGet(
      `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`,
    );
    const release = data.releases.find((r) => r.type === "DEPLOY");
    assert(release?.version?.name);
    const version = await cloudGet(
      `https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`,
    );
    return { release, version };
  }

  if (mode === "backup") {
    const [hosting, functions, rules] = await Promise.all([
      hostingSnapshot(),
      functionsSnapshot(),
      rulesSnapshot(),
    ]);
    const collections = {};
    for (const name of [
      "gamesCatalog",
      "gameCategories",
      "gameAnnouncements",
      "gameSiteSettings",
      "projectSlugs",
    ])
      collections[name] = await listCollection(name);
    await record("before.json", {
      at: new Date().toISOString(),
      projectId,
      hosting,
      functions,
      rules,
      collections,
      admin: {
        uid: admin.uid,
        emailVerified: admin.emailVerified,
        customClaims: admin.customClaims,
      },
    });
    console.log(
      JSON.stringify({
        backup: out,
        hosting: hosting.release.version.name,
        existingProjects: collections.gamesCatalog.length,
        functions: functions.length,
      }),
    );
  }

  if (mode === "upload") {
    assert.equal(
      process.env.KUTARYA_RELEASE_APPROVED,
      "true",
      "Kullanıcının yayın talimatı gerekli.",
    );
    const before = await json("before.json");
    const manifest = await json("package.json");
    const bytes = await readFile(resolve(out, spec.name)),
      source = checkpointRelease ? null : await readFile(spec.source);
    assert.equal(digest(bytes), manifest.sha256);
    assert.equal(await fileDigest(spec.source), manifest.source.sha256);
    inspectArchive(bytes, source, manifest);

    // Kısa ömürlü token bellekte kalır. Yalnız gerekli geçici imza izni kaldırılır.
    const resource = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com`;
    const role = "roles/iam.serviceAccountTokenCreator",
      member = `user:${operatorEmail}`;
    const policy = await cloudRequest(
      resource + ":getIamPolicy?options.requestedPolicyVersion=3",
      "POST",
    );
    const already = (policy.bindings || []).some(
      (b) => b.role === role && !b.condition && b.members?.includes(member),
    );
    let added = false,
      customToken;
    await record("iam-before.json", { resource, policy, already });
    try {
      if (!already) {
        const updated = structuredClone(policy);
        updated.bindings ??= [];
        const binding = updated.bindings.find(
          (b) => b.role === role && !b.condition,
        );
        if (binding) binding.members.push(member);
        else updated.bindings.push({ role, members: [member] });
        added = true;
        await cloudRequest(resource + ":setIamPolicy", "POST", {
          policy: updated,
        });
      }
      for (let attempt = 0; attempt < 24; attempt++) {
        try {
          customToken = await adminAuth.createCustomToken(admin.uid);
          break;
        } catch (error) {
          if (attempt === 23)
            throw new Error("Mevcut admin için geçici token oluşturulamadı.");
          if (attempt % 6 === 0)
            console.log("Geçici imza yetkisinin etkinleşmesi bekleniyor.");
          await new Promise((done) => setTimeout(done, 5000));
        }
      }
    } finally {
      if (added) {
        const current = await cloudRequest(
          resource + ":getIamPolicy?options.requestedPolicyVersion=3",
          "POST",
        );
        const cleaned = {
          ...current,
          bindings: (current.bindings || [])
            .map((b) =>
              b.role === role && !b.condition
                ? { ...b, members: b.members.filter((x) => x !== member) }
                : b,
            )
            .filter((b) => b.members?.length),
        };
        const result = await cloudRequest(resource + ":setIamPolicy", "POST", {
          policy: cleaned,
        });
        assert(
          !(result.bindings || []).some(
            (b) =>
              b.role === role && !b.condition && b.members?.includes(member),
          ),
        );
      }
      await record("iam-cleanup.json", {
        at: new Date().toISOString(),
        temporaryBindingRemoved: added,
        originalBindingPreserved: already,
      });
    }
    assert(customToken);
    console.log(
      "Geçici imza izni temizlendi; mevcut admin yükleme hattı kullanılıyor.",
    );
    const { loadEnv } = await import("vite");
    const { initializeApp, deleteApp } = await import("firebase/app");
    const { getAuth, signInWithCustomToken, signOut } =
      await import("firebase/auth");
    const { getStorage, ref, uploadBytesResumable } =
      await import("firebase/storage");
    const env = loadEnv("production", process.cwd(), "VITE_");
    assert.equal(env.VITE_FIREBASE_PROJECT_ID, projectId);
    assert.notEqual(env.VITE_USE_EMULATORS, "true");
    const app = initializeApp(
      {
        apiKey: env.VITE_FIREBASE_API_KEY,
        appId: env.VITE_FIREBASE_APP_ID,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId,
        storageBucket: bucket,
      },
      checkpointRelease
        ? "kutarya-kty-checkpoint-upload"
        : "kutarya-us-source-upload",
    );
    const auth = getAuth(app),
      storage = getStorage(app);
    async function call(op, data = {}, authenticated = true) {
      const headers = { "Content-Type": "application/json" };
      if (authenticated)
        headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ data: { op, ...data } }),
      });
      const body = await response.json();
      assert(
        response.ok && !body.error,
        body.error?.message || `gamesService HTTP ${response.status}`,
      );
      return body.result;
    }
    try {
      await signInWithCustomToken(auth, customToken);
      assert(
        auth.currentUser.emailVerified &&
          (await auth.currentUser.getIdTokenResult()).claims.gamesAdmin ===
            true,
      );
      const initial = await call("admin.data");
      const others = initial.gamesCatalog.filter((g) => g.id !== project.id);
      assert(initial.gameCategories.some((c) => c.id === project.category));
      let old = initial.gamesCatalog.find((g) => g.id === project.id);
      if (!old) {
        await call("admin.game", { game: project });
        old = (await call("admin.data")).gamesCatalog.find(
          (g) => g.id === project.id,
        );
      }
      assert.equal(old.slug, project.slug);
      assert.equal(old.version, project.version);
      let file = old.files.find(
        (f) =>
          f.name === spec.name &&
          f.version === project.version &&
          f.role === spec.role &&
          f.platform === spec.platform,
      );
      if (file) assert.equal(file.size, bytes.length);
      else {
        const ticket = await call("admin.fileBegin", {
          gameId: project.id,
          ...spec,
          version: project.version,
          size: bytes.length,
        });
        try {
          const task = uploadBytesResumable(ref(storage, ticket.path), bytes, {
            contentType: "application/octet-stream",
          });
          let nextProgress = 10;
          task.on("state_changed", (snapshot) => {
            const percent = Math.floor(
              (100 * snapshot.bytesTransferred) / snapshot.totalBytes,
            );
            if (checkpointRelease && percent >= nextProgress) {
              console.log(`Checkpoint yüklemesi: %${percent}`);
              nextProgress = Math.floor(percent / 10) * 10 + 10;
            }
          });
          await task;
          file = (
            await call("admin.fileComplete", {
              gameId: project.id,
              fileId: ticket.fileId,
            })
          ).file;
        } catch (error) {
          await call("admin.fileAbort", {
            gameId: project.id,
            fileId: ticket.fileId,
          }).catch(() => {});
          throw error;
        }
      }
      await call("admin.game", { game: { ...project, status: "published" } });
      const { url } = await call(
        "download",
        { gameId: project.id, fileId: file.id },
        false,
      );
      const parsed = new URL(url);
      assert.equal(parsed.origin, "https://firebasestorage.googleapis.com");
      assert(parsed.pathname.startsWith(`/v0/b/${bucket}/o/`));
      const download = await fetch(url);
      assert(download.ok);
      assert(download.headers.get("content-disposition")?.includes(spec.name));
      const downloaded = Buffer.from(await download.arrayBuffer());
      assert.equal(downloaded.length, manifest.bytes);
      assert.equal(digest(downloaded), manifest.sha256);
      inspectArchive(downloaded, source, manifest);
      const after = await call("admin.data");
      assert.deepEqual(
        after.gamesCatalog.filter((g) => g.id !== project.id),
        others,
        "Diğer projeler değişti.",
      );
      assert.deepEqual(after.gameCategories, initial.gameCategories);
      assert.deepEqual(after.gameSiteSettings, initial.gameSiteSettings);
      const current = after.gamesCatalog.find((g) => g.id === project.id);
      assert.equal(current.status, "published");
      assert.equal(current.files.length, 1);
      const publicCatalog = await call("catalog", {}, false);
      assert(
        publicCatalog.games.some(
          (g) => g.id === project.id && g.kind === "source",
        ),
      );
      await record("upload.json", {
        at: new Date().toISOString(),
        projectId,
        siteUrl,
        gameId: project.id,
        fileId: file.id,
        name: spec.name,
        bytes: downloaded.length,
        sha256: digest(downloaded),
        source: manifest.source,
        entries: manifest.entries,
        ...(checkpointRelease
          ? {
              step: manifest.step,
              parameters: manifest.parameters,
              trainingDataIncluded: false,
              weightsIdenticalToOriginal: true,
            }
          : {}),
        otherProjectsUnchanged: others.map((g) => g.id),
        publicProjectCount: publicCatalog.games.length,
        sourceUnchanged: true,
        trainingPerformed: false,
        listeningServerStarted: false,
      });
      assert.equal(before.projectId, projectId);
      console.log(
        JSON.stringify({
          uploaded: spec.name,
          siteUrl,
          bytes: downloaded.length,
          archiveAndSourceVerified: true,
          otherProjectsUnchanged: others.length,
        }),
      );
    } finally {
      await signOut(auth).catch(() => {});
      await deleteApp(app);
    }
  }

  if (mode === "verify") {
    const before = await json("before.json"),
      upload = await json("upload.json");
    const [functions, rules, hosting] = await Promise.all([
      functionsSnapshot(),
      rulesSnapshot(),
      hostingSnapshot(),
    ]);
    assert.deepEqual(functions, before.functions);
    assert.deepEqual(rules, before.rules);
    assert.equal(admin.emailVerified, before.admin.emailVerified);
    assert.deepEqual(admin.customClaims, before.admin.customClaims);
    const catalog = await listCollection("gamesCatalog");
    assert.deepEqual(
      catalog.filter((d) => d.name.split("/").at(-1) !== project.id),
      before.collections.gamesCatalog.filter(
        (d) => d.name.split("/").at(-1) !== project.id,
      ),
    );
    for (const name of [
      "gameCategories",
      "gameAnnouncements",
      "gameSiteSettings",
    ])
      assert.deepEqual(await listCollection(name), before.collections[name]);
    const current = catalog.find(
      (d) => d.name.split("/").at(-1) === project.id,
    );
    assert(current && decodeValue(current.fields.status) === "published");
    const htmlResponse = await fetch(siteUrl);
    assert.equal(htmlResponse.status, 200);
    const html = await htmlResponse.text();
    assert(html.includes(project.title) && html.includes(spec.name));
    assert(html.includes(`rel="canonical" href="${siteUrl}"`));
    assert(html.includes('id="kutarya-schema"'));
    const sitemap = await fetch("https://kutarya.com/sitemap.xml");
    assert((await sitemap.text()).includes(`<loc>${siteUrl}</loc>`));
    assert.equal(await fileDigest(spec.source), upload.source.sha256);
    const proof = {
      at: new Date().toISOString(),
      passed: true,
      siteUrl,
      hostingVersion: hosting.release.version.name,
      priorHostingVersion: before.hosting.release.version.name,
      functionsUnchanged: functions.length,
      rulesUnchanged: true,
      adminClaimsUnchanged: true,
      otherProjectsUnchanged: before.collections.gamesCatalog.length,
      sourceUnchanged: true,
      sitemapVerified: true,
      staticProductPageVerified: true,
      trainingPerformed: false,
      listeningServerStarted: false,
    };
    await record("cloud-acceptance.json", proof);
    console.log(JSON.stringify(proof));
  }
}
