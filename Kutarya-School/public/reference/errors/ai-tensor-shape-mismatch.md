---
title: "Tensor boyutları uyuşmuyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ai-tensor-shape-mismatch"
publisher: "Kutarya"
language: "tr-TR"
technology: "PyTorch / TensorFlow"
---

# Tensor boyutları uyuşmuyor

**Hata mesajı:** `size mismatch / shapes cannot be multiplied`
**Teknoloji:** PyTorch / TensorFlow
**Sınıf:** Model

Katmanların beklediği eksen ve boyutlar, üretilen tensor şekliyle uyuşmaz.

## Olası nedenler

- Batch ve özellik eksenleri ters
- Sınıf sayısı değişti fakat son katman değişmedi
- Flatten sonrası boyut yanlış hesaplandı
- Görüntü dönüşümü farklı çözünürlük üretiyor

## Teşhis sırası

1. Hata öncesinde her tensor için shape, dtype ve device değerini kaydedin.
2. Model summary ile katman giriş ve çıkışlarını izleyin.
3. Tek örnek ve tek batch üzerinde aynı yolu karşılaştırın.

## Düzeltme yaklaşımları

- Tensor sözleşmesini kod ve testte açıkça doğrulayın.
- permute, reshape veya son katmanı gerçek veri şekline göre düzeltin.
- Eğitim ve çıkarım ön işlemesini aynı kaynaktan üretin.

## Hatalı örnek

```pytorch / tensorflow

```

## Düzeltilmiş örnek

```pytorch / tensorflow

```

---
Canonical: https://kutarya.com/hatalar/ai-tensor-shape-mismatch
