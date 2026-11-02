import "./style.css";
import {
  LIMITS,
  FORMATS,
  sniff,
  targets,
  family,
  decodeText,
  parsePages,
  outputName,
  uniqueName,
} from "./core.mjs";
import { readHtml, readMarkdown, escape, htmlDocument } from "./content.mjs";
import * as pdfjs from "pdfjs-dist/build/pdf.mjs";
import pdfWorkerSource from "pdfjs-dist/build/pdf.worker.min.mjs?raw";
import mp3Source from "../../node_modules/@breezystack/lamejs/dist/lamejs.iife.js?raw";
import fontUrl from "./assets/NotoSans-Regular.ttf?inline";
import workerSource from "virtual:kutarya-convert-worker";

const $ = (id) => document.getElementById(id),
  queue = [],
  outputs = [];
let busy = false,
  checking = false,
  mode = "convert",
  controller = null,
  previewTask = null,
  previewUrl = null;
const workerUrl = URL.createObjectURL(
  new Blob([mp3Source, "\n", workerSource], { type: "text/javascript" }),
);
const pdfWorkerUrl = URL.createObjectURL(
  new Blob([pdfWorkerSource], { type: "text/javascript" }),
);
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
const fontBytes = Uint8Array.from(atob(fontUrl.split(",")[1]), (c) =>
  c.charCodeAt(0),
);
const symbols = { image: "▧", document: "▤", data: "▦", audio: "♫" };
const size = (n) =>
  n < 1024
    ? `${n} B`
    : n < 1024 ** 2
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 ** 2).toFixed(1)} MB`;
const aborted = (signal) => {
  if (signal?.aborted)
    throw new DOMException("İşlem durduruldu.", "AbortError");
};
function notice(text, error = false) {
  $("notice").textContent = text;
  $("notice").hidden = !text;
  $("notice").classList.toggle("error", error);
}
function getOptions(name, type) {
  return {
    name,
    inputType: type,
    fontBytes,
    width: Number($("image-width").value),
    height: Number($("image-height").value),
    rotation: Number($("image-rotation").value),
    quality: Number($("quality").value),
    background: $("image-background").value,
    downscale: $("downscale").checked,
    paper: $("paper").value,
    fontSize: Number($("font-size").value),
    pages: $("pdf-pages").value,
    pdfRotation: Number($("pdf-rotation").value),
    pdfScale: Number($("pdf-scale").value),
    headers: $("table-headers").checked,
    separator: $("separator").value === "tab" ? "\t" : $("separator").value,
    outputSeparator: $("output-separator").value,
    safeCsv: $("safe-csv").checked,
    sampleRate: Number($("sample-rate").value),
    channels: Number($("audio-channels").value),
    bitrate: Number($("bitrate").value),
    audioStart: Number($("audio-start").value),
    audioEnd: Number($("audio-end").value),
    gain: Number($("gain").value) / 100,
  };
}
function valid(item) {
  return (
    item.type !== "unsupported" && (mode !== "merge" || item.type === "pdf")
  );
}
function renderQueue() {
  $("queue-area").hidden = !queue.length;
  $("empty-state").hidden = !!queue.length;
  $("queue-title").textContent = `${queue.length} dosya`;
  $("queue-size").textContent = size(
    queue.reduce((sum, q) => sum + q.file.size, 0),
  );
  $("batch-bar").hidden = mode === "merge";
  $("merge-hint").hidden = mode !== "merge";
  $("queue-list").innerHTML = queue
    .map((item, index) => {
      const f = family(item.type),
        status = item.error || item.status || "Hazır",
        css = item.error
          ? "file-error"
          : item.status === "Tamamlandı"
            ? "file-good"
            : "";
      return `<li class="queue-item ${mode === "merge" ? "merge-row" : ""}" data-id="${item.id}"><span class="file-badge ${f}" aria-hidden="true">${symbols[f]}</span><div class="file-info"><strong>${escape(item.file.name)}</strong><small>${escape(item.type.toUpperCase())} · ${size(item.file.size)}</small><small class="${css}" role="${item.error ? "alert" : "status"}">${escape(status)}</small>${item.percent ? `<progress aria-label="${escape(item.file.name)} ilerlemesi" max="100" value="${item.percent}"></progress>` : ""}</div>${
        mode === "merge"
          ? `<div class="order-buttons"><button class="icon-button move-up" aria-label="${escape(item.file.name)} yukarı" ${busy || index === 0 ? "disabled" : ""}>↑</button><button class="icon-button move-down" aria-label="${escape(item.file.name)} aşağı" ${busy || index === queue.length - 1 ? "disabled" : ""}>↓</button></div>`
          : `<select class="file-format" aria-label="${escape(item.file.name)} için çıktı biçimi" ${busy || item.type === "unsupported" ? "disabled" : ""}>${
              targets(item.type)
                .map(
                  (t) =>
                    `<option value="${t}" ${item.target === t ? "selected" : ""}>${FORMATS[t]}</option>`,
                )
                .join("") || "<option>Desteklenmiyor</option>"
            }</select>`
      }<button class="icon-button remove-file" aria-label="${escape(item.file.name)} kaldır" ${busy ? "disabled" : ""}>×</button></li>`;
    })
    .join("");
  for (const row of $("queue-list").children) {
    const item = queue.find((q) => q.id === row.dataset.id);
    row.querySelector(".file-format")?.addEventListener("change", (e) => {
      item.target = e.target.value;
      item.error = "";
      item.status = "Hazır";
      item.percent = 0;
    });
    row.querySelector(".remove-file").onclick = () => {
      if (busy) return;
      queue.splice(queue.indexOf(item), 1);
      renderQueue();
    };
    for (const [cls, offset] of [
      [".move-up", -1],
      [".move-down", 1],
    ])
      row.querySelector(cls)?.addEventListener("click", () => {
        if (busy) return;
        const i = queue.indexOf(item);
        [queue[i], queue[i + offset]] = [queue[i + offset], queue[i]];
        renderQueue();
      });
  }
  $("start-button").disabled =
    busy ||
    checking ||
    !queue.some(valid) ||
    (mode === "merge" &&
      (queue.length < 2 || queue.some((q) => q.type !== "pdf")));
  $("start-button").innerHTML =
    mode === "merge" ? "PDF’leri birleştir →" : "Dönüştür →";
  $("clear-button").disabled = busy || checking;
  $("file-input").disabled = busy || checking;
  $("apply-format").disabled = busy;
  $("batch-format").disabled = busy;
  $("convert-mode").disabled = busy;
  $("merge-mode").disabled = busy;
  $("settings-fields").disabled = busy;
  $("cancel-button").hidden = !busy;
  document.body.classList.toggle("busy", busy);
}
function renderResults() {
  $("results").hidden = !outputs.length;
  $("download-all").disabled = busy;
  $("result-list").innerHTML = outputs
    .map(
      (o, i) =>
        `<li class="result-item"><span class="result-status" aria-hidden="true">✓</span><div class="file-info"><strong>${escape(o.name)}</strong><small>${size(o.bytes.length)}${o.detail ? " · " + escape(o.detail) : ""}</small>${o.warnings.length ? `<p class="result-warning">${escape(o.warnings.join(" "))}</p>` : ""}</div><span class="result-actions"><button class="secondary small preview-result" data-index="${i}" ${busy ? "disabled" : ""}>Önizle</button><button class="primary small download-result" data-index="${i}" aria-label="${escape(o.name)} indir" ${busy ? "disabled" : ""}>İndir ↓</button></span></li>`,
    )
    .join("");
  $("result-list")
    .querySelectorAll(".download-result")
    .forEach(
      (b) => (b.onclick = () => download(outputs[Number(b.dataset.index)])),
    );
  $("result-list")
    .querySelectorAll(".preview-result")
    .forEach(
      (b) => (b.onclick = () => void preview(outputs[Number(b.dataset.index)])),
    );
}
async function addFiles(files) {
  if (busy || checking) {
    notice(
      "Yeni dosya eklemek için mevcut işlemin bitmesini bekle veya işlemi durdur.",
    );
    return;
  }
  checking = true;
  renderQueue();
  const messages = [];
  try {
    for (const file of files) {
      if (queue.length >= LIMITS.files) {
        messages.push("Kuyruk en fazla 20 dosya alır.");
        break;
      }
      if (!file.size) {
        messages.push(`${file.name}: dosya boş.`);
        continue;
      }
      if (file.size > LIMITS.fileBytes) {
        messages.push(`${file.name}: 25 MB sınırını aşıyor.`);
        continue;
      }
      if (
        queue.reduce((n, q) => n + q.file.size, 0) + file.size >
        LIMITS.totalBytes
      ) {
        messages.push("Toplam 100 MB sınırına ulaşıldı.");
        continue;
      }
      if (
        queue.some(
          (q) =>
            q.file.name === file.name &&
            q.file.size === file.size &&
            q.file.lastModified === file.lastModified,
        )
      ) {
        messages.push(`${file.name} zaten listede.`);
        continue;
      }
      const bytes = new Uint8Array(await file.slice(0, 8192).arrayBuffer()),
        type = sniff(bytes, file.name);
      queue.push({
        id: crypto.randomUUID(),
        file,
        type,
        target: targets(type)[0] || "",
        status: "Hazır",
        error: type === "unsupported" ? "Bu dosya türü desteklenmiyor." : "",
        percent: 0,
      });
    }
    notice(messages.slice(0, 5).join(" "), messages.length > 0);
  } catch {
    notice("Dosya okunamadı. Yeniden seçmeyi dene.", true);
  } finally {
    checking = false;
    $("file-input").value = "";
    renderQueue();
  }
}
function workerJob(data, signal, onProgress = () => {}, transfer = []) {
  aborted(signal);
  const worker = new Worker(workerUrl);
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timeout);
      worker.terminate();
      signal?.removeEventListener("abort", cancel);
    };
    const cancel = () => {
      cleanup();
      reject(new DOMException("İşlem durduruldu.", "AbortError"));
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "İşlem zaman sınırını aştı. Daha küçük dosya veya daha düşük çözünürlük seç.",
        ),
      );
    }, 120000);
    signal?.addEventListener("abort", cancel, { once: true });
    worker.onmessage = ({ data }) => {
      if (data.progress != null) {
        onProgress(data.progress);
        return;
      }
      cleanup();
      data.error ? reject(new Error(data.error)) : resolve(data.result);
    };
    worker.onerror = () => {
      cleanup();
      reject(
        new Error(
          "Dönüştürme motoru dosyayı işleyemedi. Dosyanın bozuk olmadığını kontrol et.",
        ),
      );
    };
    worker.postMessage(data, transfer);
  });
}
async function svgToPng(bytes, signal) {
  const source = decodeText(bytes);
  if (source.length > 1024 * 1024 || /<!DOCTYPE|<!ENTITY/i.test(source))
    throw new Error("SVG çok büyük veya dış kaynak içeriyor.");
  const doc = new DOMParser().parseFromString(source, "image/svg+xml"),
    svg = doc.documentElement;
  if (svg.localName !== "svg" || doc.querySelector("parsererror"))
    throw new Error("SVG içeriği geçersiz.");
  for (const node of [svg, ...svg.querySelectorAll("*")]) {
    if (
      [
        "script",
        "foreignObject",
        "iframe",
        "object",
        "embed",
        "animate",
        "set",
      ].includes(node.localName)
    )
      throw new Error("Etkin içerik taşıyan SVG desteklenmiyor.");
    for (const attr of node.attributes) {
      if (
        attr.name.toLowerCase().startsWith("on") ||
        /url\s*\(|@import/i.test(attr.value) ||
        ((attr.localName === "href" || attr.name === "src") &&
          !/^(#|data:image\/(png|jpeg|webp);base64,)/i.test(attr.value))
      )
        throw new Error(
          "Dış bağlantı veya etkin içerik taşıyan SVG desteklenmiyor.",
        );
    }
    if (
      node.localName === "style" &&
      /url\s*\(|@import|expression\s*\(/i.test(node.textContent)
    )
      throw new Error("SVG’nin dış stil kaynakları desteklenmiyor.");
  }
  const viewBox = (svg.getAttribute("viewBox") || "")
      .split(/[\s,]+/)
      .map(Number),
    w = parseFloat(svg.getAttribute("width")) || viewBox[2] || 300,
    h = parseFloat(svg.getAttribute("height")) || viewBox[3] || 150;
  if (
    !Number.isFinite(w) ||
    !Number.isFinite(h) ||
    w <= 0 ||
    h <= 0 ||
    w * h > LIMITS.pixels ||
    Math.max(w, h) > 8192
  )
    throw new Error("SVG boyutları geçersiz veya çok büyük.");
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(svg)], {
        type: "image/svg+xml",
      }),
    ),
    img = new Image();
  try {
    img.src = url;
    await img.decode();
    aborted(signal);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(img, 0, 0);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) throw new Error("SVG çizilemedi.");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
    img.src = "";
  }
}
async function audioPcm(bytes, opts, signal) {
  const context = new AudioContext();
  let audio;
  try {
    audio = await context.decodeAudioData(bytes.slice().buffer);
  } catch {
    throw new Error(
      "Tarayıcı bu ses kodekini açamadı veya dosya bozuk. WAV/MP3 ile deneyebilirsin.",
    );
  } finally {
    await context.close();
  }
  aborted(signal);
  if (audio.duration > LIMITS.audioSeconds)
    throw new Error("Ses dosyası en fazla 5 dakika olabilir.");
  const end = opts.audioEnd || audio.duration,
    start = opts.audioStart;
  if (start < 0 || start >= end || end > audio.duration + 0.02)
    throw new Error(
      `Kesme aralığı 0–${audio.duration.toFixed(1)} sn içinde olmalı.`,
    );
  const frames = Math.max(
      1,
      Math.floor((Math.min(end, audio.duration) - start) * opts.sampleRate),
    ),
    offline = new OfflineAudioContext(opts.channels, frames, opts.sampleRate),
    source = offline.createBufferSource(),
    gain = offline.createGain();
  source.buffer = audio;
  gain.gain.value = opts.gain;
  source.connect(gain);
  gain.connect(offline.destination);
  source.start(0, start, end - start);
  const result = await offline.startRendering();
  aborted(signal);
  return Array.from({ length: result.numberOfChannels }, (_, i) =>
    result.getChannelData(i).slice(),
  );
}
function pdfLoad(bytes) {
  return pdfjs.getDocument({
    data: bytes.slice(),
    isEvalSupported: false,
    useWasm: false,
    useSystemFonts: true,
    disableAutoFetch: true,
    enableXfa: false,
  });
}
async function readPdf(bytes, item, opts, signal, progress) {
  const loading = pdfLoad(bytes),
    cancel = () => void loading.destroy();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    const pdf = await loading.promise,
      indices = parsePages(opts.pages, pdf.numPages),
      text = [],
      images = [];
    for (const [n, index] of indices.entries()) {
      aborted(signal);
      const page = await pdf.getPage(index + 1);
      if (["png-pages", "jpg-pages"].includes(item.target)) {
        const viewport = page.getViewport({
          scale: opts.pdfScale,
          rotation: (page.rotate + opts.pdfRotation) % 360,
        });
        if (viewport.width * viewport.height > LIMITS.pixels)
          throw new Error("PDF sayfası çok büyük; çözünürlüğü düşür.");
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({
          canvas,
          canvasContext: canvas.getContext("2d"),
          viewport,
          background: "rgb(255,255,255)",
        }).promise;
        const mime = item.target === "png-pages" ? "image/png" : "image/jpeg",
          blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, mime, opts.quality / 100),
          );
        if (!blob || blob.type !== mime)
          throw new Error("PDF sayfası görüntüye kodlanamadı.");
        images.push({
          name: outputName(
            `${item.file.name.replace(/\.[^.]+$/, "")}-sayfa-${index + 1}`,
            item.target === "png-pages" ? "png" : "jpg",
          ),
          mime,
          bytes: new Uint8Array(await blob.arrayBuffer()),
        });
        canvas.width = canvas.height = 0;
        if (images.reduce((n, i) => n + i.bytes.length, 0) > LIMITS.outputBytes)
          throw new Error(
            "PDF görüntüleri çok büyük. Daha az sayfa veya düşük çözünürlük seç.",
          );
      } else {
        const content = await page.getTextContent();
        text.push(
          content.items
            .map((i) => (i.str == null ? "" : i.str + (i.hasEOL ? "\n" : " ")))
            .join(""),
        );
      }
      page.cleanup();
      progress(Math.round(((n + 1) / indices.length) * 80));
    }
    if (images.length) {
      const result = await workerJob(
        { op: "zip", files: images },
        signal,
        progress,
      );
      result.files[0].name = outputName(item.file.name, "zip");
      result.detail = `${images.length} görüntü sayfası`;
      return result;
    }
    const value = text.join("\n\n").trim();
    if (!value)
      throw new Error(
        "PDF’de çıkarılabilir metin yok. Taranmış PDF için OCR gerekir; PNG/JPEG sayfaları seçebilirsin.",
      );
    const result = await workerJob(
      {
        op: "convert",
        bytes: new Uint8Array(),
        type: "pdf",
        target: item.target,
        opts: { ...opts, preparedText: value },
      },
      signal,
      progress,
    );
    result.warnings.push(
      "PDF’nin metin katmanı çıkarıldı; sayfa yerleşimi ve resimler taşınmadı.",
    );
    return result;
  } finally {
    signal.removeEventListener("abort", cancel);
    await loading.destroy();
  }
}
async function convertOne(item, signal, progress) {
  aborted(signal);
  const opts = getOptions(item.file.name, item.type);
  let bytes = new Uint8Array(await item.file.arrayBuffer());
  aborted(signal);
  if (item.type === "svg") bytes = await svgToPng(bytes, signal);
  if (family(item.type) === "audio") {
    progress(15);
    const channels = await audioPcm(bytes, opts, signal);
    return workerJob(
      { op: "audio", channels, target: item.target, opts },
      signal,
      progress,
      channels.map((c) => c.buffer),
    );
  }
  if (item.type === "pdf" && !["pdf", "pdf-pages"].includes(item.target))
    return readPdf(bytes, item, opts, signal, progress);
  if (item.type === "html" || item.type === "md") {
    const prepared =
      item.type === "html"
        ? readHtml(decodeText(bytes))
        : readMarkdown(decodeText(bytes));
    opts.preparedText = prepared.text;
    opts.preparedHtml = prepared.html;
  }
  const result = await workerJob(
    { op: "convert", bytes, type: item.type, target: item.target, opts },
    signal,
    progress,
    [bytes.buffer],
  );
  if (result.sanitizeHtml) {
    for (const f of result.files) {
      f.bytes = new TextEncoder().encode(
        htmlDocument(
          readHtml(new TextDecoder().decode(f.bytes)).html,
          item.file.name,
        ),
      );
    }
    result.warnings.push(
      "Word içeriği HTML’ye aktarıldı; etkin içerik ve dış görsel bağlantıları çıkarıldı.",
    );
  }
  return result;
}
function releaseOutputs() {
  for (const o of outputs) if (o.url) URL.revokeObjectURL(o.url);
  outputs.length = 0;
  renderResults();
}
function commit(result) {
  const total =
    outputs.reduce((n, f) => n + f.bytes.length, 0) +
    result.files.reduce((n, f) => n + f.bytes.length, 0);
  if (total > LIMITS.outputBytes)
    throw new Error(
      "Toplam çıktılar 160 MB sınırını aşıyor. Daha az dosya seç.",
    );
  const taken = new Set(outputs.map((f) => f.name.toLocaleLowerCase("tr")));
  for (const file of result.files)
    outputs.push({
      ...file,
      name: uniqueName(file.name, taken),
      warnings: result.warnings || [],
      detail: result.detail || "",
    });
  renderResults();
}
async function start() {
  if (busy || checking || $("start-button").disabled) return;
  const invalid = [...$("settings-fields").querySelectorAll("input")].find(
    (input) => !input.checkValidity(),
  );
  if (invalid) {
    notice(
      "Dönüştürme ayarlarında aralık dışında bir değer var. İlgili alanı düzelt.",
      true,
    );
    invalid.reportValidity();
    return;
  }
  const active = new AbortController();
  controller = active;
  busy = true;
  releaseOutputs();
  notice("");
  $("progress-wrap").hidden = false;
  $("overall-progress").value = 0;
  for (const q of queue) {
    if (valid(q)) {
      q.error = "";
      q.status = "Sırada";
      q.percent = 0;
    }
  }
  renderQueue();
  let success = 0,
    failed = 0;
  const update = (n, total, percent) => {
    $("overall-progress").value = Math.round(
      ((n + percent / 100) / total) * 100,
    );
    $("progress-label").textContent =
      mode === "merge"
        ? "PDF sayfaları birleştiriliyor…"
        : `${n + 1} / ${total} dosya işleniyor`;
  };
  try {
    if (mode === "merge") {
      const inputs = [];
      for (const q of queue) {
        aborted(active.signal);
        inputs.push({ bytes: new Uint8Array(await q.file.arrayBuffer()) });
        q.status = "Birleştiriliyor";
      }
      renderQueue();
      const result = await workerJob(
        {
          op: "merge",
          inputs,
          opts: getOptions("kutarya-birlestirilmis.pdf", "pdf"),
        },
        active.signal,
        (p) => update(0, 1, p),
        inputs.map((i) => i.bytes.buffer),
      );
      aborted(active.signal);
      commit(result);
      for (const q of queue) {
        q.status = "Tamamlandı";
        q.percent = 100;
      }
      success = queue.length;
    } else {
      const jobs = queue.filter(valid);
      for (const [n, item] of jobs.entries()) {
        aborted(active.signal);
        item.status = "Dönüştürülüyor";
        renderQueue();
        try {
          const result = await convertOne(item, active.signal, (p) => {
            if (active.signal.aborted) return;
            item.percent = p;
            update(n, jobs.length, p);
            renderQueue();
          });
          aborted(active.signal);
          commit(result);
          item.status = "Tamamlandı";
          item.percent = 100;
          success++;
        } catch (error) {
          if (active.signal.aborted)
            throw new DOMException("İşlem durduruldu.", "AbortError");
          if (error.name === "AbortError") throw error;
          item.error = human(error);
          item.status = "Dönüştürülemedi";
          item.percent = 0;
          failed++;
        }
        renderQueue();
      }
    }
    $("overall-progress").value = 100;
    $("summary").textContent =
      `${success} dosya tamamlandı${failed ? ` · ${failed} hata` : ""}`;
    $("summary-sub").textContent = outputs.length
      ? `${outputs.length} çıktı indirilmeye hazır.`
      : "Ayarları veya dosyalarını kontrol et.";
    $("progress-label").textContent = "İşlem tamamlandı.";
  } catch (error) {
    for (const q of queue)
      if (q.status === "Dönüştürülüyor" || q.status === "Birleştiriliyor") {
        q.status = "Durduruldu";
        q.percent = 0;
      }
    if (error.name !== "AbortError") notice(human(error), true);
    $("summary").textContent = active.signal.aborted
      ? "İşlem durduruldu"
      : "İşlem tamamlanamadı";
    $("summary-sub").textContent =
      "Tamamlanan çıktılar korunur; yeniden deneyebilirsin.";
    $("progress-label").textContent = active.signal.aborted
      ? "Durduruldu."
      : "Dosya işlenemedi.";
  } finally {
    busy = false;
    controller = null;
    renderQueue();
    renderResults();
  }
}
function human(error) {
  const message = error.message || "Dosya işlenemedi.";
  if (/encrypted|password/i.test(message))
    return "Şifreli belge desteklenmiyor. Şifresiz bir kopya seç.";
  if (/JSON|position|Unexpected token/i.test(message))
    return "JSON içeriği geçersiz. Sözdizimini kontrol et.";
  if (
    /Invalid|Corrupt|Failed to load|end of central|incorrect header|could not be decoded|Unable to decode/i.test(
      message,
    )
  )
    return "Dosya içeriği bozuk veya seçilen türle uyumsuz.";
  return message;
}
function download(file) {
  const url =
    file.url ||
    URL.createObjectURL(new Blob([file.bytes], { type: file.mime }));
  if (outputs.includes(file)) file.url = url;
  else setTimeout(() => URL.revokeObjectURL(url), 30000);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
}
async function zipDownload() {
  if (busy || !outputs.length) return;
  const active = new AbortController();
  controller = active;
  busy = true;
  renderQueue();
  renderResults();
  $("summary").textContent = "ZIP hazırlanıyor…";
  try {
    const result = await workerJob(
      { op: "zip", files: outputs.map(({ name, bytes }) => ({ name, bytes })) },
      active.signal,
    );
    download(result.files[0]);
    $("summary").textContent = "ZIP indirilmeye hazır.";
  } catch (error) {
    if (error.name !== "AbortError") notice(human(error), true);
    $("summary").textContent = "ZIP hazırlama durdu.";
  } finally {
    busy = false;
    controller = null;
    renderQueue();
    renderResults();
  }
}
function dialog(title) {
  $("dialog-title").textContent = title;
  $("dialog-content").replaceChildren();
  $("info-dialog").showModal();
  return $("dialog-content");
}
async function preview(file) {
  if (busy) return;
  const box = dialog(file.name),
    p = document.createElement("p");
  p.textContent = `${file.mime.split(";")[0]} · ${size(file.bytes.length)}${file.detail ? " · " + file.detail : ""}`;
  box.append(p);
  if (file.mime.startsWith("image/")) {
    const img = document.createElement("img");
    previewUrl = URL.createObjectURL(
      new Blob([file.bytes], { type: file.mime }),
    );
    img.src = previewUrl;
    img.alt = file.name;
    box.append(img);
  } else if (file.mime.startsWith("audio/")) {
    const audio = document.createElement("audio");
    audio.controls = true;
    previewUrl = URL.createObjectURL(
      new Blob([file.bytes], { type: file.mime }),
    );
    audio.src = previewUrl;
    box.append(audio);
  } else if (file.mime === "application/pdf") {
    const task = pdfLoad(file.bytes);
    previewTask = task;
    p.textContent += " · Önizleme açılıyor…";
    try {
      const doc = await task.promise,
        page = await doc.getPage(1),
        viewport = page.getViewport({
          scale: Math.min(1.2, 600 / page.getViewport({ scale: 1 }).width),
        }),
        canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({
        canvas,
        canvasContext: canvas.getContext("2d"),
        viewport,
      }).promise;
      if ($("info-dialog").open) {
        box.append(canvas);
        p.textContent = `${doc.numPages} sayfa · ${size(file.bytes.length)} · İlk sayfa önizlemesi`;
      }
    } catch {
      if ($("info-dialog").open)
        p.textContent =
          "Önizleme açılamadı; PDF dosyasını indirip görüntüleyebilirsin.";
    } finally {
      await task.destroy();
      if (previewTask === task) previewTask = null;
    }
  } else if (
    file.mime.startsWith("text/") ||
    file.mime === "application/json"
  ) {
    const pre = document.createElement("pre");
    pre.textContent = new TextDecoder().decode(file.bytes).slice(0, 6000);
    box.append(pre);
    if (file.bytes.length > 6000) {
      const n = document.createElement("p");
      n.textContent =
        "Önizleme ilk 6000 karakterle sınırlı; indirme tüm içeriği kapsar.";
      box.append(n);
    }
  } else {
    const n = document.createElement("p");
    n.textContent =
      "Bu paket türü tarayıcıda önizlenmiyor. İndirip uygun uygulamada açabilirsin.";
    box.append(n);
  }
}
$("info-dialog").addEventListener("close", () => {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  if (previewTask) void previewTask.destroy();
  previewTask = null;
  $("dialog-content").replaceChildren();
});
$("close-dialog").onclick = () => $("info-dialog").close();
$("formats-button").onclick = () => {
  const box = dialog("Desteklenen dönüşümler");
  box.innerHTML = `<table><thead><tr><th>Girdi</th><th>Gerçek çıktı</th></tr></thead><tbody><tr><td>PNG, JPEG, WebP, BMP, SVG, GIF, AVIF</td><td>PNG / JPEG / WebP / PDF</td></tr><tr><td>TXT, Markdown, HTML, DOCX</td><td>PDF / DOCX / TXT / HTML</td></tr><tr><td>PDF</td><td>Metin, metinden DOCX/HTML, PNG/JPEG sayfa ZIP’i, PDF ayırma / birleştirme / döndürme</td></tr><tr><td>CSV, TSV, JSON, XLSX</td><td>CSV / TSV / JSON / XLSX</td></tr><tr><td>MP3, WAV, OGG, FLAC, M4A, AAC</td><td>WAV / MP3</td></tr></tbody></table><p>Görseller açılarak yeniden kodlanır. Ses PCM örneklerine çözülüp kodlanır. Office ve veri dosyaları ayrıştırılır; yeni bir belge yazılır.</p><p>Video, HEIC, eski DOC/XLS, şifreli belgeler ve OCR bu sürümde yoktur. GIF’in yalnız ilk karesi dönüştürülür. AVIF ve ses girdilerinin açılması tarayıcının kodek desteğine bağlıdır.</p><p>Sınırlar: 20 dosya, dosya başına 25 MB, toplam 100 MB; görseller 24 MP, PDF 80 sayfa, ses 5 dakika. Metin UTF-8 veya UTF-16 olmalıdır.</p>`;
};
$("licenses-button").onclick = () => {
  const box = dialog("Bileşenler & lisanslar");
  box.innerHTML = `<p>Kutarya Convert arayüzü ve uygulama kodu: Kutarya — Tüm hakları saklıdır.</p><ul><li>pdf-lib / fontkit, ExcelJS, docx, htmlparser2, marked, fflate: MIT</li><li>PDF.js: Apache-2.0</li><li>Mammoth: BSD-2-Clause</li><li>@breezystack/lamejs: LGPL-3.0</li><li>Noto Sans: SIL Open Font License 1.1</li></ul><p>Tam lisans metinleri, sürümler ve kaynak bağlantıları indirilebilir uygulama paketindedir. MP3 bileşeni değiştirilmeden kullanılır; kaynak ve yeniden bağlama talimatı pakete eklenmiştir.</p>`;
};
for (const [id, which] of [
  ["convert-mode", "convert"],
  ["merge-mode", "merge"],
])
  $(id).onclick = () => {
    if (busy) return;
    mode = which;
    $("convert-mode").classList.toggle("selected", mode === "convert");
    $("merge-mode").classList.toggle("selected", mode === "merge");
    $("convert-mode").setAttribute("aria-pressed", String(mode === "convert"));
    $("merge-mode").setAttribute("aria-pressed", String(mode === "merge"));
    notice(
      mode === "merge" && queue.some((q) => q.type !== "pdf")
        ? "Birleştirme için listede yalnız PDF dosyaları olmalı."
        : "",
    );
    renderQueue();
  };
$("file-input").onchange = (e) => void addFiles([...e.target.files]);
let dragDepth = 0;
for (const event of ["dragenter", "dragover", "dragleave", "drop"])
  window.addEventListener(event, (e) => e.preventDefault());
$("drop-zone").addEventListener("dragenter", () => {
  dragDepth++;
  $("drop-zone").classList.add("dragging");
});
$("drop-zone").addEventListener("dragleave", () => {
  if (--dragDepth <= 0) $("drop-zone").classList.remove("dragging");
});
$("drop-zone").addEventListener("drop", (e) => {
  dragDepth = 0;
  $("drop-zone").classList.remove("dragging");
  void addFiles([...e.dataTransfer.files]);
});
$("clear-button").onclick = () => {
  if (busy || checking) return;
  queue.length = 0;
  releaseOutputs();
  notice("");
  $("progress-wrap").hidden = true;
  $("summary").textContent = "Dönüştürmeye hazır";
  $("summary-sub").textContent = "Kaynak dosyaların korunur.";
  renderQueue();
};
for (const [t, label] of Object.entries(FORMATS)) {
  $("batch-format").add(new Option(label, t));
}
$("apply-format").onclick = () => {
  const target = $("batch-format").value;
  if (!target) {
    notice("Önce bir toplu çıktı türü seç.");
    return;
  }
  let n = 0;
  for (const q of queue)
    if (targets(q.type).includes(target)) {
      q.target = target;
      q.error = "";
      q.status = "Hazır";
      q.percent = 0;
      n++;
    }
  renderQueue();
  notice(
    `${n} dosyanın çıktı biçimi değişti. Diğer dosyalar kendi biçimlerini korudu.`,
  );
};
$("start-button").onclick = () => void start();
$("cancel-button").onclick = () => controller?.abort();
$("download-all").onclick = () => void zipDownload();
for (const [input, out, suffix] of [
  ["quality", "quality-value", "%"],
  ["gain", "gain-value", "%"],
])
  $(input).oninput = () => ($(out).textContent = $(input).value + suffix);
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
function applyTheme(value) {
  document.documentElement.dataset.theme =
    value === "system" ? (systemTheme.matches ? "dark" : "light") : value;
}
try {
  const stored = localStorage.getItem("kutarya-convert-theme");
  if (["light", "warm", "dark", "system"].includes(stored))
    $("theme").value = stored;
} catch {
  /* Sandbox’da depolama zorunlu değildir. */
}
applyTheme($("theme").value);
$("theme").onchange = () => {
  applyTheme($("theme").value);
  try {
    localStorage.setItem("kutarya-convert-theme", $("theme").value);
  } catch {}
};
systemTheme.addEventListener("change", () => {
  if ($("theme").value === "system") applyTheme("system");
});
$("back-link").href =
  location.protocol === "file:"
    ? "https://kutarya.com/proje/kutarya-convert"
    : "/proje/kutarya-convert";
// Sandbox içinde aynı sekme üst gezinmesine ihtiyaç duyulmaz.
$("back-link").target = "_blank";
$("back-link").rel = "noopener noreferrer";
renderQueue();
renderResults();
window.addEventListener("beforeunload", () => {
  controller?.abort();
  URL.revokeObjectURL(workerUrl);
  URL.revokeObjectURL(pdfWorkerUrl);
  releaseOutputs();
});
