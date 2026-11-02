// Gerçek tarayıcı dönüşümleri; paket/sürüm kabulü ayrı operatör adımıdır.
export const kutaryaConvert = {
  id: "kutarya-convert",
  slug: "kutarya-convert",
  title: "Kutarya Convert",
  subtitle: "Görsel, belge, tablo ve sesi tarayıcında dönüştür.",
  description: [
    "Dosyalarını sürükle veya birlikte seç; her dosya için çıktı biçimini belirle. Kutarya Convert dosyanın içeriğini açıp yeniden yazar. Görseller yeniden kodlanır, ses PCM örneklerine çözülüp WAV veya MP3 olarak kodlanır; PDF, Word ve elektronik tablo dosyaları ayrıştırılır. Kaynak dosyaların korunur. İşlemler tarayıcıda yapılır; seçtiğin dosyalar sunucuya yüklenmez.",
    "Görsellerde boyut, oran, döndürme, kalite ve JPEG arka planı; PDF’lerde metin çıkarma, sayfa seçme, döndürme, ayırma, görsel sayfalar ve birleştirme; tablolarda ayırıcı, başlıklar ve CSV formül koruması; seslerde süre kesme, örnekleme, kanal, ses seviyesi ve MP3 bit hızı ayarları bulunur. Dosyaları tek tek veya hepsini ZIP olarak indirebilirsin. Açık, sıcak, koyu ve sistem görünümü vardır.",
    "Metin tabanlı belge dönüşümleri sayfa tasarımını birebir korumaz. PDF metin katmanı gerektirir; OCR yoktur. GIF’in ilk karesi işlenir. AVIF ve ses girdilerinin açılması tarayıcı kodeklerine bağlıdır. Video, HEIC, eski DOC/XLS ve şifreli belgeler bu sürümün dışında. Desteklenen türler ve sınırlar uygulamanın içindedir.",
    "Tarayıcıda açabilir veya Dosyalar sekmesinden çevrimdışı web paketini ve kaynak kodunu indirebilirsin. Web ZIP içindeki index.html, dönüştürme bileşenlerini içerir; kurulum veya CDN gerekmez.",
  ].join("\n\n"),
  category: "arac",
  kind: "tool",
  engine: "web",
  technology: "JavaScript · Canvas · Web Audio · PDF.js · Web Worker",
  platforms: ["web", "windows", "macos", "linux"],
  license: "Kutarya — Tüm hakları saklıdır; bileşen lisansları paket içinde",
  repository: "",
  tags: ["Dosya dönüştürme", "PDF", "Word", "Excel", "MP3", "Çevrimdışı"],
  requirements:
    "Güncel Chrome, Edge veya Firefox; Web Worker, Canvas ve Web Audio desteği. En fazla 20 dosya, dosya başına 25 MB, toplam 100 MB. Görsel 24 MP, PDF 80 sayfa, ses 5 dakika, metin 5 MB; tablo 50.000 satır / 200 sütun / 200.000 hücre. Büyük işlemler için masaüstü önerilir. Dosyalar bellekte işlenir; sekmeyi kapatmadan çıktılarını indir.",
  controls:
    "Dosya seç veya çalışma alanına sürükle. Satırdaki menüden çıktı seç, sağdaki ayarları belirle ve Dönüştür’e bas. PDF birleştirmek için yalnız PDF’leri ekle; yukarı/aşağı düğmelerinden sırala. Önizle, İndir veya Hepsini ZIP indir. Durdur işlemi sonlandırır; o ana kadar tamamlanan çıktılar korunur.",
  changelog:
    "1.0.0 · Görsel, belge/PDF, tablo ve ses dönüşümleri; çoklu dosya kuyruğu, PDF birleştirme/ayırma, çıktı önizlemesi, toplu ZIP, işlem iptali ve dört görünüm.",
  version: "1.0.0",
  status: "draft",
  featured: true,
  order: 5,
  color: "#096b79",
  devices: ["desktop", "mobile"],
  difficulty: "",
  duration: "",
  runtime: "",
  cover: "",
  gallery: [],
  files: [],
  versions: [],
};
export const kutaryaConvertFiles = [
  { name: "Kutarya-Convert-Web-1.0.0.zip", role: "portable" },
  { name: "Kutarya-Convert-Kaynak-1.0.0.zip", role: "source" },
];
