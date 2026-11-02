# Kutarya — projeler ve deneyimler

React/TypeScript/Vite paylaşım platformu; Firebase Auth, sunucu yetkili admin,
Functions ve Storage. Oyunlar, masaüstü uygulamaları, web projeleri, mobil
uygulamalar, kaynak kod ve araçlar aynı katalogdadır. Temel kurulum boş başlar;
kullanıcının üç gerçek oyunu ve talep üzerine geliştirilen Blok Diyarı yerel
incelemeye eklendi. Analiz/paketler: [Kullanıcı oyunları](docs/KULLANICI-OYUNLARI.md)
ve [Blok Diyarı](docs/BLOK-DIYARI.md). Gerçek C# Windows Forms okul projesi
[Kutarya OS 0.3.0](docs/KUTARYA-OS.md) de kurulum, taşınabilir paket, kaynak
kodu ve uygulama görüntüleriyle yerel masaüstü kataloğuna eklendi.
[Kutarya Convert 1.0.0](docs/KUTARYA-CONVERT.md) gerçek görsel, belge/PDF,
tablo ve ses dönüşümleriyle Araçlar kataloğundadır. Çoklu dosya, PDF işlemleri,
toplu ZIP, dört görünüm; çevrimdışı web paketi ve ayrı kaynak ZIP'i vardır.

9 Ekim 2026: Ziyaretçi hesabı/kayıt, kişisel kütüphane ve favoriler şimdilik
kaldırıldı. İnceleme, indirme ve oynama açık erişimdedir. Yönetim girişi
`/admin/auth/login`; yalnız mevcut yetkili hesaplar içindir. Eski ziyaretçi
adresleri kataloğa yönlenir. Mevcut yönetici reset e-postalarının `/auth/action`
bağlantıları sorgu parametreleri korunarak yeni yönetim sayfasına aktarılır.
Ortak Firebase hesapları ve önceki profil verileri silinmedi; hesap uçları
sunucuda korunur. Kullanıcının açık onayıyla bu değişiklik kutarya.com'da
Firebase Hosting sürümü `43f73b57e6eb7708` olarak yayımlandı.

Port açmadan gerçek React/Provider incelemesi ve tarayıcı kabulü:
`node --require ./scripts/no-listeners.cjs scripts/review-public-access.mjs`.
Genel katalog/görseller canlıdan salt okunur alınır; giriş, mail, indirme ve
oyun servisi kontrollü taklittir. İnceleme ve kanıtlar
`artifacts/release-2026-10-09-public-access/` altında; canlı kabul sayılmaz.

Gerçek HTTPS kabulü:
`node --require ./scripts/no-listeners.cjs scripts/verify-public-access-live.mjs`.
23 canlı HTML derlemeyle eşleşti; 1280/390 px, eski adresler, anonim admin
reddi, gerçek misafir indirme boyut/SHA'sı ve oyun runtime açılışı geçti.
Gerçek yönetici parola girişi ve mail teslimi bu kabulde ölçülmedi.
Yayın öncesi/sonrası karşılaştırmasında sekiz Functions servisi, kurallar,
11 proje ve ortak Auth/admin yetkileri aynı kaldı. Ayrıntı [KABUL.md](docs/KABUL.md).

## Yerelde çalıştır

Node 24+, Java 21+ ve Firebase CLI gerekir. PowerShell:

```powershell
cd D:\Kutarya\KutaryaWeb
.\scripts\start-local.ps1
```

Site http://127.0.0.1:5180/; yönetim http://127.0.0.1:5180/admin.
Demo admin hesabı ve rastgele şifresi yalnız ignore edilmiş
artifacts/local-credentials.json içindedir. Gerçek Gmail hesabının şifresi değildir.
Emülatör projesi demo-kutarya-games; gerçek hesaplar ve canlı veriler değişmez.
Yerel mail dışarı gönderilmez. Emülatör verileri kalıcı üretim verisi değildir.

Başlatıcı mevcut servis ve kimlik dosyası varsa hesapları sıfırlamaz. Yeni
emülatör başlattığında ilk verileri kurar; elle yenilemek için -Reseed kullan.
-NoSeed her durumda seed adımını atlar. npm run seed:local üç test hesabının
şifre/profillerini yeniler; mevcut diğer projeleri korur, yalnız kaldırılan dört
eski örneği temizler. Sonrasında tarayıcıda yeniden giriş gerekir.

## Proje paylaş

1. Admin → Projeler → Proje ekle; tür, ad ve açıklamayı girip taslağı kaydet.
2. Görseller bölümünde kendi kapak ve ekran görüntülerini yükle; kaydet.
3. Dosyalar bölümünde kurulum/taşınabilir paket/kaynak kod/doküman seç.
   Gerçek yükleme; ilerleme, duraklatma, sürdürme ve iptal desteklenir.
