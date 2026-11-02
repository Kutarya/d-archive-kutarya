// Mevcut yetkili hesabın kısa ömürlü token'ı; ortak claim değişimi veya parola yok.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import {
  cloudAdmin,
  cloudRequest,
  projectId,
  operatorEmail,
} from "./firebase-cloud.mjs";
const stage = process.argv[2];
assert(["upload", "activate"].includes(stage));
assert.equal(process.env.KUTARYA_RELEASE_APPROVED, "true");
import { arenaReleaseDirectory as out } from "./arena-release-paths.mjs";
assert(
  JSON.parse(await readFile(`${out}/protocol-acceptance.json`, "utf8")).passed,
);
assert(
  JSON.parse(await readFile(`${out}/local-netcode-acceptance.json`, "utf8"))
    .passed,
);
const { auth } = await cloudAdmin(),
  user = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(user.emailVerified && user.customClaims?.gamesAdmin);
const resource = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com`;
const before = await cloudRequest(
    resource + ":getIamPolicy?options.requestedPolicyVersion=3",
    "POST",
  ),
  role = "roles/iam.serviceAccountTokenCreator",
  member = `user:${operatorEmail}`;
const already = before.bindings?.some(
  (b) => b.role === role && !b.condition && b.members.includes(member),
);
await writeFile(
  `${out}/${stage}-iam-before.json`,
  JSON.stringify({ before, role, member, temporaryAdded: !already }, null, 2),
);
let token;
try {
  if (!already) {
    const policy = structuredClone(before);
    policy.bindings ??= [];
    const binding = policy.bindings.find(
      (b) => b.role === role && !b.condition,
    );
    if (binding) binding.members.push(member);
    else policy.bindings.push({ role, members: [member] });
    await cloudRequest(resource + ":setIamPolicy", "POST", { policy });
  }
  for (let attempt = 0; attempt < 24; attempt++) {
    try {
      token = await auth.createCustomToken(user.uid);
      break;
    } catch (e) {
      if (attempt === 23)
        throw Error(
          String(e.message).replace(/Bearer\s+\S+/gi, "Bearer [gizli]"),
        );
      if (attempt % 6 === 0)
        console.log("Geçici imza yetkisinin etkinleşmesi bekleniyor.");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
} finally {
  if (!already) {
    const current = await cloudRequest(
      resource + ":getIamPolicy?options.requestedPolicyVersion=3",
      "POST",
    );
    const policy = {
      ...current,
      bindings: current.bindings
        .map((b) =>
          b.role === role && !b.condition
            ? { ...b, members: b.members.filter((m) => m !== member) }
            : b,
        )
        .filter((b) => b.members.length),
    };
    await cloudRequest(resource + ":setIamPolicy", "POST", { policy });
  }
  await writeFile(
    `${out}/${stage}-iam-cleanup.json`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        temporaryBindingRemoved: !already,
        existingPermissionPreserved: !!already,
      },
      null,
      2,
    ),
  );
}
assert(token);
console.log(
  "Geçici imza izni kaldırıldı; mevcut admin hattında Arena işlemi başlıyor.",
);
const child = spawn(process.execPath, ["scripts/upload-arena.mjs", stage], {
  env: {
    ...process.env,
    KUTARYA_UPLOAD_CUSTOM_TOKEN: token,
    NODE_OPTIONS: `--require=${resolve("scripts/no-listeners.cjs").replaceAll("\\", "/")}`,
  },
  stdio: ["ignore", "inherit", "inherit"],
  windowsHide: true,
});
const code = await new Promise((done, fail) => {
  child.on("exit", done);
  child.on("error", fail);
});
assert.equal(code, 0, "Arena katalog işlemi tamamlanmadı.");
