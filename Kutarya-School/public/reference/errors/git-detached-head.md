---
title: "Detached HEAD durumundasın"
type: "error-record"
canonical: "https://kutarya.com/hatalar/git-detached-head"
publisher: "Kutarya"
language: "tr-TR"
technology: "Git"
---

# Detached HEAD durumundasın

**Hata mesajı:** `You are in detached HEAD state`
**Teknoloji:** Git
**Sınıf:** Sürüm kontrolü

Çalışma ağacı bir dal yerine doğrudan commit veya tag üzerinde açılmıştır.

## Olası nedenler

- Eski commit checkout edildi
- CI benzeri sığ checkout kullanıldı
- Rebase sırasında geçici durum

## Teşhis sırası

1. git status ve git branch --show-current çıktısını okuyun.
2. HEAD commitinin hangi dallarda bulunduğunu listeleyin.
3. Devam eden rebase veya cherry-pick durumunu kontrol edin.

## Düzeltme yaklaşımları

- Değişikliği korumak için mevcut committen yeni dal oluşturun.
- İstenen mevcut dala kontrollü geçin.
- Devam eden geçmiş işlemini tamamlamadan rastgele checkout yapmayın.

## Hatalı örnek

```git

```

## Düzeltilmiş örnek

```git

```

---
Canonical: https://kutarya.com/hatalar/git-detached-head
