// Yalnız kabulden geçen teslim dosyaları ve sentetik kabul ekranları alınır.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,existsSync} from 'node:fs';
import {mkdir,readFile,copyFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {normalizeGame,fileSpec,fileSignature} from '../functions/policy.js';
import {kutaryaJenerik,kutaryaJenerikFiles,kutaryaJenerikImages} from '../projects-src/kutarya-jenerik.mjs';
import {jenerikArtifactDirectory as out,jenerikImageDirectory as media,jenerikManifestPath,jenerikReleaseDirectory} from './jenerik-release-paths.mjs';
const taskRoot='C:/Users/yunus/Documents/Codex/2026-10-18/im';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const local=await json(`${taskRoot}/outputs/Kutarya-Jenerik-1.4.0-Teslim/paket-bilgisi.json`);
const runtime=await json(`${taskRoot}/outputs/Kutarya-Jenerik-1.4.0-Teslim/Kanitlar/paketli-kabul.json`);
const closing=await json(`${taskRoot}/outputs/Kutarya-Jenerik-1.4.0-Teslim/Kanitlar/kapanis-kabul.json`);
const installer=await json(`${taskRoot}/work/jenerik-web-release-1.4.0/installer-acceptance.json`);
const revision=await json(`${taskRoot}/work/jenerik-web-release-1.4.0/r2-package-acceptance.json`);
assert.equal(local.version,kutaryaJenerik.version);assert.equal(local.tests.unitPassed,72);
for(const report of [runtime,closing])assert(report.passed&&report.packaged&&report.checks.every(check=>check.passed)&&report.errors.length===0);
assert.equal(runtime.checks.length,52);assert.equal(closing.checks.length,7);
assert(installer.passed&&installer.cases.length===6&&installer.cases.every(item=>item.passed)&&!installer.realApplicationControlled);
assert(revision.setup.sameApplicationAsAccepted140&&revision.setup.payloadFiles===136&&revision.hookSha256===installer.hookSha256&&!revision.payloadHasUserData);
normalizeGame(kutaryaJenerik,undefined,['uygulama']);
await mkdir(out,{recursive:true});await mkdir(media,{recursive:true});await mkdir(jenerikReleaseDirectory,{recursive:true});
assert(!existsSync(jenerikManifestPath),'Aynı sürüm manifesti değiştirilmez.');
async function digest(file){const hash=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(file)){bytes+=chunk.length;hash.update(chunk);}return {bytes,sha256:hash.digest('hex').toUpperCase()};}
const artifacts=[];
for(const spec of kutaryaJenerikFiles){const actual=await digest(spec.source);fileSpec({...spec,size:actual.bytes,version:kutaryaJenerik.version});assert(fileSignature(spec.name,(await readFile(spec.source)).subarray(0,8)));assert(!existsSync(resolve(out,spec.name)));await copyFile(spec.source,resolve(out,spec.name));assert.deepEqual(await digest(resolve(out,spec.name)),actual);const expected=spec.role==='portable'?local.portable:revision.setup;assert.equal(actual.bytes,expected.bytes);assert.equal(actual.sha256.toLowerCase(),expected.sha256);artifacts.push({name:spec.name,role:spec.role,platform:spec.platform,...actual});}
const images=[];
for(const spec of kutaryaJenerikImages){const bytes=await readFile(spec.source);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.length<=1024*1024);const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);assert(width>=900&&height>=650);assert(!existsSync(resolve(media,spec.name)));await copyFile(spec.source,resolve(media,spec.name));const actual=await digest(spec.source);assert.deepEqual(await digest(resolve(media,spec.name)),actual);images.push({name:spec.name,role:spec.role,caption:spec.caption,width,height,...actual,path:`/media/projects/kutarya-jenerik/${kutaryaJenerik.version}/${spec.name}`});}
const manifest={version:kutaryaJenerik.version,at:new Date().toISOString(),gameId:kutaryaJenerik.id,productionChanged:false,listeningServerStarted:false,artifacts,images,acceptance:{unit:72,packagedApplicationChecks:52,packagedCloseChecks:7,installerFixtureCases:6,liveElevenLabs:false,publicInstallerExecuted:false,applicationCodeChangedSinceAccepted140:false,installerRevision:'r2'}};
await writeFile(jenerikManifestPath,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});await writeFile(resolve(out,'katalog-taslagi.json'),JSON.stringify(kutaryaJenerik,null,2)+'\n',{flag:'wx'});await copyFile(`${taskRoot}/work/jenerik-web-release-1.4.0/installer-acceptance.json`,resolve(jenerikReleaseDirectory,'installer-acceptance.json'));
console.log(JSON.stringify({version:manifest.version,artifacts,images:images.map(({name,width,height})=>({name,width,height})),descriptionLength:kutaryaJenerik.description.length}));
