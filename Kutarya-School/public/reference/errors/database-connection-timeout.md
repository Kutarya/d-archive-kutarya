---
title: "Veritabanı bağlantısı zaman aşımına uğradı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/database-connection-timeout"
publisher: "Kutarya"
language: "tr-TR"
technology: "Veritabanı"
---

# Veritabanı bağlantısı zaman aşımına uğradı

**Hata mesajı:** `connection timed out / pool exhausted`
**Teknoloji:** Veritabanı
**Sınıf:** Bağlantı

Uygulama zamanında yeni bağlantı kuramaz veya havuzdan bağlantı alamaz.

## Olası nedenler

- Host veya port erişilemiyor
- Bağlantılar kapatılmadan havuz tüketiliyor
- Uzun transaction bağlantıyı tutuyor
- TLS ya da firewall engeli

## Teşhis sırası

1. Uygulama makinesinden host ve porta ağ erişimini sınayın.
2. Aktif, boşta ve bekleyen havuz sayılarını ölçün.
3. Yavaş sorgu ve uzun transaction kayıtlarını inceleyin.

## Düzeltme yaklaşımları

- Bağlantı yaşam döngüsünü framework havuzuna bırakın.
- Transaction sürelerini küçültün ve sorguları indeksleyin.
- Timeout ve havuz boyutunu ölçüme göre ayarlayın.

## Hatalı örnek

```veritabanı

```

## Düzeltilmiş örnek

```veritabanı

```

---
Canonical: https://kutarya.com/hatalar/database-connection-timeout
