// Gerçek site/Provider/Player; Firebase ve WebSocket taşıması kontrollü yerel kabul.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { createGateway } from '../blackjack-server/gateway.mjs';
const out = 'artifacts/releases/blackjack/2.0.0', target = pathToFileURL(resolve(out, 'site-review/inceleme.html'));
const runtime = (await readFile(`${out}/runtime/index.html`, 'utf8')).replace("const BJ_ENDPOINT = '';", "const BJ_ENDPOINT = 'https://blackjack-review.kutarya.invalid';");
const errors = [], network = [], gateway = createGateway();
const proof = { at: new Date().toISOString(), realReactAndPlayer: true, controlledFirebase: true, controlledTransport: true, realCloud: false, listeningServerStarted: false, physicalDeviceTested: false, views: [], actions: [] };
const browser = await chromium.launch({ channel: 'msedge', headless: true });
// Playwright'ın serviceWorkers:block enjeksiyonu opak iframe'de navigator.serviceWorker
// okumasıyla SecurityError üretir. Bu tek HTML düzeneğinde servis worker yoktur.
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await context.route(/^https?:/, route => {
  if (route.request().url().startsWith('https://kutarya.com/__blackjack-review')) return route.fulfill({ status: 200, contentType: 'text/html', body: runtime });
  network.push(route.request().url()); return route.abort();
});
await context.routeWebSocket('wss://blackjack-review.kutarya.invalid/play', route => {
  const ws = { readyState: 1, bufferedAmount: 0, send: data => route.send(data), close(code, reason) { this.readyState = 3; gateway.close(this); return route.close({ code, reason }); } };
  gateway.connect(ws); route.onMessage(raw => gateway.receive(ws, raw)); route.onClose(() => { ws.readyState = 3; gateway.close(ws); });
});
const page = await context.newPage(); page.setDefaultTimeout(12000); page.on('pageerror', e => errors.push(e.message));
async function visit(path, controlledGame = true) { const url = new URL(target); url.searchParams.set('path', path); if (controlledGame) url.searchParams.set('qa-game', '1'); await page.goto(url.href); await page.waitForFunction(p => window.__reviewLocation === p && window.__reviewAuthReady, path); await page.locator('main h1').waitFor(); }
async function noOverflow(label) {
  const result = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth })); assert(result.scroll <= result.width + 1, `${label}: ${JSON.stringify(result)}`); proof.views.push({ label, width: result.width });
}
async function images() { await page.evaluate(async () => { const all = [...document.querySelectorAll('main img')]; for (const i of all) i.loading = 'eager'; await Promise.all(all.map(i => i.decode())); }); }
try {
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'warm', 'dark']) {
      for (const path of ['/', '/oyun-gecesi', '/kesif', '/duyurular']) {
        await visit(path); await page.getByLabel('Görünüm teması').selectOption(theme); await page.waitForFunction(t => document.documentElement.dataset.theme === t, theme); await images(); await noOverflow(`${path}/${theme}`);
        if ([390, 1280].includes(width) && theme === 'light') await page.screenshot({ path: resolve(out, `${{ '/': 'site-home', '/oyun-gecesi': 'site-game-night', '/kesif': 'site-discovery', '/duyurular': 'site-updates' }[path]}-${width}.png`), fullPage: true });
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 }); await visit('/oyun-gecesi'); assert.equal(await page.locator('.night-game').count(), 5);
  await page.getByRole('button', { name: 'Arkadaşlarla', exact: true }).click(); await page.waitForFunction(() => window.__reviewLocation.includes('hava=arkadaslarla'));
  assert.equal(await page.locator('.night-game').count(), 3); assert((await page.locator('.night-game-grid').innerText()).includes('Royal Night'));
  await page.getByRole('button', { name: 'Kısa bir mola', exact: true }).click(); await page.waitForFunction(() => window.__reviewLocation.includes('hava=kisa') && document.querySelectorAll('.night-game').length === 2);
  await page.getByRole('button', { name: 'Bana bir oyun seç', exact: true }).click(); await page.locator('.night-pick b').waitFor(); const first = await page.locator('.night-pick b').innerText();
  await page.getByRole('button', { name: 'Bana bir oyun seç', exact: true }).click(); await page.waitForFunction(previous => document.querySelector('.night-pick b')?.innerText !== previous, first);
  await page.getByRole('button', { name: 'Biraz keşif', exact: true }).click(); await page.waitForFunction(() => window.__reviewLocation.includes('hava=kesif') && document.querySelectorAll('.night-game').length === 1);
  assert((await page.locator('.night-game').innerText()).includes('Blok Diyarı')); proof.actions.push('gerçek beş oyun/URL filtreleri/rastgele seçicide tekrar önleme/üç tema');
  await visit('/kesif'); await page.getByRole('button', { name: /Kodun içini görmek/ }).click(); await page.waitForFunction(() => window.__reviewLocation.includes('amac=learn') && document.querySelector('.finder-result-count').textContent.includes('6 proje'));
  await page.getByLabel('Keşif platformu').selectOption('ios'); await page.locator('.finder-empty').waitFor(); assert((await page.locator('.finder-result-count').innerText()).includes('0 proje'));
  await page.getByRole('button', { name: 'Tüm cihazları göster', exact: true }).click(); await page.locator('.finder-feature').waitFor(); await page.getByRole('button', { name: /İşimi kolaylaştırmak/ }).click(); await page.waitForFunction(() => window.__reviewLocation.includes('amac=make'));
  assert.equal(await page.locator('.finder-feature-actions .button').count(), 1); await page.getByRole('button', { name: 'Seçimleri sıfırla', exact: true }).click(); await page.waitForFunction(() => window.__reviewLocation === '/kesif');
  await visit('/'); assert.equal(await page.locator('.path-card').count(), 3); await page.locator('.path-card').nth(2).click(); await page.waitForFunction(() => window.__reviewLocation.includes('/kesif?amac=learn')); proof.actions.push('üç keşif rotası/cihaz filtresi/boş sonuç/sıfırlama/ana sayfadan rota seçimi');
  await visit('/duyurular'); await page.getByLabel('Günlük proje türü').selectOption('game'); await page.waitForFunction(() => document.querySelectorAll('.release-entry').length === 5);
  await page.getByRole('searchbox', { name: 'Günlükte ara' }).fill('teslim'); await page.waitForFunction(() => document.querySelectorAll('.release-entry').length === 1); assert((await page.locator('.release-heading').innerText()).includes('Royal Night'));
  await page.locator('.release-details summary').click(); assert.equal(await page.locator('.release-details').getAttribute('open'), ''); assert((await page.locator('.release-details p').innerText()).includes('2.0.0'));
  await page.getByRole('searchbox', { name: 'Günlükte ara' }).fill(''); await page.getByRole('button', { name: 'Duyurular', exact: true }).click(); await page.locator('.news-card').waitFor(); assert.equal(await page.locator('.news-card').count(), 1); await page.getByRole('button', { name: 'Sürüm güncellemeleri', exact: true }).click(); await page.locator('.release-entry').first().waitFor(); proof.actions.push('13 gerçek sürüm notu/tür ve Türkçe arama/not açma/korunan gerçek duyuru');
  await visit('/'); await page.locator('.night-banner a').click(); await page.waitForFunction(() => window.__reviewLocation === '/oyun-gecesi');
  await page.setViewportSize({ width: 390, height: 900 }); await page.locator('.mobile-menu').click(); await page.locator('.sidebar').getByRole('link', { name: 'Oyun Gecesi', exact: true }).click(); await page.locator('.sidebar.open').waitFor({ state: 'detached' }); proof.actions.push('ana sayfa vitrini/masaüstü ve mobil gezinme');
  // Oda üst sayfanın sorgusundan gerçek Player ile sandbox iframe'e aktarılır.
  await visit('/oyna/blackjack?masa=ABC234'); await page.getByRole('button', { name: 'Oyunu yükle', exact: true }).click();
  const frame = await (await page.locator('iframe').elementHandle()).contentFrame(); await frame.waitForFunction(() => window.royalNight);
  assert.equal(await page.locator('iframe').getAttribute('sandbox'), 'allow-scripts allow-pointer-lock'); assert.equal(await frame.locator('#room-code').inputValue(), 'ABC234');
  assert((await page.getByRole('link', { name: 'Ayrı sekmede aç' }).getAttribute('href')).includes('masa=ABC234'));
  assert.equal(await frame.evaluate(() => { try { localStorage.setItem('test', '1'); return true; } catch { return false; } }), false);
  for (const width of [1280, 390, 320]) { await page.setViewportSize({ width, height: 900 }); assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false); await noOverflow('gerçek-Player'); }
  await frame.locator('#player-name').click(); await frame.locator('#player-name').press('ControlOrMeta+A'); await frame.locator('#player-name').pressSequentially('Şule İpek');
  await frame.locator('#create').click(); await frame.locator('#create-submit').click(); await frame.waitForFunction(() => window.royalNight.state?.phase === 'lobby');
  assert((await frame.locator('#players').innerText()).includes('Şule İpek')); await frame.locator('#invite').click(); assert((await frame.locator('#invite-link').inputValue()).includes('masa=')); await frame.locator('body').press('Escape');
  await page.setViewportSize({ width: 390, height: 900 }); await page.screenshot({ path: resolve(out, 'site-player-390.png'), fullPage: true });
  await frame.locator('#leave').click(); await frame.waitForFunction(() => window.royalNight.state === null);
  await frame.locator('#practice').click(); await frame.locator('#deal').click();
  if (await frame.evaluate(() => window.royalNight.state.phase === 'playing')) { await frame.locator('#status').click(); await frame.locator('body').press('s'); }
  await frame.waitForFunction(() => window.royalNight.state.phase === 'result');
  proof.actions.push('gerçek Player/korunan sandbox/davet sorgusu/Türkçe klavye/oda kurma/yerel oyunda gerçek hamle');
  await visit('/oyna/blackjack', false); await page.getByRole('button', { name: 'Oyunu yükle', exact: true }).click();
  const embedded = await (await page.locator('iframe').elementHandle()).contentFrame(); await embedded.waitForFunction(() => window.royalNight); assert((await page.locator('iframe').getAttribute('src')).startsWith('data:text/html'));
  await embedded.locator('#practice').click(); await embedded.locator('#deal').click(); if (await embedded.evaluate(() => window.royalNight.state.phase === 'playing')) await embedded.locator('#stand').click(); await embedded.waitForFunction(() => window.royalNight.state.phase === 'result'); proof.actions.push('kullanıcı önizlemesindeki gömülü Blackjack ağsız oynanır');
  assert.deepEqual(errors, []); assert.deepEqual(network, []); proof.passed = true; proof.rendererErrors = errors;
  await writeFile(`${out}/site-acceptance.json`, JSON.stringify(proof, null, 2)); console.log(JSON.stringify({ passed: true, views: proof.views.length, actions: proof.actions }));
} catch (error) { await page.screenshot({ path: resolve(out, 'site-failure.png'), fullPage: true }); await writeFile(`${out}/site-failure.json`, JSON.stringify({ error: error.message, errors, network }, null, 2)); throw error; }
finally { await browser.close(); }
