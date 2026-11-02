import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { out, gameId, version } from './roulette-paths.mjs';
assert(!existsSync(`public/games/${gameId}/${version}`), 'Runtime sabitlendi; aynı sürüm görseli değiştirilmez.');
for (const name of ['browser', 'protocol', 'rules', 'local-iframe']) assert(JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')).passed, name);
const folder = `public/media/games/${gameId}/${version}`; await mkdir(folder, { recursive: true });
const images = [];
for (const [source, name] of [['local-home-1366.png', 'kapak.png'], ['local-online-table.png', 'online-masa.png'], ['local-online-mobile.png', 'mobil-masa.png'], ['local-result.png', 'bot-antrenmani-sonuc.png']]) {
  const bytes = await readFile(`${out}/${source}`); assert(bytes.length < 1024 * 1024);
  await copyFile(`${out}/${source}`, `${folder}/${name}`); images.push({ path: `${folder}/${name}`, name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(`${out}/images.json`, JSON.stringify(images, null, 2)); console.log('Dört gerçek oyun ekranı hazır.');
