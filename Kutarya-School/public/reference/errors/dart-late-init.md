---
title: "late değişken başlatılmadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/dart-late-init"
publisher: "Kutarya"
language: "tr-TR"
technology: "Flutter / Dart"
---

# late değişken başlatılmadı

**Hata mesajı:** `LateInitializationError: Field has not been initialized`
**Teknoloji:** Flutter / Dart
**Sınıf:** Çalışma zamanı

late ile tanımlanan değer, bütün erişim yollarında atanmadan okunur.

## Olası nedenler

- Async yükleme tamamlanmadan build çalışıyor
- Yaşam döngüsü sırası yanlış
- Hata yolunda atama atlanıyor

## Teşhis sırası

1. İlk erişim ile ilk atamanın zaman çizelgesini kaydedin.
2. Async işlemin loading ve error yollarını ayrı inceleyin.
3. Değerin gerçekten zorunlu mu opsiyonel mi olduğunu belirleyin.

## Düzeltme yaklaşımları

- Yüklenme durumunu açık state ile modelleyin.
- Opsiyonelse nullable tür kullanın.
- Zorunlu bağımlılığı constructor üzerinden alın.

## Hatalı örnek

```flutter / dart

```

## Düzeltilmiş örnek

```flutter / dart

```

---
Canonical: https://kutarya.com/hatalar/dart-late-init
