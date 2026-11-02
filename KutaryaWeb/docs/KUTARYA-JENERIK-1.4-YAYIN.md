# Kutarya Jenerik 1.4.0 — canlı yayın

18 Ekim 2026. [Ürün sayfası](https://kutarya.com/proje/kutarya-jenerik) ve [dosyalar](https://kutarya.com/proje/kutarya-jenerik?sekme=dosyalar) güncellendi. Kurulum ve taşınabilir EXE yayımlandı; önceki 1.2.0 ve 1.3.1 Setup dosyaları korunur.

## Yayımlanan paketler

| Dosya | Bayt | SHA-256 |
|---|---:|---|
| Kutarya-Jenerik-Setup-1.4.0-r2.exe | 225.363.910 | `4a5b73894576f6daacce89067e60499ff5c79254000b267b920ab624f7452b64` |
| Kutarya-Jenerik-1.4.0.exe | 202.505.900 | `959e9f56b2d4bd6e0e4623e65c841239d200298013da21dbe8f9e2079378a679` |

Ana indirme düğmesi güncel Setup’ı seçer; taşınabilir dosya Dosyalar sekmesindedir. Ekran görüntüleri gerçek 1.4.0 kabulünden gelir; hesap/kota görüntüsü örnek veridir.

## Kurulum koruması

Yayın paketindeki r2, eski sürümün uygulama klasöründeki Veriler ve Ciktilar alanlarını eski kaldırıcı çalışmadan önce kalıcı bir yedeğe kopyalar. Eski dosya yollarını korur, boş yeni veri alanını hazırlar ve mevcut yeni sürüm verilerini ezmez. Uygulama açıksa zorla kapatmadan durur. Altı senaryo gerçek NSIS kancalarıyla ayrı test klasörlerinde geçti. Kullanıcının açık uygulaması yönetilmedi; gerçek r2 Setup bu bilgisayardaki asıl kurulum üzerinde test amacıyla çalıştırılmadı.

Uygulama kodu önceki kabulden geçen 1.4.0’dır: arşivden çıkarılan 136 uygulama/araç dosyası eşittir. Önceki teslimler değiştirilmedi. [Güncellenmiş kaynak ZIP](C:/Users/yunus/Documents/Codex/2026-10-18/im/outputs/Kutarya-Jenerik-1.4.0-Web-Yayini/Kutarya-Jenerik-1.4.0-Kaynak-r2.zip), [kurulum koruması kabulü](../artifacts/releases/kutarya-jenerik/1.4.0/installer-acceptance.json), [paket kabulü](../artifacts/releases/kutarya-jenerik/1.4.0/r2-package-acceptance.json). Kaynak ZIP bu görevde yalnız yerel teslim olarak saklandı.

## Canlı kabul

- Site: 64/64 birim testi ve TypeScript/Vite build geçti. 12 proje, 23 sitemap URL’si ve 24 statik React sayfası üretildi.
- 24 canlı HTML dosyasının SHA’sı derlemeyle eşleşti; canonical, sitemap ve robots doğrulandı.
- 1280 ve 390 px başsız Edge kontrollerinde güncel iki dosya, önceki iki dosya ve dört görsel doğrulandı. Yatay taşma ve renderer hatası yok.
- Her iki yeni EXE, sitedeki gerçek İndir düğmesinden tamamen indirildi; boyut ve SHA-256 yayımlanan kaynakla eşleşti. İndirilen Setup çalıştırılmadı.
- Eski iki Setup bağlantısı HTTP 200 ve beklenen dosya boyutunda; katalogdaki eski dosya kimlikleri/generation değerleri değişmedi.
- Diğer 11 proje, sekiz Functions servisi, Firestore/Storage kuralları, ortak Auth/admin claim’leri ve 82 eski Hosting medya/oyun/özel dosyası korundu. Geçici IAM izni eski durumuna döndü. PC sunucusu veya debug portu açılmadı.

Kanıtlar: [canlı site](../artifacts/releases/kutarya-jenerik/1.4.0/live-site-acceptance.json), [bulut](../artifacts/releases/kutarya-jenerik/1.4.0/cloud-acceptance.json), [yükleme](../artifacts/kutarya-jenerik/1.4.0/production-upload.json), [yayın kaydı](../artifacts/releases/kutarya-jenerik/1.4.0/release-receipt.json), [masaüstü](../artifacts/releases/kutarya-jenerik/1.4.0/canli-jenerik-1280.png), [mobil indirmeler](../artifacts/releases/kutarya-jenerik/1.4.0/canli-dosyalar-390-son.png). Mobil kabul fiziksel telefon testi değildir; canlı ElevenLabs üretimi bu yayında yapılmadı.

## Geri dönüş kaydı

Yeni Hosting: `sites/kutarya-ai-3169/versions/6cdaeae4c630d99a`. Önceki Hosting: `sites/kutarya-ai-3169/versions/8856063159d3f95a`. Katalog/config/IAM yedeği `D:/Kutarya/KutaryaWeb/artifacts/releases/kutarya-jenerik/1.4.0/before.json` içindedir. Hosting geri alma katalog/Storage’ı geri almaz; gerektiğinde önceki Jenerik kaydı ayrıca seçilir. Eski dosyalar silinmedi.
