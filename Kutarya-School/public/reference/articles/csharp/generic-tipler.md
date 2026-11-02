---
title: "C# Generic Tipler ve Kısıtlar"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/generic-tipler"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Generic Tipler ve Kısıtlar

C# generic tipler, where kısıtları, variance, tür güvenliği ve aşırı genellemenin API tasarımına etkisi.

**Canonical:** https://kutarya.com/konu/csharp/generic-tipler
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# generics ve varyans kuralları.

## Özet

Tür güvenli tekrar kullanım için generic sınıf, metot, covariance/contravariance ve where kısıtlarını gerçek sonuç modeli üzerinden incele.

Generic yapıların temel kazancı tekrar kullanım kadar tür bilgisini korumaktır. object tabanlı API’ler çalışma zamanında cast gerektirirken generic sözleşme birçok uyumsuzluğu derleme aşamasına taşır.

Buna karşılık gereksiz generic parametre ve kısıtlar API yüzeyini zorlaştırabilir; tür parametresi gerçekten davranışı değiştiriyor veya güvenliği artırıyorsa kullanılmalıdır.

## Kapsam maddeleri

- object tabanlı kod yerine tür güvenliği kurmak
- Generic kısıtları doğru kullanmak
- Variance davranışını anlamak
- Aşırı generic tasarımdan kaçınmak

## Temel kavramlar

### Tür parametresi

Sınıf veya metodun kullandığı somut türü çağıranın belirlemesini sağlar.

### Kısıt

Generic kod içinde hangi üyelerin güvenle kullanılabileceğini where ile bildirir.

### Covariance

Yalnız çıktı üreten interface’te daha özel türün daha genel tür olarak kullanılabilmesidir.

### Contravariance

Yalnız girdi tüketen interface’te genel tür tüketicisinin özel tür için kullanılabilmesidir.

## Teknik açıklama

### Generics tür güvenli yeniden kullanım sağlar

Generic yapı, algoritmayı belirli bir concrete türe bağlamadan çalıştırır. List<T> bunun en görünür örneğidir: aynı koleksiyon davranışı string, int veya kendi modelin için derleme zamanı tür kontrolüyle kullanılabilir.

object tabanlı eski yaklaşımlarda cast hataları çalışma zamanına taşınır ve value type kullanımlarında boxing maliyeti oluşabilir. Generic türler bu sorunların önemli bölümünü derleme zamanına çeker.

- Tür bilgisini derleme zamanında koru.
- Gereksiz object/cast kullanımını azalt.
- Algoritma gerçekten türden bağımsızsa generic düşün.

### Constraint algoritmanın ihtiyaçlarını anlatır

Bir generic metot T üzerinde hangi işlemlere ihtiyaç duyduğunu constraint ile belirtebilir. new(), class, struct veya belirli interface kısıtları derleyiciye kullanılabilecek yetenekleri bildirir.

Çok karmaşık constraint zincirleri bazen generic soyutlamanın fazla büyüdüğünü gösterir. T’nin yalnız birkaç davranışına ihtiyaç varsa daha küçük bir interface daha anlaşılır olabilir.

- Constraint ile gereken yeteneği açıkla.
- Gereksiz güçlü kısıt koyma.
- Karmaşık generic imzada daha basit sözleşme seçeneğini değerlendir.

### Variance yalnız gerektiğinde düşünülmeli

Covariance ve contravariance özellikle interface ve delegate türlerinde atama uyumluluğunu genişletir. out yalnız çıktı, in yalnız girdi yönünde güvenli varyansı ifade eder.

Bu konu günlük kodda her generic tür için gerekli değildir. Önce temel generic modelini doğru kur; varyans ihtiyacı gerçek API kullanımında ortaya çıktığında uygula.

- out üretici yönünü, in tüketici yönünü ifade eder.
- Mutable generic koleksiyonlar doğal olarak invariant olabilir.
- Varyansı premature abstraction olarak ekleme.

## Teknik iddialar ve kaynak notları

### Tür bilgisinin korunması

Generic tür ve metotlar aynı algoritmayı farklı türlerle çalıştırırken derleyicinin tür bilgisini korumasına izin verir. object tabanlı yaklaşımda gereken cast işlemleri ve bazı çalışma zamanı hataları böylece derleme aşamasına taşınabilir.

**Birincil referans:** [1]

### Kısıtlar ve variance

where kısıtları type parameter’ın desteklemesi gereken özellikleri tanımlar. Generic interface/delegate varyansı ise yalnız referans dönüşümleri ve parametrenin input/output konumuyla uyumlu olduğunda geçerlidir; List<T> gibi tüm generic türler kovaryant değildir.

**Birincil referans:** [1]

## Sınır durumları

- new() kısıtı constructor davranışını sınırlar fakat domain için doğru factory semantiğini garanti etmez.
- Generic static state kapalı generic tür başına ayrı olabilir.
- Variance yalnız interface ve delegate tanımlarında belirli koşullarda kullanılabilir.
- Aşırı generic API, çağıranın anlamlı domain kavramı yerine type parameter çözmeye çalışmasına neden olabilir.

