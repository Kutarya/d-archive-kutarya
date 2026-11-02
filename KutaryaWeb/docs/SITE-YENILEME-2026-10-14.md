# Site yenileme — 14 Ekim 2026

Kullanıcı sitenin görünümünü ve eksiklerini geliştirmek istiyor. İlk çalışma
mevcut React/Firebase platformunda ana sayfa, keşif ve projeyi edinme akışına
odaklanır. Bu dosya başlangıç planını, devam işini ve aşağıdaki canlı kabulü kaydeder.

## İncelemede doğrulananlar

- Canlı genel katalogda 12 proje var; 12'si de öne çıkan işaretli. Ana sayfadaki
  “Son paylaşılanlar” öne çıkarmaya öncelik veriyor; son güncellenen ve seçilmiş
  içerik ayrı bir anlam taşımıyor.
- Gerçek projeler büyük stüdyo görseli ve altı kategori kartının altında.
  Mobil CSS, tanıtım alanına en az 610 px ayırıyor. Ekran görüntüsüyle ölçülmüş
  kaydırma mesafesi değildir; kaynak kodundaki yerleşimdir.
- Proje kartları ad ve teknoloji gösteriyor; kısa açıklama/sürüm ve projede
  oynama, indirme veya kaynak bulunup bulunmadığı görünmüyor.
- 760 px altında üst arama ve Günlük bağlantısını taşıyan üst menü gizleniyor.
  Açılır yan menüde Günlük bağlantısı yok.
- Kaynak kod koleksiyonu yalnız `kind=source` projeleri kapsıyor. Diğer
  türlerdeki kaynak paketlerini bulmak için ayrıca olanak filtresi gerekiyor.
- Masaüstü/mobil proje edinme düğmesi yalnız Dosyalar sekmesini açıyor.
  Güncel ve eski dosyalar aynı listede. Mobilde edinme kutusu uzun içeriğin altında.
- İki kaynak projesinin kapağı yok; sahte görsel veya sahte içerik eklenmez.
- Katalog önceden HTML'e gömülü olsa da arka plan API isteği hata verdiğinde
  içerik tamamen hata ekranına dönüşebiliyor.

Canlı denetim: `/`, `/projeler`, iki gerçek proje, `/duyurular` ve boş web
koleksiyonu HTTP 200. Genel HTML'den 12 proje ve tek duyuru okundu. Bu inceleme
gerçek yönetici girişi, indirme, oyun oynanışı veya görsel tarayıcı kabulü değildir.

## İlk uygulama kapsamı

1. Kısa bir giriş, gerçek bir proje vitrini, hemen ardından son güncellemeler.
   İçerik türleri kompakt bağlantılar olur; boş tür ana vitrine taşınmaz.
2. Açıklama, sürüm, platform ve edinme olanaklarını gösteren okunaklı kartlar.
3. Mobilde erişilebilir arama ve Günlük. URL ile paylaşılabilen arama/filtreler;
   Türkçe çok kelimeli arama; tarayıcı, indirme ve kaynak olanak filtreleri.
4. Detayın üstünde sürümü/platformu açık güncel paket düğmesi. Eski dosyalar
   saklanır, ayrı açılır bölümde kalır. Dosyalar sekmesine doğrudan bağlantı.
5. Önceden yüklenmiş katalog, yenileme hatasında erişilebilir kalır; hata ve
   yeniden deneme olanağı gösterilir.

## Kabul ölçütleri

- Son güncellemeler güncelleme tarihine göre sıralanır; öne çıkarma bu sırayı bozmaz.
- Olanak filtreleri yalnız güncel sürüm paketlerini ve gerçek depo/runtime'ı kullanır.
- Birincil indirme eski sürüme düşmez; dosya rolü ve hedef platform açık görünür.
- Sekme/filtre sorguları geri/ileri ve doğrudan bağlantıda korunur.
- Güncel kaynak/kurulum dosyası olmayan projeye yanıltıcı İndir düğmesi çıkmaz.
- 360/390/768/1280 px, üç renk teması, klavye/odak ve azaltılmış hareket
  tarayıcı kabulünde kontrol edilir. Yapılmadıysa tamamlandı denmez.
- Mevcut testler, yeni anlamlı keşif/paket seçimi testleri ve TypeScript/Vite
  derlemesi geçer. Statik React çıktısı gerçek katalogla ayrıca incelenir.

## Devam turu

- Galeri büyütme/gezinme, ok tuşları, Tab döngüsü, Escape ve odak dönüşü tamamlandı.
- Yönetici taslak önizlemesi, kaydedilmemiş değişiklik göstergesi ve düzenleyici
  geri/bağlantı/yenileme/kapatma uyarısı tamamlandı. SPA içindeki tarayıcı Geri/
  İleri uyarıyla engellenmez; tüm gezinmeyi koruduğu iddia edilmez.
- Ayrıntılı kurulum rehberleri, duyuru/sürüm notlarının otomatik bakım akışı ve
  indirme hatalarının merkezi takibi gelecekte ayrı kapsamdır; eklenmiş sayılmaz.

Ziyaretçi hesapları/favoriler geri eklenmez. Admin yetkisi, API/veri şeması,
Auth/kurallar, oyun runtime'ları, yayımlanmış paketler ve özel paylaşım korunur.
İlk turun ardından kullanıcı geliştirmeye devam ve bitince canlı yayın onayı
verdi. Şimdilik PC kontrolü yapılmaz; yalnız başsız/ayrı profil testleri kullanılır.
Kaynak başlangıç yedeği:
`artifacts/site-refresh/2026-10-14/before/`.

## Sonuç ve canlı kabul

https://kutarya.com üzerinde yalnız Hosting `8856063159d3f95a` yayımlandı.
Önceki sürüm `b13d7b2803ee333a`; kaynak/bulut yedek ve kanıtlar
`artifacts/site-refresh/2026-10-14/` altında. `npm run check` 64/64 test ve
TypeScript/Vite/SEO derlemesi geçti. 12 proje, 23 sitemap URL'si, 24 statik HTML.

Başsız Edge/pipe ve ayrı geçici profil kullanıldı; masaüstü kontrolü veya yeni
HTTP/debug portu yok. Sanal makine kullanıldığı iddia edilmez. Kontrollü servis
kabulü 26 mevcut görünüm/8 eylem grubu ve 48 yeni görünüm/6 eylem grubunu geçti.
Yeni görünümler dört genişlik, üç tema ve dört sayfadır. Galeri ve önizlemenin
mobil/masaüstü ekran görüntüleri ayrıca incelendi.

Gerçek HTTPS'te 24 HTML SHA, 14 genel görünüm, altı eski adres, anonim admin
reddi, yeni filtre/geri geçmişi/mobil arama/galeri/URL sekmesi/eski dosya ayrımı
geçti. Gerçek misafir İndir düğmesinin 3185 bayt ZIP'i manifest SHA'sıyla eşleşti;
Blackjack iframe/play açıldı. Renderer hatası yok. Gerçek yönetici parola girişi,
mail teslimi ve veri kaydetme denenmedi; admin senaryoları kontrollü servisteydi.

Sekiz Functions, katalog/kategori/duyuru/ayar/adres kayıtları, admin/Auth ve canlı
kurallar değişmedi. Hosting manifestindeki 82 mevcut oyun/medya/özel dosya hash'i
öncesi/sonrası aynı; özel paylaşım noindex ve sitemap dışında. IAM değişmedi.
Eski AI385/Desktop102 test klasörleri mevcut değil; çalıştırılmış sayılmaz.
