---
title: "Değişken tanımlı değil"
type: "error-record"
canonical: "https://kutarya.com/hatalar/js-is-not-defined"
publisher: "Kutarya"
language: "tr-TR"
technology: "JavaScript"
---

# Değişken tanımlı değil

**Hata mesajı:** `ReferenceError: x is not defined`
**Teknoloji:** JavaScript
**Sınıf:** Çalışma zamanı

İsim mevcut kapsamda tanımlanmadan okunur.

## Olası nedenler

- Yazım hatası
- let/const kapsamının dışına çıkma
- Script yükleme sırasının yanlış olması
- Modül export/import uyuşmazlığı

## Teşhis sırası

1. Hata satırındaki ismi proje genelinde arayın.
2. Aynı ismin farklı kapsamda tanımlanıp tanımlanmadığını kontrol edin.
3. Tarayıcı Network sekmesinde ilgili modülün yüklendiğini doğrulayın.

## Düzeltme yaklaşımları

- Değişkeni kullanıldığı kapsama taşıyın.
- Global değişken yerine açık import kullanın.
- Adlandırmayı otomatik tamamlama ve lint ile doğrulayın.

## Hatalı örnek

```javascript

```

## Düzeltilmiş örnek

```javascript

```

---
Canonical: https://kutarya.com/hatalar/js-is-not-defined
