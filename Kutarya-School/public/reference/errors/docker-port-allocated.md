---
title: "Port ayrılmış durumda"
type: "error-record"
canonical: "https://kutarya.com/hatalar/docker-port-allocated"
publisher: "Kutarya"
language: "tr-TR"
technology: "Docker"
---

# Port ayrılmış durumda

**Hata mesajı:** `Bind for 0.0.0.0 failed: port is already allocated`
**Teknoloji:** Docker
**Sınıf:** Konteyner

Host üzerindeki port başka süreç veya konteyner tarafından kullanılmaktadır.

## Olası nedenler

- Aynı compose projesi açık
- Yerel geliştirme sunucusu portu tutuyor
- Durdurulmuş sanılan konteyner çalışıyor

## Teşhis sırası

1. docker ps ile port eşlemelerini görün.
2. İşletim sisteminde port sahibini doğrulayın.
3. Compose proje adlarını karşılaştırın.

## Düzeltme yaklaşımları

- Çakışan servisi kontrollü durdurun.
- Host portunu değiştirin.
- Servisler arası iletişimde host portu yerine ağ adını kullanın.

## Hatalı örnek

```docker

```

## Düzeltilmiş örnek

```docker

```

---
Canonical: https://kutarya.com/hatalar/docker-port-allocated
