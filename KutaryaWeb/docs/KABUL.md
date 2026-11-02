# Kutarya platformu — kabul kayıtları

## 14 Ekim 2026 — site yenileme ve Hosting yayını

- Açık kullanıcı devam/yayın onayıyla `8856063159d3f95a` yayımlandı; önceki
  `b13d7b2803ee333a`. Yalnız Hosting; PC/masaüstü kontrolü yapılmadı.
- 64/64 + TypeScript/Vite/SEO build; 12 proje/23 sitemap/24 HTML. Silinmiş eski
  AI385/Desktop102 klasörleri çalıştırılmış sayılmaz.
- Başsız Edge, ayrı geçici profil/pipe, port açmayan kontrollü kabul: 26 mevcut
  görünüm ve 8 eylem, 48 yeni görünüm ve 6 eylem geçti. 360/390/768/1280 px,
  açık/sıcak/koyu, ana/katalog/masaüstü/mobil detay; galeri ve taslak önizleme
  görüntüleri incelendi. Bu testlerde servisler kontrollü taklittir.
- Gerçek HTTPS: 24 HTML SHA,14 genel görünüm,6 eski yol; yeni olanak filtreleri,
  geri geçmişi, mobil arama/Günlük, galeri klavye/odak, Dosyalar URL'si ve eski
  sürüm bölümü geçti. Anonim admin API401; gerçek Blackjack iframe/play ve
  gerçek ZIP İndir düğmesi3185 bayt/SHA doğrulandı; renderer hatası0.
- 82 mevcut oyun/medya/özel dosyanın gzip9/SHA256 Hosting hash'i öncesi/sonrası
  aynı.8 Functions,12 katalog kaydı ve ortak Auth/admin/kurallar aynı; IAM yok.
  Özel paylaşım noindex ve sitemap dışında. Gerçek parola/mail/admin kaydetme
  testi yapılmadı. SPA Geri/İleri, editörün değişiklik uyarısıyla engellenmez.
- Kanıt: `artifacts/site-refresh/2026-10-14/` içinde `kabul.json`,
  `refresh-acceptance.json`, `refresh-actions.json`, `live-acceptance.json`,
  `before.json`, `after.json`, `cloud-acceptance.json` ve ekran görüntüleri.
  Komutlar ve sınırlar `SITE-YENILEME-2026-10-14.md` içindedir.

## 9 Ekim 2026 — ziyaretçi hesabı/kütüphane kaldırma; canlı kabul

- Kullanıcı "Canlıya yayımla" onayıyla yalnız Firebase Hosting yayımlandı.
  Güncel sürüm `43f73b57e6eb7708`; önceki `de4a2f903b00e3ba` config/sürüm
  yedeği `artifacts/release-2026-10-09-public-access/before.json` içindedir.
- Salt okunur yayın öncesi/sonrası karşılaştırması: sekiz Functions servisi,
  Firestore/Storage kuralları, 11 proje, ortak Auth ayarları ve admin claim'leri
  aynı; uygulama kaynakları yayın sırasında değişmedi. Hosting dışında yayın yok.
- Gerçek HTTPS: 23 statik HTML'in tamamı derleme SHA'sıyla aynı; sitemap/robots
  eşleşti, eksik JS 404. Anonim `admin.data`: 401/UNAUTHENTICATED.
- Edge pipe, 1280/390 px: 14 görünüm, altı eski ziyaretçi adresinin kataloğa
  yönlenmesi, mobil menü, yönetici kayıt yolunun kapalı olması, reset talep
  sayfası ve eski `/auth/action` sorgusunun yeni yola aktarılması geçti.
  Hesap/kütüphane/favori kontrolü, kişisel profil/geçmiş isteği, yatay taşma
  ve renderer hatası yok. Ana sayfa/katalog görselleri decode sonrası incelendi.
