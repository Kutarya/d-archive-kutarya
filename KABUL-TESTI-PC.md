# Kutarya Studio temiz Windows kabul testi

Bu kontrol yeni bir Windows 10/11 x64 kullanıcı profilinde yapılır. Test edilen
kurulum dosyasının SHA-256 değeri canlı manifest ile aynı olmalıdır.

- Kurulum UAC istemeden tamamlanır.
- Masaüstü ve Başlat menüsü `Kutarya Studio` kısayolları çalışır.
- Giriş, sohbet, dosya seçimi ve resmi site bağlantıları çalışır.
- Tema, vurgu rengi ve agent ayarları yeniden açılışta korunur.
- Agent uzaktan kontrolü ilk açılışta kapalıdır.
- İnternet kesilmesi, 401 ve 5xx kullanıcıya anlaşılır hata gösterir.
- Kaldırma sonunda uygulama dosyaları ve iki kısayol kalmaz.
- `Get-AuthenticodeSignature` sonucu `Valid` olur.

Temiz VM ve imzalama sertifikası bu çalışma ortamında bulunmadığından bu kapı
yerel derleme/smoke ile karıştırılmaz; yayın adayı ayrıca bu listeden geçmelidir.

