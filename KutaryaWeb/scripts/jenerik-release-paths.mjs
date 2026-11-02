// Her sürümün paketleri, görselleri ve yayın kanıtları ayrıdır.
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kutaryaJenerik } from '../projects-src/kutarya-jenerik.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
export const jenerikArtifactDirectory=resolve(root,'artifacts/kutarya-jenerik',kutaryaJenerik.version);
export const jenerikImageDirectory=resolve(root,'public/media/projects/kutarya-jenerik',kutaryaJenerik.version);
export const jenerikReleaseDirectory=resolve(root,'artifacts/releases/kutarya-jenerik',kutaryaJenerik.version);
export const jenerikManifestPath=resolve(jenerikArtifactDirectory,`paket-bilgisi-${kutaryaJenerik.version}.json`);
