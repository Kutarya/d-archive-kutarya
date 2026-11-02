---
title: "RLS kaydı görünmez veya yazmayı reddeder"
type: "error-record"
canonical: "https://kutarya.com/hatalar/supabase-rls"
publisher: "Kutarya"
language: "tr-TR"
technology: "Supabase / PostgreSQL"
---

# RLS kaydı görünmez veya yazmayı reddeder

**Hata mesajı:** `new row violates row-level security policy / empty result`
**Teknoloji:** Supabase / PostgreSQL
**Sınıf:** Yetki

Etkin RLS politikası kullanıcının rolü, UID’si veya satır koşuluyla uyuşmaz.

## Olası nedenler

- auth.uid() null
- INSERT için WITH CHECK eksik
- SELECT ve UPDATE politikaları farklı
- Service role ile yapılan test istemci davranışını gizliyor

## Teşhis sırası

1. JWT içindeki sub ve rolü doğrulayın.
2. Politikayı gerçek authenticated rolüyle SQL testinde çalıştırın.
3. USING ile WITH CHECK koşullarını ayrı inceleyin.

## Düzeltme yaklaşımları

- Her işlem için açık politika tanımlayın.
- Sahiplik sütununu sunucuda doğrulanmış UID ile yazın.
- Service role anahtarını tarayıcıya koymayın.

## Hatalı örnek

```supabase / postgresql

```

## Düzeltilmiş örnek

```supabase / postgresql

```

---
Canonical: https://kutarya.com/hatalar/supabase-rls
