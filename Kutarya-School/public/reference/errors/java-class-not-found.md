---
title: "Sınıf çalışma zamanında bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/java-class-not-found"
publisher: "Kutarya"
language: "tr-TR"
technology: "Java"
---

# Sınıf çalışma zamanında bulunamadı

**Hata mesajı:** `ClassNotFoundException / NoClassDefFoundError`
**Teknoloji:** Java
**Sınıf:** Ortam

Derleme geçmiş olsa da gerekli sınıf çalışma zamanı classpath içinde yoktur.

## Olası nedenler

- Bağımlılık runtime paketine girmemiş
- Sürüm çakışması
- Yanlış modül yolu
- Gölgeleme paketi eksik yapılandırılmış

## Teşhis sırası

1. Bağımlılık ağacını çıkarın.
2. Üretilen JAR içeriğini listeleyin.
3. Derleme ve çalışma classpath farkını karşılaştırın.

## Düzeltme yaklaşımları

- Bağımlılık kapsamını düzeltin.
- Çakışan geçişli sürümü sabitleyin.
- Paketleme eklentisini doğrulayın.

## Hatalı örnek

```java

```

## Düzeltilmiş örnek

```java

```

---
Canonical: https://kutarya.com/hatalar/java-class-not-found
