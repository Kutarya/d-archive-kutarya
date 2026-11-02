---
title: "Fetch API: HTTP, İptal ve Güvenli İstek Akışı"
type: "technical-article"
canonical: "https://kutarya.com/konu/javascript/fetch-api"
publisher: "Kutarya"
language: "tr-TR"
technology: "JavaScript"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Fetch API: HTTP, İptal ve Güvenli İstek Akışı

Fetch API ile HTTP durum kontrolü, JSON ayrıştırma, AbortController, timeout tasarımı ve arayüz yarış koşulları.

**Canonical:** https://kutarya.com/konu/javascript/fetch-api
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** JavaScript
**Referans kapsamı:** Güncel Fetch API ve AbortController web platformu davranışı.

## Özet

fetch Promise döndürür fakat 404 veya 500 gibi HTTP yanıtları normal Response olabilir. Güvenilir bir istek katmanı durum kodunu, body ayrıştırmayı, iptali ve kullanıcıya gösterilecek hata modelini ayrı ayrı ele alır.

fetch ağ seviyesinde bir yanıt alabildiğinde 404 veya 500 gibi HTTP durumlarında Promise’i otomatik olarak reddetmeyebilir. Bu nedenle network error ile HTTP error aynı hata kanalı değildir.

Makale ayrıca arayüzde art arda başlayan isteklerin sıralama yarışını, AbortController ile iptal davranışını ve response gövdesinin beklenen şemada olup olmadığının çalışma zamanında doğrulanması gerektiğini ele alır.

## Kapsam maddeleri

- HTTP ve network hatasını ayırmak
- Response gövdesini güvenli ayrıştırmak
- AbortController kullanmak
- Eski isteğin yeni UI sonucunu ezmesini önlemek

## Temel kavramlar

### Response.ok

Durum kodunun 200–299 aralığında olup olmadığını kontrol eder. HTTP başarısızlığı için açık kontrol gerekir.

### AbortSignal

İsteğin çağıran tarafından iptal edilebilmesini sağlar. UI yaşam döngüsünde eski isteği sonlandırmak için kullanışlıdır.

### Body consumption

json(), text() gibi işlemler response body akışını okur; aynı gövde varsayılan olarak tekrar tekrar tüketilemez.

## Teknik açıklama

### İstek katmanında üç hata sınıfını ayır

Ağ hatası, HTTP başarısızlığı ve veri biçimi hatası aynı şey değildir. DNS veya bağlantı problemi fetch Promise’ini reject edebilir; 500 yanıtı Response olarak gelebilir; 200 yanıtının body’si beklenen JSON şemasına uymayabilir.

Bu üç durumu tek “bir şeyler ters gitti” catch bloğuna sıkıştırmak teşhisi ve kullanıcı mesajını zayıflatır. API katmanında hatayı sınıflandırmak büyüyen uygulamalarda önemli hâle gelir.

- Network, HTTP ve parse hatasını ayır.
- Kullanıcı mesajıyla teknik logu ayır.
- Başarılı status veri doğruluğunu garanti etmez.

### İptal yalnız performans optimizasyonu değildir

Bir arama ekranında A sorgusu yavaş, B sorgusu hızlı dönerse A daha sonra gelip B’nin sonucunu ezebilir. Bu bir yarış koşuludur. AbortController eski isteği sonlandırarak UI’nin güncel niyetini korumaya yardım eder.

Sunucuda işlem başlamışsa istemci iptali her zaman sunucu işini geri almaz. Bu yüzden ödeme gibi kritik işlemlerde idempotency ve sunucu tarafı işlem tasarımı ayrıca düşünülmelidir.

- UI yarışını iptalle azalt.
- İptal ile transaction rollback’i karıştırma.
- Kritik mutasyonlarda idempotency düşün.

### Retry her isteğe otomatik uygulanmamalıdır

GET gibi idempotent isteklerde geçici ağ hatası için sınırlı retry mantıklı olabilir. Aynı yaklaşımı ödeme veya sipariş oluşturma POST’una körlemesine uygularsan çift işlem riski doğabilir.

Retry yaparken maksimum deneme, exponential backoff ve hangi hata türlerinin yeniden denenebilir olduğu açık olmalıdır.

- Mutasyonlarda kör retry yapma.
- Retry sayısını ve bekleme stratejisini sınırla.
- Sunucunun idempotency desteğini kontrol et.

## Teknik iddialar ve kaynak notları

### HTTP hata ile ağ hatası ayrımı

Fetch, sunucudan geçerli bir HTTP yanıtı aldığında 404 veya 500 gibi durumlarda Promise’i sırf status nedeniyle reddetmez. Uygulama response.ok veya response.status üzerinden HTTP sonucunu ayrıca sınıflandırmalıdır. Network failure ve abort ise farklı rejection nedenleri oluşturabilir.

**Birincil referans:** [1]

