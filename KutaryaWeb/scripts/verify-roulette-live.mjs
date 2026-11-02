// Son kabul: gerçek HTTPS, gerçek dosya düğmesi, 1280/390 ve katalog/SEO bütünlüğü.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { unzipSync } from 'fflate';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { out, gameId, version, runtimePath } from './roulette-paths.mjs';
const base = 'https://kutarya.com', endpoint = 'https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService', sha = b => createHash('sha256').update(b).digest('hex');
const manifest = JSON.parse(await readFile(`${out}/package.json`, 'utf8')), seo = JSON.parse(await readFile('artifacts/seo-2026-10-07/build.json', 'utf8')), images = JSON.parse(await readFile(`${out}/images.json`, 'utf8'));
async function api(op, fields = {}) { const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { op, ...fields } }) }), body = await r.json(); assert(r.ok && !body.error, op); return body.result; }
const catalog = await api('catalog'), game = catalog.games.find(g => g.id === gameId); assert(game); assert.equal(game.version, version); assert.equal(game.status, 'published'); assert.equal(game.runtime, runtimePath); assert.equal(game.files.filter(f => f.version === version).length, 1);
const proof = { at: new Date().toISOString(), url: `${base}/proje/${gameId}`, play: `${base}/oyna/${gameId}`, projects: catalog.games.length, version, html: [], runtime: [], views: [], downloads: [], listeningServerStarted: false, physicalDeviceTested: false };
for (const page of seo.pages) { const r = await fetch(base + page.path); assert.equal(r.status, 200, page.path); assert.equal(sha(Buffer.from(await r.arrayBuffer())), page.sha256, page.path); proof.html.push({ path: page.path, sha256MatchesBuild: true }); }
for (const name of ['sitemap.xml', 'robots.txt']) { const r = await fetch(base + '/' + name); assert.equal(sha(Buffer.from(await r.arrayBuffer())), sha(await readFile('dist/' + name))); }
for (const name of ['index.html', 'OKU.txt', 'kutarya-manifest.json']) { const r = await fetch(base + runtimePath.replace('index.html', name)); assert.equal(r.status, 200); assert.equal(sha(Buffer.from(await r.arrayBuffer())), sha(await readFile(`public/games/${gameId}/${version}/${name}`))); proof.runtime.push({ name, sha256Matches: true }); }
for (const image of images) { const r = await fetch(base + '/' + image.path.replace(/^public\//, '')); assert.equal(sha(Buffer.from(await r.arrayBuffer())), image.sha256); }
assert((await (await fetch(base + '/sitemap.xml')).text()).includes(base + '/proje/' + gameId));
const denied = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: { op: 'admin.data' } }) }); assert.equal(denied.status, 401);
assert((await fetch(base + '/ozel')).headers.get('x-robots-tag')?.includes('noindex'));
const browser = await chromium.launch({ channel: 'msedge', headless: true }), context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, reducedMotion: 'reduce', serviceWorkers: 'block' }), page = await context.newPage(), errors = [];
page.on('pageerror', e => errors.push(e.message)); page.setDefaultTimeout(20000);
try {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 }); await page.goto(proof.url); await page.getByRole('heading', { name: game.title, exact: true }).waitFor();
    const imgs = page.locator('.detail-cover img,.gallery img'); assert.equal(await imgs.count(), images.length);
    for (let i = 0; i < await imgs.count(); i++) await imgs.nth(i).scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('.detail-cover img,.gallery img')].every(i => i.complete && i.naturalWidth > 0));
    await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('.detail-cover img,.gallery img')].map(i => i.decode())); await document.fonts.ready; document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); await page.screenshot({ path: resolve(out, `live-project-${width}.png`) });
    await page.getByRole('tab', { name: /^Dosyalar \(/ }).click(); assert.equal(await page.locator('#project-tab > .download-row').count(), 1); assert((await page.locator('#project-tab').innerText()).includes(manifest.name));
    proof.views.push({ width, imageDecode: images.length, currentFile: manifest.name, horizontalOverflow: false });
  }
  const event = page.waitForEvent('download'); await page.locator('.download-row').filter({ hasText: manifest.name }).getByRole('button', { name: manifest.name + ' indir', exact: true }).click();
  const download = await event; assert.equal(download.suggestedFilename(), manifest.name); assert.equal(new URL(download.url()).origin, 'https://firebasestorage.googleapis.com');
  const target = resolve(out, 'live-download-' + manifest.name); await download.saveAs(target); assert.equal(await download.failure(), null); const bytes = await readFile(target); assert.equal(bytes.length, manifest.bytes); assert.equal(sha(bytes), manifest.sha256);
  const archive = unzipSync(bytes); assert.deepEqual(Object.keys(archive).sort(), ['OKU.txt', 'index.html']); for (const f of manifest.files) assert.equal(sha(archive[f.path]), f.sha256);
  proof.downloads.push({ name: manifest.name, bytes: bytes.length, sha256: sha(bytes), actualBrowserButton: true, contentsVerified: true });
  proof.oldDownloads = [];
  for (const file of game.files.filter(f => f.version !== version)) {
    const old = JSON.parse(await readFile(`artifacts/releases/${gameId}/${file.version}/package.json`, 'utf8')), link = await api('download', { gameId, fileId: file.id }), response = await fetch(link.url), bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(response.status, 200); assert.equal(bytes.length, old.bytes); assert.equal(sha(bytes), old.sha256); proof.oldDownloads.push({ version: file.version, bytes: bytes.length, sha256Matches: true });
  }
  await page.goto(base + '/projeler'); await page.getByRole('heading', { name: /Projeler|proje/i }).first().waitFor(); assert((await page.locator('main').innerText()).includes(game.title));
  assert.deepEqual(errors, []); proof.rendererErrors = errors; proof.passed = true; proof.anonymousAdminDenied = true; proof.privateNoindexPreserved = true;
  await writeFile(`${out}/live-site-acceptance.json`, JSON.stringify(proof, null, 2), { flag: 'wx' }); await writeFile(`${out}/seo-build.json`, JSON.stringify(seo, null, 2), { flag: 'wx' }); console.log(JSON.stringify({ ...proof, html: proof.html.length }));
} finally { await browser.close(); }