## Uygulama vakası

### object tabanlı cache API’sinde runtime cast hatası

**Bağlam**

Cache servisi Get(string) → object döndürür ve her tüketici sonucu kendi tipine cast eder. Aynı key farklı bir type ile yazıldığında hata yalnız çalışma zamanında InvalidCastException olarak ortaya çıkar. Hangi key’in hangi türü taşıdığı API sözleşmesinden görülemez.

**Teknik analiz**

API Get<T>/Set<T> biçimine dönüştürülür ve gerekiyorsa key ile type eşleşmesi metadata üzerinde doğrulanır. Generic sözleşme compile-time tür bilgisini korur; serialization sınırında hâlâ runtime doğrulama gerektiği ayrıca kabul edilir.

**Beklenen sonuç**

Yanlış cast’lerin önemli bölümü derleme aşamasına taşınır. Cache miss, deserialize failure ve type mismatch ayrı hata sınıfları olarak ölçülür.

### İzlenecek sinyaller

- Type mismatch/deserialization hata sayısı
- Generic API’de kullanılan constraint’ler
- Runtime cast kullanılan çağrı noktaları
- Cache key → payload type sözleşmesi

## Kod ve çalışma akışı

### Tür güvenli sonuç modeli

Aynı başarı/hata sözleşmesi farklı sonuç türleriyle tekrar kullanılır ve cast gerekmez.


```csharp
public sealed record Sonuc<T>(T? Deger, string? Hata)
{
    public bool Basarili => Hata is null;
    public static Sonuc<T> Basari(T deger) => new(deger, null);
    public static Sonuc<T> Basarisiz(string hata) => new(default, hata);
}

Sonuc<Musteri> sonuc = Sonuc<Musteri>.Basari(musteri);
if (sonuc.Basarili)
    Console.WriteLine(sonuc.Deger!.Ad);
```

1. T, dönen değer türünü taşır.
2. Factory metotları geçerli iki sonucu adlandırır.
3. Çağıran sonuç türünü derleme zamanında bilir.

### where kısıtıyla kimlik erişimi

Kısıt, T üzerinde Id üyesinin güvenle kullanılacağını derleyiciye kanıtlar.


```csharp
public interface IKimlikli { Guid Id { get; } }

public sealed class BellekDeposu<T> where T : class, IKimlikli
{
    private readonly Dictionary<Guid, T> _veri = new();
    public void Kaydet(T oge) => _veri[oge.Id] = oge;
    public T? Bul(Guid id) => _veri.GetValueOrDefault(id);
}
```

1. T bir class ve IKimlikli olmalıdır.
2. Depo cast veya reflection kullanmaz.
3. Uyumsuz tür çağrı noktasında derlenmez.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `T` | Genel tür parametresi |
| `where T : class` | Referans türü kısıtı |
| `where T : new()` | Parametresiz constructor kısıtı |
| `out T` | Covariant çıktı türü |
| `in T` | Contravariant girdi türü |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS0311: generic kısıt sağlanmıyor

- **Olası neden:** Verilen tür where şartındaki interface veya taban türü uygulamaz.
- **Teşhis / düzeltme:** Tür ilişkisini doğrula; sırf derlensin diye anlamsız interface ekleme.

### Runtime cast hatası

- **Olası neden:** Generic yerine object koleksiyonu ve zorla cast kullanılmıştır.
- **Teşhis / düzeltme:** Koleksiyonu List<T> gibi tür güvenli hâle getir.

### Generic imza okunamıyor

- **Olası neden:** Her davranış tür parametresine çevrilerek gereksiz esneklik oluşturulmuştur.
- **Teşhis / düzeltme:** Yalnız gerçekten birden fazla türde aynı sözleşmeyi taşıyan kısmı generic yap.

## Üretim ve işletim notları

- Generic parametrenin gerçekten tür güvenliği veya tekrar kullanım sağladığını doğrula.
- Kısıtları ihtiyaç duyulan en küçük yetenekle sınırla.
- Public API’de karmaşık nested generic imzaları okunabilirlik açısından değerlendir.
- Reflection/dynamic ile generic güvenliğini baypas eden yolları hata sınırında tut.

## Birincil referanslar

1. [Microsoft Learn — Generics](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/generics)

## Doğrulama senaryoları

- Sayfalama sonucu için Sayfa<T> modeli yaz.
- IKimlikli kısıtlı bellek deposunu test et.
- IEnumerable<Derived> değerinin IEnumerable<Base> olarak kullanımını dene.

## Üretim kontrol listesi

- [ ] Generic kullanım cast ihtiyacını kaldırıyor.
- [ ] Kısıtlar gerçek algoritma ihtiyacını ifade ediyor.
- [ ] Tür parametresi anlamlı ad taşıyor.
- [ ] Somut çözüm daha okunaklıysa gereksiz generic yok.

---
Bu dosya https://kutarya.com/konu/csharp/generic-tipler sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
