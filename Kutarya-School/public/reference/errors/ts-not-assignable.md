---
title: "Tür atanamıyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ts-not-assignable"
publisher: "Kutarya"
language: "tr-TR"
technology: "TypeScript"
---

# Tür atanamıyor

**Hata mesajı:** `Type 'X' is not assignable to type 'Y'`
**Teknoloji:** TypeScript
**Sınıf:** Derleme

Üretilen değer ile hedef değişkenin sözleşmesi uyuşmaz.

## Olası nedenler

- Alan tipi farklıdır
- undefined olasılığı ele alınmamıştır
- Birleşim türü daraltılmamıştır
- API tipi gerçeği yansıtmıyordur

## Teşhis sırası

1. Hata iletisindeki ilk farklı alanı okuyun.
2. Değer ve hedef tür tanımlarını yan yana karşılaştırın.
3. as ile susturmadan önce çalışma zamanı verisini inceleyin.

## Düzeltme yaklaşımları

- Sözleşmeyi gerçeğe göre düzeltin.
- Tür koruyucu veya doğrulayıcı kullanın.
- Opsiyonel durumu açıkça ele alın.

## Hatalı örnek

```typescript

```

## Düzeltilmiş örnek

```typescript

```

---
Canonical: https://kutarya.com/hatalar/ts-not-assignable
