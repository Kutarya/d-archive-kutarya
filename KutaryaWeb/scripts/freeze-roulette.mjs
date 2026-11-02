import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { unzipSync, strFromU8 } from 'fflate';
import { out, gameId, version } from './roulette-paths.mjs';
for (const name of ['rules', 'protocol', 'browser', 'local-iframe', 'local-matchmaking']) assert(JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')).passed, name);
const manifest = JSON.parse(await readFile(`${out}/package.json`, 'utf8')), zipBytes = await readFile(`${out}/${manifest.name}`), files = unzipSync(zipBytes), sha = b => createHash('sha256').update(b).digest('hex');
assert.equal(sha(zipBytes), manifest.sha256); assert.deepEqual(Object.keys(files).sort(), ['OKU.txt', 'index.html']);
for (const file of manifest.files) { assert.equal(sha(files[file.path]), file.sha256); assert.equal(sha(await readFile(`${out}/runtime/${file.path}`)), file.sha256); }
const html = strFromU8(files['index.html']); assert(!/@roulette-|127\.0\.0\.1|localhost|FIREBASE_API_KEY|PRIVATE KEY|MOBILE_MAIL_PASS/.test(html));
const child = spawn(process.execPath, ['--require', './scripts/no-listeners.cjs', 'scripts/import-game.mjs', `${out}/runtime`, gameId, version], { stdio: ['ignore', 'inherit', 'inherit'], windowsHide: true });
const code = await new Promise((done, fail) => { child.on('exit', done); child.on('error', fail); }); assert.equal(code, 0);
const path = `public/games/${gameId}/${version}/kutarya-manifest.json`, runtime = JSON.parse(await readFile(path, 'utf8'));
runtime.verified = true; runtime.note = '13 kural testi, gerçek bulut protokolü/çok oyunculu, bot oyunu, mobil, kod/davet, hızlı eşleşme ve korumalı iframe kabulü geçti; fiziksel cihaz/yük testi yapılmadı.';
await writeFile(path, JSON.stringify(runtime, null, 2));
const sourceHashes = {}; for (const path of ['games-src/rus-ruleti/index.html', 'games-src/rus-ruleti/style.css', 'games-src/rus-ruleti/client.js', 'games-src/rus-ruleti/rules.mjs', 'roulette-server/server.mjs', 'roulette-server/rules.mjs', 'roulette-server/package.json', 'roulette-server/package-lock.json']) sourceHashes[path] = sha(await readFile(path));
await writeFile(`${out}/frozen.json`, JSON.stringify({ at: new Date().toISOString(), gameId, version, package: manifest, sourceHashes, secretScanPassed: true }, null, 2), { flag: 'wx' });
console.log('ZIP ve runtime SHA ile sabitlendi. Aynı sürüm yeniden üretilmez.');
