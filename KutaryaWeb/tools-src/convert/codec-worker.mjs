import { family, LIMITS, zipOutputs } from "./core.mjs";
import {
  convertImage,
  convertTable,
  convertDocument,
  rewritePdf,
  mergePdf,
  convertAudio,
} from "./codecs.mjs";
self.onmessage = async ({ data }) => {
  const progress = (percent) => self.postMessage({ progress: percent });
  try {
    progress(10);
    let result;
    if (data.op === "merge")
      result = await mergePdf(data.inputs, data.opts, progress);
    else if (data.op === "zip")
      result = {
        files: [
          {
            name: "kutarya-donusturulenler.zip",
            mime: "application/zip",
            bytes: zipOutputs(data.files),
          },
        ],
        warnings: [],
      };
    else if (data.op === "audio")
      result = convertAudio(
        data.channels,
        data.target,
        data.opts,
        globalThis.lamejs.Mp3Encoder,
        progress,
      );
    else if (family(data.type) === "image")
      result = await convertImage(
        new Uint8Array(data.bytes),
        data.target,
        data.opts,
      );
    else if (family(data.type) === "data")
      result = await convertTable(
        new Uint8Array(data.bytes),
        data.type,
        data.target,
        data.opts,
      );
    else if (data.type === "pdf" && ["pdf", "pdf-pages"].includes(data.target))
      result = await rewritePdf(
        new Uint8Array(data.bytes),
        data.target,
        data.opts,
      );
    else
      result = await convertDocument(
        new Uint8Array(data.bytes),
        data.type,
        data.target,
        data.opts,
      );
    if (
      result.files.reduce((n, f) => n + f.bytes.length, 0) > LIMITS.outputBytes
    )
      throw new Error("Çıktı çok büyük. Daha küçük dosya veya ayarlar seç.");
    self.postMessage(
      { result },
      result.files.map((f) => f.bytes.buffer),
    );
  } catch (error) {
    self.postMessage({ error: error.message || "Dosya dönüştürülemedi." });
  }
};
