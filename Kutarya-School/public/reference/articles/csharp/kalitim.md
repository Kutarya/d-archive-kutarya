---
title: "C# Kalıtım ve is-a İlişkisi"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/kalitim"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Kalıtım ve is-a İlişkisi

C# kalıtım, alt tür ikamesi, virtual/override davranışı, kırılgan taban sınıf riski ve bileşim alternatifi.

**Canonical:** https://kutarya.com/konu/csharp/kalitim
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# kalıtım ve polimorfizm davranışı; Microsoft Learn güncel dokümantasyonu.

## Özet

Kalıtımı kod tekrarını azaltma hilesi olarak değil, alt türün üst türün yerine güvenle geçebildiği gerçek bir tür ilişkisi olarak değerlendir.

Kalıtımın teknik maliyeti yalnız sınıflar arası bağ değildir; taban sınıfın davranış sözleşmesi alt türlerin tamamını etkiler. Bu nedenle “kod tekrarını azaltma” gerekçesi tek başına kalıtım için yeterli değildir.

Makale, is-a ilişkisinin gerçekten korunup korunmadığını, override edilen davranışın çağıran kodun beklentilerini bozup bozmadığını ve aynı problemin bileşimle daha düşük bağımlılıkla çözülüp çözülemeyeceğini karşılaştırır.

## Kapsam maddeleri

- is-a ile has-a ilişkisini ayırmak
- virtual ve override davranışını anlamak
- Kırılgan taban sınıf riskini görmek
- Kalıtım yerine bileşimi ne zaman seçmek gerektiğini belirlemek

## Temel kavramlar

### Taban tür

Ortak sözleşme ve istikrarlı davranışı tanımlar.

### Alt tür

Taban türün kurallarını bozmadan daha özel davranış sağlar.

### virtual / override

Taban uygulamanın alt tür tarafından bilinçli biçimde değiştirilmesini sağlar.

### Liskov ilkesi

Alt tür, kullanan kodu şaşırtmadan üst türün yerine geçebilmelidir.

## Teknik açıklama

### Kalıtım kod paylaşımı aracı değildir

Kalıtımı yalnız ortak birkaç metodu tekrar yazmamak için seçmek, türler arasında gereksiz güçlü bağ kurar. Asıl soru alt türün üst türün yerine geçtiğinde tüm beklentileri koruyup korumadığıdır. Eğer üst sınıfı kullanan kod alt sınıf geldiğinde ek if kontrollerine ihtiyaç duyuyorsa ilişki muhtemelen zayıftır.

Kalıtım hiyerarşisi büyüdükçe taban sınıfta yapılan küçük bir değişiklik çok sayıda alt türü etkileyebilir. Bu yüzden önce ortak davranışı küçük bir bileşene ayırma seçeneğini değerlendir.

- Kod tekrarını azaltmak tek başına gerekçe değildir.
- Alt tür üst türün sözleşmesini bozmasın.
- Derin hiyerarşi yerine bileşimi değerlendir.

### protected alanlar görünmez bağımlılık üretir

Alt sınıfların taban sınıfın iç state’ine doğrudan erişmesi, iki sınıfı sıkı biçimde bağlar. Taban sınıf kendi temsilini değiştirmek istediğinde alt sınıflar kırılabilir. Mümkünse protected field yerine korumalı davranış veya salt okunur özellik sun.

Bir taban sınıfın genişletilmesi gerçekten tasarımın parçası değilse sealed kullanmak niyeti açıklar ve yanlış genişletmeyi önler.

- Taban sınıfın iç temsilini alt sınıfa sızdırma.
- Genişleme noktalarını açık ve küçük tut.
- Genişleme gerekmiyorsa sealed düşün.

### Hiyerarşiyi davranış testiyle doğrula

Bir alt türün doğru tasarlandığını yalnız derleyici kanıtlayamaz. Üst tür için yazılmış davranış testlerini alt türlere de uygulamak sözleşme bozulmalarını yakalar. Özellikle exception davranışı, null kabulü ve yan etkiler aynı beklentiyi korumalıdır.

