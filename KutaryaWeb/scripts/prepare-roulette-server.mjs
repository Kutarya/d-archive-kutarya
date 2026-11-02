import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
import { out } from './roulette-paths.mjs';
await mkdir(out, { recursive: true });
await copyFile('games-src/rus-ruleti/rules.mjs', 'roulette-server/rules.mjs');
let deploy = await readFile('scripts/deploy-arena.mjs', 'utf8');
deploy = deploy.replace('import { arenaReleaseDirectory as out } from "./arena-release-paths.mjs";', 'import { out } from "./roulette-paths.mjs";')
  .replaceAll('kutarya-arena-runtime', 'kutarya-roulette-runtime').replaceAll('kutarya-block-arena', 'kutarya-rus-ruleti').replaceAll('arena-server', 'roulette-server').replaceAll('arena-deploy.log', 'service-deploy.log').replaceAll('Kutarya Block Arena', 'Kutarya Son Tur').replaceAll('Arena servisi', 'Son Tur servisi');
deploy = deploy.replace('process.stdout.write(b);', "if (/(?:enter|provide|input)[^\\n]{0,60}(?:password|parola|şifre)/i.test(err)) child.kill();\n  process.stdout.write(b);");
await writeFile('scripts/deploy-roulette.mjs', deploy);
console.log('Ayrı servis kaynağı ve dar kapsamlı yayın helper hazır.');
