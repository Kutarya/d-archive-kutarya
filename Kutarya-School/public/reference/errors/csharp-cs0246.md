---
title: "Tür veya namespace bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/csharp-cs0246"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
---

# Tür veya namespace bulunamadı

**Hata mesajı:** `CS0246: The type or namespace name could not be found`
**Teknoloji:** C#
**Sınıf:** Derleme

Derleyici kullanılan türün tanımına ulaşamaz.

## Olası nedenler

- using eksik
- NuGet paketi kurulu değil
- Proje başvurusu eksik
- Hedef framework paketle uyumsuz

## Teşhis sırası

1. Tür adını Solution genelinde arayın.
2. dotnet list package çıktısını kontrol edin.
3. csproj ProjectReference ve TargetFramework alanlarını karşılaştırın.

## Düzeltme yaklaşımları

- Doğru namespace’i import edin.
- Paketi projeye ve uyumlu sürümle ekleyin.
- Proje başvurusunu açıkça tanımlayın.

## Hatalı örnek

```c#

```

## Düzeltilmiş örnek

```c#

```

---
Canonical: https://kutarya.com/hatalar/csharp-cs0246
