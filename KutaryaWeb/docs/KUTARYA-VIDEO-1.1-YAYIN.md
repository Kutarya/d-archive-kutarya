# Kutarya Video 1.1.0 — geliştirme, kabul ve yayın

Kullanıcı 10 Ekim 2026'da mevcut Windows uygulamasını geliştirme ve bitmiş
sürümü sitede yayımlama talimatı verdi. Yeni uygulama sistemi kurulmadı:
eski D:/KutaryaVideo klasörü bulunamayınca 1.0.0 portable EXE'nin SHA'sı
doğrulanarak asar içinden mevcut kod ve motorlar geri alındı. Referans kopya
Kurtarilan-1.0.0; uygulama devamı D:/KutaryaVideo/kaynak.

## Değişiklik ve kullanım

- Tek video adı/link alanı. Link yapıştırma otomatik kuyruğa ekler; isim
  Video bul/Enter ile altı gerçek YouTube sonucunu başlık/kanal/süre/kapakla
  getirir. Kullanıcı doğru sonucun İndir düğmesini seçer; arama iptal edilebilir.
- Sistem klasör seçicisi; kalıcı ayar. Her işin ayrı downloadDir kaydı vardır;
  değişiklik sonraki eklenen videolara uygulanır, eski video eski yerde açılır.
  Eski 1.0 geçmişi varsayılan eski klasörle göçer. Ulaşılamayan USB/klasör
  uygulamayı kapatmaz; varsayılan ve açıklama gösterilir.
- Ana ekran etkin indirmeler + son işlem. Geçmiş ayrı sekmede 20 satırlık
  sayfalıdır. Tek kayıt ve tüm tamamlanan/başarısız/iptal kayıtlar temizlenir;
  video dosyaları ve etkin iş korunur. Kapanışı süren iş yanlışlıkla silinmez.
- Açık/koyu/canlı/sistem temaları saklanır; sade Türkçe arayüz ve canlı vurgu.
- Her açılışta sabit HTTPS gamesService kamu kataloğu okunur; kutarya-video
  yayımlanmış kararlı sürümü sayısal karşılaştırılır. Yeni sürümde uygulama içi
  bildirim ve desteklenirse Windows Notification; sabit kutarya.com proje
  sayfası açılır. Ağ hatası indirmeyi engellemez. Otomatik kurulum yapılmaz.
  1.0 uygulamasında bu özellik yoktur; önce 1.1 yüklenmelidir.

## Ölçülmüş kabul ve açık sınırlar

- Son uygulama kaynaklarında 22/22 çekirdek test; 0 atlanan. Klasör değişimi,
  1.0 geçmiş göçü, kuyruk/iptal/tekilleştirme, temizlemede dosya/etkin iş
  korunması, çıktı yolu/uzantısı, arama iptali/ağ/JSON, tema kalıcılığı ve
  uygulama sürümü yeni/güncel/çevrimdışı durumları içerir.
- Geliştirme, win-unpacked ve gerçek portable: ayrı profillerde 30/30 kontrol.
  Sandbox/IPC, 780px taşmasız düzen, dört tema, 100 eski kayıtta ana ekranda
  tek satır ve Geçmiş'te 20 satır/sayfalama, temizleme ve gerçek HTTPS sürüm
  okuma geçti. 9.0.0 gelecek sürüm bildirimi kontrollü servis yanıtıdır.
- Gerçek isim araması altı YouTube sonucu döndürdü; Blender Big Buck Bunny
  seçimi gerçek kuyruğa, seçilen klasörle eklendi. Gerçek indirme test ağında
  YouTube HTTP 429 ve bot doğrulamasıyla başarısız oldu. İkinci herkese açık
  video ve bir alternatif motor istemcisi de erişemedi. Bu sonuç gizlenmez:
  yeni sürümde tamamlanmış gerçek video/ses indirmesi kabulü açık kalır.
  1.0'ın eski 1080p kabulü yeni testin yerine sayılmaz. 1.0 downloadArgs
  sözleşmesi bu sürümde birebir aynı olarak otomatik karşılaştırıldı.
- Klasör seçimi IPC, seçenekler, iptal ve kalıcılık kontrollü native seçici
  yanıtıyla doğrulandı; Windows dosya seçicisiyle elle seçim ölçülmedi.
  Windows Notification gerçek teslimi, kurulum/registry/kısayol/kaldırma ve
  farklı bilgisayar kabulü yapılmadı. Setup çalıştırılmaz; kullanıcı profili
  veya açık eski uygulama değiştirilmez. Paket NotSigned.
- Setup ham 7z payload'ı çıkarıldı: 93 dosya win-unpacked ile birebir SHA aynı.
  13 uygulama kaynağı ve 18 vendor/lisans dosyası paketle aynı. Orijinal 1.0
  web EXE'lerinin SHA'ları korundu. 1.1 paketleri yayımlandıktan sonra sabittir.
- Site 58/58 + TypeScript/Vite build. File üzerinden gerçek React UI ile
  1280/390, dört görsel decode/sekme/dosya, taşma/renderer/dış ağ hatası 0.
  Bu önizleme canlı yayın veya Windows kurulum testi değildir. Eski AI
  server/desktop test klasörleri bulunmadı; 385/102 testler çalışmış sayılmaz.

