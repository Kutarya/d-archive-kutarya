// Salt okunur sürüm yedeği/kabulü. Yeni oyun dışında ortak servisler korunur.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { cloudGet, cloudRequest, cloudAdmin, listCollection, projectId, bucketName, decodeValue } from './firebase-cloud.mjs';
import { out, gameId, version } from './roulette-paths.mjs';
const phase = process.argv[2]; assert(['before', 'after'].includes(phase));
await mkdir(out, { recursive: true });
const [{ releases }, services, run, firestore, rules, domains, authConfig, iam, projectIam, { auth }] = await Promise.all([
  cloudGet(`https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`),
  cloudGet(`https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`),
  cloudGet(`https://run.googleapis.com/v2/projects/${projectId}/locations/europe-west1/services`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`),
  cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`),
  cloudGet(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${projectId}/customDomains`),
  cloudGet(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`),
  cloudRequest(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com:getIamPolicy?options.requestedPolicyVersion=3`, 'POST'),
  cloudRequest(`https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`, 'POST'),
  cloudAdmin(),
]);
const admin = await auth.getUserByEmail('kutaryaai@gmail.com'); assert(admin.emailVerified && admin.customClaims.gamesAdmin);
const domain = domains.customDomains.find(d => d.name.endsWith('/kutarya.com')); assert.equal(domain.hostState, 'HOST_ACTIVE'); assert.equal(domain.cert.state, 'CERT_ACTIVE');
const release = releases.find(r => r.type === 'DEPLOY');
const files = []; let next;
do { const r = await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/${release.version.name}/files?pageSize=1000${next ? '&pageToken=' + encodeURIComponent(next) : ''}`); files.push(...r.files || []); next = r.nextPageToken; } while (next);
const collections = {}; for (const name of ['gamesCatalog', 'gameCategories', 'gameAnnouncements', 'gameSiteSettings', 'projectSlugs']) collections[name] = (await listCollection(name)).sort((a, b) => a.name.localeCompare(b.name));
const previous = JSON.parse(await readFile('artifacts/releases/kutarya-jenerik/1.4.0/after.json', 'utf8'));
const sourceHashes = {}; for (const file of Object.keys(previous.sourceHashes)) sourceHashes[file] = createHash('sha256').update(await readFile(file)).digest('hex'); assert.deepEqual(sourceHashes, previous.sourceHashes);
const normalize = bindings => (bindings || []).map(b => ({ ...b, members: [...b.members].sort() })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
const data = {
  at: new Date().toISOString(), projectId, hosting: release, domain: { host: domain.hostState, cert: domain.cert.state },
  functions: services.functions.map(f => ({ name: f.name, updateTime: f.updateTime, state: f.state })).sort((a, b) => a.name.localeCompare(b.name)),
  run: (run.services || []).filter(s => !s.name.endsWith('/kutarya-rus-ruleti')).map(s => ({ name: s.name, generation: s.generation, updateTime: s.updateTime, revision: s.latestReadyRevision })).sort((a, b) => a.name.localeCompare(b.name)),
  rules: { firestore: firestore.rulesetName, storage: rules.releases.find(r => r.name.endsWith(bucketName)).rulesetName },
  auth: { uid: admin.uid, verified: admin.emailVerified, claims: admin.customClaims, domains: authConfig.authorizedDomains, email: authConfig.signIn?.email },
  iam: normalize(iam.bindings), projectIam: normalize(projectIam.bindings), sourceHashes, collections,
  immutable: files.filter(f => /^\/(games|media|ozel)\//.test(f.path) || f.path === '/ozel.html').map(({ path, hash }) => ({ path, hash })).sort((a, b) => a.path.localeCompare(b.path)),
};
if (phase === 'before') {
  const existing = collections.gamesCatalog.find(d => d.name.endsWith('/' + gameId)); if (existing) assert.notEqual(decodeValue(existing.fields.version), version, 'Aynı sürüm yeniden yayımlanmaz.');
  for (const f of data.immutable) { const hash = createHash('sha256'); for await (const b of createReadStream(resolve('public', '.' + f.path)).pipe(createGzip({ level: 9 }))) hash.update(b); assert.equal(hash.digest('hex'), f.hash, f.path); }
  await writeFile(`${out}/before.json`, JSON.stringify(data, null, 2), { flag: 'wx' });
} else {
  const before = JSON.parse(await readFile(`${out}/before.json`, 'utf8'));
  for (const key of ['functions', 'run', 'rules', 'auth', 'iam', 'projectIam', 'sourceHashes']) assert.deepEqual(data[key], before[key], key);
  for (const key of Object.keys(collections)) assert.deepEqual(collections[key].filter(d => !d.name.endsWith('/' + gameId)), before.collections[key].filter(d => !d.name.endsWith('/' + gameId)), key);
  for (const f of before.immutable) assert.equal(data.immutable.find(x => x.path === f.path)?.hash, f.hash, f.path);
  const doc = collections.gamesCatalog.find(d => d.name.endsWith('/' + gameId)); assert(doc);
  const game = Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, decodeValue(v)])); assert.equal(game.status, 'published'); assert.equal(game.version, version);
  const prior = before.collections.gamesCatalog.find(d => d.name.endsWith('/' + gameId)); if (prior) for (const f of decodeValue(prior.fields.files)) assert.deepEqual(game.files.find(x => x.id === f.id), f);
  const service = run.services.find(s => s.name.endsWith('/kutarya-rus-ruleti')); assert(service); assert.equal(service.scaling.maxInstanceCount, 1); assert.equal(service.template.scaling.maxInstanceCount, 1);
  assert.equal(service.scaling.minInstanceCount || 0, 0); assert.equal(service.template.scaling.minInstanceCount || 0, 0); assert.equal(service.template.containers[0].resources.limits.cpu, '1'); assert.equal(service.template.containers[0].resources.limits.memory, '256Mi'); assert.equal(service.template.timeout, '3600s'); assert(service.trafficStatuses.some(t => t.percent === 100 && service.latestReadyRevision.endsWith('/' + t.revision)));
  const runtimeSa = service.template.serviceAccount; assert(!projectIam.bindings.some(b => b.members.includes('serviceAccount:' + runtimeSa)), 'Runtime SA proje rolü aldı.');
  await writeFile(`${out}/after.json`, JSON.stringify(data, null, 2), { flag: 'wx' });
  await writeFile(`${out}/cloud-acceptance.json`, JSON.stringify({ passed: true, at: data.at, oldProjectsPreserved: before.collections.gamesCatalog.filter(d => !d.name.endsWith('/' + gameId)).length, functionsPreserved: data.functions.length, oldHostingFilesPreserved: before.immutable.length, otherRunServicesPreserved: data.run.length, rulesAuthAndIamPreserved: true, hostingVersion: release.version.name, previousHostingVersion: before.hosting.version.name, service: service.name, revision: service.latestReadyRevision, runtimeSa, runtimeProjectRoles: 0, maxInstances: 1, physicalDeviceTested: false }, null, 2), { flag: 'wx' });
}
console.log(JSON.stringify({ phase, hosting: release.version.name, projects: collections.gamesCatalog.length, immutable: data.immutable.length }));
