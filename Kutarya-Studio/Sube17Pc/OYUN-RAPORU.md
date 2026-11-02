# Şube 17 — yerel oynanabilir sürüm raporu

12 Eylül 2026 · Çalışma alanı: `D:\Kutarya\Kutarya-Studio\Sube17Pc`

## Başlangıç ve sonuç

Önceki proje splash, ana menü, üç zorluk seçimi ve kapalı sokak girişlerinden
oluşuyordu. Oynanış ve kayıt yoktu. Eski kapı hareketi büyük taban resmin dar
kesitlerini döndürdüğü için açıklıklar siyah şeritler gibi görünüyordu.

Yeni sürüm hazır diyaloglarla oynanabilen banka–akşam–aile–uyku döngüsüdür.
Bu bir bitmiş mağaza oyunu değildir. Ana sistemler yerelde çalışır; içerik,
uzun süreli ekonomi dengesi, ileri karakter animasyonu ve ses prodüksiyonu
tamamlanmayı bekler. Canlı siteye yayın yapılmadı.

## Tamamlananlar

- Ana menü, kurulum, sokak, banka ve ev için kâğıt/mürekkep görsel dili.
  Üç çizimli arka plan, beş aile üyesi ve altı müşteri portresi.
- Tek koordinat sisteminde hizalı beş mekân girişi; bağımsız çift kanatlı
  kapılar, ışık, hover/odak etiketi, hafif yaprak hareketi ve akşam tonu.
- Ev, bar, kazino, eczane, banka ve büfeye giriş. Klavyede sokakta 1–6,
  kontrollerde Tab/Enter ve oyun menüsünde Esc.
- Dört zorluk; başlangıç parası 3000 / 2000 / 1200 / 700 KT.
- Bankada gerçek saniye başına bir oyun dakikası, 09.00–17.00 vardiyası,
  çalışma sırasında çıkış kilidi, tek seferlik maaş ve toplu gün sonu raporu.
- Değişmeyen müşteri gerçeği; kimlik/başvuru/bordro/genelge/görüşme belgeleri,
  dört hazır soru, ONAY/RED damgaları, karar animasyonu ve geri ödeme makbuzu.
- Aile koridoru ve dört oda; kişisel ihtiyaçlar, erzak, hastalık, tedavi,
  ihmal/ayrılma/ölüm sonuçları. Hasta yokken eczane satış yapmaz.
- Bar yalnız stresi azaltır. Büfe erzak satar. Casinoda 52 kartlı blackjack,
  50/100/200 KT bahis, 6:5 doğal blackjack, 17'de duran kasa ve kayıtlı el.
- Her 2–4 günde haber; değişen kredi sınırı, fiyat ve yasaklar; kaçan kredi
  müşterilerinin haberlerde görünmesi. Genelge bankada da okunabilir.
- Nadir rüşvet, kabul sayısıyla artan soruşturma riski; üç günde bir ruhsal
  zar, akıl sağlığı 20'nin üzerindeyken sıfır ölüm riski; oyun sonu/gün rekoru.
- Sürüm ve bütünlük kontrolü bulunan otomatik yerel kayıt, son sağlam yedek,
  Devam Et, kayıt hatasının görünür bildirimi. Ana menü vardiyayı duraklatır;
  oyun içindeki ayarlar vardiya saatini durdurmaz.
- Ses ayarlarında değer sınırı ve disk hatası yönetimi; diyaloglarda odak
  çevrimi ve Escape. Electron IPC/güvenilir belge denetimi, atomik müzik ayarı
  yazımı, dış yönlendirme/yeni pencere engeli. Yeni bağımlılık eklenmedi.

## Prototip denge kararları

Kesinleşmemiş plan sayıları tek motor dosyasında tutuluyor: `src/game/engine.js`.
Adlar, oda dağılımları ve aşağıdaki sayılar prototip tercihleridir.

- Maaş: `900 × doğruluk² × min(dosya/6,1) + min(dosya,18) × 5 × doğruluk`.
  Kolayda 180 KT ek destek. Tek doğru dosya 155, altı doğru dosya 930 KT.
  İlk uygulamadaki tek dosya ile 905 KT alınabilen açık kapatıldı.
- Günlük kredi kuyruğu 12'den başlayıp en çok 22'ye çıkar. İsim/iş/gelir/amaç
  birleşimleri ve dört tutarsızlık ailesi vardır; hikâye çeşitliliği sınırlıdır.
- Rüşvet teklif oranı dosya başına %1,5. İlk kabul riski sıfır; ikinci %12,
  üçüncü %28, dördüncü %42; devamında artar ve %72'de sınırlanır.
- Akıl sağlığı yüksekken iyi durumdadır. 20 ve altında ruhsal risk açılır.
  Bar kalıcı akıl sağlığı hasarını geri çevirmez.
- İlaç satın alma tedaviyi doğrudan uygular. Hastalık 3. günde acil uyarı,
  5. günde tedavisiz ölüm üretir; her gün durum kartında görünür.
- Gıda stoku en çok üç günlüktür. Her gece bir paket tüketilir.

## Doğrulama

- `npm test`: 32 test. Electron/IPC/müzik kaydı için 11; motor için 21.
- Motor testleri 7200 dosyada kararın görünür kanıtlardan türetilebilmesini,
  4 zorlukta 30 günlük simülasyonu, maaşın tekrar alınamamasını, kayıt/yedek
  kurtarmayı, tedavi koşullarını, kart bütünlüğünü ve ruhsal risk eşiğini kapsar.
