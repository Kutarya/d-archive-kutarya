---
title: "Adres kullanımda"
type: "error-record"
canonical: "https://kutarya.com/hatalar/node-eaddrinuse"
publisher: "Kutarya"
language: "tr-TR"
technology: "Node.js"
---

# Adres kullanımda

**Hata mesajı:** `Error: listen EADDRINUSE`
**Teknoloji:** Node.js
**Sınıf:** Çalıştırma

Node sunucusu kullanımda olan IP/port üzerinde dinlemeye çalışır.

## Olası nedenler

- Önceki dev server açık
- Test süreci kapanmamış
- İki servis aynı ortam değişkenini kullanıyor

## Teşhis sırası

1. Hata iletisindeki portu not edin.
2. Port sahibini işletim sistemi aracından bulun.
3. Terminal oturumlarında bekleyen süreçleri kontrol edin.

## Düzeltme yaklaşımları

- Doğru süreci kapatın.
- Portu yapılandırılabilir yapın.
- Testlerde sunucuyu afterAll içinde kapatın.

## Hatalı örnek

```node.js

```

## Düzeltilmiş örnek

```node.js

```

---
Canonical: https://kutarya.com/hatalar/node-eaddrinuse
