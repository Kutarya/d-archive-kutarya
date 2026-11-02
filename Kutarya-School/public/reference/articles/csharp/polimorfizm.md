---
title: "C# Polimorfizm ve Dinamik Davranış"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/polimorfizm"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Polimorfizm ve Dinamik Davranış

C# polimorfizm, çalışma zamanı dağıtımı, interface tabanlı sözleşmeler, override ve pattern matching arasındaki tasarım farkları.

**Canonical:** https://kutarya.com/konu/csharp/polimorfizm
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# dinamik dispatch ve interface davranışı.

## Özet

Aynı sözleşmeyi kullanan kodun farklı somut davranışlarla çalışmasını; override, interface ve pattern matching seçenekleriyle karşılaştır.

Polimorfizmin temel değeri, çağıran kodun somut tür ayrıntısını bilmeden aynı sözleşme üzerinden farklı davranışları çalıştırabilmesidir. Bu ayrım büyüyen switch/if tür kontrollerinin neden tasarım kokusuna dönüşebildiğini açıklar.

Her polymorphic tasarım aynı derecede uygun değildir; kapalı bir tür kümesinde pattern matching, genişleyebilir bir sözleşmede interface veya override daha anlamlı olabilir.

## Kapsam maddeleri

- Derleme zamanı ile çalışma zamanı türünü ayırmak
- Interface tabanlı polimorfizm kurmak
- Tür kontrolü zincirlerini azaltmak
- Yeni davranış eklerken mevcut kodu kapalı tutmak

## Temel kavramlar

### Sözleşme

Kullanan kodun görebildiği ortak metot ve özellik kümesidir.

### Dinamik dispatch

Çağrılacak override uygulaması nesnenin çalışma zamanı türüne göre seçilir.

### Açık/kapalı tasarım

Yeni uygulama eklenirken merkezi if/switch bloğu değiştirilmez.

### Pattern matching

Türün kendisi iş kuralının gerçek parçasıysa kontrollü ayrım için kullanılabilir.

## Teknik açıklama

### Polimorfizm koşul zincirini davranışa taşır

Bir kod bloğu sürekli tür kontrol edip her tür için farklı işlem yapıyorsa davranışın yanlış yerde toplanmış olma ihtimali vardır. Ortak bir sözleşme üzerinden çağrı yapmak, kararın çağıran sınıftan somut uygulamaya taşınmasını sağlar.

Ama her switch ifadesi kötü değildir. Sabit ve küçük bir veri kümesini dönüştürmek için switch daha açık olabilir. Polimorfizm özellikle davranış türlerle birlikte bağımsız değişiyorsa değer kazanır.

- Tür kontrolü büyüyorsa davranış sınırını incele.
- Her switch’i otomatik olarak sınıf hiyerarşisine çevirme.
- Değişim sıklığına göre tasarım seç.

### virtual/override sözleşmesi dikkat ister

Bir metodu virtual yapmak alt sınıflara davranışı değiştirme yetkisi verir. Bu, taban sınıfın hangi garantileri verdiğini açıkça belirlemeyi gerektirir. Override edilen metot yan etki, exception veya dönüş değeri anlamını değiştirirse kullanan kod şaşırır.

Template Method gibi desenlerde taban sınıf akışı kontrol eder, alt sınıfa yalnız küçük genişleme noktaları verir. Bu, her şeyi virtual yapmaktan daha güvenli olabilir.

- Virtual yüzeyi küçük tut.
- Override aynı davranış sözleşmesini korusun.
- Genişleme noktasının sınırını taban sınıf belirlesin.

### Interface polimorfizmi çoğu uygulamada daha esnektir

Ortak state paylaşmaya ihtiyaç olmadığında interface üzerinden polimorfizm, sınıf kalıtımına göre daha gevşek bağ kurar. Bir sınıf birden fazla interface uygulayabilir ve farklı davranış eksenlerine katılabilir.

Bu yaklaşım test doubles üretmeyi ve dış bağımlılıkları değiştirmeyi kolaylaştırır. Ancak çok küçük her metot için yeni interface oluşturmak da gereksiz soyutlama yükü getirir.

- Ortak state yoksa interface seçeneğini düşün.
- Soyutlama maliyetini gerçek değişim ihtiyacıyla karşılaştır.
- Kullanan kodun ihtiyacına göre küçük sözleşme tasarla.

## Teknik iddialar ve kaynak notları

### Çalışma zamanı dispatch

virtual/override ve interface çağrılarında yürütülecek implementasyon gerçek çalışma zamanı türüne göre seçilebilir. Bu, çağıran kodun somut tür adlarını kontrol eden switch bloklarına ihtiyaç duymadan davranışı sözleşme üzerinden çağırmasını sağlar.

**Birincil referans:** [1]

### Polimorfizmin sınırı

Polimorfizm her varyasyonu nesne hiyerarşisine dönüştürme zorunluluğu değildir. Tür kümesi kapalı ve veri odaklıysa pattern matching daha doğrudan olabilir; yeni implementasyonların ekleneceği açık bir sınırda interface veya virtual dispatch daha düşük değişiklik yayılımı sağlar.

**Birincil referans:** [1]

## Sınır durumları

- overload seçimi derleme zamanında, override dispatch ise çalışma zamanında gerçekleşir; iki mekanizma karıştırılmamalıdır.
- Interface implementasyonu explicit tanımlandığında üye yalnız interface referansı üzerinden görünür olabilir.
- default interface members sürümleme için seçenek sunar fakat davranışın nereden geldiğini izlemeyi zorlaştırabilir.
- Pattern matching ile somut türleri sürekli saymak, genişleyebilir bir tür ailesinde çağıran kodu her yeni türde değiştirmeye zorlar.

