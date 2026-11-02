# Kutarya Cep - okul proje dosyası

Belge tarihi: 5 Ekim 2026. Sürüm: 1.0.0. Proje sahibi: Kutarya. Öğrenci/ders/öğretmen adı kullanıcı tarafından verilmedi; bu kimlik alanları uydurulmadı.

## Amaç ve problem

Mobilde AI sohbetini, geçmiş ve kalıcı kullanıcı tercihleriyle tek uygulamada kullanmak. Bir okul projesinde Java/OOP, Android arayüz yaşam döngüsü, SQLite ilişkisel veri tasarımı, API/SSE ağ iletişimi ve güvenli anahtar saklama gösterilir. Kullanıcı sağlayıcı değiştirse de sohbet ve hafıza cihazda kalır.

## Kapsam ve teslim

Android Studio Java projesi, test APK'sı, kaynak ZIP, bu belge ve PDF. Sohbet/geçmiş/hafıza/ayarlar, dört sağlayıcı, streaming/durdurma, temalar, sistem ses hizmetleri, kopyalama/paylaşma/yedek. Ayrı backend veya kendi LLM eğitimi yoktur. AI internet ve kullanıcıya ait API hesabı gerektirir. Web'e yerel katalog kaydı eklenir; Firebase/Hosting deploy yapılmaz.

## Proje zaman dağılım tablosu

**Aşağıdaki 60 saat / 15 iş günü, okul uygulama ve sunum planıdır. Fiilen harcanmış süre veya geçmişte çalışılmış gün olarak sunulmaz.** Günler günde 4 saat çalışma varsayımıyla ardışık iş günleridir. Sorumlu her satırda öğrenci/geliştiricidir. Bağımsız süre kaydı tutulmadığı için gerçekleşen saat: ÖLÇÜLMEDİ.

| İş paketi | İş günleri | Plan saat | Pay | Çıktı / kabul |
| --- | --- | --- | --- | --- |
| Mevcut site ve gereksinim inceleme | 1 | 4 | %6,7 | Mevcut admin/dosya modeli, kapsam ve yayın sınırı |
| UI/UX ve Java sınıf tasarımı | 2-3 | 8 | %13,3 | Dört ekran, tema ve XML/Java sorumlulukları |
| SQLite sohbet/geçmiş/yedek | 4-5 | 8 | %13,3 | Şema, CRUD, arama, silme, tekrar açma |
| Dört sağlayıcı ve SSE | 6-8 | 12 | %20,0 | Şema uyumu, header, akış/iptal/hata testleri |
| Hafıza ve bağlam bütçesi | 9-10 | 8 | %13,3 | Açık tercih, kapsam, not yönetimi ve bütçe |
| Cihaz güvenliği ve yaşam döngüsü | 11 | 4 | %6,7 | Keystore, API anahtarı, ekran yenileme |
| Test, hata giderme ve ekran kabulü | 12-13 | 8 | %13,3 | Birim/HTTP, SQLite/Keystore ve emülatör |
| Paket, okul belgeleri ve site kaydı | 14 | 4 | %6,7 | APK/kaynak/PDF, SHA ve mevcut dosya hattı |
| Fiziksel telefon / API / sınıf provası | 15 | 4 | %6,7 | Gerçek anahtar/cihaz ve öğretmen sunumu |
| **Toplam** | **15 iş günü** | **60** | **%100** | Yuvarlanan yüzdeler toplamı %100,1 olabilir |

Kritik yol: gereksinim → veri modeli → API/stream → hafıza → cihaz kabulü → paket. UI çalışması veri modeli sonrası API ile paralel yürütülebilir. Son satır kullanıcı cihazı ve API hesabı gerektirir; ölçülmüş kabul yerine plan yazılmaz.

## Risk analiz tablosu

Olasılık (O) ve etki (E): 1 çok düşük, 2 düşük, 3 orta, 4 yüksek, 5 çok yüksek. Puan O × E; 1-4 düşük, 5-9 orta, 10-16 yüksek, 17-25 kritik. Bunlar tasarım değerlendirmesidir, ölçülmüş olay frekansı değildir. Önlem sonrası puan tahmindir. Her riskin sahibi öğrenci/geliştiricidir; sağlayıcı hesabı/cihaz onayı proje sahibindedir.

