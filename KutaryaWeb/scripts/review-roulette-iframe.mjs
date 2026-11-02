import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { out, runtimePath } from './roulette-paths.mjs';
const live = process.argv.includes('--live'), catalog = process.argv.includes('--catalog'), tag = live ? catalog ? 'live-catalog' : 'live' : 'local';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const a = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' }), b = await browser.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
const diagnostic = [];
for (const p of [a, b]) p.on('console', message => { if (['warning', 'error'].includes(message.type())) diagnostic.push(message.text()); });
for (const p of [a, b]) p.on('pageerror', error => errors.push(error.message));
try {
  await a.goto(live ? 'https://kutarya.com' + runtimePath : pathToFileURL(resolve(out, 'runtime/index.html')).href);
  await a.locator('#player-name').fill('Çağrı'); await a.locator('#create').click(); await a.locator('#room-capacity').selectOption('2'); await a.locator('#create-room-submit').click();
  await a.waitForFunction(() => !!window.sonTur?.state); const code = await a.evaluate(() => window.sonTur.state.code);
  if (!catalog) {
    const html = await readFile(`${out}/runtime/index.html`, 'utf8');
    if (!live) await b.route('https://kutarya.com/__son-tur-review-frame', route => route.fulfill({ status: 200, contentType: 'text/html', body: html }));
    const frameSrc = live ? runtimePath : '/__son-tur-review-frame';
    await b.route('https://kutarya.com/__son-tur-review?*', route => route.fulfill({ status: 200, contentType: 'text/html', body: `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"><iframe title="Son Tur kabul" sandbox="allow-scripts allow-pointer-lock" allow="fullscreen;autoplay" src="${frameSrc}" style="border:0;margin:0 19px;width:calc(100vw - 38px);height:100vh"></iframe></body></html>` }));
    await b.goto('https://kutarya.com/__son-tur-review?oda=' + code);
  } else { await b.goto('https://kutarya.com/oyna/rus-ruleti?oda=' + code); await b.getByRole('button', { name: 'Oyunu yükle' }).click(); }
  const element = await b.locator('iframe').elementHandle(), frame = await element.contentFrame(); await frame.waitForFunction(() => !!window.sonTur);
  assert.equal(await b.locator('iframe').getAttribute('sandbox'), 'allow-scripts allow-pointer-lock');
  assert.equal(await frame.locator('#room-code').inputValue(), code, 'Davet kodu üst sayfanın referrer bilgisinden alınamadı.');
  await frame.locator('#player-name').click(); await frame.locator('#player-name').press('ControlOrMeta+A'); await frame.locator('#player-name').pressSequentially('İpek Şahin'); await frame.locator('#join-form button').click();
  await frame.waitForFunction(() => !!window.sonTur.state); await a.waitForFunction(() => window.sonTur.state.players.length === 2);
  assert((await a.locator('#players').innerText()).includes('İpek Şahin')); assert.equal(await frame.evaluate(() => { try { localStorage.setItem('acceptance', '1'); return 'allowed'; } catch { return 'denied'; } }), 'denied');
  await frame.locator('#copy-code').click(); await frame.locator('#toast').waitFor(); assert((await frame.locator('#toast').innerText()).includes(code));
  await frame.locator('#ready').click(); await a.locator('#start').waitFor(); await a.waitForFunction(() => !document.getElementById('start').disabled); await a.locator('#start').click();
  await a.waitForFunction(() => window.sonTur.state.state === 'playing'); await frame.waitForFunction(() => window.sonTur.state.state === 'playing');
  // Normal hareket tercihinde metal mekanizma CSS animasyonu gerçekten çalışır.
  assert.equal(await a.locator('#game-cylinder').evaluate(el => getComputedStyle(el).animationName), 'game-spin');
  for (const width of catalog ? [1280, 390, 320] : [1280, 390, 320, 278]) {
    await b.setViewportSize({ width, height: 900 }); assert.equal(await frame.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    const bounds = await frame.evaluate(() => [...document.querySelectorAll('#pull,#pass')].map(e => ({ left: e.getBoundingClientRect().left, right: e.getBoundingClientRect().right, width: innerWidth })));
    for (const bound of bounds) assert(bound.left >= 0 && bound.right <= bound.width + 1, `Düğme kesildi: ${JSON.stringify(bound)}`);
  }
  await b.setViewportSize({ width: 390, height: 900 }); await b.screenshot({ path: resolve(out, `${tag}-iframe-mobile.png`), fullPage: true });
  // Sunucu sırasındaki tarayıcıdan gerçek klavye ile pas, ardından normal çekimler.
  const deadline = Date.now() + 50000; let keyboard = false;
  while (Date.now() < deadline && await a.evaluate(() => window.sonTur.state.state) !== 'result') {
    for (const p of [a, frame]) {
      if (await p.locator('#pull').isEnabled()) {
        if (!keyboard && await p.locator('#pass').isEnabled()) { await p.locator('#turn-title').click(); await p.locator('body').press('p'); keyboard = true; }
        else await p.locator('#pull').click();
      }
    }
    await a.waitForTimeout(200);
  }
  await a.waitForFunction(() => window.sonTur.state.state === 'result'); assert(keyboard); await frame.waitForFunction(() => window.sonTur.state.state === 'result');
  assert.equal(await a.evaluate(() => window.sonTur.state.winner), await frame.evaluate(() => window.sonTur.state.winner));
  await frame.locator('#leave').click(); await a.locator('#leave').click(); assert.deepEqual(errors, []);
  await writeFile(`${out}/${tag}-iframe-acceptance.json`, JSON.stringify({ passed: true, live, realCloud: true, controlledWrapper: !catalog, catalogPlayer: catalog, at: new Date().toISOString(), sandbox: 'allow-scripts allow-pointer-lock', localStorageDenied: true, invitationWorks: true, realKeyboardTurkishNameAndPass: true, normalMotionAnimation: true, widths: [1280, 390, 320], sameWinner: true, rendererErrors: errors, listeningServerStarted: false, physicalDeviceTested: false }, null, 2)); console.log(JSON.stringify({ passed: true, live, invitation: true, sandboxPreserved: true, realKeyboard: true }));
} catch (error) {
  await b.screenshot({ path: resolve(out, `${tag}-iframe-failure.png`), fullPage: true });
  const details = await b.locator('iframe').elementHandle().then(e => e.contentFrame()).then(f => f.evaluate(() => ({ text: document.body.innerText, connected: window.sonTur?.connected, code: document.getElementById('room-code')?.value }))).catch(() => null);
  await writeFile(`${out}/${tag}-iframe-failure.json`, JSON.stringify({ error: error.message, errors, diagnostic, details }, null, 2)); throw error;
} finally { await browser.close(); }
