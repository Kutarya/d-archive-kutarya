// Gerçek HTTPS ve ayrı başsız Edge profili; masaüstü uygulaması yönetilmez.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {chromium} from 'file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {kutaryaJenerik,kutaryaJenerikFiles,kutaryaJenerikImages} from '../projects-src/kutarya-jenerik.mjs';
import {jenerikReleaseDirectory as out,jenerikManifestPath} from './jenerik-release-paths.mjs';
const base='https://kutarya.com',endpoint='https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService';
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const sha=buffer=>createHash('sha256').update(buffer).digest('hex');
async function digest(file){const hash=createHash('sha256');let bytes=0;for await(const chunk of createReadStream(file)){bytes+=chunk.length;hash.update(chunk);}return {bytes,sha256:hash.digest('hex').toUpperCase()};}
async function api(op,data={}){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:{op,...data}})}),body=await r.json();assert(r.ok&&!body.error,op);return body.result;}
const manifest=await json(jenerikManifestPath),seo=await json('artifacts/seo-2026-10-07/build.json'),catalog=await api('catalog'),game=catalog.games.find(item=>item.id===kutaryaJenerik.id);
assert.equal(game.version,kutaryaJenerik.version);assert.equal(game.status,'published');assert.equal(game.files.filter(file=>file.version===game.version).length,2);
const proof={at:new Date().toISOString(),siteUrl:base+'/proje/kutarya-jenerik',version:game.version,publicProjectCount:catalog.games.length,html:[],views:[],downloads:[],oldDownloads:[],listeningServerStarted:false,desktopApplicationControlled:false,installerExecuted:false};
for(const page of seo.pages){const response=await fetch(base+page.path);assert.equal(response.status,200,page.path);const body=Buffer.from(await response.arrayBuffer());assert.equal(sha(body),page.sha256,page.path+': canlı HTML farklı');proof.html.push({path:page.path,sha256MatchesBuild:true});}
for(const name of ['sitemap.xml','robots.txt']){const response=await fetch(base+'/'+name);assert.equal(response.status,200);assert.equal(sha(Buffer.from(await response.arrayBuffer())),sha(await readFile('dist/'+name)));}
const product=await fetch(proof.siteUrl),html=await product.text();assert(html.includes('rel="canonical" href="'+proof.siteUrl+'"')&&html.includes('1.4.0')&&html.includes('kutarya-schema'));
const denied=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:{op:'admin.data'}})});assert.equal(denied.status,401);proof.anonymousAdminBlocked=true;
const privatePage=await fetch(base+'/ozel');assert(privatePage.headers.get('x-robots-tag')?.includes('noindex'));
const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));page.setDefaultTimeout(20000);
try{
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto(proof.siteUrl);await page.getByRole('heading',{name:'Kutarya Jenerik',exact:true}).waitFor();await page.waitForFunction(()=>document.body.textContent.includes('1.4.0'));
  const images=page.locator('.detail-cover img,.gallery img');assert.equal(await images.count(),kutaryaJenerikImages.length);for(let index=0;index<await images.count();index++)await images.nth(index).scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('.detail-cover img,.gallery img')].every(image=>image.complete&&image.naturalWidth>0));await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.detail-cover img,.gallery img')].map(image=>image.decode()));await document.fonts.ready;window.scrollTo({top:0,behavior:'instant'});});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:resolve(out,`canli-jenerik-${width}.png`)});
  await page.getByRole('tab',{name:/^Dosyalar \(/}).click();assert.equal(await page.locator('#project-tab > .download-row').count(),kutaryaJenerikFiles.length);assert((await page.locator('#project-tab > .download-row').first().innerText()).includes(kutaryaJenerikFiles[0].name));
  await page.locator('.previous-files summary').click();const previous=game.files.filter(file=>file.version!==game.version);for(const file of previous)assert.equal(await page.locator('.previous-files .download-row').filter({hasText:file.name}).count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo({top:0,behavior:'instant'});});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:resolve(out,`canli-dosyalar-${width}.png`),fullPage:true});proof.views.push({width,version:game.version,currentFiles:2,previousFiles:previous.length,decodedImages:kutaryaJenerikImages.length,horizontalOverflow:false});
 }
 await page.setViewportSize({width:1280,height:900});
 for(const file of manifest.artifacts){
  const event=page.waitForEvent('download',{timeout:120000});
  if(file.role==='installer')await page.locator('.project-heading').getByRole('button',{name:'Windows için indir',exact:true}).click();
  else await page.locator('.download-row').filter({hasText:file.name}).getByRole('button',{name:file.name+' indir',exact:true}).click();
  const download=await event;assert.equal(download.suggestedFilename(),file.name);const url=new URL(download.url());assert.equal(url.origin,'https://firebasestorage.googleapis.com');assert(url.pathname.startsWith('/v0/b/kutarya-ai-3169.firebasestorage.app/o/'));
  const target=resolve(out,'canli-indirme-'+file.name);await download.saveAs(target);assert.equal(await download.failure(),null);const actual=await digest(target);assert.equal(actual.bytes,file.bytes);assert.equal(actual.sha256,file.sha256);proof.downloads.push({name:file.name,...actual,viaActualBrowserButton:true,completeTransfer:true,installerExecuted:false});console.log(JSON.stringify({downloadVerified:file.name,bytes:actual.bytes}));
 }
 for(const file of game.files.filter(file=>file.version!==game.version)){const result=await api('download',{gameId:game.id,fileId:file.id}),response=await fetch(result.url,{method:'HEAD'});assert.equal(response.status,200);assert.equal(Number(response.headers.get('content-length')),file.size);proof.oldDownloads.push({name:file.name,version:file.version,status:200,bytes:file.size});}
 assert.deepEqual(errors,[]);proof.rendererErrors=errors;proof.passed=true;await writeFile(resolve(out,'live-site-acceptance.json'),JSON.stringify(proof,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...proof,html:proof.html.length},null,2));
}finally{await browser.close();}
