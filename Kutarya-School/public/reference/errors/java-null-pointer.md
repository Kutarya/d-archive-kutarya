---
title: "NullPointerException"
type: "error-record"
canonical: "https://kutarya.com/hatalar/java-null-pointer"
publisher: "Kutarya"
language: "tr-TR"
technology: "Java"
---

# NullPointerException

**Hata mesajı:** `java.lang.NullPointerException`
**Teknoloji:** Java
**Sınıf:** Çalışma zamanı

null olan bir başvurunun alanı veya metodu kullanılır.

## Olası nedenler

- Bağımlılık enjeksiyonu eksik
- Map.get sonucu yok
- Optional yanlış kullanılmış
- Framework yaşam döngüsü dışı erişim

## Teşhis sırası

1. Gelişmiş NPE iletisindeki null olan ifadeyi okuyun.
2. Stack trace içindeki ilk uygulama çerçevesini bulun.
3. Üretim yoluna aynı girdiyle test yazın.

## Düzeltme yaklaşımları

- Constructor ile zorunlu bağımlılık alın.
- Objects.requireNonNull ile sınırda doğrulayın.
- Yokluk anlamlıysa Optional dönüş sözleşmesi kullanın.

## Hatalı örnek

```java

```

## Düzeltilmiş örnek

```java

```

---
Canonical: https://kutarya.com/hatalar/java-null-pointer
