import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { zipSync, unzipSync, strToU8 } from "fflate";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth/mammoth.browser.js";
import { Mp3Encoder } from "@breezystack/lamejs";
import {
  sniff,
  decodeText,
  parseDelimited,
  writeDelimited,
  rowsToJson,
  jsonToRows,
  parsePages,
  inspectOfficeZip,
  encodeWav,
  uniqueName,
  zipOutputs,
} from "../tools-src/convert/core.mjs";
import {
  convertTable,
  convertDocument,
  textPdf,
  mergePdf,
  rewritePdf,
  convertAudio,
} from "../tools-src/convert/codecs.mjs";
import { readHtml, readMarkdown } from "../tools-src/convert/content.mjs";
const fontBytes = new Uint8Array(
  await readFile(
    new URL(
      "../tools-src/convert/assets/NotoSans-Regular.ttf",
      import.meta.url,
    ),
  ),
);
const text = "Çağrı, Şule, İpek — ç ğ ı İ ö ş ü.",
  opts = { name: "ornek.txt", fontBytes, headers: true },
  bytes = strToU8(text);
test("Tür belirleme uzantıya değil ikili imzaya bakar; UTF-16 ses sanılmaz", () => {
  assert.equal(
    sniff(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), "ornek.txt"),
    "png",
  );
  const utf16 = new Uint8Array([255, 254, 65, 0, 66, 0]);
  assert.equal(sniff(utf16, "ornek.txt"), "txt");
  assert.equal(decodeText(utf16), "AB");
  assert.equal(sniff(strToU8("normal metin"), "README"), "txt");
});
test("CSV tırnak, satır sonu ve virgül içerikleri kaybolmaz", () => {
  const input = 'ad,not\r\nÇağrı,"a,b\nikinci satır"\r\nŞule,"iki ""tırnak"""';
  const rows = parseDelimited(input);
  assert.deepEqual(rows, [
    ["ad", "not"],
    ["Çağrı", "a,b\nikinci satır"],
    ["Şule", 'iki "tırnak"'],
  ]);
  assert.deepEqual(parseDelimited(writeDelimited(rows, ",", false)), rows);
});
test("Otomatik CSV ayırıcı tırnak içindeki virgüllerden etkilenmez", () =>
  assert.deepEqual(parseDelimited('ad;not\nÇağrı;"a,b,c"'), [
    ["ad", "not"],
    ["Çağrı", "a,b,c"],
  ]));
