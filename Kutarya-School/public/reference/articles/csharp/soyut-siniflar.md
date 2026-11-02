---
title: "C# Abstract Sınıflar"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/soyut-siniflar"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Abstract Sınıflar

C# abstract sınıflar, ortak state, template method, protected yüzey ve interface/bileşim karşılaştırması.

**Canonical:** https://kutarya.com/konu/csharp/soyut-siniflar
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# abstract/sealed sınıf davranışı.

## Özet

Ortak state ve kontrollü genişleme noktası gereken durumlarda abstract sınıfı; interface ve bileşim alternatifleriyle birlikte değerlendir.

Abstract sınıf, ortak state ve kontrollü genişleme noktası aynı hiyerarşide gerçekten paylaşıldığında anlamlıdır. Protected yüzey büyüdükçe alt sınıflar taban uygulamanın iç ayrıntılarına daha fazla bağımlı hâle gelir.

Bu nedenle makale abstract sınıfı yalnız kod tekrarını azaltan araç olarak değil, miras sözleşmesi ve değişiklik yayılımı açısından değerlendirir.

## Kapsam maddeleri

- Abstract sınıf ile interface farkını bilmek
- Template method kalıbını güvenli kurmak
- protected yüzeyi küçük tutmak
- Ortak state mirasının maliyetini görmek

## Temel kavramlar

### Abstract tür

Doğrudan oluşturulamaz; ortak state, uygulama ve zorunlu genişleme noktaları taşıyabilir.

### Abstract üye

Taban tür imzayı tanımlar, uygulamayı alt türe zorunlu bırakır.

### Template method

İş akışının sırası tabanda sabitlenir, belirli adımlar alt türe açılır.

### Protected sınır

Alt türlere açılan her üye uzun vadeli bir genişleme sözleşmesidir.

## Teknik açıklama

### Abstract sınıf ortak state gerektiğinde anlamlıdır

Interface davranış sözleşmesini ifade ederken abstract sınıf ortak state, constructor kuralı ve kısmi uygulama da paylaşabilir. Bu nedenle iki araç birbirinin tam alternatifi değildir.

Bir hiyerarşide gerçekten ortak yaşam döngüsü ve invariant varsa abstract taban sınıf doğal olabilir. Yalnız birkaç yardımcı metodu paylaşmak için kullanıldığında ise bileşim çoğu zaman daha esnek kalır.

- Ortak state ihtiyacını doğrula.
- Constructor kuralları taban türde korunabilir.
- Yalnız kod tekrarını azaltmak için abstract sınıf kurma.

### Template Method kontrollü genişleme sağlar

Taban sınıf algoritmanın ana sırasını uygular, alt sınıflar yalnız belirli adımları doldurur. Bu yaklaşım iş akışının iskeletini korurken özelleştirme sağlar.

Genişleme noktalarının sayısı arttıkça taban sınıf anlaşılması zor bir framework’e dönüşebilir. Hangi adımların gerçekten değişmesi gerektiğini sınırlı tut.

- Ana akışı tek yerde tut.
- Alt sınıfa küçük hook noktaları ver.
- Her adımı override edilebilir yapma.

### Abstract mı interface mi?

Bir tür ailesi ortak state ve davranış taşıyorsa abstract sınıf; birbirinden bağımsız türlerin aynı yeteneği sunması gerekiyorsa interface genellikle daha doğal olur. Bir sınıf yalnız tek sınıftan kalıtılabildiği için taban sınıf seçimi daha ağır bir mimari karardır.

Kararı “hangisi daha profesyonel?” diye değil, hangi bağımlılık ve genişleme modelinin gerektiğine göre ver.

- Ortak kimlik/state: abstract düşün.
- Ortak yetenek/sözleşme: interface düşün.
- Tek kalıtım kısıtını mimari maliyet olarak hesaba kat.

## Teknik iddialar ve kaynak notları

### Ortak implementasyon ve zorunlu genişleme

abstract sınıf instance üretilemeyen fakat ortak state, concrete davranış ve abstract üyeleri aynı tabanda toplayabilen sınıftır. Bu özellik, alt türlerin gerçekten ortak bir yaşam döngüsü ve state modeli paylaştığı durumlarda interface’e göre daha güçlü bir temel sağlar.

**Birincil referans:** [1]

### sealed ile genişleme sınırı

abstract ve virtual üyeler genişlemeyi açarken sealed sınıf/override bu zinciri kapatabilir. Tasarımın hangi noktalarının extension point olduğunu bilinçli belirlemek, alt sınıfların iç implementasyona rastgele bağımlı hâle gelmesini engellemeye yardımcı olur.

**Birincil referans:** [1]

## Sınır durumları

- C# sınıflarda çoklu kalıtımı desteklemez; bir sınıf yalnız bir base class seçebilir.
- protected mutable state alt sınıflar arasında gizli coupling yaratabilir.
- abstract constructor olmasa da abstract sınıf constructor’ı derived instance kurulurken çalışır.
- Template method tasarımında hook sırası sözleşmenin parçasıdır; alt sınıf sıralama varsayımını bozarsa sonuç değişir.

## Uygulama vakası

