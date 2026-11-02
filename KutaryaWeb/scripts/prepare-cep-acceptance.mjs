// Kurulmuş son APK'nın emülatör raporunu ve Gradle birim/lint kanıtını bağlar.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const android = await readFile(
  new URL("artifacts/kutarya-cep/android-kabul.txt", root),
  "utf8",
);
assert(
  /OK \(12 tests\)/.test(android) && !android.includes("FAILURES"),
  "Son APK 12 cihaz testini geçmeli.",
);
let count = 0;
for (const name of ["CoreTest", "HttpTest"]) {
  const xml = await readFile(
    new URL(
      `mobile-src/kutarya-cep/app/build/test-results/testDebugUnitTest/TEST-com.kutarya.cep.${name}.xml`,
      root,
    ),
    "utf8",
  );
  assert(/failures="0"/.test(xml) && /errors="0"/.test(xml));
  count += Number(xml.match(/tests="(\d+)"/)[1]);
}
assert.equal(count, 27);
const lint = await readFile(
  new URL(
    "mobile-src/kutarya-cep/app/build/intermediates/lint_intermediate_text_report/debug/lintReportDebug/lint-results-debug.txt",
    root,
  ),
  "utf8",
);
assert(!lint.includes("Error:"));
const apk = await readFile(
  new URL(
    "mobile-src/kutarya-cep/app/build/outputs/apk/debug/app-debug.apk",
    root,
  ),
);
const report = {
  at: new Date().toISOString(),
  passed: true,
  unitTests: 27,
  androidTests: 12,
  lintErrors: 0,
  lintWarnings: Number(lint.match(/0 errors, (\d+) warnings/)?.[1] || 0),
  apkSha: createHash("sha256").update(apk).digest("hex").toUpperCase(),
  device: "Kutarya_School_Test / Android 17 / API 37 / x86_64",
  realProviderAcceptance: false,
  physicalPhoneAcceptance: false,
  productionChanged: false,
};
await writeFile(
  new URL("artifacts/kutarya-cep/android-kabul.json", root),
  JSON.stringify(report, null, 2),
);
console.log(report);
