# Kutarya platformu — yayın ve geri dönüş

18 Ekim 2026: Yeni Son Tur oyunu, ayrı yetkisiz Cloud Run servisi, sürümlü runtime/ZIP ve katalog olarak yayımlandı. Hosting sites/kutarya-ai-3169/versions/b559d71ce1f095d4. Yeni ilk proje için önce taslak yükleme/runtime Hosting, kontrollü korumalı iframe + gerçek HTTPS kabulü, ardından katalog ve SEO Hosting sırası kullanıldı. Gerçek /oyna sayfası sonrasında ayrıca ölçüldü. Ayrıntı [RUS-RULETI.md](RUS-RULETI.md).

18 Ekim 2026: Kutarya Jenerik1.4.0 Setup-r2/portable ve yeni ekranları mevcut ürün sayfasında yayımlandı. Hosting `6cdaeae4c630d99a`; eski dosyalar ve diğer projeler korundu. Kurulumda eski veri koruması, yeni sürüm dizinleri ve canlı kabul `docs/KUTARYA-JENERIK-1.4-YAYIN.md` içindedir.

## Hedef ve mevcut karar

Mevcut Firebase projesi/Hosting: kutarya-ai-3169; hedef kutarya.com ana sitesi.
Yeni servis gamesService, kutarya-games codebase, europe-west1, Node 22,
maxInstances=3, 256 MiB. Storage bucket kutarya-ai-3169.firebasestorage.app
(US-EAST1). Üretim PC'ye bağımlı değildir. Firebase trafik/depolama/Firestore/
Functions ve mail maliyeti mevcut ücretli planda oluşabilir.

7 Ekim 2026: Kullanıcı yeni katalog Hosting yayınını açıkça onayladı ve hedefi
Kutarya AI projesi olarak belirtti. **Şifre isteyen işlem iptal edilir; PC'de
sunucu/port açılmaz ve açık Kutarya Video uygulamasına dokunulmaz.** Mevcut
CLI oturumuyla etkileşimsiz yayın tamamlandı; parola, servis hesabı anahtarı
veya Secret Manager payload'ı istenmedi/okunmadı.

7 Ekim SEO Hosting sürümü `sites/kutarya-ai-3169/versions/03796011d9d93fce`;
önceki katalog sürümü `9a946d116eab4fd9`.
`kutarya.com` artık paylaşım kataloğunu gösterir; sekiz gerçek proje yayında.
gamesService ve kapsamlı birleştirilmiş Storage kuralları yayımlandı.
Mevcut doğrulanmış admin hesabına önceki claim'ler korunarak gamesAdmin eklendi.
Canlı Firestore kuralları ve önceki yedi Functions servisi korundu.
Önceki Hosting sürümü `8d7f667bc98add29`; config/veri/claim yedekleri
ignore `artifacts/release-2026-10-07/` altında. Güncel kabul aşağıda ve
[KABUL.md](KABUL.md) içinde; eski tarihli "deploy yok" kayıtları tarihseldir.

9 Ekim 2026 güncel yayın: kullanıcı **"Canlıya yayımla"** onayı verdi;
ziyaretçi hesap/kayıt/kütüphane/favori arayüzü kaldırılarak yalnız Hosting
yayımlandı. Yönetim `/admin/auth/login`; eski reset e-postalarının
`/auth/action` sorgusu yeni yönetim sayfasına aktarılır. Güncel Hosting sürümü
`sites/kutarya-ai-3169/versions/43f73b57e6eb7708`; önceki `de4a2f903b00e3ba`
ve config `artifacts/release-2026-10-09-public-access/before.json` içindedir.
Yayın helper'ı `firebase.seo-release.json` ile 82 dosyayı etkileşimsiz yayımladı.
Öncesi/sonrası sekiz Functions, kurallar, 11 proje, Auth ayarları ve admin
claim'leri aynı. Yerel 58/58 + build, gerçek HTTPS/Edge kabulü docs/KABUL.md'de;
gerçek yönetici parola girişi/mail teslimi ölçülmedi. Yeni kapsam için yayın
kapıları geçerlidir; bu onay Functions/Storage/Auth/rule yayını yetkisi değildir.

## Yayın öncesi kapılar

