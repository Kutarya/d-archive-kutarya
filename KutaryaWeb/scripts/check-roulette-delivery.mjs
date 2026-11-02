import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { unzipSync } from 'fflate';
import { version, out } from './roulette-paths.mjs';
const destination = `C:/Users/yunus/Documents/Codex/2026-10-18/im/outputs/Kutarya-Son-Tur-${version}`, work = resolve(`C:/Users/yunus/Documents/Codex/2026-10-18/im/work/son-tur-source-${version}`);
const sha = b => createHash('sha256').update(b).digest('hex');
const entries = unzipSync(await readFile(`${destination}/Kutarya-Son-Tur-${version}-Kaynak.zip`));
await mkdir(work, { recursive: true });
for (const [path, bytes] of Object.entries(entries)) { const target = resolve(work, path); assert(target.startsWith(work + sep)); await mkdir(resolve(target, '..'), { recursive: true }); await writeFile(target, bytes, { flag: 'wx' }); }
async function run(args) {
  const child = spawn(process.execPath, ['--require', resolve('scripts/no-listeners.cjs'), ...args], { cwd: work, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true }); let log = ''; child.stdout.on('data', b => { log += b; }); child.stderr.on('data', b => { log += b; });
  const code = await new Promise((done, fail) => { child.on('exit', done); child.on('error', fail); }); assert.equal(code, 0, log); return log;
}
await run(['build.mjs']); assert.equal(sha(await readFile(work + '/oyun/index.html')), sha(await readFile(out + '/runtime/index.html')));
const tests = await run(['--test', '--test-reporter=tap', 'test/rules.test.mjs']); assert(tests.includes('# pass 15'));
const sums = (await readFile(`${destination}/SHA256SUMS.txt`, 'utf8')).trim().split('\n'); for (const row of sums) { const [hash, name] = row.split('  '); assert.equal(sha(await readFile(`${destination}/${name}`)), hash, name); }
const report = await readFile(`${destination}/YAYIN.md`, 'utf8'); let links = 0; for (const match of report.matchAll(/\]\(([^)]+)\)/g)) if (!match[1].startsWith('https://')) { assert((await readFile(`${destination}/${match[1]}`)).length); links++; }
await writeFile(`${out}/delivery-acceptance.json`, JSON.stringify({ passed: true, version, at: new Date().toISOString(), sourceArchiveFiles: Object.keys(entries).length, sourceBuildMatchesPublishedRuntime: true, sourceTests: 15, shaVerified: sums.length, documentLinksVerified: links, localServerStarted: false }, null, 2), { flag: 'wx' });
console.log(JSON.stringify({ passed: true, sourceBuildMatchesRuntime: true, tests: 15, shaVerified: sums.length, links }));
