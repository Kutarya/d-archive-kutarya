---
title: "Veri sızıntısı ölçümü yanıltıyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ai-data-leakage"
publisher: "Kutarya"
language: "tr-TR"
technology: "Makine Öğrenmesi"
---

# Veri sızıntısı ölçümü yanıltıyor

**Hata mesajı:** `validation score is suspiciously high`
**Teknoloji:** Makine Öğrenmesi
**Sınıf:** Değerlendirme

Model eğitim sırasında hedefe veya geleceğe ait bilgiyi dolaylı olarak görür ve gerçek kullanımda tekrarlanamayacak sonuç üretir.

## Olası nedenler

- Ölçekleme tüm veri üzerinde fit ediliyor
- Aynı kullanıcı veya kayıt iki bölüme dağılıyor
- Gelecek zaman bilgisi feature olarak kullanılıyor
- Hedefe göre üretilmiş sütun girdide kalıyor

## Teşhis sırası

1. Bölme işlemini tüm dönüşümlerden önce yeniden çalıştırın.
2. Yinelenen varlıkları ve zaman aralıklarını bölümler arasında karşılaştırın.
3. Her feature için tahmin anında gerçekten mevcut olup olmadığını sorun.

## Düzeltme yaklaşımları

- Dönüşümleri yalnız training bölümünde fit eden pipeline kurun.
- Kullanıcı, cihaz veya zaman tabanlı grup bölmesi uygulayın.
- Feature sözleşmesine kullanılabilirlik zamanı ekleyin.

## Hatalı örnek

```makine öğrenmesi

```

## Düzeltilmiş örnek

```makine öğrenmesi

```

---
Canonical: https://kutarya.com/hatalar/ai-data-leakage
