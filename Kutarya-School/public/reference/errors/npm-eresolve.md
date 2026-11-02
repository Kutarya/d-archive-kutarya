---
title: "Bağımlılık ağacı çözülemiyor"
type: "error-record"
canonical: "https://kutarya.com/hatalar/npm-eresolve"
publisher: "Kutarya"
language: "tr-TR"
technology: "Vite / npm"
---

# Bağımlılık ağacı çözülemiyor

**Hata mesajı:** `npm ERR! ERESOLVE unable to resolve dependency tree`
**Teknoloji:** Vite / npm
**Sınıf:** Bağımlılık

Paketlerin istediği peer dependency sürümleri birbiriyle uyuşmaz.

## Olası nedenler

- Framework ana sürümleri çakışıyor
- Eski eklenti yeni çalışma zamanını desteklemiyor
- Lock dosyası farklı paket yöneticisiyle üretildi

## Teşhis sırası

1. ERESOLVE çıktısındaki found ve peer satırlarını yan yana okuyun.
2. npm explain ile çakışan paketin neden kurulduğunu bulun.
3. Paketlerin resmi uyumluluk aralığını kontrol edin.

## Düzeltme yaklaşımları

- Uyumlu sürüm aralığını bilinçli seçin.
- Kullanılmayan eski eklentiyi kaldırın.
- --force veya --legacy-peer-deps seçeneğini kalıcı çözüm saymayın.

## Hatalı örnek

```vite / npm

```

## Düzeltilmiş örnek

```vite / npm

```

---
Canonical: https://kutarya.com/hatalar/npm-eresolve
