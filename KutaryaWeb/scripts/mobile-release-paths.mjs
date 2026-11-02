// Her sürümün paketi/kanıtı ayrıdır; yayımlanmış eski dosyaların üzerine yazılmaz.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { kutaryaMobile } from "../projects-src/kutarya-mobile.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
export const mobileArtifactDirectory = resolve(root, "artifacts/kutarya-mobile", kutaryaMobile.version);
export const mobileImageDirectory = resolve(root, "public/media/projects/kutarya-mobile", kutaryaMobile.version);
export const mobileReleaseDirectory = resolve(root, "artifacts/releases/kutarya-mobile", kutaryaMobile.version);
export const mobileManifestPath = resolve(mobileArtifactDirectory, `paket-bilgisi-${kutaryaMobile.version}.json`);
