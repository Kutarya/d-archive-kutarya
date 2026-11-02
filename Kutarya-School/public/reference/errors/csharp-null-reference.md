---
title: "NullReferenceException"
type: "error-record"
canonical: "https://kutarya.com/hatalar/csharp-null-reference"
publisher: "Kutarya"
language: "tr-TR"
technology: "C#"
---

# NullReferenceException

**Hata mesajı:** `System.NullReferenceException: Object reference not set...`
**Teknoloji:** C#
**Sınıf:** Çalışma zamanı

null olan bir başvurunun üyesi okunur veya çağrılır.

## Olası nedenler

- Bağımlılığın başlatılmaması
- FirstOrDefault sonucunun bulunamaması
- JSON alanının eksik gelmesi
- Yaşam döngüsü sırasının yanlış olması

## Teşhis sırası

1. Stack trace içindeki ilk uygulama satırına gidin.
2. Satırdaki zincirleme erişimleri ayrı değişkenlere bölün.
3. Debugger ile her parçanın değerini inceleyin.

## Düzeltme yaklaşımları

- Nullable reference types özelliğini etkinleştirin.
- Constructor guard kullanın.
- Bulunamama durumunu açıkça yönetin.

## Hatalı örnek

```c#
var ad = siparis.Musteri.Ad;
```

## Düzeltilmiş örnek

```c#
var musteri = siparis.Musteri ?? throw new InvalidOperationException("Müşteri eksik");
var ad = musteri.Ad;
```

---
Canonical: https://kutarya.com/hatalar/csharp-null-reference
