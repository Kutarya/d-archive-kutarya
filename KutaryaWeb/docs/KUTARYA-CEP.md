# Kutarya Cep 1.0.0 - site içeriği ve kabul

5 Ekim 2026. Kullanıcının sunucusuz, Android Studio / Java okul projesi isteğiyle hazırlandı. Mevcut katalog, auth/admin ve dosya modeli korundu. Ayrı uygulama kaynağı `mobile-src/kutarya-cep`, katalog metni `projects-src/kutarya-cep.mjs`. Mobil koleksiyonun ilk gerçek uygulaması; önceki dört oyun, OS ve Convert korunur. Yerel katalog toplam yedi gerçek projedir.

## Teslim ve dosya akışı

| Dosya                              | Boyut          | Rol                                                  |
| ---------------------------------- | -------------- | ---------------------------------------------------- |
| Kutarya-Cep-Android-1.0.0-test.apk | 1.534.513 bayt | Android kurulum / debug sertifikalı okul APK'sı      |
| Kutarya-Cep-Java-Kaynak-1.0.0.zip  | 100.478 bayt   | Tam Java Android Studio kaynağı; 39 izinli dosya     |
| Kutarya-Cep-Okul-Dosyasi-1.0.0.pdf | 85.390 bayt    | 4 sayfa; zaman, 12 risk, OOP/SQLite ve sınıf provası |

APK v2 imzası apksigner ile doğrulandı. Paketler `artifacts/kutarya-cep` altında (ignore); Hosting public/dist içine konulmaz. Kaynakta local.properties, build, IDE cache, gerçek anahtar/cihaz verisi ve keystore yoktur. Boyut/SHA `paket-bilgisi-1.0.0.json` içindedir.

`scripts/install-cep-local.mjs`, yalnız `demo-kutarya-games` ve 127.0.0.1 Auth/Functions/Storage emülatörlerine yazar. Mevcut admin.fileBegin → Firebase Storage upload → admin.fileComplete hattını kullanır. APK/source/PDF için platform android; resimler mevcut admin.cover hattından. Proje draft oluşturulur, doğrulanmış dosyalar bağlanır, sonra yerel published olur. Paket yükleme, canlı Hosting yayını değildir.

Installer, Android kabul raporu ve ZIP'ten ayrı kaynak derleme kanıtını paket SHA'sına bağlar. Oturumsuz API indirmesini ve tüm görsellerin SHA/boyutunu ölçer; önceki altı kayıt aynı kaldı. İkinci çalıştırma üç dosyayı veya altı görseli kopyalamadı. `public/media/projects/kutarya-cep` gerçek emülatör ekranlarının kopyasıdır; AI cevabı kontrollü test düzeneği diye etiketlidir.

## Ölçülmüş kabul

- 27/27 Java birim/HTTP; dört sağlayıcı şeması/header/path, SSE/EOF/hata/kota/redirect ve hafıza/bağlam.
- Kurulmuş son APK'da 12/12 Android testi; SQLite, Keystore, yedek, Activity yenileme, gerçek native düğmelerden durdur/yeniden dene ve Markdown.
- Android build + lint: 0 hata / 25 tavsiye uyarısı. Uyarılar bastırılmadı.
- ZIP bağımsız çıkarılıp Android uygulaması tekrar derlendi; 27/27 birim testi geçti. APK'nın 10 kod/manifest/kaynak girdisi bayt/SHA olarak eşleşti (`source-rebuild.json`).
- Gerçek Edge browser: üç İndir düğmesi → APK/ZIP/PDF SHA/boyut aynı. Mobil koleksiyon, admin parola girişi ve kayıt görüldü. 1280/390 px sayfa yatay taşmıyor, beş galeri görseli yüklendi, pageerror yok (`browser-kabul.json`).
- Site `npm test`: 53/53; production build geçti. Eski silinen 385/102 test takımı yerine sunulmaz. Servis kodu değişmedi; önceki 38 entegrasyon ve 22 Hosting kontrolü bu görevde tekrar çalıştırılmadı.
- PDF Türkçe gömülü font ile dört sayfa üretildi; tüm sayfalar PNG olarak incelendi. Zaman/risk tabloları taşmıyor. Zaman dağılımı öneri 15 iş günü/60 saat; gerçekleşen süre ölçülmedi.

