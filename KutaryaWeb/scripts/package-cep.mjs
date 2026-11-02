// Yalnız izinli Java projesi dosyalarını paketler; cihaz/anahtar/build verisi yok.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  readFile,
  writeFile,
  readdir,
  mkdir,
  copyFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync, unzipSync } from "fflate";
import { kutaryaCepFiles } from "../projects-src/kutarya-cep.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const source = resolve(root, "mobile-src/kutarya-cep"),
  out = resolve(root, "artifacts/kutarya-cep");
await mkdir(out, { recursive: true });
const entries = {};
async function add(name) {
  entries[name] = new Uint8Array(await readFile(resolve(source, name)));
}
async function walk(name) {
  for (const e of await readdir(resolve(source, name), {
    withFileTypes: true,
  })) {
    assert(!e.isSymbolicLink());
    const child = name + "/" + e.name;
    if (e.isDirectory()) await walk(child);
    else await add(child);
  }
}
for (const name of [
  "settings.gradle",
  "build.gradle",
  "gradle.properties",
  "gradlew",
  "gradlew.bat",
  ".gitignore",
  "README.md",
  "LICENSE.txt",
  "THIRD-PARTY.md",
])
  await add(name);
await add("app/build.gradle");
for (const dir of ["gradle/wrapper", "app/src", "docs", "licenses"])
  await walk(dir);
assert(entries["app/src/main/java/com/kutarya/cep/MainActivity.java"]);
assert(entries["gradle/wrapper/gradle-wrapper.jar"]);
assert(entries["docs/KABUL.md"], "Ölçülmüş kabul dosyası eksik.");
for (const [name, bytes] of Object.entries(entries)) {
  assert(
    !/(local\.properties|\.jks$|\.keystore$|\.env|(^|\/)build\/|credentials)/i.test(
      name,
    ),
    name,
  );
  if (/\.(java|gradle|properties|md|xml|txt)$/.test(name))
    assert(
      !/(sk-[A-Za-z0-9_-]{24,}|AIza[A-Za-z0-9_-]{30,}|xai-[A-Za-z0-9_-]{24,})/.test(
        new TextDecoder().decode(bytes),
      ),
      `Olası sır: ${name}`,
    );
}
const zip = zipSync(entries, { level: 6 });
const check = unzipSync(zip);
assert.deepEqual(Object.keys(check).sort(), Object.keys(entries).sort());
await writeFile(resolve(out, kutaryaCepFiles[1].name), zip);
await copyFile(
  resolve(source, "app/build/outputs/apk/debug/app-debug.apk"),
  resolve(out, kutaryaCepFiles[0].name),
);
const artifacts = [];
for (const f of kutaryaCepFiles) {
  const bytes = await readFile(resolve(out, f.name));
  assert(bytes.length > 0);
  artifacts.push({
    ...f,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex").toUpperCase(),
  });
}
const manifest = {
  version: "1.0.0",
  at: new Date().toISOString(),
  privateEntries: 0,
  sourceEntries: Object.keys(entries).length,
  artifacts,
};
await writeFile(
  resolve(out, "paket-bilgisi-1.0.0.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  JSON.stringify({ sourceEntries: manifest.sourceEntries, artifacts }, null, 2),
);
