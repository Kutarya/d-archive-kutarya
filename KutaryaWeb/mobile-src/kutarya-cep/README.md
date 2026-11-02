# Kutarya Cep 1.0.0

Java ile Android Studio için hazırlanmış, kendi API anahtarını kullanan AI sohbet uygulaması. Kullanıcıya görünen asistan adı Kutarya Us'tur. Model yanıtını OpenAI, OpenRouter, Gemini veya Grok / xAI üretir; uygulama cihazda bir dil modeli çalıştırmaz. Kutarya sunucusu, Firebase hesabı veya ek backend gerekmez. AI için internet ve ilgili sağlayıcının erişime açık metin modeli gerekir.

## Özellikler

- Akan yanıt, durdurma, başarısız/yarım yanıtı kullanıcı başlatmalı yeniden deneme.
- SQLite sohbet, mesaj, zaman, durum, sağlayıcı/model ve hafıza kaydı.
- Başlık değiştirme, sabitleme, başlık/mesaj arama, silme ve eski mesajları yükleme.
- Açık hatırlama ifadelerini yerelde tanıma; global/sohbet notu ekleme, düzenleme, devre dışı bırakma ve silme.
- Son tamamlanmış turlarla sınırlı bağlam; son soru bütün tutulur. Bağlama sığmayan eski mesaj sayısı gösterilir, SQLite geçmişi silinmez.
- Dört bağımsız API anahtarı/model profili ve sağlayıcıdan model listesi getirme.
- Android Keystore + AES-256-GCM anahtar saklama; ortak veya geliştirici anahtarı APK'ya gömülmez.
- Açık/koyu/sistem tema, yörünge ve mesaj animasyonları, animasyonu kapatma ve sistem hareket ayarına uyma.
- Metin seçme, kopyalama/paylaşma, basit Markdown vurgusu; sistem sesle yazma ve sesli okuma.
- SAF dosya seçicisiyle JSON yedek alma/ekleme ve sohbeti Markdown olarak dışa aktarma. API anahtarları yedeğe alınmaz.

## Android Studio'da aç

1. Kaynak ZIP'in tamamını çıkart; `settings.gradle` bulunan klasörü Android Studio'da aç.
2. Gradle JDK olarak JDK 17 veya daha yenisini seç (bu sürüm JBR 21 ile derlendi). Android SDK 36'yı kur. Gradle 9.4.1 ve AGP 9.2.1 sabittir; Gradle Wrapper dahil.
3. SDK konumunu IDE seçer; dağıtımda `local.properties` bulunmaz. İlk Gradle eşitlemesi internet ister.
4. Android 8.0 / API 26 veya yeni cihaz/emülatör seçip Run çalıştır.

Windows: `gradlew.bat :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`

Linux/macOS: `sh gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`

Cihaz testleri: `gradlew.bat :app:connectedDebugAndroidTest`. Testler örnek uygulama verisini temizler; kişisel sohbetleri olan cihazda çalıştırma.

## APK ve kullanım

Paylaşılan APK okul incelemesi için Android'in standart debug sertifikasıyla imzalanmış test sürümüdür; Play Store sürümü değildir. Android kurulum izni isteyebilir. `com.kutarya.cep` paketini kullanır; diğer Kutarya uygulamalarının yerine kurulmaz.

**Ayarlar → sağlayıcı → kendi API anahtarın → metin modelinin kimliği → Bağlantıyı kaydet.** Model kimliğini elle yazabilir veya modelleri sağlayıcıdan getirebilirsin. Üyelik/ChatGPT aboneliği API erişimi ve API kredisiyle aynı şey değildir. Uygulama maliyeti tahmin etmez; kullanım ve kota sağlayıcının hesabından izlenir.

Anahtar alanı boş bırakılıp kaydedilirse mevcut anahtar korunur. Kaldırmak için **Bu sağlayıcının anahtarını sil** düğmesini kullan. Diğer profiller korunur. Hiçbir gerçek anahtar veya ücretli sağlayıcı çağrısı teslimin otomatik testlerine konulmaz.

## Hafıza nasıl çalışır?

`Hatırla: ...`, `Bunu hatırla: ...`, `Aklında tut: ...`, `Bundan sonra ...`, `Her zaman ...`, `Benim tercihim ...`, `Bana hep ...`, `Adım ...` ve `Benim adım ...` ifadeleri; hafıza açıkken kullanıcı mesajından yerel kurallarla çıkarılır. Şifre/parola/API anahtarı belirten açık ifadeler otomatik kayda alınmaz. Bu kontrol tüm kişisel veri türlerini sınıflandıran bir sistem değildir; notları kullanıcı kontrol eder.

