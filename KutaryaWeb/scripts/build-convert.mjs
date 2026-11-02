// Ayrı web uygulamasını çevrimdışı, sandbox uyumlu tek HTML'e paketler.
import { build } from "vite";
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, sep } from "node:path";
import { createHash } from "node:crypto";
import { zipSync } from "fflate";
import { Script } from "node:vm";
const root = resolve(fileURLToPath(new URL("../", import.meta.url))),
  source = resolve(root, "tools-src/convert"),
  workerDir = resolve(root, "artifacts/convert-worker"),
  appDir = resolve(root, "artifacts/convert-build"),
  artifacts = resolve(root, "artifacts/convert"),
  preview = resolve(root, "public/tools-preview/convert");
for (const dir of [workerDir, appDir, artifacts, preview])
  if (!dir.startsWith(root + sep))
    throw new Error("Çıktı yolu çalışma alanı dışında.");
await mkdir(artifacts, { recursive: true });
await mkdir(preview, { recursive: true });
await build({
  configFile: false,
  root: source,
  publicDir: false,
  logLevel: "warn",
  build: {
    outDir: workerDir,
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: resolve(source, "codec-worker.mjs"),
      name: "KutaryaCodec",
      formats: ["iife"],
      fileName: () => "codec.js",
    },
  },
});
const worker = await readFile(resolve(workerDir, "codec.js"), "utf8");
await build({
  configFile: false,
  root: source,
  publicDir: false,
  logLevel: "warn",
  plugins: [
    {
      name: "kutarya-worker-inline",
      resolveId(id) {
        if (id === "virtual:kutarya-convert-worker")
          return "\0kutarya-convert-worker";
      },
      load(id) {
        if (id === "\0kutarya-convert-worker")
          return `export default ${JSON.stringify(worker)}`;
      },
    },
  ],
  build: {
    outDir: appDir,
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(source, "app.mjs"),
      name: "KutaryaConvertApp",
      formats: ["iife"],
      fileName: () => "app.js",
    },
  },
});
const js = await readFile(resolve(appDir, "app.js"), "utf8"),
  styles = (await readdir(appDir)).filter((f) => f.endsWith(".css"));
new Script(js, { filename: "convert-app.js" });
if (
  styles.length !== 1 ||
  (await readdir(appDir)).some((f) => !f.endsWith(".css") && !f.endsWith(".js"))
)
  throw new Error("Uygulama dış bağımlılık üretmiş.");
const css = await readFile(resolve(appDir, styles[0]), "utf8");
// Derlenen kaynakta $&, $' ve $` bulunabilir. Fonksiyon kullanmak bunların
// String.replace tarafından değiştirme kalıbı olarak yorumlanmasını önler.
const html = (await readFile(resolve(source, "index.html"), "utf8"))
  .replace("<!-- KUTARYA_STYLE -->", () => `<style>${css}</style>`)
  .replace(
    "<!-- KUTARYA_APP -->",
    () => `<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`,
  );
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
if (!inline) throw new Error("Paketin uygulama kaynağı eksik.");
new Script(inline, { filename: "convert-inline.js" });
await writeFile(resolve(preview, "index.html"), html);
const dependencyLicenses = [];
for (const name of [
  "pdf-lib",
  "@pdf-lib/fontkit",
  "pdfjs-dist",
  "exceljs",
  "docx",
  "mammoth",
  "fflate",
  "marked",
  "htmlparser2",
  "@breezystack/lamejs",
]) {
  const folder = resolve(root, "node_modules", name),
    pkg = JSON.parse(await readFile(resolve(folder, "package.json"), "utf8"));
  const licenseFiles = (await readdir(folder)).filter((f) =>
    /^licen[cs]e|^copying/i.test(f),
  );
  dependencyLicenses.push(
    `\n\n${name} ${pkg.version} — ${pkg.license}\n${typeof pkg.repository === "string" ? pkg.repository : pkg.repository?.url || ""}\n`,
  );
  for (const file of licenseFiles)
    dependencyLicenses.push(await readFile(resolve(folder, file), "utf8"));
}
dependencyLicenses.push(
  "\n\nNoto Sans Regular — SIL OFL 1.1\nhttps://github.com/notofonts/noto-fonts\n" +
    (await readFile(resolve(source, "assets/NotoSans-LICENSE.txt"), "utf8")),
);
dependencyLicenses.push(
  "\n\nMP3 bileşenini yeniden bağlamak:\nKaynak paketi aç; tools-src/convert/app.mjs içindeki mp3Source importunu API uyumlu, tercih ettiğin encoder kaynak dosyasına yönlendir; npm ci ve node scripts/build-convert.mjs çalıştır. Encoder Mp3Encoder, encodeBuffer ve flush arayüzlerini sunmalıdır. Encoder çalışma kodu worker içine değiştirilmeden taşınır. LGPL/GPL metinleri ve upstream kaynak arşivi paket içindedir.\n",
);
let licenseText = dependencyLicenses.join("\n");
for (const filename of ["LGPL-3.0.txt", "GPL-3.0.txt"]) {
  try {
    licenseText +=
      "\n\n" + (await readFile(resolve(source, "assets", filename), "utf8"));
  } catch {
    throw new Error(`Lisans dosyası eksik: ${filename}`);
  }
}
await writeFile(resolve(preview, "LISANSLAR.txt"), licenseText);
await writeFile(
  resolve(preview, "OKU.txt"),
  "Kutarya Convert 1.0.0\nindex.html dosyasını güncel bir tarayıcıda aç. Dosyalar bu sekmede işlenir. Worker ve PDF bileşenleri HTML içindedir; CDN veya dosya yükleme sunucusu gerekmez. Kaynak dosyalar korunur. GIF ilk kare; Word/PDF metin dönüşümünde sayfa düzeni birebir korunmaz; OCR, video, HEIC, eski DOC/XLS ve şifreli belgeler yoktur. Girdi ses/AVIF desteği tarayıcıya bağlıdır.\nKutarya — Tüm hakları saklıdır. Üçüncü taraf bileşenler: LISANSLAR.txt.\n",
);
const files = {};
for (const name of await readdir(preview))
  files[name] = new Uint8Array(await readFile(resolve(preview, name)));
const upstreamSource = resolve(source, "assets/lamejs-source.zip");
files["lamejs-source.zip"] = new Uint8Array(await readFile(upstreamSource));
await copyFile(upstreamSource, resolve(preview, "lamejs-source.zip"));
const zip = zipSync(files, { level: 6 }),
  zipName = "Kutarya-Convert-Web-1.0.0.zip";
await writeFile(resolve(artifacts, zipName), zip);
await writeFile(
  resolve(artifacts, "build.json"),
  JSON.stringify(
    {
      version: "1.0.0",
      at: new Date().toISOString(),
      htmlBytes: Buffer.byteLength(html),
      htmlSha256: createHash("sha256").update(html).digest("hex"),
      package: {
        name: zipName,
        bytes: zip.length,
        sha256: createHash("sha256").update(zip).digest("hex"),
      },
      runtimePreview: "http://127.0.0.1:5180/tools-preview/convert/index.html",
      externalRuntimeAssets: false,
    },
    null,
    2,
  ),
);
console.log(
  `Convert önizlemesi hazır: ${Buffer.byteLength(html)} bayt HTML, ${zip.length} bayt ZIP. Henüz sürüm kaydı/yayın yok.`,
);
