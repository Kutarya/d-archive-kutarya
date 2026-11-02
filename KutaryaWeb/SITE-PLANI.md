# Kutarya — proje paylaşım platformu, plan v5

21 Ekim 2026 yerel geliştirme: Blackjack Royal Night2.0 (yeni masa, bölme/teslim,
günlük beş tur,2–5 kişilik online sunucu/istemci), /oyun-gecesi ve ana sayfa
vitrini hazırlandı. Devam isteğiyle /kesif amaç/cihaz rotaları, gerçek sürüm
notlarından /duyurular günlüğü ve ana sayfa rota/güncelleme bölümleri eklendi.
Katalog/proje sayısı artırılmadı, hesap açma geri getirilmedi. Canlı yayın
henüz onaylanmadı; şu anki prod1.0.3 ve tüm eski paketler korunur. Kabul,
sınırlar ve yayına devam docs/BLACKJACK-2-OYUN-GECESI.md ve DEVIR.md içindedir.

18 Ekim 2026: Rus Ruleti: Son Tur1.0.1, 2–6 kişilik gerçek online oda/hızlı eşleşme ve bot antrenmanıyla yayımlandı. Katalog13 proje. Hosting sites/kutarya-ai-3169/versions/b559d71ce1f095d4; kabul ve işletim docs/RUS-RULETI.md. Diğer projeler/servisler korunur.

18 Ekim 2026: Kutarya Jenerik1.4.0 Setup-r2/portable ve yeni ekranları mevcut ürün sayfasında yayımlandı. Hosting `6cdaeae4c630d99a`; eski dosyalar ve diğer projeler korundu. Kurulumda eski veri koruması, yeni sürüm dizinleri ve canlı kabul `docs/KUTARYA-JENERIK-1.4-YAYIN.md` içindedir.

14 Ekim: site yenilemesi açık geliştirme/yayın onayıyla Hosting
`8856063159d3f95a` üzerinde etkin. Gerçek proje vitrini, son güncellemeler,
açıklama/sürüm/platform gösteren kartlar, mobil arama/Günlük, kullanım olanağı
filtreleri, güncel paket ve eski dosya ayrımı, URL sekmeleri, açılır galeri ve
yönetici taslak önizlemesi vardır. Mevcut 12 proje/paketler/özel paylaşım ve
Auth/kurallar korundu. Kabul ve sınırlar `docs/SITE-YENILEME-2026-10-14.md`.

12 Ekim: Muvv 0.4.0 kaynak/görsel/iyileştirme sayfası yalnız adresle paylaşım
için `/ozel` üzerinde yayımlandı. Menü/katalog/sitemap bağlantısı yok; noindex
başlığı var. Katalog12 proje olarak aynı. Ayrıntılar `docs/OZEL-MUVV-YAYIN.md`.

11 Ekim güncel: Block Arena2.1.0 yayımlandı. Oyuncu adları lobide/maçta
değiştirilebilir; başlangıç silahı seçimi, anında hareket/atış tepkisi ve
daha küçük online paketler eklendi. Eski1.0/2.0 paketleri ve diğer projeler
korunur. Gerçek ping ve kontrollü gecikme kabulü docs/BLOCK-ARENA-2.1.md
ve DEVIR.md içinde; her ağda RTT düşüşü veya yoğun yük kapasitesi iddiası yok.

10 Ekim son: Kutarya Block Arena2.0.0 grafik/menü/HUD/hareket/efekt ve
hesapsız2–8 kişilik kodlu online serbest/takım odalarıyla yayımlandı.
Site Firebase Hosting; yalnız oyun için bağımsız, yetkisiz Cloud Run
WebSocket servisi. Bot modları ve eski1.0 paketi korunur. Katalog12 proje.
Canlı kabul/işletim/sınırlar docs/BLOCK-ARENA-2.md ve DEVIR.md içinde.

10 Ekim önceki: Kutarya Video1.1.0 Setup/portable ve dört gerçek ekran kullanıcının
geliştirme/yayın talimatıyla mevcut sayfaya eklendi. İsimle arama, klasör,
geçmiş, temalar ve sürüm bildirimi; eski1.0 iki dosya korunur. Katalog12 proje.
Gerçek YouTube indirmesi bu ağda429/bot doğrulamasında engellendi; ölçüm ve
sınırlar docs/KUTARYA-VIDEO-1.1-YAYIN.md ve DEVIR.md içindedir.

