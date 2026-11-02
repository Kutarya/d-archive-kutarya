// CUA ile indirilen gerçek çıktıları bağımsız okuyucularla denetler.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import ExcelJS from "exceljs";
import mammoth from "mammoth/mammoth.browser.js";
import { execFileSync } from "node:child_process";
const read = (path) => readFile(path),
  sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const downloads = "C:/Users/yunus/Downloads/";
const batch = unzipSync(
  await read(downloads + "kutarya-donusturulenler (3).zip"),
);
assert.deepEqual(
  Object.keys(batch).sort(),
  [
    "renkler-kutarya.webp",
    "turkce-kutarya.pdf",
    "veriler-kutarya.xlsx",
    "ses-kutarya.mp3",
  ].sort(),
);
assert.equal(
  Buffer.from(batch["renkler-kutarya.webp"].slice(8, 12)).toString(),
  "WEBP",
);
assert.equal(
  (await PDFDocument.load(batch["turkce-kutarya.pdf"])).getPageCount(),
  1,
);
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(batch["veriler-kutarya.xlsx"]);
assert.equal(workbook.worksheets[0].getCell("B2").value, "0012");
assert.equal(workbook.worksheets[0].getCell("C2").value, "satır 1\nsatır 2");
assert.equal(workbook.worksheets[0].getCell("A3").value, "Şule");
const text = await read(
  "artifacts/convert/browser-outputs/turkce-kutarya-kutarya.txt",
);
assert(text.toString().includes("ç ğ ı İ ö ş ü"));
const json = JSON.parse(
  await read("artifacts/convert/browser-outputs/veriler-kutarya-kutarya.json"),
);
assert.equal(json[0].Numara, "0012");
assert.equal(json[0].Not, "satır 1\nsatır 2");
const html = await read("artifacts/convert/browser-outputs/metin-kutarya.html");
assert(html.toString().includes("Türkçe: ç ğ ı İ ö ş ü"));
assert(!/<script|javascript:|https?:\/\/example\.com/i.test(html.toString()));
const docx = await read("artifacts/convert/browser-outputs/sayfa-kutarya.docx"),
  raw = (await mammoth.extractRawText({ arrayBuffer: docx })).value;
assert(raw.includes("Çağrı & Şule"));
assert(!raw.includes("throw"));
const merged = await PDFDocument.load(
  await read(downloads + "kutarya-birlestirilmis.pdf"),
);
assert.equal(merged.getPageCount(), 2);
const pages = unzipSync(
  await read(downloads + "kutarya-birlestirilmis-kutarya.zip"),
);
assert.equal(Object.keys(pages).length, 2);
for (const bytes of Object.values(pages)) {
  assert.equal(
    new DataView(bytes.buffer, bytes.byteOffset).getUint32(16),
    1263,
  );
  assert.equal(new DataView(bytes.buffer, bytes.byteOffset).getUint32(20), 893);
}
const split = unzipSync(
  await read(downloads + "kutarya-birlestirilmis-kutarya (1).zip"),
);
assert.equal(Object.keys(split).length, 1);
const single = await PDFDocument.load(Object.values(split)[0]);
assert.equal(single.getPageCount(), 1);
assert.equal(single.getPages()[0].getRotation().angle, 90);
const mp3 = JSON.parse(
  execFileSync(
    "C:/Users/yunus/AppData/Local/Programs/Python/Python312/Scripts/ffprobe.exe",
    [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_name,sample_rate,channels",
      "-show_entries",
      "format=duration",
      "-of",
      "json",
      "artifacts/convert/browser-outputs/ses-kutarya.mp3",
    ],
    { encoding: "utf8" },
  ),
);
assert.equal(mp3.streams[0].codec_name, "mp3");
assert.equal(mp3.streams[0].channels, 2);
assert(Math.abs(Number(mp3.format.duration) - 2) < 0.1);
const build = JSON.parse(await read("artifacts/convert/build.json")),
  runtime = await read("public/games/kutarya-convert/1.0.0/index.html");
assert.equal(sha(runtime), build.htmlSha256);
const source = unzipSync(
  await read("artifacts/convert/Kutarya-Convert-Kaynak-1.0.0.zip"),
);
assert.equal(Object.keys(source).length, 20);
assert(
  !Object.keys(source).some((n) =>
    /\.env|credentials|node_modules|firebase|kutarya-os/i.test(n),
  ),
);
const reproducible = await read(
  "artifacts/convert/source-package/public/tools-preview/convert/index.html",
);
assert.equal(sha(reproducible), build.htmlSha256);
await writeFile(
  "artifacts/convert/browser-acceptance.json",
  JSON.stringify(
    {
      gameId: "kutarya-convert",
      version: "1.0.0",
      passed: true,
      at: new Date().toISOString(),
      url: "http://127.0.0.1:5180/games/kutarya-convert/1.0.0/index.html",
      htmlSha256: build.htmlSha256,
      productionChanged: false,
      finalBrowserBatch: "4/4, konsolda hata yok",
      verifiedOutputs: Object.entries(batch).map(([name, b]) => ({
        name,
        bytes: b.length,
        sha256: sha(b),
      })),
      roundTrips: [
        "PDF → TXT Türkçe",
        "XLSX → JSON baştaki sıfırlar ve satır sonları",
        "MP3 → WAV",
      ],
      pdf: {
        mergePages: 2,
        renderedPages: 2,
        renderedSize: [1263, 893],
        splitPages: 1,
        rotation: 90,
      },
      audio: mp3,
      drop: "Aynı belgeye sentetik DataTransfer ile 2 dosya bırakıldı ve 2/2 dönüştü; Explorer hareketi ölçülmedi.",
      cancel:
        "120 saniye test WAV → MP3 işlemi kullanıcı düğmesiyle durduruldu.",
      errorIsolation:
        "7 dosya: 4 başarılı, bozuk PNG / sahte DOCX / dış kaynaklı SVG için 3 ayrı hata",
      source: { entries: 20, tests: "19/19", buildHtmlIdentical: true },
      pending: [
        "Canlı yayın onayı",
        "Fiziksel telefon / Explorer dosya sürükleme",
        "Desteklenen her girdi kodekinin ayrı cihazlarda kabulü",
      ],
    },
    null,
    2,
  ),
);
console.log(
  "Gerçek tarayıcı çıktıları bağımsız açıldı; aynı HTML kaynak paketinden yeniden üretildi. Kabul kaydedildi.",
);
