// Yalnız salt okunur yayın yedeği/karşılaştırma; IAM, Auth, veri veya servis yazımı yok.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { cloudGet, cloudAdmin, listCollection, projectId, bucketName } from "./firebase-cloud.mjs";

const mode = process.argv[2];
assert(["before", "after"].includes(mode));
assert.equal(projectId, "kutarya-ai-3169");
const out = resolve("artifacts/release-2026-10-09-public-access");
await mkdir(out, { recursive: true });
const { auth } = await cloudAdmin();
const administrator = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(administrator.emailVerified && administrator.customClaims?.gamesAdmin === true);
const [releases, functionsResult, firestore, rulesReleases, authConfig] = await Promise.all([
  cloudGet(`https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`),
  cloudGet(`https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`),
  cloudGet(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`),
]);
const release = releases.releases.find(r => r.type === "DEPLOY");
assert(release?.version?.name);
const version = await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`);
const storage = rulesReleases.releases.find(r => r.name.includes("firebase.storage/") && r.name.endsWith(bucketName));
assert(firestore.rulesetName && storage?.rulesetName);
const functions = functionsResult.functions.map(f => ({ name: f.name, state: f.state, uri: f.serviceConfig?.uri, runtime: f.buildConfig?.runtime, updateTime: f.updateTime })).sort((a, b) => a.name.localeCompare(b.name));
assert(functions.some(f => f.name.endsWith("/gamesService") && f.state === "ACTIVE" && f.name.includes("/locations/europe-west1/")));
const collections = {};
for (const name of ["gamesCatalog", "gameCategories", "gameAnnouncements", "gameSiteSettings", "projectSlugs"])
  collections[name] = (await listCollection(name)).sort((a, b) => a.name.localeCompare(b.name));
const sourceHashes = {};
for (const file of ["src/App.tsx", "src/state.tsx", "src/components/UI.tsx", "src/pages/Auth.tsx", "src/pages/Admin.tsx", "src/pages/Player.tsx", "src/services/firebase.ts", "src/seo.mjs", "package.json", "scripts/build-seo.mjs", "scripts/deploy-release.mjs"])
  sourceHashes[file] = createHash("sha256").update(await readFile(file)).digest("hex");
const snapshot = {
  at: new Date().toISOString(), projectId, hosting: { release, version }, functions,
  rules: { firestore: firestore.rulesetName, storage: storage.rulesetName }, collections,
  admin: { uid: administrator.uid, emailVerified: administrator.emailVerified, customClaims: administrator.customClaims },
  authConfig: { authorizedDomains: authConfig.authorizedDomains, emailSignIn: authConfig.signIn?.email?.enabled },
  sourceHashes,
};
if (mode === "before") {
  const inventory = JSON.parse(await readFile("artifacts/firebase-inventory.json", "utf8"));
  assert.equal(inventory.project, projectId);
  assert(inventory.domains.items.some(d => d.name.endsWith("/kutarya.com") && d.hostState === "HOST_ACTIVE" && d.certState === "CERT_ACTIVE"));
  assert.equal(inventory.auth.emailSignIn, true);
  assert(inventory.auth.authorizedDomains.includes("kutarya.com"));
  snapshot.inventory = inventory;
  await writeFile(resolve(out, "before.json"), JSON.stringify(snapshot, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ backup: out, hosting: release.version.name, projects: collections.gamesCatalog.length, functions: functions.length, adminVerified: true, listeningServerStarted: false }));
} else {
  const before = JSON.parse(await readFile(resolve(out, "before.json"), "utf8"));
  assert.deepEqual(snapshot.functions, before.functions, "Functions servisleri değişmiş.");
  assert.deepEqual(snapshot.rules, before.rules, "Canlı kurallar değişmiş.");
  assert.deepEqual(snapshot.collections, before.collections, "Katalog veya proje verisi değişmiş.");
  assert.deepEqual(snapshot.admin, before.admin, "Yönetici UID/claim/doğrulaması değişmiş.");
  assert.deepEqual(snapshot.authConfig, before.authConfig, "Ortak Auth yapılandırması değişmiş.");
  assert.deepEqual(sourceHashes, before.sourceHashes, "Yayın sırasında kaynak değişmiş.");
  assert.notEqual(release.version.name, before.hosting.release.version.name);
  await writeFile(resolve(out, "after.json"), JSON.stringify(snapshot, null, 2) + "\n");
  const proof = { at: snapshot.at, hostingVersion: release.version.name, priorHostingVersion: before.hosting.release.version.name, onlyHostingChanged: true, functionsUnchanged: functions.length, rulesUnchanged: true, projectsUnchanged: collections.gamesCatalog.length, adminClaimsUnchanged: true, authConfigUnchanged: true, sourceUnchangedDuringPublication: true, listeningServerStarted: false };
  await writeFile(resolve(out, "cloud-acceptance.json"), JSON.stringify(proof, null, 2) + "\n");
  console.log(JSON.stringify(proof));
}
