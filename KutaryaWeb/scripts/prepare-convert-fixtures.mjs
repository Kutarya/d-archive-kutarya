// Yalnız test için üretilen, kişisel veri içermeyen gerçek dosyalar.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { createHash } from "node:crypto";
import { Document, Packer, Paragraph } from "docx";
import { textPdf, convertTable } from "../tools-src/convert/codecs.mjs";
import { encodeWav } from "../tools-src/convert/core.mjs";
const dir = "artifacts/convert/fixtures";
await mkdir(dir, { recursive: true });
const text =
  "Merhaba Kutarya!\nTürkçe: ç ğ ı İ ö ş ü — 2026.\nBu dosya dönüştürme kabulü için üretilmiştir.";
await writeFile(`${dir}/turkce.txt`, text);
await writeFile(
  `${dir}/notlar.md`,
  "# Kutarya\n\n**Türkçe** içerik: ş ı ç ğ ü ö İ.\n\n- İlk öğe\n- İkinci öğe\n",
);
await writeFile(
  `${dir}/sayfa.html`,
  '<h1>Kutarya</h1><p>Çağrı &amp; Şule</p><script>throw new Error("calismamali")</script><img src="https://kutarya.invalid/asla"><a href="javascript:alert(1)">Bağlantı</a>',
);
await writeFile(
  `${dir}/veriler.csv`,
  'Ad,Numara,Not\r\nÇağrı,0012,"satır 1\nsatır 2"\r\nŞule,0042,"a,b; c"\r\n',
);
await writeFile(
  `${dir}/veriler.json`,
  JSON.stringify(
    [
      { Ad: "Çağrı", Numara: "0012", Not: "A,B" },
      { Ad: "Şule", Numara: "0042", Not: "iki satır\nmetin" },
    ],
    null,
    2,
  ),
);
const workbook = await convertTable(
  new Uint8Array(await readFile(`${dir}/veriler.csv`)),
  "csv",
  "xlsx",
  { name: "veriler.csv", headers: true },
);
await writeFile(`${dir}/veriler.xlsx`, workbook.files[0].bytes);
await writeFile(
  `${dir}/metin.docx`,
  new Uint8Array(
    await Packer.toArrayBuffer(
      new Document({
        sections: [{ children: text.split("\n").map((t) => new Paragraph(t)) }],
      }),
    ),
  ),
);
const fontBytes = new Uint8Array(
  await readFile("tools-src/convert/assets/NotoSans-Regular.ttf"),
);
await writeFile(
  `${dir}/belge-1.pdf`,
  await textPdf(text, { fontBytes, name: "Belge 1" }),
);
await writeFile(
  `${dir}/belge-2.pdf`,
  await textPdf("İkinci belge\nKutarya PDF birleştirme testi.", {
    fontBytes,
    name: "Belge 2",
  }),
);
const channels = [
  Float32Array.from(
    { length: 32000 },
    (_, i) => Math.sin((2 * Math.PI * 440 * i) / 16000) * 0.4,
  ),
];
await writeFile(`${dir}/ses.wav`, encodeWav(channels, 16000));
await writeFile(
  `${dir}/sekil.svg`,
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#087888"/><circle cx="60" cy="40" r="25" fill="#eeac78"/></svg>',
);
function crc32(b) {
  let c = 0xffffffff;
  for (const v of b) {
    c ^= v;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const tag = Buffer.from(type),
    body = Buffer.concat([tag, data]),
    out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), out.length - 4);
  return out;
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(120, 0);
ihdr.writeUInt32BE(80, 4);
ihdr[8] = 8;
ihdr[9] = 6;
const pixels = Buffer.alloc((120 * 4 + 1) * 80);
for (let y = 0; y < 80; y++)
  for (let x = 0; x < 120; x++) {
    const p = y * (120 * 4 + 1) + 1 + x * 4;
    pixels[p] = Math.round((x / 119) * 255);
    pixels[p + 1] = Math.round((y / 79) * 255);
    pixels[p + 2] = 130;
    pixels[p + 3] = x < 12 ? 0 : 255;
  }
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(pixels)),
  chunk("IEND", Buffer.alloc(0)),
]);
await writeFile(`${dir}/renkler.png`, png);
await writeFile(
  `${dir}/bozuk.png`,
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 2]),
);
await writeFile(`${dir}/sahte.docx`, await readFile(`${dir}/veriler.xlsx`));
await writeFile(
  `${dir}/dis-kaynak.svg`,
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><image href="https://kutarya.invalid/gizli.png"/></svg>',
);
const names = [
  "turkce.txt",
  "notlar.md",
  "sayfa.html",
  "veriler.csv",
  "veriler.json",
  "veriler.xlsx",
  "metin.docx",
  "belge-1.pdf",
  "belge-2.pdf",
  "ses.wav",
  "sekil.svg",
  "renkler.png",
  "bozuk.png",
  "sahte.docx",
  "dis-kaynak.svg",
];
await writeFile(
  "artifacts/convert/fixture-manifest.json",
  JSON.stringify(
    await Promise.all(
      names.map(async (name) => {
        const bytes = await readFile(`${dir}/${name}`);
        return {
          name,
          bytes: bytes.length,
          sha256: createHash("sha256").update(bytes).digest("hex"),
        };
      }),
    ),
    null,
    2,
  ),
);
console.log("15 kişisel veri içermeyen dosya kabul için hazır.");
