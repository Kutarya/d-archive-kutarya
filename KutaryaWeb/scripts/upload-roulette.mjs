// Var olan admin/dosya hattı; diğer projelere ve Auth sözleşmesine dokunulmaz.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadEnv } from 'vite';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { listCollection, decodeValue, encodeValue, cloudRequest, documentsRoot, accessToken } from './firebase-cloud.mjs';
import { roulette } from '../projects-src/rus-ruleti.mjs';
import { out, version, gameId } from './roulette-paths.mjs';
const stage = process.argv[2]; assert(['upload', 'activate'].includes(stage));
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, 'true'); assert(process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN);
for (const name of ['rules', 'protocol', 'browser', 'local-iframe']) assert(JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')).passed);
const manifest = JSON.parse(await readFile(`${out}/package.json`, 'utf8')), images = JSON.parse(await readFile(`${out}/images.json`, 'utf8'));
const hash = b => createHash('sha256').update(b).digest('hex'), bytes = await readFile(`${out}/${manifest.name}`); assert.equal(hash(bytes), manifest.sha256);
const env = loadEnv('production', process.cwd(), 'VITE_'); assert.equal(env.VITE_FIREBASE_PROJECT_ID, 'kutarya-ai-3169'); assert.notEqual(env.VITE_USE_EMULATORS, 'true');
const app = initializeApp({ apiKey: env.VITE_FIREBASE_API_KEY, projectId: env.VITE_FIREBASE_PROJECT_ID, storageBucket: 'kutarya-ai-3169.firebasestorage.app' }, 'son-tur-release'), auth = getAuth(app), storage = getStorage(app);
const endpoint = 'https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService';
async function call(op, data = {}, authenticated = true) {
  const headers = { 'Content-Type': 'application/json' }; if (authenticated) headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  const r = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ data: { op, ...data } }) }), body = await r.json(); assert(r.ok && !body.error, body.error?.message || op); return body.result;
}
try {
  await signInWithCustomToken(auth, process.env.KUTARYA_UPLOAD_CUSTOM_TOKEN); assert(auth.currentUser.emailVerified && (await auth.currentUser.getIdTokenResult()).claims.gamesAdmin);
  const before = await call('admin.data'), others = before.gamesCatalog.filter(g => g.id !== gameId), old = before.gamesCatalog.find(g => g.id === gameId);
  if (stage === 'upload') {
    assert(!old || old.status === 'draft' || old.version !== version, 'Aynı sürüm üzerine yükleme yapılmaz.');
    if (!old) await call('admin.game', { game: roulette });
    let file = old?.files.find(f => f.name === manifest.name && f.version === version);
    if (!file) {
      const ticket = await call('admin.fileBegin', { gameId, name: manifest.name, size: bytes.length, version, role: 'portable', platform: 'web' });
      try { const task = uploadBytesResumable(ref(storage, ticket.path), bytes, { contentType: 'application/octet-stream' }); await new Promise((done, fail) => task.on('state_changed', () => {}, fail, done)); file = (await call('admin.fileComplete', { gameId, fileId: ticket.fileId })).file; }
      catch (error) { await call('admin.fileAbort', { gameId, fileId: ticket.fileId }).catch(() => {}); throw error; }
    }
    const urls = []; for (const image of images) { const b = await readFile(image.path); assert.equal(hash(b), image.sha256); urls.push((await call('admin.cover', { mime: 'image/png', base64: b.toString('base64') })).url); }
    const doc = (await listCollection('gamesCatalog')).find(d => d.name.endsWith('/' + gameId)), data = Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, decodeValue(v)]));
    const runtime = JSON.parse(await readFile(`public${roulette.runtime.replace('/index.html', '/kutarya-manifest.json')}`, 'utf8'));
    assert.deepEqual(runtime.files.toSorted((a, b) => a.path.localeCompare(b.path)), manifest.files.toSorted((a, b) => a.path.localeCompare(b.path)));
    if (!data.versions.some(v => v.id === version)) await cloudRequest(`${documentsRoot}/gamesCatalog/${gameId}?updateMask.fieldPaths=versions&currentDocument.updateTime=${encodeURIComponent(doc.updateTime)}`, 'PATCH', { fields: { versions: encodeValue([...data.versions, { id: version, runtime: roulette.runtime, verified: true, note: 'Paket SHA, gerçek bulut çok oyunculu, bot oyunu, kod/davet, mobil ve korumalı iframe kabulü geçti.' }]) } });
    const stored = data.files.find(f => f.id === file.id), credential = await accessToken(); assert(stored.path.startsWith('projectAssets/') && stored.path.includes('/' + gameId + '/'));
    // Taslak paylaşım anahtarı oluşturulmaz; operatör yalnız kendi yeni paketini okur.
    const response = await fetch(`https://storage.googleapis.com/storage/v1/b/kutarya-ai-3169.firebasestorage.app/o/${encodeURIComponent(stored.path)}?alt=media&generation=${stored.generation}`, { headers: { Authorization: `Bearer ${credential.access_token}` } }); assert(response.ok, 'Taslak paket bütünlüğü okunamadı'); const actual = Buffer.from(await response.arrayBuffer()); assert.equal(hash(actual), manifest.sha256); assert.equal(actual.length, manifest.bytes);
    for (let i = 0; i < urls.length; i++) assert.equal(hash(Buffer.from(await (await fetch(urls[i])).arrayBuffer())), images[i].sha256);
    const pending = { ...roulette, cover: urls[0], gallery: urls.slice(1), status: 'published' };
    await writeFile(`${out}/pending-catalog.json`, JSON.stringify(pending, null, 2));
    await writeFile(`${out}/upload-acceptance.json`, JSON.stringify({ passed: true, stage, at: new Date().toISOString(), gameId, fileId: file.id, name: manifest.name, bytes: manifest.bytes, sha256: manifest.sha256, images: images.length, status: old?.status || 'draft', activeVersionPreserved: old?.version || null, otherProjectsUnchanged: others.length }, null, 2));
  } else {
    for (const name of ['live-runtime', 'live-iframe', 'matchmaking']) { const proof = JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')); assert(proof.passed && proof.live, name); }
    const pending = JSON.parse(await readFile(`${out}/pending-catalog.json`, 'utf8'));
    const r = await fetch('https://kutarya.com' + pending.runtime); assert(r.ok); assert.equal(hash(Buffer.from(await r.arrayBuffer())), manifest.files.find(f => f.path === 'index.html').sha256);
    await call('admin.game', { game: pending });
  }
  const after = await call('admin.data'); assert.deepEqual(after.gamesCatalog.filter(g => g.id !== gameId), others);
  console.log(JSON.stringify({ stage, projects: after.gamesCatalog.length, othersPreserved: others.length, status: after.gamesCatalog.find(g => g.id === gameId).status }));
} finally { await signOut(auth).catch(() => {}); await deleteApp(app); }
