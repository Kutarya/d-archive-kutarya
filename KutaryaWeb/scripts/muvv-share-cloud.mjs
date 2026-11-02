// Hosting yayını öncesi/sonrası salt okunur karşılaştırma; IAM/Auth/veri yazımı yok.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { cloudGet, cloudAdmin, listCollection, projectId, bucketName } from "./firebase-cloud.mjs";

const mode = process.argv[2];
assert(["before", "after"].includes(mode));
const out = resolve("artifacts/releases/muvv-private/0.4.0-20261012");
await mkdir(out, { recursive: true });
const { auth } = await cloudAdmin();
const administrator = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(administrator.emailVerified && administrator.customClaims?.gamesAdmin === true);
const [releases, functionsResult, firestore, rulesReleases, authConfig, domains] = await Promise.all([
  cloudGet(`https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`),
  cloudGet(`https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`),
  cloudGet(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`),
  cloudGet(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${projectId}/customDomains`),
]);
const release = releases.releases.find(r => r.type === "DEPLOY");
assert(release?.version?.name);
const version = await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`);
const domain = domains.customDomains?.find(d => d.name.endsWith("/kutarya.com"));
assert(domain && domain.hostState === "HOST_ACTIVE", "kutarya.com bu Hosting sitesinde etkin değil.");
const storage = rulesReleases.releases.find(r => r.name.includes("firebase.storage/") && r.name.endsWith(bucketName));
assert(firestore.rulesetName && storage?.rulesetName);
const functions = functionsResult.functions.map(f => ({ name: f.name, state: f.state, uri: f.serviceConfig?.uri, runtime: f.buildConfig?.runtime, updateTime: f.updateTime })).sort((a, b) => a.name.localeCompare(b.name));
assert(functions.some(f => f.name.endsWith("/gamesService") && f.state === "ACTIVE"));
const collections = {};
for (const name of ["gamesCatalog", "gameCategories", "gameAnnouncements", "gameSiteSettings", "projectSlugs"])
  collections[name] = (await listCollection(name)).sort((a, b) => a.name.localeCompare(b.name));
const sourceHashes = {};
for (const file of ["src/App.tsx", "src/state.tsx", "src/components/UI.tsx", "src/pages/Auth.tsx", "src/pages/Admin.tsx", "src/pages/Player.tsx", "src/services/firebase.ts", "src/seo.mjs", "package.json", "scripts/build-seo.mjs", "scripts/deploy-release.mjs", "firebase.json", "public/ozel.html", "public/ozel/muvv/0.4.0-20261012/page.css"])
  sourceHashes[file] = createHash("sha256").update(await readFile(file)).digest("hex");
const snapshot = {
  at: new Date().toISOString(), projectId,
  hosting: { release, version, domain: { name: domain.name, hostState: domain.hostState, certState: domain.cert?.state } },
  functions, rules: { firestore: firestore.rulesetName, storage: storage.rulesetName }, collections,
  admin: { uid: administrator.uid, emailVerified: administrator.emailVerified, customClaims: administrator.customClaims },
  authConfig: { authorizedDomains: authConfig.authorizedDomains, emailSignIn: authConfig.signIn?.email?.enabled },
  sourceHashes,
};
if (mode === "before") {
  await writeFile(resolve(out, "before.json"), JSON.stringify(snapshot, null, 2) + "\n", { flag: "wx" });
  console.log(JSON.stringify({ hosting: release.version.name, projects: collections.gamesCatalog.length, functions: functions.length, customDomainActive: true, listeningServerStarted: false }));
} else {
  const before = JSON.parse(await readFile(resolve(out, "before.json"), "utf8"));
  for (const key of ["functions", "rules", "collections", "admin", "authConfig", "sourceHashes"])
    assert.deepEqual(snapshot[key], before[key], `${key} yayın sırasında değişmiş.`);
  assert.notEqual(release.version.name, before.hosting.release.version.name);
  // Hosting REST başlıkları key/value listesi yerine nesne olarak döndürür.
  const pageHeaders = version.config.headers.find(h => h.regex?.includes("ozel"))?.headers;
  const robotsHeader = Array.isArray(pageHeaders)
    ? pageHeaders.find(h => h.key === "X-Robots-Tag")?.value
    : pageHeaders?.["X-Robots-Tag"] || pageHeaders?.["x-robots-tag"];
  assert.equal(robotsHeader, "noindex, nofollow");
  await writeFile(resolve(out, "after.json"), JSON.stringify(snapshot, null, 2) + "\n");
  const result = { at: snapshot.at, hostingVersion: release.version.name, priorHostingVersion: before.hosting.release.version.name, onlyHostingChanged: true, functionsUnchanged: functions.length, catalogEntriesUnchanged: collections.gamesCatalog.length, rulesUnchanged: true, adminAndAuthUnchanged: true, currentSourcesUnchangedDuringPublication: true, privatePageRobotsHeaderPresent: true, temporaryIamChange: false, listeningServerStarted: false };
  await writeFile(resolve(out, "cloud-acceptance.json"), JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result));
}