4. Teknik ayrıntılara platform, teknoloji, lisans, gereksinim ve kullanım
   açıklamasını ekle. Kaynak proje için HTTPS depo bağlantısı da kullanılabilir.
5. Yayın ayarlarından doğru sürümü ve yayın durumunu seçip kaydet.

ZIP/7Z/EXE/MSI/APK/AAB/GZ/TGZ/PDF; dosya başına 500 MB, proje başına 20 dosya.
Kaynak kod arşiv olarak yüklenir. Sunucu dosya boyutu, tür ve temel imzayı
kontrol eder; bu kontrol virüs taraması veya kurulum/uygulama kabulü değildir.
Yayındaki dosyayı kaldırmak için önce projeyi taslak veya arşiv durumuna al.
Dosya yükleme hemen projeye bağlanır; görsel ve metin değişiklikleri Kaydet ile işler.

Tarayıcı/Unity Web build'i kaynak ZIP indirmesinden farklıdır:

```powershell
node scripts/import-game.mjs D:\Buildler\Oyunum oyun-kimligi 1.0.0
```

İçe aktarma kaynak klasörü değiştirmez; public/games/ altında sürümlü çıktı ve
kutarya-manifest.json üretir. Gerçek tarayıcı kabul raporu, SHA/boyut yeniden
kontrolü ve operator.mjs register-version sonrasında panelde sürüm seçilir.
Hosting'e paket yayını ayrıca yapılır. Gerçek Unity build sağlanmadı.

## Doğrulama

```powershell
npm run check
npm run seed:local
npm run test:integration
node scripts/prepare-storage-rules.mjs
node scripts/storage-release-check.mjs
node scripts/prepare-hosting-preview.mjs
firebase emulators:start --config .firebase-preview.json --project demo-kutarya-games --only hosting
# Ayrı terminal:
node scripts/hosting-smoke.mjs
```

Storage önerisi için önce read-inventory.mjs ile mevcut canlı kurallar salt
okunur alınır. Kuralların birleştirilmesi ve test edilmesi canlı deploy değildir.
Entegrasyon kod doğrulama test hesabını doğruladığı için tekrardan önce seed gerekir.

Üretim web config .env.production.local içindedir; gönderilen Firebase public
config eşleşti. SMTP veya servis hesabı sırları istemciye konmaz. authDomain
kutarya.com özel domain girişini korur; firebaseapp.com değeri aynı Auth projesidir.
Realtime Database ve Analytics SDK bu sürümde çalıştırılmaz.

## Görünüm ve yayın

Açık varsayılan; Sıcak, Koyu ve Sistem seçimi tarayıcıda saklanır. Kutarya logosu
korundu. Ana sayfa stüdyo görseli AI ile üretilmiş dekoratif görseldir; proje
kapakları ve ekran görüntüleri yönetimde yüklenen gerçek dosyalardır.

Önce yerel inceleme tercihi geçerli; canlıya yayın yapılmadı. Daraltılmış hedef,
kural birleştirme, mail kabulü ve geri dönüş: docs/YAYIN.md.
Uygulanan plan SITE-PLANI.md; ölçülen kabul docs/KABUL.md; devir DEVIR.md.

5 Ekim isteğiyle Google giriş düğmesi, hesap bağlama ve otomatik Google dönüş
işlemleri Auth ekranından kaldırıldı. E-posta/şifre, kayıt, kod doğrulama ve
parola sıfırlama korunur. Ortak Firebase projesinin canlı sağlayıcı ayarı
değiştirilmedi. Eski Google yardımcıları yalnız eski regresyon testlerinde
kalır; arayüz bunlarla giriş başlatmaz.

Convert'i geliştirmek: `npm run build:convert`. Yerel kataloğa tekrar ekleme ve
destek matrisi: docs/KUTARYA-CONVERT.md. Sürüm yollarını üzerine yazma.

Kutarya Cep 1.0.0, Java / Android Studio mobil AI sohbet uygulamasıdır.
Kaynak: `mobile-src/kutarya-cep`; SQLite geçmiş ve yönetilebilir hafıza,
OpenAI/OpenRouter/Gemini/Grok için kullanıcı anahtarıyla doğrudan HTTPS.
Android test APK'sı, tam kaynak ZIP ve zaman/risk/OOP tablolu okul PDF'si
yerel proje sayfasının Dosyalar bölümündedir. Ayrı AI sunucusu kurulmaz;
internet ve kullanıcı API hesabı gerekir. Kabul ve yeniden ekleme:
[docs/KUTARYA-CEP.md](docs/KUTARYA-CEP.md). Canlı deploy yapılmadı.
