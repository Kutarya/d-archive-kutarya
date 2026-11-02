// Yalnız teslim edilmiş paketler ve gerçek ekranlar seçilir; sır/araç dizinleri taşınmaz.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { unzipSync } from "fflate";
import { kutaryaMobile, kutaryaMobileFiles, kutaryaMobileImages } from "../projects-src/kutarya-mobile.mjs";
import { normalizeGame, fileSpec } from "../functions/policy.js";
import { mobileArtifactDirectory as out, mobileImageDirectory as images, mobileManifestPath } from "./mobile-release-paths.mjs";
await mkdir(out, { recursive: true }); await mkdir(images, { recursive: true });
const digest = bytes => createHash("sha256").update(bytes).digest("hex").toUpperCase();
const release = JSON.parse((await readFile(`D:/KutaryaMobile/Dagitim/APK-KAYDI-${kutaryaMobile.version}.json`, "utf8")).replace(/^\uFEFF/, ""));
const delivery = JSON.parse((await readFile("D:/KutaryaMobile/Kanitlar/v1.2-delivery-audit.json", "utf8")).replace(/^\uFEFF/, ""));
assert(delivery.pass && delivery.version === kutaryaMobile.version && delivery.versionCode === 3);
assert.equal(release.version, kutaryaMobile.version);
assert.equal(release.package, "com.kutarya.mobile");
normalizeGame(kutaryaMobile, null, [kutaryaMobile.category]);
const manifest = { gameId: kutaryaMobile.id, version: kutaryaMobile.version, artifacts: [], images: [] };
for (const spec of kutaryaMobileFiles) {
  const bytes = await readFile(resolve("D:/KutaryaMobile/Dagitim", spec.name));
  fileSpec({ ...spec, size: bytes.length, version: kutaryaMobile.version });
  if (spec.role === "installer") { assert.equal(bytes.length, release.bytes); assert.equal(digest(bytes), release.sha256); assert.equal(digest(bytes), delivery.apk.sha256); }
  else {
    assert.equal(bytes.length, delivery.source.bytes); assert.equal(digest(bytes), delivery.source.sha256);
    const entries = unzipSync(bytes), names = Object.keys(entries);
    assert.equal(names.length, 62); assert.equal(names.length, delivery.source.entryCount);
    for (const name of names) {
      assert(!name.includes("..") && !name.startsWith("/") && !name.includes("\\"));
      assert(!/(^|\/)(\.secrets|\.tools|build|Kanitlar|Dagitim)(\/|$)|\.(jks|keystore|gguf|onnx|tflite|safetensors)$|signing\.properties$|local\.properties$/i.test(name));
      assert(name.startsWith("app/src/") || name.startsWith("gradle/") || name.startsWith("scripts/") || name.startsWith("docs/") || [".gitignore", "AGENTS.md", "DEVIR.md", "README.md", "build.gradle.kts", "settings.gradle.kts", "gradle.properties", "gradlew.bat", "app/build.gradle.kts"].includes(name));
      assert.equal(digest(entries[name]), digest(await readFile(resolve("D:/KutaryaMobile", name))), name);
    }
    manifest.sourceAudit = { entries: names, fileCount: names.length, secretsAndModelWeightsExcluded: true, matchesDeliveredSource: true };
  }
  await copyFile(resolve("D:/KutaryaMobile/Dagitim", spec.name), resolve(out, spec.name));
  manifest.artifacts.push({ ...spec, bytes: bytes.length, sha256: digest(bytes) });
}
for (const img of kutaryaMobileImages) {
  const bytes = await readFile(resolve("D:/KutaryaMobile/Kanitlar", img.source));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
  await copyFile(resolve("D:/KutaryaMobile/Kanitlar", img.source), resolve(images, img.name));
  manifest.images.push({ name: img.name, role: img.role, bytes: bytes.length, sha256: digest(bytes) });
}
await writeFile(mobileManifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ gameId: manifest.gameId, version: manifest.version, files: manifest.artifacts.map(f => ({ name: f.name, bytes: f.bytes, sha256: f.sha256 })), images: manifest.images.length, privateFilesExcluded: true }));