### İptal semantiği

AbortController bir veya daha fazla web isteğine AbortSignal sağlayarak devam eden işlemin iptal edilmesini mümkün kılar. Bu mekanizma özellikle arama kutusu gibi hızlı ardışık isteklerde eski isteğin daha geç dönüp yeni UI state’ini ezmesini önlemek için kullanılabilir.

**Birincil referans:** [2]

## Sınır durumları

- response.json() gövde geçerli JSON değilse ayrıca hata verebilir; başarılı status geçerli veri garantisi değildir.
- Bir response body stream çoğu durumda bir kez tüketilir; yeniden okumak için clone gibi mekanizmalar gerekebilir.
- CORS hatası istemci kodunda sıradan 4xx response gibi görünmeyebilir.
- Timeout Fetch API’nin tek bir evrensel timeout parametresi değildir; AbortSignal tabanlı politika ayrıca kurulmalıdır.

## Uygulama vakası

### Arama sonuçlarında eski isteğin yeni sonucu ezmesi

**Bağlam**

Kullanıcı “java” yazdıktan hemen sonra “javascript” yazar. İlk istek ağda daha yavaş kaldığı için ikinci istekten sonra döner ve UI state’ini eski “java” sonuçlarıyla değiştirir. Her iki response da 200 olduğu için klasik hata yönetimi bunu yakalamaz.

**Teknik analiz**

Her arama turuna AbortController veya monoton request id verilir. Yeni sorgu başladığında önceki istek iptal edilir ya da response yalnız güncel id ile eşleşiyorsa state’e uygulanır. HTTP hata, abort ve schema hatası ayrı değerlendirilir.

**Beklenen sonuç**

UI yalnız en güncel sorgunun sonucunu kabul eder. E2E test yapay gecikmeyle yanıt sırasını ters çevirerek yarış koşulunu tekrar üretir.

### İzlenecek sinyaller

- Abort edilen istek sayısı
- Request id / query eşleşmesi
- HTTP status sınıfları
- Parse/schema validation hataları

## Kod ve çalışma akışı

### İptal edilebilir JSON isteği


```javascript
async function apiGet(url, { signal } = {}) {
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`HTTP ${response.status}: ${detail || response.statusText}`);
  }

  return response.json();
}

const controller = new AbortController();
apiGet('/api/products', { signal: controller.signal });
// controller.abort();
```

1. AbortSignal doğrudan fetch’e geçirilir.
2. HTTP başarısızlığı response.ok üzerinden ayrılır.
3. Hata gövdesi varsa teşhis için korunur.
4. Başarılı response JSON olarak ayrıştırılır.

## Tasarım seçenekleri

### Streaming

Büyük gövdede bütün yanıtı beklemek yerine ReadableStream ile parça parça işleme gerekebilir.

### İstek kütüphanesi

Retry, interceptor ve ortak API sözleşmesi büyüdüğünde küçük bir istemci katmanı veya kütüphane değerlendirilebilir.

## Arıza biçimleri

### 404 geldi ama catch çalışmadı

- **Olası neden:** fetch HTTP hata durumlarını otomatik reject etmez.
- **Teşhis / düzeltme:** response.ok veya status değerini kontrol et.

### AbortError

- **Olası neden:** İstek AbortController ile iptal edilmiştir.
- **Teşhis / düzeltme:** Kullanıcı kaynaklı normal iptali sunucu hatası gibi raporlama.

### Unexpected token ... in JSON

- **Olası neden:** Sunucu JSON yerine HTML/metin döndürmüş olabilir.
- **Teşhis / düzeltme:** Content-Type ve response text’i incele; körlemesine json() çağırma.

## Üretim ve işletim notları

- HTTP status, ağ hatası, abort ve parse/schema hatasını ayrı telemetri kategorileri olarak tut.
- Her isteğe ürün gereksinimine uygun timeout/cancellation politikası ver.
- Harici JSON’u yalnız TypeScript türüne cast etmek yerine runtime şemayla doğrula.
- Retry yalnız idempotency ve sunucu yükü etkisi değerlendirildikten sonra uygulanmalı.

## Birincil referanslar

1. [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
2. [MDN — AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

## Doğrulama senaryoları

- Arama kutusunda her yeni sorguda önceki isteği iptal et.
- JSON olmayan hata body’sini kullanıcı dostu mesaja çevir.
- Promise.all ile üç bağımsız endpoint’i birlikte getir.

## Üretim kontrol listesi

- [ ] HTTP durum kodu kontrol ediliyor.
- [ ] İptal senaryosu var.
- [ ] Loading/error/success state ayrılıyor.
- [ ] Hata body’si teşhis edilebilir biçimde korunuyor.
- [ ] Eski yanıtın yeni state’i ezmesi engelleniyor.

---
Bu dosya https://kutarya.com/konu/javascript/fetch-api sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
