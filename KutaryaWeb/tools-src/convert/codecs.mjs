import ExcelJS from "exceljs/dist/exceljs.min.js";
import { PDFDocument, degrees, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import mammoth from "mammoth/mammoth.browser.js";
import { Document, Packer, Paragraph, TextRun } from "docx";
import {
  LIMITS,
  decodeText,
  inspectOfficeZip,
  jsonToRows,
  rowsToJson,
  parseDelimited,
  writeDelimited,
  outputName,
  textFile,
  parsePages,
  zipOutputs,
  encodeWav,
} from "./core.mjs";
import { htmlDocument } from "./content.mjs";

const validateRows = (rows) => {
  if (
    !rows.length ||
    rows.length > LIMITS.rows ||
    rows.some((r) => r.length > 200) ||
    rows.reduce((n, r) => n + r.length, 0) > LIMITS.cells
  )
    throw new Error(
      "Tablo en fazla 50.000 satır, 200 sütun ve 200.000 hücre olabilir.",
    );
  return rows;
};
const valueOfCell = (value) => {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return value;
  if ("formula" in value || "sharedFormula" in value)
    return value.result ?? "=" + (value.formula || "");
  if (value.richText) return value.richText.map((r) => r.text).join("");
  return value.text || value.error || "";
};
export async function convertTable(bytes, type, target, opts = {}) {
  const warnings = [],
    sheets = [];
  if (type === "xlsx") {
    inspectOfficeZip(bytes, "xlsx");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(bytes);
    for (const ws of workbook.worksheets) {
      if (!ws.actualRowCount) continue;
      if (ws.rowCount > LIMITS.rows || ws.columnCount > 200)
        throw new Error("Çalışma sayfası satır/sütun sınırını aşıyor.");
      const rows = Array.from({ length: ws.rowCount }, (_, i) =>
        Array.from({ length: ws.columnCount }, (_, j) =>
          valueOfCell(ws.getRow(i + 1).getCell(j + 1).value),
        ),
      );
      sheets.push({ name: ws.name, rows: validateRows(rows) });
    }
    warnings.push(
      "Tablo değerleri aktarılır; hücre biçimleri ve formüllerin çalışma mantığı taşınmaz.",
    );
  } else if (type === "json") {
    const value = JSON.parse(decodeText(bytes));
    if (target === "json")
      return {
        files: [
          textFile(
            outputName(opts.name, "json"),
            JSON.stringify(value, null, 2),
            "application/json",
          ),
        ],
        warnings,
      };
    if (Array.isArray(value))
      sheets.push({
        name: "Veriler",
        rows: validateRows(jsonToRows(value, opts.headers !== false)),
      });
    else if (
      value &&
      typeof value === "object" &&
      Object.values(value).length &&
      Object.values(value).every(Array.isArray)
    ) {
      for (const [name, values] of Object.entries(value))
        sheets.push({
          name,
          rows: validateRows(jsonToRows(values, opts.headers !== false)),
        });
    } else
      throw new Error(
        "CSV/XLSX için JSON’un satır dizisi veya sayfa adı → satır dizileri nesnesi olması gerekir.",
      );
  } else
    sheets.push({
      name: "Veriler",
      rows: validateRows(
        parseDelimited(
          decodeText(bytes),
          type === "tsv" ? "\t" : opts.separator || "auto",
        ),
      ),
    });
  if (!sheets.length || sheets.length > 20)
    throw new Error("Çalışma kitabında 1–20 dolu sayfa olmalı.");
  if (target === "xlsx") {
    const workbook = new ExcelJS.Workbook(),
      taken = new Set();
    workbook.creator = "Kutarya Convert";
    for (const sheet of sheets) {
      let name =
          sheet.name.replace(/[\\/*?:\[\]]/g, "_").slice(0, 25) || "Sayfa",
        index = 2,
        base = name;
      while (taken.has(name.toLocaleLowerCase("tr")))
        name = base + " " + index++;
      taken.add(name.toLocaleLowerCase("tr"));
      const ws = workbook.addWorksheet(name);
      ws.addRows(sheet.rows);
      if (opts.headers !== false) {
        ws.getRow(1).font = { bold: true, color: { argb: "FF164E63" } };
        ws.views = [{ state: "frozen", ySplit: 1 }];
        ws.autoFilter = {
          from: { row: 1, column: 1 },
          to: {
            row: sheet.rows.length,
            column: Math.max(1, sheet.rows[0].length),
          },
        };
      }
      ws.columns.forEach((c) => {
        c.width = 23;
      });
    }
    return {
      files: [
        {
          name: outputName(opts.name, "xlsx"),
          mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          bytes: new Uint8Array(await workbook.xlsx.writeBuffer()),
        },
      ],
      warnings,
    };
  }
  if (target === "json") {
    const data =
      sheets.length === 1
        ? rowsToJson(sheets[0].rows, opts.headers !== false)
        : Object.fromEntries(
            sheets.map((s) => [
              s.name,
              rowsToJson(s.rows, opts.headers !== false),
            ]),
          );
    return {
      files: [
        textFile(
          outputName(opts.name, "json"),
          JSON.stringify(data, null, 2),
          "application/json",
        ),
      ],
      warnings,
    };
  }
  if (!["csv", "tsv"].includes(target))
    throw new Error("Bu tablo çıktısı desteklenmiyor.");
  if (opts.safeCsv !== false)
    warnings.push(
      "Formül gibi başlayan metinlere güvenli elektronik tablo öneki eklendi; sayılar korunur.",
    );
  return {
    files: sheets.map((s) =>
      textFile(
        outputName(
          sheets.length === 1
            ? opts.name
            : `${opts.name.replace(/\.[^.]+$/, "")}-${s.name}`,
          target,
        ),
        "\ufeff" +
          writeDelimited(
            s.rows,
            target === "tsv" ? "\t" : opts.outputSeparator || ",",
            opts.safeCsv !== false,
          ),
        target === "csv"
          ? "text/csv;charset=utf-8"
          : "text/tab-separated-values;charset=utf-8",
      ),
    ),
    warnings,
  };
}

export async function textPdf(text, opts) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(new Uint8Array(opts.fontBytes), {
    subset: true,
  });
  const available = new Set(font.getCharacterSet()),
    missing = [
      ...new Set(
        [...text].filter(
          (c) => !/[\n\r\t]/.test(c) && !available.has(c.codePointAt(0)),
        ),
      ),
    ];
  if (missing.length)
    throw new Error(
      `PDF yazı tipi bu karakterleri desteklemiyor: ${missing.slice(0, 6).join(" ")}. TXT veya DOCX seçebilirsin.`,
    );
  const size = Math.min(18, Math.max(9, Number(opts.fontSize) || 11)),
    margin = 48,
    pageSize = opts.paper === "letter" ? [612, 792] : [595.28, 841.89];
  const lineHeight = size * 1.5,
    maxWidth = pageSize[0] - margin * 2;
  const lines = [];
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const c of raw.replaceAll("\t", "    ")) {
      if (line && font.widthOfTextAtSize(line + c, size) > maxWidth) {
        lines.push(line);
        line = "";
      }
      line += c;
    }
    lines.push(line);
  }
  const perPage = Math.floor((pageSize[1] - margin * 2 - 18) / lineHeight),
    pageCount = Math.max(1, Math.ceil(lines.length / perPage));
  if (pageCount > LIMITS.pages)
    throw new Error("Metin 80 sayfayı aşıyor. Daha kısa bir dosya seç.");
  for (let n = 0; n < pageCount; n++) {
    const page = doc.addPage(pageSize);
    let y = pageSize[1] - margin;
    for (const line of lines.slice(n * perPage, (n + 1) * perPage)) {
      page.drawText(line, {
        x: margin,
        y,
        size,
        font,
        color: rgb(0.12, 0.16, 0.21),
      });
      y -= lineHeight;
    }
    page.drawText(`${n + 1} / ${pageCount}`, {
      x: margin,
      y: 24,
      size: 8,
      font,
      color: rgb(0.4, 0.45, 0.5),
    });
  }
  doc.setCreator("Kutarya Convert");
  doc.setTitle(opts.name);
  return new Uint8Array(await doc.save());
}
export async function convertDocument(bytes, type, target, opts) {
  const warnings = [];
  let text = opts.preparedText,
    html = opts.preparedHtml;
  if (type === "docx") {
    inspectOfficeZip(bytes, "docx");
    if (target === "html") {
      const result = await mammoth.convertToHtml(
        {
          arrayBuffer: bytes.buffer.slice(
            bytes.byteOffset,
            bytes.byteOffset + bytes.byteLength,
          ),
        },
        { externalFileAccess: false },
      );
      return {
        files: [
          textFile(
            outputName(opts.name, "html"),
            result.value,
            "text/html;charset=utf-8",
          ),
        ],
        warnings: result.messages.map((m) => m.message),
        sanitizeHtml: true,
      };
    }
    text = (
      await mammoth.extractRawText({
        arrayBuffer: bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength,
        ),
      })
    ).value;
    warnings.push(
      "Metin aktarılır; Word düzeni, resimler ve sütunlar birebir korunmaz.",
    );
  } else if (text == null) text = decodeText(bytes);
  if (target === "txt")
    return { files: [textFile(outputName(opts.name, "txt"), text)], warnings };
  if (target === "html")
    return {
      files: [
        textFile(
          outputName(opts.name, "html"),
          htmlDocument(
            html ||
              `<pre>${String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>`,
            opts.name,
          ),
          "text/html;charset=utf-8",
        ),
      ],
      warnings,
    };
  if (target === "pdf")
    return {
      files: [
        {
          name: outputName(opts.name, "pdf"),
          mime: "application/pdf",
          bytes: await textPdf(text, opts),
        },
      ],
      warnings,
    };
  if (target === "docx") {
    const doc = new Document({
      creator: "Kutarya Convert",
      sections: [
        {
          children: text
            .replace(/\r\n?/g, "\n")
            .split("\n")
            .map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: line, font: "Calibri", size: 22 }),
                  ],
                  spacing: { after: 100 },
                }),
            ),
        },
      ],
    });
    return {
      files: [
        {
          name: outputName(opts.name, "docx"),
          mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          bytes: new Uint8Array(await Packer.toArrayBuffer(doc)),
        },
      ],
      warnings,
    };
  }
  throw new Error("Bu belge çıktısı desteklenmiyor.");
}
export async function rewritePdf(bytes, target, opts) {
  const source = await PDFDocument.load(bytes),
    pages = parsePages(opts.pages, source.getPageCount());
  const make = async (indices) => {
    const doc = await PDFDocument.create();
    for (const page of await doc.copyPages(source, indices)) {
      if (opts.pdfRotation)
        page.setRotation(
          degrees((page.getRotation().angle + Number(opts.pdfRotation)) % 360),
        );
      doc.addPage(page);
    }
    doc.setCreator("Kutarya Convert");
    return new Uint8Array(await doc.save());
  };
  if (target === "pdf")
    return {
      files: [
        {
          name: outputName(opts.name, "pdf"),
          mime: "application/pdf",
          bytes: await make(pages),
        },
      ],
      warnings: [],
    };
  const outputs = [];
  for (const i of pages)
    outputs.push({
      name: outputName(
        `${opts.name.replace(/\.[^.]+$/, "")}-sayfa-${i + 1}`,
        "pdf",
      ),
      mime: "application/pdf",
      bytes: await make([i]),
    });
  return {
    files: [
      {
        name: outputName(opts.name, "zip"),
        mime: "application/zip",
        bytes: zipOutputs(outputs),
      },
    ],
    warnings: [],
    detail: `${pages.length} PDF sayfası`,
  };
}
export async function mergePdf(inputs, opts, progress = () => {}) {
  const doc = await PDFDocument.create();
  for (const [n, input] of inputs.entries()) {
    const source = await PDFDocument.load(input.bytes);
    if (doc.getPageCount() + source.getPageCount() > LIMITS.pages)
      throw new Error("Birleştirilen PDF en fazla 80 sayfa olabilir.");
    for (const p of await doc.copyPages(source, source.getPageIndices()))
      doc.addPage(p);
    progress(Math.round(((n + 1) / inputs.length) * 90));
  }
  if (!doc.getPageCount()) throw new Error("Birleştirilecek sayfa yok.");
  doc.setCreator("Kutarya Convert");
  return {
    files: [
      {
        name: "kutarya-birlestirilmis.pdf",
        mime: "application/pdf",
        bytes: new Uint8Array(await doc.save()),
      },
    ],
    warnings: [],
    detail: `${doc.getPageCount()} sayfa`,
  };
}
export async function convertImage(bytes, target, opts) {
  const bitmap = await createImageBitmap(new Blob([bytes]), {
    imageOrientation: "from-image",
  });
  try {
    if (bitmap.width * bitmap.height > LIMITS.pixels)
      throw new Error("Görsel en fazla 24 megapiksel olabilir.");
    let scale = Math.min(
      (Number(opts.width) || bitmap.width) / bitmap.width,
      (Number(opts.height) || bitmap.height) / bitmap.height,
    );
    if (opts.downscale !== false) scale = Math.min(1, scale);
    const w = Math.max(1, Math.round(bitmap.width * scale)),
      h = Math.max(1, Math.round(bitmap.height * scale)),
      rotation = Number(opts.rotation) || 0;
    if (w * h > LIMITS.pixels || Math.max(w, h) > 8192)
      throw new Error("Çıktı boyutu çok büyük.");
    const swap = rotation === 90 || rotation === 270,
      canvas = new OffscreenCanvas(swap ? h : w, swap ? w : h),
      ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Bu tarayıcı görsel kodlamayı desteklemiyor.");
    if (target === "jpg") {
      ctx.fillStyle = opts.background || "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
    const mime =
      target === "jpg"
        ? "image/jpeg"
        : target === "webp"
          ? "image/webp"
          : "image/png";
    const blob = await canvas.convertToBlob({
      type: mime,
      quality: Math.max(0.1, Math.min(1, (Number(opts.quality) || 85) / 100)),
    });
    if (blob.type !== mime)
      throw new Error("Tarayıcı bu çıktı türünü kodlayamıyor; PNG seç.");
    let output = new Uint8Array(await blob.arrayBuffer());
    if (target === "pdf") {
      const doc = await PDFDocument.create(),
        image = await doc.embedPng(output),
        page = doc.addPage(
          opts.paper === "letter" ? [612, 792] : [595.28, 841.89],
        );
      const fit = Math.min(
        (page.getWidth() - 72) / image.width,
        (page.getHeight() - 72) / image.height,
      );
      page.drawImage(image, {
        x: (page.getWidth() - image.width * fit) / 2,
        y: (page.getHeight() - image.height * fit) / 2,
        width: image.width * fit,
        height: image.height * fit,
      });
      output = new Uint8Array(await doc.save());
    }
    return {
      files: [
        {
          name: outputName(opts.name, target),
          mime: target === "pdf" ? "application/pdf" : mime,
          bytes: output,
        },
      ],
      warnings:
        opts.inputType === "gif"
          ? ["Animasyonun yalnız ilk karesi dönüştürüldü."]
          : [],
      detail: `${canvas.width} × ${canvas.height} px`,
    };
  } finally {
    bitmap.close();
  }
}
export function convertAudio(
  channels,
  target,
  opts,
  Mp3Encoder,
  progress = () => {},
) {
  if (target === "wav")
    return {
      files: [
        {
          name: outputName(opts.name, "wav"),
          mime: "audio/wav",
          bytes: encodeWav(channels, opts.sampleRate),
        },
      ],
      warnings: [],
      detail: `${(channels[0].length / opts.sampleRate).toFixed(1)} sn · ${opts.sampleRate} Hz`,
    };
  const encoder = new Mp3Encoder(
      channels.length,
      opts.sampleRate,
      Number(opts.bitrate) || 192,
    ),
    pcm = channels.map((c) =>
      Int16Array.from(c, (v) => {
        const s = Math.max(-1, Math.min(1, v));
        return s < 0 ? s * 32768 : s * 32767;
      }),
    ),
    chunks = [];
  for (let i = 0; i < pcm[0].length; i += 1152) {
    const chunk =
      channels.length === 1
        ? encoder.encodeBuffer(pcm[0].subarray(i, i + 1152))
        : encoder.encodeBuffer(
            pcm[0].subarray(i, i + 1152),
            pcm[1].subarray(i, i + 1152),
          );
    if (chunk.length) chunks.push(new Uint8Array(chunk));
    if (i % (1152 * 32) === 0) progress(Math.round((i / pcm[0].length) * 95));
  }
  const flush = encoder.flush();
  if (flush.length) chunks.push(new Uint8Array(flush));
  const result = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let p = 0;
  for (const c of chunks) {
    result.set(c, p);
    p += c.length;
  }
  return {
    files: [
      { name: outputName(opts.name, "mp3"), mime: "audio/mpeg", bytes: result },
    ],
    warnings: [],
    detail: `${(channels[0].length / opts.sampleRate).toFixed(1)} sn · ${opts.bitrate} kbps`,
  };
}
