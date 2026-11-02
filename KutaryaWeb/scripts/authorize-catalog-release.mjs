// Mevcut hesap/claim korunur. Parola/key yok; kısa ömürlü token sadece bellekte.
import assert from "node:assert/strict";
import {writeFile} from "node:fs/promises";
import {spawn} from "node:child_process";
import {resolve} from "node:path";
import {cloudAdmin,cloudGet,cloudRequest,projectId,operatorEmail,listCollection,createDocument} from "./firebase-cloud.mjs";
import {categories,settings,announcements} from "../functions/catalog.js";
assert.equal(process.env.KUTARYA_RELEASE_APPROVED,"true");
assert(operatorEmail,"Mevcut CLI hesap e-postası bulunamadı.");
const {auth}=await cloudAdmin();
const u=await auth.getUserByEmail("kutaryaai@gmail.com");
assert(u.emailVerified);
// Yalnız eksik başlangıç verileri; canlı başka koleksiyonlar veya Auth hesapları silinmez.
for(const [name,items] of [["gameCategories",categories],["gameAnnouncements",announcements],["gameSiteSettings",[{id:"public",...settings}]]]) {
 const existing=await listCollection(name);
 for(const x of items)if(!existing.some(d=>d.name.endsWith("/"+x.id)))await createDocument(name,x.id,x);
}
if(u.customClaims?.gamesAdmin!==true)await auth.setCustomUserClaims(u.uid,{...u.customClaims,gamesAdmin:true});
const resource=`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com`;
const before=await cloudRequest(resource+":getIamPolicy?options.requestedPolicyVersion=3","POST");
const role="roles/iam.serviceAccountTokenCreator",member=`user:${operatorEmail}`;
const already=(before.bindings||[]).some(b=>b.role===role&&!b.condition&&b.members?.includes(member));
await writeFile("artifacts/release-2026-10-07/upload-iam-before.json",JSON.stringify({resource,before,role,member,temporaryAdded:!already},null,2)+"\n");
async function revokeTemporary() {
 if(already)return;
 const current=await cloudRequest(resource+":getIamPolicy?options.requestedPolicyVersion=3","POST");
 const policy={...current,bindings:(current.bindings||[]).map(b=>b.role===role&&!b.condition?{...b,members:b.members.filter(x=>x!==member)}:b).filter(b=>b.members?.length)};
 await cloudRequest(resource+":setIamPolicy","POST",{policy});
 await writeFile("artifacts/release-2026-10-07/upload-iam-cleanup.json",JSON.stringify({at:new Date().toISOString(),temporaryBindingRemoved:true},null,2));
}
let token;
try {
 if(!already) {
  const policy=structuredClone(before);policy.bindings??=[];
  const b=policy.bindings.find(x=>x.role===role&&!x.condition);
  if(b)b.members.push(member);else policy.bindings.push({role,members:[member]});
  await cloudRequest(resource+":setIamPolicy","POST",{policy});
 }
 for(let attempt=0;attempt<24;attempt++) {
  try {token=await auth.createCustomToken(u.uid);break;}catch(e){if(attempt===23)throw new Error(`Geçici token oluşturulamadı: ${String(e.message).replace(/Bearer\s+\S+/gi,"Bearer [gizli]")}`);if(attempt%6===0)console.log("Geçici imza yetkisinin bulutta etkinleşmesi bekleniyor; şifre veya anahtar istenmiyor.");await new Promise(done=>setTimeout(done,5000));}
 }
} finally {await revokeTemporary();}
assert(token);
console.log("Mevcut doğrulanmış admin hazır. Geçici IAM imza yetkisi kaldırıldı; parola veya kalıcı anahtar yok.");
for(const script of ["scripts/publish-catalog.mjs","scripts/upload-video.mjs"]) {
 const child=spawn(process.execPath,[script],{env:{...process.env,KUTARYA_UPLOAD_CUSTOM_TOKEN:token,NODE_OPTIONS:`--require=${resolve("scripts/no-listeners.cjs").replaceAll("\\","/")}`},stdio:["ignore","inherit","inherit"],windowsHide:true});
 const code=await new Promise((done,fail)=>{child.on("error",fail);child.on("exit",done);});
 assert.equal(code,0,`${script}: yayın tamamlanmadı.`);
}