- Gerçek misafir İndir düğmesi: `Kutarya-Us-Model-Beyni-1.0.0.zip`, 3185 bayt,
  SHA256 `93d3b2bd99802ac9bc2e3f701ed824de66deb9a931202a00cdede824ee470e95`;
  mevcut manifestle aynı. Blackjack gerçek iframe/runtime açıldı ve `play`
  cevabı geçti; tam oyun oynanışı/FPS testi değildir.
- Gerçek yönetici parola girişi ve gerçek mail teslimi ölçülmedi. Port/parola/
  secret payload yok. Silinmiş eski AI testleri çalıştırılmış sayılmadı.
- Betikler: `scripts/public-access-release.mjs before|after` ve
  `scripts/verify-public-access-live.mjs`; Node `--require ./scripts/no-listeners.cjs`
  ile çalıştırıldı. Kanıtlar aynı klasörde `cloud-acceptance.json`,
  `live-acceptance.json`, `hosting-deploy.log`, `canli-*.png` (ignore).

## 9 Ekim 2026 — ziyaretçi hesabı/kütüphane kaldırma; yerel kabul

- Yeni kapsam: ziyaretçi giriş/kayıt, profil, kişisel kütüphane ve favoriler yok;
  admin girişi, katalog/indirme/oynama ve destek korunur. Eski kullanıcı verileri
  silinmez. Eski `/auth/action` mail bağlantısı sorgusuyla yönetim yoluna aktarılır.
- Son davranış değişikliğinden sonra 58/58 ve TypeScript/Vite build geçti.
- `node --require ./scripts/no-listeners.cjs scripts/review-public-access.mjs`:
  gerçek React/Provider, file HTML ve Edge pipe; 1280/390 px, 26 görünüm/yol,
  8 kullanıcı eylem grubu geçti. Yetkisiz admin girişi, yönetici giriş/çıkış ve
  doğrulama, kayıt yolunun kapalı olması, reset sorgu korunması; ziyaretçi
  oturumunda profil/favori/geçmiş isteği bulunmaması ölçüldü. Taşma/renderer hatası yok.
- Genel katalog ve görseller canlıdan salt okunur alınır (11 proje). Auth/mail/
  download/play kabulü kontrollü servis/runtime kullanır; gerçek Firebase girişi,
  mail teslimi, canlı paket indirmesi veya yeniden oyun oynanış kabulü değildir.
- SEO hazırlığı: 11 proje / 22 sitemap / 23 HTML. Genel HTML'de eski ziyaretçi
  hesap/favori linkleri yoktur. İnceleme/görüntüler ve kabul.json:
  `artifacts/release-2026-10-09-public-access/` (ignore).
- Bu bölüm yayın öncesi yerel kabulü kaydeder; aynı gün açık onayla Hosting
  yayını ve gerçek canlı kabul üstte tamamlandı. PC sunucusu/emülatör/debug
  portu açılmadı. Functions/kurallar/claims/ortak Auth/paketler değiştirilmedi.

## 7 Ekim 2026 — ilk katalog yayını canlı kabulü

Kullanıcının açık Hosting onayıyla kutarya-ai-3169 / kutarya.com yayımlandı.
Hosting sürümü 9a946d116eab4fd9. Sekiz gerçek proje, admin/login arayüzü,
gamesService ve kapsamlı birleştirilmiş Storage kuralları canlı. Önceki AI
ana sayfasının sürümü 8d7f667bc98add29 yedeklendi. Şifre/login/kalıcı key
istenmedi; secret payload okunmadı. HTTP/emülatör/debug sunucusu açılmadı.

- npm run check: mevcut site 53/53, TypeScript/Vite build başarılı.
- Rules REST test API: 12/12; mevcut yollar, admin kapsamı, doğrulama/UID,
  overwrite reddi, MIME ve boyut sınırı. Canlı yayımlanan kaynak öneriyle aynı.
- Önceki yedi proje: 12 paket/16 görsel; Kutarya Video: 2 EXE/3 PNG.
  Tüm gerçek misafir indirmeleri boyut/SHA ile orijinale eşleşti.
- Canlı Edge/pipe: 8 katalog kartı, 1280/390 px detay/dosya sekmeleri,
  3 görsel/2 dosya, yatay taşma ve renderer hatası yok; görüntüler incelendi.
