---
title: "Python ile Güvenli Dosya İşlemleri"
type: "technical-article"
canonical: "https://kutarya.com/konu/python/dosya-islemleri"
publisher: "Kutarya"
language: "tr-TR"
technology: "Python"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Python ile Güvenli Dosya İşlemleri

Python dosya işlemlerinde pathlib, encoding, atomik yazma, geçici dosya, yedekleme ve büyük dosyaların bellek davranışı.

**Canonical:** https://kutarya.com/konu/python/dosya-islemleri
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** Python
**Referans kapsamı:** Python 3.x pathlib/tempfile ve dosya I/O davranışı.

## Özet

Dosya otomasyonunda asıl risk dosyayı okumak değil; yanlış yolu hedeflemek, kodlamayı bozmak veya yazma yarıda kesildiğinde asıl dosyayı kaybetmektir. Pathlib ve geçici dosyadan atomik değiştirme bu riskleri azaltır.

Dosya işlemlerinde veri kaybı riski yalnız yanlış path kullanımından doğmaz; yarıda kalan yazma, beklenmeyen encoding, izin problemi ve büyük dosyanın bütünüyle belleğe alınması üretim davranışını doğrudan etkiler.

Atomik değiştirme yaklaşımı yeni içeriği önce geçici hedefe güvenle yazıp ardından asıl dosyanın yerine taşımayı hedefler; böylece süreç ortada kesilirse önceki sağlam kopya korunabilir.

## Kapsam maddeleri

- Pathlib ile taşınabilir yol kurmak
- Dosyaları güvenle açıp kapatmak
- Yarım yazılmış dosyayı önlemek
- Kodlama ve izin hatalarını teşhis etmek

## Temel kavramlar

### Path nesnesi

İşletim sistemine göre ayırıcı birleştirir ve yol işlemlerini metin birleştirmeden yapar.

### Bağlam yöneticisi

with bloğu hata çıksa bile dosya tanıtıcısının kapanmasını garanti eder.

### Atomik değiştirme

İçerik önce aynı diskte geçici dosyaya yazılır, sonra tek işlemle hedefin yerine geçirilir.

## Teknik açıklama

### Dosya yolu bir string birleştirme problemi değildir

Pathlib yol parçalarını işletim sistemi kurallarına göre birleştirir ve dosya sistemi işlemlerini nesne tabanlı bir API ile sunar. Elle slash eklemek, çalışma dizinine güvenmek veya mutlak yolu kodun içine gömmek farklı ortamlarda kırılmaya yol açar.

Bir uygulamada “dosya nerede?” sorusunun cevabı açık olmalıdır. Current working directory ile script dosyasının konumu aynı olmak zorunda değildir. Üretim ortamında bu fark özellikle servisler ve zamanlanmış işler için önemlidir.

- Yol işlemlerinde pathlib kullan.
- Çalışma dizinini varsayım olarak gizleme.
- Kullanıcı girdisini doğrudan dosya yoluna ekleme.

### Güvenli yazma yalnız with kullanmak değildir

with dosya tanıtıcısının kapanmasını garanti eder fakat program yazma sırasında çökerse hedef dosya kısmen yazılmış olabilir. Kritik yapılandırma veya veri dosyalarında önce geçici dosyaya eksiksiz yazmak, sonra hedefi replace etmek daha güvenli bir desendir.

Atomiklik dosya sistemi ve platform ayrıntılarına bağlıdır. Bu yüzden gerçekten kritik veride yalnız JSON dosyasına güvenmek yerine transaction desteği olan bir veri deposu düşünmek gerekir.

- with kaynak yaşam süresini yönetir.
- Kritik dosyada geçici yazma + replace düşün.
- Dosya tabanlı çözümün sınırlarını bil.

### Encoding ve büyük dosya davranışı baştan belirlenmeli

Metin dosyasını encoding belirtmeden açmak ortam varsayımlarına bağımlılık yaratabilir. UTF-8’i açık belirtmek taşınabilirliği artırır. Hatalı karakterleri errors="ignore" ile sessizce atmak veri kaybını gizleyebilir.

Büyük dosyada read() ile tüm içeriği belleğe almak yerine satır satır iterasyon veya chunk tabanlı okuma kullan. Bellek davranışını veri boyutundan bağımsız düşünme.

- Encoding’i açıkça yaz.
- Decode hatasını sessizce yutma.
- Büyük dosyayı streaming yaklaşımıyla işle.

## Teknik iddialar ve kaynak notları

### Path ve encoding

pathlib yol işlemlerini nesne tabanlı bir API ile ifade eder ve platforma göre path ayrıntılarını merkezileştirir. Metin dosyalarında encoding varsayımını çalışma ortamına bırakmak taşınabilirliği azaltabilir; uygulama formatı biliniyorsa encoding açık belirtilmelidir.

**Birincil referans:** [1], [3]

### Geçici dosya ve güvenli değiştirme

