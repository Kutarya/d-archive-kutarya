---
title: "Go modülü veya paket bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/go-missing-module"
publisher: "Kutarya"
language: "tr-TR"
technology: "Go"
---

# Go modülü veya paket bulunamadı

**Hata mesajı:** `no required module provides package`
**Teknoloji:** Go
**Sınıf:** Bağımlılık

Import yolu mevcut go.mod bağımlılık grafiğinde çözülemez.

## Olası nedenler

- Import yolu yanlış
- go.mod yanlış klasörde
- Özel modül erişimi yapılandırılmamış
- replace yönergesi eski

## Teşhis sırası

1. go env GOMOD ile etkin modül dosyasını bulun.
2. go list -m all içinde bağımlılığı arayın.
3. Import yolunu modülün yayımlanmış adıyla karşılaştırın.

## Düzeltme yaklaşımları

- Doğru modül kökünde go get ve go mod tidy çalıştırın.
- Özel modül için GOPRIVATE ve kimlik doğrulamayı yapılandırın.
- Yerel replace yönergesini yayın öncesi temizleyin.

## Hatalı örnek

```go

```

## Düzeltilmiş örnek

```go

```

---
Canonical: https://kutarya.com/hatalar/go-missing-module
