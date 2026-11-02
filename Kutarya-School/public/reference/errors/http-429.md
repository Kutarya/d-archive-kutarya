---
title: "İstek sınırı aşıldı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/http-429"
publisher: "Kutarya"
language: "tr-TR"
technology: "Web / HTTP"
---

# İstek sınırı aşıldı

**Hata mesajı:** `429 Too Many Requests`
**Teknoloji:** Web / HTTP
**Sınıf:** Kota

İstemci tanımlı zaman aralığında izin verilenden fazla istek gönderir.

## Olası nedenler

- Arayüz aynı isteği tekrar renderda çağırıyor
- Retry döngüsü gecikmesiz
- Paylaşılan API anahtarı kotası dolu
- Sunucu limiti kullanıcı davranışıyla uyumsuz

## Teşhis sırası

1. Network kaydında aynı isteğin sıklığını ölçün.
2. Retry-After başlığını kontrol edin.
3. Limit anahtarının IP, kullanıcı veya token olup olmadığını doğrulayın.

## Düzeltme yaklaşımları

- İstemcide debounce ve istek birleştirme uygulayın.
- Retry-After değerine uyan exponential backoff kullanın.
- Limitleri gizlice kaldırmak yerine ürün kotasını görünür yapın.

## Hatalı örnek

```web / http

```

## Düzeltilmiş örnek

```web / http

```

---
Canonical: https://kutarya.com/hatalar/http-429
