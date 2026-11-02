// Yayın öncesi/sonrası salt okunur ölçüm; yalnız Jenerik kaydı ve Hosting değişir.
import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createGzip} from 'node:zlib';
import {createHash} from 'node:crypto';
import {resolve,sep} from 'node:path';
import {cloudGet,cloudRequest,cloudAdmin,listCollection,decodeValue,projectId,bucketName} from './firebase-cloud.mjs';
import {kutaryaJenerik,kutaryaJenerikFiles,kutaryaJenerikImages} from '../projects-src/kutarya-jenerik.mjs';
import {jenerikReleaseDirectory as out} from './jenerik-release-paths.mjs';
const mode=process.argv[2];assert(['before','after'].includes(mode));assert.equal(projectId,'kutarya-ai-3169');await mkdir(out,{recursive:true});
const {auth}=await cloudAdmin(),administrator=await auth.getUserByEmail('kutaryaai@gmail.com');assert(administrator.emailVerified&&administrator.customClaims?.gamesAdmin===true);
const iamResource=`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts/${projectId}@appspot.gserviceaccount.com`;
const iam=await cloudRequest(iamResource+':getIamPolicy?options.requestedPolicyVersion=3','POST');
const iamBindings=(iam.bindings||[]).map(item=>({...item,members:[...item.members].sort()})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
const [releases,services,firestore,rules,authConfig,domains]=await Promise.all([
 cloudGet(`https://firebasehosting.googleapis.com/v1beta1/sites/${projectId}/releases?pageSize=2`),
 cloudGet(`https://cloudfunctions.googleapis.com/v2/projects/${projectId}/locations/-/functions`),
 cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases/cloud.firestore`),
 cloudGet(`https://firebaserules.googleapis.com/v1/projects/${projectId}/releases?pageSize=100`),
 cloudGet(`https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`),
 cloudGet(`https://firebasehosting.googleapis.com/v1beta1/projects/${projectId}/sites/${projectId}/customDomains`)
]);
const domain=domains.customDomains.find(item=>item.name.endsWith('/kutarya.com'));assert(domain?.hostState==='HOST_ACTIVE'&&domain.cert?.state==='CERT_ACTIVE');assert(authConfig.authorizedDomains.includes('kutarya.com'));
const release=releases.releases.find(item=>item.type==='DEPLOY');assert(release?.version?.name);const version=await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`);
const storage=rules.releases.find(item=>item.name.includes('firebase.storage/')&&item.name.endsWith(bucketName));assert(firestore.rulesetName&&storage?.rulesetName);
const functions=services.functions.map(item=>({name:item.name,state:item.state,uri:item.serviceConfig?.uri,runtime:item.buildConfig?.runtime,updateTime:item.updateTime})).sort((a,b)=>a.name.localeCompare(b.name));assert(functions.some(item=>item.name.endsWith('/gamesService')&&item.state==='ACTIVE'));
const collections={};for(const name of ['gamesCatalog','gameCategories','gameAnnouncements','gameSiteSettings','projectSlugs'])collections[name]=(await listCollection(name)).sort((a,b)=>a.name.localeCompare(b.name));
const previousPublished=JSON.parse(await readFile('artifacts/site-refresh/2026-10-14/after.json','utf8'));
const sourceHashes={};for(const file of Object.keys(previousPublished.sourceHashes))sourceHashes[file]=createHash('sha256').update(await readFile(file)).digest('hex');assert.deepEqual(sourceHashes,previousPublished.sourceHashes,'Mevcut yayın dışındaki site kaynakları değişmiş.');
const hostingFiles=[];let next;do{const page=await cloudGet(`https://firebasehosting.googleapis.com/v1beta1/${release.version.name}/files?pageSize=1000${next?'&pageToken='+encodeURIComponent(next):''}`);hostingFiles.push(...(page.files||[]));next=page.nextPageToken;}while(next);
const immutable=hostingFiles.filter(file=>/^\/(games|media|ozel)\//.test(file.path)||file.path==='/ozel.html').map(({path,hash})=>({path,hash})).sort((a,b)=>a.path.localeCompare(b.path));assert(immutable.length>0);
const snapshot={at:new Date().toISOString(),projectId,hosting:{release,version,domain:{name:domain.name,hostState:domain.hostState,certState:domain.cert.state}},functions,rules:{firestore:firestore.rulesetName,storage:storage.rulesetName},collections,admin:{uid:administrator.uid,emailVerified:administrator.emailVerified,customClaims:administrator.customClaims},authConfig:{authorizedDomains:authConfig.authorizedDomains,emailSignIn:authConfig.signIn?.email?.enabled},sourceHashes,iamBindings,immutable};
const decode=document=>Object.fromEntries(Object.entries(document.fields).map(([key,value])=>[key,decodeValue(value)]));
if(mode==='before'){
 for(const file of immutable){const target=resolve('public','.'+file.path);assert(target.startsWith(resolve('public')+sep));const digest=createHash('sha256');for await(const chunk of createReadStream(target).pipe(createGzip({level:9})))digest.update(chunk);assert.equal(digest.digest('hex'),file.hash,file.path+': canlı dosya yerel yayın kaynağıyla farklı.');}
 await writeFile(resolve(out,'before.json'),JSON.stringify(snapshot,null,2)+'\n',{flag:'wx'});const old=decode(collections.gamesCatalog.find(item=>item.name.endsWith('/gamesCatalog/kutarya-jenerik')));
 console.log(JSON.stringify({backup:out,hosting:release.version.name,jenerikVersion:old.version,oldFiles:old.files.length,projects:collections.gamesCatalog.length,functions:functions.length,preservedHostingFiles:immutable.length,customDomainActive:true,listeningServerStarted:false}));
}else{
 const before=JSON.parse(await readFile(resolve(out,'before.json'),'utf8'));for(const key of ['functions','rules','admin','authConfig','sourceHashes','iamBindings'])assert.deepEqual(snapshot[key],before[key],key+' değişmiş.');
 for(const name of Object.keys(collections)){const other=docs=>docs.filter(item=>!['gamesCatalog/kutarya-jenerik','projectSlugs/kutarya-jenerik'].some(id=>item.name.endsWith('/'+id)));assert.deepEqual(other(collections[name]),other(before.collections[name]),'Diğer katalog verisi: '+name);}
 for(const file of before.immutable)assert.equal(immutable.find(item=>item.path===file.path)?.hash,file.hash,'Eski Hosting dosyası değişmiş: '+file.path);
 const game=decode(collections.gamesCatalog.find(item=>item.name.endsWith('/gamesCatalog/kutarya-jenerik'))),prior=decode(before.collections.gamesCatalog.find(item=>item.name.endsWith('/gamesCatalog/kutarya-jenerik')));
 assert.equal(game.version,kutaryaJenerik.version);assert.equal(game.status,'published');for(const file of prior.files)assert.deepEqual(game.files.find(item=>item.id===file.id),file,'Eski indirme değişmiş.');
 const latest=game.files.filter(item=>item.version===kutaryaJenerik.version);assert.equal(latest.length,kutaryaJenerikFiles.length);for(const file of kutaryaJenerikFiles)assert(latest.some(item=>item.name===file.name&&item.role===file.role&&item.platform===file.platform));assert.equal(game.gallery.length,kutaryaJenerikImages.length-1);assert.notEqual(release.version.name,before.hosting.release.version.name);
 await writeFile(resolve(out,'after.json'),JSON.stringify(snapshot,null,2)+'\n',{flag:'wx'});
 const proof={at:snapshot.at,passed:true,version:game.version,hostingVersion:release.version.name,priorHostingVersion:before.hosting.release.version.name,onlyJenerikCatalogAndHostingChanged:true,latestFiles:latest.length,priorFilesPreserved:prior.files.map(({id,name,version})=>({id,name,version})),functionsUnchanged:functions.length,rulesUnchanged:true,otherProjectsUnchanged:before.collections.gamesCatalog.length-1,immutableHostingFilesUnchanged:before.immutable.length,adminAndAuthUnchanged:true,iamRestored:true,siteSourcesUnchanged:true,listeningServerStarted:false,desktopApplicationControlled:false};await writeFile(resolve(out,'cloud-acceptance.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(proof));
}
