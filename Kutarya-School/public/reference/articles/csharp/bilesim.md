---
title: "C# Bileşim ve Bağımlılık Enjeksiyonu"
type: "technical-article"
canonical: "https://kutarya.com/konu/csharp/bilesim"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# C# Bileşim ve Bağımlılık Enjeksiyonu

C# bileşim, constructor injection, bağımlılık görünürlüğü, nesne oluşturma sınırı ve servis yaşam süresi kararları.

**Canonical:** https://kutarya.com/konu/csharp/bilesim
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** C#
**Referans kapsamı:** .NET dependency injection ve nesne yaşam süresi modeli.

## Özet

Davranışı derin kalıtım zincirleri yerine küçük nesnelerden oluştur; bağımlılıkları görünür, değiştirilebilir ve test edilebilir tut.

Bileşim, davranışı kalıcı tür hiyerarşileri yerine küçük nesnelerin iş birliği üzerinden kurar. Bu model bağımlılıkları constructor üzerinde görünür kılar ve dış servislerin testte veya farklı çalışma ortamlarında değiştirilmesini kolaylaştırır.

Dependency injection tek başına iyi tasarım garantisi değildir; özellikle singleton/scoped/transient yaşam süreleri yanlış seçildiğinde state sızıntısı veya disposed nesne hataları oluşabilir.

## Kapsam maddeleri

- has-a ilişkisini modellemek
- Constructor injection kullanmak
- Nesne oluşturma ile iş davranışını ayırmak
- Service lifetime sorunlarını fark etmek

## Temel kavramlar

### Bileşim

Bir türün davranışı başka nesneleri kullanarak oluşturmasıdır.

### Constructor injection

Zorunlu bağımlılıkların nesne kurulurken açıkça verilmesidir.

### Composition root

Somut nesnelerin seçilip nesne ağacının kurulduğu uygulama başlangıç noktasıdır.

### Lifetime

Bağımlılığın transient, scoped veya singleton ömrü state ve eşzamanlılık davranışını etkiler.

## Teknik açıklama

### Bileşim değiştirilebilir davranışı küçük parçalara ayırır

Bir sınıf başka nesneleri kullanarak davranışını oluşturduğunda ilişki kalıtıma göre daha gevşektir. E-posta gönderme, fiyat hesaplama veya kayıt yazma gibi davranışlar ayrı bileşenlere taşınabilir.

Bu, ana sınıfın sorumluluğunu küçültür. Ayrıca tek bir davranışı değiştirmek için dev bir taban sınıf hiyerarşisini değiştirmek yerine yalnız ilgili bileşen yenilenir.

- Davranışı değişim nedenine göre parçala.
- Küçük nesneleri açık bağımlılıkla bir araya getir.
- Inheritance yerine delegation seçeneğini düşün.

### Dependency Injection bir framework özelliği değildir

DI’nin özü bir sınıfın ihtiyaç duyduğu nesneleri kendi içinde new ile üretmemesi, dışarıdan almasıdır. Container yalnız bu bağlantıları otomatik kuran araçtır. Constructor ile bağımlılık vermek container olmadan da dependency injection’dır.

Bir sınıfın constructor’ı on bağımlılığa çıktıysa çözüm hemen property injection değildir. Bu genellikle sınıfın çok fazla sorumluluk taşıdığını gösteren tasarım sinyalidir.

- DI ile DI container’ı ayır.
- Zorunlu bağımlılığı constructor’dan geçir.
- Çok kalabalık constructor’ı sorumluluk kokusu olarak incele.

### Yaşam süresi state tasarımını etkiler

Singleton, scoped ve transient yaşam süreleri özellikle web uygulamalarında state paylaşımını değiştirir. Uzun yaşayan bir servis kısa yaşayan veya istek özel state’i yanlışlıkla tutarsa eşzamanlılık sorunları çıkabilir.