Yerel kanıt: D:/KutaryaVideo/Kanitlar/{development-1791647750344,
development-1791647768049,unpacked-1791648096321,portable-1791648303996}/
ve release-1.1.0.json. Web paket/önizleme: artifacts/kutarya-video/1.1.0/.

## Paketler

| Paket | Bayt | SHA256 |
| --- | ---: | --- |
| Kutarya-Video-Setup-1.1.0.exe | 191940786 | DEA049B17FFEF79C92159D383C907CD78AA892B81DF23425FAA532163E79F059 |
| Kutarya-Video-Portable-1.1.0.exe | 191783659 | 9E37F6E29E53E0E462A893899C3B0D2E68EA588BE67DAA8DC1BB890FA2502B9E |

AppId/executableName com.kutarya.video/KutaryaVideo korunur. NSIS yalnız
kullanıcı, UAC/otomatik açma yok, veri silme yok. Açık eski/yeni exe varsa
kurulum Abort eder; uygulamayı kendiliğinden kapatmaz. Portable Veriler/Videolar
EXE yanında; kurulu veri AppData/Roaming/Kutarya Video, varsayılan videolar
İndirilenler/Kutarya Video/Videolar. Geçmiş/ayar göçü otomatik dosya taşımaz.

## Yayın hattı

Hedef kutarya-ai-3169 / https://kutarya.com/proje/kutarya-video.
gamesService europe-west1; Storage US-EAST1. Yeni Functions/kurallar/Auth veya
PC servisi gerekmez. Mevcut ücretli Firebase planında ek paket depolama ve
indirme trafiği maliyeti oluşur. Kullanıcının doğrudan yayın talimatı bu
sürüm kapsamı için yetkidir; sonraki sürümler ayrı talimat ister.

Metadata projects-src/kutarya-video.mjs. prepare-video-1.1-site.mjs yalnız
SHA doğrulanmış yeni iki EXE ve gerçek dört ekranı seçer; eski dosyaya yazmaz.
video-release-audit.mjs before/after mevcut hedef/domain/Auth/kurallar/sekiz
servis, diğer 11 proje, admin UID/claim ve IAM bağlarını karşılaştırır.
authorize-video-release.mjs mevcut gamesAdmin hesabının kısa ömürlü token'ını
bellekte üretir; geçici imza iznini yüklemeden önce kaldırır. upload-video-1.1
mevcut admin.fileBegin/Complete/cover/game hattını kullanır; eski iki dosya
korunur. Yeni dosyalar Dosyalar sekmesinde başta gösterilir.

Hosting yalnız deploy-release.mjs hosting SEO helper'ı ile yayımlanır.
verify-video-1.1-live.mjs gerçek HTTPS, 24 HTML SHA/sitemap/robots/canonical,
anonim admin reddi, 1280/390 ve iki gerçek İndir düğmesinin tam paket SHA'sını
kontrol eder. Sunucu/emülatör/debug TCP portu, parola/login/kalıcı key veya
Secret Manager payload yoktur. Yayın kanıtları artifacts/releases/kutarya-video/1.1.0/.

## Canlı sonuç — 10 Ekim 2026

Kutarya Video1.1.0 https://kutarya.com/proje/kutarya-video üzerinde yayımlandı.
Hosting1de14f25e4536bb1; önceki ba161f8b5c0458d6. SEO12 gerçek proje,
23 sitemap URL'si,24 statik React HTML;93 Hosting dosyası. Yalnız Hosting
dağıtıldı; paket ve katalog işlemleri mevcut admin API/Storage hattındadır.

production-upload.json: iki yeni EXE ve dört gerçek ekran internetten tam
indirilip byte/SHA ile eşleşti. Eski1.0'ın iki dosya kimliği ve bütün alanları
korundu; yeni iki dosya başta. cloud-acceptance.json: diğer11 proje, sekiz
Functions, Firestore/Storage ruleset'leri, ortak Auth, admin UID/claim ve IAM
aynı. Geçici imza izni yükleme başlamadan kaldırıldı; kaynaklar yayın sırasında
değişmedi.1.1 Setup/portable kalıcı sürüm paketleridir, üzerine yazılmaz.

live-update-check.json: gerçek kamu kataloğuyla1.1.0 güncel,1.0.0 karşılaştırma
girdisi için1.1.0 yeni olarak algılandı. Bu eski1.0 EXE'ye yeni kontrol özelliği
eklemez. Windows OS bildirimi teslimi yine ölçülmemiştir.

live-acceptance.json: gerçek HTTPS24 HTML'in SHA'sı build ile eşleşti;
sitemap/robots/canonical, eksik JS404 ve anonim admin401 geçti.
Canlı Edge1280/390 kart/detay/dört decode edilen görsel/Dosyalar sekmesi ve
iki gerçek İndir düğmesiyle tam Setup/portable byte/SHA geçti. Yeni iki dosya
başta; yatay taşma ve renderer hatası0. Ekranlar canli-video-1280/390.png ve
canli-dosyalar-1280/390.png aynı release klasöründedir. Bu site indirimi
YouTube video indirme veya Windows kurulum/OS bildirimi kabulü sayılmaz.

before.json önceki Hosting config/katalog yedeğidir. Hosting geri alma tek
başına katalog ve Storage'ı geri almaz; eski Video metadata'sı ayrıca seçilir.
Eski1.0 paketleri silinmez. PC sunucusu/parola/kalıcı key/secret payload yoktur.
