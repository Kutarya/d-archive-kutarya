// Hosting öncesi/sonrası salt okunur kabul. Token/secret/IAM/Auth/veri yazımı yok.
import assert from "node:assert/strict";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createGzip } from "node:zlib";
import { createHash } from "node:crypto";
import { resolve, relative } from "node:path";
import {
  cloudGet,
  cloudAdmin,
  listCollection,
  projectId,
  bucketName,
} from "./firebase-cloud.mjs";

const mode = process.argv[2];
assert(["before", "after"].includes(mode));
assert.equal(projectId, "kutarya-ai-3169");
const out = resolve("artifacts/site-refresh/2026-10-14");
await mkdir(out, { recursive: true });
const { auth } = await cloudAdmin();
const administrator = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(
  administrator.emailVerified &&
    administrator.customClaims?.gamesAdmin === true,
);
const [
  releases,
  functionsResult,
  firestore,
  rulesReleases,
  authConfig,
  domains,
] = await Promise.all([
  cloudGet(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`,
  ),
  cloudGet(
    `https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`,
  ),
  cloudGet(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`,
  ),
  cloudGet(
    `https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`,
  ),
  cloudGet(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
  ),
  cloudGet(
    `https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${projectId}/customDomains`,
  ),
]);
const release = releases.releases.find((item) => item.type === "DEPLOY");
assert(release?.version?.name);
const version = await cloudGet(
  `https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`,
);
const domain = domains.customDomains?.find((item) =>
  item.name.endsWith("/kutarya.com"),
);
assert(
  domain?.hostState === "HOST_ACTIVE",
  "kutarya.com bu Hosting hedefinde etkin değil.",
);
assert(authConfig.authorizedDomains.includes("kutarya.com"));
const storage = rulesReleases.releases.find(
  (item) =>
    item.name.includes("firebase.storage/") && item.name.endsWith(bucketName),
);
assert(firestore.rulesetName && storage?.rulesetName);
const functions = functionsResult.functions
  .map((item) => ({
    name: item.name,
    state: item.state,
    uri: item.serviceConfig?.uri,
    runtime: item.buildConfig?.runtime,
    updateTime: item.updateTime,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
assert(
  functions.some(
    (item) => item.name.endsWith("/gamesService") && item.state === "ACTIVE",
  ),
);
const collections = {};
for (const name of [
  "gamesCatalog",
  "gameCategories",
  "gameAnnouncements",
  "gameSiteSettings",
  "projectSlugs",
])
  collections[name] = (await listCollection(name)).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
async function sources(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name);
    if (item.isDirectory()) files.push(...(await sources(path)));
    else files.push(path);
  }
  return files;
}
const sourceHashes = {};
for (const file of [
  ...(await sources(resolve("src"))),
  ...[
    "package.json",
    "package-lock.json",
    "firebase.json",
    "scripts/build-seo.mjs",
    "scripts/deploy-release.mjs",
  ].map((file) => resolve(file)),
].sort())
  sourceHashes[relative(process.cwd(), file).replaceAll("\\", "/")] =
    createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
const files = [];
let token;
do {
  const result = await cloudGet(
    `https://firebasehosting.googleapis.com/v1beta1/${release.version.name}/files?pageSize=1000${token ? `&pageToken=${encodeURIComponent(token)}` : ""}`,
  );
  files.push(...(result.files || []));
  token = result.nextPageToken;
} while (token);
assert(files.length > 0, "Hosting dosya manifesti alınamadı.");
const immutable = files
  .filter(
    (file) =>
      /^\/(games|media|ozel)\//.test(file.path) || file.path === "/ozel.html",
  )
  .map((file) => ({ path: file.path, hash: file.hash }))
  .sort((a, b) => a.path.localeCompare(b.path));
assert(immutable.length > 0);
const snapshot = {
  at: new Date().toISOString(),
  projectId,
  hosting: {
    release,
    version,
    domain: {
      name: domain.name,
      hostState: domain.hostState,
      certState: domain.cert?.state,
    },
  },
  functions,
  rules: { firestore: firestore.rulesetName, storage: storage.rulesetName },
  collections,
  admin: {
    uid: administrator.uid,
    emailVerified: administrator.emailVerified,
    customClaims: administrator.customClaims,
  },
  authConfig: {
    authorizedDomains: authConfig.authorizedDomains,
    emailSignIn: authConfig.signIn?.email?.enabled,
  },
  sourceHashes,
  immutable,
};
if (mode === "before") {
  // Firebase CLI dosya kimliği: gzip seviye 9 akışının SHA-256'sı.
  for (const file of immutable) {
    const target = resolve("dist", "." + file.path);
    assert(target.startsWith(resolve("dist") + "\\"));
    const digest = createHash("sha256");
    for await (const chunk of createReadStream(target).pipe(
      createGzip({ level: 9 }),
    ))
      digest.update(chunk);
    assert.equal(
      digest.digest("hex"),
      file.hash,
      `${file.path}: mevcut yayımlanmış dosya değişmiş veya eksik.`,
    );
  }
  await writeFile(
    resolve(out, "before.json"),
    JSON.stringify(snapshot, null, 2) + "\n",
    { flag: "wx" },
  );
  console.log(
    JSON.stringify({
      priorHostingVersion: release.version.name,
      customDomainActive: true,
      projects: collections.gamesCatalog.length,
      immutableFilesMatchLocalBuild: immutable.length,
      functions: functions.length,
      desktopAutomation: false,
    }),
  );
} else {
  const before = JSON.parse(
    await readFile(resolve(out, "before.json"), "utf8"),
  );
  for (const key of [
    "functions",
    "rules",
    "collections",
    "admin",
    "authConfig",
    "sourceHashes",
    "immutable",
  ])
    assert.deepEqual(
      snapshot[key],
      before[key],
      `${key} yayın sırasında değişmiş.`,
    );
  assert.notEqual(release.version.name, before.hosting.release.version.name);
  await writeFile(
    resolve(out, "after.json"),
    JSON.stringify(snapshot, null, 2) + "\n",
    { flag: "wx" },
  );
  const proof = {
    at: snapshot.at,
    hostingVersion: release.version.name,
    priorHostingVersion: before.hosting.release.version.name,
    onlyHostingChanged: true,
    functionsUnchanged: functions.length,
    catalogEntriesUnchanged: collections.gamesCatalog.length,
    immutableFilesUnchanged: immutable.length,
    rulesUnchanged: true,
    adminAndAuthUnchanged: true,
    sourceUnchangedDuringPublication: true,
    iamChanged: false,
    listeningServerStarted: false,
    desktopAutomation: false,
  };
  await writeFile(
    resolve(out, "cloud-acceptance.json"),
    JSON.stringify(proof, null, 2) + "\n",
  );
  console.log(JSON.stringify(proof));
}
