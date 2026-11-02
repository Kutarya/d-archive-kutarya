---
title: "Model bağlam sınırı aşıldı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ai-context-length-exceeded"
publisher: "Kutarya"
language: "tr-TR"
technology: "LLM"
---

# Model bağlam sınırı aşıldı

**Hata mesajı:** `maximum context length exceeded / prompt is too long`
**Teknoloji:** LLM
**Sınıf:** Çıkarım

Prompt, konuşma geçmişi, araç çıktısı ve istenen cevap için gereken token toplamı model sınırını aşar.

## Olası nedenler

- Geçmiş sınırsız büyüyor
- Belgenin tamamı tek seferde ekleniyor
- Araç çıktıları tekrar tekrar bağlama giriyor
- Cevap için token payı ayrılmıyor

## Teşhis sırası

1. Aynı tokenizer ile her bölümün token sayısını ayrı ölçün.
2. Sistem, geçmiş, kaynak ve cevap bütçelerini raporlayın.
3. Kesilen bölümün görev için gerekli olup olmadığını değerlendirin.

## Düzeltme yaklaşımları

- Cevap için sabit pay ayıran açık token bütçesi uygulayın.
- Belgeleri retrieval ile seçin; sessizce sondan kesmeyin.
- Sınır aşıldığında kullanıcıya açık hata veya özetleme seçeneği sunun.

## Hatalı örnek

```llm

```

## Düzeltilmiş örnek

```llm

```

---
Canonical: https://kutarya.com/hatalar/ai-context-length-exceeded
