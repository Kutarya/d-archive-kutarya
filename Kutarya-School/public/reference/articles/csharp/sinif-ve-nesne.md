---
title: "C# Sınıf, Nesne ve Kurucu Metotlar"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/sinif-ve-nesne"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Sınıf, Nesne ve Kurucu Metotlar

C# sınıf tanımı, nesne kimliği, referans semantiği, kurucu metotlar ve instance/static üyelerin çalışma zamanı davranışı.

**Canonical:** https://kutarya.com/konu/csharp/sinif-ve-nesne
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# ve .NET nesne modeli; Microsoft Learn güncel dokümantasyonu.

## Özet

Sınıf tanımının bellekte nasıl nesneye dönüştüğünü, kurucu metotların geçerli başlangıç durumunu nasıl koruduğunu ve instance ile static üyelerin farkını örneklerle incele.

Sınıf ve nesne ayrımı yalnız sözdizimsel bir konu değildir; bellek kimliği, referans paylaşımı ve nesnenin geçerli durumda kurulması doğrudan hata üretme biçimini etkiler. Bu nedenle kurucu metot, alan erişimi ve static state aynı tasarım bağlamında değerlendirilir.

Makaledeki örnekler nesne kimliği ile değer eşitliğini birbirinden ayırır ve paylaşılan mutable state’in testler ile eşzamanlı çalışan kod üzerindeki etkisini görünür kılar.

## Kapsam maddeleri

- Sınıf, nesne ve referans farkını ayırmak
- Constructor ile geçerli başlangıç durumu kurmak
- Instance ve static üyeyi doğru seçmek
- Nesne kimliği ile değer eşitliğini karıştırmamak

## Temel kavramlar

### Sınıf

Alan, özellik ve metotların yapısını tanımlayan referans türü şablonudur. Tek başına uygulama verisi taşımaz.

### Nesne

new işlemiyle heap üzerinde oluşturulan sınıf örneğidir. Değişken çoğunlukla nesnenin kendisini değil referansını tutar.

### Constructor

Nesnenin zorunlu bağımlılıklarını ve başlangıç kurallarını tek noktada doğrular.

### Static üye

Belirli bir nesneye değil türe aittir. Paylaşılan değişebilir state için gelişigüzel kullanılmamalıdır.

## Teknik açıklama

### Sınıf, nesne ve referans üç ayrı kavramdır

Sınıf, bir türün hangi verileri ve davranışları taşıyacağını tanımlar. Nesne bu tanıma göre çalışma zamanında oluşturulan örnektir. Değişken ise çoğu referans türünde nesnenin kendisini değil o nesneye ulaşan referansı taşır. Bu ayrımı bilmek, iki değişkenin neden aynı nesneyi değiştirebildiğini anlamanın temelidir.

Bir atama işlemi her zaman kopya üretmez. Bir nesne referansını başka değişkene verdiğinde iki isim aynı örneği gösterebilir. Bu nedenle “kopya istiyorum” ile “aynı nesneye ikinci referans istiyorum” kararları bilinçli verilmelidir.

- class tür tanımıdır.
- new bir örnek oluşturur.
- Referans ataması varsayılan olarak derin kopya değildir.

### Constructor yalnız değer atayan bir yer değildir

Constructor’ın en önemli görevi nesneyi geçerli bir başlangıç durumuna sokmaktır. Bir müşteri kimliksiz yaşayamayacaksa kimlik constructor sırasında zorunlu olmalıdır. Sonradan doldurulacağı varsayılan zorunlu alanlar, uygulamada yarı oluşturulmuş nesneler üretir.

Constructor çok fazla iş yapmaya başladığında başka bir problem ortaya çıkar. Ağ isteği atmak, dosya okumak veya uzun hesap yapmak nesne üretimini gizli ve pahalı hâle getirir. Constructor zorunlu bağımlılıkları almalı ve temel invariantları doğrulamalıdır; ağır işler açık metotlara veya factory servislerine taşınmalıdır.

- Zorunlu veriyi oluşturma anında iste.
- Geçersiz nesnenin oluşmasına izin verme.
- Constructor içinde gizli I/O yapma.

### Static üye ne zaman doğru seçimdir?

Static, davranışın belirli bir nesne kimliğine ihtiyaç duymadığı yerde yararlıdır. Saf dönüştürme yardımcıları veya sabit değerler buna örnektir. Buna karşılık global değişebilir static state testleri birbirine bağlar ve eşzamanlı erişimde hatalara açık hâle gelir.

