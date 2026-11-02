import { readFile, writeFile } from 'node:fs/promises';
let source = await readFile('scripts/authorize-arena-release.mjs', 'utf8');
source = source.replace('import { arenaReleaseDirectory as out } from "./arena-release-paths.mjs";', 'import { out } from "./roulette-paths.mjs";');
source = source.replace('`${out}/local-netcode-acceptance.json`', '`${out}/local-iframe-acceptance.json`');
source = source.replaceAll('scripts/upload-arena.mjs', 'scripts/upload-roulette.mjs').replaceAll('Arena', 'Son Tur');
await writeFile('scripts/authorize-roulette.mjs', source);
console.log('Geçici token/IAM temizliği yapan mevcut yetkili hat yeni oyuna uyarlandı.');
