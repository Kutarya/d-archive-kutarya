// Ayrı başsız tarayıcı, pipe; PC üzerinde HTTP veya debug portu yok.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { out, version, runtimePath } from './roulette-paths.mjs';
const live = process.argv.includes('--live');
await mkdir(out, { recursive: true });
const readCache = { css: await readFile('games-src/rus-ruleti/style.css', 'utf8'), rules: (await readFile('games-src/rus-ruleti/rules.mjs', 'utf8')).replaceAll('export ', ''), client: await readFile('games-src/rus-ruleti/client.js', 'utf8') };
const hasService = existsSync(`${out}/service.json`);
let url;
if (live) url = 'https://kutarya.com' + runtimePath;
else {
  const prefix = 'games-src/rus-ruleti';
  const service = existsSync(`${out}/service.json`) ? JSON.parse(await readFile(`${out}/service.json`, 'utf8')) : { url: 'https://kutarya.com' };
  const html = (await readFile(`${prefix}/index.html`, 'utf8')).replace('/* @roulette-style */', () => readCache.css).replace('// @roulette-rules', () => readCache.rules).replace('// @roulette-client', () => readCache.client.replace('@roulette-endpoint', service.url));
  await writeFile(`${out}/local-preview.html`, html); url = pathToFileURL(resolve(out, 'local-preview.html')).href;
}
function failMessage(errors) { return errors.join('\n'); }
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' }), page = await context.newPage(), errors = [];
page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(15000);
const proof = { at: new Date().toISOString(), live, url, version, views: [], actions: [], listeningServerStarted: false, physicalDeviceTested: false };
const tag = live ? 'live' : 'local';
async function overflow(width, id) {
  const sample = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth })); assert(sample.scroll <= width + 1, `${id} ${width}: taşma ${sample.scroll}`); proof.views.push({ id, width, overflow: false });
}
async function take(name) { await page.screenshot({ path: resolve(out, `${tag}-${name}.png`), fullPage: true }); }
try {
  await page.goto(url); await page.waitForFunction(() => window.sonTur); assert.deepEqual(errors, [], failMessage(errors));
  for (const width of [1366, 768, 390, 320, 282, 240]) {
    await page.setViewportSize({ width, height: 900 }); await overflow(width, 'home');
    if ([1366, 390].includes(width)) await take(`home-${width}`);
    await page.locator('#help').click(); assert(await page.locator('#help-dialog').isVisible()); await overflow(width, 'help'); await page.keyboard.press('Escape'); assert(!(await page.locator('#help-dialog').isVisible()));
    await page.locator('#create').click(); assert(await page.locator('#create-dialog').isVisible()); await overflow(width, 'create'); await page.keyboard.press('Escape');
  }
  proof.actions.push('yardım/oda formu/Escape/320–1366 taşma');
  await page.setViewportSize({ width: 1366, height: 900 }); await page.locator('#player-name').fill('Yağız'); await page.getByRole('button', { name: 'Mercan', exact: true }).click();
  await page.locator('#sound').click(); assert.equal(await page.locator('#sound').getAttribute('aria-pressed'), 'true'); await page.locator('#sound').click();
  await page.locator('#practice').click(); await page.waitForFunction(() => window.sonTur.practice && window.sonTur.state.players.length === 4); assert(await page.locator('#offline-banner').isVisible());
  assert.equal(await page.locator('.player-card').count(), 4); assert((await page.locator('#players').innerText()).includes('Yağız'));
  for (const width of [1366, 390, 320, 282, 240]) { await page.setViewportSize({ width, height: 900 }); await overflow(width, 'practice-lobby'); }
  await page.locator('#start').click(); await page.waitForFunction(() => window.sonTur.state.state === 'playing'); await take('practice-320');
  await page.setViewportSize({ width: 1366, height: 900 }); await take('practice-table');
  let passed = false; const deadline = Date.now() + 160000;
  while (Date.now() < deadline && await page.evaluate(() => window.sonTur.state.state) !== 'result') {
    if (await page.locator('#pull').isEnabled()) {
      if (!passed && await page.locator('#pass').isEnabled()) { await page.locator('#pass').click(); passed = true; }
      else await page.locator('#pull').click();
    }
    await page.waitForTimeout(250);
  }
  assert.equal(await page.evaluate(() => window.sonTur.state.state), 'result'); assert(await page.locator('#result').isVisible()); await take('result');
  await page.locator('#rematch').click(); await page.waitForFunction(() => window.sonTur.state.state === 'lobby'); assert.equal(await page.locator('.player-card').count(), 4); proof.actions.push('gerçek bot oyunu/tek pas/sonuç/rövanş');
  await page.locator('[data-reaction="luck"]').click(); assert(await page.locator('.player-reaction').count());
  await page.locator('#leave').click(); assert(await page.locator('#home').isVisible());
  if (hasService) {
    await page.locator('#refresh').click(); await page.waitForFunction(() => window.sonTur.connected, { timeout: 35000 });
    const contextB = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' }), b = await contextB.newPage();
    b.on('pageerror', error => errors.push(error.message));
    try {
      await page.locator('#player-name').fill('Yağız'); await page.locator('#create').click(); await page.locator('#room-capacity').selectOption('2'); await page.locator('#public-room').check(); await page.locator('#create-room-submit').click();
      await page.waitForFunction(() => !!window.sonTur.state && !window.sonTur.practice); const code = await page.evaluate(() => window.sonTur.state.code);
      await b.goto(url + (live ? '?oda=' + code : '?oda=' + code)); await b.waitForFunction(() => !!window.sonTur); assert.equal(await b.locator('#room-code').inputValue(), code);
      await b.locator('#player-name').fill('İpek'); await b.locator('#join-form button').click();
      await b.waitForFunction(() => !!window.sonTur.state); await page.waitForFunction(() => window.sonTur.state.players.length === 2);
      assert((await page.locator('#players').innerText()).includes('İpek')); assert((await b.locator('#players').innerText()).includes('Yağız'));
      assert.equal(await page.locator('#start').isEnabled(), false); await b.locator('#ready').click(); await page.waitForFunction(() => !document.getElementById('start').disabled); await page.locator('#start').click();
      await page.waitForFunction(() => window.sonTur.state.state === 'playing'); await b.waitForFunction(() => window.sonTur.state.state === 'playing');
      await page.setViewportSize({ width: 1366, height: 900 }); await overflow(1366, 'online-table'); await take('online-table'); await b.screenshot({ path: resolve(out, `${tag}-online-mobile.png`), fullPage: true });
      const end = Date.now() + 50000;
      while (Date.now() < end && await page.evaluate(() => window.sonTur.state.state) !== 'result') {
        for (const p of [page, b]) if (await p.locator('#pull').isEnabled()) await p.locator('#pull').click();
        await page.waitForTimeout(200);
      }
      await page.waitForFunction(() => window.sonTur.state.state === 'result'); await b.waitForFunction(() => window.sonTur.state.state === 'result');
      assert.equal(await page.evaluate(() => window.sonTur.state.winner), await b.evaluate(() => window.sonTur.state.winner)); proof.actions.push('iki ayrı tarayıcı/gerçek bulut/oda kodu/Türkçe ad/hazır/aynı kazanan');
      await page.locator('#rematch').click(); await page.waitForFunction(() => window.sonTur.state.state === 'lobby'); await b.locator('#leave').click(); await page.locator('#leave').click();
    } finally { await contextB.close(); }
  }
  assert.deepEqual(errors, [], failMessage(errors)); proof.rendererErrors = errors; proof.passed = true;
  await writeFile(`${out}/${live ? 'live-runtime' : 'browser'}-acceptance.json`, JSON.stringify(proof, null, 2)); console.log(JSON.stringify(proof));
} finally { await browser.close(); }

// Üstteki kaynak bir kez okunur; hiçbir tarayıcı sunucusu başlatılmaz.
