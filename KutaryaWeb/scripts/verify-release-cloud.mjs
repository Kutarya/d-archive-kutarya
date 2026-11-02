// Yayın sonrası mevcut servisleri/kuralları ve gerçek Hosting paketlerini okur.
import assert from "node:assert/strict";
import {readFile,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {cloudGet,cloudRequest,projectId} from "./firebase-cloud.mjs";
const out="artifacts/release-2026-10-07",base="https://kutarya.com";
const json=async p=>JSON.parse(await readFile(p,"utf8"));
const proof={at:new Date().toISOString(),projectId,base,hostingVersion:null,existingFunctionsPreserved:[],runtimes:[],passwordRequested:false,listeningServerStarted:false};
const current=await cloudGet(`https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`);
for(const old of await json(`${out}/functions-before.json`)){
 const f=current.functions.find(f=>f.name===old.name);assert(f,old.name);
 assert.equal(f.state,"ACTIVE");assert.equal(f.serviceConfig.uri,old.uri);assert.equal(f.buildConfig.runtime,old.runtime);
 proof.existingFunctionsPreserved.push(old.name.split("/").at(-1));
}
assert.equal(current.functions.find(f=>f.name.endsWith("/gamesService"))?.state,"ACTIVE");
const releases=await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`);
proof.hostingVersion=releases.releases[0].version.name;
assert.notEqual(proof.hostingVersion,(await json(`${out}/hosting-before.json`)).release.version.name);
const rulesRelease=await cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`);
const rules=await cloudGet(`https://firebaserules.googleapis.com/v1/${rulesRelease.rulesetName}`);
assert.equal(rules.source.files[0].content,await readFile("artifacts/firebase-live-firestore.rules","utf8"));
proof.firestoreRulesUnchanged=true;
const storageReleases=await cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`);
const storageRelease=storageReleases.releases.find(r=>r.name.endsWith("firebase.storage/kutarya-ai-3169.firebasestorage.app"));assert(storageRelease);
const storageRules=await cloudGet(`https://firebaserules.googleapis.com/v1/${storageRelease.rulesetName}`);
assert.equal(storageRules.source.files[0].content,await readFile("artifacts/firebase-production-storage.rules","utf8"));
proof.storageRulesMatchReviewedSource=true;
const iam=await cloudRequest(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com:getIamPolicy?options.requestedPolicyVersion=3`,"POST");
const before=await json(`${out}/upload-iam-before.json`);
if(before.temporaryAdded)assert(!(iam.bindings||[]).some(b=>b.role===before.role&&!b.condition&&b.members?.includes(before.member)));
proof.temporaryIamBindingRemoved=JSON.parse(await readFile(`${out}/upload-iam-cleanup.json`,"utf8")).temporaryBindingRemoved;
for(const [id,version] of [["blackjack","1.0.3"],["rulet","1.0.1"],["pixelgun","1.0.0"],["blok-diyari","0.1.0"],["kutarya-convert","1.0.0"]]){
 const manifest=await json(`public/games/${id}/${version}/kutarya-manifest.json`);
 const files=[];
 for(const f of manifest.files){
  const r=await fetch(`${base}/games/${id}/${version}/${f.path}`);assert(r.ok,f.path);
  let bytes=0;const h=createHash("sha256");for await(const c of r.body){bytes+=c.length;h.update(c);}
  assert.equal(bytes,f.bytes);assert.equal(h.digest("hex"),f.sha256.toLowerCase());files.push({path:f.path,bytes,sha256:f.sha256});
 }
 proof.runtimes.push({id,version,files});
}
proof.passed=true;await writeFile(`${out}/cloud-release-acceptance.json`,JSON.stringify(proof,null,2)+"\n");
console.log(JSON.stringify({hostingVersion:proof.hostingVersion,oldFunctions:proof.existingFunctionsPreserved.length,firestoreRulesUnchanged:true,temporaryIamBindingRemoved:proof.temporaryIamBindingRemoved,runtimeFiles:proof.runtimes.reduce((n,p)=>n+p.files.length,0),passed:true}));
