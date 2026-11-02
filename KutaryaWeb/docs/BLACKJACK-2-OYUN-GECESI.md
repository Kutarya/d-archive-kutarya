# Blackjack Royal Night 2.0 ve Kutarya Oyun Gecesi

21 Ekim 2026. Bu çalışma mevcut Blackjack'i ve paylaşım sitesini geliştirir.
Canlı yayın ayrı onay bekler; eski runtime, paketler, katalog ve ortak hesaplar korunur.

## Konsept

Oyun Gecesi: arkadaşını çağır, bir masa seç, kısa bir mola ver. Sitenin açık,
sıcak ve koyu temaları korunur. Yeni /oyun-gecesi sayfası yalnız mevcut,
yayınlı tarayıcı oyunlarını kullanır; sahte oda/oyuncu/puan tablosu üretmez.
Ana sayfada oyun gecesi vitrini ve oyun seçici bulunur.

Kullanıcının devam isteğiyle `/kesif` eklendi: oyun, günlük iş veya kaynak kod
amacı ve cihaz seçimi; yalnız yayınlı/güncel paket veya depo olanaklarıyla
öneriler. Ana sayfada üç keşif rotası ve gerçek sürüm notlarından kısa kartlar
vardır. `/duyurular` artık mevcut13 projenin gerçek sürüm notlarını, Türkçe
aramayı, tür filtresini, açılır tam notu ve eski duyuruları birlikte sunar.
Yeni bir duyuru/proje veya tarih uydurulmaz; dosya sürümü eşleşmeyen eski
paket, güncel kullanım olanağı sayılmaz.

Royal Night: koyu yeşil keçe, krem kartlar, pirinç çizgiler, büyük serif
başlıklar; mobilde tek sütuna inen masa. Tek kişilik alıştırma, günlük beş
turluk meydan okuma ve 2–5 kişilik ortak dağıtıcılı çevrimiçi masa.
Sanal puan; ödeme, para transferi ve gerçek ödül yoktur.

## Oyun sözleşmesi

- Dört deste; dağıtıcı yumuşak 17 dahil 17'de durur, doğal Blackjack 3:2.
- İlk iki kartta ikiye katla, tek bölme (iki el), bölünmüş aslara tek kart,
  bölünmüş elde 21 normal eldir. İlk elde teslim olunca puanın yarısı iade.
- Çevrimiçi sonuç, deste, sıra, süre, puan ve hamle sunucuda belirlenir.
  Kapalı kart ve kalan deste tur bitene kadar istemciye gönderilmez.
- Sıra 25 saniye; süre dolunca dur. Her hamleye tek kullanımlık sıra kimliği.
- Hesap gerektirmez: Türkçe oyuncu adı, açık/özel masa, kod/davet, hazır olma,
  oda sahibi başlatma, sonuç ve yeni tur. Kopmada 30 saniyelik dönüş payı.
- Odalar bellekte geçici; 45 dakika ve servis yeniden başlatma sınırı.
- Günlük meydan okuma aynı Türkiye tarihli tohumla beş tur; yerel en iyi
  puan, çevrimiçi liderlik tablosu değildir. Sandbox'ta kayıt yoksa oyun sürer.

## Yayın ve kabul

Kaynak games-src/blackjack/{table.html,style.css,core.mjs,client.js}; önceki
index.html 1.x kaynağı olarak korunur. Ayrı blackjack-server mevcut diğer oyun
servislerine dokunmaz. Testler port açmadan çekirdek/gateway ve başsız Edge'de
aynı üretim gateway'ine bağlanan kontrollü WebSocket köprüsüyle yürütülür.
Bu düzenek gerçek internet/Cloud Run kabulü değildir.

## Tamamlanan yerel kabul

- 87/87 birim/kurallar testi; bunun16'sı yeni Blackjack çekirdeği/gateway'idir.
  200 masa/1000 oyuncu elinde rastgele yasal hamlelerle puan bütünlüğü ayrıca
  aynı test takımında ölçülür. TypeScript/Vite ve SEO13proje/26sitemap/27HTML.
- Oyun31 görünüm240–1366px: yardım/oda pencereleri, alıştırma/puan/ipucu,
  beş günlük tur/rekor/aynı tohum, iki ayrı Edge oturumu ve üretim gateway'i
  üzerinden gerçek Türkçe klavye/kod/açık liste/hazır/hamle/aynı sonuç/emoji/
  yeni tur/kopmada dönüş; taşıma yerel kontrollü köprüdür.
