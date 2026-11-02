---
title: "C# ile Nesne Yönelimli Programlama"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/oop"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# ile Nesne Yönelimli Programlama

C# nesne yönelimli tasarımda sorumluluk, kapsülleme, kalıtım, interface, bileşim ve değişiklik maliyetinin birlikte değerlendirilmesi.

**Canonical:** https://kutarya.com/konu/csharp/oop
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C#/.NET OOP modeli; Microsoft Learn birincil referansları.

## Özet

Nesne yönelimli programlama, veriyi ve o veri üzerindeki davranışı aynı sorumluluk çevresinde toplar. İyi bir tasarımda sınıflar gerçek dünyadaki her ismi taklit etmez; değişme nedeni aynı olan davranışları bir arada tutar.

Nesne yönelimli tasarımın hedefi gerçek dünyadaki her ismi sınıfa dönüştürmek değil, birlikte değişen veri ve davranış için anlamlı sorumluluk sınırları kurmaktır. Sınıf sayısı veya interface sayısı tek başına kalite ölçütü değildir.

Bu makale sipariş/sepet benzeri iş kuralları üzerinden state bütünlüğü, değiştirilebilir bağımlılıklar ve testte gözlenebilir davranış arasındaki ilişkiyi inceler.

## Kapsam maddeleri

- Sınıf ile nesne arasındaki farkı açıklamak
- Durumu kontrollü biçimde kapsüllemek
- Arayüz ve bileşimi doğru yerde kullanmak
- Yaygın null ve erişim hatalarını teşhis etmek

## Temel kavramlar

### Sınıf ve nesne

Sınıf bir tür tanımıdır; nesne o türün çalışma zamanındaki örneğidir. Aynı sınıftan üretilen nesneler davranışı paylaşır ancak kendi durumlarını taşır.

### Kapsülleme

Alanları yalnızca private yapmak kapsülleme için yeterli değildir. Nesnenin geçersiz duruma geçmesini engelleyen kuralların da nesnenin sınırında çalışması gerekir.

### Soyutlama

Kullanan kodun gereksiz ayrıntıları bilmesini önler. Bir ödeme hizmetini kullanan sınıf, kart sağlayıcısının HTTP ayrıntılarına bağımlı olmamalıdır.

### Bileşim

Bir nesnenin davranışı başka küçük nesnelerden oluşturulur. Çoğu iş uygulamasında derin kalıtım zincirlerinden daha esnek ve test edilebilirdir.

## Teknik açıklama

### OOP’yi sınıf yazmak sanma

Nesne yönelimli programlama, her ismi bir sınıfa çevirmek değildir. Asıl amaç değişme nedeni aynı olan veri ve davranışı aynı sınırda tutmaktır. Bir sınıfın iyi olup olmadığını anlamak için önce “Bu nesne hangi kuralı koruyor?” sorusunu sor. Cevap veremiyorsan sınıf yalnızca veri torbasına dönüşmüş olabilir.

İyi bir modelde nesne dışarıdan rastgele değiştirilemez. Örneğin bir sepetin toplamı ayrı bir public setter ile atanmak yerine kalemlerden hesaplanır. Böylece uygulamada aynı gerçeği temsil eden iki farklı değer oluşmaz. Bu yaklaşım, hata ayıklamayı da kolaylaştırır çünkü geçersiz state üretebilecek yerlerin sayısı azalır.

- Önce sorumluluğu tanımla, sonra sınıfı oluştur.
- State değişikliklerini niyet belirten metotlardan geçir.
- Bir değeri iki yerde “gerçek” olarak saklamaktan kaçın.

### Kalıtım yerine davranışın yönünü düşün

Kalıtım güçlüdür fakat ilişkiyi kalıcı hâle getirir. “X, Y’nin bir türüdür” cümlesi her kullanımda doğru değilse kalıtım zamanla koşul blokları ve override sürprizleri üretir. Çoğu iş uygulamasında daha küçük nesneleri bir araya getirmek, yani bileşim, değişiklik maliyetini düşürür.

Interface kullanırken de amaç her sınıfın önüne bir I harfi eklemek değildir. Sözleşme, gerçekten değişebilecek bir davranışı ayırıyorsa değerlidir. Ödeme sağlayıcısı, dosya deposu veya saat kaynağı gibi dış bağımlılıklar bu modele iyi örnektir.

- “is-a” ilişkisini test etmeden kalıtım kurma.
- Değişebilir dış bağımlılıkları sözleşmeyle ayır.
- Test edilebilirlik için soyutlama ekle; soyutlama olsun diye değil.

### Üretim kodunda OOP kararlarını nasıl doğrularsın?

Bir tasarımın doğru olduğunu yalnız derlenmesinden anlayamazsın. En iyi sinyal değişiklik senaryosudur: yeni bir ödeme yöntemi, yeni bir indirim politikası veya yeni bir doğrulama kuralı geldiğinde kaç dosyaya dokunman gerekiyor? Küçük bir özellik için çok sayıda alakasız sınıf değişiyorsa sınırlar yanlış yerde olabilir.

