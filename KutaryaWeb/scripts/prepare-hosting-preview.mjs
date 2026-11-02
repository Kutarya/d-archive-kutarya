// Gerçek Hosting başlıklarını sınamak için yalnız yerel build kopyası oluşturur.
import fs from "node:fs/promises";
import path from "node:path";
import { gzipSync, brotliCompressSync } from "node:zlib";
const workspace = path.resolve("."),
  target = path.resolve("artifacts/hosting-preview");
if (!target.startsWith(path.join(workspace, "artifacts") + path.sep))
  throw new Error("Önizleme yolu çalışma alanı dışında.");
await fs.rm(target, { recursive: true, force: true });
await fs.cp("dist", target, { recursive: true });
const fixture = path.join(target, "games/paket-denemesi/1.0.0");
await fs.mkdir(fixture, { recursive: true });
for (const [name, bytes] of [
  ["js", Buffer.from("console.log('Yerel başlık kontrolü');")],
  ["wasm", Buffer.from([0, 97, 115, 109, 1, 0, 0, 0])],
]) {
  await fs.writeFile(
    path.join(fixture, `header-check.${name}.gz`),
    gzipSync(bytes),
  );
  await fs.writeFile(
    path.join(fixture, `header-check.${name}.br`),
    brotliCompressSync(bytes),
  );
}
const config = JSON.parse(await fs.readFile("firebase.json", "utf8"));
await fs.writeFile(
  ".firebase-preview.json",
  JSON.stringify(
    {
      hosting: { ...config.hosting, public: "artifacts/hosting-preview" },
      emulators: {
        hosting: { host: "127.0.0.1", port: 5182 },
        ui: { enabled: false },
      },
    },
    null,
    2,
  ),
);
console.log(
  "Yalnız yerel Hosting önizlemesi hazır; canlı değişiklik yapılmadı.",
);
