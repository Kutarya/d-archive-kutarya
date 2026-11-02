// Başsız Edge + üretim gateway'i; yalnız WebSocket taşıması kontrollü köprüdür.
// Gerçek internet/Cloud Run kabulü değildir. HTTP/debug portu açılmaz.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { createGateway } from '../blackjack-server/gateway.mjs';
import { unzipSync } from 'fflate';
import { createHash } from 'node:crypto';
const out = 'artifacts/releases/blackjack/2.0.0';
await mkdir(out, { recursive: true });
const source = await readFile(`${out}/runtime/index.html`, 'utf8');
const packageInfo = JSON.parse(await readFile(`${out}/package.json`, 'utf8'));
const packageBytes = await readFile(`${out}/${packageInfo.name}`), entries = unzipSync(packageBytes);
assert.equal(createHash('sha256').update(packageBytes).digest('hex'), packageInfo.sha256);
assert(Buffer.from(entries['index.html']).equals(Buffer.from(source)));
assert.deepEqual(Object.keys(entries).sort(), ['OKU.txt', 'index.html']);
const html = source.replace("const BJ_ENDPOINT = '';", "const BJ_ENDPOINT = 'https://blackjack-review.kutarya.invalid';");
const url = 'https://kutarya.com/__blackjack-review';
const gateway = createGateway(), sockets = new Map(), errors = [], unexpected = [];
const proof = { at: new Date().toISOString(), productionGateway: true, controlledTransport: true, realCloud: false, listeningServerStarted: false, desktopAutomation: false, physicalDeviceTested: false, views: [], actions: [] };
const interval = setInterval(() => gateway.tick(), 100);
const browser = await chromium.launch({ channel: 'msedge', headless: true });
async function context(width = 1366, reduce = true) {
  const c = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
  await c.route(/^https?:/, route => { if (route.request().url().startsWith(url)) return route.fulfill({ contentType: 'text/html', body: html }); unexpected.push(route.request().url()); return route.abort(); });
  await c.routeWebSocket('wss://blackjack-review.kutarya.invalid/play', route => {
    const socket = { readyState: 1, bufferedAmount: 0, send: text => route.send(text), close(code = 1000, reason = '') { this.readyState = 3; gateway.close(this); return route.close({ code, reason }); } };
    gateway.connect(socket); sockets.set(route, socket); route.onMessage(raw => gateway.receive(socket, raw)); route.onClose(() => { socket.readyState = 3; gateway.close(socket); });
  });
  return c;
}
async function page(c) { const p = await c.newPage(); p.setDefaultTimeout(10000); p.on('pageerror', e => errors.push(e.message)); return p; }
async function overflow(p, label) { const result = await p.evaluate(() => ({ w: innerWidth, scroll: document.documentElement.scrollWidth, offenders: [...document.querySelectorAll('main *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest('.table-art'); }).slice(0, 10).map(e => ({ tag: e.tagName, id: e.id, class: e.className })) })); assert(result.scroll <= result.w + 1, `${label}: ${JSON.stringify(result)}`); proof.views.push({ label, width: result.w }); }
async function untilResult(p, strategy = 'stand') {
  let guard = 0;
  while (await p.evaluate(() => window.royalNight.state.phase) === 'playing') {
    assert(++guard < 18, 'Tur tamamlanmadı');
    const available = await p.evaluate(() => window.royalNight.state.actions);
    const chosen = available.includes(strategy) ? strategy : 'stand'; await p.locator('#' + chosen).click();
  }
}
try {
  const c = await context(), a = await page(c); await a.goto(url); await a.waitForFunction(() => window.royalNight);
  for (const width of [1366, 1000, 768, 390, 320, 282, 240]) {
    await a.setViewportSize({ width, height: 900 }); await overflow(a, 'home');
    if ([1366, 390].includes(width)) await a.screenshot({ path: resolve(out, `local-home-${width}.png`), fullPage: true });
    await a.locator('#help').click(); assert(await a.locator('#help-dialog').isVisible()); await overflow(a, 'help'); await a.keyboard.press('Escape');
    await a.locator('#create').click(); await overflow(a, 'create'); await a.keyboard.press('Escape');
  }
  await a.setViewportSize({ width: 1366, height: 900 }); await a.locator('#player-name').fill('Çağrı'); await a.locator('#practice').click();
  await a.locator('#stake').selectOption('100'); await a.locator('#deal').click();
  if (await a.evaluate(() => window.royalNight.state.phase === 'playing')) { await a.locator('#coach summary').click(); assert((await a.locator('#hint').innerText()).length > 15); }
  for (const width of [1366, 768, 390, 320, 282, 240]) { await a.setViewportSize({ width, height: 900 }); await overflow(a, 'practice'); }
  await a.setViewportSize({ width: 1366, height: 900 }); await a.screenshot({ path: resolve(out, 'local-practice.png'), fullPage: true });
  // Uzun eller kartları kesmez; ikinci sıraya akabilir. Yalnız DOM çizim kabulü.
  await a.setViewportSize({ width: 240, height: 900 });
  await a.evaluate(() => { const cards = document.querySelector('.seat .cards'); while (cards.children.length < 10) cards.append(cards.firstElementChild.cloneNode(true)); });
  assert.equal(await a.evaluate(() => [...document.querySelectorAll('.seat .card')].every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })), true);
  await a.setViewportSize({ width: 1366, height: 900 });
  await untilResult(a); assert(await a.locator('#after-round').isVisible()); await a.screenshot({ path: resolve(out, 'local-result.png'), fullPage: true });
  await a.locator('#next').click(); assert.equal(await a.evaluate(() => window.royalNight.state.phase), 'lobby'); await a.locator('#leave').click();
  proof.actions.push('alıştırma/puan seçimi/ipucu/sonuç/yeni tur');
  await a.locator('#daily').click(); const snapshots = [];
  for (let round = 1; round <= 5; round++) { await a.locator('#deal').click(); snapshots.push(await a.evaluate(() => window.royalNight.state.players[0].hands[0].cards)); await untilResult(a); if (round < 5) await a.locator('#next').click(); }
  assert((await a.locator('#result-copy').innerText()).includes('Beş tur tamam')); assert((await a.locator('#daily-best').innerText()).includes('en iyi sonuç'));
  await a.screenshot({ path: resolve(out, 'local-daily-result.png'), fullPage: true }); await a.locator('#next').click(); await a.locator('#deal').click(); assert.deepEqual(await a.evaluate(() => window.royalNight.state.players[0].hands[0].cards), snapshots[0]);
  await untilResult(a); await a.locator('#leave').click(); proof.actions.push('günlük beş tur/yerel rekor/aynı tohumla tekrar');
  await a.locator('#sound').click(); assert.equal(await a.locator('#sound').getAttribute('aria-pressed'), 'true'); await a.locator('#sound').click();
  await a.locator('#player-name').click(); await a.locator('#player-name').press('ControlOrMeta+A'); await a.locator('#player-name').pressSequentially('Çağrı');
  await a.locator('#create').click(); await a.locator('#capacity').selectOption('5'); await a.locator('#public-room').check(); await a.locator('#create-submit').click();
  await a.waitForFunction(() => window.royalNight.state?.code !== undefined); const code = await a.evaluate(() => window.royalNight.state.code);
  const cb = await context(390), b = await page(cb); await b.goto(url + '?masa=' + code); assert.equal(await b.locator('#room-code').inputValue(), code);
  await b.locator('#player-name').click(); await b.locator('#player-name').press('ControlOrMeta+A'); await b.locator('#player-name').pressSequentially('İpek Şahin'); await b.locator('#refresh').click(); await b.locator('.room-item').waitFor(); assert((await b.locator('.room-list').innerText()).includes(code)); await b.locator('#join').click();
  await a.waitForFunction(() => window.royalNight.state.players.length === 2); await b.waitForFunction(() => window.royalNight.state?.players.length === 2);
  assert((await a.locator('#players').innerText()).includes('İpek Şahin')); assert(!(await a.locator('#deal').isEnabled()));
  await b.locator('#ready').click(); await a.locator('#ready').click(); await a.waitForFunction(() => !document.getElementById('deal').disabled); await a.locator('#deal').click();
  await a.waitForFunction(() => window.royalNight.state.phase !== 'lobby'); await b.waitForFunction(() => window.royalNight.state.phase !== 'lobby');
  for (let retry = 0; await a.evaluate(() => window.royalNight.state.phase === 'result') && retry < 5; retry++) {
    await a.locator('#next').click(); await b.waitForFunction(() => window.royalNight.state.phase === 'lobby'); await b.locator('#ready').click(); await a.locator('#ready').click(); await a.waitForFunction(() => !document.getElementById('deal').disabled); await a.locator('#deal').click(); await a.waitForFunction(() => window.royalNight.state.phase !== 'lobby'); await b.waitForFunction(() => window.royalNight.state.phase !== 'lobby');
  }
  assert.equal(await a.evaluate(() => window.royalNight.state.phase), 'playing', 'Online tur gerçek hamleyle oynanmalı.');
  if (await a.evaluate(() => window.royalNight.state.phase === 'playing')) { assert.equal(await a.evaluate(() => window.royalNight.state.dealer[1]), null); assert.equal(await b.evaluate(() => window.royalNight.state.dealer[1]), null); }
  await a.screenshot({ path: resolve(out, 'local-online-table.png'), fullPage: true }); await b.screenshot({ path: resolve(out, 'local-online-mobile.png'), fullPage: true });
  for (const width of [390, 320, 282, 240]) { await b.setViewportSize({ width, height: 900 }); await overflow(b, 'online'); }
  let turns = 0;
  while (await a.evaluate(() => window.royalNight.state.phase) === 'playing') {
    assert(++turns < 12);
    for (const p of [a, b]) if (await p.locator('#stand').isEnabled()) { await p.locator('#status').click(); await p.locator('body').press('s'); }
    await a.waitForTimeout(80);
  }
  await b.waitForFunction(() => window.royalNight.state.phase === 'result');
  assert(turns > 0, 'İki oyunculu turda gerçek klavye hamlesi uygulanmadı.');
  assert.deepEqual(await a.evaluate(() => window.royalNight.state.players), await b.evaluate(() => window.royalNight.state.players));
  await a.locator('#invite').click(); assert((await a.locator('#invite-link').inputValue()).includes('?masa=' + code)); await a.keyboard.press('Escape');
  await b.locator('[data-reaction="clap"]').click(); await a.locator('.reaction-bubble').waitFor(); await a.locator('#next').click(); await a.waitForFunction(() => window.royalNight.state.phase === 'lobby');
  // Aynı oyuncu, yeni taşıma bağlantısı: üretim token/host aktarımı gerçekten çalışır.
  const bSocket = [...sockets.values()].find(s => s.actor && s.room?.game.players.find(p => p.id === s.actor)?.name === 'İpek Şahin');
  const actor = bSocket.actor, record = bSocket.room;
  await bSocket.close(1012, 'Kabul bağlantı kesintisi'); await b.waitForFunction(() => !window.royalNight.connected);
  await b.waitForFunction(() => window.royalNight.connected && window.royalNight.state.players.some(p => p.name === 'İpek Şahin' && p.connected), { timeout: 10000 });
  assert.notEqual(record.sockets.get(actor), bSocket); assert.equal(record.sockets.size, 2);
  await b.locator('#leave').click(); await b.waitForFunction(() => !window.royalNight.state); await a.locator('#leave').click();
  proof.actions.push('iki ayrı tarayıcı oturumu/Türkçe klavye/açık liste/kod/davet/hazır/aynı sonuç/emoji/yeni tur/kopmada dönüş');
  await cb.close(); await c.close();
  const fileContext = await context(390), filePage = await page(fileContext);
  await filePage.goto(pathToFileURL(resolve(out, 'runtime/index.html')).href); await filePage.locator('#practice').click(); await filePage.locator('#deal').click(); await untilResult(filePage); await filePage.locator('#leave').click();
  await filePage.locator('#create').click(); await filePage.locator('#create-submit').click(); await filePage.locator('#toast').waitFor(); assert((await filePage.locator('#toast').innerText()).includes('yayın onayından sonra'));
  await fileContext.close(); proof.actions.push('gerçek ZIP SHA/içerik eşleşmesi/file HTML çevrimdışı oyun/yayın bekleyen online açıklaması');
  assert.deepEqual(errors, []); assert.deepEqual(unexpected, []); proof.rendererErrors = errors; proof.passed = true;
  await writeFile(`${out}/browser-acceptance.json`, JSON.stringify(proof, null, 2)); console.log(JSON.stringify({ passed: true, views: proof.views.length, actions: proof.actions, realCloud: false }));
} catch (error) {
  for (const c of browser.contexts()) for (const p of c.pages()) await p.screenshot({ path: resolve(out, `failure-${browser.contexts().indexOf(c)}-${c.pages().indexOf(p)}.png`), fullPage: true }).catch(() => {});
  await writeFile(`${out}/browser-failure.json`, JSON.stringify({ error: error.message, errors, unexpected }, null, 2)); throw error;
} finally { clearInterval(interval); await browser.close(); }