tempfile standart kütüphanesi güvenli geçici dosya/dizin oluşturma araçları sağlar. Kritik dosyayı doğrudan truncate ederek yeniden yazmak yerine yeni içeriği ayrı hedefe yazıp flush/close sonrası uygun replace işlemiyle geçirmek, yarım yazılmış ana dosya riskini azaltabilir; filesystem garantileri ayrıca değerlendirilmelidir.

**Birincil referans:** [2], [1]

## Sınır durumları

- rename/replace atomikliği dosya sistemi ve aynı filesystem koşullarına bağlı olabilir.
- Text newline/encoding dönüşümleri byte-level protokollerde uygun olmayabilir.
- read_text/read_bytes tüm dosyayı belleğe alır; büyük dosyada stream yaklaşımı gerekir.
- Dosya kilitleme davranışı işletim sistemleri arasında farklıdır.

## Uygulama vakası

### Yapılandırma dosyasının yarım yazılması

**Bağlam**

Uygulama ayarları aynı config.json dosyasını doğrudan `open(..., "w")` ile yeniden yazar. Süreç JSON’un yarısında kapanınca dosya truncate edilmiş ve geçersiz kalır; sonraki açılışta uygulama hiç başlayamaz.

**Teknik analiz**

Yeni içerik aynı filesystem üzerinde güvenli geçici dosyaya yazılır, flush/close tamamlanır ve gerekli dayanıklılık düzeyine göre fsync değerlendirilir. Ardından replace yapılır. Önceki sürüm yedekleme ve parse doğrulamasıyla recovery yolu sağlanır.

**Beklenen sonuç**

Fault injection yazmanın farklı aşamalarında süreci durdurur ve ya eski ya yeni geçerli dosyanın kaldığını doğrular. Dosya boyutu, write error ve recovery sayısı loglanır.

### İzlenecek sinyaller

- Write/replace hata sayısı
- Dosya parse failure
- Geçici dosya temizliği
- Peak memory ve dosya boyutu

## Kod ve çalışma akışı

### JSON dosyasını atomik güncelleme


```python
from __future__ import annotations

import json
from pathlib import Path
from tempfile import NamedTemporaryFile

def json_kaydet(hedef: Path, veri: dict) -> None:
    hedef.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        dir=hedef.parent,
        delete=False,
        suffix=".tmp",
    ) as gecici:
        json.dump(veri, gecici, ensure_ascii=False, indent=2)
        gecici.flush()
        gecici_yol = Path(gecici.name)

    gecici_yol.replace(hedef)
```

1. Üst klasör yoksa oluşturulur.
2. Geçici dosya hedefle aynı klasörde tutulduğu için replace aynı disk üzerinde kalır.
3. UTF-8 açıkça belirtilir ve Türkçe karakterler kaçış dizisine çevrilmez.
4. Yazma başarıyla tamamlandıktan sonra hedef değiştirilir.

## Tasarım seçenekleri

### Satır satır okuma

Büyük metin dosyasını read ile bütünüyle belleğe almak yerine dosya nesnesi üzerinde dolaş.

### shutil.copy2

İçerikle birlikte zaman damgası gibi dosya metadatasını da kopyalamak istediğinde.

## Arıza biçimleri

### FileNotFoundError

- **Olası neden:** Yol yanlış ya da üst klasör mevcut değil.
- **Teşhis / düzeltme:** resolve ile gerçek yolu kaydet, parent klasörünü oluştur ve kullanıcı girdisini doğrula.

### PermissionError

- **Olası neden:** Dosya başka uygulamada kilitli veya süreçte yazma izni yok.
- **Teşhis / düzeltme:** Dosyayı kullanan süreci kontrol et; sistem klasörü yerine kullanıcıya ait veri klasörü seç.

### UnicodeDecodeError

- **Olası neden:** Dosya gerçek kodlamasından farklı kodlamayla okunur.
- **Teşhis / düzeltme:** Kaynağın kodlamasını doğrula; encoding değerini açıkça ver ve hatayı sessizce ignore etme.

## Üretim ve işletim notları

- Dosya formatının encoding ve newline politikasını açık belirle.
- Kritik yazmalarda temp + fsync/replace gereksinimini veri kaybı toleransına göre değerlendir.
- Büyük veri için iterator/stream işleme kullan.
- Path traversal ve kullanıcı kontrollü yol girdisini güvenlik sınırı olarak ele al.

## Birincil referanslar

1. [Python docs — pathlib](https://docs.python.org/3/library/pathlib.html)
2. [Python docs — tempfile](https://docs.python.org/3/library/tempfile.html)
3. [Python docs — Reading and writing files](https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files)

## Doğrulama senaryoları

- CSV dosyasını satır satır filtrele.
- Üzerine yazmadan önce tarihli yedek oluştur.
- Hataları logging modülüyle dosyaya kaydet.

## Üretim kontrol listesi

- [ ] Yollar pathlib ile kuruluyor.
- [ ] Kodlama açıkça belirtiliyor.
- [ ] Yazma yarıda kalırsa asıl dosya korunuyor.
- [ ] Silme ve taşıma öncesi hedef doğrulanıyor.
- [ ] Büyük dosya gereksiz yere belleğe alınmıyor.

---
Bu dosya https://kutarya.com/konu/python/dosya-islemleri sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
