---
title: "HTTP trafiği engellendi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/android-cleartext"
publisher: "Kutarya"
language: "tr-TR"
technology: "Android"
---

# HTTP trafiği engellendi

**Hata mesajı:** `CLEARTEXT communication not permitted`
**Teknoloji:** Android
**Sınıf:** Ağ / güvenlik

Android ağ güvenliği politikası şifrelenmemiş HTTP bağlantısını reddeder.

## Olası nedenler

- Geliştirme API’si HTTP kullanıyor
- Yanlış base URL üretime taşındı
- Network security config hedef alanı kapsamıyor

## Teşhis sırası

1. İstek URL’sinin şema ve host değerini kaydedin.
2. Aynı uç noktayı HTTPS ile sınayın.
3. Manifest birleşim çıktısında networkSecurityConfig değerini kontrol edin.

## Düzeltme yaklaşımları

- Üretim servisini HTTPS üzerinden yayınlayın.
- Yalnız geliştirme hostu için dar kapsamlı istisna tanımlayın.
- Tüm cleartext trafiğine genel izin vermeyin.

## Hatalı örnek

```android

```

## Düzeltilmiş örnek

```android

```

---
Canonical: https://kutarya.com/hatalar/android-cleartext
