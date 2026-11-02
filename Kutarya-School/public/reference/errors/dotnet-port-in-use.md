---
title: "Port zaten kullanımda"
type: "error-record"
canonical: "https://kutarya.com/hatalar/dotnet-port-in-use"
publisher: "Kutarya"
language: "tr-TR"
technology: ".NET"
---

# Port zaten kullanımda

**Hata mesajı:** `Failed to bind to address / address already in use`
**Teknoloji:** .NET
**Sınıf:** Çalıştırma

Uygulamanın dinlemek istediği portu başka bir süreç tutar.

## Olası nedenler

- Önceki süreç kapanmamıştır
- Aynı profil iki kez çalışmıştır
- Docker port eşlemesi çakışır

## Teşhis sırası

1. netstat veya Get-NetTCPConnection ile port sahibini bulun.
2. Sürecin gerçekten bu projeye ait olduğunu doğrulayın.
3. launchSettings ve ortam değişkenlerini kontrol edin.

## Düzeltme yaklaşımları

- Eski süreci kontrollü kapatın.
- Geliştirme portunu değiştirin.
- Dinamik port kullanan test düzeni kurun.

## Hatalı örnek

```.net

```

## Düzeltilmiş örnek

```.net

```

---
Canonical: https://kutarya.com/hatalar/dotnet-port-in-use
