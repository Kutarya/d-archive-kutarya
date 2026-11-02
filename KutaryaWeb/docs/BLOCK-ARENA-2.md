# Kutarya Block Arena 2.0 — geliştirme ve yayın

11 Ekim güncel oyun2.1.0; isim/hareket düzeltmesi ve kabul
[BLOCK-ARENA-2.1.md](BLOCK-ARENA-2.1.md) içinde. Bu belge2.0 yayınının tarihsel
kaydıdır. Helpers güncel sürümü arena-release-paths.mjs'den okur;2.0 dosyaları,
ZIP ve kabul kanıtları sabittir, yeniden üretilmez.

10 Ekim 2026. Kullanıcı grafik, tasarım, mantık, efekt ve online geliştirmeyi,
ardından yeni sürümü yayımlamayı doğrudan istedi. Bu onay bu oyunla sınırlıdır.

Mevcut voxel WebGL motoru, üç harita, beş silah, botlar, yerel profil ve
çevrimdışı modlar korunur. Eski `public/games/pixelgun/1.0.0` ve katalogdaki
1.0.0 ZIP silinmez. Yeni runtime ayrı `2.0.0` dizinine hazırlanır.

Plan: ışık/sis/malzeme ve harita detayları, okunaklı menü/HUD, vuruş/eleme ve
patlama geri bildirimi, hareket ve yeniden doğma iyileştirmeleri. Online için
hesap gerektirmeyen oda kodu, 2–8 oyuncu, serbest/takım çatışması, sunucunun
hesapladığı hareket/mermi/hasar/mühimmat/skor, yeniden bağlanma ve maç sonuçları.
Dalga savunması botlara karşı çevrimdışı mod olarak kalır.

Oyun servisi aynı `kutarya-ai-3169` projesinde, europe-west1 Cloud Run üzerinde
`kutarya-block-arena` adında bağımsız WebSocket servisidir. Site Firebase
Hosting'de kalır. PC'de sunucu/debug portu açılmaz. Ortak Auth, Firestore ve
Storage kuralları, mevcut sekiz Functions ve diğer katalog projeleri bu
özellik için değiştirilmez. Servis kullanıcı veritabanı veya servis sırlarına
ihtiyaç duymaz; yetkisiz ayrı runtime kimliği kullanılır.

İlk servis tek instance, 0 minimum instance, sınırlı oda/oyuncu, 1 CPU/256 MiB
ile sınırlandırılır. Açık WebSocket bağlantıları ve derleme bulut maliyeti
oluşturur. Oda/maç durumu geçicidir; instance yeniden başladığında maç devam
etmez. Kopmada 30 saniyelik yeniden bağlanma süresi vardır. Büyük oyuncu yükü
kapasite testi yapılmadan desteklenmiş sayılmaz.

Kabul: saf sunucu simülasyon testleri, mevcut site takımı/build, gerçek
Edge tarayıcıda üç harita/yerel maç/menü/dar ekran, gerçek bulut WebSocket'inde
iki ayrı oturumun oda/başlatma/hareket/hasar/eleme/skor/yeniden bağlanması.
Yeni ZIP/görseller mevcut admin/Storage hattından, yeni sürüm kaydı mevcut
katalog operatörüyle yayımlanır; HTTPS runtime ve indirme SHA'ları ölçülür.
Fiziksel telefon, farklı internet ağları ve yük testi ayrı kabul sınırlarıdır.

Resmî Cloud Run WebSocket yönergesi: https://docs.cloud.google.com/run/docs/triggering/websockets
Timeout/yeniden bağlanma ve aktif bağlantı maliyeti bu kaynaktan doğrulandı.

## Kaynak ve yeniden üretim

- `games-src/pixelgun/index.html`: mevcut motor ve yeni çizim/hareket/efektler.
- `style-2.css` ve `online.js`: menü/HUD/oda ekranı ve gerçek ağ istemcisi.
- `arena-server/rules.mjs`: oyunla aynı harita/silah/çarpışma kuralları;
  `scripts/build-block-arena-rules.mjs` ana HTML'den üretir. Sunucuya
  tarayıcı/WebGL/Profile veya ortak site kodu taşınmaz.
