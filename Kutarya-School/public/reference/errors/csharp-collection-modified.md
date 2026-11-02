---
title: "Koleksiyon değiştirildi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/csharp-collection-modified"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
---

# Koleksiyon değiştirildi

**Hata mesajı:** `InvalidOperationException: Collection was modified`
**Teknoloji:** C#
**Sınıf:** Çalışma zamanı

Bir koleksiyon üzerinde gezinirken aynı koleksiyonun yapısı değiştirilir.

## Olası nedenler

- foreach içinde Remove/Add
- Event handlerın koleksiyonu değiştirmesi
- Başka iş parçacığının eşzamanlı değişimi

## Teşhis sırası

1. Değişikliğin aynı koleksiyona yapıldığını doğrulayın.
2. Olay çağrılarının dolaylı değişiklik yapıp yapmadığını inceleyin.
3. Eşzamanlı erişim varsa zaman çizelgesi kaydı alın.

## Düzeltme yaklaşımları

- Silinecekleri önce ayrı listeye alın.
- RemoveAll gibi tek işlem kullanın.
- Eşzamanlı senaryoda uygun concurrent koleksiyon seçin.

## Hatalı örnek

```c#

```

## Düzeltilmiş örnek

```c#

```

---
Canonical: https://kutarya.com/hatalar/csharp-collection-modified
