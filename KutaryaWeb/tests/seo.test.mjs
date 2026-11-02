import test from "node:test";
import assert from "node:assert/strict";
import {pageSeo,publicRoutes} from "../src/seo.mjs";
import {kutaryaVideo} from "../projects-src/kutarya-video.mjs";
import {kutaryaCep} from "../projects-src/kutarya-cep.mjs";
const catalog={games:[{...kutaryaVideo,status:"published",files:[]},{...kutaryaCep,status:"published",files:[]}],categories:[],announcements:[],settings:{title:"Kutarya"}};
test("Sitemap yeni gerçek projeleri alır; boş ve özel koleksiyonları almaz",()=>{
 const paths=publicRoutes(catalog);
 assert(paths.includes("/proje/kutarya-video"));assert(paths.includes("/proje/kutarya-cep"));
 assert(!paths.includes("/koleksiyon/web"));assert(!paths.some(p=>/^\/(auth|admin|hesabim|kutuphanem)/.test(p)));
});
test("Hesap, yönetim, boş veya bulunmayan sayfa indekslenmez",()=>{
 for(const path of ["/auth/login","/admin/projeler","/hesabim","/kutuphanem","/koleksiyon/web","/proje/olmayan"])
  assert.equal(pageSeo(path,catalog).robots,"noindex,follow",path);
});
test("Arama ve oynama kopyaları sorgusuz proje/katalog canonical'ına bağlanır",()=>{
 const filtered=pageSeo("/projeler?q=video",catalog);assert.equal(filtered.canonical,"https://kutarya.com/projeler");assert.equal(filtered.robots,"noindex,follow");
 const play=pageSeo("/oyna/kutarya-video",catalog);assert.equal(play.canonical,"https://kutarya.com/proje/kutarya-video");assert.equal(play.robots,"noindex,follow");
 assert.equal(pageSeo("/proje/kutarya-video/",catalog).canonical,"https://kutarya.com/proje/kutarya-video");
});
test("Arşivlenmiş/taslak projeler kamu metaverisi veya sitemap üretmez",()=>{
 const hidden={...catalog,games:catalog.games.map(g=>({...g,status:"draft"}))};
 assert(!publicRoutes(hidden).includes("/proje/kutarya-video"));assert.equal(pageSeo("/proje/kutarya-video",hidden).robots,"noindex,follow");
});
test("Proje başlığı/açıklaması özeldir; yapılandırılmış veride sahte değerlendirme yoktur",()=>{
 const meta=pageSeo("/proje/kutarya-video",catalog);assert.equal(meta.title,"Kutarya Video — Kutarya");assert(meta.description.length<=170);
 const graph=meta.structuredData["@graph"];assert(graph.some(x=>x["@type"]==="SoftwareApplication"));assert(graph.some(x=>x["@type"]==="BreadcrumbList"));
 assert(!JSON.stringify(graph).includes("aggregateRating"));assert(!JSON.stringify(graph).includes("reviewCount"));
});