Mobil proje detay/katalog kapakları ve galeri dikey ekranları kesilmeden gösterir. Mevcut görsel bileşeni/CSS'e tür kapsamı eklendi; diğer altı projenin görsel düzeni korunur.

## Uygulama kapsamı ve sınırı

Java/native Android, SQLite sohbet/geçmiş/arama/sabitleme ve kaynak bağlı hafıza; OpenAI/OpenRouter/Gemini/Grok doğrudan resmî HTTPS API'leri. Anahtar BYOK, Keystore AES-GCM. Ayrı backend, Firebase login veya cihaz içi LLM yoktur. AI için internet ve kullanıcı API hesabı gerekir. Uygulama adı Kutarya Cep, asistan adı Kutarya Us.

Açık hatırlama ifadeleri yerelde çıkarılır. Aktif notlar seçilen sağlayıcıya bağlam olarak gider; model eğitimini değiştirmez. Hafıza kapama/düzenleme/silme vardır. Sohbet silindiğinde kaynak notlar da silinir; elle global notlar korunur. Yaklaşık karakter bütçesi gerçek token sayımı değildir; eski kayıtlar SQLite'da korunur, bağlama sığmayan mesaj sayısı görünür.

SQLite sohbetler ayrıca şifrelenmez; Android özel alanı/cihaz korumasına bağlıdır. JSON/Markdown yedekler şifresiz kullanıcı dosyalarıdır, anahtar içermez. Sesle yazma/TTS sistem hizmeti kullanır; cihazda olmayabilir. Play Store ve üretim imza sertifikası yoktur.

Gerçek dört sağlayıcı anahtarı/cevap kalitesi/kota/latency, fiziksel Android 8+ cihaz, TalkBack/büyük yazı, SAF/ses hizmetinin elle kullanımı ve FPS ölçümü: açık. Kontrollü test kabulünü bunlar yerine sayma. Gerçek kullanıcı anahtarı gelmeden ücretli sağlayıcı isteği yapılmadı.

## Yerel yeniden ekleme

Mevcut emülatörler açıkken kimlikleri/kataloğu reseed etme. Gerekirse `scripts/start-local.ps1` ile servisleri aç.

1. Uygulama: `mobile-src/kutarya-cep/gradlew.bat :app:assembleDebug :app:testDebugUnitTest :app:lintDebug`.
2. Son test APK'yı ve uygulamayı emülatöre yükle; instrumentation raporunu `artifacts/kutarya-cep/android-kabul.txt` içine al.
3. `node scripts/prepare-cep-acceptance.mjs`, PDF builder, `node scripts/package-cep.mjs`, `node scripts/verify-cep-source.mjs`.
4. Gerçek ekranları artifacts/kutarya-cep/goruntuler içine al; `node scripts/install-cep-local.mjs`.
5. `node scripts/verify-cep-site.mjs` mevcut bundled Playwright/Edge ile indirilen dosyaları doğrular. Admin editörü eski metni cache'lediyse Yenile/reload yap; eski editörü kaydetme.

1.0.0 dosyalarını yayınlandıktan sonra değiştirme; yeni kod yeni sürüm/APK ve kabul ister. Kaynak paketleme betiği hazır çıktıları yeniden üretir; üretim sertifikası/anahtarı içermez.

## Canlı sınırı

Kullanıcının açık talebi **deploy yapma**. Firebase Hosting/Functions/Storage kuralları/Auth/claims ve eski AI/mobile/PayTR servisleri değişmedi. `127.0.0.1:9199` görselleri/dosya URL'leri üretime taşınmaz; canlı paylaşım ayrı onay ve `docs/YAYIN.md` akışıyla gerçek admin dosya yüklemesi gerektirir. Yerel inceleme: http://127.0.0.1:5180/proje/kutarya-cep.