Bu nedenle dependency injection yalnız test için değil, nesnelerin kim tarafından ve ne kadar süre yaşatıldığını açık yönetmek için de önemlidir.

- Mutable state ile yaşam süresini birlikte düşün.
- Singleton servis içinde istek state’i tutma.
- Dispose edilmesi gereken kaynakların sahibini belirle.

## Teknik iddialar ve kaynak notları

### Bağımlılıkların görünür hâle gelmesi

Constructor injection bir sınıfın çalışmak için ihtiyaç duyduğu iş birlikçilerini oluşturma anında görünür kılar. .NET’in yerleşik dependency injection altyapısı bu nesnelerin kayıt, çözümleme ve yaşam süresi yönetimini destekler; ancak container yalnız oluşturma mekanizmasıdır, sorumluluk sınırlarını kendiliğinden doğru kurmaz.

**Birincil referans:** [1]

### Yaşam süresi uyumu

Singleton, scoped ve transient servislerin state ve sahiplik davranışı farklıdır. Uzun ömürlü bir nesnenin daha kısa ömürlü bağımlılığı doğrudan tutması veya disposable kaynağın yanlış scope’ta çözülmesi, uygulama ilk bakışta çalışsa bile kaynak/scope hatalarına yol açabilir.

**Birincil referans:** [1]

## Sınır durumları

- Service locator kullanımı bağımlılıkları constructor’dan gizler ve test/analiz maliyetini artırır.
- Singleton implementasyonun thread-safe olması gerekebilir; DI kaydı bunu otomatik sağlamaz.
- Transient disposable servislerin sahipliği ve dispose noktası container modeline göre değerlendirilmelidir.
- Circular dependency genellikle sorumluluk sınırlarının birbirine dolandığına işaret eder.

## Uygulama vakası

### Yanlış DI lifetime nedeniyle request verisinin sızması

**Bağlam**

Kullanıcı bağlamı tutan bir servis yanlışlıkla singleton kaydedilir. İlk isteğin state’i servis alanında saklandığı için sonraki request aynı instance üzerinden önceki kullanıcıya ait veriyi görebilir. Uygulama düşük trafikte doğru görünür; paralel testte sorun belirginleşir.

**Teknik analiz**

State sahipliği ve yaşam süresi birlikte değerlendirilir. Request’e bağlı servis scoped yapılır veya servis stateless hâle getirilir. Singleton bağımlılıkların yalnız thread-safe ve request state’inden bağımsız nesneler tutması sağlanır. Composition root’ta lifetime incelemesi yapılır.

**Beklenen sonuç**

Request izolasyonu integration testle doğrulanır. DI kayıtları için startup validation ve mimari test eklenir; scope mismatch uyarıları deployment öncesi yakalanır.

### İzlenecek sinyaller

- Servis lifetime haritası
- Request kimliği ile servis instance kimliği
- Parallel integration test sonuçları
- Disposed/scope validation hataları

## Kod ve çalışma akışı

### Sipariş hizmetini küçük davranışlardan oluşturma

Servis teknik ayrıntıları üretmez; stok, ödeme, depolama ve zaman davranışlarını sözleşmeler üzerinden birleştirir.


```csharp
public sealed class SiparisServisi(
    IStokKontrolu stok,
    IOdemeYontemi odeme,
    ISiparisDeposu depo,
    IClock saat)
{
    public async Task<Guid> OlusturAsync(SiparisTalebi talep, CancellationToken token)
    {
        await stok.AyirAsync(talep.Kalemler, token);
        await odeme.OdeAsync(talep.Toplam, token);

        var siparis = Siparis.Olustur(talep, saat.UtcNow);
        await depo.KaydetAsync(siparis, token);
        return siparis.Id;
    }
}
```

1. Bağımlılıklar constructor’da görünür.
2. İş akışı tek metotta okunur.
3. Testte her dış sınır kontrollü uygulamayla değiştirilebilir.

### ASP.NET Core kayıt noktası

