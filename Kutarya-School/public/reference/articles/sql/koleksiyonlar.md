---
title: "SQL ile Tablo İlişkileri ve JOIN"
type: "technical-article"
canonical: "https://kutarya.com/konu/sql/koleksiyonlar"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# SQL ile Tablo İlişkileri ve JOIN

SQL JOIN semantiği, ilişki kardinalitesi, NULL davranışı, toplama öncesi satır çoğalması ve sorgu planına etkiler.

**Canonical:** https://kutarya.com/konu/sql/koleksiyonlar
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** SQL
**Referans kapsamı:** PostgreSQL JOIN ve table expression davranışı.

## Özet

JOIN tabloları yan yana yapıştırmak değildir; iki küme arasındaki eşleşme kuralını tanımlar. Yanlış veya eksik eşleşme koşulu sessizce fazla satır üretebilir ve toplamları bozabilir.

JOIN tabloları mekanik biçimde yan yana eklemek değil, iki veri kümesinin eşleşme kuralını tanımlamaktır. Bir-çok ilişkiler birden fazla kez birleştirildiğinde satır sayısı çarpılarak toplam ve sayım sonuçlarını sessizce bozabilir.

LEFT JOIN üzerinde sağ tablo koşulunun ON yerine WHERE bölümüne taşınması, NULL üretilen satırları eleyerek sorgunun anlamını fiilen INNER JOIN’e yaklaştırabilir.

## Kapsam maddeleri

- İlişki anahtarlarını doğru kurmak
- JOIN türünü sonuca göre seçmek
- Çoğalan satırları teşhis etmek
- Sorgu planını temel düzeyde okumak

## Temel kavramlar

### INNER JOIN

Yalnız iki tarafta da eşleşen kayıtları döndürür.

### LEFT JOIN

Sol tablodaki her kaydı korur; eşleşmeyen sağ alanlar NULL olur.

### Kardinalite

Bir-bir, bir-çok ve çok-çok ilişkiler sonuç satırı sayısını doğrudan etkiler.

## Teknik açıklama

### JOIN önce kardinalite problemidir

Bir JOIN yazmadan önce her iki tablonun ilişki yönünü söyleyebilmelisin: bir müşteri kaç siparişe, bir sipariş kaç müşteriye ait olabilir? Bu kardinalite, sonuç satırı sayısını tahmin etmeni sağlar. Sorgu beklenenden fazla satır döndürüyorsa ilk bakılacak yerlerden biri ilişki varsayımıdır.

Özellikle iki farklı one-to-many tabloyu aynı ana tabloya aynı anda bağlamak satır çarpanına yol açabilir. Toplamlar yanlış görünüyorsa agregasyondan önce ham join sonucunu incele.

- JOIN’den önce ilişki yönünü yaz.
- Ham satır sayısını tahmin et.
- Agregasyondan önce satır çoğalmasını kontrol et.

### LEFT JOIN ve WHERE sırası sonucu değiştirir

LEFT JOIN sol tablodaki satırları korumak için kullanılır. Fakat sağ tabloya ait bir koşulu WHERE bölümünde zorunlu tuttuğunda eşleşmeyen NULL satırlar elenir ve sorgu pratikte INNER JOIN gibi davranabilir.

Bir koşul eşleşmenin parçasıysa ON içinde, tüm nihai sonuç kümesini filtreliyorsa WHERE içinde düşünmek iyi başlangıç kuralıdır. Yine de sorgunun niyetini örnek veriyle doğrulamak gerekir.

- Sağ tablo filtresinin ON/WHERE etkisini test et.
- NULL satırların korunup korunmadığını kontrol et.
- JOIN türünü isimden değil istenen sonuçtan seç.

### Performans indeks kadar veri şekliyle ilgilidir

JOIN anahtarında indeks çoğu durumda önemlidir fakat her yavaş sorgunun çözümü yeni indeks değildir. Düşük seçicilik, yanlış join sırası, gereksiz SELECT *, fonksiyon uygulanmış kolon veya büyük ara sonuçlar planı etkileyebilir.

EXPLAIN çıktısını okurken önce gerçek veya tahmini satır sayılarına bak. Optimizer’ın beklediği satır sayısı gerçekle çok farklıysa istatistikler veya veri dağılımı plan kararını bozuyor olabilir.

- Önce sorgu planını gözle.
- JOIN anahtarlarını ve filtreleri incele.
- Her kolona indeks eklemeyi çözüm sanma.

## Teknik iddialar ve kaynak notları

### JOIN sonucu bir satır kümesidir

JOIN iki table expression arasında belirtilen eşleşme koşuluna göre yeni bir satır kümesi üretir. İlişki bir-çok olduğunda tek sol satır birden fazla sağ satırla eşleşebilir; birden fazla böyle JOIN zincirlendiğinde satır çoğalması aggregate sonuçlarını değiştirebilir.

**Birincil referans:** [1], [2]

### Outer join ve filtre konumu

LEFT OUTER JOIN eşleşmeyen sol satırları sağ tarafta NULL değerlerle korur. Sağ tablonun koşulu daha sonra WHERE bölümünde zorunlu hâle getirilirse bu NULL satırlar elenebilir. Aynı koşulun ON veya WHERE’de bulunması bu nedenle her zaman eşdeğer değildir.

