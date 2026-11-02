// Yalnız kullanıcının onayladığı arena servisi; ortak servis/rules/Auth değiştirilmez.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { cloudGet, cloudRequest, projectId } from "./firebase-cloud.mjs";
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, "true");
import { arenaReleaseDirectory as out } from "./arena-release-paths.mjs";
await mkdir(out, { recursive: true });
const email = `kutarya-arena-runtime@${projectId}.iam.gserviceaccount.com`;
const existing = await cloudGet(
  `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
);
if (!existing.accounts?.some((a) => a.email === email))
  await cloudRequest(
    `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`,
    "POST",
    {
      accountId: "kutarya-arena-runtime",
      serviceAccount: {
        displayName: "Kutarya Block Arena — veri/sır yetkisi olmayan runtime",
      },
    },
  );
const args = [
  "run",
  "deploy",
  "kutarya-block-arena",
  `--project=${projectId}`,
  "--region=europe-west1",
  "--source=arena-server",
  "--min-instances=0",
  "--max-instances=1",
  "--max=1",
  "--min=0",
  "--concurrency=160",
  "--cpu=1",
  "--memory=256Mi",
  "--timeout=3600",
  "--allow-unauthenticated",
  `--service-account=${email}`,
  "--quiet",
  "--format=json",
];
const child = spawn(
  "C:/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/platform/bundledpython/python.exe",
  [
    "C:/Program Files (x86)/Google/Cloud SDK/google-cloud-sdk/lib/gcloud.py",
    ...args,
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    env: { ...process.env, CLOUDSDK_CORE_DISABLE_PROMPTS: "1" },
  },
);
let output = "",
  err = "";
child.stdout.on("data", (b) => {
  output += b;
});
child.stderr.on("data", (b) => {
  err += b;
  process.stdout.write(b);
});
const code = await new Promise((done, fail) => {
  child.on("exit", done);
  child.on("error", fail);
});
await writeFile(`${out}/arena-deploy.log`, err);
assert.equal(
  code,
  0,
  "Arena servisi dağıtımı başarısız; etkileşimli login açılmaz.",
);
const service = JSON.parse(output);
const url = service.status?.url || service.uri;
assert(url && new URL(url).protocol === "https:");
await writeFile(
  `${out}/service.json`,
  JSON.stringify(
    {
      at: new Date().toISOString(),
      projectId,
      url,
      revision:
        service.status?.latestReadyRevisionName || service.latestReadyRevision,
      serviceAccount: email,
      minInstances: 0,
      maxInstances: 1,
    },
    null,
    2,
  ),
);
console.log(`Arena servisi hazır: ${url}`);
