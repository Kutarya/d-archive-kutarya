// Yeni sürüm paketleri ve kanıtlar eski 1.0.0 dosyalarından ayrıdır.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kutaryaVideo } from '../projects-src/kutarya-video.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export const videoArtifactDirectory = resolve(root, 'artifacts/kutarya-video', kutaryaVideo.version);
export const videoImageDirectory = resolve(root, 'public/media/projects/kutarya-video', kutaryaVideo.version);
export const videoReleaseDirectory = resolve(root, 'artifacts/releases/kutarya-video', kutaryaVideo.version);
export const videoManifestPath = resolve(videoArtifactDirectory, `paket-bilgisi-${kutaryaVideo.version}.json`);