- Gerçek Setup İndir düğmesi: 237.083.465 bayt, SHA
  1D87FD81AC720F4904EBF855BAC8EFD99CA3BEA01C75125D4415C5D1278D3E0F.
  Installer çalıştırılmadı.
- 11 canlı HTML rota 200, eksik JS 404; 5 web runtime / 12 dosya HTTPS
  boyut/SHA kabulü. Bu, yeniden oyun oynanışı/FPS testi değildir.
- Anonim admin UI engelli, admin.data 401; gamesAdmin pozitif yükleme gerçek
  API üzerinden geçti. Önceki 7 Functions URI/runtime/ACTIVE ve Firestore
  kuralları aynı; geçici IAM imza izni kaldırıldı.

Kanıt: artifacts/release-2026-10-07/{catalog-upload,live-site-acceptance,
cloud-release-acceptance,anonymous-api-acceptance,storage-cloud-tests}.json,
canli-*.png ve artifacts/kutarya-video/production-upload.json (ignore).
Port yasağı nedeniyle emülatör takımları koşulmadı; silinmiş eski AI testleri
başarılı sayılmadı. Normal hesap girişi/profil/mail teslimi, fiziksel cihaz ve
Windows kurulum/kaldırma kabulü açık. Kullanıcının açık portable uygulaması
korundu. Aşağıdaki eski tarihli yayın bekliyor notları tarihsel durumdur.

## Uygulanan kapsam

Açık varsayılan tema; sıcak, koyu ve sistem temaları. Genel proje kütüphanesi:
oyun, masaüstü, web, mobil, kaynak ve araç. Koleksiyon yan menüsü, arama ve
URL filtreleri, kart/liste görünümü, proje detaylarında galeri/dosyalar/sürüm
notları, platform/teknoloji/lisans. Masaüstü ve mobil düzenler görsel incelendi.

Kutarya Auth deneyimi, özel kod/reset, hesap/kütüphane ve sunucu yetkili admin
korundu. Yeni beş bölümlü proje editörü gerçek kapak/galeri ve resumable Storage
dosya yüklemesi sağlar. Taslak/yayın/arşiv, tekil adres, dosya sürümü ve platform
bilgileri; kategori/kullanıcı/destek/duyuru/ayarlar/audit yönetimi mevcut.

Eski dört native oyun, kaynakları ve kapakları kaldırıldı. Başlangıç kataloğu
boş; gelecekteki oyunlar yapılmış veya mevcut içerik olarak gösterilmez.
Ana sayfa stüdyo görseli AI ile üretilmiş dekorasyondur. Proje kapakları admin
paneline yüklenen görsellerdir; görselsiz projede nötr açıklama vardır.

## Güncel ölçülen sonuç

| Kontrol                                           | Sonuç                                                | Kanıt/ortam                                                |
| ------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| TypeScript + Vite üretim build                    | Geçti                                                | Yerel üretim config, dist                                  |
| Güvenlik + web import bütünlüğü                   | 11/11                                                | Node 24; ayrıca Node 22.23.3                               |
| Auth/Firestore/Functions/Storage entegrasyonu     | 38/38                                                | demo-kutarya-games, integration-results.json               |
| Hosting rota/404/MIME/gzip/Brotli/CORS            | 19/19                                                | Gerçek Hosting emülatörü 5182, hosting-results.json        |
| Birleştirilmiş canlı Storage kural önerisi        | 8/8                                                  | Yalnız yerel Storage, storage-rules-results.json           |
| Üretim bağımlılık audit                           | 0 bilinen açık                                       | Uygulama + Functions, npm audit --omit=dev                 |
| Tema seçimleri ve sıcak tema yenileme             | Gözlendi                                             | Gerçek tarayıcı                                            |
| Ana/katalog/detay/giriş/admin/editör              | 390 px yatay taşma yok                               | CUA tarayıcı viewport + DOM ölçümü                         |
| Admin taslak → kapak/galeri → ZIP yükleme → yayın | Çalıştı                                              | Gerçek UI/SDK/Functions/Storage                            |
| 12 MB ZIP duraklat/sürdür/iptal                   | Çalıştı                                              | Gerçek tarayıcı; iptal sonrası form yeniden kullanılabilir |
| Yayındaki ZIP indirme                             | Gerçek dosya, aynı SHA-256                           | Tarayıcı download; kaynak ve inen 541 B ZIP                |
| Generic web paket import/kayıt/iframe etkileşimi  | Çalıştı                                              | Tur tamamlandı: 1; tam ekran görseli                       |
| Başlatıcı                                         | UTF-8 BOM ve parser; -NoSeed mevcut servisle kontrol | PowerShell                                                 |

