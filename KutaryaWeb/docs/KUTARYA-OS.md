# Kutarya OS — siteye ekleme, 5 Ekim 2026

Gerçek C# Windows Forms okul projesinin **0.3.0** sürümü yerel katalogda
`/proje/kutarya-os` adresine eklendi. Türü Masaüstü uygulaması, kategorisi
Uygulamalar, platformu Windows. Katalogda dört oyun ve bir masaüstü projesi var.
Canlı Firebase/Hosting yayını yapılmadı.

## İçerik ve dosyalar

| Paket                           | Rol               | Boyut    |
| ------------------------------- | ----------------- | -------- |
| KutaryaOS-Setup-0.3.0-x64.exe   | Kurulum           | 47.5 MiB |
| KutaryaOS-Windows-x64-0.3.0.zip | Taşınabilir paket | 84.0 MiB |
| KutaryaOS-Kaynak-0.3.0.zip      | Kaynak kod        | 1.9 MiB  |

Dağıtım kaynağı `D:\KutaryaOS\Dagitim`. Paketler yeniden oluşturulmadı;
orijinal dağıtım manifesti ve tam kurulum kabul raporuyla eşleştirildi.
Bağımsız EXE tek başına paylaşılmadı: taşınabilir ZIP native çalışma zamanı
dosyalarıyla birlikte açılır. Yerel AI modeli yaklaşık 640 MB ayrı indirmedir.
Kaynak paylaşılması yeni bir açık kaynak lisansı tanımlamaz; üçüncü taraf
lisansları mevcut paketlerin içindedir.

Kapak `uygulamalar.png`; galeri ilk kurulum, AI seçenekleri, ana PC’ye aktarım
ve küçük ekran görüntülerini içerir. Beş görsel de uygulamanın kendi Windows
Forms renderlarından alındı; fiziksel ekran fotoğrafı değildir. Duvar kâğıdı
önceki OS geliştirmesinde AI ile üretilmiştir. Görseller değiştirilmeden PNG
olarak yüklenir; her biri mevcut 1 MiB görsel sınırına uyar.

Sayfa gerçek bir sanal makine vadetmez; sanal donanım bütçelerini, Kutarya Us
için kendi API/yerel model seçeneklerini, AI’ın yalnız sanal Masaüstü sınırını
ve kullanıcının başlattığı ana PC aktarımını açıklar. OOP anlatımı, gün planı
ve risk haritası mevcut kaynak/taşınabilir paket belgelerindedir.

## Yerel yeniden ekleme

Çalışan demo servisleri ve `artifacts/local-credentials.json` içindeki yerel
admin hesabı gerekir. Emülatör verileri sıfırlanırsa:

```powershell
cd D:\Kutarya\KutaryaWeb
.\scripts\start-local.ps1
node scripts/install-kutarya-os-local.mjs
```

Betik yalnız `demo-kutarya-games` ve `127.0.0.1` Auth/Functions/Storage
hedeflerine bağlanır. Üretim hedefi seçeneği yoktur. Önce üç paketin boyut/SHA
değerini, manifest sürümünü ve kurulum kabulünü kontrol eder. Ardından taslak
oluşturur; mevcut admin dosya bileti → Storage → sunucu tamamlama hattından
gerçek dosyaları yükler, görselleri yükler ve yalnız yerel kaydı yayınlar.
İkinci çalıştırma mevcut dosya/görselleri kullanır; dosya sayısı yine üçtür.
Diğer dört projenin tüm kayıtları önce/sonra aynı kalmalıdır.

Proje metni `projects-src/kutarya-os.mjs`; görseller
`public/media/projects/kutarya-os/`; paket kopyaları ve kabul kayıtları ignore
edilmiş `artifacts/kutarya-os/` içindedir. Büyük EXE/ZIP dosyaları Hosting’in
`public`/`dist` klasörlerine konmadı. Canlıya geçişte gerçek admin üzerinden
paket ve görsel yüklenip üretim URL’leri alınmalı; yerel Storage URL’leri
üretim kaydına taşınmamalıdır. Yayın kapısı `YAYIN.md` içinde geçerlidir.

## Bu eklemede ölçülenler

| Kontrol                                  | Sonuç                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Yerel API üzerinden oturumsuz üç indirme | Boyut, SHA-256 ve indirme dosya adları eşleşti                                   |
| Tarayıcıda üç İndir düğmesi              | Setup, taşınabilir ZIP ve kaynak ZIP gerçekten indirildi; hashleri eşleşti       |
| Beş Storage görseli                      | PNG türü, boyut ve SHA-256 orijinallerle eşleşti                                 |
| Katalog / Masaüstü filtresi              | Toplam 5; masaüstü bölümünde Kutarya OS bulundu                                  |
| Admin paneli                             | Yayında, v0.3.0, üç ayrı dosya rolü görüldü                                      |
| Masaüstü, 1280 px                        | Belge genişliği 1265; yatay taşma yok                                            |
| Mobil, 390 px                            | Belge genişliği 375; açıklama ve dosyalarda yatay taşma yok; beş görsel yüklendi |
| Betiğin ikinci çalıştırılması            | Yeni paket/görsel kopyası yok; dört oyun aynı kaldı                              |
| `npm run check`                          | 34/34 test ve üretim build geçti                                                 |

Kanıtlar: `artifacts/kutarya-os/local-install.json`, `browser-downloads.json`,
`browser-acceptance.json` ve `artifacts/screenshots/kutarya-os-*.jpg`.
OS’nin kurulum/AI kontrolleri bu site eklemesinde tekrar çalıştırılmadı;
mevcut tam kabul raporu doğrulandı. Fiziksel okul PC/DPI/Explorer/klasör seçicisi
kabulü OS projesinin açık işidir. Gerçek Google OAuth, canlı indirme ve deploy
kabulü bu yerel sonucun kapsamı değildir.
