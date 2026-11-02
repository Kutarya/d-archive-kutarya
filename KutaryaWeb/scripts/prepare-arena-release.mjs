import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  arenaReleaseDirectory as out,
  arenaVersion,
} from "./arena-release-paths.mjs";
const folder = `public/media/games/pixelgun/${arenaVersion}`;
assert(
  !existsSync(`public/games/pixelgun/${arenaVersion}`),
  "Runtime sabitlendi; aynı sürüm görsellerinin üzerine yazılmaz.",
);
const proof = JSON.parse(
  await readFile(`${out}/browser-acceptance.json`, "utf8"),
);
const protocol = JSON.parse(
  await readFile(`${out}/protocol-acceptance.json`, "utf8"),
);
const iframe = JSON.parse(
  await readFile(`${out}/local-iframe-acceptance.json`, "utf8"),
);
assert(proof.passed && protocol.passed && iframe.passed);
assert(
  JSON.parse(await readFile(`${out}/local-netcode-acceptance.json`, "utf8"))
    .passed,
);
await mkdir(folder, { recursive: true });
const names = [
  "local-home-1280.png",
  "local-arena-0.png",
  "local-arena-1.png",
  "local-arena-2.png",
  "local-online-match.png",
];
const images = [];
for (const [i, name] of names.entries()) {
  const dest = [
    "kapak.png",
    "neon-avlu.png",
    "kum-istasyonu.png",
    "buz-kalesi.png",
    "online-mac.png",
  ][i];
  await copyFile(`${out}/${name}`, `${folder}/${dest}`);
  const b = await readFile(`${folder}/${dest}`);
  assert(b.length <= 1024 * 1024);
  images.push({
    name: dest,
    path: `${folder}/${dest}`,
    bytes: b.length,
    sha256: createHash("sha256").update(b).digest("hex"),
  });
}
await writeFile(`${out}/images.json`, JSON.stringify(images, null, 2));
console.log("Beş gerçek oyun görüntüsü ve kabul raporları yayın için hazır.");
