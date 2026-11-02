# Kutarya Jenerik — katalog yayını

## Güncel: 1.3.1 — 8 Ekim 2026

https://kutarya.com/proje/kutarya-jenerik; Hosting 0413230d431dbb8a,
önceki 5998163b5783affb. Yeni Setup 254533579 bayt, SHA256
494F592E3BA1E520A3AC7796DEFC8548142B62517DBB7D29A55EEB38196640C0.
Altı gerçek uygulama ekranı ve ayrı şarkı/jenerik açıklamaları güncel.
Eski Setup korunur, güncel sürüm dosyaları ilk sırada gösterilir.

43/43 uygulama birim testi, final portable'da 75/75 kontrol, gerçek
Emel/Ahmet ve yerel MP4/MP3/görüntü/ses ölçümleri geçti. Kayıt başarısızken
taslak ve çıktı klasörü artık değiştirilmez; sürüm paket bilgisinden okunur.
Setup içeriği test edilen uygulamayla aynı; installer çalıştırılmadı.
ElevenLabs taklit servis; canlı YouTube paketli link/üretim kabulü oturum
gereksinimiyle engellendi. Bu sınırlar başarılı diye sunulmaz.

58/58 site testi + build; tam Setup indirmesi ve altı görsel buluttan SHA
ile doğrulandı. Sekiz diğer ürün, sekiz Functions servisi, kurallar ve admin
claim'leri korundu. Geçici IAM yetkisi kaldırıldı, PC'de port açılmadı.
Mevcut europe-west1 gamesService/US-EAST1 bucket; yeni backend veya kural
yayını yok. Hazırlama betikleri sürümü ve gerçek teslim/screenshot yollarını
kullanır. Kanıtlar artifacts/kutarya-jenerik/ ve
D:\KutaryaJenerik\Kanitlar\1.3.1-teslim/.
Canlı 1280/390 px: altı ekran, iki Setup, güncel sürüm ilk sırada;
taşma ve renderer hatası yok. Gerçek İndir düğmesi yeni Setup'ı başlattı.

## 1.2.0 tarihsel yayın

Kullanıcı mevcut Setup dosyasının sitede, resim ve açıklamalarla yayımlanmasını
istedi. Bu kapsam uygulamadaki bekleyen değişiklikleri yapma izni değildir.
Şarkı başına textbox/+ düğmesi, ayrı jenerik, bulunan şarkıyı dinleme ve zorunlu
çıktı adı talepleri bu yayında uygulanmadı; mevcut 1.2.0 paketi aynen kullanıldı.

## Ürün ve dosyalar

- Sayfa: https://kutarya.com/proje/kutarya-jenerik
- Hedef: `kutarya-ai-3169 / kutarya.com`.
- Ürün: `projects-src/kutarya-jenerik.mjs`; Masaüstü / Uygulamalar / Windows.
- Dosya: `Kutarya-Jenerik-Setup-1.2.0.exe`, installer, Windows.
- Kaynak: `D:\KutaryaJenerik\Kutarya Jenerik Setup 1.2.0.exe`.
- Boyut: 225.325.235 bayt.
- SHA-256: `E22F2BF6647A37FA8E0211B5C906FFD79ABC9B8D15F66F557CCA98D88ACC8A58`.
- Dört gerçek 1.2.0 görüntüsü: jenerik/aktörler, fon/geçişler, kontrol/kayıt,
  koyu tema. Önce görsel inceleme, ardından PNG imza/boyut/SHA doğrulaması.
- Görseller: `public/media/projects/kutarya-jenerik/`.
- Uygulamanın 79 kontrolü ve Setup SHA kaydı mevcut yerel kanıtlardan doğrulandı.
  Setup çalıştırılmadı; Windows kurulum/kaldırma kabulü iddia edilmez.

## Mevcut yayın hattı

`prepare-jenerik-site.mjs` gerçek paket ve ekranları kontrol eder.
`backup-jenerik-release.mjs` mevcut Hosting sürümünü ve katalog verisini okur.
`authorize-jenerik-release.mjs` mevcut doğrulanmış gamesAdmin hesabını kullanır;
Auth claim değiştirmez. Gerekli kısa süreli IAM imza izni token oluşunca kaldırılır.
Token yalnız bellekte/child environment'dadır; parola veya kalıcı key istenmez.
`upload-jenerik.mjs` mevcut gamesService dosya/kapak API'lerinden yükler; önceki
sekiz ürünün değişmediğini ve indirme/görsel byte/SHA değerlerini doğrular.

Storage mevcut US-EAST1 bucket'tır; gamesService mevcut europe-west1 servistir.
Hosting SEO helper'ıyla sitemap ve statik ürün/katalog sayfaları yenilenir.
Functions ve Firestore/Storage kuralları yayımlanmaz. Site PC'ye bağlı değildir;
mevcut Firebase planında dosya indirme/depolama maliyeti oluşabilir.
Yerel HTTP, emülatör veya debug portu açılmaz; açık Kutarya Video korunur.

## Kabul

Yerel `npm run check`: 58/58 ve TypeScript/Vite derlemesi geçti.
Yayın tamamlandı: Hosting `5998163b5783affb`, dokuz gerçek proje, 21 statik
React sayfası, 19 sitemap adresi. Ana sayfa kartı ve Masaüstü koleksiyonu canlı.
1280/390 px: dört resim, tek dosya, yatay taşma yok, renderer hatası yok.
Tam bulut indirmesi SHA/boyutla; gerçek İndir düğmesi dosya adı/adresiyle geçti.
Sekiz eski katalog kaydı, sekiz Functions servisi, Firestore/Storage kuralları,
admin claim'leri ve 19 Jenerik kaynak/paket dosyası değişmedi. Geçici IAM izni
kaldırıldı; Setup çalıştırılmadı. Önceki Hosting `03796011d9d93fce` yedeklendi.
Canlı yükleme, Hosting sürümü ve gerçek indirme düğmesi kabul kanıtları
`artifacts/kutarya-jenerik/` altında tutulur; bu klasör Git'ten hariçtir.
`verify-jenerik-site.mjs` gerçek HTTPS üzerinde katalogdaki dokuz ürünü,
1280/390 px görünümü, dört resmi, dosya sekmesini ve gerçek Setup indirme
düğmesini kontrol eder. Tam dosya yükleme kabulünde indirilip SHA ile
doğrulanır; tarayıcıda düğmenin doğru dosyayı başlattığı görüldükten sonra
ikinci büyük transfer iptal edilir. Installer açılmaz.
