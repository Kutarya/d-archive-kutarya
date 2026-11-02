---
title: "Yerel eklenti bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/flutter-missing-plugin"
publisher: "Kutarya"
language: "tr-TR"
technology: "Flutter / Dart"
---

# Yerel eklenti bulunamadı

**Hata mesajı:** `MissingPluginException: No implementation found for method`
**Teknoloji:** Flutter / Dart
**Sınıf:** Platform

Dart tarafı eklentiyi çağırır fakat çalışan platform derlemesinde yerel uygulama kayıtlı değildir.

## Olası nedenler

- Paket eklendikten sonra yalnız hot reload yapıldı
- Eklenti hedef platformu desteklemiyor
- Generated plugin registrant eski
- Test ortamında platform kanalı taklit edilmedi

## Teşhis sırası

1. flutter pub deps içinde paketi doğrulayın.
2. Uygulamayı tamamen durdurup temiz derleme alın.
3. Paketin Android, iOS, web veya masaüstü destek tablosunu kontrol edin.

## Düzeltme yaklaşımları

- flutter clean sonrası tam yeniden derleme yapın.
- Desteklenmeyen platform için koşullu uygulama sağlayın.
- Birim testinde MethodChannel sınırını taklit edin.

## Hatalı örnek

```flutter / dart

```

## Düzeltilmiş örnek

```flutter / dart

```

---
Canonical: https://kutarya.com/hatalar/flutter-missing-plugin
