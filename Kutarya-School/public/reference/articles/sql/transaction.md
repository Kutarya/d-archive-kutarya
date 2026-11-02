---
title: "SQL Transaction ve İzolasyon Seviyeleri"
type: "technical-article"
canonical: "https://kutarya.com/konu/sql/transaction"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# SQL Transaction ve İzolasyon Seviyeleri

SQL transaction sınırları, izolasyon seviyeleri, eşzamanlılık anomalileri, deadlock/serialization hataları ve güvenli retry tasarımı.

**Canonical:** https://kutarya.com/konu/sql/transaction
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** SQL
**Referans kapsamı:** PostgreSQL transaction ve isolation davranışı.

## Özet

Transaction bir grup değişikliğin tutarlı bir iş birimi olarak ele alınmasını sağlar. Ancak aynı anda çalışan transaction’lar birbirini etkiler; izolasyon seviyesi hangi ara durumların görülebileceğini belirleyen önemli bir veritabanı kararıdır.

Transaction atomikliği yalnız BEGIN ve COMMIT kullanmak değildir; iş kuralının hangi okumalar ve yazmalar arasında tutarlı kalması gerektiğini tanımlar. Kapsam gereğinden fazla büyüdüğünde lock süresi ve çatışma olasılığı artabilir.

Serialization failure veya deadlock sonrası retry çoğu durumda tek SQL satırını değil bütün transaction kararını yeniden çalıştırmalıdır; çünkü daha önce okunan verinin geçerliliği kaybolmuş olabilir.

## Kapsam maddeleri

- Transaction atomikliğini anlamak
- Isolation problemlerini ayırmak
- Transaction kapsamını küçük tutmak
- Deadlock ve serialization retry yaklaşımını planlamak

## Temel kavramlar

### Atomicity

İş birimi tamamen uygulanır veya geri alınır; yarım business update bırakılmaması hedeflenir.

### Isolation

Eşzamanlı transaction’ların birbirinin ara sonuçlarını ne ölçüde görebildiğini belirler.

### Deadlock

İki transaction birbirinin tuttuğu kaynağı beklediğinde veritabanı birini iptal ederek döngüyü kırabilir.

## Teknik açıklama

### Transaction sınırı business invariant etrafında olmalı

Birden fazla tablo değişikliği tek iş kuralını birlikte koruyorsa transaction sınırı bunları kapsamalıdır. Ancak unrelated işi aynı transaction’a eklemek lock süresini ve çakışma olasılığını artırır.

Ödeme servisine HTTP çağrısı gibi dış I/O’yu açık transaction içinde bekletmek özellikle risklidir; ağ gecikmesi boyunca DB lock’ları tutulabilir.

- İş kuralını birlikte commit et.
- Transaction’ı kısa tut.
- External I/O’yu transaction sınırından ayır.

### Isolation seviyesi tek başına “yüksek daha iyi” değildir

Daha güçlü izolasyon anomalileri azaltabilir fakat daha fazla conflict, abort veya lock maliyeti getirebilir. Doğru seviye veri tabanına ve iş kuralına göre seçilir.

Önemli olan uygulamanın hangi eşzamanlılık anomalilerini tolere edemediğini bilmesidir.

- İzolasyonu iş kuralına bağla.
- Conflict maliyetini ölç.
- Varsayılan seviyenin semantiğini resmî dokümantasyonla doğrula.

### Retry transaction’ın başından yapılmalıdır

Serialization failure veya deadlock sonrası yalnız son SQL satırını tekrar etmek çoğu zaman doğru değildir; transaction boyunca okunan kararlar artık geçersiz olabilir.

Retry mantığı tüm iş birimini yeniden kurmalı ve sonsuz döngüye dönüşmemesi için deneme sayısı/backoff sınırı olmalıdır.

- Retry tüm transaction’ı tekrarlar.
- Deneme sayısını sınırla.
- İdempotent dış etkileri ayrıca tasarla.

## Teknik iddialar ve kaynak notları

### Transaction ve isolation

Transaction birden fazla SQL işlemini tek bir atomik iş birimi olarak ele alır. Isolation seviyesi eşzamanlı transaction’ların birbirlerinin değişikliklerini hangi biçimde gözleyebileceğini belirler; daha güçlü isolation bazı anomalileri azaltırken retry/abort veya lock maliyetini artırabilir.

**Birincil referans:** [2], [1]

### Serialization/deadlock sonrası tekrar

PostgreSQL dokümantasyonu belirli isolation seviyelerinde serialization failure oluşabileceğini ve transaction’ın yeniden denenmesi gerekebileceğini açıklar. Retry yalnız son statement’a uygulanırsa transaction içinde daha önce alınmış kararlar eski snapshot’a dayanabilir; bütün iş biriminin tekrar değerlendirilmesi gerekir.

