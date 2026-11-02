# Kutarya — SEO ve Search Console, 7 Ekim 2026

Hedef kutarya-ai-3169 / https://kutarya.com. Güncel Hosting sürümü
03796011d9d93fce; SEO öncesi katalog sürümü 9a946d116eab4fd9.

## Yapılan düzeltmeler

- Site haritası canlı genel katalogdan üretilir: 18 adres, sekiz gerçek proje,
  19 gerçek kapak/galeri görseli. Kutarya Cep ve Kutarya Video dahil. Taslak,
  arşiv, boş koleksiyon, özel hesap/admin, sorgu ve oynama kopyaları haritada yok.
- Proje lastmod değeri gerçek updatedAt'tır; her build tarihi yazılmaz.
  XML özel karakterleri kaçırılır; adresler tek HTTPS kutarya.com canonical'ıdır.
- Aynı gerçek React arayüzü 20 genel sayfa için yayın sırasında HTML'e çevrilir.
  Google, sayfa içeriği/başlık/açıklama/canonical/JSON-LD'yi ilk yanıtta görür.
  CSS, admin/login ve indirme API hattı korunur. User-agent ayrımı yoktur.
- Meta açıklamalar kısaltıldı. Open Graph/Twitter; gerçek proje kapakları ve
  genel 1200x630 brand/share.png. JSON-LD: WebSite, Organization, WebPage,
  proje ve breadcrumb; sahte puan, yorum veya indirme sayısı yok.
- Hesap/admin/ham oyun/oynama sayfalarında X-Robots-Tag noindex; istemci özel,
  boş, sorgulu ve bulunmayan sayfaya noindex,follow uygular. Robots bu sayfalarda
  noindex'in görülebilmesi için taramayı engellemez; /__/ ve tools-preview kapalı.
- Eski /oyunlar ve /oyun/:slug 301 ile güncel adrese gider. Statik .html
  kopyaları da canonical adrese 301. Önceden kaldırılmış AI adresleri gerçek 404.

## Yayın ve panel davranışı

```powershell
npm run check
$env:KUTARYA_RELEASE_APPROVED = 'true'
node --require ./scripts/no-listeners.cjs scripts/deploy-release.mjs hosting
```

Hosting helper her yayında build-seo.mjs'yi çalıştırır; güncel genel API
kataloğunu alır ve firebase.seo-release.json exact rewrite'larını üretir.
Sır/özel hesap verisi yerine yalnız aynı public catalog HTML'e gömülür; Auth,
claim ve admin yetkisi halen gerçek Firebase/API üzerinden doğrulanır.
Katalog alınamazsa, slug çakışırsa veya paylaşım PNG'si yoksa yayın durur.
Normal npm run build çevrimdışı genel SPA üretir; üretim yayını bu helper'dan yapılır.
Bağımsız SEO derlemesi npm run build:seo. Yerel sunucu/emülatör/debug portu yok.

dist/app.html eski SPA girişidir: admin/auth ve yeni panel projesi bu yoldan
çalışır; index.html ise önceden üretilmiş ana sayfadır. Exact statik rewrite'lar
genel fallback'ten önce gelir. Yeni download projesinin panelde yayımlanması
çalışmaya devam eder; sitemap ve ilk HTML güncellemesi bir sonraki Hosting
yayınında üretilir. Bilinmeyen /proje adresi SPA fallback nedeniyle HTTP 200
dönebilir; gerçek hata ekranı ve JS noindex uygulanır (HTTP 404 diye sunulmaz).

## Kabul ve Search Console

58/58 birim testi; TypeScript/build başarılı. 20 canlı statik HTML SHA/boyut ve
başlık/canonical/içerik ile yerel üretime eşleşti. 18 sitemap adresi ve 19 görsel,
XML/JSON-LD, paylaşım PNG, özel noindex başlıkları, 301 ve eski 404'ler doğrulandı.
Gerçek tarayıcıda Kutarya Video: üç görsel, tek canonical, doğru meta ve iki
dosya sekmesi; yatay taşma ve konsol hatası yok. Giriş formu korunmuş, noindex.
Gerçek kullanıcı hesabı/SMTP veya Windows kurulumu bu SEO işinde denenmedi.

Mevcut Kutarya Chrome oturumuyla sc-domain:kutarya.com Search Console'a girildi.
Hatalı https://kutarya.com/ HTML site haritası kaydı kaldırıldı. Doğru
https://kutarya.com/sitemap.xml 7 Ekim'de yeniden gönderildi; "Site haritası
başarıyla gönderildi" görüldü. Gönderim anında rapor son okuma 29 Eylül ve
15 keşfedilen sayfa gösteriyordu; bu, yeni 18 URL'nin işlendiği anlamına gelmez.
Kutarya Video URL denetiminde henüz Google tarafından bilinmiyordu. Canlı URL
kontrolünün ardından "Dizine eklenmesi istendi" görüldü; istek kabul edildi.
Ana sayfa Google'da mevcut. Yeni içerik için yeniden tarama isteği de kabul
edildi: "URL, öncelikli bir tarama sırasına eklendi". İstek, yeni içeriğin
işlendiği veya sıralamanın arttığı anlamına gelmez.

Kanıtlar ignore artifacts/seo-2026-10-07/: build.json, static-acceptance.json,
live-acceptance.json, hosting-releases.json, search-console-gonderim.jpg,
kutarya-video-indeksleme.jpg, ana-sayfa-indeksleme.jpg,
browser-missing-route.json, final-state.json, www-live.json,
search-console-actions.json, www-dogrulama.jpg.

## www adresi ve şifre sınırı

Search Console'un iki eski 404 örneği https://www.kutarya.com/ ve http sürümü.
Canlı HTTPS sertifika adı uyuşmuyordu; Firebase'de www custom domain yoktu.
www.kutarya.com aynı Hosting sitesine eklenip redirectTarget=kutarya.com atandı.
HOST_ACTIVE/OWNERSHIP_ACTIVE; son API durumu CERT_PROPAGATING. 7 Ekim 11:09 UTC
ölçümünde gerçek HTTPS sertifika doğrulaması geçti ve www ana sayfa, proje ve
sitemap adresleri yolu koruyarak kutarya.com üzerine 301 verdi. HTTP www önce
HTTPS www'ye, ardından HTTPS apex'e gider. Sertifika doğrulaması atlatılmadı.
GoDaddy oturum açma sayfası şifre istedi; kullanıcının talimatıyla o adım iptal
edildi ve sekme kapatıldı. Şifre girilmedi/istenmedi, DNS değiştirilmedi.
Firebase'in önerdiği DNS: www CNAME kutarya-ai-3169.web.app (mevcut kutarya.com).
Mevcut CNAME üzerinden TLS ve yönlendirme çalıştı; bu görevde DNS değişmedi.
Canlı yönlendirme/TLS ölçümünden sonra Search Console'un iki www 404 kaydı için
"Düzeltmeyi doğrula" başlatıldı. "Doğrulama başladı", başlangıç 7.10.2026
görüldü. Google'ın nihai doğrulama ve yeni URL indeksleme sonuçları bekleniyor.

Kaynaklar: [Google sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
[JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics),
[Hosting ayarları](https://firebase.google.com/docs/hosting/full-config).
