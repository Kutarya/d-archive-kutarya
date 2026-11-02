---
title: "Değer aynı anda uyumsuz biçimde ödünç alınıyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/rust-borrow-checker"
publisher: "Kutarya"
language: "tr-TR"
technology: "Rust"
---

# Değer aynı anda uyumsuz biçimde ödünç alınıyor

**Hata mesajı:** `cannot borrow ... as mutable because it is also borrowed as immutable`
**Teknoloji:** Rust
**Sınıf:** Derleme

Aynı veri üzerinde çakışan değiştirilebilir ve değiştirilemez başvuruların ömrü kesişir.

## Olası nedenler

- Immutable başvuru gerekenden uzun yaşıyor
- Döngü içinde koleksiyon değiştirilmek isteniyor
- Metot hem alanı okuyor hem self’i değiştiriyor

## Teşhis sırası

1. Derleyici mesajındaki first borrow ve second borrow satırlarını işaretleyin.
2. Başvurunun son gerçek kullanım noktasını bulun.
3. İşlemi okuma, hesaplama ve yazma aşamalarına ayırmayı deneyin.

## Düzeltme yaklaşımları

- Başvuru ömrünü daha küçük scope içine alın.
- Önce gerekli değeri kopyalayın veya indeksleri toplayın.
- RefCell gibi interior mutability araçlarını ancak çalışma zamanı kuralı uygunsa kullanın.

## Hatalı örnek

```rust

```

## Düzeltilmiş örnek

```rust

```

---
Canonical: https://kutarya.com/hatalar/rust-borrow-checker
