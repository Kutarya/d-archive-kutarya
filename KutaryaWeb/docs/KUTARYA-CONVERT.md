# Kutarya Convert 1.0.0 — yerel teslim, 5 Ekim 2026

Yerel proje: http://127.0.0.1:5180/proje/kutarya-convert

Çalışma alanı: http://127.0.0.1:5180/games/kutarya-convert/1.0.0/index.html

Araçlar kataloğunda gerçek bir uygulama olarak eklendi; toplam 6 proje
(4 oyun, Kutarya OS, Convert). Önceki beş proje değiştirilmedi. Canlı deploy yok.
Proje sayfasındaki Uygulamayı aç düğmesi aracı kendi sekmesinde açar.

## Gerçek dönüşüm kapsamı

| Girdi                          | Çıktı                                    | İşlem ve sınır                                                                                                                                                                              |
| ------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PNG/JPEG/WebP/BMP/GIF/SVG/AVIF | PNG/JPEG/WebP/PDF                        | Canvas yeniden kodlar; boyut, oran, döndürme, kalite, JPEG arka planı. GIF ilk kare; AVIF tarayıcıya bağlı. Dış kaynaklı/etkin SVG reddedilir.                                              |
| TXT/Markdown/HTML/DOCX         | PDF/DOCX/HTML/TXT                        | Metin ayrıştırılır, yeni belge yazılır. PDF'de Türkçe font gömülür. Özgün Word/HTML sayfa tasarımı birebir korunmaz.                                                                        |
| PDF                            | TXT/DOCX/HTML, PNG/JPEG sayfa ZIP'i, PDF | Metin katmanı; sayfa seçme, döndürme, ayırma ve sırayla birleştirme. OCR/şifreli PDF yok.                                                                                                   |
| CSV/TSV/JSON/XLSX              | CSV/TSV/JSON/XLSX                        | Tırnaklı/multiline CSV, başlık/ayırıcı, Unicode ve baştaki sıfırlar; çoklu Excel sayfaları. Formüller yürütülmez; önbellekteki sonuç veya formül metni aktarılır. Hücre biçimleri taşınmaz. |
| MP3/WAV/OGG/FLAC/M4A/AAC       | PCM16 WAV / gerçek MP3                   | Web Audio çözer; kanal, örnekleme, süre kesme ve kazanç; LAME MP3 kodlar. Girdi kodeği tarayıcıya bağlı.                                                                                    |

Video, HEIC, eski DOC/XLS ve OCR bu sürümde yok. UTF-8/UTF-16 metin desteklenir.
PDF metin fontunda olmayan karakterler hata verir; sessizce kaybolmaz.
Tabloya dönüşecek JSON satır dizisi veya sayfa adı → satır dizileri nesnesi olmalıdır.
İç içe nesneler hücrede JSON metni olur; türlerin birebir geri kazanımı vaat edilmez.

## Arayüz ve dosya davranışı

- Çoklu seçme ve bırakma; her dosyada ayrı çıktı, uyumlu dosyalara toplu çıktı.
- Tek tek indirme ve tüm çıktıları ZIP; aynı adlı sonuçlar çakışmasız adlandırılır.
- Görsel, ses, metin ve PDF ilk sayfa önizlemesi; ZIP/XLSX için paket bilgisi.
- PDF birleştirmede sıra değiştirme; her dosya hatası ayrı gösterilir.
- Worker işlemi iptal edilebilir; tamamlanmış sonuçlar korunur.
- Açık varsayılan; sıcak/koyu/sistem temaları. 390 px taşma kabulü ölçüldü.

Seçilen dosyalar dönüştürme sunucusuna gönderilmez. Motor, yazı tipi ve worker
kaynakları HTML içindedir; CDN bağımlılığı yoktur. Tarayıcı dosyaları RAM'de
işler. Sekmeyi kapatmadan çıktılarını indir; kaynak dosyalar değişmez.

Sınırlar: 20 dosya; tek dosya 25 MiB; toplam 100 MiB; çıktılar 160 MiB;
görsel 24 MP ve kenar 8192 px; PDF 80 sayfa; ses 5 dakika; metin 5 MiB;
tablo 50.000 satır / 200 sütun / 200.000 hücre / 20 çalışma sayfası.
Worker süresi 120 saniye; büyük işlemler için masaüstü önerilir.

## Paketler ve kaynak

| Dosya                            | Rol                   | Boyut   |
| -------------------------------- | --------------------- | ------- |
| Kutarya-Convert-Web-1.0.0.zip    | Çevrimdışı web paketi | 4.8 MiB |
| Kutarya-Convert-Kaynak-1.0.0.zip | Uygulama kaynakları   | 3.2 MiB |

Web ZIP'i çıkar, `index.html` dosyasını güncel tarayıcıda aç. Kaynak ZIP'i:
Node 24+ → `npm ci`, `npm test`, `npm run build`. 20 izinli dosya içerir;
site/Auth yapılandırması, kullanıcı dosyaları veya yerel hesaplar dahil değildir.
Kaynak ZIP'i ayrı klasörde kuruldu, 19 testi geçti ve HTML'i byte/SHA olarak
aynı üretildi. Paket lisansları/font lisansı, MP3 upstream kaynak arşivi ve
yeniden bağlama talimatı içerir. Bileşen sürümleri package-lock'ta sabittir.

