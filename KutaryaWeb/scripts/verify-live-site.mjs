// Gerçek HTTPS site/katalog/Setup düğmesi kabulü. Yerel sunucu ve parola yok.
import assert from "node:assert/strict";
import {writeFile,readFile} from "node:fs/promises";
import {createReadStream} from "node:fs";
import {createHash} from "node:crypto";
import {chromium} from "file:///C:/Users/yunus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const base="https://kutarya.com",out="artifacts/release-2026-10-07";
const browser=await chromium.launch({channel:"msedge",headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true,reducedMotion:"reduce"});
const page=await context.newPage(),errors=[];
page.on("pageerror",e=>errors.push(e.message));
const proof={at:new Date().toISOString(),base,listeningServerStarted:false,passwordRequested:false,views:[],download:null,routes:[]};
try{
 const r=await fetch(base);assert(r.ok);assert((await r.text()).includes("/assets/"));
 for(const path of ["/","/projeler","/koleksiyon/desktop","/proje/kutarya-video","/auth/login","/admin/projeler","/games/blackjack/1.0.3/index.html","/games/rulet/1.0.1/index.html","/games/pixelgun/1.0.0/index.html","/games/blok-diyari/0.1.0/index.html","/games/kutarya-convert/1.0.0/index.html"]){const r=await fetch(base+path);assert.equal(r.status,200,path);assert(r.headers.get("content-type")?.includes("text/html"));proof.routes.push({path,status:r.status});}
 const missing=await fetch(base+"/assets/gercekte-olmayan-kutarya-video.js");assert.equal(missing.status,404);proof.routes.push({path:"/assets/gercekte-olmayan-kutarya-video.js",status:404});
 await page.goto(base+"/projeler");await page.locator(".game-card").first().waitFor();assert.equal(await page.locator(".game-card").count(),8);
 const expected=["Kutarya Video","Kutarya OS","Kutarya Cep","Kutarya Convert","Kutarya Blok Diyarı","Blackjack · Royal Night","Rulet · Roulette Noir","Kutarya Block Arena"];
 for(const title of expected)assert(await page.getByText(title,{exact:true}).count()>0,title);
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto(base+"/proje/kutarya-video");
  await page.getByRole("heading",{name:"Kutarya Video",exact:true}).waitFor();
  await page.locator(".gallery img").last().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll(".gallery img, .detail-cover img")).every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator(".gallery img").count(),2);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  await page.evaluate(()=>window.scrollTo({top:0,behavior:"instant"}));
  await page.screenshot({path:`${out}/canli-video-${width}.png`,fullPage:true});
  await page.getByRole("tab",{name:"Dosyalar (2)"}).click();assert.equal(await page.locator(".download-row").count(),2);
  await page.screenshot({path:`${out}/canli-dosyalar-${width}.png`,fullPage:true});
  proof.views.push({width,images:3,files:2,horizontalOverflow:overflow});
 }
 await page.setViewportSize({width:1280,height:900});
 const manifest=JSON.parse(await readFile("artifacts/kutarya-video/paket-bilgisi-1.0.0.json","utf8"));
 const f=manifest.artifacts.find(f=>f.role==="installer");
 const row=page.locator(".download-row").filter({hasText:f.name});
 const event=page.waitForEvent("download",{timeout:90000});await row.getByRole("button",{name:"İndir",exact:true}).click();
 const download=await event;assert.equal(download.suggestedFilename(),f.name);
 const path=await download.path();assert(path);let bytes=0;const hash=createHash("sha256");for await(const c of createReadStream(path)){bytes+=c.length;hash.update(c);}const sha256=hash.digest("hex").toUpperCase();assert.equal(bytes,f.bytes);assert.equal(sha256,f.sha256);
 proof.download={name:f.name,bytes,sha256,viaActualBrowserButton:true,installerExecuted:false};
 await page.goto(base+"/admin/projeler");await page.getByRole("heading",{name:"Yönetim alanı.",exact:true}).waitFor();assert(await page.locator('a[href="/auth/login?next=/admin"]').count()>0);assert.equal(await page.locator(".admin-games").count(),0);proof.anonymousAdminBlocked=true;
 assert.deepEqual(errors,[]);proof.rendererErrors=errors;proof.passed=true;
 await writeFile(`${out}/live-site-acceptance.json`,JSON.stringify(proof,null,2)+"\n");console.log(JSON.stringify(proof,null,2));
}catch(error){console.error(JSON.stringify({rendererErrors:errors,url:page.url(),message:error.message}));throw error;}
finally{await browser.close();}