Bir alt tür yalnız bazı üst tür metotlarında “desteklenmiyor” diyorsa is-a ilişkisini tekrar sorgulamak gerekir.

- Üst tür testlerini alt türlerde tekrar çalıştır.
- NotSupportedException ile dolu alt türleri sorgula.
- Davranış sözleşmesini dokümante et.

## Teknik iddialar ve kaynak notları

### Alt tür sözleşmesi

C# kalıtımı taban sınıfın erişilebilir üyelerini ve davranış sözleşmesini türetilmiş tipe taşır. virtual/override zinciri çalışma zamanında türetilmiş davranışın seçilmesini sağlar. Bu mekanizma yalnız kod tekrarını azaltmak için değil, çağıran kodun taban tür üzerinden güvenle çalışabildiği gerçek bir alt tür ilişkisi varsa kullanılmalıdır.

**Birincil referans:** [1]

### Taban sınıfa bağımlılık

Türetilmiş sınıf protected üyeler ve override noktaları üzerinden taban uygulamanın ayrıntılarına bağlandıkça iki sınıfın birlikte değişme zorunluluğu artar. Bu nedenle küçük bir ortak kod parçası için derin hiyerarşi kurmak, tekrar azaltırken değişiklik riskini büyütebilir.

**Birincil referans:** [1]

## Sınır durumları

- non-virtual üye derived sınıfta aynı adla tanımlanırsa override değil member hiding oluşabilir.
- Constructor içinde virtual üye çağrısı derived state henüz kurulmadan davranış çalıştırabilir.
- sealed sınıf veya sealed override genişleme noktasını bilinçli biçimde kapatır.
- Bir API’nin taban sınıfı zamanla yeni virtual davranış eklediğinde mevcut alt sınıfların varsayımları etkilenebilir.

## Uygulama vakası

### Kırılgan taban sınıfın yeni gereksinimde alt türleri bozması

**Bağlam**

Rapor sınıfları ortak kodu paylaşmak için BaseReport sınıfından türetilmiştir. Taban sınıfa sonradan “raporu otomatik olarak dosyaya yaz” davranışı eklendiğinde yalnız PDF üretmesi gereken bir alt sınıf da bu yan etkiyi miras alır. Alt sınıf davranışı teknik olarak derlenir fakat çağıran kodun önceki beklentisini bozar.

**Teknik analiz**

İlk olarak ortak olan davranış ile gerçekten alt tür sözleşmesi olan davranış ayrılır. Dosyaya yazma yeteneği ayrı bir IReportWriter bileşenine taşınır; rapor üretimi yalnız veri/çıktı üretir. Kalıtım yalnız ortak ve ikame edilebilir davranış için tutulur.

**Beklenen sonuç**

Yeni çıktı kanalları taban sınıfı değiştirmeden eklenebilir. Alt tür testleri aynı base contract’ın precondition ve postcondition’larını doğrular; protected alanlar azaltılarak gizli coupling düşürülür.

### İzlenecek sinyaller

- Override edilen üyelerde davranış değişikliği
- Base sınıf değişikliğinden etkilenen test sayısı
- Alt sınıfların protected üyeye bağımlılığı
- Hiyerarşi derinliği ve değişiklik yayılımı

## Kod ve çalışma akışı

### İstikrarlı taban davranış

Taban sınıf alıcı kavramını ve gönderme sözleşmesini taşır; alt tür kanal ayrıntısını uygular.


```csharp
public abstract class Bildirim
{
    protected Bildirim(string alici) => Alici = alici;
    public string Alici { get; }
    public abstract Task GonderAsync(string mesaj, CancellationToken token);
}

public sealed class EpostaBildirimi : Bildirim
{
    private readonly IEpostaAgGecidi _agGecidi;

    public EpostaBildirimi(string alici, IEpostaAgGecidi agGecidi)
        : base(alici) => _agGecidi = agGecidi;

    public override Task GonderAsync(string mesaj, CancellationToken token) =>
        _agGecidi.GonderAsync(Alici, mesaj, token);
}
```

