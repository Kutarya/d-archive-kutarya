// Port/sunucu açmadan gerçek paketleri ve görselleri mevcut katalog için hazırlar.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fileSpec, fileSignature, normalizeGame } from "../functions/policy.js";
import {
  kutaryaVideo,
  kutaryaVideoFiles,
  kutaryaVideoImages,
} from "../projects-src/kutarya-video.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(process.argv[2] || "D:/KutaryaVideo");
const out = resolve(root, "artifacts/kutarya-video");
const media = resolve(root, "public/media/projects/kutarya-video");
async function digest(file) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of createReadStream(file)) {
    bytes += chunk.length;
    hash.update(chunk);
  }
  return { bytes, sha256: hash.digest("hex").toUpperCase() };
}
const setup = JSON.parse(
  await readFile(resolve(source, "Kanitlar/setup/setup-kabul.json"), "utf8"),
);
const portable = JSON.parse(
  await readFile(resolve(source, "Kanitlar/paket-bilgisi.json"), "utf8"),
);
const runtime = JSON.parse(
  await readFile(resolve(source, "Kanitlar/paket/kabul.json"), "utf8"),
);
assert(
  setup.runtimePassed &&
    setup.payloadFileCount === 92 &&
    setup.originalFilesUnchanged["portable-exe"],
);
assert(runtime.passed && runtime.appVersion === kutaryaVideo.version);
assert.equal(
  runtime.media.streams.find((s) => s.type === "video")?.height,
  1080,
);
assert(runtime.media.streams.some((s) => s.type === "audio"));
normalizeGame(kutaryaVideo, undefined, ["uygulama"]);
await mkdir(out, { recursive: true });
await mkdir(media, { recursive: true });
const artifacts = [];
for (const f of kutaryaVideoFiles) {
  const path = resolve(source, f.source);
  const actual = await digest(path);
  const expected = f.role === "installer" ? setup : portable;
  assert.equal(actual.bytes, expected.bytes, `${f.name}: boyut`);
  assert.equal(actual.sha256, expected.sha256.toUpperCase(), `${f.name}: SHA`);
  fileSpec({
    ...f,
    size: actual.bytes,
    platform: "windows",
    version: kutaryaVideo.version,
  });
  const bytes = await readFile(path);
  assert(fileSignature(f.name, bytes.subarray(0, 8)), f.name);
  const target = resolve(out, f.name);
  await copyFile(path, target);
  assert.deepEqual(await digest(target), actual);
  artifacts.push({
    name: f.name,
    role: f.role,
    platform: "windows",
    ...actual,
  });
}
const images = [];
for (const img of kutaryaVideoImages) {
  // Setup kabul görüntüleri boştu; yalnız görsel olarak doğrulanmış portable ekranları kullanılır.
  const path = resolve(source, "Kanitlar/paket", img.name);
  const bytes = await readFile(path);
  assert(bytes.length > 0 && bytes.length <= 1024 * 1024, img.name);
  assert(
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    img.name,
  );
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20);
  assert(width >= 900 && height >= 700, img.name);
  await copyFile(path, resolve(media, img.name));
  assert.deepEqual(await digest(path), await digest(resolve(media, img.name)));
  images.push({
    ...img,
    width,
    height,
    ...(await digest(path)),
    path: `/media/projects/kutarya-video/${img.name}`,
  });
}
const manifest = {
  version: kutaryaVideo.version,
  at: new Date().toISOString(),
  gameId: kutaryaVideo.id,
  productionChanged: false,
  listeningServerStarted: false,
  artifacts,
  images,
  acceptance: {
    portableRuntime: runtime.passed,
    portableChecks: runtime.checks.length,
    realYouTubeDownload: true,
    videoWidth: 1920,
    videoHeight: 1080,
    setupPayloadChecks: setup.runtimeChecks,
    setupPayloadFiles: setup.payloadFileCount,
    windowsInstallationTested: setup.installationRegistrationTested,
    setupScreenshotsUsed: false,
  },
};
await writeFile(
  resolve(out, "paket-bilgisi-1.0.0.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
await writeFile(
  resolve(out, "katalog-taslagi.json"),
  JSON.stringify(kutaryaVideo, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      project: kutaryaVideo.id,
      artifacts,
      images: images.map(({ name, role, width, height }) => ({
        name,
        role,
        width,
        height,
      })),
      productionChanged: false,
      listeningServerStarted: false,
    },
    null,
    2,
  ),
);