Motor kaynakları: tools-src/convert. Build: scripts/build-convert.mjs;
kaynak paketleme: scripts/package-convert-source.mjs. `npm run build:convert`
yalnız önizleme/paket üretir; mevcut sürüm klasörünü değiştirmez.
Yerel önizlemeler `tools-preview/**` Hosting ignore'unda; üretime gönderilmez.
Vite build eklentisi ayrıca dist/tools-preview klasörünü sınır kontrolüyle
çıkarır. Hosting emülatörü ignore kalıbını servis sırasında uygulamadığı için
yalnız ignore'a güvenilmedi; 404 kabulü ölçüldü.

PDF.js IIFE build'de Node'a özel import.meta dalı için uyarı üretir. Bu dal
tarayıcı yolunda çalışmaz; gerçek PDF okuma/render kabulü geçti. Uyarı saklanmadı.

## Ölçülen kabul

53/53 kaynak/iş kuralı testi ve site build; 38/38 yerel servis/Storage/rules kabulü.
Firebase Hosting emülatöründe yeni runtime ve önizleme 404'ü dahil 22/22 kontrol.
Yeni Convert testlerinin 19'u gerçek belge, tablo, ses ve arşiv içeriğini okur.

Gerçek tarayıcıyla: PNG→WebP, TXT→PDF, CSV→XLSX, WAV→MP3 ve toplu ZIP.
İndirilen çıktılar PDF→TXT, XLSX→JSON, MP3→WAV olarak geri okundu.
Türkçe, baştaki sıfırlar ve hücre içi satır sonları korundu. Pillow WebP/JPEG'i
açtı; ffprobe MP3 için mp3, 44100 Hz, stereo, yaklaşık 2.04 sn ölçtü.

DOCX→HTML, HTML→DOCX, Markdown→PDF, SVG→JPEG (40×60 px) geçti.
Bozuk PNG/sahte DOCX/dış kaynaklı SVG ayrı hata verdi; diğer 4 dosya tamamlandı.
İki PDF sıralanarak birleştirildi; iki sayfa 1263×893 PNG'ye çevrildi; yalnız ikinci
sayfa çıkarılıp 90° döndürüldü. PDF-lib ve Mammoth ile indirilen içerikler açıldı.
120 saniyelik sentetik WAV'ın MP3 dönüşümü kullanıcı düğmesiyle durduruldu.
15 kaynak kabul dosyasının byte/SHA değerleri değişmedi.

Bırakma handler'ı aynı belgeye sentetik DataTransfer ile iki dosya gönderilerek
kontrol edildi; 2/2 dönüşüm geçti. Explorer'dan gerçek sürükleme ölçülmedi.
CUA'nın opaque iframe dosya seçicisi olayı dönmedi; sandbox gevşetilmedi.
Aracın ana kullanım yolu doğrudan kendi sekmesidir ve gerçek dosya seçimi orada
ölçüldü. Oyunların sandbox izinleri korunur; araç iframe'i yalnız scripts/downloads
ister, allow-same-origin eklenmedi. Fiziksel telefon ve her girdi kodeki açık kabul.
İndirilen HTML'in doğrudan file:// açılışı CUA URL politikasınca engellendi;
bu işlem için başka yüzey veya dolaylı yöntem denenmedi. Yerel web/HTTP
çalışması ve ZIP içeriği ölçüldü; çift tıklayarak file:// çalışma kabulü açık.

Kanıtlar ignore edilmiş artifacts/convert içinde: build.json,
browser-acceptance.json, local-install.json, gerçek çıktılar ve ekran görüntüleri.
Kapak gerçek uygulama ekranıdır; AI mockup kullanılmadı.

## Yerel kataloğu yeniden oluşturma

Mevcut emülatörün Auth hesaplarını içerik yenilemek için reseed etme.
Emülatör sıfırlanırsa start-local ile yerel hesapları başlat, ardından:

```powershell
node scripts/install-convert-local.mjs draft
node scripts/operator.mjs register-version demo-kutarya-games public/games/kutarya-convert/1.0.0/kutarya-manifest.json artifacts/convert/browser-acceptance.json
node scripts/install-convert-local.mjs publish
```

Son betik sabit loopback demo projesine gider, ortak canlı projeye yönlenemez.
Sürüm zaten kayıtlıysa register-version tekrar çalıştırılmaz. Publish tekrar
çalıştırıldığında aynı dosya/kapak eklenmez. Sunucu upload ticket → octet-stream
Storage yüklemesi → complete → guest download byte/SHA doğrulaması kullanılır.
İki tarayıcı İndir düğmesinden alınan paketler de orijinalleriyle eşleştirildi.

## Giriş değişikliği

Google düğmesi, aynı sekme alternatifi, hesap bağlama ve otomatik Google redirect
tamamlama Auth ekranından kaldırıldı. E-posta/şifre, kayıt, kod ve reset kaldı.
Giriş/kayıt ekranında 0 Google düğmesi; yerel admin parola girişi hedefi Araçlar'a
koruyarak geçti. Gerçek Firebase sağlayıcıları, hesaplar ve canlı kurallar değişmedi.

## Birincil bileşen kaynakları

- [PDF.js](https://github.com/mozilla/pdf.js), [pdf-lib](https://github.com/Hopding/pdf-lib)
- [ExcelJS](https://github.com/exceljs/exceljs), [Mammoth](https://github.com/mwilliamson/mammoth.js)
- [fflate](https://github.com/101arrowz/fflate), [lamejs fork](https://github.com/gideonstele/lamejs)
- [Noto Sans](https://github.com/notofonts/noto-fonts)

Yerel inceleme kararı geçerlidir. Canlı Hosting/Functions/Storage/rules/claim
yayını yapılmadı; üretim için docs/YAYIN.md kapıları geçerlidir.
