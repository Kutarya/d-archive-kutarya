// Kullanıcının gerçek C# okul projesi; paketler doğrulanmadan yayınlanmaz.
export const kutaryaOs = {
  id: "kutarya-os",
  slug: "kutarya-os",
  title: "Kutarya OS",
  subtitle: "Sana ait bir sanal masaüstü. C# Windows Forms ile geliştirildi.",
  description: [
    "Kutarya OS, nesne yönelimli programlama dersi için geliştirilen bir Windows masaüstü simülasyonudur. İlk açılışta cihazına bir ad ver, bilgisayarında algılanan donanıma göre sanal RAM/VRAM bütçelerini ve dosya alanını seç. Bu bütçeler simülasyon içindir; uygulama gerçek bir sanal makine çalıştırmaz. Masaüstünde dosyalar, notlar, hesap makinesi, kaynak izleyici, çöp kutusu ve üç görünüm bulunur.",
    "Sağdaki Kutarya Us panelinde kendi API’ni bağlayabilir veya yaklaşık 640 MB yerel modeli indirerek bilgisayarında çalıştırabilirsin. Yerel model panel açıldığında otomatik yüklenir; kısa sohbet ve basit dosya görevleri için uygundur. AI yalnız sanal Masaüstü ve alt klasörlerinde dosya veya klasör oluşturabilir. Ana bilgisayara taşıma işlemini Dosyalar uygulamasından hedef seçerek sen başlatırsın.",
    "Kurulum, taşınabilir sürüm ve C# kaynakları Dosyalar sekmesindedir. Ders planı, OOP anlatımı ve risk haritası paketlerin içindeki belgelerde yer alır.",
  ].join("\n\n"),
  category: "uygulama",
  kind: "desktop",
  engine: "download",
  technology: "C# · Windows Forms · .NET 10",
  platforms: ["windows"],
  license: "Kutarya — Tüm hakları saklıdır",
  repository: "",
  tags: ["OOP", "Windows Forms", "Kutarya Us", "Yerel AI", "Kaynak kod"],
  requirements:
    "Windows x64. Kurulum ve taşınabilir paket .NET çalışma zamanını içerir; kullanmak için SDK gerekmez. Taşınabilir ZIP’in tamamını aynı klasöre çıkart. Sanal dosyaların için yeterli boş disk alanı gerekir.\n\nYerel AI modeli pakete dahil değildir: ilk indirme internet ve yaklaşık 640 MB ek alan ister; CPU üzerinde çalışır. Kendi API seçeneği bağlantı bilgilerini ve interneti gerektirir.\n\nKaynak kodu derlemek için .NET 10 SDK veya uygun Visual Studio kurulumu gerekir.",
  controls:
    "Kurulum: Setup dosyasını indirip çalıştır.\nTaşınabilir: ZIP’i tamamen çıkart, KutaryaOS.exe’yi aç.\n\nİlk ekranda cihazını yapılandır. Kutarya Us düğmesinden Kendi API’ni bağla veya Yerel model indir seç.\n\nAna PC’ye aktarım: Dosyalar → öğeyi seç → Ana PC’ye taşı → Hedef klasör seç → Taşımayı başlat.\n\nKaynak ZIP içindeki README ve docs klasörü okul sunumunu ve geliştirme adımlarını açıklar.",
  changelog:
    "0.3.0 · Yerel AI ve kendi API için dosya işlemleri yalnız sanal Masaüstüne sınırlandı. Kullanıcı başlatmalı ana PC’ye dosya ve klasör taşıma; kilit, SHA doğrulaması ve çakışmasız isimler eklendi. Üç görünüm, ilk kurulum, yerel model indirme ve panelde otomatik yükleme, güncel uygulama görüntüleri ve ders belgeleri paketlendi.",
  version: "0.3.0",
  status: "draft",
  featured: true,
  order: 4,
  color: "#5279b5",
  devices: ["desktop"],
  difficulty: "",
  duration: "",
  runtime: "",
  cover: "",
  gallery: [],
  files: [],
  versions: [],
};

export const kutaryaOsFiles = [
  { name: "KutaryaOS-Setup-0.3.0-x64.exe", role: "installer" },
  { name: "KutaryaOS-Windows-x64-0.3.0.zip", role: "portable" },
  { name: "KutaryaOS-Kaynak-0.3.0.zip", role: "source" },
];

export const kutaryaOsImages = [
  { name: "uygulamalar.png", role: "cover" },
  { name: "ilk-kurulum.png", role: "gallery" },
  { name: "ai-secimleri.png", role: "gallery" },
  { name: "ana-pc-aktarim.png", role: "gallery" },
  { name: "kucuk-ekran.png", role: "gallery" },
];
