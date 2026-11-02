---
title: "C# Interface ve Sözleşme Tasarımı"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/arayuzler"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Interface ve Sözleşme Tasarımı

C# interface sözleşmeleri, bağımlılık sınırları, küçük arayüz tasarımı, test doubles ve default interface member etkileri.

**Canonical:** https://kutarya.com/konu/csharp/arayuzler
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** C# interface sistemi ve .NET bağımlılık sınırları.

## Özet

Interface’i her sınıfın başına I eklemek için değil; bağımlılık sınırı, değiştirilebilir uygulama ve odaklı sözleşme kurmak için kullan.

Interface, her somut sınıfa otomatik olarak eklenen bir katman değil; değişebilir davranışla kullanan kod arasındaki sözleşmedir. Değer üretmeyen soyutlamalar dosya sayısını artırırken değişiklik maliyetini azaltmaz.

Makale özellikle dış servis, depolama ve saat kaynağı gibi değişebilir bağımlılıkların interface ile ayrılması ile yalnız tek uygulaması bulunan iç sınıfların gereksiz soyutlanması arasındaki farkı ele alır.

## Kapsam maddeleri

- Interface’in çözmeye çalıştığı bağımlılığı tanımak
- Küçük ve rol odaklı sözleşme yazmak
- Test doubles kullanımını doğru sınırlamak
- Default interface member riskini değerlendirmek

## Temel kavramlar

### Sözleşme

Nasıl yapıldığını değil, kullananın hangi davranışa güvenebileceğini ifade eder.

### Bağımlılık yönü

Üst seviye iş kuralı, alt seviye teknik ayrıntının interface’ine değil kendi ihtiyaç sözleşmesine sahip olmalıdır.

### Interface segregation

Kullanan sınıf ihtiyaç duymadığı metotlara bağımlı bırakılmaz.

### Uygulama

Bir sınıf birden fazla interface’i uygulayabilir; state mirası almaz.

## Teknik açıklama

### Interface bir “sınıfın aynası” olmamalıdır

Bir sınıftaki bütün public metotları aynı isimli interface’e kopyalamak, çoğu zaman gerçek bir soyutlama oluşturmaz. İyi sözleşme kullanan tarafın ihtiyacını anlatır. Örneğin rapor servisi tüm dosya sistemini değil yalnız Kaydet davranışını bilmek zorunda olabilir.

Bu bakış Interface Segregation ilkesini pratik hâle getirir: tüketici kullanmadığı üyelere bağımlı kalmaz ve sahte test uygulamaları gereksiz metotlarla dolmaz.

- Interface’i implement eden sınıfa göre değil tüketene göre düşün.
- Küçük ama anlamlı sözleşmeler kur.
- Kullanılmayan üyeleri zorunlu kılma.

### Interface nerede gereksizdir?

Uygulamanın içinde tek bir basit veri dönüştürücü var ve değişmesi beklenmiyorsa yalnız “test edilebilir olsun” diye interface eklemek değer üretmeyebilir. Test edilebilirlik sadece interface ile gelmez; saf fonksiyonlar ve açık bağımlılıklar da test edilebilir.

Interface özellikle süreç dışı kaynaklar, zaman, rastgelelik, ödeme, mesajlaşma veya birden fazla strateji gibi değişim noktalarında güçlüdür.

- Gerçek bir değişim ekseni yoksa soyutlamayı sorgula.
- Dış I/O sınırları iyi interface adaylarıdır.
- Soyutlama sayısını başarı metriği yapma.

### Sözleşmede hata davranışını da tanımla

Metot imzası yalnız parametre ve dönüş türünden ibaret değildir. Null kabulü, iptal davranışı, tekrar çağrılabilirlik ve hangi hataların beklenen sonuç olduğu da sözleşmenin parçasıdır.