**Birincil referans:** [2]

## Sınır durumları

- NULL = NULL true değildir; join koşulunda üç değerli mantık sonucu dikkate alınmalıdır.
- Birden fazla child tabloyu aynı parent’a join edip SUM almak çarpan etkisi yaratabilir.
- USING/NATURAL JOIN şema değişikliğinde istemeden farklı kolonları eşleştirebilir; explicit ON daha kontrollüdür.
- JOIN sırası yazımda farklı olsa da optimizer fiziksel planı yeniden düzenleyebilir; semantik ve fiziksel plan ayrıdır.

## Uygulama vakası

### İki one-to-many JOIN sonrası şişen toplam

**Bağlam**

Sipariş tablosu hem items hem payments tablolarına ayrı one-to-many ilişkiyle join edilir ve `SUM(items.amount)` hesaplanır. İki item ve üç payment olan sipariş altı satıra dönüşür; item toplamı üç kez sayılır. Sorgu syntax olarak doğrudur fakat kardinalite iş sonucunu bozar.

**Teknik analiz**

Her child kümesi sipariş başına önce aggregate edilir veya LATERAL/subquery gibi yapılarla istenen grain’e indirilir, sonra parent’a join edilir. Sorgu tasarımında her ara relation için “bir satır neyi temsil ediyor?” sorusu açıkça yazılır.

**Beklenen sonuç**

Fixture testleri 0, 1 ve birden fazla child kombinasyonunu kapsar. Query planı ve satır sayıları izlenerek beklenmeyen çoğalma production öncesi yakalanır.

### İzlenecek sinyaller

- JOIN öncesi/sonrası row count
- Primary key başına duplicate sayısı
- Aggregate beklenen/gerçek karşılaştırması
- EXPLAIN plan cardinality estimate

## Kod ve çalışma akışı

### Siparişi olmayan müşterileri de içeren özet


```sql
SELECT
    m.id,
    m.ad,
    COUNT(s.id) AS siparis_sayisi,
    COALESCE(SUM(s.toplam), 0) AS toplam_harcama
FROM musteriler AS m
LEFT JOIN siparisler AS s
    ON s.musteri_id = m.id
   AND s.durum = 'tamamlandi'
GROUP BY m.id, m.ad
ORDER BY toplam_harcama DESC;
```

1. Müşteri sol tarafta olduğu için siparişi olmayan müşteri kaybolmaz.
2. Durum koşulu WHERE yerine ON içinde tutulur; aksi hâlde NULL satırlar elenir ve LEFT JOIN fiilen INNER JOIN olur.
3. COUNT(s.id), eşleşmeyen satırdaki NULL değeri saymaz.
4. COALESCE, boş toplamı kullanıcıya 0 olarak verir.

## Tasarım seçenekleri

### EXISTS

Sağ tablodan alan göstermeden yalnız eşleşme var mı diye bakarken çoğu zaman daha açık ve güvenlidir.

### Alt sorgu

Önce ayrı bir toplulaştırma yapıp sonra tek satırlık sonuçları birleştirmek satır çoğalmasını önleyebilir.

## Arıza biçimleri

### ambiguous column name

- **Olası neden:** Aynı adlı sütun birden fazla tabloda bulunur.
- **Teşhis / düzeltme:** Her ortak sütunu tablo takma adıyla nitele.

### Toplamlar beklenenden yüksek

- **Olası neden:** Birden fazla bir-çok tablo aynı anda bağlanarak satırları çarpar.
- **Teşhis / düzeltme:** Her alt tabloyu önce kendi içinde grupla veya bağımsız alt sorgular kullan.

### LEFT JOIN kayıt kaybediyor

- **Olası neden:** Sağ tablo koşulu WHERE bölümüne yazılır.
- **Teşhis / düzeltme:** Sağ tabloyu filtreleyen ve eşleşmenin parçası olan koşulu ON bölümüne taşı.

## Üretim ve işletim notları

- Her JOIN için beklenen kardinaliteyi yaz: 1-1, 1-N, N-N.
- Aggregate öncesinde satır sayısını ve duplicate anahtarları kontrol et.
- Outer join filtrelerini ON/WHERE semantiği açısından test et.
- Gerçek sorgu planını indeks ve veri dağılımıyla birlikte incele.

## Birincil referanslar

1. [PostgreSQL docs — Joins between tables](https://www.postgresql.org/docs/current/tutorial-join.html)
2. [PostgreSQL docs — Table expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html)

## Doğrulama senaryoları

- Hiç siparişi olmayan müşterileri EXISTS/NOT EXISTS ile bul.
- Ürün ve kategori arasında çoktan çoğa ilişki kur.
- EXPLAIN çıktısından tam tablo taramasını belirle.

## Üretim kontrol listesi

- [ ] Her JOIN için ilişki yönü biliniyor.
- [ ] Anahtar sütunlarda uygun indeks var.
- [ ] NULL davranışı düşünülmüş.
- [ ] Toplamadan önce satır çoğalması kontrol edilmiş.
- [ ] SELECT * yerine gereken sütunlar seçilmiş.

---
Bu dosya https://kutarya.com/konu/sql/koleksiyonlar sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
