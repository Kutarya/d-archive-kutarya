const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'asset-provenance.json');
const packageLockPath = path.join(projectRoot, 'package-lock.json');
const allowedLicenses = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MIT',
  'MPL-2.0',
]);

function sha256(filePath) {
  const file = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(file).digest('hex').toUpperCase();
}

function fail(message) {
  process.stderr.write(`YAYIN KONTROLÜ BAŞARISIZ: ${message}\n`);
  process.exitCode = 1;
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const declaredAssetPaths = new Set();

for (const asset of manifest.assets ?? []) {
  if (!asset.path || !asset.origin || !asset.rightsBasis) {
    fail('Kaynak veya kullanım hakkı bilgisi eksik bir varlık var.');
    continue;
  }

  declaredAssetPaths.add(asset.path.replaceAll('\\', '/'));
  const absolutePath = path.resolve(projectRoot, asset.path);

  if (
    !absolutePath.startsWith(projectRoot + path.sep) ||
    !fs.existsSync(absolutePath) ||
    !fs.statSync(absolutePath).isFile() ||
    !fs.realpathSync(absolutePath).startsWith(fs.realpathSync(projectRoot) + path.sep)
  ) {
    fail(`${asset.path} bulunamadı veya proje dışına çıkıyor.`);
    continue;
  }

  if (asset.publishable !== true) {
    fail(`${asset.path} yayın için onaylı değil.`);
  }

  if (sha256(absolutePath) !== asset.sha256) {
    fail(`${asset.path} kayıttan sonra değişmiş; kaynak incelemesini yenile.`);
  }
}

const publicAssetsDirectory = path.join(projectRoot, 'public', 'assets');
function checkAssetDirectory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(projectRoot, absolutePath).replaceAll('\\', '/');
    // Bağlı klasörler kaynak ağacının dışındaki dosyaları sessizce paketleyemez.
    if (entry.isSymbolicLink()) {
      fail(`${relativePath} sembolik bağlantı; gerçek varlığı proje içine kaydet.`);
    } else if (entry.isDirectory()) {
      checkAssetDirectory(absolutePath);
    } else if (!entry.isFile() || !declaredAssetPaths.has(relativePath)) {
      fail(`${relativePath} kaynak manifestinde kayıtlı değil.`);
    }
  }
}
checkAssetDirectory(publicAssetsDirectory);

const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
const rejectedPackages = [];
const missingLicensePackages = [];

for (const [packagePath, metadata] of Object.entries(packageLock.packages ?? {})) {
  if (!packagePath) {
    continue;
  }

  if (!metadata.license) {
    missingLicensePackages.push(packagePath);
    continue;
  }

  if (!allowedLicenses.has(metadata.license)) {
    rejectedPackages.push(`${packagePath} (${metadata.license})`);
  }
}

if (missingLicensePackages.length > 0) {
  fail(`Lisans alanı eksik paketler: ${missingLicensePackages.join(', ')}`);
}

if (rejectedPackages.length > 0) {
  fail(`İncelenmemiş lisanslı paketler: ${rejectedPackages.join(', ')}`);
}

if (!process.exitCode) {
  process.stdout.write(
    `Yayın kontrolü geçti: ${declaredAssetPaths.size} varlık ve ` +
      `${Object.keys(packageLock.packages ?? {}).length - 1} paket kaydı doğrulandı.\n`,
  );
  process.stdout.write(
    'Not: Bu otomatik kontrol hukuki garanti değildir; son sürümde insan incelemesi gerekir.\n',
  );
}
