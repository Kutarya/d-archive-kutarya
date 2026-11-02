---
title: "Benzersiz anahtar çakışması"
type: "error-record"
canonical: "https://kutarya.com/hatalar/sql-duplicate-key"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
---

# Benzersiz anahtar çakışması

**Hata mesajı:** `duplicate key value violates unique constraint`
**Teknoloji:** SQL
**Sınıf:** Veri bütünlüğü

Unique veya primary key kuralını ihlal eden kayıt eklenir.

## Olası nedenler

- Aynı iş iki kez gönderilmiştir
- Kimlik üretimi çakışmıştır
- Upsert yerine doğrudan insert kullanılmıştır

## Teşhis sırası

1. Çakışan constraint ve sütun adını iletiden bulun.
2. Aynı doğal anahtara sahip mevcut kaydı sorgulayın.
3. İsteğin tekrar gönderilme nedenini günlüklerden inceleyin.

## Düzeltme yaklaşımları

- İşleme idempotency anahtarı ekleyin.
- Uygunsa ON CONFLICT/UPSERT kullanın.
- Kuralı kaldırmak yerine veri modelini doğrulayın.

## Hatalı örnek

```sql

```

## Düzeltilmiş örnek

```sql

```

---
Canonical: https://kutarya.com/hatalar/sql-duplicate-key
