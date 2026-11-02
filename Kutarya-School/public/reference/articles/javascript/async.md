---
title: "JavaScript Asenkron Programlama"
type: "technical-article"
canonical: "https://kutarya.com/konu/javascript/async"
publisher: "Kutarya"
language: "tr-TR"
technology: "JavaScript"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# JavaScript Asenkron Programlama

JavaScript asenkron programlamada Promise, async/await, event loop, paralellik, HTTP hata kanalları ve iptal davranışı.

**Canonical:** https://kutarya.com/konu/javascript/async
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** JavaScript
**Referans kapsamı:** ECMAScript Promise modeli ve güncel Fetch/AbortController API’leri.

## Özet

JavaScript tek çağrı yığını üzerinde çalışırken ağ ve zamanlayıcı gibi işler çalışma ortamına devredilir. Promise, tamamlanacak bir işin sonucunu temsil eder; async/await ise bu akışı okunabilir hâle getirir fakat işi otomatik olarak paralelleştirmez.

async/await Promise tabanlı kontrol akışını okunabilir kılar ancak bağımsız işleri kendiliğinden paralel başlatmaz. Ardışık await ile birlikte başlatılan Promise’lerin performans ve hata davranışı farklıdır.

Ağ isteklerinde HTTP durum kodları, network failure, JSON ayrıştırma ve kullanıcı tarafından tetiklenen iptal ayrı hata sınıfları olarak ele alınmalıdır; hepsini tek catch bloğunda aynı şekilde raporlamak teşhisi zorlaştırır.

## Kapsam maddeleri

- Event loop sırasını tahmin etmek
- Promise hatalarını kaybetmemek
- Bağımsız işleri paralel çalıştırmak
- AbortController ile isteği iptal etmek

## Temel kavramlar

### Microtask kuyruğu

Promise devamları, mevcut çağrı yığını bittikten sonra ve zamanlayıcılardan önce çalışır.

### Ardışık ve paralel

Bir sonuç diğerine bağlı değilse iki await işlemini art arda başlatmak gereksiz bekleme üretir.

### İptal

Kullanıcı sayfadan ayrıldığında eski isteği sonlandırmak hem kaynak tüketimini hem de geç gelen yanıt yarışını azaltır.

## Teknik açıklama

### async/await paralellik değil kontrol akışıdır

async/await, Promise tabanlı kodu senkron görünümlü yazmayı kolaylaştırır. await bulunduğu async fonksiyonun devamını Promise sonuçlanana kadar erteler; tüm JavaScript motorunu durdurmaz. Bu ayrım, UI’nin neden donmadan ağ isteği bekleyebildiğini anlamak için önemlidir.

İki bağımsız isteği art arda await edersen ikinci iş, birincinin tamamlanmasını gereksiz yere bekler. İki Promise’i önce başlatıp Promise.all ile beklemek toplam süreyi düşürebilir. Sonuçlar birbirine bağlıysa ise ardışık akış doğrudur.

- await işi otomatik paralelleştirmez.
- Bağımsız Promise’leri birlikte başlat.
- Bağımlı adımları bilinçli olarak sırala.

### fetch HTTP hatalarını otomatik exception yapmaz

fetch ağ seviyesinde başarılı şekilde bir HTTP yanıtı aldığında 404 veya 500 gibi durumlarda da Response döndürebilir. Bu yüzden yalnız try/catch yeterli değildir; response.ok veya status ayrıca kontrol edilmelidir.

Hata nesnesini kullanıcı mesajıyla karıştırma. Log katmanında teknik bağlamı korurken UI’de kullanıcının yapabileceği bir sonraki adımı anlatan mesaj göster.

- HTTP durumunu response.ok ile kontrol et.
- Network failure ile HTTP error ayrımını bil.
- Teknik hata ayrıntısını gözlemleme sisteminde koru.

### İptal yarış koşullarını azaltır

Arama kutusunda kullanıcı hızla yeni sorgu yazdığında eski istek yeni isteğin ardından tamamlanabilir ve ekrana yanlış sonucu basabilir. AbortController önceki isteği sonlandırarak hem kaynak tüketimini hem geç gelen yanıt riskini azaltır.

İptal exception’ını gerçek uygulama hatası gibi raporlamamak gerekir. Kullanıcının yeni işlem başlatması nedeniyle oluşan beklenen iptal ile sunucu hatasını ayır.

- Yeni istek eski isteği geçersiz kılıyorsa iptal et.
- AbortError beklenen kontrol akışı olabilir.
- Component yaşam döngüsünde temizleme yap.

## Teknik iddialar ve kaynak notları

### Promise ve async/await

async fonksiyon her zaman Promise döndürür; await, çevreleyen async fonksiyonun devamını daha sonra yürütülecek şekilde askıya alır ancak JavaScript iş parçacığını bloke eden senkron CPU işini paralelleştirmez. Birbirinden bağımsız Promise’leri ardışık await etmek gereksiz seri gecikme oluşturabilir.

**Birincil referans:** [1]

### Promise.all ve Fetch hata modeli

