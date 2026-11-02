---
title: "SQL İndeks Tasarımı ve Sorgu Performansı"
type: "technical-article"
canonical: "https://kutarya.com/konu/sql/index"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# SQL İndeks Tasarımı ve Sorgu Performansı

SQL indekslerinin okuma/yazma maliyeti, B-tree erişim modeli, composite index kolon sırası, seçicilik ve sorgu planı analizi.

**Canonical:** https://kutarya.com/konu/sql/index
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** SQL
**Referans kapsamı:** PostgreSQL current dokümantasyonu; B-tree ve EXPLAIN örnekleri.

## Özet

İndeks tablo verisinin yanında tutulan ek bir erişim yapısıdır. Okumayı hızlandırabilir fakat disk alanı kullanır ve INSERT/UPDATE/DELETE işlemlerinde bakım maliyeti doğurur. “Yavaş sorgu = indeks ekle” yaklaşımı bu yüzden eksiktir.

İndeks tabloyu “hızlı hâle getiren” ücretsiz bir ayar değil, ayrı depolama ve bakım maliyeti olan erişim yapısıdır. Doğru karar sorgu desenine, veri dağılımına ve yazma yüküne birlikte bakılarak verilir.

Composite index kolon sırası özellikle eşitlik, range ve sıralama koşullarının nasıl bir araya geldiğine bağlıdır. EXPLAIN/EXPLAIN ANALYZE, optimizer tahminlerini gerçek satır sayılarıyla karşılaştırmak için temel gözlem aracıdır.

## Kapsam maddeleri

- B-tree indeks mantığını anlamak
- Composite index sırasını sorguya göre seçmek
- Write maliyetini hesaba katmak
- EXPLAIN ile indeks kullanımını doğrulamak

## Temel kavramlar

### Selectivity

Koşulun tabloyu ne kadar daralttığını anlatır; çok düşük seçicilikte indeks faydası sınırlı olabilir.

### Composite index

Birden fazla kolonu belirli sırayla içerir; kolon sırası sorgu desenini etkiler.

### Query plan

Optimizer’ın veriye hangi yollarla erişmeyi seçtiğini gösterir.

## Teknik açıklama

### İndeks tabloyu küçültmez, ikinci bir yapı ekler

İndeksin hız kazancı ek depolama ve bakım maliyeti karşılığında gelir. Her insert yeni indeks kaydı, her ilgili update olası indeks değişikliği demektir.

Bu yüzden bir veritabanında indeks sayısının çok olması tek başına iyi performans göstergesi değildir. Okuma ve yazma iş yükü dengesi önemlidir.

- İndeksi bedava optimizasyon sanma.
- Disk ve write maliyetini ölç.
- Kullanılmayan indeksleri temizle.

### Composite index kolon sırası sorgu desenidir

(customer_id, created_at) indeksi ile (created_at, customer_id) aynı şey değildir. B-tree’nin sıralı yapısı hangi prefix’in verimli kullanılabildiğini etkiler.

Kolon sırasını “en çok kullanılan kolon” gibi tek kuralla değil, eşitlik/range/order desenleri ve gerçek sorgularla seç.

- Sorgu pattern’ını önce yaz.
- Equality ve range ilişkisini düşün.
- EXPLAIN ile varsayımı doğrula.

### Plan tahmini ile gerçek satırı karşılaştır

EXPLAIN ANALYZE tahmini satır sayısı ile gerçek satır sayısını birlikte görmeyi sağlar. Büyük farklar optimizer’ın veri dağılımını yanlış tahmin ettiğini gösterebilir.

Bu durumda indeks eklemeden önce istatistikler, veri skew’u ve sorgu ifadesi incelenmelidir.

- Estimated vs actual rows karşılaştır.
- İstatistiklerin güncelliğini kontrol et.
- Tek bir execution süresine bakarak karar verme.

## Teknik iddialar ve kaynak notları

### İndeks erişim yapısı

PostgreSQL indeksleri belirli sorguların tabloyu baştan sona taramadan satırlara erişmesine yardımcı olabilir; karşılığında disk alanı ve INSERT/UPDATE/DELETE sırasında bakım maliyeti getirir. B-tree varsayılan ve çok yaygın indeks türüdür ancak her operatör veya veri dağılımı aynı indeksten yararlanmaz.

**Birincil referans:** [1]

### EXPLAIN ile plan doğrulama

Planner maliyet tahminlerine göre sequential scan, index scan veya başka plan seçebilir. EXPLAIN planı gösterir; EXPLAIN ANALYZE sorguyu gerçekten çalıştırıp tahminlerle gerçek satır/zaman değerlerini karşılaştırmaya imkân verir. Üretim verisine benzemeyen küçük test tablosunda görülen plan genellenmemelidir.

