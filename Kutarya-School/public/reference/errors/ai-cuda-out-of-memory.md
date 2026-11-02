---
title: "GPU belleği yetersiz"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ai-cuda-out-of-memory"
publisher: "Kutarya"
language: "tr-TR"
technology: "PyTorch / CUDA"
---

# GPU belleği yetersiz

**Hata mesajı:** `CUDA out of memory`
**Teknoloji:** PyTorch / CUDA
**Sınıf:** Kaynak

Model, aktivasyonlar ve batch verisi GPU üzerinde kullanılabilir bellekten daha fazla alan ister.

## Olası nedenler

- Batch boyutu donanıma göre fazla
- Gradient birikimi temizlenmiyor
- Gereksiz tensor referansları bellekte kalıyor
- Model hassasiyeti ve bağlam uzunluğu yüksek

## Teşhis sırası

1. nvidia-smi ile süreç ve ayrılmış belleği izleyin.
2. Her eğitim adımında allocated ve reserved CUDA belleğini kaydedin.
3. Batch, çözünürlük ve bağlam uzunluğunu ayrı ayrı küçülterek sınırı ölçün.

## Düzeltme yaklaşımları

- Batch boyutunu düşürün veya gradient accumulation kullanın.
- Uygunsa mixed precision ve gradient checkpointing etkinleştirin.
- Tensor ömürlerini kısaltın; körlemesine empty_cache çağırmayı çözüm saymayın.

## Hatalı örnek

```pytorch / cuda

```

## Düzeltilmiş örnek

```pytorch / cuda

```

---
Canonical: https://kutarya.com/hatalar/ai-cuda-out-of-memory