Promise.all giriş Promise’lerinden biri reddedildiğinde sonuç Promise’ini reddeder; diğer başlatılmış işler otomatik iptal edilmez. Fetch tarafında ayrıca HTTP 4xx/5xx yanıtlarının network rejection’dan ayrılması gerekir. Bu iki davranış birlikte kullanıldığında hata ve iptal politikası açık tasarlanmalıdır.

**Birincil referans:** [3], [2]

## Sınır durumları

- Promise.all fail-fast sonucu diğer I/O işlerinin durduğu anlamına gelmez.
- await döngüsü bazı durumlarda bilinçli sıraya ihtiyaç duyar; her seri await performans hatası değildir.
- async event handler hataları üst çağıran tarafından her zaman gözlenmeyebilir.
- Abort yalnız destekleyen operasyonlarda etkilidir; uygulama içi state değişikliklerini geri almaz.

## Uygulama vakası

### Bağımsız API çağrılarının ardışık await edilmesi

**Bağlam**

Dashboard açılırken kullanıcı, bildirim ve özellik bayrağı istekleri sırayla await edilir. Her çağrı yaklaşık 300 ms sürdüğünde toplam bekleme 900 ms’ye yaklaşır; oysa istekler birbirine bağımlı değildir. Kod okunabilir görünür fakat gereksiz latency üretir.

**Teknik analiz**

Bağımsız Promise’ler önce başlatılır, sonra Promise.all veya ihtiyaca göre allSettled ile beklenir. Bir servisin hatasının tüm dashboard’u kapatıp kapatmaması ürün davranışına göre belirlenir. Cancellation sinyali route değişiminde tüm ilgili isteklere geçirilir.

**Beklenen sonuç**

Kritik veri yükleme süresi en yavaş bağımsız çağrıya yaklaşır. Partial failure davranışı test edilir ve servis bazında timeout/latency izlenir.

### İzlenecek sinyaller

- Waterfall vs parallel network timeline
- Promise rejection sınıfları
- Abort/cancellation oranı
- Critical data ready süresi

## Kod ve çalışma akışı

### Zaman aşımı ve açık hata yönetimi olan istek


```javascript
async function jsonGetir(url, zamanAsimiMs = 5000) {
  const denetleyici = new AbortController();
  const zamanlayici = setTimeout(() => denetleyici.abort(), zamanAsimiMs);

  try {
    const yanit = await fetch(url, { signal: denetleyici.signal });

    if (!yanit.ok) {
      throw new Error(`HTTP ${yanit.status}: ${yanit.statusText}`);
    }

    return await yanit.json();
  } catch (hata) {
    if (hata.name === 'AbortError') {
      throw new Error('İstek zaman aşımına uğradı.', { cause: hata });
    }
    throw hata;
  } finally {
    clearTimeout(zamanlayici);
  }
}
```

1. AbortController fetch çağrısına iptal sinyali verir.
2. HTTP 404 ve 500 cevapları fetch tarafından otomatik hata sayılmadığı için ok kontrolü yapılır.
3. finally her durumda zamanlayıcıyı temizler.
4. Yeni hata, asıl hatayı cause alanında korur.

## Tasarım seçenekleri

### Promise.all

Tüm sonuçlar gerekiyorsa ve ilk hatada işlemin kesilmesi isteniyorsa.

### Promise.allSettled

Bazı işler başarısız olsa da diğer sonuçların raporlanması gerekiyorsa.

## Arıza biçimleri

### Unhandled Promise Rejection

- **Olası neden:** Promise await edilmez veya catch zinciri eklenmez.
- **Teşhis / düzeltme:** Çağrıyı await et; bilinçli fire-and-forget işlerde hatayı işleyen açık bir catch kullan.

### await is only valid in async functions

- **Olası neden:** await uygun olmayan fonksiyon veya modül bağlamında kullanılır.
- **Teşhis / düzeltme:** Saran fonksiyonu async yap ya da scripti type="module" olarak yükle.

### Beklenenden yavaş toplam süre

- **Olası neden:** Bağımsız istekler art arda await edilir.
- **Teşhis / düzeltme:** Promise’leri önce başlat, ardından Promise.all ile birlikte bekle.

## Üretim ve işletim notları

- Bağımsız I/O’yu birlikte başlat, bağımlı işleri sıralı tut.
- Her asenkron sınır için hata sahibini tanımla.
- Cancellation sinyalini alt katmanlara geçir.
- Timeout, retry ve idempotency kararlarını tek catch bloğundan ayrı ele al.

## Birincil referanslar

1. [MDN — Using promises](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises)
2. [MDN — Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
3. [MDN — Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

## Doğrulama senaryoları

- Üç bağımsız uç noktayı Promise.all ile getir.
- Bir arama kutusunda önceki isteği yeni sorguda iptal et.
- allSettled ile kısmi başarı raporu üret.

## Üretim kontrol listesi

- [ ] Her Promise sonucu bekleniyor veya hatası işleniyor.
- [ ] HTTP durum kodu ayrıca kontrol ediliyor.
- [ ] Bağımsız işler gereksiz yere ardışık değil.
- [ ] Bileşen kapanışında istek iptal ediliyor.
- [ ] Kullanıcıya teknik yığın izi yerine anlaşılır hata gösteriliyor.

---
Bu dosya https://kutarya.com/konu/javascript/async sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
