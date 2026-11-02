// 1.1 ilk hazırlıkta kullanıldı. Ortak komutlar artık dispatcher: yeniden çalıştırma.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
function adapt(source) {
  return source.replaceAll('kutaryaMobile', 'kutaryaVideo').replaceAll('kutarya-mobile', 'kutarya-video').replaceAll('Kutarya Mobile', 'Kutarya Video')
    .replaceAll('mobileArtifactDirectory', 'videoArtifactDirectory').replaceAll('mobileImageDirectory', 'videoImageDirectory').replaceAll('mobileReleaseDirectory', 'videoReleaseDirectory').replaceAll('mobileManifestPath', 'videoManifestPath')
    .replaceAll('mobile-release-paths.mjs', 'video-release-paths.mjs').replaceAll('scripts/upload-mobile.mjs', 'scripts/upload-video-1.1.mjs')
    .replaceAll('Mobile', 'Video').replaceAll('canli-mobile-', 'canli-video-');
}
for (const [from, to] of [['scripts/upload-mobile.mjs', 'scripts/upload-video-1.1.mjs'], ['scripts/authorize-mobile-release.mjs', 'scripts/authorize-video-release.mjs'], ['scripts/mobile-release-audit.mjs', 'scripts/video-release-audit.mjs']]) {
  let code = adapt(await readFile(from, 'utf8'));
  if (to.endsWith('video-release-audit.mjs')) code = code.replaceAll('onlyVideoCatalogAndHostingChanged', 'onlyVideoCatalogAndHostingChanged').replaceAll('mobileVersion:', 'videoVersion:');
  await writeFile(to, code);
}
let verify = await readFile('scripts/verify-mobile-live.mjs', 'utf8');
assert(verify.includes('artifacts/kutarya-mobile/paket-bilgisi-1.1.0.json'));
verify = verify.replace('artifacts/kutarya-mobile/paket-bilgisi-1.1.0.json', 'artifacts/kutarya-video/paket-bilgisi-1.0.0.json');
verify = adapt(verify).replaceAll('mobile.', 'video.').replaceAll('const mobile =', 'const video =').replaceAll('assert(mobile &&', 'assert(video &&').replaceAll('mobile.id', 'video.id')
  .replaceAll('=== "mobile"', '=== "desktop"').replaceAll('Kutarya-Video-1.2.0.apk', 'Kutarya-Video-Setup-1.1.0.exe').replaceAll('[...manifest.artifacts, ...priorManifest.artifacts]', 'manifest.artifacts');
await writeFile('scripts/verify-video-1.1-live.mjs', verify);
let review = await readFile('scripts/review-video-site.mjs', 'utf8');
review = review.replace('const out = resolve(root, "artifacts/kutarya-video");', 'const out = videoArtifactDirectory;').replace('await readFile(resolve(out, "paket-bilgisi-1.0.0.json"), "utf8")', 'await readFile(videoManifestPath, "utf8")')
  .replace('import { kutaryaVideo } from "../projects-src/kutarya-video.mjs";', 'import { kutaryaVideo } from "../projects-src/kutarya-video.mjs";\nimport { videoArtifactDirectory, videoManifestPath } from "./video-release-paths.mjs";')
  .replaceAll('galleryImages: 2', 'galleryImages: 3').replace('await page.locator(".gallery img").count(), 2', 'await page.locator(".gallery img").count(), 3').replace('name: "Sürüm 1.0.0"', 'name: `Sürüm ${kutaryaVideo.version}`');
await writeFile('scripts/review-video-1.1-site.mjs', review);
console.log('Video için mevcut admin/yükleme/yedek/kabul hattı hazırlandı.');
