import {
  realpath,
  readdir,
  readFile,
  writeFile,
  mkdir,
  cp,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { parseDocument } from "htmlparser2";
const args = process.argv.slice(2);
const [input, gameId, version] = args;
if (
  !input ||
  !/^[a-z0-9][a-z0-9-]{0,63}$/.test(gameId || "") ||
  !/^[a-z0-9][a-z0-9.-]{0,39}$/.test(version || "") ||
  (version || "").includes("..")
)
  throw new Error(
    "Kullanım: node scripts/import-game.mjs <build-klasörü> <oyun-kimliği> <sürüm>",
  );
const source = await realpath(input);
const destination = path.resolve("public", "games", gameId, version);
if (
  destination === source ||
  destination.startsWith(source + path.sep) ||
  source.startsWith(destination + path.sep)
)
  throw new Error("Kaynak ve çıktı klasörleri birbirini içeremez.");
const entry = await readFile(path.join(source, "index.html"), "utf8");
if (!/<html(?:\s|>)/i.test(entry))
  throw new Error("Geçerli index.html bulunamadı.");
const files = [];
let total = 0;
async function walk(folder) {
  for (const item of await readdir(folder, { withFileTypes: true })) {
    if (item.isSymbolicLink())
      throw new Error("Sembolik bağlantı kabul edilmez.");
    const absolute = path.join(folder, item.name);
    if (item.isDirectory()) await walk(absolute);
    else {
      const relative = path.relative(source, absolute).replaceAll("\\", "/");
      if (/[<>"#?]/.test(relative) || relative.startsWith(".."))
        throw new Error("Geçersiz paket yolu.");
      const bytes = (await stat(absolute)).size;
      total += bytes;
      if (total > 1024 * 1024 * 1024)
        throw new Error("Paket 1 GB sınırını aşıyor.");
      const hash = createHash("sha256");
      for await (const chunk of createReadStream(absolute)) hash.update(chunk);
      files.push({
        path: relative,
        bytes,
        sha256: hash.digest("hex"),
      });
    }
  }
}
await walk(source);
// Script içindeki HTML örnekleri paket varlığı değildir. Gerçek HTML
// düğümlerini ayrıştır; yol ve eksik varlık kontrollerini aynen uygula.
const assetPaths = [];
function collect(nodes) {
  for (const node of nodes) {
    for (const key of ["src", "href"]) {
      const value = node.attribs?.[key];
      if (value) assetPaths.push(value);
    }
    if (node.children) collect(node.children);
  }
}
collect(parseDocument(entry).children);
for (const asset of assetPaths) {
  if (/^(https?:|data:|#)/.test(asset)) continue;
  if (asset.startsWith("/") || asset.includes(".."))
    throw new Error(
      "Paket içi kaynak yolları göreli ve paket sınırları içinde olmalı.",
    );
  const clean = asset.split(/[?#]/)[0].replace(/^\.\//, "");
  if (!files.some((f) => f.path === clean))
    throw new Error(`Eksik varlık: ${clean}`);
}
const wasm = files.find((f) => /\.wasm(\.gz|\.br)?$/.test(f.path));
const compression = files.some((f) => f.path.endsWith(".br"))
  ? "br"
  : files.some((f) => f.path.endsWith(".gz"))
    ? "gzip"
    : "none";
try {
  await stat(destination);
  throw new Error("Bu sürüm yolu zaten var. Yeni bir sürüm kullan.");
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
await mkdir(path.dirname(destination), { recursive: true });
await cp(source, destination, {
  recursive: true,
  errorOnExist: true,
  force: false,
});
const manifest = {
  gameId,
  version,
  entry: `/games/${gameId}/${version}/index.html`,
  kind: wasm ? "unity" : "web",
  compression,
  totalBytes: total,
  files,
  verified: false,
  createdAt: new Date().toISOString(),
  note: "Dosya bütünlüğü kontrol edildi. Gerçek tarayıcı kabulü henüz yapılmadı.",
};
await writeFile(
  path.join(destination, "kutarya-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Paket içe aktarıldı: ${files.length} dosya, ${total} bayt. Önizleme: ${manifest.entry}. Tarayıcı kabulü olmadan doğrulanmış sürüm sayılmaz.`,
);
