// Oyun tek HTML içinde derlenir; indirilen dosya file:// ile çevrimdışı açılır.
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
const folder = "games-src/blok-diyari/";
let html = await readFile(folder + "template.html", "utf8");
for (const [marker, file] of [
  ["CORE", "core.mjs"],
  ["RENDERER", "renderer.mjs"],
  ["GAME", "game.mjs"],
]) {
  let code = await readFile(folder + file, "utf8");
  code = code
    .replace(/^import[\s\S]*?from ['"].*?['"];\s*$/gm, "")
    .replace(/^export /gm, "");
  html = html.replace(`/* ${marker} */`, () => code);
}
await writeFile(folder + "index.html", html);
const build = "artifacts/user-games/blok-diyari-build/";
await mkdir(build, { recursive: true });
await writeFile(build + "index.html", html);
await copyFile(folder + "OKU.txt", build + "OKU.txt");
console.log("Blok Diyarı: çevrimdışı tek HTML hazır.");