İndirme SHA-256:
459FC8BB3318CC886B267E8E1CC6900ADCAB5955E96CFC6B003BA226CB9869E4.
Bu yalnız açıkça geçici kabul için oluşturulan küçük kaynak arşividir;
kullanıcının uygulaması veya kurulumunun çalıştığı kanıtı değildir.

500 MB dosya sınırı kod/ret kontrollerinde doğrulandı; gerçek 500 MB transferi
ölçülmedi. Dosya imzası doğrulaması tam paket analizi, virüs taraması veya
EXE/MSI/APK/AAB çalıştırma kabulü değildir. Gerçek .NET/mobil/Unity projeleri
sağlandığında kendi kurulum ve cihaz kabulünü gerektirir.

Geçici yerel kabul projesi/paketi ve bağlı Storage dosyaları temizlendi. Yerel
seed diğer projeleri silmez; eski dört örneği kaldırır ve üç test hesabını yeniler.
Raporlar artifacts/, ekranlar artifacts/screenshots/; görsel kanıt v3-* dosyaları.
İçerikte eski v2 rapor/screenshots bulunabilir; güncel kapsam bu v3 kaydıdır.

## Firebase bilgileri ve üretim sınırı

Kullanıcının gönderdiği proje/API key/appId mevcut web config ile eşleşti.
Firestore kuralları canlı salt okunur alınan kurallarla normalize edilmiş
karşılaştırmada aynı çıktı. Yeni katalog erişimi Functions Admin SDK'dan yapılır;
istemci doğrudan Firestore kullanmaz. Yerel deny-all canlıya gönderilmez.

Storage public/indirmeler/users izinleri korunarak projectAssets yolu için
öneri hazırlandı. Eski global admin allow yeni korumayı aşmasın diye genel
kapsam bu yolu dışlıyor; karşılaştırmalı 8 test ölçüldü. Öneri canlıya verilmedi.
Arşiv katalog/API'den gizler; önceden alınmış Storage indirme anahtarları kalır.

Üretim authDomain kutarya.com özel-domain akışını korur; kullanıcıdaki
firebaseapp.com değeri aynı Auth projesinin varsayılan domainidir. Config'teki
Realtime Database ve Analytics değerleri herhangi bir veri toplama servisini
başlatmadı. Canlı Auth kullanıcıları, claims, kurallar ve Hosting değiştirilmedi.

Açık yayın kabulü: yeni Hosting/Functions/Storage yayını, canlı admin claim'i,
gerçek SMTP gelen kutusu, gerçek Google OAuth, fiziksel telefon ve kullanıcıdan
gerçek Unity build. İlk canlı admin kutaryaai@gmail.com seçildi; claim atanmadı.
Kök talimatındaki silinmiş eski test takımları çalıştırılamadı, geçti denmedi.
Kullanıcı Önce yerel sürümü incele dedi; yayın kapısı docs/YAYIN.md içindedir.

## Google girişi düzeltmesi

Google düğmesi için yerel emülatörde aynı sekme akışı, üretimde popup ve
popup-blocked halinde redirect, ayrıca Aynı sekmede giriş yap seçeneği eklendi.
Dönüş hedefinin query/hash bilgisi korunur ve site dışı hedefler reddedilir.
StrictMode sonucu bir kez okur; işlenen credential sonraki login ziyaretine taşınmaz.
İptal/ağ/sağlayıcı/domain/depolama hataları ayrı açıklanır. Profil API hatası
Google kimlik doğrulaması başarısız olmuş gibi sunulmaz; tekrar tamamlama sunulur.
Hesap bağlama yalnız aynı e-posta ile parola girişi sonrasında ilerler.