11 Ekim güncel yayın: Block Arena2.1.0 online ad/hareket düzeltmesi aynı
oyunun geliştirme/yayın talimatıyla tamamlandı. Hosting `7216642c926abdca`,
görev öncesi `abd4fd17259a8865`; 109 dosya,12 proje/23 sitemap/24 HTML.
Yeni runtime önce HTTPS'e alındı; canlı iki oyuncu/ad/kontrollü gecikme
kabulünden sonra katalog etkinleştirildi, güncel SEO tekrar yayımlandı.
Arena15/site58/build/audit0, korumalı iframe'de gerçek klavye/ad değişimi,
üç eski/yeni ZIP gerçek İndir düğmesi tam bayt/SHA/içerik geçti. Diğer11 proje,
sekiz Functions/diğer Cloud Run/ruleset/admin UID-claim aynı. Cloud Run yeni
revision00003-zvm; servis/revision min0/max1 ve geçici IAM temizliği geçti.
2.0 istemci uyumu ve eski1.0/2.0 runtime/ZIP/görseller korunur. Helpers
arena-release-paths.mjs üzerinden güncel sürümü seçer; aynı sürümde tekrar
üretim engellenir. Ölçümler ve sınırlar [BLOCK-ARENA-2.1.md](BLOCK-ARENA-2.1.md).

10 Ekim önceki Arena yayını: Kutarya Block Arena2.0.0 kullanıcının geliştirme/online/
yayın talimatıyla yayımlandı; Hosting `abd4fd17259a8865`, görev öncesi
`1de14f25e4536bb1`. Yeni runtime önce Hosting'e alınıp gerçek HTTPS/Edge
kabulünden sonra katalog2.0 etkinleştirildi ve SEO yeniden yayımlandı.
Yeni ZIP/beş gerçek PNG mevcut admin/Storage hattında; eski1.0 HTML/ZIP korunur.
Oyun için bağımsız Cloud Run `kutarya-block-arena` europe-west1/Node22,
ayrı yetkisiz runtime SA/min0-max1 vardır. Diğer11 proje/sekiz Functions/
diğer Cloud Run servisleri/ortak ruleset/admin claim aynı. Geçici IAM temizliği geçti.
Site58/build, arena11, gerçek canlı24 HTML SHA/iki ZIP düğmesi/içerik,
korumalı iframe ve gerçek bulut çok oyunculu kabulü [BLOCK-ARENA-2.md](BLOCK-ARENA-2.md)
içinde. Fiziksel telefon/farklı ağlar/yük testi yapılmadı; odalar geçicidir.
Servis aktif bağlantı maliyeti oluşturur. Hosting geri alma Cloud Run veya
katalog/Storage'ı geri almaz; eski sürüm metadata'sı ayrıca seçilir.

10 Ekim önceki yayın: Kutarya Video1.1.0 için kullanıcının doğrudan geliştirme ve
sitede yayın talimatı uygulandı. Hosting1de14f25e4536bb1; önceki
ba161f8b5c0458d6. İki yeni EXE/dört gerçek ekran tam byte/SHA kontrolüyle mevcut
admin/Storage hattına eklendi; eski iki1.0 dosyası korunur. Diğer11 proje,
sekiz Functions/kurallar/Auth/admin/IAM aynı; site58/build geçti.
Canlı24 HTML SHA/HTTPS/Edge1280/390 ve iki gerçek İndir düğmesinin tam paket
SHA kabulü geçti. Kanıt ve ürün sınırları [KUTARYA-VIDEO-1.1-YAYIN.md](KUTARYA-VIDEO-1.1-YAYIN.md)
içinde. Gerçek arama geçti; YouTube429/bot doğrulaması nedeniyle bu ağda
tamamlanan video indirmesi kabulü açık.1.1 EXE'leri değişmez; sonraki sürüm
yeni sürüm dizini ve kendi yetki/kabulüyle yayımlanır.

Önceki10 Ekim yayın: “Siteye yayınla” talimatıyla Kutarya Mobile1.2 APK/
kaynak ve dört gerçek ekran mevcut katalog/Storage hattına eklendi;
Hosting SEO sürümü ba161f8b5c0458d6, önceki f57f0560937b8525.
12 proje / 24 HTML / 23 sitemap; diğer11 kayıt, sekiz servis, kurallar/
Auth/claim'ler korundu ve geçici IAM izni geri alındı. 1.1'in iki dosyası
korunur; 1.2'nin iki dosyası başta gösterilir. Gerçek HTTPS/Edge1280/390
ve dört gerçek İndir düğmesinin paket SHA kabulü
[KUTARYA-MOBILE-1.2-YAYIN.md](KUTARYA-MOBILE-1.2-YAYIN.md) içinde.
Yayımlanmış1.1/1.2 kaynak ZIP'lerini belge değişikliği için yeniden paketleme.
Yeni kapsam/sürüm kendi yayın onayı ve kabulüyle ilerler.

