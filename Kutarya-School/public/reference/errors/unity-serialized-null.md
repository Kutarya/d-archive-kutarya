---
title: "Inspector başvurusu atanmamış"
type: "error-record"
canonical: "https://kutarya.com/hatalar/unity-serialized-null"
publisher: "Kutarya"
language: "tr-TR"
technology: "Unity"
---

# Inspector başvurusu atanmamış

**Hata mesajı:** `UnassignedReferenceException / serialized field is null`
**Teknoloji:** Unity
**Sınıf:** Sahne

SerializeField alanı sahne ya da prefab üzerinde gerekli nesneye bağlanmadan kullanılır.

## Olası nedenler

- Prefab örneğinde alan boş
- Sahne değişince başvuru kayboldu
- Instantiate edilen varyant farklı yapı kullanıyor

## Teşhis sırası

1. Hata stack trace içindeki bileşen örneğini seçin.
2. Prefab asseti ile sahne örneğinin override değerlerini karşılaştırın.
3. Awake içinde zorunlu alanları assert ederek eksik başvuruyu erken yakalayın.

## Düzeltme yaklaşımları

- Inspector alanını doğru nesneyle bağlayın.
- Zorunlu bağımlılığı kurulum veya fabrika koduyla verin.
- OnValidate ile editör zamanında anlaşılır uyarı üretin.

## Hatalı örnek

```unity

```

## Düzeltilmiş örnek

```unity

```

---
Canonical: https://kutarya.com/hatalar/unity-serialized-null
