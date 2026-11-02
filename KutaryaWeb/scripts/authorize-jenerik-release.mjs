// Yalnız mevcut gamesAdmin hesabı ve Jenerik yüklemesi; parola/key dosyası yok.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { cloudAdmin, cloudRequest, projectId, operatorEmail } from "./firebase-cloud.mjs";
import { jenerikArtifactDirectory as out } from "./jenerik-release-paths.mjs";

assert.equal(process.env.KUTARYA_RELEASE_APPROVED, "true");
assert(operatorEmail);
const { auth } = await cloudAdmin();
const u = await auth.getUserByEmail("kutaryaai@gmail.com");
assert(u.emailVerified && u.customClaims?.gamesAdmin === true, "Mevcut doğrulanmış admin gerekli; hesap yetkileri değiştirilmez.");
const resource = `https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com`;
const before = await cloudRequest(resource + ":getIamPolicy?options.requestedPolicyVersion=3", "POST");
const role = "roles/iam.serviceAccountTokenCreator", member = `user:${operatorEmail}`;
const already = (before.bindings || []).some(b => b.role === role && !b.condition && b.members?.includes(member));
await writeFile(`${out}/upload-iam-before.json`, JSON.stringify({ resource, before, role, member, temporaryAdded: !already }, null, 2));
async function revokeTemporary() {
  if (already) return;
  const current = await cloudRequest(resource + ":getIamPolicy?options.requestedPolicyVersion=3", "POST");
  const policy = { ...current, bindings: (current.bindings || []).map(b => b.role === role && !b.condition ? { ...b, members: b.members.filter(x => x !== member) } : b).filter(b => b.members?.length) };
  await cloudRequest(resource + ":setIamPolicy", "POST", { policy });
  await writeFile(`${out}/upload-iam-cleanup.json`, JSON.stringify({ at: new Date().toISOString(), temporaryBindingRemoved: true }, null, 2));
}
let token;
try {
  if (!already) {
    const policy = structuredClone(before); policy.bindings ??= [];
    const b = policy.bindings.find(x => x.role === role && !x.condition);
    if (b) b.members.push(member); else policy.bindings.push({ role, members: [member] });
    await cloudRequest(resource + ":setIamPolicy", "POST", { policy });
  }
  for (let attempt = 0; attempt < 24; attempt++) {
    try { token = await auth.createCustomToken(u.uid); break; }
    catch (e) {
      if (attempt === 23) throw new Error(`Geçici token oluşturulamadı: ${String(e.message).replace(/Bearer\s+\S+/gi, "Bearer [gizli]")}`);
      if (attempt % 6 === 0) console.log("Mevcut admin için geçici imza yetkisinin etkinleşmesi bekleniyor.");
      await new Promise(done => setTimeout(done, 5000));
    }
  }
} finally { await revokeTemporary(); }
assert(token);
console.log("Geçici IAM izni kaldırıldı; Jenerik mevcut admin yükleme hattına aktarılıyor.");
const child = spawn(process.execPath, ["scripts/upload-jenerik.mjs"], {
  env: { ...process.env, KUTARYA_UPLOAD_CUSTOM_TOKEN: token, NODE_OPTIONS: `--require=${resolve("scripts/no-listeners.cjs").replaceAll("\\", "/")}` },
  stdio: ["ignore", "inherit", "inherit"], windowsHide: true,
});
const code = await new Promise((done, fail) => { child.on("error", fail); child.on("exit", done); });
assert.equal(code, 0, "Jenerik yüklemesi tamamlanmadı.");