- Site51 görünüm:360/390/768/1280 ×3tema ×ana sayfa/oyun gecesi/keşif/günlük;
  gerçek Player ayrıca1280/390/320. Rotada amaç/cihaz/boş sonuç/sıfırlama,
  günlükte13not/tür/Türkçe arama/tam not/korunan tek duyuru, oyun seçicide
  gerçek beş oyun/URL/tekrar önleme geçti. Renderer/ağ hatası0.
- Player sandbox `allow-scripts allow-pointer-lock` kalır; localStorage
  reddedilse de oyun sürer. Davet kodu gerçek Player'dan runtime'a geçer;
  oda, Türkçe klavye ve alıştırmada gerçek hamle çalışır. Kullanıcı önizlemesi
  Blackjack HTML'ini data URL ile gömer; ağsız oynama ayrıca ölçüldü.
- Gerçek ZIP SHA/içerik ve file HTML offline tur geçti. Mevcut ziyaretçi/admin
  regresyonu26 görünüm/8eylem; kontrollü Auth/mail/indirme gerçek servis kanıtı
  değildir. ws8.22.0 audit0. Eski100Hostingdosyası18Ekim manifestiyle aynı.
- Yayın/onay, gerçek bulut/HTTPS/indirme, fiziksel telefon/farklı ağ/yük açık.
  Eski385/102 test dizinleri yoktur; çalıştırıldığı iddia edilmez.

## Yeniden kontrol ve teslim

Tüm Node çağrıları `--require ./scripts/no-listeners.cjs` ile çalıştırılır.

1. `scripts/build-blackjack.mjs`: tek HTML/ZIP ve server konteksi; endpoint
   yoksa dosya adı inceleme sürümüdür. Yayımlanmış public2.0 yolu varsa durur.
2. `scripts/review-blackjack.mjs`:31 oyun görünümü ve üretim gateway'i kabulü.
3. `scripts/review-public-access.mjs --prepare-only --game-night`: güncel gerçek
   katalogdan bağımsız, çalışan site önizlemesi. Kullanıcı dosyasında oyun gömülü;
   `qa-game=1` yalnız QA'nın kontrollü WebSocket adresine geçirir.
4. `scripts/review-game-night.mjs`:51 görünüm ve tüm yeni site akışları.
5. `scripts/review-public-access.mjs --game-night`:26 ziyaretçi/admin regresyonu.
6. `scripts/prepare-blackjack-release.mjs`: gerçek ekranlar/pending katalog
   patch'i; eski dosyalar/sürümler korunur. Canlı hiçbir yere yazmaz.
7. `scripts/document-blackjack-review.mjs`: birim testlerini loglar, geçtiği
   doğrulanan raporlarla teslim sayfası ve kaynak SHA kaydı oluşturur.

Toplu kontroller `npm test`, `npm run build:seo`; yeni oyun `npm run test:blackjack`.
Teslim `artifacts/releases/blackjack/2.0.0/inceleme.html`; çalışan site
`site-review/inceleme.html`; oyun `runtime/index.html`; ZIP `package.json` içinde.

Ölçülen tuzaklar: projects.mjs sonundaki eski sürüm ataması kaldırılır;2.0 ve
runtime yolu birim testinde korunur. Opak data iframe'de crypto.randomUUID
bulunmayabilir; kimlik crypto.getRandomValues ile üretilir. Playwright'ın
serviceWorkers:block enjeksiyonu opak iframe'de SecurityError üretir; bu
servis worker içermeyen düzeneğe eklenmez. React filtre tıklamasından sonra
URL ve sonuç sayısı birlikte beklenir; anlık eski DOM test sonucu sayılmaz.

Onay sonrası yalnız kutarya-ai-3169 / kutarya.com kapsamında ayrı Cloud Run,
runtime, Blackjack katalog/paket ve Hosting yayımlanır. Servis ve revision
min0/max1, yetkisiz runtime hesabı; ortak Functions/Auth/kurallar değişmez.
Gerçek HTTPS ve iki tarayıcı online kabulü yayından sonra ayrıca yapılır.

[Cloud Run WebSocket işletimi](https://docs.cloud.google.com/run/docs/triggering/websockets)
bağlantı maliyeti, zaman aşımı ve yeniden bağlanma sınırlarını açıklar.
[Node crypto](https://nodejs.org/api/crypto.html#cryptorandomintmin-max-callback)
sunucu rastgeleliğinin kaynağıdır. Yük/fiziksel telefon kabulü ayrı tutulur.