Testler de sınıfın iç ayrıntısını değil davranış sözleşmesini korumalıdır. “private alan şu değerde mi” testi yerine “geçersiz adet eklendiğinde sepet değişmeden kalıyor mu” gibi bir davranış testi, refactor sırasında daha uzun ömürlü olur.

- Yeni gereksinimde değişen dosyaların sayısını gözle.
- Testte iç uygulama yerine dış davranışı doğrula.
- Bir sınıfın public yüzeyini mümkün olduğunca küçük tut.

## Teknik iddialar ve kaynak notları

### OOP yapı taşları

C# OOP modeli kapsülleme, kalıtım ve polimorfizm gibi mekanizmalar sunar; ancak bu mekanizmaların varlığı tek başına iyi domain modeli oluşturmaz. Tasarımın temel sorusu, hangi state ve davranışın birlikte değiştiği ve hangi bağımlılıkların ayrı sınırlar üzerinden yönetilmesi gerektiğidir.

**Birincil referans:** [1]

### Kalıtım ile sözleşme/bileşim ayrımı

Kalıtım ortak taban davranışını ve alt tür ilişkisini ifade ederken interface bir davranış sözleşmesi tanımlayabilir. Değişebilir bağımlılıkların constructor üzerinden bileştirilmesi, hiyerarşiyi büyütmeden farklı implementasyonların kullanılmasını sağlar. Bu araçlar birbirinin yerine otomatik seçilecek eşdeğerler değildir.

**Birincil referans:** [2], [3]

## Sınır durumları

- Anemic model ile aşırı “fat entity” iki uçtur; sorumluluklar kullanım bağlamına göre ayrılmalıdır.
- Her noun için sınıf üretmek gereksiz model şişmesine yol açabilir.
- Kalıtımla yalnız kod tekrarını azaltmak kırılgan hiyerarşi oluşturabilir.
- Interface sayısının artması bağımlılığın gerçekten tersine döndüğü anlamına gelmez.

## Uygulama vakası

### İş kurallarının controller ve entity arasında dağılması

**Bağlam**

Sipariş toplamı controller’da hesaplanır, indirim kuralı servis katmanında, geçersiz ürün kontrolü entity setter’ında bulunur. Aynı sipariş batch job tarafından işlendiğinde controller’daki kural çalışmadığı için farklı toplam üretilir. Davranış uygulama giriş noktasına bağımlı hâle gelmiştir.

**Teknik analiz**

Siparişin kendi invariant ve hesaplama kuralları domain modeline taşınır; dış fiyat/ödeme gibi bağımlılıklar açık contract’larla enjekte edilir. Orchestration katmanı use-case sırasını yönetirken domain kurallarını kopyalamaz. Entity ile DTO ayrılır.

**Beklenen sonuç**

Web, job ve test aynı domain davranışını kullanır. Yeni indirim kuralı için değişiklik tek sorumluluk sınırında kalır; integration test dış altyapı adaptörlerini ayrıca doğrular.

### İzlenecek sinyaller

- Aynı iş kuralının tekrarlandığı yer sayısı
- Domain invariant testleri
- Use-case başına dış bağımlılık sayısı
- Feature değişikliğinde dokunulan katmanlar

## Kod ve çalışma akışı

### Geçerli durumu koruyan sepet modeli

State yalnız davranış metotlarıyla değişir; toplam ayrı bir değişken olarak tutulmadığı için kalemlerden kopamaz.


```csharp
public sealed class Sepet
{
    private readonly List<SepetKalemi> _kalemler = new();
    public IReadOnlyList<SepetKalemi> Kalemler => _kalemler;
    public decimal Toplam => _kalemler.Sum(kalem => kalem.AraToplam);

    public void UrunEkle(string urunAdi, decimal birimFiyat, int adet)
    {
        if (string.IsNullOrWhiteSpace(urunAdi))
            throw new ArgumentException("Ürün adı zorunludur.", nameof(urunAdi));
        if (birimFiyat <= 0 || adet <= 0)
            throw new ArgumentOutOfRangeException(nameof(adet));

        _kalemler.Add(new SepetKalemi(urunAdi, birimFiyat, adet));
    }
}

public sealed record SepetKalemi(string UrunAdi, decimal BirimFiyat, int Adet)
{
    public decimal AraToplam => BirimFiyat * Adet;
}
```

1. İç liste dışarıya değiştirilebilir verilmez.
2. Girdiler nesneye girmeden doğrulanır.
3. Value object record olarak tanımlanır.

### Interface ile ödeme bağımlılığını ayırma

Sipariş akışı somut banka veya ödeme sağlayıcısını bilmez; ortak sözleşmeyle çalışır.


