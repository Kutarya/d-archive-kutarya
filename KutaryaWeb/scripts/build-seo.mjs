// Canlı genel katalogdan aynı React UI + sitemap üretir; HTTP sunucusu açmaz.
import assert from "node:assert/strict";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,sep} from "node:path";
import {pathToFileURL} from "node:url";
import {build,loadEnv} from "vite";
import react from "@vitejs/plugin-react";
import {pageSeo,publicRoutes,publicProjects,collections,siteOrigin} from "../src/seo.mjs";
const root=process.cwd(),output=resolve("dist"),proofDir=resolve("artifacts/seo-2026-10-07");
const env=loadEnv("production",root,"VITE_");
assert.equal(env.VITE_FIREBASE_PROJECT_ID,"kutarya-ai-3169");assert.notEqual(env.VITE_USE_EMULATORS,"true");
assert((await readFile("public/brand/share.png")).subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),"Paylaşım PNG'si eksik; Hosting yayımlanmaz.");
const response=await fetch("https://europe-west1-kutarya-ai-3169.cloudfunctions.net/gamesService",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({data:{op:"catalog"}})});
const result=await response.json();assert(response.ok&&!result.error,"Canlı genel katalog alınamadı; eksik sitemap yayımlanmaz.");
const catalog=result.result;assert(Array.isArray(catalog.games)&&catalog.games.length>0);
for(const g of catalog.games){assert.equal(g.status,"published");assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug));assert(Array.isArray(g.platforms));}
assert.equal(new Set(catalog.games.map(g=>g.slug)).size,catalog.games.length);
await mkdir(proofDir,{recursive:true});
await build({mode:"production"});
const template=await readFile("dist/index.html","utf8");assert(template.includes('<div id="root"></div>'));
// Yönetim, eski hesap adreslerinin yönlendirmeleri ve sonradan yayımlanan projeler SPA'yı kullanır.
await writeFile("dist/app.html",template);
await build({configFile:false,root,mode:"production",plugins:[react()],logLevel:"warn",build:{ssr:"src/entry-seo.tsx",outDir:resolve("artifacts/seo-build"),emptyOutDir:true,copyPublicDir:false}});
const {render}=await import(pathToFileURL(resolve("artifacts/seo-build/entry-seo.js")).href+"?"+Date.now());
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const json=s=>JSON.stringify(s).replace(/</g,"\\u003c").replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029");
const routes=[...new Set([...publicRoutes(catalog),...Object.keys(collections).map(k=>`/koleksiyon/${k}`)])];
const baseConfig=JSON.parse(await readFile("firebase.json","utf8"));
assert.equal(baseConfig.hosting.site,"kutarya-ai-3169");assert.equal(baseConfig.hosting.public,"dist");
const mappings=[],redirects=[],pages=[];
for(const path of routes){
 const meta=pageSeo(path,catalog),body=render(path,catalog);
 assert(body.includes('<main'),path);assert(!body.includes("Kutarya hazırlanıyor"),path);
 let html=template.replace(/<title>[\s\S]*?<\/title>/,"").replace(/<meta\s+name="description"[\s\S]*?\/>/,"");
 const tags=`<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"><meta name="robots" content="${escape(meta.robots)}"><link rel="canonical" href="${escape(meta.canonical)}">`;
 const social=Object.entries({"og:type":"website","og:site_name":"Kutarya","og:locale":"tr_TR","og:title":meta.title,"og:description":meta.description,"og:url":meta.canonical,"og:image":meta.image}).map(([k,v])=>`<meta property="${k}" content="${escape(v)}">`).join("")+Object.entries({"twitter:card":"summary_large_image","twitter:title":meta.title,"twitter:description":meta.description,"twitter:image":meta.image}).map(([k,v])=>`<meta name="${k}" content="${escape(v)}">`).join("");
 html=html.replace("</head>",tags+social+`<script id="kutarya-schema" type="application/ld+json">${json(meta.structuredData)}</script></head>`);
 html=html.replace('<div id="root"></div>',`<div id="root">${body}</div><script type="application/json" id="kutarya-catalog">${json(catalog)}</script>`);
 const destination=path==="/"?"/index.html":path+".html",target=resolve(output,"."+destination);
 assert(target.startsWith(output+sep));await mkdir(resolve(target,".."),{recursive:true});await writeFile(target,html);
 if(path!=="/"){mappings.push({source:path,destination},{source:path+"/",destination});redirects.push({source:destination,destination:path,type:301});}
 pages.push({path,title:meta.title,canonical:meta.canonical,robots:meta.robots,bytes:Buffer.byteLength(html),sha256:createHash("sha256").update(html).digest("hex")});
}
const projects=publicProjects(catalog),urls=publicRoutes(catalog);
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+urls.map(path=>{
 const g=projects.find(g=>path===`/proje/${g.slug}`);
 const validDate=Number.isFinite(g?.updatedAt)&&g.updatedAt>0&&g.updatedAt<=Date.now();
 return `  <url><loc>${escape(siteOrigin+path)}</loc>${validDate?`<lastmod>${new Date(g.updatedAt).toISOString()}</lastmod>`:""}${g?[g.cover,...(g.gallery||[])].filter(Boolean).map(url=>`<image:image><image:loc>${escape(url)}</image:loc></image:image>`).join(""):""}</url>`;
}).join("\n")+'\n</urlset>\n';
const robots="User-agent: *\nAllow: /\nDisallow: /__/\nDisallow: /tools-preview/\n\nSitemap: https://kutarya.com/sitemap.xml\n";
for(const dir of ["public","dist"]){await writeFile(`${dir}/sitemap.xml`,sitemap);await writeFile(`${dir}/robots.txt`,robots);}
baseConfig.hosting.rewrites=[...mappings,...baseConfig.hosting.rewrites.map(rule=>rule.destination==="/index.html"?{...rule,destination:"/app.html"}:rule)];
baseConfig.hosting.redirects=[...(baseConfig.hosting.redirects||[]),...redirects,{source:"/oyunlar",destination:"/koleksiyon/game",type:301},{source:"/oyun/:slug",destination:"/proje/:slug",type:301}];
baseConfig.hosting.headers.push({regex:"^[/\\\\](admin|auth|hesabim|kutuphanem|oyna|games)([/\\\\].*)?$",headers:[{key:"X-Robots-Tag",value:"noindex, follow"}]});
baseConfig.hosting.headers.push({regex:"^[/\\\\]app\\.html$",headers:[{key:"X-Robots-Tag",value:"noindex, follow"}]});
baseConfig.hosting.headers.push({regex:"^[/\\\\](sitemap\\.xml|robots\\.txt)$",headers:[{key:"Cache-Control",value:"public, max-age=300"}]});
await writeFile("firebase.seo-release.json",JSON.stringify(baseConfig,null,2)+"\n");
await writeFile(`${proofDir}/build.json`,JSON.stringify({at:new Date().toISOString(),projectId:"kutarya-ai-3169",sitemapUrls:urls,projects:projects.map(g=>g.id),pages,listeningServerStarted:false},null,2)+"\n");
console.log(`SEO: ${projects.length} gerçek proje, ${urls.length} sitemap URL'si, ${pages.length} statik React sayfası.`);
