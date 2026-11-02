// Dosya adını değiştirmek yerine içeriği okur; kaynak dosyaya yazmaz.
import { unzipSync, zipSync, strToU8 } from "fflate";
export const LIMITS = {
  files: 20,
  fileBytes: 25 * 1024 * 1024,
  totalBytes: 100 * 1024 * 1024,
  outputBytes: 160 * 1024 * 1024,
  pixels: 24_000_000,
  pages: 80,
  rows: 50_000,
  cells: 200_000,
  textBytes: 5 * 1024 * 1024,
  audioSeconds: 300,
};
export const FORMATS = {
  png: "PNG",
  jpg: "JPEG",
  webp: "WebP",
  pdf: "PDF",
  txt: "TXT",
  html: "HTML",
  docx: "DOCX",
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  xlsx: "XLSX",
  mp3: "MP3",
  wav: "WAV",
  "png-pages": "PNG sayfaları · ZIP",
  "jpg-pages": "JPEG sayfaları · ZIP",
  "pdf-pages": "PDF sayfaları · ZIP",
};
export function targets(type) {
  if (["png", "jpg", "webp", "gif", "bmp", "avif", "svg"].includes(type))
    return ["webp", "png", "jpg", "pdf"];
  if (["txt", "md", "html", "docx"].includes(type))
    return ["pdf", "docx", "txt", "html"];
  if (type === "pdf")
    return [
      "txt",
      "png-pages",
      "jpg-pages",
      "pdf-pages",
      "pdf",
      "docx",
      "html",
    ];
  if (["csv", "tsv", "json", "xlsx"].includes(type))
    return ["xlsx", "csv", "tsv", "json"];
  if (["wav", "mp3", "ogg", "flac", "m4a", "aac"].includes(type))
    return ["mp3", "wav"];
  return [];
}
export function family(type) {
  if (["png", "jpg", "webp", "gif", "bmp", "avif", "svg"].includes(type))
    return "image";
  if (["csv", "tsv", "json", "xlsx"].includes(type)) return "data";
  if (["wav", "mp3", "ogg", "flac", "m4a", "aac"].includes(type))
    return "audio";
  return "document";
}
export function outputName(name, ext) {
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[\u0000-\u001f<>:"/\\|?*]/g, "_")
      .trim()
      .slice(0, 110) || "dosya";
  return `${base}-kutarya.${ext}`;
}
export function uniqueName(name, taken) {
  let result = name,
    n = 2;
  const dot = name.lastIndexOf("."),
    stem = dot > 0 ? name.slice(0, dot) : name,
    ext = dot > 0 ? name.slice(dot) : "";
  while (taken.has(result.toLocaleLowerCase("tr")))
    result = `${stem} (${n++})${ext}`;
  taken.add(result.toLocaleLowerCase("tr"));
  return result;
}
export function sniff(bytes, name = "") {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
    head = new TextDecoder("latin1").decode(b.subarray(0, 32));
  const ext = name.split(".").at(-1).toLowerCase();
  if ((b[0] === 255 && b[1] === 254) || (b[0] === 254 && b[1] === 255))
    return ["csv", "tsv", "json", "md", "html", "htm", "txt"].includes(ext)
      ? ext === "htm"
        ? "html"
        : ext
      : "txt";
  if (b[0] === 137 && head.slice(1, 4) === "PNG") return "png";
  if (b[0] === 255 && b[1] === 216 && b[2] === 255) return "jpg";
  if (/^GIF8[79]a/.test(head)) return "gif";
  if (head.startsWith("BM")) return "bmp";
  if (head.startsWith("RIFF") && head.slice(8, 12) === "WEBP") return "webp";
  if (head.startsWith("RIFF") && head.slice(8, 12) === "WAVE") return "wav";
  if (head.startsWith("%PDF-")) return "pdf";
  if (head.startsWith("OggS")) return "ogg";
  if (head.startsWith("fLaC")) return "flac";
  if (
    head.startsWith("ID3") ||
    (b[0] === 255 && (b[1] & 0xe0) === 0xe0 && (b[1] & 6) !== 0)
  )
    return "mp3";
  if (b[0] === 255 && (b[1] & 0xf6) === 0xf0) return "aac";
  if (head.slice(4, 8) === "ftyp")
    return /avif|avis/.test(head)
      ? "avif"
      : /M4A|mp4|isom/.test(head)
        ? "m4a"
        : "unsupported";
  if (b[0] === 80 && b[1] === 75)
    return ["docx", "xlsx"].includes(ext) ? ext : "unsupported";
  try {
    const text = new TextDecoder("utf-8", { fatal: true })
      .decode(b, { stream: true })
      .replace(/^\ufeff/, "");
    if (/\u0000/.test(text)) return "unsupported";
    if (/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text)) return "svg";
    if (["csv", "tsv", "json", "md", "html", "htm", "txt"].includes(ext))
      return ext === "htm" ? "html" : ext;
    if (!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) return "txt";
  } catch {
    /* İkili veriyi metin diye dönüştürme. */
  }
  return "unsupported";
}
export function decodeText(bytes) {
  if (bytes.length > LIMITS.textBytes)
    throw new Error("Metin dosyası en fazla 5 MB olabilir.");
  try {
    let text;
    if (bytes[0] === 255 && bytes[1] === 254)
      text = new TextDecoder("utf-16le", { fatal: true }).decode(bytes);
    else if (bytes[0] === 254 && bytes[1] === 255)
      text = new TextDecoder("utf-16be", { fatal: true }).decode(bytes);
    else text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (/\u0000/.test(text)) throw new Error();
    return text.replace(/^\ufeff/, "");
  } catch {
    throw new Error(
      "Metin kodlaması okunamadı. UTF-8 veya UTF-16 olarak kaydet.",
    );
  }
}
export function parsePages(value, count) {
  if (!Number.isInteger(count) || count < 1 || count > LIMITS.pages)
    throw new Error(`PDF en fazla ${LIMITS.pages} sayfa olabilir.`);
  if (!value?.trim()) return Array.from({ length: count }, (_, i) => i);
  const result = new Set();
  for (const part of value.split(",")) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error("Sayfaları 1-3,5 biçiminde yaz.");
    const start = Number(match[1]),
      end = Number(match[2] || start);
    if (start < 1 || end < start || end > count)
      throw new Error(`Sayfa aralığı 1–${count} arasında olmalı.`);
    for (let i = start; i <= end; i++) result.add(i - 1);
  }
  return [...result];
}
// ZIP'in merkezi dizinini açmadan kontrol etmek, şişirme bombalarını sınırlamak içindir.
export function inspectOfficeZip(bytes, type) {
  const b = new Uint8Array(bytes),
    view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let end = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--)
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i;
      break;
    }
  if (end < 0 || view.getUint16(end + 4, true) || view.getUint16(end + 6, true))
    throw new Error("Office arşivi geçersiz veya çok parçalı.");
  const count = view.getUint16(end + 10, true),
    offset = view.getUint32(end + 16, true);
  if (count > 3000 || offset >= end || offset === 0xffffffff)
    throw new Error("Office arşivi bu işlem için çok büyük.");
  let p = offset,
    total = 0;
  const names = new Set();
  for (let i = 0; i < count; i++) {
    if (p + 46 > end || view.getUint32(p, true) !== 0x02014b50)
      throw new Error("Office arşiv dizini bozuk.");
    const flags = view.getUint16(p + 8, true),
      method = view.getUint16(p + 10, true),
      size = view.getUint32(p + 24, true);
    const n = view.getUint16(p + 28, true),
      extra = view.getUint16(p + 30, true),
      comment = view.getUint16(p + 32, true);
    total += size;
    if (
      flags & 1 ||
      ![0, 8].includes(method) ||
      size > 32 * 1024 * 1024 ||
      total > 64 * 1024 * 1024 ||
      p + 46 + n + extra + comment > end
    )
      throw new Error(
        "Şifreli veya aşırı genişleyen Office arşivi desteklenmiyor.",
      );
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + n));
    if (
      name.includes("..") ||
      name.startsWith("/") ||
      name.includes("\\") ||
      names.has(name)
    )
      throw new Error("Office arşivinde geçersiz dosya yolu var.");
    names.add(name);
    p += 46 + n + extra + comment;
  }
  const required = type === "docx" ? "word/document.xml" : "xl/workbook.xml";
  if (!names.has("[Content_Types].xml") || !names.has(required))
    throw new Error(`İçerik gerçek bir ${type.toUpperCase()} belgesi değil.`);
  // Gerçek açılmış boyut da doğrulanır; yalnız dizindeki beyana güvenilmez.
  const expanded = unzipSync(b, {
    filter: (f) => f.originalSize <= 32 * 1024 * 1024,
  });
  if (
    Object.values(expanded).reduce((sum, f) => sum + f.length, 0) >
    64 * 1024 * 1024
  )
    throw new Error("Office içeriği çok büyük.");
  return expanded;
}
export function parseDelimited(text, separator = "auto") {
  const t = text.replace(/^\ufeff/, "");
  if (separator === "auto") {
    const counts = new Map([
      [",", 0],
      [";", 0],
      ["\t", 0],
    ]);
    let inQuote = false;
    for (let i = 0; i < t.length; i++) {
      if (t[i] === '"') {
        if (inQuote && t[i + 1] === '"') i++;
        else inQuote = !inQuote;
      } else if (!inQuote) {
        if (t[i] === "\n" || t[i] === "\r") break;
        if (counts.has(t[i])) counts.set(t[i], counts.get(t[i]) + 1);
      }
    }
    separator = [...counts].sort((a, b) => b[1] - a[1])[0][0];
  }
  if (![",", ";", "\t"].includes(separator))
    throw new Error("Ayırıcı geçersiz.");
  const rows = [];
  let row = [],
    cell = "",
    quoted = false,
    afterQuote = false,
    cells = 0;
  const finishCell = () => {
    row.push(cell);
    cell = "";
    afterQuote = false;
    if (++cells > LIMITS.cells || row.length > 200)
      throw new Error("Tablo en fazla 200 sütun ve 200.000 hücre olabilir.");
  };
  const finishRow = () => {
    finishCell();
    rows.push(row);
    row = [];
    if (rows.length > LIMITS.rows)
      throw new Error("Tablo satır sınırını aşıyor.");
  };
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else cell += c;
      continue;
    }
    if (c === '"') {
      if (cell || afterQuote)
        throw new Error("Tabloda tırnak kullanımı geçersiz.");
      quoted = true;
    } else if (c === separator) finishCell();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      finishRow();
    } else if (afterQuote) {
      if (!/\s/.test(c))
        throw new Error("Kapanan tırnaktan sonra ayırıcı bekleniyor.");
    } else cell += c;
  }
  if (quoted) throw new Error("Tabloda kapanmamış tırnak var.");
  if (row.length || cell || afterQuote) finishRow();
  if (!rows.length) throw new Error("Tabloda veri yok.");
  return rows;
}
export function safeCell(value, protect = true) {
  const text = value == null ? "" : String(value);
  return protect &&
    /^[\s]*[=+@-]/.test(text) &&
    !/^\s*-?\d+(?:[.,]\d+)?\s*$/.test(text)
    ? "'" + text
    : text;
}
export function writeDelimited(rows, separator = ",", protect = true) {
  return rows
    .map((row) =>
      row
        .map((v) => {
          const s = safeCell(v, protect);
          return /["\r\n]/.test(s) || s.includes(separator)
            ? '"' + s.replaceAll('"', '""') + '"'
            : s;
        })
        .join(separator),
    )
    .join("\r\n");
}
export function rowsToJson(rows, headers = true) {
  if (!headers) return rows;
  const names = rows[0].map(String);
  if (names.some((n) => !n.trim()) || new Set(names).size !== names.length)
    throw new Error(
      "Başlıklar boş veya tekrarlı. İlk satır başlık ayarını kapat.",
    );
  return rows
    .slice(1)
    .map((row) => Object.fromEntries(names.map((n, i) => [n, row[i] ?? ""])));
}
export function jsonToRows(value, headers = true) {
  if (!Array.isArray(value) || !value.length)
    throw new Error(
      "JSON tablo çıktısı için boş olmayan bir nesne veya satır dizisi gerekir.",
    );
  if (value.every(Array.isArray)) return value.map((row) => row.map(flatValue));
  if (!value.every((v) => v && typeof v === "object" && !Array.isArray(v)))
    throw new Error("JSON tablosunun her satırı nesne olmalı.");
  const names = [...new Set(value.flatMap(Object.keys))];
  if (names.length > 200) throw new Error("Tablo en fazla 200 sütun olabilir.");
  const rows = value.map((v) => names.map((n) => flatValue(v[n])));
  return headers ? [names, ...rows] : rows;
}
function flatValue(v) {
  return v == null ? "" : typeof v === "object" ? JSON.stringify(v) : v;
}
export function zipOutputs(files) {
  const map = {},
    taken = new Set();
  let total = 0;
  for (const file of files) {
    total += file.bytes.length;
    if (total > LIMITS.outputBytes)
      throw new Error(
        "Toplu çıktı 160 MB sınırını aşıyor. Daha küçük bir grup seç.",
      );
    map[uniqueName(file.name, taken)] = file.bytes;
  }
  if (!files.length) throw new Error("İndirilecek sonuç yok.");
  return zipSync(map, { level: 3 });
}
export const textFile = (name, text, mime = "text/plain;charset=utf-8") => ({
  name,
  bytes: strToU8(text),
  mime,
});
export function encodeWav(channels, rate) {
  const count = channels.length,
    frames = channels[0]?.length || 0;
  if (
    ![1, 2].includes(count) ||
    !frames ||
    channels.some((c) => c.length !== frames) ||
    ![16000, 22050, 44100, 48000].includes(rate)
  )
    throw new Error("Ses örnekleri geçersiz.");
  const result = new Uint8Array(44 + frames * count * 2),
    view = new DataView(result.buffer);
  const word = (offset, s) =>
    [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  word(0, "RIFF");
  view.setUint32(4, result.length - 8, true);
  word(8, "WAVE");
  word(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, count, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * count * 2, true);
  view.setUint16(32, count * 2, true);
  view.setUint16(34, 16, true);
  word(36, "data");
  view.setUint32(40, frames * count * 2, true);
  for (let i = 0; i < frames; i++)
    for (let c = 0; c < count; c++) {
      const v = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(
        44 + (i * count + c) * 2,
        v < 0 ? v * 32768 : v * 32767,
        true,
      );
    }
  return result;
}