**Birincil referans:** [1]

## Sınır durumları

- Uzun transaction lock ve MVCC cleanup maliyetlerini büyütebilir.
- Dış servise gönderilen e-posta/ödeme gibi yan etki DB rollback ile otomatik geri alınmaz.
- Deadlock farklı lock sıralarından doğabilir; timeout artırmak kök nedeni çözmez.
- Retry edilecek işlem idempotent değilse aynı dış yan etki iki kez gerçekleşebilir.

## Uygulama vakası

### Serialization retry’nin yalnız son statement’a uygulanması

**Bağlam**

Stok rezervasyonu transaction içinde önce stok sayısını okur, sonra sipariş kararını verir ve update yapar. Serialization failure yalnız UPDATE satırında retry edilir. Fakat retry sırasında kullanılan karar eski snapshot’ta okunmuş stok miktarına dayanır; statement başarıyla geçse bile iş kuralı artık güvenilir değildir.

**Teknik analiz**

Retry sınırı tüm transaction fonksiyonunu kapsayacak şekilde yeniden kurulur. Her denemede gerekli okumalar tekrar yapılır. Dış ödeme/e-posta gibi yan etkiler transaction’dan ayrılır veya idempotency/outbox stratejisiyle kontrol edilir.

**Beklenen sonuç**

Concurrency testi paralel rezervasyon yükü üretir ve invariantın tüm retry yollarında korunduğunu doğrular. Serialization/deadlock retry sayıları telemetride ayrı izlenir.

### İzlenecek sinyaller

- Serialization/deadlock hata oranı
- Transaction duration
- Retry deneme sayısı
- Lock wait ve blocked transaction süresi

## Kod ve çalışma akışı

### Stok azaltma transaction’ı


```sql
BEGIN;

UPDATE products
SET stock = stock - 1
WHERE id = 10
  AND stock > 0;

-- Etkilenen satır sayısı 1 değilse siparişi oluşturma.
INSERT INTO orders(product_id, quantity)
VALUES (10, 1);

COMMIT;
```

1. Stok kontrolü ve azaltma tek atomik UPDATE içinde yapılır.
2. Yeterli stok yoksa etkilenen satır sayısı üzerinden akış durdurulur.
3. Sipariş ve stok değişimi aynı transaction sınırındadır.
4. Hata durumunda ROLLBACK ile iki değişiklik de geri alınır.

## Tasarım seçenekleri

### Optimistic concurrency

Uzun kilit tutmak yerine version/timestamp kontrolüyle çakışmayı commit sırasında yakalamak için kullanılabilir.

### Queue/serial processing

Çok sıcak tek kaynakta eşzamanlı yazımı uygulama seviyesinde sıraya almak bazı sistemlerde daha basit olabilir.

## Arıza biçimleri

### deadlock detected

- **Olası neden:** Transaction’lar kaynakları farklı sırada kilitlemiştir.
- **Teşhis / düzeltme:** Kilit sırasını tutarlı yap, transaction’ı kısalt ve güvenli işlemlerde sınırlı retry uygula.

### serialization failure

- **Olası neden:** Yüksek izolasyon seviyesi eşzamanlı sonucu güvenli bulmamıştır.
- **Teşhis / düzeltme:** İşlemi baştan tekrar çalıştırabilecek retry sınırı tasarla.

## Üretim ve işletim notları

- Transaction sınırını tek iş kuralı kadar dar tut.
- Harici yan etkiler için outbox/idempotency gibi desenleri değerlendir.
- Retry politikasına jitter/sınır koy ve bütün transaction closure’ını yeniden çalıştır.
- Lock sırasını tutarlı tut; deadlock log ve sorgu planlarını gözlemle.

## Birincil referanslar

1. [PostgreSQL docs — Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
2. [PostgreSQL docs — Transactions tutorial](https://www.postgresql.org/docs/current/tutorial-transactions.html)

## Doğrulama senaryoları

- İki terminalde aynı satırı güncelleyerek lock davranışını gözle.
- Transaction içine yapay bekleme koyup kilit süresini incele.
- Deadlock sonrası sınırlı retry pseudocode’u yaz.

## Üretim kontrol listesi

- [ ] Transaction yalnız gerekli DB işlerini içeriyor.
- [ ] External HTTP çağrısı transaction içinde bekletilmiyor.
- [ ] Lock sırası tutarlı.
- [ ] Retry edilebilir hata türleri belirli.
- [ ] İzolasyon seviyesi varsayılan diye kör kabul edilmemiş.

---
Bu dosya https://kutarya.com/konu/sql/transaction sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
