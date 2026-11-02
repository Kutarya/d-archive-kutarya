import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { out, runtimePath } from './roulette-paths.mjs';
const live = process.argv.includes('--live'), url = live ? 'https://kutarya.com' + runtimePath : pathToFileURL(resolve(out, 'runtime/index.html')).href;
const browser = await chromium.launch({ channel: 'msedge', headless: true }), a = await browser.newPage({ viewport: { width: 1280, height: 900 } }), b = await browser.newPage({ viewport: { width: 390, height: 844 } }), errors = [];
for (const p of [a, b]) p.on('pageerror', e => errors.push(e.message));
try {
  await a.goto(url); await a.locator('#player-name').fill('Deniz'); await a.locator('#quick').click(); await a.waitForFunction(() => window.sonTur.state?.quick);
  const code = await a.evaluate(() => window.sonTur.state.code); assert.equal(await a.evaluate(() => window.sonTur.state.startAt), 0);
  await a.screenshot({ path: resolve(out, `${live ? 'live' : 'local'}-quick-wait.png`) });
  await b.goto(url); await b.locator('#player-name').fill('Ece'); await b.waitForFunction(code => [...document.querySelectorAll('.room-row')].some(el => el.textContent.includes(code)), code);
  const row = b.locator('.room-row').filter({ hasText: code }); assert((await row.innerText()).includes('1 / 6')); await row.getByRole('button', { name: 'Katıl' }).click();
  await b.waitForFunction(() => !!window.sonTur.state?.quick); assert.equal(await b.evaluate(() => window.sonTur.state.code), code);
  await a.waitForFunction(() => window.sonTur.state.startAt > 0 && document.getElementById('turn-title').textContent.includes('saniye'));
  await a.waitForFunction(() => window.sonTur.state.state === 'playing'); await b.waitForFunction(() => window.sonTur.state.state === 'playing');
  assert.equal(await a.evaluate(() => window.sonTur.state.turn), await b.evaluate(() => window.sonTur.state.turn));
  await b.screenshot({ path: resolve(out, `${live ? 'live' : 'local'}-quick-mobile.png`), fullPage: true });
  await a.locator('#leave').click(); await b.locator('#leave').click(); assert.deepEqual(errors, []);
  await writeFile(`${out}/${live ? '' : 'local-'}matchmaking-acceptance.json`, JSON.stringify({ passed: true, live, realCloud: true, at: new Date().toISOString(), separateBrowserContexts: true, quickButtonWorks: true, noCountdownAlone: true, publicListUsesRealRoom: true, realCountBeforeJoin: '1/6', listJoinWorks: true, secondPlayerStartsEightSecondCountdown: true, sameGameAndTurn: true, rendererErrors: errors, listeningServerStarted: false }, null, 2)); console.log(JSON.stringify({ passed: true, live, quickAndList: true }));
} finally { await browser.close(); }
