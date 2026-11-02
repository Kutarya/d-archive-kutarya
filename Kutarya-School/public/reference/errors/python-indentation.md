---
title: "Girinti hatası"
type: "error-record"
canonical: "https://kutarya.com/hatalar/python-indentation"
publisher: "Kutarya"
language: "tr-TR"
technology: "Python"
---

# Girinti hatası

**Hata mesajı:** `IndentationError / TabError`
**Teknoloji:** Python
**Sınıf:** Sözdizimi

Blok yapısı boşluk ve tab kullanımındaki tutarsızlık nedeniyle çözülemez.

## Olası nedenler

- Tab ve boşluğun karışması
- Eksik blok gövdesi
- Kopyalanan kodun hizasının bozulması

## Teşhis sırası

1. Editörde görünmez karakterleri açın.
2. Hata satırından bir önceki blok başlangıcını kontrol edin.
3. Dosyayı otomatik biçimlendiriciyle önizleyin.

## Düzeltme yaklaşımları

- Yalnız dört boşluk kullanın.
- Boş blokta pass yazın.
- Black veya Ruff format kullanın.

## Hatalı örnek

```python

```

## Düzeltilmiş örnek

```python

```

---
Canonical: https://kutarya.com/hatalar/python-indentation