| No | Risk | O | E | Puan | Önlem / tespit | Sonra | Durum |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | API anahtarının APK/log/yedekte açığa çıkması | 3 | 5 | 15 | BYOK, Keystore/AES-GCM, yedekte anahtar yok, log yok, HTTPS ve redirect ret | 5 | Kod ve cihaz testi; köklü cihaz riski sürer |
| R2 | Kota, kredi veya hız sınırı | 4 | 3 | 12 | 401/403/429 ayrımı, yanıt sınırı, otomatik ücretli tekrar yok | 6 | Kontrollü HTTP ölçüldü; gerçek hesap açık |
| R3 | İnternetin stream sırasında kesilmesi | 4 | 3 | 12 | Yarım durum kaydı, timeout, durdurma ve kullanıcı yeniden deneme | 6 | Akış/yarım EOF ve emülatör ölçüldü |
| R4 | SQLite veri kaybı / bozuk yedek | 2 | 5 | 10 | Transaction, foreign key, eklemeli import ön doğrulama, yedek/silme onayı | 5 | SQLite ve round-trip test; kullanıcı yedeği gerekir |
| R5 | Model bağlamı taşması | 4 | 3 | 12 | Son soru korunur, tam eski turlar bütçeye alınır; eksik sayısı gösterilir | 6 | Karakter bütçesi testli; gerçek token farklı |
| R6 | AI yanlış bilgi veya tercihi yanlış uygulama | 4 | 4 | 16 | Görünür/düzenlenebilir notlar, sadece kullanıcıdan öğrenme, kaynak doğrulama | 12 | Kalite garantisi yok; gerçek sağlayıcı ölçülmedi |
| R7 | Yanlış/hassas bilginin hafızaya alınması | 3 | 4 | 12 | Açık ifade kuralı, secret sözcükleri eleme, kapatma/silme, kaynak cascade | 6 | Kurallar testli; tüm hassas veriyi sınıflandırmaz |
| R8 | Sağlayıcı API/model uyumsuzluğu | 3 | 4 | 12 | Resmî REST adapter, dinamik model listesi, elle model, şema/HTTP testi | 8 | Dört kontrollü adapter; canlı anahtar testi açık |
| R9 | Ekran dönüşü / süreç ölümü | 3 | 3 | 9 | Application oturumu, SQLite ara kayıt, yeniden açılışta interrupted | 3 | Ekran yenileme ve recovery test; cihaz provası açık |
| R10 | Eski/dar cihazda UI veya performans | 3 | 3 | 9 | Native UI, animasyon kapatma, eski mesajları kademeli gösterme | 6 | Emülatör ekranları; fiziksel/FPS ölçülmedi |
| R11 | Yedek dosyasının üçüncü kişiye verilmesi | 3 | 4 | 12 | SAF hedef seçimi, anahtar yok, şifresiz dosya açıklaması | 8 | Kullanıcı dosya güvenliği sorumluluğu sürer |
| R12 | Yanlış Firebase hedefe yayın | 2 | 5 | 10 | Yerel installer sabit demo/loopback, deploy yok, SHA/paket kontrolü | 2 | Yerel paylaşım sınırı; üretim onayı ayrı |

## OOP ve veritabanı anlatımı

Kapsülleme: `KeyVault` kriptografiyi ve `ChatDb` SQL işlemlerini gizler. Soyutlama: `ProviderApi.Listener` UI'ya parça/sonuç bildirir. Kalıtım: `MainActivity`, `Activity`; `ChatDb`, `SQLiteOpenHelper`; `OrbitView`, `View` sınıflarını genişletir. Bileşim: `ChatSession`, DB/vault/API bileşenlerini bir arada yönetir. `Provider` enum sağlayıcı kimliğini URL'den ayırır. UI, kripto işlemini veya SQL sorgusunu taklit ederek yetki vermez.

`chats(id, title, updated, pinned)` → `messages(id, chat_id, role, body, status, created, provider, model)`. `memories(id, scope, source_id, body, enabled, created)` kaynak mesaj silindiğinde cascade ile silinir. Scope=0 global; diğer değer sohbet kimliği. SQL değerleri parametriktir. Şema yükseltme işlemi şimdilik bilinçli olarak hata verir; sürüm artarken veri göçü tasarlanmalıdır.

## Sınıf sunumu - 8 dakikalık prova

1. (1 dk) Problem, Java/SQLite ve ayrı sunucu gerektirmeyen mimariyi anlat.
2. (2 dk) Kendi API hesabını bağla; Türkçe bir soru sor, streaming ve durdurmayı göster.
3. (1 dk) “Hatırla: Kısa ve örnekli yanıt ver.” yaz; Hafıza ekranında gör/düzenle.
4. (1 dk) Yeni sohbet açıp tercihin isteğe eklendiğini göster; model davranışını değerlendir.
5. (1 dk) Geçmişte ara, sabitle, uygulamayı yeniden aç; kaydın kalmasını göster.
6. (1 dk) SQLite ilişkilerini ve Keystore sınıfını kodda açıkla.
7. (1 dk) Zaman/risk tablosu, testlerin sınırı ve fiziksel/canlı API kabulünü anlat.

Öğretmen provası için API kredisi ve interneti önceden kontrol et. Anahtarı ekrana veya sunum dosyasına kopyalama. Kontrollü test yanıtını gerçek AI cevabı diye gösterme. Kaynak kod, test APK ve belgeler aynı 1.0.0 sürümüyle paketlenir.
