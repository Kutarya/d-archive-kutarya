# Kutarya Mobile 1.1 — canlı yayın kabulü

Sonraki 1.2 yayını tamamlandı:
[Kutarya Mobile 1.2 yayın kabulü](KUTARYA-MOBILE-1.2-YAYIN.md).
Bu dosya önceki 1.1 paketinin tarihsel kabulünü korur.

10 Ekim 2026. Kullanıcı tamamlanmış 1.1 için “Sitede yayınla” dedi.
Canlı sayfa: https://kutarya.com/proje/kutarya-mobile.

- Firebase project/Hosting: kutarya-ai-3169, kutarya.com. Yeni Hosting
  f57f0560937b8525; önceki43f73b57e6eb7708.
- Mevcut gamesService europe-west1; Storage
  kutarya-ai-3169.firebasestorage.app, US-EAST1. PC bağımlılığı yok.
  Depolama/indirme trafiği mevcut ücretli Firebase planında maliyet oluşturabilir.
- APK: Kutarya-Mobile-1.1.0.apk, 13.085.316 bayt.
  SHA256 089136858EE2327D18CC086908BA6B8F446E0C3275CFC38AA7045DB87AE6137E.
- Kaynak: Kutarya-Mobile-1.1.0-Kaynak.zip, 146.803 bayt.
  SHA256 B0AF71DD13B36B1C0A5FE9A910B51E38F98EF231EF2EBBFB728CA9B1343E92C6.
- 50 dosyalı kaynak allowlist'i kontrol edildi; dosya SHA'ları teslim ile aynı.
  İmza/API sırrı, .secrets/.tools/build/cache/kullanıcı verisi ve model ağırlığı yok.
  Kapak/galeri gerçek uygulamanın açık/koyu ekranlarıdır.

## Kontroller

Mevcut CLI ve doğrulanmış gamesAdmin hesabı kullanıldı. Custom token yalnız
bellekte kaldı; geçici IAM imza izni yüklemeden önce kaldırıldı. Öncesi/
sonrası IAM bağları aynı. Parola/Secret Manager payload'ı okunmadı ve
yerel sunucu/port açılmadı.

Site 58/58 test + TypeScript/Vite build geçti. Eski AI server/desktop
test klasörleri yok; o testler çalıştırılmış sayılmaz. Mevcut frontend
kaynak hash'leri önceki 9 Ekim canlı yayınla aynı.

Canlı katalog 12 proje; diğer 11 kayıt, sekiz Functions, Firestore/Storage
kuralları, admin claim'leri ve Auth yapılandırması aynı. Yalnız Mobile
katalog/slug/dosya/görsel kayıtları ve SEO Hosting yayımlandı.

SEO 24 HTML / 23 sitemap URL'si. Gerçek HTTPS'te tüm HTML SHA'ları derlemeyle
aynı, sitemap/robots aynı, Mobile canonical/sitemap kaydı var. Eksik JS404,
anonim admin API401/UNAUTHENTICATED. Gerçek Edge pipe1280/390 px'te katalog
kartı sayfayı açtı, görseller decode edildi, taşma/renderer hatası yok.
Gerçek Dosyalar ve İndir düğmeleriyle iki paket tamamen indirildi; ad/bayt/
SHA256 yerel teslim ile eşleşti.

Kanıt: artifacts/release-2026-10-10-kutarya-mobile/ altında before/after.json,
cloud-acceptance.json, upload.log, hosting-deploy.log, live-check.log,
live-acceptance.json ve canli-*.png. Manifest/yükleme kabulü artifacts/kutarya-mobile/.

## Devam ve geri dönüş

projects-src/kutarya-mobile.mjs ve prepare-mobile-site.mjs manifesti hazırlar.
authorize-mobile-release.mjs / upload-mobile.mjs mevcut admin/Storage hattı;
mobile-release-audit.mjs before/after yedek/karşılaştırma, verify-mobile-live.mjs
gerçek canlı kabulüdür. Hosting deploy-release.mjs hosting ile yayımlandı.
Bu betikler gelecek yayın için kullanıcı onayı sayılmaz.

1.1 APK/kaynak ZIP yayımlanmış sabit dosyalardır. Devir/yayın belgesi
değişikliği için aynı sürüm arşivini yeniden paketleyip üzerine yazma;
sonraki kod sürümü yeni dosya adı ister. Hosting geri alma yeni katalog/
Storage kaydını geri almaz. Arşivleme önceden verilmiş indirme bağlantısını
iptal etmez; tam geri çekme ayrıca dosya/anahtar işlemi ister.

Fiziksel ARM64 telefon, mikrofon/TTS, fener, gerçek üçüncü uygulama/AI
kabulü önceki açık sınırlar olarak korunur. Bu iş site/indirme kabulüdür;
Play Store yayını veya fiziksel kurulum testi değildir.
