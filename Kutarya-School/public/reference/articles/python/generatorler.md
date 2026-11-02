---
title: "Python Generator ve Iterator Mantığı"
type: "technical-article"
canonical: "https://kutarya.com/konu/python/generatorler"
publisher: "Kutarya"
language: "tr-TR"
technology: "Python"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Python Generator ve Iterator Mantığı

Python generator/iterator protokolü, yield semantiği, tembel değerlendirme, tek kullanımlık iterator davranışı ve bellek etkileri.

**Canonical:** https://kutarya.com/konu/python/generatorler
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** Python
**Referans kapsamı:** Python 3.x iterator protokolü ve standart kütüphane.

## Özet

Generator bütün sonuçları baştan listeye koymak yerine ihtiyaç oldukça değer üretir. Bu, büyük veya sonsuz veri akışlarında bellek kullanımını düşürebilir; fakat iterator’ın tüketildikten sonra yeniden başa dönmediğini bilmek gerekir.

Generator, tüm sonucu bellekte oluşturmadan değerleri ihtiyaç oldukça üretir. Bu davranış büyük veri akışlarında bellek avantajı sağlayabilir ancak iterator’ın tüketilmesi ve yeniden kullanılamaması gibi farklı bir yaşam döngüsü getirir.

Makale iterable ile iterator ayrımını ve zincirlenen generator işlemlerinde hatanın çoğu zaman verinin üretildiği anda değil tüketildiği anda görünmesini özellikle ele alır.

## Kapsam maddeleri

- Iterable ve iterator farkını ayırmak
- yield akışını anlamak
- Büyük veriyi tembel işlemek
- Tek kullanımlık iterator sürprizlerini teşhis etmek

## Temel kavramlar

### Iterable

Üzerinde iter() çağrılarak iterator alınabilen nesnedir.

### Iterator

next() ile sıradaki değeri üretir ve bittiğinde StopIteration verir.

### Generator

yield kullanan fonksiyonun oluşturduğu, yürütme durumunu değerler arasında koruyan iterator türüdür.

## Teknik açıklama

### Generator yürütmeyi durdurur, sonucu değil

yield çalıştığında fonksiyon tamamen bitmez; yerel değişkenler ve yürütme konumu korunur. Bir sonraki next çağrısında kaldığı yerden devam eder. Bu zihinsel model, generator’ın neden normal return eden fonksiyondan farklı olduğunu açıklar.

Generator function çağrıldığında gövde hemen tam çalışmaz; generator nesnesi döner. Gerçek yürütme tüketim başladığında ilerler.

- yield sonrası state korunur.
- Üretim tüketim talebiyle ilerler.
- Generator çağrısı ile tüketimi ayır.

### Lazy her zaman daha hızlı demek değildir

Generator çoğu zaman daha az peak memory kullanır fakat her eleman için Python iterator overhead’i vardır. Küçük veri setlerinde liste daha basit ve bazen daha hızlı olabilir.

Doğru seçim için veri boyutu, tekrar kullanım ve işlem zinciri birlikte düşünülmelidir.

- Bellek ve CPU maliyetini ayrı ölç.
- Küçük veride sadeliği koru.
- Tek geçişli akışta generator güçlüdür.

### Kaynak yaşam süresi generator tasarımının parçasıdır

Dosya açan generator, tüketim tamamlanana kadar dosyayı açık tutabilir. Generator hiç tamamen tüketilmezse kaynağın ne zaman kapanacağı önem kazanır.

Kaynak sahipliğini net tut; gerekiyorsa context manager ile generator kullanımını birlikte tasarla veya veriyi dosya açıkken kontrollü tüket.

- Açık dosyanın yaşam süresini bil.
- Generator’ı sonsuza kadar saklama.
- Kaynak kapanışını test et.

## Teknik iddialar ve kaynak notları

### Iterator protokolü ve yield

Generator fonksiyonu yield içerdiğinde çağrı anında bütün gövdeyi yürütüp liste üretmek yerine iterator benzeri generator nesnesi döndürür. Her next çağrısı yürütmeyi kaldığı noktadan sürdürür; bu davranış veriyi talep oldukça üretmeye izin verir.

**Birincil referans:** [1]

### Tembel zincirleme

itertools araçları iterator tabanlı akışları ara koleksiyon oluşturmadan birleştirmeyi destekler. Bellek avantajı önemli olabilir; fakat veri kaynağı tek kullanımlıksa ikinci iterasyon boş sonuç verebilir ve hata, pipeline tanımlandığı anda değil eleman gerçekten tüketildiğinde ortaya çıkabilir.