Özellikle async interface’lerde CancellationToken geçirmek, çağıranın yaşam süresini kontrol etmesine izin verir. Bu ayrıntı sonradan eklenirse tüm implementasyonlara dokunmak gerekebilir.

- Null ve hata davranışını açıklaştır.
- Async işlemlerde iptal ihtiyacını erken düşün.
- Interface değişikliğinin tüm uygulamalara yayıldığını unutma.

## Teknik iddialar ve kaynak notları

### Sözleşme olarak interface

Interface bir türün hangi üyeleri sunacağını tanımlar ve bir sınıfın birden fazla davranış sözleşmesini uygulayabilmesini sağlar. Çağıran taraf somut uygulama yerine interface’e bağımlı olduğunda depolama, ağ istemcisi veya saat sağlayıcısı gibi değişebilir bileşenler daha açık bir sınır kazanır.

**Birincil referans:** [1]

### Interface büyüklüğü

Bir interface’in değeri dosya sayısından değil, tüketicinin ihtiyaç duyduğu kararlı sözleşmeyi temsil etmesinden gelir. Çok geniş interface’ler implementasyonları ilgisiz üyeleri desteklemeye zorlar; aşırı küçük ve tek kullanımlık interface’ler ise anlamlı değişim sınırı oluşturmadan indirection ekleyebilir.

**Birincil referans:** [1]

## Sınır durumları

- Interface state taşımaz; state paylaşımı gerekiyorsa sınıf/bileşim gibi başka yapı gerekir.
- Aynı interface’in iki implementasyonu farklı hata/yan etki semantiğine sahipse sözleşme teknik olarak aynı olsa bile davranışsal uyum bozulabilir.
- Generic interface’lerde variance yalnız belirli type parameter kullanım yönlerinde geçerlidir.
- Default member kullanımı eski implementasyonları kırmadan API geliştirebilir ancak davranışın görünürlüğünü azaltabilir.

## Uygulama vakası

### Gereksiz repository interface katmanının maliyeti

**Bağlam**

Her sınıf için otomatik interface üreten bir projede yalnız tek uygulaması bulunan küçük domain servisleri dahi I...Service katmanı arkasındadır. Değişiklikler aynı anda interface ve sınıfta yapılır; testler gerçek davranış yerine yoğun mock kurulumuna dönüşür. Buna karşın dış ödeme sağlayıcısı doğrudan concrete sınıfa bağlıdır.

**Teknik analiz**

Soyutlama, gerçek değişim sınırlarına taşınır. Harici ödeme istemcisi, saat ve depolama gibi environment’a göre değişen bağımlılıklar için küçük contract’lar tutulur; tek ve kararlı iç algoritmalar concrete kalır. Interface tüketicinin ihtiyacına göre şekillenir.

**Beklenen sonuç**

Mock sayısı azalır, integration testler daha anlamlı hâle gelir ve dış servis değişimi çağıran kodu etkilemeden yapılabilir. Interface’in neden var olduğu her public contract için açıklanabilir olur.

### İzlenecek sinyaller

- Interface başına gerçek implementasyon sayısı
- Mock kurulum satırı / test davranışı oranı
- Dış bağımlılık değişiminde etkilenen dosyalar
- Contract bazında hata/timeout davranışı

## Kod ve çalışma akışı

### Kullanan katmana ait küçük sözleşme

İş akışı bütün veritabanı API’sine değil, gereksinimi olan iki işleme bağımlıdır.


```csharp
public interface ISiparisDeposu
{
    Task<Siparis?> IdIleBulAsync(Guid id, CancellationToken token);
    Task KaydetAsync(Siparis siparis, CancellationToken token);
}

public sealed class SiparisTamamlama
{
    private readonly ISiparisDeposu _depo;
    public SiparisTamamlama(ISiparisDeposu depo) => _depo = depo;
}
```

1. Interface iş katmanında tanımlanır.
2. Teknik repository bu sözleşmeyi uygular.
3. Testte bellek içi uygulama kullanılabilir.

