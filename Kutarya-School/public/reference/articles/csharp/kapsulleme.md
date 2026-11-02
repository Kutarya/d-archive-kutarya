---
title: "C# Kapsülleme ve Geçerli Durum"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/kapsulleme"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Kapsülleme ve Geçerli Durum

C# kapsülleme, invariant koruması, state değişim sınırları, property tasarımı ve koleksiyonların güvenli dışa açılması.

**Canonical:** https://kutarya.com/konu/csharp/kapsulleme
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# OOP modeli ve .NET koleksiyon sözleşmeleri.

## Özet

Kapsüllemeyi yalnız private alan olarak değil, nesnenin geçersiz duruma geçmesini engelleyen davranış sınırı olarak uygula.

Kapsülleme, alanları private yapmakla sınırlı değildir. Asıl amaç nesnenin geçersiz bir state’e dışarıdan rastgele geçirilmesini önlemek ve iş kurallarını tek bir davranış sınırında toplamaktır.

Bu yaklaşım özellikle birden fazla alanın birlikte değişmesi gereken modellerde önemlidir; public setter’lar tek tek doğru görünürken nesnenin bütünü için geçersiz kombinasyonlar üretebilir.

## Kapsam maddeleri

- Alan gizleme ile gerçek kapsüllemeyi ayırmak
- Invariant kurallarını nesne sınırında korumak
- Anlamsız setter kullanımını azaltmak
- Koleksiyonları dışarıya güvenle açmak

## Temel kavramlar

### Invariant

Nesne yaşadığı sürece doğru kalması gereken kuraldır; örneğin hesap bakiyesinin izin verilen sınırın altına inmemesi.

### Davranış metodu

SetBakiye yerine ParaYatir ve ParaCek gibi niyeti ve kuralı ifade eder.

### Salt okunur görünüm

İç koleksiyonun kendisi yerine IReadOnlyList gibi değiştirmeyi engelleyen dış yüzey sunulur.

### Fail fast

Geçersiz değer, daha uzak bir katmanda bozuk sonuç üretmeden sınırda reddedilir.

## Teknik açıklama

### Kapsülleme erişim belirleyiciden daha fazlasıdır

Bir alanı private yapmak dış erişimi kapatır fakat nesneyi otomatik olarak güvenli yapmaz. Gerçek kapsülleme, state’in hangi kurallarla değişebileceğini nesnenin kendi sınırında tanımlar. Bakiye negatif olamıyorsa bu kural yalnız kullanıcı arayüzünde değil, bakiyeyi değiştiren nesnenin içinde korunmalıdır.

Bu nedenle Anlamsız SetX metotları yerine ParaYatir, ParaCek veya AdresDegistir gibi niyeti ifade eden davranışlar daha değerlidir. Kod hem okunur olur hem de kuralın nerede uygulandığı nettir.

- Invariantı state’in sahibi korur.
- Public setter varsayılan değil istisna olsun.
- Davranış metodu iş niyetini adlandırsın.

### Koleksiyon sızıntısı gizli bir kapsülleme hatasıdır

Bir private listeyi public List olarak döndürdüğünde alanın kendisi private kalsa bile listeyi dışarıya teslim etmiş olursun. Dış kod ekleme, silme veya sıralama yaparak sınıfın kurallarını atlayabilir.

Salt okunur görünüm sunmak ve değişiklikleri sınıfın metotlarından geçirmek bu riski azaltır. Buradaki hedef yalnız API’yi kapatmak değil; değişikliğin tek bir kontrol noktasından geçmesini sağlamaktır.

- Mutable koleksiyonu doğrudan döndürme.
- Okuma ve değiştirme yetkisini ayır.
- Koleksiyon kurallarını tek yerde uygula.

### Fail-fast yaklaşımının sınırı

Geçersiz değerleri mümkün olduğunca erken reddetmek hatanın kaynağını yakın tutar. Fakat kullanıcıdan gelen her hatalı giriş için exception fırlatmak iyi UX anlamına gelmez. Domain sınırında invariant ihlali exception olabilirken form doğrulaması kullanıcıya alan bazlı mesaj döndürebilir.