Bir state’in uygulama boyunca tek örnek olması gerekiyorsa bunu otomatik olarak static yapmak yerine yaşam süresini bağımlılık enjeksiyonu veya uygulama kabuğu üzerinden yönetmek çoğu zaman daha kontrollüdür.

- Stateless yardımcı davranış static olabilir.
- Global mutable state’i varsayılan çözüm yapma.
- Yaşam süresi ile tür tasarımını birbirine karıştırma.

## Teknik iddialar ve kaynak notları

### Nesne kimliği ve referans semantiği

C# sınıfları referans türüdür; bir değişken çoğu durumda nesnenin kendisini değil o nesneye erişen referansı taşır. Aynı instance birden fazla değişken üzerinden paylaşılabildiği için mutable state değişikliği tüm referanslardan gözlenebilir. Değer eşitliği ile aynı instance olma koşulu bu nedenle ayrı kavramlardır.

**Birincil referans:** [1]

### Kurucu metotların rolü

Constructor, instance oluşturulurken gerekli başlangıç koşullarını kurmak için kullanılan yaşam döngüsü sınırıdır. Zorunlu bağımlılıkların constructor üzerinden alınması, yarım kurulmuş nesne olasılığını azaltır; fakat constructor içinde ağ veya dosya gibi pahalı yan etkiler yürütmek nesne oluşturmayı öngörülemez hâle getirebilir.

**Birincil referans:** [2]

## Sınır durumları

- Aynı sınıftan üretilen iki instance alan değerleri eşit olsa bile varsayılan olarak aynı nesne değildir.
- static alanlar instance başına değil türe aittir; paylaşılan mutable static state test izolasyonunu ve eşzamanlılığı etkiler.
- Kurucu zincirleri ve base constructor sırası kalıtım hiyerarşisinde başlangıç koşullarını etkiler.
- IDisposable gibi yaşam döngüsü sözleşmeleri yalnız nesnenin oluşturulmasını değil kontrollü sonlandırılmasını da gerektirir.

## Uygulama vakası

### Paylaşılan sepet instance’ında beklenmeyen state değişimi

**Bağlam**

Bir web uygulamasında aynı Sepet nesnesine iki farklı servis referans tutuyor. Bir servis kampanya uygular, diğeri toplamı hesaplar. İki değişken farklı adlara sahip olsa da aynı instance’ı işaret ettiği için ilk servisin yaptığı mutable değişiklik ikinci servis tarafından da görülür. Sorun, kopya üretildiği varsayımıyla yazılmış kodda sessizce ortaya çıkar.

**Teknik analiz**

Teşhiste önce referans kimliği ile değer eşitliği ayrılır. Nesnenin hangi scope’ta oluşturulduğu, kaç tüketiciye verildiği ve state’in hangi metotlardan değiştirildiği izlenir. Çözüm ihtiyaca göre yeni instance üretmek, immutable model kullanmak veya paylaşılan state sahipliğini açık bir servis sınırına taşımaktır.

**Beklenen sonuç**

Düzeltme sonrasında nesne yaşam süresi DI kaydında ve tasarım dokümanında açıkça tanımlanır; mutasyon yapan metotlar tek sahip altında toplanır ve testlerde iki tüketicinin aynı instance’ı paylaşıp paylaşmadığı özellikle doğrulanır.

### İzlenecek sinyaller

- DI scope ve nesne oluşturma noktası
- State değişiminden önce/sonra kimlik ve alan değerleri
- Aynı instance’a eşzamanlı erişim sayısı
- Constructor/factory başarısızlıkları

## Kod ve çalışma akışı

### Geçerli başlayan müşteri nesnesi

Nesne oluşturulduğu anda kimlik, ad ve kayıt zamanı geçerlidir. Ad daha sonra yalnız doğrulama yapan davranış üzerinden değişebilir.