```csharp
public interface IOdemeYontemi
{
    Task<OdemeSonucu> OdeAsync(decimal tutar, CancellationToken token);
}

public sealed class SiparisTamamlama(IOdemeYontemi odeme)
{
    public async Task TamamlaAsync(Sepet sepet, CancellationToken token)
    {
        var sonuc = await odeme.OdeAsync(sepet.Toplam, token);
        if (!sonuc.Basarili)
            throw new InvalidOperationException(sonuc.Hata);
    }
}
```

1. Üst seviye sınıf interface’e bağlıdır.
2. Somut uygulama dışarıdan verilir.
3. Başarısız sonuç açıkça ele alınır.

### xUnit ile invariant testi

Test yalnız exception çıktığını değil, başarısız işlemden sonra state’in değişmediğini de doğrular.


```csharp
public sealed class SepetTestleri
{
    [Fact]
    public void UrunEkle_GecersizAdet_Reddedilir()
    {
        var sepet = new Sepet();

        var hata = Assert.Throws<ArgumentOutOfRangeException>(() =>
            sepet.UrunEkle("Klavye", 1200m, 0));

        Assert.Empty(sepet.Kalemler);
        Assert.Equal("adet", hata.ParamName);
    }
}
```

1. Geçersiz girdi hazırlanır.
2. Beklenen hata türü doğrulanır.
3. Nesnenin hâlâ geçerli durumda olduğu kanıtlanır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `class` | Kimlik ve davranış taşıyan referans türü |
| `record` | Değer eşitliği odaklı veri türü |
| `interface` | Davranış sözleşmesi |
| `abstract` | Ortak state ve genişleme noktası |
| `sealed` | Kalıtımı kapatan tür veya override |

## Tasarım seçenekleri

### Ne zaman kalıtım?

Alt tür gerçekten üst türün yerine her bağlamda geçebiliyorsa ve ortak davranış istikrarlıysa.

### Ne zaman arayüz?

Bir dış bağımlılığı değiştirmek, birden fazla uygulama sağlamak veya testte yerine sahte uygulama koymak gerekiyorsa.

### Ne zaman record?

Kimliğinden çok içindeki değerlerle anlam kazanan ve mümkünse değişmez kalması gereken küçük veri modellerinde.

## Arıza biçimleri

### NullReferenceException

- **Olası neden:** Başlatılmamış bir nesnenin üyesine erişilir.
- **Teşhis / düzeltme:** Nullable reference types özelliğini aç, bağımlılıkları constructor içinde doğrula ve gereksiz null durumları üretme.

### CS0122: erişim düzeyi nedeniyle erişilemiyor

- **Olası neden:** private veya protected bir üyeye izin verilmeyen yerden erişilir.
- **Teşhis / düzeltme:** Üyeyi gelişigüzel public yapmak yerine gereken davranışı anlatan bir public metot ekle.

### InvalidOperationException: Collection was modified

- **Olası neden:** foreach sırasında aynı koleksiyon değiştirilir.
- **Teşhis / düzeltme:** Silinecekleri önce belirle, ToList ile kopya üzerinde gezin veya uygun RemoveAll işlemini kullan.

### Döngüsel bağımlılık

- **Olası neden:** A sınıfı B’yi, B de A’yı doğrudan oluşturur veya ister.
- **Teşhis / düzeltme:** Ortak sorumluluğu üçüncü bir hizmete çıkar; olay ya da arayüz ile yönü tek taraflı yap.

## Üretim ve işletim notları

- İş kuralı ve state invariantlarını tek sahipte tut.
- Dış I/O bağımlılıklarını domain davranışından ayır.
- Değişiklik senaryolarını tasarım testi olarak kullan: yeni ödeme yöntemi, yeni depolama, yeni kural.
- Soyutlama sayısını değil bir değişikliğin dokunduğu yüzey alanını ölç.

## Birincil referanslar

1. [Microsoft Learn — C# object-oriented techniques](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/)
2. [Microsoft Learn — Inheritance and polymorphism](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)
3. [Microsoft Learn — Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces)

## Doğrulama senaryoları

- Sepete aynı ürün ikinci kez eklendiğinde adedi artır.
- Yüzdesel ve sabit indirimleri IIndirimPolitikasi üzerinden uygula.
- xUnit ile geçersiz adet, toplam ve indirim senaryolarını test et.

## Üretim kontrol listesi

- [ ] Her sınıfın tek ve anlatılabilir bir değişme nedeni var.
- [ ] Nesne geçersiz duruma geçirilemiyor.
- [ ] Dış bağımlılıklar new ile sınıfın içine gömülmemiş.
- [ ] Kalıtım yerine bileşim seçeneği değerlendirildi.
- [ ] Public üyeler gerçek kullanım ihtiyacı kadar açık.

---
Bu dosya https://kutarya.com/konu/csharp/oop sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
