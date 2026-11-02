---
title: "C# SOLID İlkeleri"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/solid"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# SOLID İlkeleri

SOLID ilkelerinin değişiklik maliyeti, bağımlılık yönü, soyutlama seviyesi ve test edilebilirlik üzerindeki teknik etkileri.

**Canonical:** https://kutarya.com/konu/csharp/solid
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** .NET mimari ilkeleri ve nesne yönelimli tasarım.

## Özet

SOLID’i ezberlenecek beş slogan değil, değişiklik maliyetini ve bağımlılık yönünü sorgulayan tasarım araçları olarak örneklerle kullan.

SOLID ilkeleri mekanik kurallar değil, değişimin hangi sınıra çarptığını incelemek için kullanılan tasarım sezgileridir. Her ilkeyi her sınıfa ayrı ayrı uygulamak aşırı soyutlama ve gereksiz indirection üretebilir.

Makale ilkeleri slogan düzeyinden çıkarıp somut değişiklik senaryoları üzerinden değerlendirir; amaç daha fazla interface veya sınıf üretmek değil, değişikliğin yayılım alanını kontrol etmektir.

## Kapsam maddeleri

- Her ilkenin çözdüğü değişim baskısını görmek
- Aşırı soyutlamadan kaçınmak
- Kod kokusundan tasarım kararına gitmek
- İlkeleri test edilebilirlikle ilişkilendirmek

## Temel kavramlar

### S — Tek sorumluluk

Bir modülün tek işi olması değil, tek tür aktör veya değişim nedeni için sorumlu olmasıdır.

### O — Açık/kapalı

Davranış yeni uygulamayla genişlerken istikrarlı kullanan kod değiştirilmez.

### L — Liskov

Alt tür, taban sözleşmenin beklenen davranışını daraltmaz veya şaşırtmaz.

### I/D — Ayrılmış interface ve ters bağımlılık

İstemci yalnız kullandığı role ve üst katmanın tanımladığı soyutlamaya bağlanır.

## Teknik açıklama

### SOLID kontrol listesi değil değişim maliyeti aracıdır

SOLID ilkeleri kodu “doğru” veya “yanlış” diye etiketlemek için kullanılmamalıdır. Temel hedef, değişiklik geldiğinde alakasız bölümlerin kırılmasını azaltmaktır. Bir sınıfın tek sorumluluğu demek tek metodu olması değil, tek ana değişme nedeni olmasıdır.

İlkeleri mekanik uygularsan onlarca küçük sınıf ve interface üretip sistemi takip etmeyi zorlaştırabilirsin. Her soyutlamanın okuma, gezinme ve bakım maliyeti vardır.

- İlkeyi değişim senaryosuyla test et.
- Sınıf sayısını kalite metriği yapma.
- Soyutlamanın maliyetini de hesaba kat.

### Open/Closed çoğu zaman strateji sınırında işe yarar

Yeni davranış türlerinin sık eklendiği ödeme, fiyatlama veya bildirim gibi noktalarda sabit bir sözleşme ve yeni uygulamalar eklemek mevcut akışı koruyabilir. Fakat her ihtimali önceden soyutlamaya çalışmak gereksiz mimari üretir.

Önce ikinci gerçek implementasyon ihtiyacı oluştuğunda desen daha net görünür. Geleceği tahmin etmek yerine değişiklik geçmişini izle.

- Sık büyüyen davranış ailesini ayır.
- Hayali gereksinimler için framework kurma.
- İkinci gerçek örnek soyutlamayı doğrulamak için iyi sinyaldir.

### Dependency Inversion bağımlılık yönüyle ilgilidir

Üst seviye iş kuralı, alt seviye teknik ayrıntının şekline göre tasarlanmamalıdır. Örneğin sipariş akışı belirli bir HTTP istemcisini değil, ödeme yapma yeteneğini bilmelidir.

Buradaki amaç her sınıfa interface eklemek değil; önemli iş kurallarını değişken altyapı ayrıntılarından korumaktır.

