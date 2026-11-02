# Kutarya Mobile 1.2.0 — canlı yayın kabulü

10 Ekim 2026. Kullanıcı yerel APK tesliminden sonra “Siteye yayınla” dedi.
Canlı sayfa: https://kutarya.com/proje/kutarya-mobile.

- Firebase project/Hosting kutarya-ai-3169 / kutarya.com.
- Hosting ba161f8b5c0458d6; önceki f57f0560937b8525 yedeklendi.
- Mevcut gamesService europe-west1 ve
  kutarya-ai-3169.firebasestorage.app Storage US-EAST1 kullanıldı.
  PC bağımlılığı yok; trafik/depolama mevcut ücretli plana tabidir.
- 1.2 APK: 13.134.468 bayt, aynı release sertifikası; SHA256
  371633E3CA4AA1E62EE36E5911EC5E5730FE49F237AB4ADD7B4A8245EC613500.
- 1.2 kaynak ZIP: 177.608 bayt / 62 dosya; SHA256
  71840129DDB6F626FC6B3FFC458B424BAF3F4629D7F24E4C2B8E866815E2CF57.
  Teslim ZIP'i değişmeden yayımlandı. İmza/API sırrı, araç/cache/build,
  kişisel veri ve model ağırlıkları kaynak paketine girmez.
- Dört gerçek emülatör ekranı: son imzalı release ana ekranı ve konuşması,
  koyu ana ekran ve klavye açık not formu. Katalog açıklaması, kurulum
  bilgisi ve sürüm notu 1.2'ye güncellendi.
- 1.1 APK/kaynak kayıtları ve dosyaları korunur. Dosyalar sekmesinde
  yeni iki dosya başta, eski iki dosya aşağıda gösterilir.

## Ölçülen kabul

Mevcut Firebase CLI oturumu ve doğrulanmış gamesAdmin hesabı kullanıldı.
Geçici TokenCreator izni kısa ömürlü token üretildikten sonra, yüklemeden
önce kaldırıldı. Önce/sonra IAM bağları aynı. Parola, servis hesabı
anahtarı veya Secret Manager payload'ı okunmadı; yerel port açılmadı.

Site 58/58 test + TypeScript/Vite build geçti. Eski AI server/desktop test
dizinleri yoktur; o takımlar çalıştırılmış sayılmaz. Güncel frontend ve
deploy kaynak hash'leri önceki 1.1 Hosting yayınıyla aynı.

Yalnız Mobile katalog/slug/dosya/görsel kayıtları ve SEO Hosting yayımlandı.
Diğer 11 proje, sekiz Functions, Firestore/Storage ruleset'leri, ortak Auth
yapılandırması ve admin UID/claim'leri aynı. Toplam 12 proje korunur.
Hosting 89 dosya; SEO 24 HTML / 23 sitemap URL'si.

Gerçek HTTPS üzerinden 24 HTML'in SHA'sı derlemeyle eşleşti. Sitemap,
robots, canonical, eksik JS404 ve anonim admin401/UNAUTHENTICATED geçti.
Gerçek Edge pipe1280/390 px'te katalog kartı sayfayı açtı; dört görsel
yüklenip decode edildi. Yatay taşma ve renderer hatası0.
Gerçek Dosyalar/İndir düğmeleriyle yeni iki ve eski iki paket tamamen
indirildi; ad/bayt/SHA256 yerel manifestlerle eşleşti. Yeni sürüm başta.

Kanıt: artifacts/releases/kutarya-mobile/1.2.0/ altında before/after.json,
cloud-acceptance.json, site-check.log, upload.log, hosting-deploy.log,
live-check.log, live-acceptance.json ve canli-*.png.
Paket manifesti, kaynak denetimi, yükleme ve IAM temizleme:
artifacts/kutarya-mobile/1.2.0/.

## Tekrar yayın ve geri dönüş

mobile-release-paths.mjs her sürümü ayrı kanıt/paket/görsel dizinine alır.
prepare-mobile-site.mjs teslim hash'lerini ve kaynak allowlist'ini doğrular;
authorize-mobile-release.mjs / upload-mobile.mjs mevcut admin/Storage
hattını kullanır. Aynı sayıda yeni görsel varsa da hash karşılaştırılır;
eski ekranlar sırf sayıları aynı diye yeniden kullanılmaz.
mobile-release-audit.mjs before/after eski dosyaların tüm alanlarını korur;
verify-mobile-live.mjs yeni ve eski dosyaları gerçek düğmelerle indirir.

1.1 ve artık 1.2 APK/kaynak ZIP'leri yayımlanmış sabit paketlerdir.
Yayın/devir belgelerindeki sonraki değişiklikler için yeniden paketleme
yapılmaz. Aynı sürüme farklı byte koyma. prepare bu sürümün teslim
denetimi/count/version kapısına bağlıdır; yeni sürüm yeni kabul ister.
Hosting geri alma Mobile katalog/Storage değişikliğini geri almaz.
Önceki Mobile kaydı before.json ve production-before.json içindedir;
eski dosyalar durduğu için önceki sürüm metadata'sı ayrıca geri seçilebilir.

Bu iş site/indirme kabulüdür. Android ürün kabulü
D:/KutaryaMobile/docs/KABUL-1.2.md içindedir: 62 JVM + 32 Android test,
aynı imzalı güncelleme ve konuşma kalıcılığı. Fiziksel ARM64 telefon,
gerçek Türkçe ASR/TTS, hat/donanım/üçüncü uygulamalar ve canlı AI kalitesi
henüz doğrulanmadı; Play Store yayını yapılmadı.
