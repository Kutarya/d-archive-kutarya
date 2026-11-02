// İstemci ve statik yayın aynı adres/başlık kurallarını kullanır.
export const siteOrigin = "https://kutarya.com";
export const collections = {
  game: ["Oyunlar", "Tarayıcıda oynayabileceğin oyunlar ve indirilebilir oyun paketleri."],
  desktop: ["Masaüstü uygulamaları", "Windows uygulamaları, kurulum dosyaları ve taşınabilir paketler."],
  web: ["Web projeleri", "HTML, CSS, JavaScript projeleri ve tarayıcı deneyimleri."],
  mobile: ["Mobil uygulamalar", "Android uygulamaları, APK dosyaları ve uygulama kaynakları."],
  source: ["Kaynak kod", "Paylaşılan projelerin kaynak kodları ve öğrenme kaynakları."],
  tool: ["Araçlar", "Dosya dönüştürme ve günlük işleri kolaylaştıran Kutarya araçları."],
};
const pages = {
  "/": ["Kutarya — Oyunlar, uygulamalar ve kaynak kod", "Kutarya projelerini keşfet: tarayıcı oyunları, Windows ve Android uygulamaları, kullanışlı araçlar ve kaynak kod paketleri."],
  "/projeler": ["Projeler — Kutarya", "Kutarya'nın oyunlarını, masaüstü ve mobil uygulamalarını, web projelerini ve araçlarını keşfet; uygun paketi indir."],
  "/oyun-gecesi": ["Oyun Gecesi — Kutarya", "Arkadaşlarla bir masa, kısa bir kart molası veya keşfedilecek bir dünya. Kutarya tarayıcı oyunlarından bu akşamın oyununu seç."],
  "/kesif": ["Keşif rotaları — Kutarya", "Oynamak, üretmek veya kaynak kod incelemek için bir rota seç. Cihazına ve amacına uygun Kutarya projelerini keşfet."],
  "/duyurular": ["Atölye günlüğü ve yenilikler — Kutarya", "Kutarya projelerinin güncel sürüm notlarını, değişikliklerini ve duyurularını bir arada keşfet."],
  "/destek": ["Yardım ve iletişim — Kutarya", "Kutarya projeleriyle ilgili soru, hata ve destek taleplerini ilet."],
  "/gizlilik": ["Gizlilik — Kutarya", "Kutarya projeleri, destek mesajları ve cihazında saklanan tercihler hakkında gizlilik bilgileri."],
  "/kullanim-kosullari": ["Kullanım koşulları — Kutarya", "Kutarya projelerini kullanırken paylaşım, içerik hakları ve lisans koşullarını öğren."],
};
export const publicProjects = catalog => catalog.games.filter(g => g.status === "published");
export function summary(text) {
  const plain = String(text || "").replace(/\s+/g, " ").trim();
  if (plain.length <= 170) return plain;
  return plain.slice(0, 167).replace(/\s+\S*$/, "") + "…";
}
export function pageSeo(address, catalog) {
  const url = new URL(address, siteOrigin);
  let path = url.pathname.replace(/\/+$/, "") || "/";
  const games = publicProjects(catalog);
  const project = games.find(g => path === `/proje/${g.slug}` || path === `/oyun/${g.slug}` || path === `/oyna/${g.slug}`);
  let title = "Sayfa bulunamadı — Kutarya", description = "Aradığın Kutarya sayfası bulunamadı.", index = false;
  if (pages[path]) { [title, description] = pages[path]; index = true; }
  const kind = path.match(/^\/koleksiyon\/([a-z]+)$/)?.[1];
  if (kind && collections[kind]) {
    const [name, about] = collections[kind]; title = `${name} — Kutarya`; description = about;
    index = games.some(g => g.kind === kind);
  }
  if (project) {
    path = `/proje/${project.slug}`; title = `${project.title} — Kutarya`;
    description = summary(project.description || project.subtitle); index = true;
  }
  if (/^\/(?:auth|admin|hesabim|kutuphanem)(?:\/|$)/.test(url.pathname)) {
    const management = url.pathname.startsWith("/admin");
    title = `${management ? "Yönetim" : "Sayfa taşındı"} — Kutarya`;
    description = management ? "Yetkili Kutarya yönetim alanı." : "Projeleri hesap gerekmeden katalogda keşfet."; index = false;
  }
  if (url.pathname.startsWith("/oyna/") || url.pathname.startsWith("/games/") || url.search) index = false;
  const canonical = siteOrigin + path;
  const image = project?.cover || siteOrigin + "/brand/share.png";
  const graph = [];
  if (index) {
    graph.push({"@type":"WebPage", "@id":canonical+"#page", url:canonical, name:title, description, inLanguage:"tr", isPartOf:{"@id":siteOrigin+"/#website"}});
    graph.push({"@type":"Organization", "@id":siteOrigin+"/#organization", name:"Kutarya", url:siteOrigin+"/", logo:siteOrigin+"/brand/logo-mark.svg"});
    graph.push({"@type":"WebSite", "@id":siteOrigin+"/#website", name:"Kutarya", url:siteOrigin+"/", publisher:{"@id":siteOrigin+"/#organization"}, inLanguage:"tr"});
    if (project) {
      const type = project.kind === "game" ? "VideoGame" : ["desktop", "mobile"].includes(project.kind) ? "SoftwareApplication" : project.kind === "tool" ? "WebApplication" : "CreativeWork";
      graph.push({"@type":type, "@id":canonical+"#project", name:project.title, description, url:canonical, image:[project.cover, ...(project.gallery || [])].filter(Boolean), version:project.version, ...(type.includes("Application") ? {softwareVersion:project.version, operatingSystem:project.platforms.join(", ")} : {}), publisher:{"@id":siteOrigin+"/#organization"}});
      graph.push({"@type":"BreadcrumbList", itemListElement:[{ "@type":"ListItem", position:1, name:"Projeler", item:siteOrigin+"/projeler" }, {"@type":"ListItem", position:2, name:project.title, item:canonical}]});
    }
  }
  return {title, description, canonical, image, robots:index ? "index,follow,max-image-preview:large" : "noindex,follow", structuredData:{"@context":"https://schema.org", "@graph":graph}};
}
export function publicRoutes(catalog) {
  const projects = publicProjects(catalog);
  return [...Object.keys(pages), ...Object.keys(collections).filter(kind => projects.some(g => g.kind === kind)).map(kind => `/koleksiyon/${kind}`), ...projects.map(g => `/proje/${g.slug}`)];
}
export function updatePageSeo(meta) {
  document.title = meta.title;
  const set = (selector, tag, attribute, key, value) => {
    let node = document.head.querySelector(selector);
    if (!node) { node = document.createElement(tag); node.setAttribute(attribute, key); document.head.append(node); }
    node.setAttribute(tag === "link" ? "href" : "content", value);
  };
  set('link[rel="canonical"]', "link", "rel", "canonical", meta.canonical);
  for (const [name, value] of [["description", meta.description], ["robots", meta.robots], ["twitter:card", "summary_large_image"], ["twitter:title", meta.title], ["twitter:description", meta.description], ["twitter:image", meta.image]]) set(`meta[name="${name}"]`, "meta", "name", name, value);
  for (const [name, value] of [["og:type", "website"], ["og:site_name", "Kutarya"], ["og:locale", "tr_TR"], ["og:title", meta.title], ["og:description", meta.description], ["og:url", meta.canonical], ["og:image", meta.image]]) set(`meta[property="${name}"]`, "meta", "property", name, value);
  let schema = document.getElementById("kutarya-schema");
  if (!schema) { schema = document.createElement("script"); schema.id = "kutarya-schema"; schema.setAttribute("type", "application/ld+json"); document.head.append(schema); }
  schema.textContent = JSON.stringify(meta.structuredData);
}
