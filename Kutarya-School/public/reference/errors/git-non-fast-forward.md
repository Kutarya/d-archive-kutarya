---
title: "Push reddedildi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/git-non-fast-forward"
publisher: "Kutarya"
language: "tr-TR"
technology: "Git"
---

# Push reddedildi

**Hata mesajı:** `rejected (non-fast-forward)`
**Teknoloji:** Git
**Sınıf:** Sürüm kontrolü

Uzak dalda yerel dalda olmayan commitler bulunduğu için Git geçmişi ezmeyi reddeder.

## Olası nedenler

- Başka biri push yapmıştır
- Başka cihazdan commit atılmıştır
- Yerel dal eski kalmıştır

## Teşhis sırası

1. git fetch ile uzak durumu alın.
2. git log --oneline --graph ile iki geçmişi karşılaştırın.
3. Çalışma ağacındaki değişiklikleri kaybetmeden önce status kontrol edin.

## Düzeltme yaklaşımları

- Takım kuralına göre merge veya rebase yapın.
- Çakışmaları test ederek çözün.
- Force gerekiyorsa yalnız bilinçli durumda force-with-lease kullanın.

## Hatalı örnek

```git

```

## Düzeltilmiş örnek

```git

```

---
Canonical: https://kutarya.com/hatalar/git-non-fast-forward
