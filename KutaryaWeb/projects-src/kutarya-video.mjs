// Gerçek Windows paketleri ve gerçek uygulama görüntüleri; canlı yükleme ayrı adımdır.
export const kutaryaVideo = {
  id: "kutarya-video",
  slug: "kutarya-video",
  title: "Kutarya Video",
  subtitle: "İsmini yaz veya linki yapıştır. Videon seçtiğin klasöre insin.",
  description: [
    "YouTube bağlantısını yapıştır; indirme otomatik başlasın. Bağlantıyı bilmiyorsan video adını veya kanalını yaz ve Video bul’a bas. Gerçek YouTube sonuçlarını başlık, kanal, süre ve kapakla gör; istediğin videonun İndir düğmesini seç. Normal videolar, Shorts ve youtu.be bağlantıları desteklenir. Birden fazla video bağlantısını birlikte yapıştırabilirsin; videolar sırayla indirilir.",
    "Videoların nereye kaydedileceğini Kayıt klasörü satırındaki Değiştir düğmesinden seç. Seçimin sonraki açılışta korunur. Uygulama en iyi mevcut video ve ses akışını MP4 dosyasında birleştirir; kalite ayarı gerektirmez. İlerlemeyi izle, indirmeyi iptal et veya yeniden dene. Eski videoları, yeni kayıt klasörü seçtikten sonra da önceki konumlarından açabilirsin.",
    "Ana ekranda devam eden indirmeler ve son işlem görünür. Yüzlerce eski kayıt ekranı uzatmaz: Geçmiş ayrı sekmede, 20 kayıtlık sayfalarda açılır. Tek kaydı veya bütün bitmiş geçmişi temizleyebilirsin. Bu işlem video dosyalarını silmez; devam eden indirmeleri korur. Açık, koyu, canlı ve sistem temalarından seç; tema bilgisayarında saklanır.",
    "Her uygulama açılışında sitede yayımlanmış Kutarya Video sürümü kontrol edilir. Daha yeni sürüm varsa uygulama içinde bildirim görünür; Windows desteklediğinde masaüstü bildirimi de gösterilir. Siteden indir düğmesi güncel proje sayfasını açar. İnternet yoksa indirme alanı kapanmaz; sürüm kontrolünü yeniden deneyebilirsin. Bu özellik 1.1.0’dan sonraki sürümler için kullanılabilir; eski 1.0.0 uygulamasında yoktur.",
    "Üyelik, API anahtarı ve ayrı sunucu kurulumu gerekmez. İndirme araçları paketin içindedir. Uygulama indirme adedi, süre, dosya boyutu veya hız için kendi kotasını uygulamaz; internet bağlantısı, disk alanı ve YouTube erişimi sonucu etkiler. En iyi kalite, ilgili videoda sunulan kaliteye bağlıdır. MP4 birleştirme kodek dönüştürmez; bazı videoları oynatmak için AV1, VP9 veya Opus destekleyen bir oynatıcı gerekir.",
    "Dosyalar bölümünde güncel tek tık Setup ve kurulumsuz EXE bulunur; önceki 1.0.0 dosyaları da korunur. Varsayılan kayıt yeri Setup’ta İndirilenler/Kutarya Video/Videolar; taşınabilir EXE’de kendi yanındaki Videolar klasörüdür. İstersen değiştirebilirsin. Özel veya erişimi kısıtlı videolar, YouTube ağ doğrulaması veya geçici istek sınırı nedeniyle indirilemeyebilir.",
    "Galeri çalışan 1.1.0 uygulamasından alınmıştır; isimle arama ekranındaki sonuçlar gerçek YouTube verisidir. Yeni özelliklerin yerel ve paket kabulü yapılmıştır. Yeni sürümün gerçek indirme denemesinde test ağında YouTube 429/doğrulama engeli görüldü; bu deneme tamamlanmış indirme olarak sunulmaz. Eski 1.0.0’ın ayrı 1080p video/ses kabulü bu yeni denemenin yerine sayılmaz. Windows kurulum, kısayol ve kaldırma kabulü henüz yapılmadı. Paket kod imzalı değildir; Windows yayıncı uyarısı gösterebilir.",
  ].join("\n\n"),
  category: "uygulama",
  kind: "desktop",
  engine: "download",
  technology: "Electron · HTML/CSS · yt-dlp · FFmpeg",
  platforms: ["windows"],
  license: "MIT; üçüncü taraf bileşenlerin lisansları paket içinde",
  repository: "",
  tags: [
    "YouTube",
    "Shorts",
    "MP4",
    "Video indirme",
    "İsimle arama",
    "Tema",
  ],
  requirements:
    "Windows 10/11 64 bit, internet bağlantısı ve uygulama ile indirilecek videolar için yeterli boş disk alanı. Setup ve taşınabilir EXE yaklaşık 183 MB’tır; uygulama açılırken/kurulurken ek boş alan gerekir. İndirme araçları pakete dahildir. Yüksek kaliteli AV1/VP9/Opus dosyaları için bu kodekleri destekleyen bir oynatıcı kullan.",
  controls:
    "Setup: Kutarya-Video-Setup-1.1.0.exe dosyasını indirip çalıştır. Yönetici izni istemez; kurulum sonunda uygulama otomatik açılmaz. Kutarya Video açıksa onu kendin kapatıp kurulumu tekrar başlat. Güncelleme sırasında geçmiş ve video dosyaların korunur.\n\nTaşınabilir: Kutarya-Video-Portable-1.1.0.exe dosyasını yazılabilir bir klasöre koy ve aç. Eski taşınabilir sürümün Veriler klasörünün yanında açarsan geçmiş/ayarları kullanır. Varsayılan videolar EXE yanındadır; kayıt klasörünü değiştirebilirsin.\n\nİndirme: YouTube bağlantısını yapıştır; otomatik başlar. Veya video adını yaz, Video bul’a bas, sonuçlardan doğru videonun İndir düğmesini seç. Birden fazla bağlantıyı boşluk/yeni satırla ayır.\n\nKayıt klasörü: Değiştir ile seç; yeni eklenen videolar o klasöre iner. Geçmiş: Geçmiş sekmesinden tek kaydı veya tüm geçmişi temizle; video dosyaların silinmez. Tema: üstte Açık/Koyu/Canlı/Sistem seç. Yeni sürüm bildirimi geldiğinde Siteden indir’e bas.",
  changelog:
    "1.1.0 · Video adıyla gerçek YouTube araması ve sonuçtan indirme; kalıcı kayıt klasörü seçimi; ana ekranda kısa liste ve 20 kayıtlık Geçmiş sayfaları; tek kayıt/tüm geçmiş temizliği; dört kalıcı tema; sade, canlı renkli arayüz; her açılışta sitedeki uygulama sürümünü kontrol edip yeni sürümü bildirme. Mevcut otomatik link indirme, sıralı kuyruk, en iyi mevcut kalite, MP4, iptal/yeniden deneme, tepsi ve motor güncellemesi korunur. Test ağındaki YouTube indirme erişim engeli ve gerçek Windows kurulum kabulü açık sınırlardır.",
  version: "1.1.0",
  status: "draft",
  featured: true,
  order: 7,
  color: "#7051e8",
  devices: ["desktop"],
  difficulty: "",
  duration: "",
  runtime: "",
  cover: "",
  gallery: [],
  files: [],
  versions: [],
};

export const kutaryaVideoFiles = [
  {
    name: "Kutarya-Video-Setup-1.1.0.exe",
    role: "installer",
    source: "Kutarya-Video-Setup-1.1.0.exe",
    platform: "windows",
  },
  {
    name: "Kutarya-Video-Portable-1.1.0.exe",
    role: "portable",
    source: "Kutarya-Video-Portable-1.1.0.exe",
    platform: "windows",
  },
];

export const kutaryaVideoImages = [
  {
    name: "01-arayuz.png",
    role: "cover",
    caption: "1.1.0: isim veya link alanı, kayıt klasörü ve kısa indirme listesi",
  },
  {
    name: "03-arama.png",
    role: "gallery",
    caption: "Gerçek YouTube isim araması: başlık ve kanalla video seçimi",
  },
  {
    name: "tema-dark.png",
    role: "gallery",
    caption: "Koyu tema",
  },
  { name: "tema-vivid.png", role: "gallery", caption: "Canlı tema" },
];
