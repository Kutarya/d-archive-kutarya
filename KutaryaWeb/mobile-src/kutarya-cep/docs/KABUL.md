# Kutarya Cep 1.0.0 - ölçülmüş kabul

5 Ekim 2026. Android SDK 36 / min 26, AGP 9.2.1, Gradle 9.4.1, JBR 21. Android emülatörü: Kutarya_School_Test, Android 17 / API 37 / x86_64. Fiziksel cihaz değildir.

- Birim ve kontrollü HTTP: 27/27. Dört sağlayıcı için gerçek HTTP header/path/payload; SSE Türkçe/metin, Gemini thought ayırma, yarım EOF, hata, iptal, quota ve redirect ret. Sahte test anahtarları ve loopback cevaplar kullanıldı.
- Android cihaz testleri: 12/12. SQLite tekrar açma, arama literal karakter, cascade hafıza, not düzenleme/kapama, kesilmiş durum kurtarma, eklemeli yedek ve geçersiz import, Keystore ciphertext round-trip, gerçek ekranlar/Activity yenileme ve streaming fixture. Durdur/yeniden dene native düğmelerle ölçüldü. Markdown görünümü ayrıca test edildi. Son rapor paketin yanındaki kabul JSON'undadır.
- `assembleDebug`, test APK ve `lintDebug` geçti; lint 0 hata, sürüm/i18n/eski API tercihi ve çizim gibi tavsiye uyarıları bulunur. Uyarılar gizlenmedi.
- Altı gerçek Android emülatör ekranı: karşılama, API ayarları, hafıza, geçmiş, kontrollü test sohbeti ve koyu tema. Test cevabı görselde açıkça gerçek sağlayıcı yanıtı değildir diye yazılıdır.
- PDF dört sayfa; zaman tablosu, 12 risk, OOP/SQLite ve sınıf provası. Türkçe font gömülü, sayfa PNG'leri görsel incelendi.
- Dağıtım: debug sertifikalı test APK, kaynak ZIP ve okul PDF; boyut/SHA manifesti. Kaynak ZIP local.properties, build, SDK, keystore, API/hesap verisi içermez. Kaynak ZIP ayrı çıkarılıp tekrar derlenerek doğrulanmalıdır; site kabulü docs/KUTARYA-CEP.md ve ignore artifacts/kutarya-cep raporlarındadır.

## Açık gerçek kabul noktaları

Gerçek OpenAI/OpenRouter/Gemini/Grok anahtarıyla yanıt, model erişimi/kota; fiziksel Android 8+ telefon, sesle yazma/TTS ve SAF dosya seçicisinin elle kullanımı; TalkBack/büyük yazı/tüm üretici ekranları; AI cevap kalitesi, gecikme ve FPS: ÖLÇÜLMEDİ. Cihaz içi LLM/çevrimdışı AI yoktur. Kontrollü test başarıları bunların yerine sayılmaz.

Okul APK'sı Play Store sürümü değildir; yayın sertifikası oluşturulmadı. Firebase/Hosting/Functions/kurallar/claims ve diğer ürünler deploy edilmedi. Siteye ekleme mevcut yerel katalog/admin/Storage akışıdır.