10 Ekim: Kutarya Mobile1.2 imzalı APK/kaynak ve dört gerçek ekran açık
“Siteye yayınla” talimatıyla mevcut canlı sayfaya eklendi. Eski1.1 dosyaları
korunur. Katalog12 proje; kabul/yayın sınırları
docs/KUTARYA-MOBILE-1.2-YAYIN.md ve DEVIR.md içinde.

9 Ekim 2026. Oyunlar, uygulamalar ve kaynaklar için mevcut paylaşım platformu
korunur. Kullanıcının yeni yönlendirmesiyle ziyaretçi hesabı ve kişisel
kütüphane şimdilik kaldırılır. Bu değişiklik aynı gün açık kullanıcı onayıyla
yalnız Firebase Hosting'de yayımlandı; güncel yayın kaydı DEVIR.md'dedir.

## Ürün amacı

Kutarya.com kişisel üretimlerin düzenli kataloğu olacak. Ziyaretçi proje
bilgilerini okuyacak, uygun dosyayı indirecek, web deneyimini açacak veya kaynak
kod deposuna ulaşacak. Yönetici oyun eklemeye zorlanmadan her tür projeyi
paylaşabilecek. Ziyaretçi hesabı veya kişisel kütüphane gerekmez; admin paneli
ve yalnız yetkili yönetici girişi korunur.

| Koleksiyon        | Örnek gerçek kullanım                         | Dağıtım                                   |
| ----------------- | --------------------------------------------- | ----------------------------------------- |
| Oyunlar           | Unity oyunu, blackjack/poker/rulet, basit FPS | Web build veya indirilebilir paket        |
| Masaüstü          | .NET Windows uygulaması                       | EXE/MSI, ZIP taşınabilir sürüm            |
| Web projeleri     | HTML/CSS/JS deneyimi                          | Doğrulanmış web build, kaynak arşivi/depo |
| Mobil uygulamalar | Android uygulaması                            | APK/AAB ve ayrı kaynak arşivi             |
| Kaynak kod        | Öğrenme ve açık kaynak proje                  | ZIP/7Z/GZ veya HTTPS depo                 |
| Araçlar           | Küçük yardımcı uygulama                       | Dosya veya doğrulanmış web deneyimi       |

Tablodaki örnekler gelecek içerik türleridir; bu görevde bu oyun/uygulamalar
üretilmedi. Eski dört native oyun ve kapakları kaldırıldı. Sahte katalog,
kullanıcı/oyuncu sayısı, değerlendirme veya indirme sayısı olmayacak.

## Görsel dil

Açık tema ilk kullanım varsayılanıdır. Sıcak, koyu ve sistem seçenekleri aynı
renk değişkenleriyle tüm sayfalara uygulanır; seçim yenilemede korunur. Okunaklı
başlıklar, sade beyaz paneller, ölçülü turuncu vurgu ve gerçek proje vitrini
kullanılır. Proje görseli yoksa bunu açıkça belirten nötr alan gösterilir.

Masaüstünde üst gezinme + koleksiyon yan menüsü; mobilde görünür arama, açılır
gezinme ve tek sütun proje kartları vardır. Koleksiyon bağlantıları kompakt
satırlara sarılır. Yönetimin ayrı bölüm menüsü vardır.
Form odakları görünür, etiketler bağlıdır; azaltılmış hareket tercihi desteklenir.

Örnek araştırması: itch.io içerik/keşif düzeni, Modrinth tür/filtre düzeni,
GitHub Releases sürüm-dosya ayrımı. Bunların marka veya ekranı kopyalanmadı.

## Sayfalar ve kullanıcı akışı