Google akışının 10 regresyon testi mevcut 11 teste eklendi: güncel npm test
21/21. Üretim build geçti; Node 22 için Google testleri ayrıca kontrol edildi.
Tarayıcıda emülatör hesap seçimi → Google Kabul profili → kütüphane; ikinci
akışta /projeler?tur=source hedefi ve Kaynak kod filtresi korundu. Gerçek Google
OAuth veya production deploy kabulü değildir. google-signin-success.jpg yerel
simüle edilmiş hesabın ekran kanıtıdır. Canlı Google hesabıyla kabul hâlâ açık.

## 5 Ekim — gerçek kullanıcı oyunları

Katalog artık kullanıcının üç gerçek oyununu içerir: Blackjack 1.0.3, Rulet
1.0.1 ve Kutarya Block Arena 1.0.0. Direct runtime ve korumalı site iframe'inde
oynandılar. Üç gerçek ZIP indirmesi kaynak hash'iyle eşleşti; admin her projede
tek güncel dosya gösterir. Oyun kapakları gerçek ekran görüntüleridir.

Bu görevin güncel sonuçları: 27/27 kod testi, 38/38 servis entegrasyonu ve
üretim build geçti. Önceki 19 Hosting/8 Storage karşılaştırması bu görevde tekrar
çalıştırılmadı. Ayrıntılı oyun analizi, ekran ölçümleri ve açık fiziksel cihaz/FPS
kabulü [KULLANICI-OYUNLARI.md](KULLANICI-OYUNLARI.md) içinde. Canlı deploy yapılmadı.

## 5 Ekim — Blok Diyarı eklendi

Dördüncü oyun Kutarya Blok Diyarı 0.1.0. Sonuçlar 34/34 kod testi, 38/38 servis
entegrasyonu, build; direct/iframe dünya/üretim, yaratıcı uçuş, JSON indirme/geri
yükleme, 390 px menü/çanta ve ZIP hash kabulü. Ayrıntı ve açık tam hayatta kalma,
fiziksel cihaz/file:// kabulü [BLOK-DIYARI.md](BLOK-DIYARI.md).
İlk entegrasyon tekrarında önceki testin doğruladığı sentetik hesap nedeniyle
başlangıç varsayımı başarısız oldu; kurulum yalnız yeni@kutarya.test hesabını
doğrulanmamış başlangıca alacak şekilde düzeltildi, sonra 38/38 geçti.
Parolalar/diğer oturumlar döndürülmedi. Üretim değişikliği yapılmadı.

## 5 Ekim — Kutarya OS 0.3.0 siteye eklendi

İlk gerçek masaüstü uygulaması: setup (49.827.118 bayt), taşınabilir ZIP
(88.054.357 bayt), kaynak ZIP (1.988.999 bayt). Yerel admin bileti/Storage
yüklemesi ve sunucu tamamlama hattı kullanıldı. Üç oturumsuz API indirmesi ve
tarayıcı düğmelerinden alınan üç dosya orijinal SHA-256/boyutlarıyla eşleşti.
Beş gerçek PNG görseli aynı hashlerle sunuluyor. Admin panelinde üç rol ve
v0.3.0 görüldü; masaüstü koleksiyonu tek gerçek uygulamayı gösteriyor.

1280 px masaüstü ve 390 px mobil açıklama/dosya ekranlarında yatay taşma yok;
mobilde beş görselin doğal boyutları doğrulandı. Betik tekrar çalıştırıldığında
dosya/görsel çoğalmadı ve dört oyunun kayıtları aynı kaldı. 34/34 kod testi ve
üretim build geçti. Servislerin önceki 38 entegrasyonu bu içerik eklemesinde
tekrar çalıştırılmadı. Ayrıntılar [KUTARYA-OS.md](KUTARYA-OS.md).
Canlı Firebase/Hosting/Auth/claims/kurallar değişmedi; deploy yapılmadı.

