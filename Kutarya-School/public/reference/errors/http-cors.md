---
title: "CORS isteği engellendi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/http-cors"
publisher: "Kutarya"
language: "tr-TR"
technology: "Web / HTTP"
---

# CORS isteği engellendi

**Hata mesajı:** `blocked by CORS policy`
**Teknoloji:** Web / HTTP
**Sınıf:** Ağ

Tarayıcı, farklı kaynağa yapılan isteğin sunucu tarafından açıkça izinli olmadığını görür.

## Olası nedenler

- Allow-Origin başlığı eksik
- Preflight OPTIONS desteklenmiyor
- İzin verilen yöntem/başlık eksik
- Credentials ile wildcard birlikte kullanılıyor

## Teşhis sırası

1. Network sekmesinde önce OPTIONS isteğini inceleyin.
2. Yanıt başlıklarını ve durum kodunu görün.
3. Sorunun tarayıcı politikası mı sunucu hatası mı olduğunu curl ile ayırın.

## Düzeltme yaklaşımları

- CORS’u hedef sunucuda izin listesiyle yapılandırın.
- OPTIONS yanıtını yöntem ve başlıklarla tamamlayın.
- Tarayıcı güvenliğini kapatmayı çözüm saymayın.

## Hatalı örnek

```web / http

```

## Düzeltilmiş örnek

```web / http

```

---
Canonical: https://kutarya.com/hatalar/http-cors