### Şişmiş interface’i bölme

Okuma ve yazma rolleri ayrıldığında istemciler gereksiz metotları uygulamak veya mocklamak zorunda kalmaz.


```csharp
public interface IRaporOkuyucu
{
    Task<Rapor> GetirAsync(DateOnly tarih, CancellationToken token);
}

public interface IRaporYazici
{
    Task KaydetAsync(Rapor rapor, CancellationToken token);
}

// Yalnız okuyan ekran, yazma metoduna bağımlı değildir.
public sealed class RaporEkrani(IRaporOkuyucu okuyucu) { }
```

1. Roller ayrı interface’lere bölünür.
2. İstemci yalnız kullandığı role bağlanır.
3. Gerekirse tek sınıf ikisini de uygular.

### Gerçekçi test uygulaması

Yalnız çağrı sayan mock yerine sözleşmenin temel davranışını taşıyan küçük bir in-memory implementation kullanılabilir.


```csharp
public sealed class BellekSiparisDeposu : ISiparisDeposu
{
    private readonly Dictionary<Guid, Siparis> _veri = new();
    public Task<Siparis?> IdIleBulAsync(Guid id, CancellationToken _) =>
        Task.FromResult(_veri.GetValueOrDefault(id));
    public Task KaydetAsync(Siparis siparis, CancellationToken _)
    {
        _veri[siparis.Id] = siparis;
        return Task.CompletedTask;
    }
}
```

1. Aynı interface uygulanır.
2. Durum test boyunca bellekte tutulur.
3. İş akışı gerçekçi kayıt/bulma davranışıyla sınanır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `interface` | Davranış sözleşmesi tanımlar |
| `:` | Interface uygulamasını belirtir |
| `explicit implementation` | Üyeyi yalnız interface üzerinden görünür yapar |
| `default member` | Interface içinde varsayılan uygulama sağlar |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### CS0535: interface üyesi uygulanmadı

- **Olası neden:** Sınıf interface’in tüm zorunlu üyelerini doğru imzayla sağlamaz.
- **Teşhis / düzeltme:** İmzayı ve nullable türleri karşılaştır; kullanılmayan metot çoksa interface’i böl.

### Çok fazla tek üyeli interface

- **Olası neden:** Değişme ihtiyacı olmayan her sınıf için mekanik abstraction üretilmiştir.
- **Teşhis / düzeltme:** Gerçek bir sınır, alternatif uygulama veya test ihtiyacı yoksa somut tür yeterli olabilir.

### Service locator

- **Olası neden:** Sınıf bağımlılıklarını constructor yerine IServiceProvider içinden gizlice çeker.
- **Teşhis / düzeltme:** Gereken interface’leri açık constructor parametresi yap.

## Üretim ve işletim notları

- Interface’i tüketen kodun ihtiyacına göre tanımla.
- Mock oluşturmak tek gerekçe olmasın; gerçek bir değişim/bağımlılık sınırı ara.
- I/O yapan sözleşmelerde cancellation ve hata davranışını açıklaştır.
- Implementasyonların lifetime ve thread-safety beklentilerini sözleşmenin parçası olarak ele al.

## Birincil referanslar

1. [Microsoft Learn — Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces)

## Doğrulama senaryoları

- Dosya okuma ve yazma sözleşmelerini ayır.
- Şişmiş kullanıcı servisini rol odaklı interface’lere böl.
- Mock yerine bellek içi depo uygulaması yaz.

## Üretim kontrol listesi

- [ ] Interface kullananın ihtiyacını ifade ediyor.
- [ ] Metotlar tek rol etrafında toplanıyor.
- [ ] Somut teknik ayrıntı üst katmana sızmıyor.
- [ ] Abstraction gerçek bir değişim noktası taşıyor.

---
Bu dosya https://kutarya.com/konu/csharp/arayuzler sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
