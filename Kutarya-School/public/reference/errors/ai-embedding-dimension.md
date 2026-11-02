---
title: "Embedding boyutu indeksle uyuşmuyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ai-embedding-dimension"
publisher: "Kutarya"
language: "tr-TR"
technology: "RAG / Vektör DB"
---

# Embedding boyutu indeksle uyuşmuyor

**Hata mesajı:** `vector dimension mismatch`
**Teknoloji:** RAG / Vektör DB
**Sınıf:** Retrieval

Sorgu vektörünün boyutu, koleksiyon oluşturulurken belirlenen embedding boyutundan farklıdır.

## Olası nedenler

- Embedding modeli değiştirilmiş
- Eski indeks yeni modelle sorgulanıyor
- Belge ve sorgu farklı modellerle gömülüyor
- Yanlış koleksiyon seçiliyor

## Teşhis sırası

1. Sorgu vektörünün length değerini ve indeks şemasını karşılaştırın.
2. Belge ve sorgu üretiminde kullanılan model kimliğini kaydedin.
3. Koleksiyon sürümü ile deployment sürümünü eşleştirin.

## Düzeltme yaklaşımları

- Model kimliğini ve boyutu indeks metadata’sında sürümleyin.
- Model değiştiğinde ayrı koleksiyon oluşturup belgeleri yeniden indeksleyin.
- Başlangıç sağlık kontrolünde örnek vektörle boyutu doğrulayın.

## Hatalı örnek

```rag / vektör db

```

## Düzeltilmiş örnek

```rag / vektör db

```

---
Canonical: https://kutarya.com/hatalar/ai-embedding-dimension
