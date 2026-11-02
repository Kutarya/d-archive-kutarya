---
title: "JavaScript Event Loop ve Görev Kuyrukları"
type: "technical-article"
canonical: "https://kutarya.com/konu/javascript/event-loop"
publisher: "Kutarya"
language: "tr-TR"
technology: "JavaScript"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# JavaScript Event Loop ve Görev Kuyrukları

JavaScript event loop, call stack, task/microtask kuyrukları, Promise callback sırası ve uzun senkron işlerin tarayıcı üzerindeki etkisi.

**Canonical:** https://kutarya.com/konu/javascript/event-loop
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** JavaScript
**Referans kapsamı:** ECMAScript çalışma modeli ve web platformu event loop davranışı.

## Özet

JavaScript’in event loop modeli, asenkron kodun neden belirli bir sırada çalıştığını açıklar. setTimeout(fn, 0) “hemen çalıştır” demek değildir; callback ancak mevcut stack ve daha yüksek öncelikli microtask işleri tamamlandıktan sonra sıraya girebilir.

JavaScript zamanlama davranışını doğru yorumlamak için yalnız async/await sözdizimi yetmez; çağrı yığını, host ortamı ve microtask/task kuyruklarının hangi sırayla işlendiği bilinmelidir.

Bu model timer sürelerinin “tam şu anda çalış” garantisi vermediğini, Promise callback’lerinin neden setTimeout callback’lerinden önce görülebildiğini ve uzun senkron işin render ile kullanıcı girdisini nasıl geciktirdiğini açıklar.

## Kapsam maddeleri

- Call stack ile kuyrukları ayırmak
- Promise callback sırasını tahmin etmek
- Uzun senkron işin UI’yi neden blokladığını anlamak
- Zamanlama hatalarını küçük örnekle teşhis etmek

## Temel kavramlar

### Call stack

Şu anda çalışan fonksiyonların yürütme yığınıdır. Uzun süren senkron kod stack’i meşgul ettiği sürece başka JavaScript işi ilerleyemez.

### Microtask

Promise devamları gibi işler mevcut JavaScript görevi bittikten sonra, yeni task alınmadan önce işlenir.

### Task kuyruğu

Timer ve birçok olay callback’i yeni bir task olarak sıraya girer. Süresi dolan timer callback’i doğrudan stack’e atlamaz.

## Teknik açıklama

### Event loop bir “arka planda paralel JavaScript” sistemi değildir

Tarayıcı ağ, timer ve kullanıcı olayları gibi işleri farklı altyapılarda takip edebilir; fakat ana sayfa JavaScript’i çoğunlukla tek bir yürütme thread’inde stack üzerinden çalışır. Callback hazır hâle geldiğinde doğrudan çalışan kodu kesmez, uygun kuyruğa girer.

Bu yüzden “async kod her zaman paraleldir” cümlesi yanlıştır. Asenkronluk bekleme sırasında thread’i serbest bırakabilir; CPU yoğun JavaScript ise yine ana thread’i bloklayabilir.

- Asenkronluk ile paralelliği ayır.
- Callback hazır olmak ile çalışmak aynı şey değildir.
- CPU yoğun işi ayrıca ele al.

### Microtask kuyruğunu sonsuza kadar beslemek tehlikelidir

Event loop mevcut task bittikten sonra microtask kuyruğunu boşaltmaya çalışır. Bir microtask sürekli yeni microtask üretirse timer ve render gibi sonraki işler gecikebilir.

Bu durum pratikte nadir olsa da “Promise her zaman daha hızlıdır” gibi bir optimizasyon düşüncesinin neden yanlış olduğunu gösterir. Zamanlama aracını işin semantiğine göre seçmek gerekir.

- Microtask’ı öncelik hack’i olarak kullanma.
- Render fırsatını engelleyen zincirlerden kaçın.
- Gecikmeyi gerçek ölçümle doğrula.

### Zamanlama hatalarını log yerine timeline ile de incele

Basit örneklerde console log yeterlidir; gerçek uygulamada tarayıcı Performance paneli uzun task’ları, network beklemelerini ve render gecikmelerini birlikte görmeyi sağlar.

Bir UI gecikmesinde önce “ağ mı yavaş, JavaScript mi blokluyor, layout mu pahalı?” sorusunu ayırmak, rastgele debounce veya timeout eklemekten daha etkilidir.

- Long task kayıtlarını incele.
- Network ve CPU süresini ayır.
- Rastgele timeout ekleyerek yarışı gizleme.

## Teknik iddialar ve kaynak notları

### Execution model

JavaScript execution model çağrı yığını, job/task kuyrukları ve host ortamının event loop mekanizmasıyla birlikte değerlendirilir. Bir callback’in “asenkron” olması onun paralel JavaScript yürüttüğü anlamına gelmez; ana iş parçacığındaki uzun senkron görevler sonraki callback’lerin ve render fırsatlarının başlamasını geciktirebilir.

**Birincil referans:** [1]

### Microtask sırası