## 5 Ekim 2026 — Kutarya Convert ve Google düğmesinin kaldırılması

Bu bölüm Google girişinin önceki kabul notlarını güncel UI açısından geçersiz
kılar: artık Google butonu, linking ve redirect tamamlama Auth ekranında yok.
Canlı ortak Firebase sağlayıcısı korunur. Giriş ve kayıt ekranında 0 Google
düğmesi; mevcut yerel admin e-posta/şifre girişi hedef Araçlar'a dönerek geçti.

- npm run check: 53/53 + TypeScript/Vite build. 19 yeni Convert testi gerçek
  içerik üretir/okur. Eski 10 Google helper testi kullanılmayan yardımcılar içindir.
- Entegrasyon 38/38; kaynak ZIP ayrı klasörde npm ci, 19/19 ve byte/SHA aynı build.
- Yerel Hosting emülatörü 22/22: yeni runtime, rota/404/MIME/sıkıştırma;
  dist/tools-preview çıkarıldı ve yerel kabul sayfası 404 oldu.
- Gerçek 4 aile tarayıcı dönüşümü + ZIP; bağımsız PDF-lib, ExcelJS, Mammoth,
  Pillow ve ffprobe ile çıktılar açıldı. PDF/Türkçe ve Excel/sıfırlar/satır sonları
  geri okundu; gerçek MP3 44100 Hz stereo yaklaşık 2.04 saniye.
- PDF birleştirme/sıra, iki PNG sayfa, seçilen sayfayı 90 derece ayırma;
  SVG→JPEG 40x60; DOCX/HTML/MD dönüşümleri; 4 başarı yanında 3 dosya hatası.
- 120 sn WAV→MP3 iptali geçti. Sentetik DataTransfer ile 2 bırakma ve 2 dönüşüm;
  Explorer hareketi ölçülmedi. 15 orijinal girdi byte/SHA olarak aynı kaldı.
- Katalogda 6 proje, Araçlar 1; önceki beş proje aynı. Web/kaynak 2 Storage API
  ve 2 gerçek browser İndir sonucu byte/SHA eşleşti. İkinci kurulum kopya üretmedi.
- 390 px: uygulama, proje/dosya satırları, kayıt ekranı yatay taşmadı
  (innerWidth 390, scrollWidth 375). Koyu/açık görünüm ve mobil dört dosya kuyruğu.

Gerçek kapak public/media/projects/kutarya-convert/uygulama.jpg. Detaylı sınırlar,
kanıtlar ve yeniden ekleme docs/KUTARYA-CONVERT.md. Browser file:// protokolü
politika gereği engellendi; çift tıklama kabulü açık. Opaque iframe filechooser
olayı araçtan dönmedi; sandbox gevşetilmedi. Ana kullanım kendi sekmesindedir.
Fiziksel telefon, her girdi kodeki ve canlı yayın/mail kabulü açık. Deploy yok.

## 5 Ekim 2026 — Kutarya Cep 1.0.0

Android Studio Java mobil uygulama mevcut siteye eklendi; toplam yedi gerçek
proje. Önceki altı kayıt aynı, mevcut admin/dosya/Storage akışı kullanıldı.
Test APK (1.534.513 bayt), kaynak ZIP (100.478 bayt, 39 dosya) ve dört sayfalık
okul PDF (85.390 bayt) üç gerçek İndir düğmesiyle alındı; SHA/boyutları eşleşti.
Tekrar kurulum üç dosyayı ve altı görseli çoğaltmadı.

- Java birim/HTTP 27/27; sağlayıcı payload/header/path, stream/EOF/hata ve hafıza.
- Son APK kurulup Android instrumentation 12/12; SQLite/Keystore/yedek,
  Activity yenileme, gerçek native gönder/durdur/yeniden dene düğmeleri.