- `npm run build`: üretim derlemesi. `npm run check:publishability`: 11 varlık
  ve 121 bağımlılık kaydı. Bu kapı kaynak takibidir; hukuki garanti değildir.
- Yerel tarayıcıda yeni oyun, banka belgeleri/soru/ret, gerçek 09.00–17.00
  vardiyası, çıkış kilidi ve maaş raporu görüldü. Ekran görüntüleriyle menü,
  kurulum, ev, sokak ve banka düzenleri kontrol edildi.
- Görsel testlerden sonra kalan bulgular ve paket durumu `work-state.json`
  içinde güncellenir. Electron gerçek donanım FPS/uzun süreli bellek ölçümü,
  temiz Windows kurulum ve mağaza testi yapılmış kabul edilmez.

## Çalıştırma

Geliştirme: `npm run dev`.

Yerel derleme: `npm start`.

Taşınabilir Windows klasörü: `npm run pack:portable`. Oluşan
`builds/Sube17-0.1.0-win-x64/Sube17.exe` açılır; yanındaki dosyalar korunur.
Script mevcut çıktı klasörünü ezmez. Bu imzalı kurulum paketi değildir.
Kayıtlar Electron'un bu uygulamaya ait kullanıcı verisinde tutulur;
tarayıcıdaki deneme kaydı ile Electron kaydı farklı depolardır.

## Kalan işler

1. Kutarya Us ile gerçek yapay zekâ görüşmesi. Bağlantı, mesaj sınırı,
   donanım kontrolü ve maliyet modeli yapılmadı; hazır diyalog kullanılabilir.
2. Her ev odasına özgü çizimler ve bar/eczane/büfe çevre resimleri. Bu
   mekânların işlemleri çalışır; bazıları ortak taban/kod çizimli nesneler kullanır.
3. Karakterin kapıdan yürüyüp sandalyeye oturduğu sprite dizileri; ağız,
   göz kırpma ve duruma göre yüz ifadesi. Şimdilik giriş/nefes hareketi vardır.
4. Daha çok müşteri öyküsü, yalan çeşidi, aile konuşması ve haber sahnesi.
   Portre ve hazır cümleler tekrar eder. Görüşme içeriği bir tam senaryo değildir.
5. Poker ve diğer casino oyunları; gelişmiş eşya/envanter, kayıt yuvası ve
   kullanıcıya dönük dışa/içe aktarma. Mevcut sürüm tek otomatik kayıt/yedek tutar.
6. Uzun oyun seanslarıyla ekonomi/zorluk ayarı; tam erişilebilirlik ve
   yerelleştirme denetimi; temiz Windows üzerinde kurulum/güncelleme testi.
7. İmzalı installer, otomatik güncelleme ve mağaza dağıtımı. `kutarya.com`
   dönüşümü ve yayın bu görevin yerel denemesinden sonraya bırakıldı.

## Eklenecek sesler ve bağlantı yerleri

Mevcut `src/audioEngine.js` müzik/ortam/hover/onay için özgün Web Audio sentezi
kullanır. Aşağıdaki kayıtlar mevcut değildir; profesyonel ses tasarımı listesi
olarak hazırlanmıştır. Ses dosyalarını eklerken kaynak/lisans ve hash kaydı
`asset-provenance.json` içine eklenmeli. Önerilen hedef `public/assets/audio/`.

| Önerilen dosya | Nerede / tetikleyici |
|---|---|
| `street-day.ogg`, `street-evening.ogg` | Sokakta sabah/akşam döngüsü; mekân değişiminde yumuşak geçiş |
| `door-wood-open.ogg`, `door-wood-close.ogg` | Ev/bar kapısının açılıp kapanması; hover'da hız sınırlı |
| `door-bank.ogg`, `door-pharmacy-bell.ogg` | Bankaya girişte ağır menteşe; eczanede küçük kapı zili |
| `footsteps-interior.ogg`, `chair-slide.ogg` | Müşteri giriş/yürüyüş/oturma animasyonuna senkron |
| `paper-turn.ogg`, `folder-place.ogg` | Belge sekmesi değiştirme ve yeni dosya gelişi |
| `stamp-approve.ogg`, `stamp-reject.ogg` | `Bank.stamp` karar animasyonunun temas anı |
| `cash-receipt.ogg` | Geri ödeme tahsil/makbuz; oyuncu kazancı sesinden farklı |
| `shift-close.ogg`, `salary.ogg` | Saat 17.00 raporu ve maaşın bir kez yatırılması |
| `home-roomtone.ogg`, `kitchen.ogg` | Ev odalarında hafif ortam sesi |
| `tv-switch.ogg`, `news-sting.ogg` | Televizyon açılışı ve yeni genelge bülteni |
| `bar-roomtone.ogg`, `cup-place.ogg` | Bar ortamı ve satın alınan dinlenme |
| `cards-shuffle.ogg`, `card-deal.ogg`, `chip.ogg` | Blackjack başlangıcı, kart çekişi ve bahis |
| `dice-roll.ogg`, `dice-land.ogg` | Rüşvet/üç günlük ruhsal kontrol zarında |
| `night-transition.ogg`, `morning.ogg` | Yatak tıklaması/kararma ve yeni gün |
| `family-*.ogg`, `customer-*.ogg` | İsteğe bağlı kısa özgün seslendirmeler; metinler ses olmadan da okunur |

Ses miksajı, cihazda dinleme ve seslendirme doğrulaması yapılmadı.