Diğer bir mesajın menüsünden **Hafızaya kaydet** seçilir. Elle eklenen not global veya o sohbete özel olabilir. AI cevabından otomatik not çıkarılmaz. Hafızayı kapatmak hem otomatik kaydı hem sağlayıcıya not gönderimini kapatır. Sohbeti silmek, o sohbetten türetilen global notları ve o sohbete özel notları da siler; elle eklenen global notlar kalır.

Notlar model eğitimini değiştirmez; her API isteğine bağlam olarak eklenir. Modelin her isteği kusursuz hatırlayacağı garanti edilmez. En yeni aktif notlardan yaklaşık 5.000 karakter, son tam turlardan toplam yaklaşık 24.000 karakter ve en fazla 41 mesaj gönderilir. Son kullanıcı mesajı 12.000 karakterle sınırlıdır. Bunlar karakter sınırıdır; sağlayıcının gerçek token bağlamı farklıdır. UI dahil edilen mesaj/not ve sığmayan eski mesaj sayısını belirtir.

## Veri ve bağlantı sınırı

Uygulama verisi özel SQLite alanındadır; sohbet metni SQLCipher ile şifrelenmez. Android uygulama alanı/cihaz koruması kullanılır. API anahtarı ayrı Keystore anahtarıyla şifrelenir. Otomatik bulut yedeği ve cihaz taşıma kapalıdır. JSON/Markdown dışa aktarımları **şifresiz kullanıcı dosyalarıdır**; bunları kişisel veri içeriyorsa paylaşma. Yedek API anahtarı içermez.

AI çağrısında seçilen geçmiş, güncel soru ve aktif hafıza doğrudan seçilen sağlayıcıya gider. Üçüncü taraf veri saklama/ücret politikası sağlayıcıya bağlıdır. Sesle yazma/okuma cihazdaki sistem hizmetini kullanır; o hizmet internet kullanabilir. Uygulama ayrı mikrofon/dosya yönetimi izni istemez. Analytics, reklam, üyelik ve Kutarya backend'i yoktur.

Üretim kodu yalnız sabit resmî HTTPS uçlarını kullanır, HTTP yönlendirmelerini izleyip anahtar taşımaz, ham istek/yanıt/anahtar loglamaz. Debug manifest yalnız loopback test HTTP'sine izin verir. Test endpoint'i kullanıcı ayarı değildir. Ücretli otomatik yeniden deneme yoktur.

## Kaynak haritası

| Sınıf | Sorumluluk |
| --- | --- |
| MainActivity / activity_main.xml | Native ekran, gezinme, form ve SAF kullanıcı akışı |
| Ui / OrbitView | Tema, tekrar kullanılan görünüm ve Canvas animasyonu |
| ChatSession / CepApplication | Activity değişiminden bağımsız istek, durdurma ve durum bildirimi |
| ChatDb / Models | SQLite şema, transaction, CRUD ve kayıt modelleri |
| MemoryRules / ContextComposer | Açık tercihi çıkarma, kapsam ve geçmiş bütçesi |
| Provider / ProviderApi | Dört resmî API, SSE ayrıştırma ve model listesi |
| KeyVault | Android Keystore ile anahtar şifreleme |
| Backup | Doğrulanan, eklemeli ve transaction içinde JSON yedek içe aktarma |

SQLite şeması: `chats 1 → N messages`; `messages 1 → N memories` kaynak ilişkisi. Foreign key ve cascade açık, parametrik sorgular kullanılır. Şema sürümü 1; ileride şema değişikliği için `onUpgrade` veri göçü yazılmalıdır.

## Okul belgeleri ve doğrulama

`docs/OKUL-PROJESI.md` proje zaman dağılımını, risk analizini ve sunum akışını içerir. PDF ayrıca site Dosyalar bölümündedir. `docs/KABUL.md` son ölçümleri ve açık kabul noktalarını kaydeder. Çekirdek/HTTP testleri kontrollü test sunucusudur; gerçek sağlayıcı kalitesi veya canlı API kabulü değildir.

## Resmî API kaynakları

- [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
- [OpenRouter Streaming](https://openrouter.ai/docs/api_reference/streaming)
- [Gemini Generate Content](https://ai.google.dev/api/generate-content)
- [Grok / xAI Streaming](https://docs.x.ai/developers/model-capabilities/text/streaming)
- [Android Keystore](https://developer.android.com/privacy-and-security/keystore)

Bağımlılık ve lisanslar `THIRD-PARTY.md` içinde. Proje kaynaklarının lisansı `LICENSE.txt` dosyasındadır.
