---
title: "Sunucu ve istemci HTML’i uyuşmuyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/react-hydration-mismatch"
publisher: "Kutarya"
language: "tr-TR"
technology: "React"
---

# Sunucu ve istemci HTML’i uyuşmuyor

**Hata mesajı:** `Hydration failed because the server rendered HTML did not match the client`
**Teknoloji:** React
**Sınıf:** Arayüz

İlk istemci renderı sunucunun ürettiği HTML’den farklıdır.

## Olası nedenler

- Render sırasında Date veya Math.random kullanımı
- window bilgisinin doğrudan JSX üretmesi
- Geçersiz iç içe HTML
- Sunucu ve istemcide farklı veri

## Teşhis sırası

1. Tarayıcı uyarısındaki ilk farklı düğümü bulun.
2. JavaScript kapalıyken gelen HTML ile ilk istemci çıktısını karşılaştırın.
3. Rastgele, tarih ve tarayıcıya özel değerleri render yolunda arayın.

## Düzeltme yaklaşımları

- Kararsız değeri effect sonrasına taşıyın.
- İlk veri anlık görüntüsünü istemciye aktarın.
- Geçersiz HTML yapısını düzeltin; suppressHydrationWarning kullanımını sınırlandırın.

## Hatalı örnek

```react

```

## Düzeltilmiş örnek

```react

```

---
Canonical: https://kutarya.com/hatalar/react-hydration-mismatch