Somut tür seçimi composition root içinde yapılır; iş sınıfı DI konteynerini bilmez.


```csharp
builder.Services.AddScoped<ISiparisDeposu, EfSiparisDeposu>();
builder.Services.AddScoped<IStokKontrolu, StokKontrolu>();
builder.Services.AddScoped<IOdemeYontemi, PaytrOdemeYontemi>();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddScoped<SiparisServisi>();
```

1. Veritabanı kullanan servisler request scope ile yaşar.
2. State taşımayan saat singleton olabilir.
3. İş sınıfı somut türlere bağlı değildir.

### Service locator karşı örneği

Sınıfın neye ihtiyaç duyduğu imzadan görünmez; eksik kayıt derleme yerine çalışma zamanında ortaya çıkar.


```csharp
// Kaçın: bağımlılık gizlenir ve çalışma zamanında patlar.
public sealed class SiparisServisi
{
    private readonly IServiceProvider _services;
    public SiparisServisi(IServiceProvider services) => _services = services;

    public Task CalistirAsync() =>
        _services.GetRequiredService<IOdemeYontemi>().OdeAsync(100, default);
}
```

1. IServiceProvider bütün konteynere erişim verir.
2. Gerçek bağımlılık constructor imzasında yoktur.
3. Test kurulumu uygulamanın DI ayrıntısına bağlanır.

## Referans tablosu

| Terim | Açıklama |
| --- | --- |
| `Transient` | Her çözümlemede yeni örnek |
| `Scoped` | Bir istek/kapsam boyunca tek örnek |
| `Singleton` | Uygulama ömrü boyunca tek örnek |
| `IServiceProvider` | Yalnız altyapı/factory sınırında dikkatle kullanılmalı |

## Tasarım seçenekleri

### Önce sorumluluğu tanımla

Bir tür oluşturmadan önce hangi veriyi koruduğunu ve hangi davranıştan sorumlu olduğunu tek cümleyle yaz.

### En küçük görünür yüzey

Her alanı public açmak yerine yalnız kullanan kodun ihtiyaç duyduğu işlemleri dışarı sun.

## Arıza biçimleri

### Unable to resolve service

- **Olası neden:** Interface için somut kayıt yoktur veya yanlış constructor seçilir.
- **Teşhis / düzeltme:** Composition root kayıtlarını ve bağımlılık zincirini kontrol et.

### Cannot consume scoped service from singleton

- **Olası neden:** Uzun ömürlü singleton kısa ömürlü scoped servisi tutmaya çalışır.
- **Teşhis / düzeltme:** Lifetime’ları uyumlu yap; request verisini singleton state’e taşıma.

### Döngüsel bağımlılık

- **Olası neden:** A, B’yi; B de A’yı ister.
- **Teşhis / düzeltme:** Sorumlulukları yeniden ayır, ortak davranışı üçüncü servise çıkar veya olayla yönü kır.

## Üretim ve işletim notları

- Composition root’u uygulamanın belirgin bir başlangıç sınırında tut.
- Domain katmanını container API’sine bağımlı hâle getirme.
- Lifetime seçimini state sahipliği ve eşzamanlı erişim modeline göre yap.
- İstek dışı başarısız olabilecek bağımlılıklarda timeout/cancellation sözleşmesini geç.

## Birincil referanslar

1. [Microsoft Learn — Dependency injection in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)

## Doğrulama senaryoları

- new ile oluşturulan dış servisi constructor injection’a taşı.
- Scoped ve singleton yaşam süreleri için küçük bir deney yaz.
- Döngüsel iki servisin sorumluluklarını ayır.

## Üretim kontrol listesi

- [ ] Zorunlu bağımlılıklar constructor’da açık.
- [ ] İş sınıfı IServiceProvider kullanmıyor.
- [ ] Somut seçim tek composition root içinde.
- [ ] Lifetime ile state davranışı uyumlu.

---
Bu dosya https://kutarya.com/konu/csharp/bilesim sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
