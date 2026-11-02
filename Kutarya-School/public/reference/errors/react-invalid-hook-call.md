---
title: "Geçersiz Hook çağrısı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/react-invalid-hook-call"
publisher: "Kutarya"
language: "tr-TR"
technology: "React"
---

# Geçersiz Hook çağrısı

**Hata mesajı:** `Invalid hook call. Hooks can only be called inside...`
**Teknoloji:** React
**Sınıf:** Derleme / çalışma

Hook, React’in çağrı sırası garantisini sağlayamadığı bir yerde kullanılır.

## Olası nedenler

- Hookun koşul veya döngü içinde çağrılması
- Normal yardımcı fonksiyonda Hook kullanılması
- Projede iki React kopyası bulunması
- react ve react-dom sürümlerinin uyuşmaması

## Teşhis sırası

1. npm ls react react-dom çıktısını inceleyin.
2. Hook çağrılarını bileşenin en üst seviyesinde arayın.
3. Koşullu return öncesinde Hook olup olmadığını kontrol edin.

## Düzeltme yaklaşımları

- Hookları yalnız bileşen veya use ile başlayan özel Hook içinde çağırın.
- Koşulu Hookun içine taşıyın.
- Tek React sürümüne çözümleyin.

## Hatalı örnek

```react

```

## Düzeltilmiş örnek

```react

```

---
Canonical: https://kutarya.com/hatalar/react-invalid-hook-call