- İş kuralını altyapı ayrıntısından ayır.
- Sözleşmeyi üst seviye ihtiyaca göre tasarla.
- Her bağımlılık için interface zorunlu değildir.

## Teknik iddialar ve kaynak notları

### İlkeler amaç değil teşhis aracıdır

SOLID, nesne yönelimli tasarımda değişiklik maliyetini düşünmek için kullanılan bir ilkeler kümesidir. .NET mimari rehberlerindeki separation of concerns, dependency inversion ve explicit dependencies gibi ilkeler de aynı hedefe yaklaşır: değişikliklerin gereksiz katmanlara yayılmasını azaltmak.

**Birincil referans:** [1]

### Aşırı soyutlama riski

Bir sınıfı sırf “tek sorumluluk” adına çok sayıda küçük sınıfa bölmek veya her bağımlılığın önüne interface koymak otomatik kalite sağlamaz. Tasarım kararı gerçek değişiklik eksenleri, bağımlılık yönü ve test/operasyon gereksinimleriyle ölçülmelidir.

**Birincil referans:** [1]

## Sınır durumları

- SRP “tek metot” veya “tek iş” anlamına gelmez; aynı aktöre/aynı değişim nedenine ait davranışlar birlikte olabilir.
- OCP sonsuz eklenti noktası yaratmak değildir; beklenen varyasyon sınırında değişiklik maliyetini düşürmeyi hedefler.
- LSP yalnız tip uyumluluğu değil davranış beklentilerinin korunmasıyla ilgilidir.
- DIP uygulanırken domain katmanının altyapı detayına bağımlı hâle gelmemesi hedeflenir; her interface domain soyutlaması değildir.

## Uygulama vakası

### SOLID adına aşırı katmanlanan basit iş akışı

**Bağlam**

Basit bir profil güncelleme akışı controller → manager → service → handler → repository zincirine bölünmüştür. Her katman yalnız bir sonraki metodu çağırır. Yeni alan eklendiğinde beş dosya değişir, fakat hiçbir katman ayrı politika veya bağımlılık sınırı sağlamaz.

**Teknik analiz**

Katmanlar gerçek değişiklik nedenlerine göre yeniden değerlendirilir. Validation, domain kuralı ve persistence farklı sorumluluklar olarak korunur; yalnız forwarding yapan katmanlar kaldırılır. Dependency inversion yalnız dış altyapı sınırında tutulur.

**Beklenen sonuç**

Akış daha az indirection ile okunabilir olur; testler davranış sınırlarına taşınır. Değişiklikte dokunulan dosya sayısı azalırken dış bağımlılığın değiştirilebilirliği korunur.

### İzlenecek sinyaller

- Bir feature değişikliğinde dokunulan modül sayısı
- Yalnız forwarding yapan sınıf/metot sayısı
- Unit/integration test dağılımı
- Domain → altyapı bağımlılık yönü ihlalleri

## Kod ve çalışma akışı

### Tek sınıfta üç değişim nedeni

Vergi kuralı, belge biçimi ve e-posta altyapısı farklı nedenlerle değişir; aynı sınıfta tutulmaları sürtünme üretir.


```csharp
// Sorunlu sınıf: hesap, PDF ve e-posta birlikte değişir.
public sealed class FaturaServisi
{
    public decimal ToplamHesapla(Fatura fatura) => /* ... */ 0;
    public byte[] PdfOlustur(Fatura fatura) => /* ... */ [];
    public Task EpostaGonderAsync(byte[] pdf) => /* ... */ Task.CompletedTask;
}

// Sınırlar:
public interface IFaturaHesaplayici { decimal Hesapla(Fatura fatura); }
public interface IFaturaBelgesi { byte[] Olustur(Fatura fatura); }
public interface IFaturaGonderici { Task GonderAsync(byte[] belge); }
```

1. Değişim aktörleri belirlenir.
2. Sözleşmeler role göre ayrılır.
3. Üst seviye akış bu parçaları birleştirir.

