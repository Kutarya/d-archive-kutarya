---
title: "Sütun adı belirsiz"
type: "error-record"
canonical: "https://kutarya.com/hatalar/sql-column-ambiguous"
publisher: "Kutarya"
language: "tr-TR"
technology: "SQL"
---

# Sütun adı belirsiz

**Hata mesajı:** `column reference is ambiguous`
**Teknoloji:** SQL
**Sınıf:** Sorgu

Sorgudaki sütun adı birden fazla tablodan gelebilir.

## Olası nedenler

- JOIN edilen tablolarda aynı sütun adı
- Takma ad kullanılmaması
- SELECT * sonrasında belirsiz sıralama

## Teşhis sırası

1. Hata iletisindeki sütunu sorguda bulun.
2. FROM ve JOIN tablolarında aynı adı kontrol edin.
3. Her tabloya kısa ve anlamlı alias verin.

## Düzeltme yaklaşımları

- Sütunu tablo aliası ile niteleyin.
- SELECT * yerine açık sütun listesi kullanın.

## Hatalı örnek

```sql

```

## Düzeltilmiş örnek

```sql

```

---
Canonical: https://kutarya.com/hatalar/sql-column-ambiguous