Promise reaksiyonları ve queueMicrotask ile eklenen işler microtask kuyruğunda işlenir. Web event loop’unda microtask kuyruğu belirli görev sınırlarında boşaltıldığı için sürekli microtask üretmek task/render ilerlemesini geciktirebilir. setTimeout gecikmesi de minimum bekleme süresidir; kesin çalıştırma zamanı değildir.

**Birincil referans:** [2], [1]

## Sınır durumları

- Tarayıcı event loop’u ile Node.js event loop ayrıntıları aynı değildir; host ortamı belirtilmelidir.
- Bir Promise zaten resolved olsa bile .then callback’i mevcut senkron yığının içinde doğrudan çalışmaz.
- Çok uzun microtask zinciri kullanıcı girdisi ve render fırsatını geciktirebilir.
- Timer nesting ve arka plan sekmesi politikaları timer gecikmesini artırabilir.

## Uygulama vakası

### Arayüzün Promise zinciri içinde donması

**Bağlam**

Kullanıcı dosya seçtikten sonra parse işlemi Promise.then içinde başlatılır. Kod “Promise içinde olduğu için asenkron” varsayımıyla büyük JSON üzerinde uzun senkron hesaplama yapar. İş microtask callback’inde ana iş parçacığını saniyelerce tuttuğu için tıklamalar ve render gecikir.

**Teknik analiz**

Timeline/Performance kaydında long task görülür. Sorunun network bekleme değil CPU işi olduğu ayrılır. Veri parçalara bölünür, iş uygun durumda Worker’a taşınır veya scheduler/yield stratejisi uygulanır. Promise yalnız zamanlama zinciridir; CPU paralelliği sağlamadığı açıkça kabul edilir.

**Beklenen sonuç**

Ana thread üzerindeki uzun görevler bütçe altına iner ve input latency ölçülür. Event loop modeli, performans testinin parçası hâline gelir.

### İzlenecek sinyaller

- Long task süresi ve sayısı
- INP/input latency
- Microtask zinciri uzunluğu
- Main-thread CPU profili

## Kod ve çalışma akışı

### Çalışma sırasını gözlemle


```javascript
console.log('A');

setTimeout(() => console.log('B - timer'), 0);

Promise.resolve()
  .then(() => console.log('C - promise'))
  .then(() => console.log('D - ikinci microtask'));

console.log('E');

// A
// E
// C - promise
// D - ikinci microtask
// B - timer
```

1. Senkron A ve E aynı task içinde önce çalışır.
2. Promise then callback’i microtask kuyruğuna girer.
3. İkinci then ilk Promise devamından sonra yeni microtask üretir.
4. Timer callback’i sonraki task aşamasında çalışır.

## Tasarım seçenekleri

### requestAnimationFrame

Görsel güncellemeyi tarayıcının boyama döngüsüyle senkronlamak gerektiğinde timer yerine daha anlamlıdır.

### Web Worker

CPU yoğun işi ana JavaScript thread’inden ayırmak gerektiğinde kullanılır.

## Arıza biçimleri

### setTimeout(..., 0) neden geç çalıştı?

- **Olası neden:** 0 ms yalnız minimum bekleme niyetidir; mevcut stack ve kuyruk işleri bitmeden callback çalışamaz.
- **Teşhis / düzeltme:** Timer’ı kesin zamanlayıcı gibi kullanma; iş sırasını event loop modeline göre tasarla.

### Sayfa donuyor

- **Olası neden:** Uzun CPU döngüsü ana thread’i bloklar.
- **Teşhis / düzeltme:** İşi parçala, algoritmayı iyileştir veya CPU yoğun işi Worker’a taşı.

### Promise callback beklemediğim sırada çalışıyor

- **Olası neden:** Microtask ve task ayrımı göz ardı edilmiştir.
- **Teşhis / düzeltme:** En küçük örnekte log sırasını çıkar; her callback’in hangi kuyruğa girdiğini işaretle.

## Üretim ve işletim notları

- Uzun CPU işlerini küçük parçalara böl veya uygun Worker sınırına taşı.
- Zamanlama bağımlı kodu console.log sırasına göre değil açık testlerle doğrula.
- Render sonrası davranış gerekiyorsa ilgili platform zamanlama API’sini bilinçli seç.
- Event handler içinde kontrolsüz async zincirlerin hata sahipliğini açıklaştır.

## Birincil referanslar

1. [MDN — JavaScript execution model](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model)
2. [MDN — Microtask guide](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)

## Doğrulama senaryoları

- queueMicrotask ekleyip Promise ile sırasını karşılaştır.
- 100 ms CPU döngüsü ekleyip timer gecikmesini ölç.
- Ağır hesaplamayı Worker’a taşıyan küçük örnek kur.

## Üretim kontrol listesi

- [ ] Senkron ve asenkron iş ayrılıyor.
- [ ] Timer kesin çalışma zamanı gibi yorumlanmıyor.
- [ ] Uzun CPU işi ana thread’de tutulmuyor.
- [ ] Promise zincirindeki hata yolu izleniyor.

---
Bu dosya https://kutarya.com/konu/javascript/event-loop sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
