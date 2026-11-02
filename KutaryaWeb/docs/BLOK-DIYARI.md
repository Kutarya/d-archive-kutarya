# Kutarya Blok Diyarı — 0.1.0

Kullanıcının Minecraft tarzında geniş, mekanikli bir oyun talebi üzerine yapılan
özgün web oyunu. Başka Unity projesi veya Minecraft/Mojang varlıkları kullanılmadı.
Mevcut üç oyun korunarak dördüncü proje olarak yalnız yerel kataloğa eklendi.

## Oynanabilir kapsam

- Tohumlu 160 × 160 × 64 dünya; ova, orman, kum vadisi, kar zirveleri,
  mağaralar ve kömür/demir/kristal cevherleri. Sonlu, tek oyunculu.
- WebGL chunk çizimi; açık blok yüzleri, görüş/çözünürlük ayarları,
  prosedürel piksel dokuları, yarı saydam su ve güne göre ışık/sis rengi.
- Kazma/yerleştirme, çarpışma, zıplama, koşma, yüzme, düşme/boğulma hasarı.
- 27 çanta yuvası, 9 hızlı yuva, 15 tarif; kazma kademesi/aşınma, kılıç,
  tezgâh, yakıt tüketen zamanlı fırın, yiyecek ve pusula yönlendirmesi.
- Tarım: tohum ekme, 80 oyun saniyesinde buğday büyümesi ve hasat.
  Açlık/can yenilenmesi; gece/gündüz, nötr karakterler, saldıran gece gölgeleri.
- Yatakla sabaha geçme, kampta envanter korunarak yeniden doğma.
  Kamp, kulübe ve harabe sandıkları; 5 demir + 3 kristalle kule etkinleştirme.
- Yaratıcı modda sınırsız katalog/uçuş. Türkçe dünya formu, menü, çanta/üretim,
  hedefler, duraklatma, rehber ve görüntü/ses ayarları.
- Otomatik yerel kayıt, JSON dışa/içe aktarma; tohum, değişiklikler, envanter,
  oyuncu ve yarım fırın işi korunur. Sandbox'a same-origin eklenmedi;
  site iframe'inde JSON yedek veya ayrı sekme kullanılır.

Başlangıç sürümünde sonsuz dünya, çok oyunculu, redstone veya tam Minecraft
mekanik seti yoktur. Meşaleler parlak bloklardır; dinamik çevre ışığı yaymaz.
Yaratıklar ve su basit simülasyonlardır; sıvı akışı/hayvan yetiştirme yoktur.

## Kaynak ve paket

`games-src/blok-diyari/core.mjs` kurallar; `renderer.mjs` WebGL;
`game.mjs` oynanış/UI; `template.html` menüler/CSS.
`node scripts/build-blok-diyari.mjs` çevrimdışı tek `index.html` üretir.
Harici motor/font/doku isteği yok. Build `artifacts/user-games/blok-diyari-build/`;
runtime `public/games/blok-diyari/0.1.0/`, immutable hash/bytes manifest içerir.

ZIP `index.html` + `OKU.txt` içerir; 28.704 bayt. Gerçek tarayıcı ZIP indirmesi
kaynakla SHA256 eşleşti:
`C041A3062A1A20A114E1F03815BE87969F349C346D8DBB0BF70F1D7AA06645B0`.
Kapak `public/media/games/blok-diyari.jpg` gerçek oyun ekranıdır.

Hazır paket/kabul raporu varsa yalnız yerel yeniden kurulum:

```powershell
node scripts/install-user-games-local.mjs draft --game=blok-diyari
node scripts/install-user-games-local.mjs publish --game=blok-diyari
```

Installer yalnız demo-kutarya-games ve localhost'a yazar. Canlı Hosting,
Functions, kurallar, claims ve provider değişmedi. Yayın için `YAYIN.md`
geçerlidir; yerel katalog/Storage otomatik canlıya taşınmaz.

## Gerçek kabul

- Hayatta kalma dünyası, tahta/çubuk/kazma üretimi, kazma/yerleştirme gözlendi:
  hedef panelinde 1 kazma, 1 yerleştirme, 4 üretim. Gece can azalması gözlendi.
- Reload devamı ve gerçek indirilen JSON'un UI dosya seçiciyle yüklenmesi
  envanter/ilerlemeyi korudu. Final runtime'da yaratıcı uçuş 31'den 37'ye çıktı;
  katalogdan taş tuğla alındı. Site iframe'inde dünya ve tahta üretimi çalıştı.
- 390 × 466: menü kaydırılabilir, yatay scroll390; hızlı yuvalar 7,8–382,6,
  alt459,4. Çanta client/scroll346; yatay taşma yok.
- 34/34 kod testi (7 yeni dünya/envanter/raycast/kayıt/paket testi), 38/38 servis
  entegrasyonu, build geçti. Eski silinmiş 385/102 takımlarının sonucu değildir.
- Tam hayatta kalma zinciri, her mekanik, fiziksel telefon ve FPS ölçümü açık.
  İndirilen file:// HTML'nin UI açılışı IAB protokol politikasıyla engellendi;
  HTTP runtime çalıştı, ZIP içerik/hash doğrulandı. Doğrudan file:// kabulü değildir.

Kanıt: `artifacts/user-games/blok-diyari-browser.json`, indirilen JSON/ZIP,
`artifacts/screenshots/blok-diyari-site-final.jpg`. Dünya kaydı sunucuya yüklenmez.
Auth/Google bu görevde değiştirilmedi.

API referansları:
https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData
ve https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API.
