// Sadece açık hedef; stdin kapalı, etkileşimsiz. Parola isteyen adımda iptal.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, appendFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
const scope = process.argv[2];
assert(["functions:kutarya-games", "storage", "hosting"].includes(scope));
assert.equal(
  process.env.KUTARYA_RELEASE_APPROVED,
  "true",
  "Kullanıcı yayın onayı gerekir.",
);
const args = [
  process.env.APPDATA + "/npm/node_modules/firebase-tools/lib/bin/firebase.js",
  "deploy",
  "--only",
  scope,
  "--project",
  "kutarya-ai-3169",
  "--non-interactive",
];
if (scope === "storage") args.push("--config", "firebase.storage-release.json");
if (scope === "hosting") {
  // Her yayında güncel genel katalogdan üret; paneldeki yeni projeler atlanmasın.
  await import("./build-seo.mjs");
  args.push("--config", "firebase.seo-release.json");
}
const logDir = resolve(
  process.env.KUTARYA_RELEASE_LOG_DIR || "artifacts/release-2026-10-07",
);
assert(
  logDir.startsWith(resolve("artifacts") + sep),
  "Yayın kaydı artifacts altında tutulmalıdır.",
);
await mkdir(logDir, { recursive: true });
const log = resolve(logDir, `deploy-${scope.replaceAll(":", "-")}.log`);
const env = {
  ...process.env,
  FIREBASE_FUNCTIONS_DISCOVERY_OUTPUT_PATH: "true",
  NODE_OPTIONS:
    `${process.env.NODE_OPTIONS || ""} --require=${resolve("scripts/no-listeners.cjs").replaceAll("\\", "/")}`.trim(),
};
const child = spawn(process.execPath, args, {
  env,
  stdio: ["ignore", "pipe", "pipe"],
  windowsHide: true,
});
let passwordRequired = false,
  tail = "";
function output(bytes) {
  const s = bytes.toString();
  tail = (tail + s).slice(-12000);
  if (
    /(?:enter|provide|input|type|set value for|missing value for)[^\n]{0,100}(?:password|parola|şifre|MOBILE_MAIL_PASS)|(?:password|parola|şifre)[^\n]{0,30}(?:required|gerekli)/i.test(
      tail,
    )
  ) {
    passwordRequired = true;
    child.kill();
  }
  process.stdout.write(s);
  void appendFile(log, s);
}
child.stdout.on("data", output);
child.stderr.on("data", output);
const code = await new Promise((done, fail) => {
  child.on("error", fail);
  child.on("exit", done);
});
if (passwordRequired)
  throw new Error(
    "Şifre/parola isteyen adım tespit edildi; kullanıcının talimatıyla işlem iptal edildi.",
  );
assert.equal(
  code,
  0,
  `Firebase dağıtımı başarısız; çıkış ${code}. Parola istemek için etkileşimli giriş açılmaz.`,
);