## Uygulama vakası

### Ödeme yöntemi switch zincirinin büyümesi

**Bağlam**

Ödeme akışında kart, havale ve cüzdan için string tür kontrol eden bir switch kullanılır. Yeni ödeme yöntemi eklendikçe ödeme alma, iade, ücret hesaplama ve loglama kodlarındaki ayrı switch blokları da güncellenir. Bir noktada yeni tür yalnız iki blokta eklenir ve iade akışı production’da varsayılan kola düşer.

**Teknik analiz**

Değişen davranış IPaymentMethod sözleşmesine taşınır. Çağıran akış, seçilmiş implementasyonu aynı contract üzerinden kullanır. Tür kümesinin gerçekten açık olup olmadığı ayrıca değerlendirilir; sabit birkaç durumdan oluşan yalnız veri dönüştürme problemi için polimorfik sınıf ailesi oluşturulmaz.

**Beklenen sonuç**

Yeni ödeme yöntemi eklendiğinde mevcut orchestration kodu değişmeden kalır. Contract testleri tüm implementasyonların ortak başarı/hata semantiğini yerine getirdiğini doğrular.

### İzlenecek sinyaller

- Somut tür adı kontrol eden branch sayısı
- Yeni implementasyonda değişen dosya sayısı
- Contract test başarısı
- Implementasyon bazında hata ve latency dağılımı

## Kod ve çalışma akışı

### Ödeme yöntemlerini ortak sözleşmeyle çalıştırma

OdemeServisi kart, havale veya test uygulamasını bilmez; yalnız IOdemeYontemi sözleşmesini kullanır.


```csharp
public interface IOdemeYontemi
{
    Task<OdemeSonucu> OdeAsync(decimal tutar, CancellationToken token);
}

public sealed class OdemeServisi
{
    public Task<OdemeSonucu> OdemeAlAsync(
        IOdemeYontemi yontem,
        decimal tutar,
        CancellationToken token) => yontem.OdeAsync(tutar, token);
}
```

1. Çağıran somut uygulamayı seçer.
2. Servis ortak metodu çağırır.
3. Çalışma zamanı doğru uygulamayı yürütür.

### Kaçınılması gereken tür kontrol zinciri

Davranış zaten türlere aitse merkezi tür kontrolü yerine ortak polimorfik metot kullanılmalıdır.


```csharp
// Her yeni ödeme türünde bu metot değişmek zorunda kalır.
if (odeme is KartOdemesi kart)
    await kart.KarttanCekAsync();
else if (odeme is HavaleOdemesi havale)
    await havale.TalimatOlusturAsync();
else
    throw new NotSupportedException();
```

1. Merkezi kod somut türleri bilir.
2. Yeni tür mevcut kodu değiştirir.
3. Test kombinasyonları büyür.

### Polimorfik koleksiyon

Farklı somut nesneler aynı interface türündeki koleksiyonda tutulur ve aynı çağrıyla çalışır.


```csharp
IReadOnlyList<IBildirimKanali> kanallar =
[
    new EpostaKanali(epostaAgGecidi),
    new SmsKanali(smsAgGecidi),
];

foreach (var kanal in kanallar)
    await kanal.GonderAsync(mesaj, token);
```

1. Koleksiyon ortak sözleşme türündedir.
2. Her eleman kendi uygulamasını yürütür.
3. Döngü somut türlerden bağımsızdır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `override` | Çalışma zamanı davranış seçimi |
| `overload` | Derleme zamanı imza seçimi |
| `is` | Tür testi ve pattern matching |
| `as` | Başarısızlıkta null döndüren referans dönüşümü |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### Yanlış overload çağrılıyor

- **Olası neden:** Overload seçimi çalışma zamanı nesnesine değil değişkenin derleme zamanı türüne göre yapılır.
- **Teşhis / düzeltme:** Overload ile override farkını ayır; dinamik davranış gerekiyorsa virtual/interface metodu kullan.

### NotSupportedException sürekli büyüyor

- **Olası neden:** Her yeni tür merkezi switch içine ekleniyor.
- **Teşhis / düzeltme:** Davranışı ortak sözleşmeye taşı.

### Mock yanlış davranışı doğruluyor

- **Olası neden:** Test yalnız metodun çağrıldığını, gerçek sözleşme sonucunu doğrulamıyor.
- **Teşhis / düzeltme:** Her somut uygulama için sözleşme testleri ekle.

## Üretim ve işletim notları

- Sözleşmenin gerçekten ortak olan en küçük davranışı ifade etmesini sağla.
- Yeni bir implementasyon eklendiğinde mevcut çağıranların değişmemesini hedefle.
- Polimorfik çağrıların hata ve yan etki sözleşmesini tutarlı tut.
- Performans kritik sıcak yollarda soyutlamanın gerçek maliyetini ölçmeden varsayım yapma.

## Birincil referanslar

1. [Microsoft Learn — Polymorphism](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/polymorphism)

## Doğrulama senaryoları

- Dosya dışa aktarıcılarını IDisariAktarici altında birleştir.
- if/is zincirini polimorfik metoda dönüştür.
- İki farklı ödeme yöntemi için ortak sözleşme testi yaz.

## Üretim kontrol listesi

- [ ] Kullanan kod somut sınıf adlarını bilmiyor.
- [ ] Yeni uygulama merkezi koşul bloğunu değiştirmiyor.
- [ ] Interface yalnız gerçekten ortak davranışı taşıyor.
- [ ] Her uygulama aynı sonuç sözleşmesine uyuyor.

---
Bu dosya https://kutarya.com/konu/csharp/polimorfizm sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
