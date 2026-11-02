---
title: "İşlem kilitlenmesi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/sql-deadlock"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
---

# İşlem kilitlenmesi

**Hata mesajı:** `deadlock detected / transaction was deadlocked`
**Teknoloji:** SQL
**Sınıf:** Eşzamanlılık

İki işlem birbirinin tuttuğu kaynağı ters sırada bekler; veritabanı birini iptal eder.

## Olası nedenler

- Tabloların farklı sırada güncellenmesi
- Uzun işlem
- Gereksiz geniş kilit
- Eksik indeks nedeniyle çok satırın taranması

## Teşhis sırası

1. Deadlock grafiğini veya veritabanı günlüğünü alın.
2. İşlemlerin kilit alma sırasını karşılaştırın.
3. Sorgu planını ve işlem süresini ölçün.

## Düzeltme yaklaşımları

- Kaynakları her yerde aynı sırada güncelleyin.
- İşlemi küçültün ve kullanıcı etkileşimini işlem dışında tutun.
- Güvenli geri deneme stratejisi uygulayın.

## Hatalı örnek

```sql

```

## Düzeltilmiş örnek

```sql

```

---
Canonical: https://kutarya.com/hatalar/sql-deadlock