```csharp
public sealed class Musteri
{
    public Guid Id { get; }
    public string Ad { get; private set; }
    public DateTime KayitZamani { get; }

    public Musteri(Guid id, string ad, DateTime kayitZamani)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Kimlik boş olamaz.", nameof(id));

        if (string.IsNullOrWhiteSpace(ad))
            throw new ArgumentException("Ad zorunludur.", nameof(ad));

        Id = id;
        Ad = ad.Trim();
        KayitZamani = kayitZamani;
    }

    public void AdDegistir(string yeniAd)
    {
        if (string.IsNullOrWhiteSpace(yeniAd))
            throw new ArgumentException("Yeni ad zorunludur.", nameof(yeniAd));

        Ad = yeniAd.Trim();
    }
}
```

1. Zorunlu değerler constructor parametresidir.
2. Salt okunur üyeler yalnız oluşturma sırasında atanır.
3. Ad setterı private olduğu için dış kod nesneyi geçersiz kılamaz.
4. Ad değiştirme kuralı nesnenin kendi metodunda kalır.

### İki değişken, tek nesne referansı

Referans türlerinde atama varsayılan olarak nesnenin kopyasını üretmez. İki değişken aynı örneği gösterebilir.


```csharp
var ilk = new Musteri(Guid.NewGuid(), "Deniz", DateTime.UtcNow);
var ikinci = ilk;

ikinci.AdDegistir("Ece");

Console.WriteLine(ilk.Ad);                 // Ece
Console.WriteLine(ReferenceEquals(ilk, ikinci)); // True
```

1. ilk yeni nesneyi gösterir.
2. ikinci değişkenine aynı referans atanır.
3. ikinci üzerinden yapılan değişiklik aynı nesneyi etkiler.

### Static sayaç yerine açık kimlik üretici

Global değişebilir static sayaç yerine davranış bir sözleşmeye ayrılır; testte sabit kimlik üreten başka uygulama verilebilir.


```csharp
public interface IKimlikUretici
{
    Guid YeniKimlik();
}

public sealed class GuidKimlikUretici : IKimlikUretici
{
    public Guid YeniKimlik() => Guid.NewGuid();
}
```

1. Sözleşme gereken davranışı anlatır.
2. Üretim uygulaması Guid üretir.
3. Kullanan sınıf somut üreticiye bağımlı kalmaz.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `class` | Referans türü tanımlar |
| `new` | Yeni nesne örneği oluşturur |
| `this` | Geçerli nesne örneğini gösterir |
| `static` | Üyeyi nesne yerine türe bağlar |
| `sealed` | Türden kalıtımı kapatır |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS1729: uygun constructor yok

- **Olası neden:** new çağrısındaki parametreler tanımlı constructor imzasıyla uyuşmaz.
- **Teşhis / düzeltme:** İmza ile çağrıyı karşılaştır; zorunlu değeri gizlemek için anlamsız boş constructor ekleme.

### NullReferenceException

- **Olası neden:** Nesne değişkeni oluşturulmadan veya sonuç bulunamadan kullanılır.
- **Teşhis / düzeltme:** Zorunlu nesneyi constructor ile al; bulunamama durumunu açıkça ele al.

### Beklenmeyen ortak değişiklik

- **Olası neden:** İki değişkenin aynı nesneyi gösterdiği unutulur.
- **Teşhis / düzeltme:** Kimlik taşıyan entity ile kopyalanabilir value object ayrımını netleştir.

## Üretim ve işletim notları

- Zorunlu invariantları nesne oluşturulurken doğrula; geçersiz instance oluşmasına izin verme.
- Kimlik taşıyan entity ile yalnız değeri temsil eden modelin eşitlik gereksinimlerini ayrı tanımla.
- Global mutable state yerine açık bağımlılık ve yaşam süresi kullan.
- Constructor içinde başarısız olabilecek I/O işlemlerini servis/factory sınırına taşı.

## Birincil referanslar

1. [Microsoft Learn — Classes, structs and records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/)
2. [Microsoft Learn — Constructors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/constructors)

## Doğrulama senaryoları

- E-posta değiştirme davranışını doğrulamayla ekle.
- Müşteri nesnesi için geçersiz constructor girdilerini test et.
- Nesneyi kopyalamak gereken senaryoda record kullanarak farkı gözle.

## Üretim kontrol listesi

- [ ] Zorunlu değerler nesne oluşurken veriliyor.
- [ ] Boş ve geçersiz başlangıç durumu mümkün değil.
- [ ] Static state testleri birbirine bağlamıyor.
- [ ] Referans paylaşımı bilinçli yapılıyor.

---
Bu dosya https://kutarya.com/konu/csharp/sinif-ve-nesne sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
