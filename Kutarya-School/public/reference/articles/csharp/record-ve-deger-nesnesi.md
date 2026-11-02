---
title: "C# Record ve Değer Nesneleri"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/record-ve-deger-nesnesi"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Record ve Değer Nesneleri

C# record türleri, değer eşitliği, immutability, with kopyalama ve value object tasarımında doğrulama sınırları.

**Canonical:** https://kutarya.com/konu/csharp/record-ve-deger-nesnesi
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# record ve değer eşitliği davranışı.

## Özet

Kimlik yerine içeriğiyle anlam kazanan modelleri record, readonly record struct ve doğrulanan value object kalıplarıyla kur.

Record türleri değer semantiğini kolaylaştırır ancak her domain nesnesi için doğru varsayım değildir. Kimliği zaman içinde devam eden entity ile yalnız içeriği üzerinden anlam kazanan value object aynı eşitlik modeline sahip değildir.

Makale record kopyalama davranışının sığ kopya niteliğini ve mutable referans alanlarının değer nesnesi tasarımını nasıl zayıflatabildiğini ayrıca ele alır.

## Kapsam maddeleri

- Referans eşitliği ile değer eşitliğini ayırmak
- Record kopyalama davranışını anlamak
- Değer nesnesinde doğrulamayı korumak
- Entity için record kullanım riskini görmek

## Temel kavramlar

### Değer eşitliği

İki örnek aynı bileşen değerlerine sahipse eşit sayılır.

### with ifadesi

Record örneğinin seçilen alanları değiştirilmiş sığ kopyasını üretir.

### Value object

Geçerli değerleri, eşitliği ve ilgili davranışı tek küçük türde toplar.

### Entity

Zaman içinde state değiştirse bile kararlı kimliğiyle aynı nesne kabul edilir.

## Teknik açıklama

### Kimlik mi değer mi?

Entity iki farklı zamanda aynı kimliği taşıdığı için “aynı nesne” kabul edilebilir; value object ise içindeki değerler eşitse eşittir. Bir adres, para miktarı veya koordinat çoğu zaman kimliğinden çok değeriyle anlam kazanır.

Bu ayrım persistence ve karşılaştırma davranışını etkiler. Her DTO’yu record yapmak veya her record’u domain value object sanmak doğru değildir.

- Entity eşitliğinde kimlik önemlidir.
- Value object eşitliğinde içerik önemlidir.
- DTO ile domain modelini otomatik eşitleme.

### Record değer eşitliğini kolaylaştırır

C# record türleri değer tabanlı eşitlik ve with ifadesi gibi özellikleri hazır sunar. Bu, değişmez veri modellerinde elle Equals ve GetHashCode yazma ihtiyacını azaltır.

Fakat record içinde mutable koleksiyon tutarsan dışarıdan bakınca değişmez görünen model gerçekte değişebilir. Değişmezlik yalnız init accessor kullanmakla tamamlanmaz; iç referansların da davranışını düşünmek gerekir.

- Record value equality sağlar.
- İç mutable referanslara dikkat et.
- with ifadesi sığ kopya semantiğini anlamayı gerektirir.

### Value object kendi doğrulamasını taşımalı

E-posta, para veya ürün kodu gibi değerleri düz string olarak sistemin her yerine yaymak doğrulamayı tekrar ettirir. Küçük bir value object, oluşturma sırasında biçimi doğrulayıp uygulama içinde geçerli değeri temsil edebilir.

Bu yaklaşım primitive obsession sorununu azaltır; fakat her int veya string için sınıf üretmek de aşırı olabilir. Domain anlamı ve tekrar eden kural varsa değer nesnesi daha çok değer üretir.

- Tekrarlanan domain doğrulamasını value object’e taşı.
- Geçersiz değerin oluşmasını engelle.
- Her primitive için value object üretmek gerekli değildir; yalnızca anlamlı domain kısıtları olan değerleri kapsülle.

## Teknik iddialar ve kaynak notları

### Record ve değer eşitliği

C# record türleri değer tabanlı eşitlik ve non-destructive mutation için with ifadesi gibi kolaylıklar sağlar. Bu model, kimliğinden çok içerdiği değerlerle anlam kazanan veri taşıyıcıları ve value object’ler için yararlı olabilir.

**Birincil referans:** [1]

### Immutability mutlak değildir

Record kullanmak nesnenin bütün nesne grafiğini otomatik olarak immutable yapmaz. Record içindeki List gibi mutable bir referans paylaşılabilir ve with kopyası bu referansı sığ biçimde taşıyabilir. Değer semantiği isteniyorsa alt bileşenlerin mutability modeli de ayrıca tasarlanmalıdır.

**Birincil referans:** [1]

## Sınır durumları

- Entity kimliği zaman içinde devam ediyorsa tüm alanların eşitliğe katılması yanlış domain semantiği oluşturabilir.
- record class referans türü, record struct değer türüdür; kopyalama ve null davranışları farklıdır.
- with ifadesi validation kurallarını her zaman yeniden çalıştıran factory değildir.
- Mutable koleksiyon veya referans alanı iki record kopyası arasında paylaşılabilir.

