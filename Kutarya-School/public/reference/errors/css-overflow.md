---
title: "İçerik kapsayıcıdan taşıyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/css-overflow"
publisher: "Kutarya"
language: "tr-TR"
technology: "CSS"
---

# İçerik kapsayıcıdan taşıyor

**Hata mesajı:** `Yatay kaydırma / taşan metin`
**Teknoloji:** CSS
**Sınıf:** Arayüz

Sabit genişlik, minimum içerik boyutu veya uzun kırılmaz metin düzeni aşar.

## Olası nedenler

- Flex öğesinde min-width:auto
- Uzun URL veya kod satırı
- Sabit piksel genişliği
- box-sizing farkı

## Teşhis sırası

1. Taşan öğeyi DevTools layout araçlarıyla bulun.
2. scrollWidth ile clientWidth değerini karşılaştırın.
3. Geçici outline ile kutu sınırlarını görünür yapın.

## Düzeltme yaklaşımları

- Flex/grid çocuklarında gerektiğinde min-width:0 kullanın.
- Metin türüne göre overflow-wrap veya yatay kod kaydırması ekleyin.
- Sabit genişliği responsive sınırlarla değiştirin.

## Hatalı örnek

```css

```

## Düzeltilmiş örnek

```css

```

---
Canonical: https://kutarya.com/hatalar/css-overflow