test("Bozuk CSV ve yinelenen JSON başlıkları veri kaybetmeden reddedilir", () => {
  assert.throws(() => parseDelimited('a,b\n"yarım'), /tırnak/);
  assert.throws(
    () =>
      rowsToJson([
        ["ad", "ad"],
        ["a", "b"],
      ]),
    /tekrarlı/,
  );
});
test("CSV güvenli önek yalnız formül benzeri metne eklenir, negatif sayı korunur", () => {
  assert.equal(
    writeDelimited([["=SUM(A1:A2)", "-42", "0012", "@cmd"]]),
    "'=SUM(A1:A2),-42,0012,'@cmd",
  );
});
test("JSON farklı anahtarları ve iç içe değerleri tabloya taşır; prototip kirletmez", () => {
  const value = JSON.parse(
    '[{"__proto__":"koru","ad":"Çağrı"},{"ek":{"x":1}}]',
  );
  const rows = jsonToRows(value);
  assert.deepEqual(rows[0], ["__proto__", "ad", "ek"]);
  const data = rowsToJson(rows);
  assert.equal(data[0].__proto__, "koru");
  assert.equal({}.koru, undefined);
  assert.equal(data[1].ek, '{"x":1}');
});
test("Sayfa seçimi sınırları ve tekrarlı sayfalar doğru uygulanır", () => {
  assert.deepEqual(parsePages("1-3,2,5", 5), [0, 1, 2, 4]);
  assert.throws(() => parsePages("0,1", 4));
  assert.throws(() => parsePages("1-6", 5));
  assert.throws(() => parsePages("1", 81));
});
test("Office etiketi verilmiş farklı ZIP içeriği gerçek DOCX sayılmaz", () => {
  const fake = zipSync({
    "[Content_Types].xml": strToU8("x"),
    "xl/workbook.xml": strToU8("x"),
  });
  assert.throws(() => inspectOfficeZip(fake, "docx"), /gerçek bir DOCX/);
});
test("Office merkezi dizinindeki dev boyut açılmadan reddedilir", () => {
  const zip = zipSync({
      "[Content_Types].xml": strToU8("x"),
      "word/document.xml": strToU8("x"),
    }),
    view = new DataView(zip.buffer);
  for (let i = 0; i < zip.length - 46; i++)
    if (view.getUint32(i, true) === 0x02014b50) {
      view.setUint32(i + 24, 256 * 1024 * 1024, true);
      break;
    }
  assert.throws(() => inspectOfficeZip(zip, "docx"), /aşırı/);
});
test("Gerçek XLSX yazılır; Unicode, baştaki sıfırlar ve çok satırlı hücreler geri okunur", async () => {
  const input = 'ad,no,not\nÇağrı,0012,"bir\niki"\nŞule,0042,son';
  const result = await convertTable(strToU8(input), "csv", "xlsx", {
    ...opts,
    name: "veri.csv",
  });
  assert.equal(sniff(result.files[0].bytes, "veri.xlsx"), "xlsx");
  const entries = inspectOfficeZip(result.files[0].bytes, "xlsx");
  assert(entries["xl/worksheets/sheet1.xml"]);
  const roundtrip = await convertTable(
    result.files[0].bytes,
    "xlsx",
    "json",
    opts,
  );
  assert.deepEqual(
    JSON.parse(new TextDecoder().decode(roundtrip.files[0].bytes)),
    [
      { ad: "Çağrı", no: "0012", not: "bir\niki" },
      { ad: "Şule", no: "0042", not: "son" },
    ],
  );
});
test("Birden fazla çalışma sayfası JSON ve ayrı CSV sonuçlarında korunur", async () => {
  const data = { İlk: [{ Ad: "Çağrı" }], İkinci: [{ Ad: "Şule" }] };
  const xlsx = await convertTable(
    strToU8(JSON.stringify(data)),
    "json",
    "xlsx",
    opts,
  );
  const csv = await convertTable(xlsx.files[0].bytes, "xlsx", "csv", opts);
  assert.equal(csv.files.length, 2);
  assert.match(new TextDecoder().decode(csv.files[1].bytes), /Şule/);
});
test("HTML etkin içerik, dış görseller ve tehlikeli bağlantılar olmadan aktarılır", () => {
  const result = readHtml(
    '<h1>Çağrı &amp; Şule</h1><script>gizli()</script><img src="https://ornek.invalid/x"><a onclick="x()" href="javascript:alert(1)">Oku</a>',
  );
  assert.equal(result.text, "Çağrı & Şule\n\nOku");
  assert(!result.html.includes("gizli"));
  assert(!/script|onclick|javascript:|ornek.invalid/.test(result.html));
});
test("Markdown gerçek HTML etiketlerine ve okunur metne dönüşür", () => {
  const result = readMarkdown("# Başlık\n\n**Kutarya** ve *Şule*\n\n- öğe");
  assert.match(result.html, /<h1>Başlık/);
  assert.match(result.html, /<strong>Kutarya/);
  assert(!result.text.includes("**"));
});
test("Yeni DOCX paketi gerçek Word XML'i içerir, bağımsız Mammoth okuyucu Türkçeyi korur", async () => {
  const docx = await convertDocument(bytes, "txt", "docx", opts);
  const entries = inspectOfficeZip(docx.files[0].bytes, "docx");
  assert(entries["word/document.xml"]);
  const read = await mammoth.extractRawText({
    arrayBuffer: docx.files[0].bytes.buffer,
  });
  assert.equal(read.value.trim(), text);
});
test("Metinden PDF'de Türkçe font gömülür ve belge tekrar açılır", async () => {
  const pdf = await textPdf(text, opts);
  assert.equal(sniff(pdf, "ornek.pdf"), "pdf");
  const doc = await PDFDocument.load(pdf);
  assert.equal(doc.getPageCount(), 1);
  assert((await doc.save()).length > 1000);
});
test("PDF birleştirme, ayırma, sayfa seçimi ve döndürme gerçek sayfaları korur", async () => {
  const a = await textPdf("Birinci", opts),
    b = await textPdf("İkinci", opts),
    merged = await mergePdf([{ bytes: a }, { bytes: b }], opts);
  assert.equal(
    (await PDFDocument.load(merged.files[0].bytes)).getPageCount(),
    2,
  );
  const selected = await rewritePdf(merged.files[0].bytes, "pdf", {
    ...opts,
    pages: "2",
    pdfRotation: 90,
  });
  const doc = await PDFDocument.load(selected.files[0].bytes);
  assert.equal(doc.getPageCount(), 1);
  assert.equal(doc.getPage(0).getRotation().angle, 90);
  const split = await rewritePdf(merged.files[0].bytes, "pdf-pages", opts);
  const files = unzipSync(split.files[0].bytes);
  assert.equal(Object.keys(files).length, 2);
  for (const bytes of Object.values(files))
    assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
});
test("WAV gerçek PCM16 başlığı, kanal düzeni ve örnek değerleri içerir", () => {
  const wav = encodeWav(
      [new Float32Array([-1, 0, 1]), new Float32Array([0.5, -0.5, 0])],
      16000,
    ),
    v = new DataView(wav.buffer);
  assert.equal(sniff(wav, "x.wav"), "wav");
  assert.equal(v.getUint32(24, true), 16000);
  assert.equal(v.getUint16(22, true), 2);
  assert.equal(v.getUint32(40, true), 12);
  assert.equal(v.getInt16(44, true), -32768);
  assert.equal(v.getInt16(46, true), 16383);
  assert.equal(v.getInt16(52, true), 32767);
});
test("MP3 PCM'yi gerçekten kodlar, RIFF kopyası veya yalnız yeni uzantı üretmez", () => {
  const input = Float32Array.from(
      { length: 16000 },
      (_, i) => Math.sin((i * Math.PI * 2 * 440) / 16000) * 0.3,
    ),
    result = convertAudio(
      [input],
      "mp3",
      { name: "ses.wav", sampleRate: 16000, bitrate: 128 },
      Mp3Encoder,
    );
  assert.equal(sniff(result.files[0].bytes, "ses.mp3"), "mp3");
  assert(result.files[0].bytes.length > 1000);
  assert(result.files[0].bytes.length < 32044);
});
test("Aynı adlı sonuçlar ZIP içinde ayrı tutulur ve orijinal baytlar korunur", () => {
  const files = [
      { name: "örnek.txt", bytes: strToU8("bir") },
      { name: "örnek.txt", bytes: strToU8("iki") },
    ],
    entries = unzipSync(zipOutputs(files));
  assert.deepEqual(Object.keys(entries), ["örnek.txt", "örnek (2).txt"]);
  assert.equal(new TextDecoder().decode(entries["örnek (2).txt"]), "iki");
  const names = new Set();
  assert.equal(uniqueName("A.txt", names), "A.txt");
  assert.equal(uniqueName("a.txt", names), "a (2).txt");
});
