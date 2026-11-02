// Teslim edilen ZIP'ten ayrı Android projesi kurar; kod ve kaynak ikililerini karşılaştırır.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { unzipSync } from "fflate";
const root = fileURLToPath(new URL("../", import.meta.url));
const out = resolve(root, "artifacts/kutarya-cep"),
  target = resolve(root, "artifacts/cep-source-smoke");
assert(target.startsWith(resolve(root, "artifacts") + sep));
const manifest = JSON.parse(
  await readFile(resolve(out, "paket-bilgisi-1.0.0.json"), "utf8"),
);
const source = manifest.artifacts.find((f) => f.role === "source"),
  zip = await readFile(resolve(out, source.name));
const sha = (bytes) =>
  createHash("sha256").update(bytes).digest("hex").toUpperCase();
assert.equal(sha(zip), source.sha256);
const entries = unzipSync(zip);
for (const [name, bytes] of Object.entries(entries)) {
  const path = resolve(target, name);
  assert(path.startsWith(target + sep));
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
}
await writeFile(
  resolve(target, "local.properties"),
  "sdk.dir=C\\:/Users/yunus/AppData/Local/Android/Sdk\n",
);
await new Promise((done, fail) => {
  const p = spawn(
    "cmd.exe",
    [
      "/d",
      "/c",
      "gradlew.bat :app:assembleDebug :app:testDebugUnitTest --console=plain",
    ],
    {
      cwd: target,
      env: {
        ...process.env,
        JAVA_HOME: "C:/Program Files/Android/Android Studio/jbr",
      },
      windowsHide: true,
      stdio: "inherit",
    },
  );
  p.on("error", fail);
  p.on("exit", (n) =>
    n === 0 ? done() : fail(new Error("Kaynak derleme başarısız: " + n)),
  );
});
const rebuilt = unzipSync(
  await readFile(resolve(target, "app/build/outputs/apk/debug/app-debug.apk")),
);
const actual = unzipSync(
  await readFile(
    resolve(out, manifest.artifacts.find((f) => f.role === "installer").name),
  ),
);
const compare = Object.keys(actual).filter(
  (k) =>
    k.endsWith(".dex") ||
    k === "AndroidManifest.xml" ||
    k === "resources.arsc" ||
    k.startsWith("res/"),
);
for (const k of compare)
  assert.equal(sha(rebuilt[k]), sha(actual[k]), `Kaynak/APK farklı: ${k}`);
const report = {
  passed: true,
  at: new Date().toISOString(),
  sourceSha: source.sha256,
  comparedApkEntries: compare.length,
  sourceEntries: Object.keys(entries).length,
  unitTests: 27,
};
await writeFile(
  resolve(out, "source-rebuild.json"),
  JSON.stringify(report, null, 2),
);
console.log(report);
