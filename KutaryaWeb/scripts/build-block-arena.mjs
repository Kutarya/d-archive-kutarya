import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import vm from "node:vm";
import { transform } from "lightningcss";
import { existsSync } from "node:fs";
import {
  arenaVersion,
  arenaReleaseDirectory as out,
} from "./arena-release-paths.mjs";
await import("./build-block-arena-rules.mjs");
assert(
  !existsSync(`public/games/pixelgun/${arenaVersion}`),
  "Sürüm runtime'a alınmış; aynı sürüm yeniden paketlenmez. Yeni sürüm seç.",
);
await mkdir(out, { recursive: true });
const service = JSON.parse(await readFile(`${out}/service.json`, "utf8"));
assert.equal(service.projectId, "kutarya-ai-3169");
assert(new URL(service.url).hostname.endsWith(".run.app"));
const [source, css, client] = await Promise.all([
  readFile("games-src/pixelgun/index.html", "utf8"),
  readFile("games-src/pixelgun/style-2.css", "utf8"),
  readFile("games-src/pixelgun/online.js", "utf8"),
]);
const html = source
  .replace("/* @arena-style */", css)
  .replace(
    "// @arena-client",
    (await readFile("arena-server/movement.mjs", "utf8")).replaceAll(
      "export ",
      "",
    ) +
      "\n" +
      client.replace("@arena-endpoint", service.url),
  );
assert(!html.includes("@arena-"));
for (const m of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))
  new vm.Script(m[1]);
for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
  transform({
    filename: "arena.css",
    code: Buffer.from(m[1]),
    errorRecovery: false,
  });
const folder = `${out}/runtime`;
await mkdir(folder, { recursive: true });
const help = `Kutarya Block Arena ${arenaVersion}\n\nindex.html dosyasını güncel tarayıcıda aç.\nBotlarla Oyna: üç harita, serbest/takım çatışması ve dalga savunması; internet gerekmez.\nOnline Oyna: internet gerekir. Oda oluştur, altı karakterli kodu arkadaşlarınla paylaş. 2–8 oyuncu katılabilir. Maçı oda sahibi başlatır.\n\nWASD hareket, fare nişan/ateş, sağ tık yakın nişan, Shift koş, Q atıl, Space zıpla, R doldur, 1–5 silah, G bomba, Tab skor, Esc menü.\nOnline menü maçı durdurmaz. Dokunmatik kontroller Ayarlar’dan açılır.\nOda geçicidir; sunucu yeniden başladığında oda kapanır. Kopmada 30 saniye yeniden bağlanma süresi bulunur.\nProfil/ayar kaydı ayrı sekmede veya indirilen HTML'de kullanılabilir. Site iframe'i kalıcı kaydı kısıtlar.\nFiziksel telefon ve yüksek oyuncu yükü kabulü yapılmadı.\nhttps://kutarya.com/proje/pixelgun\n`;
await writeFile(`${folder}/index.html`, html);
await writeFile(`${folder}/OKU.txt`, help);
const zip = zipSync(
  { "index.html": strToU8(html), "OKU.txt": strToU8(help) },
  { level: 9 },
);
const name = `Kutarya-Block-Arena-${arenaVersion}.zip`;
await writeFile(`${out}/${name}`, zip);
const files = [
  { path: "index.html", data: Buffer.from(html) },
  { path: "OKU.txt", data: Buffer.from(help) },
].map((f) => ({
  path: f.path,
  bytes: f.data.length,
  sha256: createHash("sha256").update(f.data).digest("hex"),
}));
await writeFile(
  `${out}/package.json`,
  JSON.stringify(
    {
      gameId: "pixelgun",
      version: arenaVersion,
      url: service.url,
      name,
      bytes: zip.length,
      sha256: createHash("sha256").update(zip).digest("hex"),
      files,
    },
    null,
    2,
  ),
);
console.log(`Arena ${arenaVersion} runtime ve ZIP hazır: ${zip.length} bayt.`);
