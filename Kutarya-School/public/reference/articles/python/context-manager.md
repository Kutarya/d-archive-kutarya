---
title: "Python Context Manager ve Kaynak Yönetimi"
type: "technical-article"
canonical: "https://kutarya.com/konu/python/context-manager"
publisher: "Kutarya"
language: "tr-TR"
technology: "Python"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Python Context Manager ve Kaynak Yönetimi

Python context manager protokolü, with ifadesi, __enter__/__exit__, contextlib ve hata durumunda deterministik kaynak temizliği.

**Canonical:** https://kutarya.com/konu/python/context-manager
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** Python
**Referans kapsamı:** Python 3.x with statement ve contextlib davranışı.

## Özet

Context manager, bir işlemin giriş ve çıkış davranışını tek sözleşmede toplar. Hata çıksa bile çıkış adımının çalışabilmesi, dosya, kilit, transaction ve geçici durum yönetiminde güçlü bir yapı sağlar.

Context manager yalnız dosya kapatmak için değil, edinme-serbest bırakma yaşam döngüsü olan her kaynakta deterministik temizlik sağlamak için kullanılır. Kilitler, bağlantılar, geçici dosyalar ve transaction sınırları bu modele girer.

Makale exception oluştuğunda __exit__ çağrısının rolünü ve hatayı bastırmanın semantik sonucunu ayrıca değerlendirir; kaynak temizliği ile hata yutma aynı şey değildir.

## Kapsam maddeleri

- with yaşam döngüsünü anlamak
- __enter__/__exit__ rolünü ayırmak
- contextlib kullanmak
- Kaynak sızıntılarını azaltmak

## Temel kavramlar

### __enter__

with bloğuna girerken çalışır ve as ile bağlanacak değeri döndürebilir.

### __exit__

Blok normal ya da exception ile bittiğinde çıkış davranışını yürütür.

### contextmanager

Basit context manager’ları sınıf yazmadan generator sözdizimiyle oluşturmayı sağlar.

## Teknik açıklama

### with aslında yapılandırılmış try/finally’dir

Context manager sihirli bir dosya özelliği değildir. Amaç kaynak edinme ve bırakma davranışını tekrar kullanılabilir bir protokole bağlamaktır. Bu, manuel close çağrısının unutulmasını ve farklı return/exception yollarında temizliğin atlanmasını azaltır.

Kaynak yönetimi görünür olduğunda kodun hangi bloğun sonunda neyi bıraktığını okumak kolaylaşır.

- Kaynak edinme ve bırakmayı eşleştir.
- Temizliği çağıranın hafızasına bırakma.
- Yaşam süresini kod bloğuyla görünür yap.

### Exception bastırma güçlü ama risklidir

__exit__ true döndürürse exception’ın dışarı yayılması engellenebilir. Bu davranış bazı özel context manager’larda yararlı olsa da genel temizleme için çoğu zaman hata dışarı gitmelidir.

Sessizce exception yutmak sistemin yanlış durumda devam etmesine yol açabilir. Temizleme ile hata işleme sorumluluğunu birbirinden ayır.

- Cleanup hata bastırmak değildir.
- Beklenen exception türlerini açık işle.
- Genel Exception’ı sessizce yok etme.

### Context manager transaction sınırı için de uygundur

Veritabanı transaction’ında blok başarılıysa commit, exception varsa rollback davranışı context manager modeline doğal oturur. Böylece transaction’ın kapanışı iş akışına dağılmaz.

Ancak hangi exception’ın retry edileceği ve transaction kapsamının ne kadar geniş olacağı ayrı tasarım kararıdır.

- Transaction sınırını küçük tut.
- Commit/rollback yaşam döngüsünü görünür yap.
- Uzun external I/O’yu transaction içinde tutmamaya çalış.

## Teknik iddialar ve kaynak notları

### with protokolü

with ifadesi context manager tarafından sağlanan giriş ve çıkış protokolünü yapısal olarak kullanır. Blok exception ile sonlansa bile çıkış mantığının çalışması, dosya, kilit ve bağlantı gibi kaynakların deterministik olarak serbest bırakılmasına yardımcı olur.

**Birincil referans:** [2]

### contextlib ile uyarlama

contextlib sınıf yazmadan context manager üretme ve mevcut kaynakları ExitStack gibi yapılarla dinamik olarak yönetme araçları sağlar. __exit__ veya contextmanager generator’ının exception’ı bastırması mümkündür; bu karar yalnız temizlik değil hata semantiğidir ve bilinçli olmalıdır.

