// Yayından önce mevcut Hosting sürümü ve yalnız katalog koleksiyonları yedeklenir.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import {
  cloudGet,
  cloudAdmin,
  projectId,
  listCollection,
} from "./firebase-cloud.mjs";
const out = "artifacts/release-2026-10-07";
await mkdir(out, { recursive: true });
const project = await cloudGet(
  `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`,
);
assert.equal(project.projectId, projectId);
const releases = await cloudGet(
  `https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`,
);
const current =
  releases.releases?.find((r) => r.type === "DEPLOY") || releases.releases?.[0];
assert(current?.version?.name, "Mevcut Hosting sürümü bulunamadı.");
const version = await cloudGet(
  `https://firebasehosting.googleapis.com/v1beta1/${current.version.name}`,
);
const functions = await cloudGet(
  `https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`,
);
const { auth } = await cloudAdmin();
const user = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(user.emailVerified, "Mevcut admin hesabı doğrulanmamış.");
await writeFile(
  `${out}/hosting-before.json`,
  JSON.stringify(
    {
      at: new Date().toISOString(),
      projectId,
      displayName: project.name,
      release: current,
      version,
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  `${out}/admin-before.json`,
  JSON.stringify(
    {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims || {},
    },
    null,
    2,
  ) + "\n",
);
await writeFile(
  `${out}/functions-before.json`,
  JSON.stringify(
    functions.functions?.map((f) => ({
      name: f.name,
      state: f.state,
      uri: f.serviceConfig?.uri,
      runtime: f.buildConfig?.runtime,
    })),
    null,
    2,
  ) + "\n",
);
const collections = [
  "gamesCatalog",
  "gameCategories",
  "gameAnnouncements",
  "gameSiteSettings",
  "projectSlugs",
];
const counts = {};
for (const c of collections) {
  const docs = await listCollection(c);
  await writeFile(
    `${out}/${c}-before.json`,
    JSON.stringify(docs, null, 2) + "\n",
  );
  counts[c] = docs.length;
}
console.log(
  JSON.stringify({
    projectId,
    displayName: project.name,
    hostingVersion: current.version.name,
    functionNames: functions.functions?.map((f) => f.name.split("/").at(-1)),
    collections: counts,
    adminVerified: user.emailVerified,
    backup: out,
    passwordRequested: false,
  }),
);