### Template method altında gizli sıra bağımlılığı

**Bağlam**

Dosya işleme framework’ünde abstract BaseImporter önce Validate(), sonra Transform(), sonra Save() çağırır. Bir alt sınıf Transform() aşamasında Validate() tarafından oluşturulan protected geçici alana bağımlı hâle gelir. Taban sınıfta sıra değiştiğinde kod derlenir fakat alt sınıf runtime’da boş state kullanır.

**Teknik analiz**

Protected mutable alan kaldırılır; adımlar gerekli girdiyi parametre olarak alıp çıktıyı döndürür. Template method sırası contract olarak test edilir ve alt sınıfın kullanması gereken genişleme noktaları minimuma indirilir. Ortak state gerekmiyorsa strateji nesnelerine bölme seçeneği değerlendirilir.

**Beklenen sonuç**

Alt sınıflar taban sınıfın gizli yaşam döngüsü state’ine bağımlı kalmaz. Taban algoritma değişiklikleri daha yerel hâle gelir ve her hook ayrı test edilebilir.

### İzlenecek sinyaller

- Protected mutable üye sayısı
- Hook çağrı sırası testleri
- Base değişikliğinde kırılan alt sınıf sayısı
- Template adımı başına hata oranı

## Kod ve çalışma akışı

### Sırası korunan dosya içe aktarma akışı

Public akış tabanda değişmez; dosya türüne özgü adımlar abstract üyelerle genişler.


```csharp
public abstract class DosyaIceAktarici
{
    public async Task<IceAktarmaSonucu> CalistirAsync(Stream akis, CancellationToken token)
    {
        ArgumentNullException.ThrowIfNull(akis);
        var satirlar = await OkuAsync(akis, token);
        var dogrulanan = Dogrula(satirlar);
        return await KaydetAsync(dogrulanan, token);
    }

    protected abstract Task<IReadOnlyList<string>> OkuAsync(Stream akis, CancellationToken token);
    protected abstract IReadOnlyList<string> Dogrula(IReadOnlyList<string> satirlar);
    protected abstract Task<IceAktarmaSonucu> KaydetAsync(IReadOnlyList<string> satirlar, CancellationToken token);
}
```

1. Girdi doğrulaması ortak yapılır.
2. Adım sırası alt sınıf tarafından bozulamaz.
3. Yalnız değişen adımlar protected abstract olur.

### Abstract sınıf mı interface mi?

Seçim, çoklu kalıtım isteğinden önce ortak state ve akış gereksinimine göre yapılır.


```csharp
// Ortak state ve algoritma yoksa interface daha hafiftir.
public interface IMetinDonusturucu
{
    string Donustur(string kaynak);
}

// Ortak güvenli akış ve state varsa abstract sınıf düşünülebilir.
public abstract class KimlikliIslem
{
    protected KimlikliIslem(Guid islemId) => IslemId = islemId;
    public Guid IslemId { get; }
    public abstract Task CalistirAsync(CancellationToken token);
}
```

1. Interface yalnız sözleşme taşır.
2. Abstract sınıf ortak kimlik state’i taşır.
3. C# sınıflarda tek kalıtım sunduğu için taban sınıf seçimi maliyetlidir.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `abstract class` | Doğrudan örneklenemeyen taban tür |
| `abstract member` | Alt türde uygulaması zorunlu üye |
| `protected` | Türe ve alt türlere açık üye |
| `sealed override` | Daha aşağı override edilmesini engeller |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS0144: abstract tür örneklenemez

- **Olası neden:** Abstract sınıf new ile doğrudan oluşturulur.
- **Teşhis / düzeltme:** Somut alt tür oluştur veya yalnız sözleşme gerekiyorsa interface kullan.

### Kırılgan taban sınıf

- **Olası neden:** Tabandaki değişiklik çok sayıda alt türün gizli varsayımını bozar.
- **Teşhis / düzeltme:** Protected yüzeyi küçült; ortak akışı test et; değişken davranışı bileşime taşı.

## Üretim ve işletim notları

- Ortak state yoksa interface+bileşim alternatifini değerlendir.
- protected üyeleri mümkün olduğunca davranış tabanlı ve küçük tut.
- Template method adımlarının hangi sırada ve kaç kez çağrıldığını belirt.
- Taban sınıfı framework benzeri genişleme noktası yapıyorsan sürümleme etkisini testlerle koru.

## Birincil referanslar

1. [Microsoft Learn — Abstract and sealed classes](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/abstract-and-sealed-classes-and-class-members)

## Doğrulama senaryoları

- CSV ve JSON içe aktarıcıları için template method kur.
- Protected üyeleri en küçük kümeye indir.
- Abstract sınıfı interface+bileşim tasarımına dönüştürüp karşılaştır.

## Üretim kontrol listesi

- [ ] Gerçek ortak state veya algoritma var.
- [ ] Public akış alt türlerce bozulamıyor.
- [ ] Protected üyeler bilinçli genişleme noktaları.
- [ ] Tek kalıtım maliyeti kabul edilebilir.

---
Bu dosya https://kutarya.com/konu/csharp/soyut-siniflar sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