| Sayfa                 | İçerik                                                           |
| --------------------- | ---------------------------------------------------------------- |
| /                     | Gerçek proje vitrini, dolu koleksiyonlar, son güncellenen projeler |
| /projeler             | Arama, tür/kategori/platform/sıralama, kart/liste görünümü       |
| /koleksiyon/:kind     | Seçili içerik türünün kataloğu                                   |
| /proje/:slug          | Kapak, açıklama, ekran görüntüleri, dosyalar, sürüm notları      |
| /oyna/:slug           | Doğrulanmış web/Unity paketinin sandbox iframe'i                 |
| /admin/auth/*         | Yönetici girişi, doğrulama ve özel parola sıfırlama              |
| /auth/*, /hesabim, /kutuphanem | Eski ziyaretçi adresleri kataloğa yönlenir; /auth/action mevcut yönetici reset e-postaları için yeni adrese sorgusuyla aktarılır |
| /duyurular, /destek   | Gerçek duyurular, destek formu                                   |
| /admin/*              | Sunucu yetkili yönetim                                           |

Katalog filtreleri URL'de tutulur. Sonuç yoksa temizleme ve açıklama sunulur.
Eski /oyunlar ve /oyun/:slug bağlantıları yeni koleksiyon/detaya yönlendirilir.
Bilinmeyen statik dosya Hosting'de HTML uygulamasıyla sahte 200 dönmez; 404 verir.

## Proje modeli ve editör

Kimlik/adres, ad, kısa ve uzun açıklama, tür/kategori/etiketler; teknoloji,
platformlar, lisans, gereksinim, kullanım/kurulum, HTTPS kaynak deposu; kapak,
en fazla sekiz ekran görüntüsü; sürüm notları, yayın durumu, öne çıkarma/sıra.

Admin editörü beş bölümdür: Proje bilgileri, Görseller, Dosyalar, Teknik
ayrıntılar, Yayın ayarları. Taslaklar halka kapalıdır. Adresler sunucuda
transaction ile tekil tutulur; eşzamanlı aynı adres oluşturması da korunur.

Dosya modeli: sunucunun verdiği kimlik, ad, boyut, sürüm, rol ve platform.
Depolama yolu ve generation özel sunucu verisidir, kamu kataloğunda görünmez.
Kurulum ile kaynak kod aynı projede ayrı dosyalardır; her dosyanın sürümü
bağımsızdır. Proje yayın sürümüyle eşleşen edinme yolu bulunmadan yayınlanmaz.

## Dosya ve tarayıcı paketi hattı

İndirilebilir dosya: taslak kaydet → admin yükleme bileti → Storage resumable
upload → sunucuda metadata/imza kontrolü → transaction ile dosya kaydı → yayın.
Doğrulanmış admin kendi kapsamına oluşturabilir; kayıtlı paket üzerine yazamaz.
Yüklemede ilerleme, duraklatma, sürdürme ve iptal vardır. Dosya sınırı 500 MB,
proje sınırı 20 dosya; kaynak dosyaları arşivdir. Büyük dosya Functions gövdesinden
taşınmaz. Kapak/galeri her görsel için 1 MB, PNG/JPEG/WebP ve sunucu imza kontrolü.

İndirme: yayınlı proje + kayıtlı dosya → gerçek Storage generation/boyut kontrolü
→ attachment bağlantısı. Hazırlanan bağlantı tamamlanan indirme sayılmaz.
Arşivleme katalog ve yeni indirme API erişimini kapatır; önceden alınmış URL
anahtarını geri çağırmaz. Gizli dosya dağıtımı bu ürünün işlevi değildir.

Web/Unity: build klasörü → güvenli sürümlü Hosting import → SHA/boyut manifesti
→ gerçek tarayıcı raporu → operatör sürüm kaydı → panelden etkinleştirme →
Hosting yayını. Kaynak ZIP web runtime olarak çalıştırılmaz. Iframe scripts ve
pointer-lock ile sınırlıdır; tam ekran ve kontroller vardır. Yükleme hatası ve
zaman aşımı yeniden deneme sunar. Unity gzip/Brotli/Wasm başlıkları Hosting'de
ayrı ölçülür; gerçek Unity build ve fiziksel cihaz kabulü sağlanan içerikle yapılır.

## Ziyaretçi erişimi ve yönetim

9 Ekim isteğiyle genel giriş/kayıt, profil, kişisel kütüphane ve favoriler
arayüzden kaldırılır. Kart/detay/player favori düğmeleri ve kişisel geçmiş
yazımları yoktur. Önceki ziyaretçi oturumları otomatik profil oluşturmaz.
Ortak Firebase Auth projesi, UID'ler ve önceki profil verileri korunur; mevcut
sunucu hesap uçları ve diğer uygulamaların Auth sağlayıcıları değiştirilmez.

Yönetici için /admin/auth/login üzerinden mevcut e-posta/şifre girişi,
altı haneli kod doğrulama, tekrar gönderme ve özel reset işlemi sürer. Kayıt
formu yoktur. Yönetim girişinde gamesAdmin claim'i olmayan oturum kapatılır.
Kodlar sunucuda hash, süre/deneme/tek kullanım kontrolüyle tutulur. SMTP kabulü
canlı hedefte yapılır; kontrollü yerel mail taklidi teslim kanıtı değildir.

Admin yetkisi doğrulanmış e-posta + gamesAdmin custom claim + site üyelik
kısıtlarıyla sunucuda uygulanır. E-posta metnini veya localStorage değerini admin
kapısı sayma. İlk canlı yönetici kutaryaai@gmail.com; önceki canlı claim ataması
ve yayın kanıtı DEVIR.md'de kayıtlıdır.

Yönetim bölümleri: genel bakış, projeler, kategoriler, kullanıcılar, destek,
duyurular, site ayarları ve audit. Hesap kısıtı bu platform profiline uygulanır;
ortak Auth hesabını otomatik silmez. Metrikler yalnız tarayıcı paket açılışlarıdır.

## Altyapı ve yayın

Frontend React/TypeScript/Vite, Firebase Hosting; Auth mevcut kutarya-ai-3169.
Yeni callable gamesService, codebase kutarya-games, europe-west1, Node 22,
maxInstances=3. İç koleksiyon/API adlarında game öneki uyumluluk için korunur.
Storage mevcut bucket'tadır. Üretim PC'ye bağlı değildir. Trafik, Storage,
Firestore ve Functions mevcut ücretli Firebase planında maliyet oluşturabilir.

Gönderilen public config eşleşti; üretimde özel-domain authDomain kutarya.com
korundu. databaseURL/measurementId config olarak mevcut; Realtime Database ve
Analytics bu sürümde etkin veri toplama/okuma yapmaz.

Firestore'a istemci doğrudan erişmez; kullanıcının gönderdiği ve salt okunur
canlıdan alınan mevcut kurallar aynıdır. Yerel deny-all dosyasını ortak projeye
deploy etme. Storage'ın mevcut kullanıcı/public/indirmeler kuralları korunarak
yalnız projectAssets kapsamı eklenir; eski genel admin allow bu kapsamı aşamaz.
Öneri hazırlandı ve yerel karşılaştırmalı test geçti; canlı kurallar değişmedi.

Yayın sınırı: kullanıcı önce yerel inceleme seçti; 7 Ekim katalog ve 9 Ekim
ziyaretçi hesabı/kütüphane kaldırma yayını açık onayla tamamlandı. Son işlem
yalnız Hosting'dir. Yeni kapsam için yeni onay olmadan Hosting, Functions,
canlı claim ve Storage kuralları değiştirilmez. Eski silinen server/desktop
testleri geçti denmez; güncel site ve canlı kabul docs/KABUL.md'dedir.

## Teslim ve sonraki içerik aşaması

Bu sürüm: düzenli katalog, dört tema, proje/dosya/galeri yönetimi, yönetici
girişi, destek ve tarayıcı paket hattı. Hesap ve kişisel kütüphane ziyaretçiye
sunulmaz. Doğrulama docs/KABUL.md; yeni erişim kabulü
scripts/review-public-access.mjs ile gerçek React/Provider ve kontrollü servis
düzeneğinde port açmadan yapılır. Bu kabul canlı Firebase giriş/mail kanıtı değildir.

Sonraki içerik işi kullanıcının gerçek projesiyle başlar: build, kapaklar,
lisans, sürüm notu ve kurulum/runtime kabulü. Blackjack/poker/rulet/FPS üretimi,
mağaza yayını, yorum/puan/ödeme sistemi, CI ile otomatik ZIP runtime yayını bu
sürümün yapılmış özelliği olarak sunulmaz. Her gerçek içerik ayrı kapsam ve kabul
ister; ileride editör/veri modeli yeniden kurulmadan eklenebilir.

Kaynaklar: https://itch.io/ · https://modrinth.com/discover/mods ·
https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases ·
https://firebase.google.com/docs/storage/web/upload-files ·
https://firebase.google.com/docs/storage/security/rules-conditions

## 5 Ekim içerik güncellemesi

İlk boş katalog aşamasının ardından kullanıcının sağladığı Blackjack, Rulet ve
Kutarya Block Arena yerel siteye eklendi. Her biri oynama alanı, gerçek oyun
ekranı kapağı ve çevrimdışı ZIP indirimi içerir. Ekrana sığma ve tur yarışları
düzeltildi. Bu içeriklerin ayrıntıları docs/KULLANICI-OYUNLARI.md; canlı yayın
yapılmadı. Diğer uygulama/kaynak kategorileri yeni gerçek projeler için hazırdır.

Kullanıcının sonraki isteğiyle Kutarya Blok Diyarı 0.1.0 geliştirildi ve dördüncü
yerel oyun oldu. Hayatta kalma/yaratıcı mod, tohumlu dünya, üretim ve menüler;
ayrıntılı kapsam/kabul docs/BLOK-DIYARI.md içinde. Canlı deploy yapılmadı.

Kutarya OS 0.3.0 ilk gerçek masaüstü uygulaması olarak eklendi. C# Windows
Forms projesinin setup, taşınabilir ve kaynak paketleri mevcut Storage/admin
hattını kullanır. Kapak ve dört uygulama görüntüsü, sistem gereksinimleri,
kurulum açıklaması ve sürüm notu hazır. Katalog şimdi beş gerçek proje içerir;
bu ekleme yerel inceleme sınırındadır. Kabul ve yeniden ekleme:
docs/KUTARYA-OS.md. Canlı yayın onayı hâlâ bekliyor.

## 5 Ekim — gerçek dosya dönüştürücü ve giriş sadeleştirmesi

Kutarya Convert 1.0.0, Araçlar türünde altıncı gerçek proje olarak eklendi.
Görsel, belge/PDF, tablo ve ses ayrıştırma/yeniden kodlama; çoklu kuyruk, PDF
işlemleri, ZIP, önizleme, işlem iptali ve dört tema. Kendi çalışma sekmesinde
açılır; web ve kaynak ZIP'i Dosyalar bölümünde. Kapsam/sınırlar ve ölçülmüş
kabul docs/KUTARYA-CONVERT.md içinde. Eski beş proje korundu.

Kullanıcı bu sürümde Google girişini kaldırmayı istedi. Google butonu/akışı
Auth ekranından çıkarıldı; e-posta/şifre, kayıt, kod doğrulama, reset ve admin
korunur. Ortak canlı Auth sağlayıcıları değişmedi. Yerel inceleme kararı sürer.

## 5 Ekim — Java mobil AI uygulaması

Kutarya Cep 1.0.0, Mobil uygulamalar türünde yedinci gerçek projedir. Kullanıcı
ayrı sunucu istemedi: uygulama kendi API anahtarıyla OpenAI/OpenRouter/Gemini/
Grok'a doğrudan bağlanır. Java native Android; SQLite geçmiş ve kaynak bağlı,
düzenlenebilir hafıza; streaming/iptal/yeniden deneme, tema/animasyonlar,
sistem ses hizmetleri ve kullanıcı dosyasıyla JSON/Markdown yedekleme.

Mevcut admin ve dosya modeliyle Android test APK'sı, kaynak ZIP, okul PDF'si
ve altı gerçek emülatör görüntüsü eklendi. Önceki altı proje aynı kaldı.
Telefon görüntüleri için mevcut kapak/galeri CSS'i yalnız mobile türünde
ekranı kesmeden gösterir. Yeni yayın veya auth sistemi kurulmadı.

Zaman dağılımı 15 iş günü/60 saat öneri plandır; gerçekleşen süre ölçülmedi.
12 risk, önlem/durum, Java OOP/SQLite ve sınıf provası belgede dolduruldu.
27 birim/HTTP ve 12 Android kabulü, kaynak ZIP bağımsız derlemesi, site 53/53
ve build, üç gerçek tarayıcı indirimi SHA/boyut kabulü geçti. Gerçek API
hesabı/fiziksel telefon/ses/SAF erişilebilirlik kabulü açıktır. Ayrıntı:
docs/KUTARYA-CEP.md. Kullanıcının **deploy yapma** talimatı geçerlidir.