- `engine.mjs`: saf oda simülasyonu; `server.mjs`: WebSocket/kapasite/zamanlama.
- `npm run test:arena`: 11 simülasyon testi. `npm run check`: mevcut site takımı
  ve TypeScript/Vite. Eski `KutaryaAIWeb/server` ve `KutaryaDesktop` klasörleri
  mevcut değil; eski 385/102 takımı çalıştırılmış sayılmaz.
- `npm run build:arena`: CSS/ağ kodunu tek HTML'ye gömer ve ZIP üretir.
  Bulut adresi `artifacts/releases/block-arena/2.0.0/service.json` içindedir.
  Yayımlanmış 2.0.0 aynı sürümde yeniden üretilmez/üzerine yazılmaz.

## Yayın sırası ve tuzaklar

Bu görev için kullanıcı yayın talimatı önceden verdi; yeni kapsam veya
sonraki sürüm kendi onayıyla ilerler. Operatör betikleri
`KUTARYA_RELEASE_APPROVED=true` olmadan durur.

1. `scripts/arena-release-audit.mjs before` önceki katalog/Hosting/sekiz
   Functions/diğer Cloud Run servisleri/rules/admin claim kayıtlarını saklar.
2. `scripts/deploy-arena.mjs` yalnız bağımsız oyun servisini yayımlar.
   Ayrı runtime hesabının proje IAM rolü yoktur; DB/Auth/secret erişimi yok.
3. Gerçek bulut protokolü, yerel Edge/WebGL ve korumalı iframe kabulünden
   sonra `prepare-arena-release.mjs` beş gerçek PNG'yi hazırlar. import-game
   ile yeni runtime ayrı sürüm dizinine alınır; eski dizine dokunulmaz.
4. `authorize-arena-release.mjs upload` mevcut doğrulanmış admin adına kısa
   ömürlü token alır; gerekiyorsa eklenen imza iznini **yüklemeden önce** geri
   kaldırır. Token diske/loga yazılmaz. Yeni ZIP/görseller Storage'a yüklenir,
   2.0.0 doğrulanmış sürüm listesine eklenir; etkin runtime henüz değiştirilmez.
5. `deploy-release.mjs hosting` yeni statik runtime dosyalarını yayımlar.
   `review-block-arena.mjs --live` doğrudan gerçek HTTPS runtime'ını kontrol eder.
6. `authorize-arena-release.mjs activate` canlı HTML SHA ve canlı tarayıcı
   kabulü olmadan katalog runtime'ını değiştirmez. Diğer projelere dokunmaz.
7. `deploy-release.mjs hosting` güncel kamu kataloğundan SEO'yu yeniden üretir.
   **Base firebase.json yerine firebase.seo-release.json** kullanılır;
   `no-listeners.cjs`, kapalı stdin ve etkileşimsiz mevcut CLI oturumu korunur.
8. `verify-block-arena-live.mjs`, `verify-arena-iframe.mjs --live`,
   `arena-release-audit.mjs after` ve `audit-arena-service.mjs` son HTTPS/
   indirme/iframe/bulut kabulünü kaydeder.

Yaşanan tuzak: gcloud `--max-instances=1` yalnız revision sınırını yazdı;
Cloud Run service scaling **20** kaldı. Canlı V2 API ile fark bulundu;
`--max=1 --min=0` ile servis de sınırlandı. Deploy betiği her iki düzeyi yazar;
`audit-arena-service.mjs` her iki düzeyi ve yetkisiz runtime hesabını doğrular.
Varsayılanı tahmin etme. `ws` başlangıç sürümündeki npm audit bulgusu
8.22.0'a yükseltilerek giderildi; üretim bağımlılığı audit sonucu 0 bulgu.

## Geri alma ve işletim

Önceki katalog kaydı `artifacts/releases/block-arena/2.0.0/before.json`
içindeki `pixelgun` girdisidir. Gerekirse mevcut admin akışında eski metadata
ve `/games/pixelgun/1.0.0/index.html` tekrar seçilir, güncel katalogdan SEO
Hosting yeniden yayımlanır. Hosting geri alma **katalog/Storage/Cloud Run'u
geri almaz**. Eski 1.0.0 HTML/OKU/ZIP silinmemiştir; 2.0.0 dosyaları da geri
alma sırasında silinmez. Oyun servisi kapatılacaksa bu ayrıca değerlendirilir;
diğer Functions veya ortak kurallar topluca dağıtılmaz/silinmez.

