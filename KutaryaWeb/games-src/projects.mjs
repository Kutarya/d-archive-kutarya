// Kullanıcı oyunları ve talep üzerine geliştirilen Blok Diyarı katalog bilgileri.
const base = {
  category: "oyun",
  kind: "game",
  engine: "web",
  technology: "HTML · CSS · JavaScript",
  platforms: ["web", "windows", "macos", "linux"],
  license: "Kutarya — Tüm hakları saklıdır",
  repository: "",
  gallery: [],
  files: [],
  cover: "",
  status: "draft",
  version: "1.0.0",
  versions: [],
  featured: true,
};
export const userGames = [
  {
    ...base,
    id: "blok-diyari",
    slug: "blok-diyari",
    title: "Kutarya Blok Diyarı",
    subtitle:
      "Kendi dünyanı kur. Derinlere in, kayıp kulenin ışığını yeniden yak.",
    description:
      "Kutarya’nın Minecraft’tan ilham alan özgün, tek oyunculu voxel macerası. Tohumla üretilen 160 × 160 × 64 dünya; orman, ova, kum vadileri, kar zirveleri, mağaralar ve madenler içerir. Hayatta kalma modunda kaynak topla, kazmalar ve kılıç üret, fırında demir erit, tarım yap, barınak kur ve gece gölgelerinden korun. Harabelerdeki işaret kulesini etkinleştirerek keşif hedefini tamamla. Yaratıcı modda sınırsız blok kataloğu ve uçuşla inşa et. Dünya kaydını JSON olarak indirip içe aktarabilir, ZIP içindeki HTML’yi çevrimdışı oynayabilirsin. Bu bir başlangıç sürümüdür; resmi Minecraft değildir ve çevrimiçi çok oyunculu içermez.",
    tags: ["Voxel", "Hayatta kalma", "Yaratıcı", "Keşif", "Çevrimdışı"],
    version: "0.1.0",
    technology: "HTML · CSS · JavaScript · WebGL",
    color: "#69854e",
    devices: ["desktop", "mobile"],
    controls:
      "WASD hareket, Space zıpla/yüz, Shift koş; sol tık kaz/saldır, sağ tık yerleştir, 1–9 veya tekerlek hızlı yuva, E çanta/üretim, F etkileşim, R yemek, M hedefler, Esc menü. Yaratıcı modda V uçuş, Space yüksel, Q alçal. Fare kilidi alınamazsa basılı tutup sürükleyerek bak. Ayarlarda dokunmatik düğmeler açılabilir.",
    requirements:
      "WebGL ve donanım hızlandırması destekleyen güncel tarayıcı. Klavye/fare önerilir. Düşük yük için yakın görüş ve tasarruf çözünürlüğü seç. Site iframe’inde otomatik kayıt kısıtlıdır: JSON kaydını indir veya ayrı sekmede aç. Fiziksel telefon performansı henüz ölçülmedi.",
    changelog:
      "0.1.0 · İlk oynanabilir sürüm. Tohumlu arazi, chunk çizimi, blok etkileşimleri, 27 yuvalı envanter, 15 tarif, kazma dayanıklılığı, fırın, tarım, gece/gündüz, yaratıklar, kamp/harabe, hedefler, yaratıcı uçuş, kayıt içe/dışa aktarma ve çevrimdışı paket.",
    difficulty: "Keşif ve hayatta kalma",
    duration: "Serbest dünya",
    order: 3,
  },
  {
    ...base,
    id: "blackjack",
    slug: "blackjack",
    title: "Blackjack · Royal Night",
    version: "2.0.0",
    subtitle: "Bir kart daha? Arkadaşlarla aynı masada, Royal Night’ta buluş.",
    description:
      "Kutarya Oyun Gecesi’nin yeşil keçeli kart masası. Tek kişilik alıştırma yap, Türkiye tarihine göre yenilenen beş turluk günlük meydan okumayı tamamla veya 2–5 arkadaşınla aynı dağıtıcıya karşı oyna. Hesap açmadan isim seç, açık ya da özel masa kur, kod veya davet bağlantısını paylaş. Herkes puanını seçip hazır olur; masa sahibi başlatır. Online deste, kapalı kart, sıra, 25 saniyelik süre ve puan sunucudadır. Kart çek, dur, ilk iki kartta ikiye katla, eşit değerli kartları iki ele böl veya teslim olup yarısını geri al. Dört deste; dağıtıcı yumuşak 17 dahil 17’de durur, doğal Blackjack 3:2 öder. Bölünmüş aslara birer kart, bölünmüş 21’e normal ödeme uygulanır. Tur geçmişi, öğretici ipuçları, ses ve masa tepkileri vardır. Başlangıç 1000 sanal puan; gerçek para, ödeme veya ödül yoktur. Tek HTML’lik ZIP alıştırma ve günlük modda çevrimdışı çalışır; online internet ister. Odalar geçicidir, 45 dakikayla sınırlıdır; kopmada 30 saniye dönüş denenir, servis yenilenince oda kapanabilir. Günlük en iyi sonuç yalnız bu tarayıcıda saklanır; herkese açık sıralama değildir.",
    tags: ["Kart", "Blackjack", "Online", "Arkadaşlarla", "Günlük", "Çevrimdışı"],
    color: "#127452",
    devices: ["desktop", "mobile"],
    controls:
      "H kart çek, S dur, D ikiye katla, P eli böl. İlk iki kartta teslim olabilirsin. Puanını turdan önce seç. Online: adını yaz, masa kur/kodla katıl veya açık masa bul; herkes Hazırım der, masa sahibi Kartları dağıt’a basar. Süre 25 saniye; dolunca otomatik durulur. Yeni turu masa sahibi açar. Tek kişilik ve günün beş turu internetsiz çalışır.",
    requirements:
      "Güncel Chrome, Edge, Firefox veya Safari. Dokunmatik/klavye; online için internet ve WebSocket erişimi gerekir. Korumalı site alanında yerel günlük kayıt ve clipboard kısıtlanabilir; ayrı sekmede kullanılabilir. Odalar ve puanlar kalıcı hesap değildir. Fiziksel telefon, farklı internet ağları ve yüksek oyuncu yükü ayrıca kabul ister.",
    changelog:
      "2.0.0 · Royal Night masa tasarımı; mobil kartlar, ses, ipuçları, tur geçmişi. El bölme, bölünmüş aslar, teslim ve ilk elde ikiye katlama. Günün beş turluk meydan okuması ve tarayıcıya özel en iyi sonuç. Hesapsız 2–5 kişi online açık/özel masa, kod/davet, hazır olma, sıra süresi, sunucu doğrulaması, kopmada dönüş ve yeni tur. Eski 1.0.3 paket/runtime Dosyalar bölümünde korunur.",
    difficulty: "Kolay başlangıç",
    duration: "Kısa turlar",
    order: 0,
  },
  {
    ...base,
    id: "rulet",
    slug: "rulet",
    title: "Rulet · Roulette Noir",
    subtitle: "Kırmızı, siyah veya bir sayı. Çarkın sonucunu takip et.",
    description:
      "Kutarya’nın Avrupa ruleti simülasyonu. 0–36 çarkında sayı, renk, tek/çift, düzine veya sütun seç; sonucu ve tur geçmişini takip et. 1000 sanal oyun puanı ile oynanır; gerçek para, ödeme veya ödül yoktur. Çipleri geri alabilir, masayı temizleyebilir ve yeni bir tur başlatabilirsin. ZIP paketindeki index.html tek başına çevrimdışı açılır.",
    tags: ["Rulet", "Masa oyunu", "Çevrimdışı"],
    color: "#a77729",
    devices: ["desktop", "mobile"],
    controls:
      "Çip miktarını seç, sayı veya dış seçimlerden birine dokun. ÇARKI DÖNDÜR ile sonucu bekle. Geri al son çipi, temizle mevcut tur seçimlerini iade eder. Çark dönerken seçimler kilitlidir.",
    requirements:
      "Güncel Chrome, Edge, Firefox veya Safari. Dokunmatik ve fare desteği. Küçük ekranlarda masa aşağı kaydırılabilir.",
    changelog:
      "1.0.0 · Kutarya kütüphanesine ilk ekleme. Gerçek boyutu izleyen çark/top/etiketler, mobil masa ve çip düzeni, çevrimdışı fontlar.",
    difficulty: "Kolay başlangıç",
    duration: "Kısa turlar",
    order: 1,
  },
  {
    ...base,
    id: "pixelgun",
    slug: "pixelgun",
    title: "Kutarya Block Arena",
    subtitle:
      "Adını seç, arkadaşlarınla online çatış. Odanı kur, arenaya gir.",
    description:
      "Kutarya’nın voxel FPS oyunu 2.1 ile online hareket ve kimlik akışını geliştirdi. Oyuncu adını odaya girmeden seç, odada veya maç menüsünde değiştir; aynı odada çakışan adlar ayrılır. Hareket, zıplama ve atılma yerelde hemen gösterilir, sunucu doğrulamasıyla uzlaştırılır. Diğer oyuncuların hareketi durum örnekleri arasında akıcı çizilir; daha küçük ağ paketleri ve ölçülen ping göstergesi kullanılır. Işıklandırma, yüzey detayları, sis, şehir silueti ve efektlerle üç arenada savaş. Beş silah, mühimmat/sağlık/zırh, koşu enerjisi ve atılma kullan. Online Oyna’dan hesap açmadan oda oluştur, altı karakterli kodu paylaş; 2–8 oyuncuyla serbest veya takım çatışması oyna. Hareket, mermi, hasar ve skor bulut sunucusunda doğrulanır. Kısa bağlantı kesintilerinde aynı oturuma otomatik dönüş ve rövanş vardır. Oda geçicidir; sunucu yeniden başladığında kapanır. Botlarla Oyna ve ZIP içindeki HTML bot modunda çevrimdışı çalışır; online mod internet ister. Profil/ayar kaydı ayrı sekmede veya indirilen HTML’de kullanılabilir; site içindeki korumalı alan yerel kaydı kısıtlar.",
    tags: ["FPS", "Voxel", "Online", "Arkadaşlarla", "Botlar"],
    version: "2.1.0",
    technology: "HTML · CSS · JavaScript · WebGL",
    color: "#397f70",
    devices: ["desktop", "mobile"],
    controls:
      "WASD hareket, fare bakış/ateş, sağ tık yakın nişan, Shift koş, Q atıl, Space zıpla, R doldur, 1–5 silah, G bomba, Tab skor, Esc menü. Online maç menü açıldığında devam eder. Online Oyna’dan oda oluştur veya kodla katıl; maçı oda sahibi başlatır. Dokunmatik kontroller Ayarlar’dan açılır. Fare kilidi alınamazsa basılı tutup sürükleyerek bakabilirsin.",
    requirements:
      "WebGL destekleyen güncel Chrome, Edge veya Firefox. Masaüstünde klavye/fare önerilir. Online için internet ve WebSocket erişimi gerekir. İlk servis sınırlı oda kapasitesindedir; yoğunlukta yeniden deneme gerekir. Fiziksel telefon, farklı internet ağları ve yüksek oyuncu yükü kabulü henüz ölçülmedi.",
    changelog:
      "2.1.0 · Oyuncu adını odaya girmeden, lobide ve maç menüsünde değiştirebilirsin. Türkçe adlar desteklenir; aynı odadaki aynı adlara numara eklenir. Hareket, zıplama ve atılma daha çabuk tepki verir; diğer oyuncuların hareketleri yumuşatıldı. Silah sesi ve geri tepme anında başlar; isabet ve skor sunucuda doğrulanır. Online paketler küçültüldü. Ping ve bağlantı dalgalanması görünür; başlangıç silahını seçebilirsin. Üç harita, beş silah ve çevrimdışı bot/dalga modları korunur. Eski 1.0.0 ve 2.0.0 paketleri Dosyalar’da bulunur.",
    difficulty: "Aksiyon",
    duration: "Moduna göre",
    order: 2,
  },
].map((g) => {
  if (g.id === "rulet") g.version = "1.0.1";
  g.changelog = g.changelog.replace(/^1\.0\.0/, g.version);
  return { ...g, runtime: `/games/${g.id}/${g.version}/index.html` };
});
