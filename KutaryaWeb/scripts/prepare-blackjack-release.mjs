// Yalnız yerel paket/görsel hazırlığı; Storage/katalog/Hosting'e yazmaz.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { userGames } from '../games-src/projects.mjs';
const out = 'artifacts/releases/blackjack/2.0.0';
for (const name of ['browser', 'site']) assert.equal(JSON.parse(await readFile(`${out}/${name}-acceptance.json`, 'utf8')).passed, true);
const previous = JSON.parse(await readFile(`${out}/before/catalog.json`, 'utf8')).games.find(g => g.id === 'blackjack');
assert(previous && previous.version === '1.0.3');
const source = userGames.find(g => g.id === 'blackjack'), packageInfo = JSON.parse(await readFile(`${out}/package.json`, 'utf8'));
assert.equal(source.version, '2.0.0'); assert.equal(packageInfo.version, source.version);
const images = [];
await mkdir(`${out}/images`, { recursive: true });
for (const [input, name] of [['local-home-1366.png', 'kapak.png'], ['local-online-table.png', 'online-masa.png'], ['local-online-mobile.png', 'mobil-masa.png'], ['local-daily-result.png', 'gunun-bes-turu.png']]) {
  const bytes = await readFile(`${out}/${input}`); assert(bytes.length <= 1024 * 1024); await copyFile(`${out}/${input}`, `${out}/images/${name}`);
  images.push({ path: `${out}/images/${name}`, name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), source: 'başsız Edge gerçek oyun çizimi; online taşıma kontrollü' });
}
await writeFile(`${out}/images.json`, JSON.stringify(images, null, 2));
await writeFile(`${out}/catalog-update.pending.json`, JSON.stringify({ projectId: 'kutarya-ai-3169', gameId: 'blackjack', previousVersion: previous.version, version: source.version, approved: false, published: false, preserveFiles: previous.files, preserveVersions: previous.versions, patch: Object.fromEntries(['title', 'subtitle', 'description', 'tags', 'version', 'controls', 'requirements', 'changelog', 'color'].map(key => [key, source[key]])), runtimeToVerify: '/games/blackjack/2.0.0/index.html', package: packageInfo, images, remaining: ['Kullanıcı yayın onayı', 'Bulut before yedeği/diğer projeler ve servisler/kurallar/Auth/IAM doğrulaması', 'Ayrı Cloud Run servisi', 'Gerçek servis adresiyle paketi yeniden üretme', 'Gerçek bulut protokol ve iki tarayıcı kabulü', 'Sürümlü runtime kaydı ve admin Storage paket/görselleri', 'Diğer proje/servisleri koruyan Hosting ve katalog yayını', 'Gerçek HTTPS/katalog iframe/indirme SHA ve bulut after kabulü'] }, null, 2));
console.log(JSON.stringify({ prepared: true, published: false, previousFilesPreserved: previous.files.length, images: images.length, onlineConfigured: packageInfo.onlineConfigured }));
