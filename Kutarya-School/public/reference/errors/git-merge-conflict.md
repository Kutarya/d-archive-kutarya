---
title: "Birleştirme çakışması"
type: "error-record"
canonical: "https://kutarya.com/hatalar/git-merge-conflict"
publisher: "Kutarya"
language: "tr-TR"
technology: "Git"
---

# Birleştirme çakışması

**Hata mesajı:** `CONFLICT (content): Merge conflict in ...`
**Teknoloji:** Git
**Sınıf:** Sürüm kontrolü

İki geçmiş aynı satır veya dosya üzerinde otomatik birleştirilemeyen değişiklik yapmıştır.

## Olası nedenler

- Aynı satır iki dalda değişmiştir
- Bir dal silerken diğeri düzenlemiştir
- Üretilmiş dosya yanlışlıkla izlenmektedir

## Teşhis sırası

1. git status ile tüm çakışmaları listeleyin.
2. Base, ours ve theirs farkını anlayın.
3. Yalnız işaretleri silmek yerine amaçlanan davranışı belirleyin.

## Düzeltme yaklaşımları

- Dosyayı anlamlı birleşik hâle getirin.
- Testleri çalıştırın.
- Çözümü git add ile işaretleyip işlemi tamamlayın.

## Hatalı örnek

```git

```

## Düzeltilmiş örnek

```git

```

---
Canonical: https://kutarya.com/hatalar/git-merge-conflict