Kuralın hangi katmanda ele alınacağını seçerken “Bu durum programlama hatası mı, beklenen kullanıcı davranışı mı?” sorusu yararlıdır.

- Programlama hatası ile beklenen doğrulama hatasını ayır.
- Domain invariantını sessizce düzeltme.
- Hatanın kaynağını mümkün olduğunca yakın tut.

## Teknik iddialar ve kaynak notları

### Kapsüllemenin amacı

Kapsülleme, nesnenin iç state’ini yalnızca yetkili davranışlar üzerinden değiştirmeyi sağlar. Bir alanı private yapmak tek başına yeterli değildir; public property setter aynı kuralları atlayabiliyorsa invariant hâlâ dışarıya açıktır. Tasarımın ölçütü erişim belirleyicisi değil, geçersiz state üretmenin mümkün olup olmadığıdır.

**Birincil referans:** [1]

### Davranışın veriyle birlikte tutulması

Nesne yönelimli modelde state’i değiştiren iş kuralının modelin içinde bulunması, aynı kuralın farklı servis ve denetleyicilerde tekrar edilmesini azaltır. Böylece doğrulama sınırı tek noktada kalır ve çağıran kod nesnenin iç temsilini bilmek zorunda kalmaz.

**Birincil referans:** [1]

## Sınır durumları

- ORM veya serializer bazı üyeler için setter/constructor erişimi isteyebilir; altyapı gereksinimi domain invariantını gevşetmemelidir.
- IReadOnlyCollection dışarıdan Add işlemini engeller fakat içindeki elemanlar mutable ise bütünüyle immutability sağlamaz.
- init-only property oluşturma anındaki serbestliği artırır fakat çok alanlı invariantlarda constructor/factory hâlâ daha açık olabilir.
- Reflection veya bazı serializer araçları normal erişim sınırlarını aşabilir; güvenlik sınırı yalnız private anahtar sözcüğüne dayandırılmamalıdır.

## Uygulama vakası

### Public setter nedeniyle geçersiz sipariş durumu

**Bağlam**

Sipariş modelinde Durum, Odendi ve IptalTarihi alanlarının tamamı public setter ile açılmıştır. Farklı ekranlar bu alanları ayrı ayrı değiştirdiğinde “ödenmiş ama iptal tarihi bulunan” veya “iptal edilmiş fakat aktif görünen” kombinasyonlar oluşur. Her setter tek başına geçerli değer kabul ettiği için hata alan düzeyindeki doğrulamada görünmez.

**Teknik analiz**

Model, alan merkezli setter’lar yerine Ode(), IptalEt() gibi geçişleri temsil eden davranışlara dönüştürülür. Her davranış önce mevcut state’i kontrol eder, ardından birlikte değişmesi gereken alanları tek transaction benzeri sınır içinde günceller. Dış katman yalnız bu davranışları çağırır.

**Beklenen sonuç**

Geçersiz kombinasyon üretme yolları kapanır. Unit testler tek tek property değerlerini değil, izin verilen ve reddedilen state geçişlerini doğrular. Serializer/ORM gereksinimleri domain modelinden ayrı yapılandırılır.

### İzlenecek sinyaller

- Reddedilen state geçişi sayısı
- Geçersiz model yakalayan invariant testleri
- Model state’ini doğrudan değiştiren çağrı noktaları
- Serialization sonrası invariant doğrulaması

## Kod ve çalışma akışı

### Davranışla korunan banka hesabı

Dış kod bakiyeyi keyfî olarak atayamaz. Her değişim anlamlı bir işlem ve kural üzerinden gerçekleşir.


```csharp
public sealed class BankaHesabi
{
    public decimal Bakiye { get; private set; }

    public void ParaYatir(decimal tutar)
    {
        if (tutar <= 0)
            throw new ArgumentOutOfRangeException(nameof(tutar));

        Bakiye += tutar;
    }

    public void ParaCek(decimal tutar)
    {
        if (tutar <= 0)
            throw new ArgumentOutOfRangeException(nameof(tutar));
        if (tutar > Bakiye)
            throw new InvalidOperationException("Yetersiz bakiye.");

        Bakiye -= tutar;
    }
}
```

