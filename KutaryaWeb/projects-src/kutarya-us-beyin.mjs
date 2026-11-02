// Yalnız model mimarisi; tek Python dosyası kaynak kod olarak paylaşılır.
export const kutaryaUsBeyin = {
  id: "kutarya-us-beyin",
  slug: "kutarya-us-beyin",
  title: "Kutarya Us Model Beyni",
  subtitle: "Sıfırdan eğitilmeye hazır, tek dosyalık Python modeli.",
  description: [
    "Kutarya Us için PyTorch ile hazırlanmış, sıfırdan eğitilmeye hazır bir dil modeli mimarisi. Kaynak paketinde yalnız kutarya_us_beyin.py dosyası bulunur. Eğitim verisi, eğitim döngüsü veya eğitilmiş ağırlık pakete dahil değildir. Model oluşturulduğunda ağırlıklar rastgele başlatılır.",
    "Model UTF-8 baytlarıyla çalışır: 256 baytlık sözlük, 1.024 bayt bağlam, 256 embedding boyutu, 6 Transformer decoder katmanı ve 8 dikkat başlığı. Varsayılan yapı 5.052.928 parametre içerir. Bağlamın birimi bayttır; Türkçe karakter sayısı ile aynı değildir.",
    "Nedensel attention her konumun yalnız kendisini ve önceki konumları görmesini sağlar. LayerNorm, artık bağlantılar, GELU ileri besleme katmanları ve paylaşılan giriş/çıkış ağırlıkları kullanılır. KutaryaUsConfig ile model boyutları eğitim öncesinde değiştirilebilir.",
    "forward metodu her konumun sonraki bayt tahmin skorlarını verir; dışarıdan hedefler verilirse loss hesaplar. Bu kodun anlamlı metin üretmesi için ayrıca eğitilmesi gerekir. Paketin çalıştırılması yalnız model mimarisini ve parametre sayısını gösterir.",
  ].join("\n\n"),
  category: "acik-kaynak",
  kind: "source",
  engine: "source",
  technology: "Python · PyTorch · Transformer",
  platforms: ["all"],
  license: "Lisans belirtilmedi",
  repository: "",
  tags: ["Python", "PyTorch", "Yapay zekâ", "Transformer", "Model mimarisi"],
  requirements:
    "Python 3.10 veya üzeri ve PyTorch gerekir. Kaynak kod Windows üzerinde PyTorch 2.14.1+cpu ile kontrol edildi. GPU doğrulaması yapılmadı.",
  controls:
    "ZIP paketini indirin ve çıkarın. Paketteki kutarya_us_beyin.py dosyasını kod editörünüzde açın. PyTorch kurulu Python ortamında python kutarya_us_beyin.py komutu model bilgisini gösterir. Başka bir Python dosyasında from kutarya_us_beyin import KutaryaUs, KutaryaUsConfig ile kullanabilirsiniz. Eğitim verisi ve eğitim kodu ayrıca hazırlanmalıdır.",
  changelog:
    "1.0.0 · İlk model mimarisi paylaşımı. Tek Python dosyası; eğitim verisi ve eğitilmiş ağırlık içermez. CPU üzerinde ileri geçiş, nedensellik, loss/gradyan, farklı boyutlar ve geçersiz girdiler için 7 kontrol grubu geçti.",
  version: "1.0.0",
  status: "draft",
  featured: true,
  order: 9,
  color: "#315ba8",
  devices: ["desktop"],
  difficulty: "",
  duration: "",
  runtime: "",
  cover: "",
  gallery: [],
  files: [],
  versions: [],
};

export const kutaryaUsBeyinPackage = {
  name: "Kutarya-Us-Model-Beyni-1.0.0.zip",
  source: "kutarya_us_beyin.py",
  role: "source",
  platform: "all",
};