1. Somut yeni sürüm kullanıcıya yerelde gösterilir. Hedef, ana site değişimi,
   servis, region, PC bağımlılığı ve maliyet etkisi belirtilerek yayın onayı alınır.
2. Eski AI server/desktop test klasörleri silinmiş; o testler çalıştırılmış
   veya başarılı sayılmaz. 7 Ekim açık yayın talimatıyla mevcut site kapsamı
   doğrulandı: npm run check 53/53 + TypeScript/Vite build.
3. Port yasaklandığı için emülatör entegrasyon/Hosting takımları koşulmadı.
   Yerlerine canlı HTTPS kabulü yapıldı: 12 rota, 1280/390 px, gerçek Setup
   düğmesi/boyut/SHA, anonim admin reddi, 12 runtime dosyasının SHA'sı;
   Google Rules REST test API'sinde 12/12 kural kontrolü. Fiziksel cihaz,
   gerçek Windows kurulum/kaldırma ve 500 MB sınır transferi ölçülmedi.
4. read-inventory.mjs ile proje/domain/sertifika/Auth sağlayıcıları, billing ve
   güncel canlı Firestore/Storage kuralları yeniden salt okunur alınır. Mevcut
   kullanıcı UID'leri ve diğer Functions servisleri korunur.
5. Önceki Hosting sürümü/config ve yeni koleksiyonlar yedeklenir. Bu sürümün
   client config'i .env.production.local içindedir. Public config sır değildir;
   SMTP/servis hesabı sırları istemciye veya repoya taşınmaz.
6. Mail GAMES_MAIL_USER ve mevcut Secret Manager MOBILE_MAIL_PASS ile yeni
   servisten gider. Latest ENABLED metadata görüldü, payload okunmadı. Üretim
   servis yetkisi, SMTP ve gerçek gelen kutusu teslimi ayrıca doğrulanır.
7. Özel domain authDomain kutarya.com ve mail işlem bağlantıları korunur;
   Auth authorizedDomains doğrulanır. 5 Ekim isteğiyle bu paylaşım sitesinde
   Google butonu ve OAuth başlatma akışı kaldırıldı. Ortak canlı Firebase Google
   sağlayıcısı diğer uygulamalar için korunur; bu UI için Google kabulü aranmaz.
8. Yayın onayı ardından gamesAdmin claim'i seçilen doğrulanmış hesaba mevcut
   claim'ler korunarak atanır. Yeni token için yeniden giriş gerekir.

## Ortak veritabanı ve Storage kuralları

İstemci yeni katalog/profil/destek verisini doğrudan Firestore'dan almaz;
gamesService Admin SDK kullanır. Kullanıcının gönderdiği Firestore kuralları
salt okunur canlı kurallarla aynı. Bu yüzden mevcut Firestore kuralları değiştirilmez.
firebase/firestore.rules yerel deny-all'dur, ortak projeye deploy edilmez.

İndirilebilir paketlerin browser upload'ı için yeni projectAssets kapsamı gerekir.
Yerel firebase/storage.rules ortak bucket'a tek başına deploy edilmez. Güncel
canlı kurallarda users, public ve indirmeler ile eski admin genel izni vardır.
Storage izinleri toplamsal olduğundan sadece yeni dar kural eklemek yeterli değildir:
eski catch-all allow, paket üzerine yazma korumasını aşabilir.

```powershell
node scripts/read-inventory.mjs
node scripts/prepare-storage-rules.mjs
node scripts/storage-release-check.mjs
```

Hazırlayıcı canlı kural yapısı beklentiden farklıysa durur. Mevcut users/public/
indirmeler kurallarını korur; genel eski admin izninden yalnız projectAssets
kapsamını çıkarır. Yeni kapsam doğrulanmış gamesAdmin, kendi UID yolu, oluşturma,
500 MB ve paket MIME/uzantı koşulları ister. Üzerine yazma/silme browser SDK'da
kapalı; sunucu dosya tamamlar/kaldırır. resource == null koşulu da zorunludur.