### Açık/kapalı: indirim politikaları

Yeni indirim, FiyatServisi içindeki switch’i değiştirmeden yeni politika sınıfıyla eklenir.


```csharp
public interface IIndirimPolitikasi
{
    decimal Uygula(decimal tutar);
}

public sealed class YuzdeIndirim(decimal oran) : IIndirimPolitikasi
{
    public decimal Uygula(decimal tutar) => tutar * (1 - oran);
}

public sealed class FiyatServisi(IEnumerable<IIndirimPolitikasi> politikalar)
{
    public decimal Hesapla(decimal tutar) =>
        politikalar.Aggregate(tutar, (guncel, politika) => politika.Uygula(guncel));
}
```

1. Değişen davranış interface’e taşınır.
2. Uygulamalar bağımsızdır.
3. Servis koleksiyon üzerinde ortak çağrı yapar.

### Aşırı SOLID karşı örneği

İlke uygulamak dosya sayısını artırmak değildir. Soyutlamanın ölçülebilir değişim veya test değeri olmalıdır.


```csharp
// Yalnız DateTime.UtcNow sarmalamak için 7 katman gerekmez.
public interface IClock { DateTime UtcNow { get; } }
public sealed class SystemClock : IClock { public DateTime UtcNow => DateTime.UtcNow; }

// Bu abstraction ancak zaman davranışını testte kontrol etmek
// veya farklı zaman kaynağı kullanmak gerçek bir ihtiyaçsa değerlidir.
```

1. Değişim ihtiyacı sorulur.
2. Testte kontrol gereksinimi değerlendirilir.
3. Maliyet faydayı aşarsa somut kod korunur.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `SRP` | Tek değişim aktörü |
| `OCP` | Genişlemeye açık, değişime kapalı |
| `LSP` | Alt tür yerine geçebilirliği |
| `ISP` | Küçük istemci odaklı sözleşmeler |
| `DIP` | Üst seviye politikanın soyutlamayı sahiplenmesi |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### Interface patlaması

- **Olası neden:** Her sınıf için otomatik tek interface ve factory yazılır.
- **Teşhis / düzeltme:** Soyutlamayı gerçek değişim sınırında oluştur.

### Anemic domain model

- **Olası neden:** SRP yanlış yorumlanıp bütün davranış entity dışındaki servislere taşınır.
- **Teşhis / düzeltme:** Veriyi koruyan kuralları nesnenin üzerinde tut; orkestrasyonu servise bırak.

### Yanlış bağımlılık yönü

- **Olası neden:** İş katmanı altyapının tanımladığı interface’e bağımlı olur.
- **Teşhis / düzeltme:** İhtiyaç sözleşmesini kullanan üst katmanda tanımla.

## Üretim ve işletim notları

- İlkeyi uygulamadan önce beklenen değişiklik senaryosunu yaz.
- Soyutlama eklemenin dosya/indirection maliyetini de hesaba kat.
- Bağımlılık yönünü paket/proje seviyesinde gözden geçir.
- Refactor değerini test edilebilirlik, değişiklik yayılımı ve hata izolasyonu üzerinden ölç.

## Birincil referanslar

1. [Microsoft Learn — .NET architecture principles](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles)

## Doğrulama senaryoları

- Üç değişim nedeni olan bir sınıfı aktörlere göre böl.
- Switch tabanlı fiyatlandırmayı stratejiye dönüştür.
- Gereksiz interface içeren bir tasarımı sadeleştir.

## Üretim kontrol listesi

- [ ] Her soyutlamanın gerçek değişim nedeni var.
- [ ] Yeni davranış eklemek merkezi koşulu büyütmüyor.
- [ ] Alt türler sözleşmeyi daraltmıyor.
- [ ] İstemciler kullanmadıkları üyeye bağımlı değil.
- [ ] İş katmanı teknik ayrıntıyı bilmiyor.

---
Bu dosya https://kutarya.com/konu/csharp/solid sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
