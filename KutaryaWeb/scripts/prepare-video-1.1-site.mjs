// Yalnız yeni, doğrulanmış paketler ve gerçek 1.1 ekranları; eski paketler sabittir.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, copyFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { kutaryaVideo, kutaryaVideoFiles, kutaryaVideoImages } from '../projects-src/kutarya-video.mjs';
import { normalizeGame, fileSpec, fileSignature } from '../functions/policy.js';
import { videoArtifactDirectory as out, videoImageDirectory as media, videoManifestPath } from './video-release-paths.mjs';
const source = 'D:/KutaryaVideo';
const digest = b => createHash('sha256').update(b).digest('hex').toUpperCase();
const release = JSON.parse(await readFile(resolve(source, `Kanitlar/release-${kutaryaVideo.version}.json`), 'utf8'));
assert(release.passed && release.version === kutaryaVideo.version && release.originalDownloadArgumentsUnchanged && release.oldArtifactsPreserved);
const runtimeDir = process.argv[2];
assert(runtimeDir && resolve(runtimeDir).startsWith(resolve(source, 'Kanitlar') + '\\'), 'Yeni gerçek paket kabul dizini gerekli.');
const runtime = JSON.parse(await readFile(resolve(runtimeDir, 'kabul.json'), 'utf8'));
assert(runtime.passed && runtime.packaged && runtime.appVersion === kutaryaVideo.version);
const searchDir = 'D:/KutaryaVideo/Kanitlar/development-1791647768049';
const live = JSON.parse(await readFile(resolve(searchDir, 'kabul.json'), 'utf8'));
assert(live.search.length > 0 && live.checks.find(c => c.name === 'İsimle gerçek YouTube araması')?.passed);
assert(live.download?.status === 'failed' && /429/.test(live.download.detail));
await mkdir(out, { recursive: true }); await mkdir(media, { recursive: true });
normalizeGame(kutaryaVideo, null, [kutaryaVideo.category]);
const manifest = { at: new Date().toISOString(), gameId: kutaryaVideo.id, version: kutaryaVideo.version, artifacts: [], images: [], acceptance: { coreTests: 22, packagedChecks: runtime.checks.length, realYouTubeSearch: true, realYouTubeDownloadCompleted: false, downloadBlock: 'Test ağında YouTube HTTP 429 ve bot doğrulaması', nativeFolderChooserMocked: true, windowsInstallationTested: false, windowsNotificationDelivered: false, originalDownloadArgumentsUnchanged: true } };
for (const spec of kutaryaVideoFiles) {
  const input = resolve(source, 'Paketler', spec.name), bytes = await readFile(input), expected = release.artifacts.find(f => f.name === spec.name);
  assert(expected && bytes.length === expected.bytes && digest(bytes) === expected.sha256);
  fileSpec({ ...spec, size: bytes.length, version: kutaryaVideo.version }); assert(fileSignature(spec.name, bytes.subarray(0, 8)));
  const target = resolve(out, spec.name); let old;
  try { old = await readFile(target); } catch {}
  if (old) assert.equal(digest(old), expected.sha256, 'Aynı sürüm paketi üzerine yazılmaz.');
  else await copyFile(input, target);
  manifest.artifacts.push({ name: spec.name, role: spec.role, platform: spec.platform, bytes: bytes.length, sha256: digest(bytes) });
}
for (const img of kutaryaVideoImages) {
  const input = resolve(img.name === '03-arama.png' ? searchDir : runtimeDir, img.name), bytes = await readFile(input);
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.length <= 1024 * 1024);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20); assert(width >= 1000 && height >= 700);
  const target = resolve(media, img.name); let previous;
  try { previous = await readFile(target); } catch {}
  if (previous) assert.equal(digest(previous), digest(bytes), 'Aynı sürüm görseli üzerine yazılmaz.');
  else await copyFile(input, target);
  manifest.images.push({ ...img, width, height, bytes: bytes.length, sha256: digest(bytes), path: `/media/projects/kutarya-video/${kutaryaVideo.version}/${img.name}` });
}
await writeFile(videoManifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ version: manifest.version, artifacts: manifest.artifacts, images: manifest.images.length, acceptance: manifest.acceptance }));