Çıktılar ignore artifacts/firebase-production-storage.rules ve
firebase.storage-release.json; base/proposed SHA kaydı storage-rules-review.json.
8 karşılaştırmalı test yalnız yerel Storage emülatörüne uygulanır ve ardından
local kurallar geri yüklenir. Canlı kuralları değiştirmez. Yayına hemen yakın
canlı taban yeniden okunmalı, öneri/test/inceleme yenilenmelidir. Başka bir
asistanın eski kurallardan yaptığı öneriyi kontrolsüz yayımlama.

## Daraltılmış yayın komutları

7 Ekim yayınında aşağıdaki dar kapsamlar kullanıldı. Tekrar yayın için güncel
hedef/kurallar/izinler incelenir ve kullanıcının geçerli onayı aranır:

```powershell
$env:KUTARYA_RELEASE_APPROVED = 'true'
node scripts/deploy-release.mjs functions:kutarya-games
node scripts/deploy-release.mjs storage
npm run build
node scripts/deploy-release.mjs hosting
```

Genel firebase deploy kullanma; yerel Firestore/Storage dosyalarını ve ortak
başka codebase'leri kapsama alma. Yeni backend/Storage hazır olmadan client'ı
canlıya alma. Başlangıç seed yalnız eksik kategori/duyuru/ayarları oluşturur;
başlangıç games listesi boştur. Production operator işlemleri açık onay ve
KUTARYA_RELEASE_APPROVED=true ister; bu environment değeri kullanıcı onayı yerine geçmez.

7 Ekim SEO devamında Hosting helper build-seo.mjs'yi otomatik çalıştırır;
canlı public katalogdan gerçek React HTML/sitemap üretir ve generated
firebase.seo-release.json ile yayımlar. Genel sayfalar exact rewrite, diğer
auth/admin/yeni proje akışı app.html SPA fallback; ayrıntılar SEO.md. Normal
npm run build + elle base config deploy, SEO içeriğini düşürür; helper kullan.
Güncel birim testleri 58/58; 20 canlı HTML, 18 sitemap URL'si/19 görsel ve
Google Search Console başarılı gönderimi ve Video indeksleme isteği doğrulandı.
www domain eklenip gerçek HTTPS/TLS ve yolu koruyan 301 ölçüldü; API sertifikası
CERT_PROPAGATING. GoDaddy şifre adımı iptal edildi; DNS değişmedi. Google'ın
yeni 18 URL'yi işlemesi ve eski hata raporu ayrı kabul durumudur: docs/SEO.md.
İki www 404 kaydı için Google düzeltme doğrulaması başlatıldı, sonuç bekleniyor.

deploy-release.mjs hedefi sabitler, --non-interactive kullanır, stdin'i kapatır
ve şifre talebinde kendi işlemini durdurur. Functions CLI discovery normalde
yerel port açar: FIREBASE_FUNCTIONS_DISCOVERY_OUTPUT_PATH=true manifest dosyasını
üretip çıkar. no-listeners.cjs Node listen çağrısını ayrıca engeller. SMTP için
GAMES_MAIL_USER public parametredir; mevcut MOBILE_MAIL_PASS sadece secret
adıyla Functions'e bağlanır. Şifre isteme durumda login/secret:set çalıştırılmaz.

authorize-catalog-release.mjs yalnız eksik başlangıç verisini oluşturur; kısa
ömürlü mevcut admin custom token'ını bellekte üretir. Service account üzerindeki
geçici TokenCreator izni token üretildikten sonra kaldırıldı; kalıcı key yok.
publish-catalog.mjs önceki yedi gerçek projeyi, upload-video.mjs Kutarya Video'yu
mevcut admin/dosya/Storage API hattından yükledi. Token/şifre kaydı tutulmaz.

Hosting web/Unity paketleri kontrollü import/manifest/tarayıcı raporu/operatör
adımından geçer. Gerçek Wasm MIME, gzip/Brotli encoding ve CORS ölçülmelidir;
Windows glob yerine mevcut / ve ters çizgi uyumlu regex başlıkları korunur.
Kaynak ZIP panelde indirilir; Hosting runtime'a otomatik açılmaz.

