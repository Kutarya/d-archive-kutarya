# Kutarya’ya eklenen oyunlar — 5 Ekim 2026

Üç HTML kullanıcı tarafından sağlandı. Masaüstü/Downloads asılları değiştirilmedi;
düzenlenen kaynaklar `games-src/`, tarayıcı paketleri `public/games/` içindedir.
Bu çalışma yalnız yereldir; canlı Hosting, Auth, kurallar ve admin claim’i değişmedi.

| Oyun | Etkin sürüm | Yapılan düzenleme |
| --- | --- | --- |
| Blackjack · Royal Night | 1.0.3 | Sabit 760 px masa kaldırıldı. Kısa ekranda el/puan satırları sıkışır, iki el ve dört hamle birlikte görünür. Animasyonda çift işlem ve sıfırlama yarışı düzeltildi. |
| Rulet · Roulette Noir | 1.0.1 | Çark kare kalır; etiket/top yarıçapı ResizeObserver ile gerçek boyutu izler. Dar ekran masa/çip düzeni iyileştirildi. |
| Kutarya Block Arena | 1.0.0 | Kısa iframe menüsü ve dar ekran harita/ayar panelleri düzenlendi; WebGL/oyun mantığı korundu. |

Blackjack dağıtıcıyı 17’de durdurur, doğal blackjack 3:2 öder. İkiye katlama
ilk iki kart ve yeterli puan ister. Rulet 0–36 ve tek sıfır kullanır; sıfır dış
seçimleri kazandırmaz. İki masa oyununda yalnız sanal puan vardır. Block Arena
üç harita, üç mod, beş silah ve yerel botlar içerir; çevrimiçi çok oyunculu değildir.

Her proje gerçek oyun ekranından kapak, açıklama, kontroller, gereksinimler ve
sürüm notları içerir. Proje sayfasındaki **Oyunu aç** ve **Paketi indir** doğrudan
kullanılabilir. ZIP içinde `index.html` ve Türkçe `OKU.txt` vardır; çıkarılıp
HTML tarayıcıda açılır. Masa oyunlarının harici font bağımlılığı kaldırıldı.
Korumalı iframe’de Block Arena profil kaydı sınırlıdır; kalıcı profil için ayrı
sekmede veya indirilen pakette açılır. Sandbox’a same-origin izni eklenmedi.

## Gerçek kabul

- Üç oyun hem kendi paket adreslerinde hem sitenin iframe alanında açıldı.
- Blackjack dağıtma/durma/ikiye katlama, sonuç ve doğal blackjack ödemesi gözlendi.
  Son sürümün 390×466 görünümünde hamlelerin altı 434 px, viewport 466 px.
- Rulet çip ekleme/geri alma ve tamamlanan dönüş/sonuç geçmişi gözlendi.
  Son sürüm 390 px’de kare çarkla yatay taşma yapmadı; dikey kaydırma normaldir.
- FPS WebGL maçları, botlar, fare sürükleme/ateş/doldurma ve duraklatma gözlendi.
  390 px menü/setup ölçüldü. Her mod/silahın tam maçı, fiziksel telefon ve FPS
  performansı ayrı kabul ister; bunlar yapılmış sayılmaz.
- Üç gerçek tarayıcı indirmesinin ZIP/hash’i hazırlanan dosyayla eşleşti.
  Etkin runtime HTML’leri düzenlenen kaynakla birebir eşleşti.
- 27/27 kod testi (CSS parser ve tur yarışları dahil), 38/38 servis entegrasyonu
  ve üretim derlemesi geçti. Eski silinmiş 385/102 takımlarının sonucu değildir.

Raporlar `artifacts/user-games/*-browser.json`, `download-acceptance.json`,
`local-install.json`; ekranlar `artifacts/screenshots/` altındadır. Yerel ara
paketler katalog/dosya listesinden kaldırıldı; yalnız son sürümler kullanılabilir.

## Google ekranının nedeni

5180 incelemesi Auth emülatörü kullanır. Google düğmesi gerçek Google’a değil,
Firebase’in simüle hesap seçme/ekleme sayfasına gidiyordu. Bu ekran Google hesabı
oluşturmaz. Yerel düğme **Google girişini test et (simülasyon)** olarak değişti;
ne açacağı düğmeden önce açıklanır. Üretim ayarı gerçek Firebase SDK Google
sağlayıcısını kullanır; canlı gerçek hesap/OAuth kabulü henüz yapılmadı.

Doğrudan iletişim ayarı ve uygulama fallback’i **kutaryaai@gmail.com** oldu.

## Yerel veriler yeniden sıfırlanırsa

Önce `scripts/start-local.ps1` ile servisleri aç. Bu bilgisayardaki hazır paket,
ZIP ve kabul raporlarını yeniden kurmak için:

```powershell
node scripts/install-user-games-local.mjs draft
node scripts/install-user-games-local.mjs publish
```

Bu betik yalnız `demo-kutarya-games` emülatörüne yazar; canlıya yayınlamaz.
Auth/Storage kapalıyken Firestore’un tek başına açık kalması tam çalışan ortam
değildir. Yeni emülatör başlangıcında test hesaplarının eski oturumu yenilenir.
Yalnız Storage sıfırlanır, Firestore kalırsa eski dosya/kapak referansları otomatik
onarılmaz; tam yerel veri sıfırlaması sonrası yeniden kurulum veya panelden eksik
dosyaları yeniden yüklemek gerekir. Çalışan inceleme ortamı bu görevde doğrulandı.
Üretime taşıma için `docs/YAYIN.md` kapısı ve gerçek proje/paket kayıtları gerekir;
yalnız Hosting deploy’uyla yerel katalog ve Storage dosyaları canlıya geçmez.
