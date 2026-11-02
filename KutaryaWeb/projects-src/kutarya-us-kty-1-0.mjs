// Gerçek KTY-1.0 checkpointi; yalnız 10.000. adımdaki ağırlıklar ve çalıştırma kodu.
export const kutaryaKtyCheckpoint = {
  id: "kutarya-us-kty-1-0",
  slug: "kutarya-us-kty-1-0",
  title: "Kutarya Us · KTY-1.0",
  subtitle: "10.000. adım checkpoint'i · 50,06 milyon parametre.",
  description: [
    "KTY-1.0 modelinin tam 10.000. eğitim adımında kaydedilmiş ağırlıkları. Model 50.055.680 parametre, yani yaklaşık 50,06 milyon parametre içerir. Daha sonraki adımlar bu sürüme dahil değildir.",
    "İndirme paketi checkpoint ile birlikte modeli yüklemek için model.py, bayt tokenizer'ı, yalnız mimari ve üretim ayarları, generate.py, bağımlılık listesi, kullanım açıklaması ve SHA-256 manifesti içerir. Eğitim verisi, train.py, eğitim günlükleri, optimizer durumu, rastgele sayı üreteci durumu ve veri kümesi bilgileri pakete eklenmedi.",
    "Ağırlıklar kaynak checkpoint ile tensör bazında birebir doğrulandı; yeniden eğitim veya quantization uygulanmadı. Model UTF-8 baytlarıyla çalışır: sözlük 256, bağlam 768 bayt, embedding boyutu 640, 10 Transformer katmanı, 10 dikkat başlığı ve 2.560 ileri besleme boyutu. Türkçe karakterler birden fazla bayt olabilir.",
    "Paket CPU üzerinde temiz klasöre çıkarılarak strict checkpoint yükleme, parametre sayısı, sonlu ağırlıklar, ileri geçiş ve gerçek metin üretimi ile kontrol edildi. Bu bir ara checkpoint paylaşımıdır; kapsamlı cevap kalitesi veya GPU performans ölçümü yapılmadı.",
  ].join("\n\n"),
  category: "acik-kaynak",
  kind: "source",
  engine: "source",
  technology: "Python · PyTorch · Transformer",
  platforms: ["all"],
  license: "Lisans belirtilmedi",
  repository: "",
  tags: ["Python", "PyTorch", "Yapay zekâ", "Checkpoint", "KTY-1.0"],
  requirements:
    "64 bit Python ve PyTorch gerekir. Paket Windows, Python 3.12 ve PyTorch 2.14.1+cpu ile doğrulandı. Kullanım yerel Python ortamındadır; web sayfası indirme ve açıklama sunar.",
  controls: `ZIP dosyasını tek klasöre çıkarın. pip install -r requirements.txt ile bağımlılığı kurun. python generate.py --prompt "selam" --greedy komutu checkpoint'i yükleyip cevap üretir. Etkileşimli sohbet için python generate.py çalıştırın. Checkpoint varsayılan olarak paketteki kty-1.0-step10000.pt dosyasından yüklenir; eğitim verisi gerekmez.`,
  changelog:
    "1.0.0-step10000 · Tam 10.000. adım ağırlıkları. 50.055.680 parametre. Yalnız inference checkpoint'i ve çalıştırma dosyaları; model tensörleri kaynakla aynı. Eğitim verisi veya optimizer durumu içermez.",
  version: "1.0.0-step10000",
  status: "draft",
  featured: true,
  order: 10,
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

export const kutaryaKtyCheckpointPackage = {
  name: "Kutarya-Us-KTY-1.0-Adim-10000.zip",
  source: "D:/KTY-1.0/checkpoints/kty-1.0-v4-50m-step010000.pt",
  role: "source",
  platform: "all",
};