**Birincil referans:** [2], [1]

## Sınır durumları

- Generator tüketildikten sonra başa sarılmaz; yeniden üretmek için generator fonksiyonu tekrar çağrılmalıdır.
- Generator içindeki finally/temizlik kodunun ne zaman çalışacağı tüketim/close yaşam döngüsüne bağlıdır.
- Tembel değerlendirme, veri kaynağı daha sonra değişiyorsa beklenmeyen zamanlama etkileri oluşturabilir.
- Her generator bellek sorununu çözmez; üretilen nesneler başka yerde tutuluyorsa toplam bellek yine büyüyebilir.

## Uygulama vakası

### Milyon satırlık CSV’de gereksiz materialization

**Bağlam**

İşlem hattı önce dosyanın tüm satırlarını list() ile belleğe alır, sonra filter/map benzeri adımlar uygular. Dosya büyüdüğünde süreç RAM sınırına yaklaşır. Kod küçük örneklerde hızlı olduğu için sorun test ortamında görünmez.

**Teknik analiz**

Satırlar generator olarak okunur ve dönüşüm aşamaları tembel iterator zincirine çevrilir. Ancak aynı verinin iki kez gezilmesi gereken raporlama adımı ayrıca ele alınır; tek kullanımlı iteratorı ikinci kez tüketmek yerine gerekli özet state’i ilk geçişte hesaplanır.

**Beklenen sonuç**

Peak memory veri boyutuyla doğrusal büyümekten çıkar ve belirli tamponlarla sınırlanır. Pipeline throughput ve hata satırı konumu ölçülür.

### İzlenecek sinyaller

- Peak RSS/bellek kullanımı
- İşlenen satır/saniye
- Iteratorın kaç kez tüketildiği
- Kaynak kapatma zamanı

## Kod ve çalışma akışı

### Büyük log dosyasını tembel filtrele


```python
from pathlib import Path
from collections.abc import Iterator

def hata_satirlari(path: Path) -> Iterator[str]:
    with path.open(encoding="utf-8") as dosya:
        for satir in dosya:
            satir = satir.rstrip("\n")
            if "ERROR" in satir:
                yield satir

for hata in hata_satirlari(Path("app.log")):
    print(hata)
```

1. Dosya satır satır okunur.
2. Yalnız eşleşen satırlar yield edilir.
3. Fonksiyon tüm sonuçları bellekte listelemez.
4. for döngüsü iterator protokolünü otomatik kullanır.

## Tasarım seçenekleri

### List comprehension

Veri küçükse ve sonucu birden fazla kez kullanacaksan liste daha basit olabilir.

### itertools

Zincirleme, dilimleme ve kombinasyon gibi tembel iterator işlemlerinde standart araçlar sunar.

## Arıza biçimleri

### Generator ikinci döngüde boş

- **Olası neden:** Aynı iterator ilk döngüde tüketilmiştir.
- **Teşhis / düzeltme:** Yeniden generator oluştur veya tekrar kullanım gerekiyorsa sonucu materialize et.

### TypeError: object is not an iterator

- **Olası neden:** Iterable ile iterator protokolü karıştırılmıştır.
- **Teşhis / düzeltme:** iter(obj) ile iterator al; __iter__ ve __next__ rollerini ayır.

## Üretim ve işletim notları

- Akışın tek kullanımlı olup olmadığını API sözleşmesinde açıklaştır.
- Büyük dosya/DB cursor kullanımında kaynağın yaşam süresini generator tüketimiyle uyumlu yönet.
- Pipeline hata noktasını gözlemleyebilmek için sınır aşamalarında ölçüm/log ekle.
- Tekrar iterasyon gerekiyorsa iterator yerine yeniden üretilebilir iterable veya materialized koleksiyon seç.

## Birincil referanslar

1. [Python docs — Generators](https://docs.python.org/3/tutorial/classes.html#generators)
2. [Python docs — itertools](https://docs.python.org/3/library/itertools.html)

## Doğrulama senaryoları

- CSV satırlarını koşula göre yield eden generator yaz.
- Generator expression ile liste comprehension bellek kullanımını karşılaştır.
- itertools.islice ile ilk 10 sonucu tüket.

## Üretim kontrol listesi

- [ ] Sonucun tekrar kullanılıp kullanılmayacağı biliniyor.
- [ ] Büyük veri gereksiz listeye çevrilmiyor.
- [ ] Kaynak yaşam süresi generator ile uyumlu.
- [ ] Yan etkili generator birden fazla tüketilmiyor.

---
Bu dosya https://kutarya.com/konu/python/generatorler sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