1. Taban tür doğrudan oluşturulamaz.
2. Alt sınıf base constructor ile ortak kuralı çalıştırır.
3. Gönderme davranışı override edilir.

### Kötü kalıtım: kare-dikdörtgen şaşırtması

Kare, taban türün bağımsız boyut varsayımını bozar. Ortak IAlanHesaplanabilir sözleşmesi veya ayrı değer türleri daha doğrudur.


```csharp
// Alt tür genişlik ve yüksekliğin bağımsız değişebileceği
// taban sözleşmesini bozar. Geometrik "is-a" kod sözleşmesine yetmez.
public class Dikdortgen
{
    public virtual int Genislik { get; set; }
    public virtual int Yukseklik { get; set; }
}

public class Kare : Dikdortgen
{
    public override int Genislik { set { base.Genislik = base.Yukseklik = value; } }
    public override int Yukseklik { set { base.Genislik = base.Yukseklik = value; } }
}
```

1. Taban tür iki bağımsız setter vaat eder.
2. Alt tür bir setter çağrısında diğer değeri de değiştirir.
3. Taban türü kullanan kodun varsayımı bozulur.

### Kalıtım yerine davranış bileşimi

Değişen fiyat davranışı alt sınıf patlaması yerine ayrı strateji nesnesine taşınır.


```csharp
public interface IFiyatlandirma
{
    decimal Hesapla(decimal listeFiyati);
}

public sealed class Urun
{
    private readonly IFiyatlandirma _fiyatlandirma;
    public Urun(IFiyatlandirma fiyatlandirma) => _fiyatlandirma = fiyatlandirma;
    public decimal SatisFiyati(decimal listeFiyati) => _fiyatlandirma.Hesapla(listeFiyati);
}
```

1. Urun türü tek kalır.
2. Fiyat davranışı çalışma zamanında değiştirilebilir.
3. Her strateji ayrı test edilir.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `:` | Taban sınıf veya interface ilişkisi kurar |
| `virtual` | Varsayılan uygulamayı override etmeye açar |
| `override` | Kalıtılan davranışı değiştirir |
| `base` | Taban üye veya constructor erişimi sağlar |
| `protected` | Üyeyi yalnız tür ve alt türlere açar |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS0506: override edilemiyor

- **Olası neden:** Taban üye virtual, abstract veya override değildir.
- **Teşhis / düzeltme:** Taban sözleşmeyi gerçekten genişlemeye açmak isteyip istemediğini belirle; yalnız hatayı susturmak için virtual ekleme.

### InvalidCastException

- **Olası neden:** Taban referans yanlış alt türe zorla çevrilir.
- **Teşhis / düzeltme:** Polimorfik metodu taban sözleşmeye taşı veya pattern matching ile türü güvenle ayır.

### Derin kalıtım zinciri

- **Olası neden:** Davranış varyasyonları her seferinde yeni alt sınıfla modellenir.
- **Teşhis / düzeltme:** Değişen davranışı interface ve bileşimle ayır.

## Üretim ve işletim notları

- Kalıtım kararını “is-a” cümlesinden çok ikame edilebilir davranışla doğrula.
- Hiyerarşiyi sığ tut; ortak davranış bağımsız servis olabiliyorsa bileşimi değerlendir.
- protected yüzeyi minimumda tut.
- Override edilen metotların precondition/postcondition beklentilerini dokümante et ve test et.

## Birincil referanslar

1. [Microsoft Learn — Inheritance](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)

## Doğrulama senaryoları

- Kargo hesaplama alt sınıflarını strateji nesnelerine dönüştür.
- Liskov ilkesini bozan bir örneğe test yaz.
- Taban sınıfta hangi üyelerin protected olması gerektiğini daralt.

## Üretim kontrol listesi

- [ ] Alt tür her yerde taban türün yerine geçebiliyor.
- [ ] Kalıtım yalnız kod paylaşmak için kullanılmıyor.
- [ ] Taban sınıfın genişleme noktaları bilinçli.
- [ ] Bileşim seçeneği değerlendirildi.

---
Bu dosya https://kutarya.com/konu/csharp/kalitim sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