Servis 30 Hz simülasyon/15 Hz durum iletimi; en fazla 16 oda, 128 bağlantı,
oda başına 8 oyuncu. Bunlar uygulanan sınırlar, yük/performance taahhüdü
değildir. Maçlar 3/5/10 dakika, odalar en fazla 45 dakika; 30 saniye kopma
payı vardır. Oda bellekte tutulur, yeniden başlatmada kapanır. İsim ve renk
oturum bilgisidir; ortak Firebase hesabı veya kalıcı çevrimiçi liderlik
tablosu oluşturulmaz. Aktif bağlantılar bulut maliyeti oluşturur; min0/max1
maliyet sıfır garantisi değildir.

## Tamamlanan canlı yayın — 10 Ekim 2026

Oyun https://kutarya.com/oyna/pixelgun; proje ve dosyalar
https://kutarya.com/proje/pixelgun. Katalog etkin sürümü2.0.0.
Hosting `abd4fd17259a8865`, görev öncesi `1de14f25e4536bb1`.
101 Hosting dosyası,12 proje/23 sitemap adresi/24 HTML.
Cloud Run revision `kutarya-block-arena-00002-l2w`, trafik%100;
https://kutarya-block-arena-faferhidua-ew.a.run.app.

Yeni `Kutarya-Block-Arena-2.0.0.zip`:44.123 bayt, SHA256
`8af2017a8f1b95431a787287f8e0bfabf7258e7f01b5023bc2a8c1b03dd28ba6`.
İçerik index.html176.360 bayt ve OKU.txt876 bayt; başka kod/veri/secret yok.
Eski ZIP32.726 bayt, SHA256
`34d9823e0e7f8baad56fbb78e1a55862d115adff669613205a747c990d6dc9b1`.
İki sürümün gerçek İndir düğmesi tam bayt/SHA ve ZIP içeriği kabulü geçti.

11/11 arena testi,58/58 site + TypeScript/Vite build, üretim npm audit0.
Yerel ve canlı Edge25 görünüm,1280×800/390×844/844×390 menüler;
üç WebGL haritası ve iki bağımsız tarayıcı bağlamıyla gerçek oda/başlatma/
hareket/ateş/mühimmat/kısa kesinti sonrası aynı aktöre dönüş geçti.
Gerçek bulutta sekiz katılımcı/dokuzuncunun reddi, yalnız host başlatma,
istemci konum/skor enjeksiyonunun reddi, gerçek vuruş/eleme/yeniden doğma,
gerçek180 saniye maç sonu ve iki oturumun aynı sonucu, rövanş ve takım odası
geçti. Protokol kabulünde7 atış/7 isabet/1 eleme ölçüldü; başarı istatistiği
veya kapasite benchmark'ı olarak sunulmaz.

Gerçek site iframe'i sandbox değişmeden online oda açtı ve bot maçı1280/390
WebGL kabulü geçti. Canlı24 HTML SHA/sitemap/robots/canonical, eski/yeni dört
runtime dosyası ve beş görüntü SHA, anonim admin401/eksik JS404; kart/detay/
Dosyalar1280/390 geçti, yatay taşma/renderer hatası0. Öncesi/sonrası diğer11
proje/sekiz Functions/diğer Cloud Run servisleri/ruleset/admin UID-claim aynı.
Upload ve activate geçici imza izni temizliği canlı IAM'den doğrulandı.

Kanıt klasörü `artifacts/releases/block-arena/2.0.0/`: package/images,
before/after/cloud-acceptance/service-audit, browser-acceptance,
protocol-acceptance, live-runtime-acceptance, live-iframe-acceptance ve
live-acceptance JSON; yerel/canlı gerçek PNG'ler. Fiziksel cihaz, farklı
internet ağları veya yüksek eşzamanlı yük kabulü yok.

Kullanım: **Online Oyna → Oda oluştur**, kodu arkadaşına gönder; arkadaş
**Odaya katıl** ile girer. İki oyuncu katıldıktan sonra host **Maçı başlat**
ile başlatır. Sonuç ekranından rövanş açılır. **Botlarla Oyna** ve indirilen
HTML'nin bot modları çevrimdışı çalışır; online mod internet gerektirir.