## Yayın sonrası ve geri dönüş

Gerçek hesapla e-posta girişi, altı haneli doğrulama/reset maili, profil,
misafir indirme, admin yükleme ve dosya bütünlüğü canlı hedefte denenir. Fiziksel
cihaz ve kullanıcının gerçek paketleri için ayrı runtime/kurulum kabulü yapılır.
Metrikler tarayıcı paket açılışıdır; kullanıcı/FPS/tamamlanmış indirme değildir.

7 Ekim güncel kanıt: catalog-upload.json (7 proje, 12 paket/16 görsel),
artifacts/kutarya-video/production-upload.json (2 EXE/3 PNG),
live-site-acceptance.json (canlı Setup düğmesi 237.083.465 bayt/SHA),
cloud-release-acceptance.json (7 eski servis, Firestore aynı, yayımlanmış
Storage kaynağı öneriyle aynı, geçici IAM kaldırılmış, 5 runtime/12 dosya).
E-posta teslimi ve normal hesap giriş/profil akışı canlıda test edilmedi;
parola istememe talimatıyla kullanıcıdan hesap bilgisi alınmadı.

Hosting önceki sürüme dönebilir; bu Firestore verisini, Functions, Storage
kurallarını veya claim'leri geri almaz. Her birinin önceki sürümü ayrı geri alınır.
Eski Storage ruleset'e dönerken yeni upload hattı devre dışı bırakılır; eski genel
admin izninin yeni kapsam üzerindeki etkisi tekrar incelenir. Ortak servisler
silinmez. Web runtime için önceki doğrulanmış sürüm panelden etkinleştirilebilir.

Arşivlemek kataloğu ve yeni indirme API çağrılarını gizler; önceden üretilmiş
Storage indirme anahtarını iptal etmez. Tam geri çekme gerektiğinde dosya silme/
anahtar iptali ayrıca yapılır. Taslak dosyalarda anahtar sunucuda kaldırılır.

Yerel önizleme scripts/start-local.ps1, 5180. Yerel kimlikler yalnız ignore
dosyada; demo yönetici gerçek Gmail hesabının şifresi değildir. Canlı kabul
ölçülmeden yerel sonuçları canlı başarı olarak raporlama.

## Google redirect uygulama notu

Client bilinen Firebase Hosting hostlarında authDomain olarak aynı hostu
seçer: kutarya.com, www.kutarya.com, kutarya-ai-3169.web.app/firebaseapp.com.
Bu, üçüncü taraf depolama kısıtları için Firebase'in aynı-origin yaklaşımıdır.
Her kullanılan hostun Auth authorizedDomains ve Google OAuth /__/auth/handler
kaydı yayın kabulünde doğrulanmalıdır; yalnız frontend seçimi console kaydını
oluşturmaz. Yerel ortam gerçek Google hesabına bağlanmaz; Auth emulator seçim
sayfasını aynı sekmede açar. Gerçek Google şifresi yerel test sayfasına girilmez.

Referans: https://firebase.google.com/docs/auth/web/redirect-best-practices
ve https://firebase.google.com/docs/emulator-suite/connect_auth.

## 5 Ekim kullanıcı paketleri

Yerelde Blackjack 1.0.3, Rulet 1.0.1 ve Kutarya Block Arena 1.0.0 kuruldu.
Runtime'lar public/games/, gerçek kapaklar public/media/games/, ZIP'ler ignore
artifacts/user-games/ altındadır. Local Storage URL'leri ve yerel Firestore
kataloğu Hosting deploy ile üretime geçmez. Yayın onayından sonra üretimde gerçek
proje/sürüm kayıtları, kapaklar ve ZIP yüklemeleri ayrıca yapılmalı; aynı indirme
ve runtime kabulü canlıda tekrarlanmalıdır. Demo installer canlıya bağlanamaz.
Bu görevde kullanıcının açık talebi gereği deploy yapılmadı.

Sonraki yerel içerik Kutarya Blok Diyarı 0.1.0'dır. Runtime/manifest
public/games/blok-diyari/0.1.0, ZIP artifacts/user-games/, kapak
public/media/games/blok-diyari.jpg. Aynı üretim kayıt/yükleme/yayın kapısı
geçerlidir; bu oyun eklemesi de canlıya deploy edilmedi.