**Birincil referans:** [2]

## Sınır durumları

- Composite B-tree indeksin sol tarafındaki kolonlar ve koşul biçimi kullanılabilirliği etkiler; “indekste kolon var” tek başına yeterli değildir.
- Düşük seçicilikte sequential scan daha ucuz olabilir.
- Fonksiyon uygulanmış kolon veya farklı collation/operator class indeks kullanımını etkileyebilir.
- Çok sayıda indeks yazma maliyeti ve vacuum/maintenance yükünü artırabilir.

## Uygulama vakası

### İndeks eklendiği hâlde sorgunun yavaş kalması

**Bağlam**

Milyon satırlık events tablosuna status kolonu için indeks eklenir. Değerlerin %80’i “completed” olduğu için `WHERE status = completed` sorgusu çok büyük satır oranı döndürür; planner sequential scan seçmeye devam eder. Ekip “indeks kullanılmıyor” diye zorla index hint arar.

**Teknik analiz**

EXPLAIN ANALYZE ile tahmin/gerçek satır sayıları ve buffer davranışı incelenir. Düşük seçicilikte index scan’in rastgele erişim maliyetinin avantaj sağlamadığı görülür. Asıl kritik sorgu status + created_at aralığı olduğundan composite/partial index seçenekleri gerçek workload üzerinde test edilir.

**Beklenen sonuç**

İndeks kararı tek kolon varlığına değil sorgu deseni ve veri dağılımına bağlanır. Query latency yanında write overhead ve indeks boyutu da izlenir.

### İzlenecek sinyaller

- EXPLAIN ANALYZE actual vs estimated rows
- Shared buffer hit/read
- Index size ve write amplification
- p95/p99 sorgu süresi

## Kod ve çalışma akışı

### Sorgu desenine göre bileşik indeks


```sql
-- Sık sorgu:
SELECT id, created_at, total
FROM orders
WHERE customer_id = 42
  AND created_at >= DATE '2026-01-01'
ORDER BY created_at DESC
LIMIT 50;

-- PostgreSQL örneği:
CREATE INDEX idx_orders_customer_created
ON orders (customer_id, created_at DESC);
```

1. Eşitlik filtresi customer_id önde tutulur.
2. İkinci kolon tarih aralığı ve sıralamayla uyumludur.
3. İndeks yalnız gerçek sorgu deseni için eklenir.
4. EXPLAIN ANALYZE ile plan ve gerçek satır sayısı doğrulanmalıdır.

## Tasarım seçenekleri

### Partial index

Yalnız belirli koşulu sağlayan küçük bir kayıt alt kümesi sık sorgulanıyorsa yararlı olabilir.

### Materialized view/cache

Ağır agregasyon sürekli tekrar ediyorsa yalnız indeks yerine ön hesaplama gerekebilir.

## Arıza biçimleri

### İndeks var ama kullanılmıyor

- **Olası neden:** Planner sequential scan’i daha ucuz hesaplıyor, veri az veya koşul düşük seçicilikte olabilir.
- **Teşhis / düzeltme:** Planı ve istatistikleri incele; zorla indeks kullandırmaya çalışmadan maliyeti anla.

### Yazma performansı düştü

- **Olası neden:** Çok sayıda indeks her değişiklikte güncelleniyor.
- **Teşhis / düzeltme:** Kullanılmayan ve tekrar eden indeksleri ölçerek kaldır.

## Üretim ve işletim notları

- İndeksi gerçek sorgu ve gerçekçi veri dağılımı üzerinden seç.
- EXPLAIN ANALYZE kullanırken yazan sorguların gerçekten yürütüleceğini unutma.
- Kullanılmayan/örtüşen indeksleri ölçümle takip et.
- Sorgu performansını yalnız latency değil buffer/I/O ve satır tahmini sapmasıyla incele.

## Birincil referanslar

1. [PostgreSQL docs — Indexes](https://www.postgresql.org/docs/current/indexes.html)
2. [PostgreSQL docs — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

## Doğrulama senaryoları

- Bir sorguya EXPLAIN ANALYZE çalıştırıp planı kaydet.
- Composite index kolon sırasını ters çevirip farkı ölç.
- Kullanılmayan indeksleri istatistiklerden incele.

## Üretim kontrol listesi

- [ ] İndeks gerçek sorgu deseniyle bağlantılı.
- [ ] Write maliyeti kabul edilebilir.
- [ ] Plan ölçülmüş.
- [ ] Kolon sırası bilinçli.
- [ ] Benzer/tekrarlı indeksler kontrol edilmiş.

---
Bu dosya https://kutarya.com/konu/sql/index sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
