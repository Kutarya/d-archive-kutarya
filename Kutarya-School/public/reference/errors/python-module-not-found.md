---
title: "Modül bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/python-module-not-found"
publisher: "Kutarya"
language: "tr-TR"
technology: "Python"
---

# Modül bulunamadı

**Hata mesajı:** `ModuleNotFoundError: No module named ...`
**Teknoloji:** Python
**Sınıf:** Ortam

Etkin Python ortamında istenen paket veya yerel modül bulunmaz.

## Olası nedenler

- Yanlış sanal ortam etkin
- Paket başka Python sürümüne kurulmuş
- Dosya adı import ile uyuşmuyor
- Çalışma dizini hatalı

## Teşhis sırası

1. python -c ile sys.executable değerini görün.
2. python -m pip show paket komutunu kullanın.
3. sys.path ve çalışma dizinini inceleyin.

## Düzeltme yaklaşımları

- Paketi etkin ortamda python -m pip ile kurun.
- Sanal ortamı IDE ile eşleştirin.
- Projeyi paket yapısına uygun çalıştırın.

## Hatalı örnek

```python

```

## Düzeltilmiş örnek

```python

```

---
Canonical: https://kutarya.com/hatalar/python-module-not-found