## Uygulama vakası

### Record içindeki mutable listenin eşitlik beklentisini bozması

**Bağlam**

Sipariş özeti record olarak tanımlanır ve Items alanı List<string> tutar. with ile kopya üretildikten sonra eski ve yeni record aynı List referansını paylaşır. Yeni kopyaya eleman eklendiğinde “değişmez kopya” olduğu sanılan eski kayıt da değişmiş görünür.

**Teknik analiz**

Sığ kopya davranışı kabul edilerek mutable koleksiyon immutable/read-only yapıya dönüştürülür veya kopyalama sırasında yeni koleksiyon açıkça oluşturulur. Modelin entity mi value object mi olduğu ayrıca netleştirilir; eşitlik beklentisi domain anlamına göre belirlenir.

**Beklenen sonuç**

Value object testleri construction sonrası değişmezlik ve eşitlik senaryolarını kapsar. DTO ve domain modeli ayrılır; her record kullanımının değer semantiği gerektirdiği doğrulanır.

### İzlenecek sinyaller

- with sonrası paylaşılan referanslar
- Equality testleri
- Mutable koleksiyon içeren record sayısı
- Geçersiz value object oluşturma girişimleri

## Kod ve çalışma akışı

### Doğrulanan para değer nesnesi

Para miktarı ve para birimi ayrı primitive değerler olarak dolaşmaz; geçerlilik ve toplama kuralı aynı türde kalır.


```csharp
public sealed record Para
{
    public decimal Tutar { get; }
    public string ParaBirimi { get; }

    public Para(decimal tutar, string paraBirimi)
    {
        if (tutar < 0) throw new ArgumentOutOfRangeException(nameof(tutar));
        if (string.IsNullOrWhiteSpace(paraBirimi)) throw new ArgumentException("Zorunlu", nameof(paraBirimi));
        Tutar = tutar;
        ParaBirimi = paraBirimi.ToUpperInvariant();
    }

    public Para Ekle(Para diger) => ParaBirimi == diger.ParaBirimi
        ? new Para(Tutar + diger.Tutar, ParaBirimi)
        : throw new InvalidOperationException("Para birimleri farklı.");
}
```

1. Constructor geçersiz değeri engeller.
2. Record bileşenlere göre eşitlik sağlar.
3. Ekle yeni değişmez örnek döndürür.

### with ile değişmez kopya

with asıl recordu değiştirmez; yeni bir örnek üretir. İçte değiştirilebilir referanslar varsa kopyanın sığ olduğu unutulmamalıdır.


```csharp
public sealed record Adres(string Sehir, string Ilce, string Satir);

var ilk = new Adres("Ankara", "Çankaya", "Atatürk Bulvarı");
var guncel = ilk with { Ilce = "Yenimahalle" };

Console.WriteLine(ilk.Ilce);   // Çankaya
Console.WriteLine(guncel.Ilce); // Yenimahalle
```

1. İlk değer korunur.
2. Yalnız seçilen bileşen değişir.
3. Yeni record değer eşitliğine katılır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `record class` | Referans türü ve değer eşitliği |
| `record struct` | Değer türü ve değer eşitliği |
| `with` | Seçili alanları farklı sığ kopya |
| `init` | Yalnız başlatma sırasında atama |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### with doğrulamayı atlıyor

- **Olası neden:** init setterlar doğrudan açık ve kopya geçersiz kombinasyon oluşturabiliyor.
- **Teşhis / düzeltme:** Kritik invariant için özel factory/constructor ve kapalı state kullan.

### Entity eşitliği şaşırtıyor

- **Olası neden:** Kimlik taşıyan, değişen entity record olarak tüm alanlarıyla karşılaştırılıyor.
- **Teşhis / düzeltme:** Entity’yi class olarak ve kimlik eşitliği kuralıyla modelle.

## Üretim ve işletim notları

- Value object oluşturulurken geçersiz değeri reddet.
- Eşitliğe hangi alanların katılacağını domain anlamıyla doğrula.
- Koleksiyonlar için immutable/read-only veri yapıları değerlendir.
- Record’u yalnız DTO kolaylığı için değil, istenen eşitlik ve yaşam döngüsü semantiğiyle uyumluysa kullan.

## Birincil referanslar

1. [Microsoft Learn — Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)

## Doğrulama senaryoları

- E-posta adresi value object yaz.
- Farklı para birimlerini toplamayı reddeden test ekle.
- İçinde List bulunan record ile sığ kopya davranışını gözle.

## Üretim kontrol listesi

- [ ] Tür kimlik değil değer anlamı taşıyor.
- [ ] Geçersiz değer oluşturulamıyor.
- [ ] İç referanslar da mümkünse değişmez.
- [ ] Entity ile value object ayrımı açık.

---
Bu dosya https://kutarya.com/konu/csharp/record-ve-deger-nesnesi sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
