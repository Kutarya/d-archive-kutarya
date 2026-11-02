// Gerçek Java/Android okul projesi; diğer katalog kayıtlarına dokunmadan eklenir.
export const kutaryaCep = {
  id: "kutarya-cep",
  slug: "kutarya-cep",
  title: "Kutarya Cep",
  subtitle: "Sohbetin, geçmişin ve hafızan cebinde. Java ile Android için.",
  description: [
    "Kutarya Cep, Android Studio için Java ile geliştirilen AI sohbet uygulamasıdır. Kutarya Us ile konuş, geçmişte ara, sohbetlerini sabitle ve tercihlerini hafızaya kaydet. Sohbetler, mesaj durumları, zamanlar ve hafıza cihazındaki SQLite veritabanında tutulur. Ayrı Kutarya sunucusu veya hesap kurulumu gerekmez.",
    "OpenAI, OpenRouter, Gemini ve Grok / xAI için kendi API anahtarını bağlayabilirsin. Dört sağlayıcının anahtar/model profilleri ayrı saklanır; model kimliği elle girilir veya sağlayıcıdan alınır. Yanıtlar akarak görünür, durdurulabilir ve kesilen yanıt kullanıcı isteğiyle yeniden denenebilir. API anahtarları Android Keystore üzerinden AES-GCM ile şifrelenir; APK veya kaynak ZIP içinde ortak anahtar yoktur.",
    "Hatırla: …, Bundan sonra … ve Adım … gibi açık ifadeler yerelde hafızaya alınır. Hafıza notlarını gör, düzenle, kapat veya sil; elle global veya sohbete özel not ekle. AI cevapları otomatik hafıza sayılmaz. Her istekte seçilen geçmiş ve aktif notlar sağlayıcıya gönderilir. Eski mesajlar bağlam bütçesine sığmazsa sayıları gösterilir; kayıtlar cihazdan silinmez.",
    "Açık, koyu ve sistem teması; yörünge/mesaj animasyonları, hareketi kapatma, kopyalama, paylaşma, sistem sesle yazma/okuma ve dosya seçicisiyle yedek alma/ekleme bulunur. Okul dosyası; 15 iş günü / 60 saatlik öneri zaman dağılımı, 12 riskin puan/önlem/durum tablosu, OOP ve SQLite anlatımı, sunum provası içerir. Bu süreler fiilen harcanmış saat olarak sunulmaz.",
    "Dosyalar bölümünde kurulabilir test APK, tam Android Studio Java kaynak ZIP ve okul PDF'si var. AI yanıtı için internet, kendi API anahtarın ve sağlayıcı erişimi gerekir; cihazda dil modeli çalıştırılmaz. SQLite/Keystore ve kontrollü API emülatör testleri yapıldı; gerçek sağlayıcı anahtarı, fiziksel telefon ve ses hizmeti kabulü henüz ölçülmedi. Sohbet galerisindeki yanıt açıkça kontrollü test düzeneği olarak işaretlidir.",
  ].join("\n\n"),
  category: "uygulama",
  kind: "mobile",
  engine: "download",
  technology: "Java · Android SDK · SQLite · Android Keystore · REST/SSE",
  platforms: ["android"],
  license: "Kutarya — Eğitim amaçlı kaynak inceleme; tüm hakları saklıdır",
  repository: "",
  tags: [
    "Android Studio",
    "Java",
    "SQLite",
    "Kutarya Us",
    "Hafıza",
    "Kaynak kod",
  ],
  requirements:
    "Android 8.0 / API 26 veya sonrası. AI için internet ve seçtiğin sağlayıcının kendi API anahtarı/metin modeli gerekir. API kotası ve ücretleri sağlayıcı hesabına bağlıdır. Sistem ses hizmeti cihazda bulunmayabilir.\n\nKaynak derleme: Android Studio, JDK 17+ (JBR 21 ile ölçüldü), Android SDK 36, Gradle Wrapper 9.4.1, AGP 9.2.1. İlk Gradle eşitlemesi internet ister. Fiziksel telefon/FPS ölçümü yapılmadı.",
  controls:
    "APK: Dosyalar sekmesindeki APK'yı indir ve Android'de aç. Paket okul incelemesi için debug sertifikalı test sürümüdür; Play Store yayını değildir.\n\nAyarlar → sağlayıcı → kendi API anahtarı → model kimliği → Bağlantıyı kaydet. Model listesini sağlayıcıdan getirebilirsin. Sohbet ekranından mesaj gönder; kare düğmeyle yanıtı durdur.\n\nHafıza: Hatırla: … yaz veya mesaj menüsünden Hafızaya kaydet. Hafıza ekranından notları yönet. Sohbet silindiğinde ona bağlı notlar da silinir.\n\nKaynak ZIP'i tamamen çıkart, settings.gradle bulunan klasörü Android Studio'da aç. README ve docs klasörü ders anlatımı/test komutlarını içerir. Okul PDF'sini ayrı indir. JSON/Markdown yedekler şifresizdir ve API anahtarı içermez.",
  changelog:
    "1.0.0 · İlk Java/Android sürümü. SQLite sohbet/geçmiş/arama/sabitleme, düzenlenebilir kalıcı hafıza, dört resmî API adapter, streaming/iptal/yeniden deneme, Keystore anahtarları, üç tema/animasyon, sistem ses hizmetleri, JSON/Markdown dışa aktarma ve eklemeli yedek import. APK, tam kaynak ve okul plan/risk PDF'si. Yerel katalog paylaşımı; Firebase deploy yapılmadı.",
  version: "1.0.0",
  status: "draft",
  featured: true,
  order: 6,
  color: "#6958e8",
  devices: ["mobile"],
  difficulty: "",
  duration: "",
  runtime: "",
  cover: "",
  gallery: [],
  files: [],
  versions: [],
};
export const kutaryaCepFiles = [
  { name: "Kutarya-Cep-Android-1.0.0-test.apk", role: "installer" },
  { name: "Kutarya-Cep-Java-Kaynak-1.0.0.zip", role: "source" },
  { name: "Kutarya-Cep-Okul-Dosyasi-1.0.0.pdf", role: "document" },
];
export const kutaryaCepImages = [
  { name: "01-karsilama.png", role: "cover" },
  { name: "02-api-ayarlari.png", role: "gallery" },
  { name: "03-hafiza.png", role: "gallery" },
  { name: "04-gecmis.png", role: "gallery" },
  { name: "05-sohbet-test-duzenegi.png", role: "gallery" },
  { name: "06-koyu-tema.png", role: "gallery" },
];