- Android build/lint: 0 hata, bastırılmamış 25 tavsiye. APK v2 imzası doğrulandı.
- ZIP ayrı çıkarıldı, 27/27 tekrar geçti; derlenen APK'nın 10 kod/manifest/kaynak
  girdisi dağıtılan APK ile byte/SHA aynı.
- Site 53/53 ve TypeScript/Vite build. Edge ile mobil koleksiyon/admin kaydı,
  1280/390 px taşmasız detay ve beş galeri görseli; pageerror yok.
- PDF dört sayfası render edilip incelendi; zaman/risk tabloları sığıyor.
  60 saat/15 iş günü öneri plan; gerçekleşen süre ölçülmedi.

Gerçek dört sağlayıcı anahtarı/cevap kalitesi/kota/latency ve fiziksel Android
8+ telefon, TalkBack/büyük yazı, elle SAF/ses hizmeti/FPS ölçülmedi. Galerideki
sohbet yanıtı kontrollü test düzeneği diye etiketlidir. Ayrıntı ve kanıtlar:
[KUTARYA-CEP.md](KUTARYA-CEP.md). Ayrı AI backend/cihaz içi LLM yok; API için
internet ve kullanıcı anahtarı gerekir. Bu görevde servis/Hosting testleri
tekrar çalıştırılmadı. Deploy veya canlı Firebase/PayTR değişikliği yapılmadı.


## 7 Ekim 2026 — Kutarya Video yayın öncesi içerik kabulü

Gerçek Setup/portable kopyaları SHA/boyut olarak asıllarla aynı; kapak + iki
galeri fotoğrafı gerçek portable uygulamadan. 53/53 + TypeScript/Vite build
geçti. Gerçek React/CSS incelemesi file: üzerinden Edge pipe bağlantısıyla
1280/390 px: 3 görsel, 2 dosya satırı, sekmeler, taşmasız görünüm; renderer
hatası ve dış ağ isteği yok. HTTP/emülatör/debug portu açılmadı.

Bu fixture incelemesidir; canlı upload/download veya Windows kurulum kabulü
değildir. Canlı site hâlâ eski AI, gamesService yok; hedef/yayın kapısı bekliyor.
Ayrıntılar [KUTARYA-VIDEO.md](KUTARYA-VIDEO.md).

## 7 Ekim 2026 — canlı SEO ve Search Console

Hosting sürümü 03796011d9d93fce; 58/58 birim testi ve TypeScript/Vite derleme.
20 genel React sayfasının ilk HTML içeriği, tek canonical ve JSON-LD gerçek
canlı yanıt SHA/boyutuyla eşleşti. Sitemap 18 adres/19 gerçek görsel; robots,
özel noindex başlıkları, 301 eski yollar ve emekli AI 404'leri doğrulandı.
Gerçek tarayıcıda Video üç görsel/iki paket/doğru meta/taşmasız görünüm;
konsol hatası yok. Giriş formu ve bulunmayan proje ekranında noindex doğrulandı.

Search Console'da yanlış HTML harita kaydı kaldırıldı; sitemap.xml yeniden
gönderildi ve başarı mesajı görüldü. Video için canlı URL kontrolü ardından
"Dizine eklenmesi istendi"; ana sayfa Google'da mevcut. Yeni adreslerin hepsi
indekslendi veya sıralama yükseldi iddiası yok. Son durum docs/SEO.md.

www Firebase custom domain/301 hedefi eklendi; HTTPS/TLS ve ana/proje/sitemap
301 yolu ölçüldü. GoDaddy şifre istediği için adımı iptal edildi; DNS değişmedi.
Google'da iki eski www 404 kaydı için "Doğrulama başladı" durumu doğrulandı.
Yerel port açılmadı. Açık Video PID/başlangıcı, yedi kaynak ve EXE SHA korundu.
Setup kurulumu, gerçek kullanıcı girişi ve mail teslimi bu SEO işinde denenmedi.
Kanıtlar ignore artifacts/seo-2026-10-07; ayrıntılar [SEO.md](SEO.md).
