// Paylaşım sitesini, kimlikleri veya kullanıcı dosyalarını kaynak ZIP'ine almaz.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { zipSync, strToU8 } from "fflate";
const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const output = resolve(root, "artifacts/convert/source-package");
if (!output.startsWith(root + sep))
  throw new Error("Paket yolu proje dışında.");
await mkdir(output, { recursive: true });
const repoPackage = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
);
const names = [
  "@breezystack/lamejs",
  "@pdf-lib/fontkit",
  "docx",
  "exceljs",
  "fflate",
  "htmlparser2",
  "mammoth",
  "marked",
  "pdf-lib",
  "pdfjs-dist",
];
const pkg = {
  name: "kutarya-convert",
  version: "1.0.0",
  private: true,
  type: "module",
  engines: { node: ">=24" },
  scripts: {
    build: "node scripts/build-convert.mjs",
    test: "node --test tests/convert.test.mjs",
  },
  dependencies: Object.fromEntries(
    names.map((n) => [n, repoPackage.dependencies[n]]),
  ),
  devDependencies: { vite: repoPackage.devDependencies.vite },
  overrides: { exceljs: { uuid: "11.1.1" } },
};
await writeFile(
  resolve(output, "package.json"),
  JSON.stringify(pkg, null, 2) + "\n",
);
await new Promise((done, fail) => {
  const child = spawn(
    process.execPath,
    [
      resolve(dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
      "install",
      "--package-lock-only",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    { cwd: output, stdio: "inherit", windowsHide: true },
  );
  child.on("error", fail);
  child.on("exit", (code) =>
    code === 0 ? done() : fail(new Error(`Lock oluşturulamadı: ${code}`)),
  );
});
const files = {};
async function add(relative) {
  files[relative.replaceAll("\\", "/")] = new Uint8Array(
    await readFile(resolve(root, relative)),
  );
}
async function walk(relative) {
  for (const item of await readdir(resolve(root, relative), {
    withFileTypes: true,
  })) {
    if (item.isSymbolicLink()) throw new Error("Kaynakta symlink yok.");
    const child = relative + "/" + item.name;
    if (item.isDirectory()) await walk(child);
    else await add(child);
  }
}
await walk("tools-src/convert");
for (const file of [
  "scripts/build-convert.mjs",
  "scripts/prepare-convert-fixtures.mjs",
  "tests/convert.test.mjs",
])
  await add(file);
for (const name of ["package.json", "package-lock.json"])
  files[name] = new Uint8Array(await readFile(resolve(output, name)));
files["README.md"] = strToU8(
  "# Kutarya Convert 1.0.0\n\nGörsel, belge/PDF, tablo ve ses için tarayıcı uygulaması. Dosyaları sunucuya yüklemez. Kaynak dosyaları korur.\n\nNode.js 24+ ile `npm ci`, `npm test`, `npm run build`. Hazır tek HTML: public/tools-preview/convert/index.html. Arşiv: artifacts/convert/Kutarya-Convert-Web-1.0.0.zip.\n\nPDF/DOCX metin dönüşümü yerleşimi birebir korumaz; GIF ilk kare; AVIF ve ses girdileri tarayıcıya bağlıdır. OCR, video, HEIC, eski DOC/XLS ve şifreli belgeler yoktur.\n\nÜçüncü taraf lisansları LISANSLAR.txt; kaynak/lisans dosyaları tools-src/convert/assets içinde. MP3 encoder değiştirilmeden ayrı worker içinde çalışır; yeniden bağlama talimatı LISANSLAR.txt içinde.\n\nKutarya uygulama kodu: Tüm hakları saklıdır.\n",
);
files["LISANSLAR.txt"] = new Uint8Array(
  await readFile(resolve(root, "public/tools-preview/convert/LISANSLAR.txt")),
);
files[".gitignore"] = strToU8(
  "node_modules/\nartifacts/\npublic/tools-preview/\n",
);
const result = zipSync(files, { level: 6 });
await writeFile(
  resolve(root, "artifacts/convert/Kutarya-Convert-Kaynak-1.0.0.zip"),
  result,
);
console.log(
  `Kaynak paketi: ${Object.keys(files).length} izinli dosya, ${result.length} bayt. Özel hesap/proje verisi yok.`,
);