1. Setter dışarıya kapalıdır.
2. Miktar doğrulaması iki işlemde de yapılır.
3. Para çekme işlemi mevcut durumu da kontrol eder.

### Değiştirilebilir koleksiyonu sızdırma hatası

Salt okunur arayüz, koleksiyon değişikliklerini sınıfın doğrulama yapan metodunda tutar.


```csharp
// Sorunlu: dış kod listeyi temizleyebilir.
public List<string> Roller { get; } = new();

// Daha güvenli dış yüzey:
private readonly List<string> _roller = new();
public IReadOnlyCollection<string> Roller => _roller.AsReadOnly();

public void RolEkle(string rol)
{
    if (!_roller.Contains(rol, StringComparer.OrdinalIgnoreCase))
        _roller.Add(rol);
}
```

1. İç liste private kalır.
2. Dışarı yalnız okuma görünümü verilir.
3. Tekrarlı rol kuralı RolEkle içinde korunur.

### Property doğrulaması mı davranış mı?

Basit biçim normalizasyonu property sınırında kalabilir; iş akışı anlamı taşıyan değişiklik ayrıca adlandırılmış metotla ifade edilir.


```csharp
private string _telefon = string.Empty;

public string Telefon
{
    get => _telefon;
    private set => _telefon = TelefonDogrulayici.NormalizeEt(value);
}

public void TelefonDegistir(string yeniTelefon)
{
    Telefon = yeniTelefon;
}
```

1. Normalize etme tek yerde yapılır.
2. Dışarıdan doğrudan setter yoktur.
3. Metot iş olayını açıkça adlandırır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `private set` | Dışarıdan atamayı kapatır |
| `init` | Yalnız nesne oluşturulurken atamaya izin verir |
| `readonly` | Alan başvurusunun sonradan değişmesini engeller |
| `IReadOnlyCollection<T>` | Salt okunur koleksiyon sözleşmesi sunar |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS0272: setter erişilemiyor

- **Olası neden:** private set özelliği dışarıdan atanmak istenir.
- **Teşhis / düzeltme:** Setterı public açmak yerine nesnenin hangi davranışla değişmesi gerektiğini belirle.

### Collection was modified

- **Olası neden:** İç koleksiyon referansı dışarı sızmış ve gezinme sırasında değiştirilmiştir.
- **Teşhis / düzeltme:** Salt okunur görünüm ve kontrollü metotlar kullan.

### Nesne veritabanından geçersiz geliyor

- **Olası neden:** ORM, alanları iş kurallarını atlayarak dolduruyor veya eski veri kuralı ihlal ediyor.
- **Teşhis / düzeltme:** Veritabanı constraint ekle; materialization sonrası invariant doğrulamasını test et.

## Üretim ve işletim notları

- State değişikliğini anlamlı domain metotlarıyla adlandır.
- Koleksiyonları doğrudan mutable liste olarak dışarı verme.
- Property setter içine gizlenmiş ağır I/O veya beklenmeyen yan etki koyma.
- Geçersiz kombinasyonları tek tek alan doğrulaması yerine nesnenin bütünü üzerinden değerlendir.

## Birincil referanslar

1. [Microsoft Learn — Encapsulation overview](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/tutorials/oop)

## Doğrulama senaryoları

- Stok miktarını eksiye düşürmeyen ürün modeli yaz.
- Dışarıya IReadOnlyCollection veren sipariş modeli kur.
- İzin verilmeyen durum geçişlerini test et.

## Üretim kontrol listesi

- [ ] Public setter yalnız gerçekten serbest değişen veride var.
- [ ] Her değişiklik iş niyetini anlatan metotla yapılıyor.
- [ ] İç koleksiyon referansı sızmıyor.
- [ ] Invariant hem kod hem gerekirse veritabanında korunuyor.

---
Bu dosya https://kutarya.com/konu/csharp/kapsulleme sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