**Birincil referans:** [1]

## Sınır durumları

- __exit__ truthy değer döndürürse exception bastırılabilir; yanlışlıkla hata kaybına yol açılabilir.
- Async kaynaklar için async with ve async context manager protokolü gerekir.
- Birden fazla kaynağın koşullu edinildiği durumda nested with yerine ExitStack uygun olabilir.
- Context manager kaynağın scope’unu yönetir; nesnenin thread-safe olmasını sağlamaz.

## Uygulama vakası

### Exception sonrası açık kalan kilit

**Bağlam**

Bir worker manuel lock.acquire() çağırır, işlem ortasında exception oluşur ve release satırına ulaşılamaz. Sonraki işler aynı kilitte bekler; hata ilk request’te görünürken sistem etkisi birkaç dakika sonra “worker takıldı” şeklinde ortaya çıkar.

**Teknik analiz**

Lock kullanımı with sınırına taşınır; çıkış protokolü exception yolunda da release işlemini garanti eder. Eğer birden fazla koşullu kaynak ediniliyorsa ExitStack ile edinilen kaynaklar aynı stack üzerinde kaydedilir.

**Beklenen sonuç**

Fault injection testi kritik blok içinde exception üretir ve kilidin yeniden alınabildiğini doğrular. Kaynak edinme süreleri ve açık bağlantı/kilit sayısı izlenir.

### İzlenecek sinyaller

- Açık resource/kilit sayısı
- Acquire bekleme süresi
- Exception sonrası cleanup başarısı
- Context scope süresi

## Kod ve çalışma akışı

### Geçici çalışma dizini context manager’ı


```python
from contextlib import contextmanager
from pathlib import Path
from tempfile import TemporaryDirectory

@contextmanager
def gecici_calisma_alani():
    with TemporaryDirectory() as klasor:
        path = Path(klasor)
        yield path
        # çıkışta TemporaryDirectory temizlenir

with gecici_calisma_alani() as alan:
    (alan / "sonuc.txt").write_text("tamam", encoding="utf-8")
```

1. Decorator generator’ı context manager’a çevirir.
2. yield öncesi giriş, sonrası çıkış davranışıdır.
3. İç TemporaryDirectory kaynak temizliğini üstlenir.
4. Hata olsa bile with çıkışı çalışır.

## Tasarım seçenekleri

### try/finally

Context manager altyapısının temelindeki açık kontrol akışıdır ve tek kullanımlık basit durumda yeterli olabilir.

### ExitStack

Çalışma zamanında sayısı değişen birden fazla context manager’ı yönetmek için uygundur.

## Arıza biçimleri

### Kaynak kapanmadan kaldı

- **Olası neden:** Açma ve kapama farklı kod yollarına dağılmıştır.
- **Teşhis / düzeltme:** Kaynak yaşam döngüsünü with/try-finally sınırında tut.

### Exception kayboldu

- **Olası neden:** __exit__ yanlışlıkla true döndürerek hatayı bastırmıştır.
- **Teşhis / düzeltme:** Hata bastırma davranışını yalnız bilinçli olarak uygula.

## Üretim ve işletim notları

- Kaynak edinme ve bırakma işlemini aynı soyutlamada eşleştir.
- Hata bastırılacaksa hangi exception sınıflarında ve neden olduğunu açıkça belirt.
- DB transaction context’inde rollback/commit semantiğini test et.
- Async istemci/stream kaynaklarında senkron context manager kullanma.

## Birincil referanslar

1. [Python docs — contextlib](https://docs.python.org/3/library/contextlib.html)
2. [Python docs — with statement](https://docs.python.org/3/reference/compound_stmts.html#the-with-statement)

## Doğrulama senaryoları

- Süre ölçen context manager yaz.
- Bir lock kullanımını with ile sar.
- ExitStack ile dinamik sayıda dosya açıp kapat.

## Üretim kontrol listesi

- [ ] Açılan kaynağın sahibi belli.
- [ ] Çıkış yolu exception durumunda da çalışıyor.
- [ ] Exception yanlışlıkla bastırılmıyor.
- [ ] Nested kaynaklar ters sırada kapanıyor.

---
Bu dosya https://kutarya.com/konu/python/context-manager sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
