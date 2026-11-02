---
title: "Bağlayıcı tanımı bulamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/cpp-undefined-reference"
publisher: "Kutarya"
language: "tr-TR"
technology: "C++"
---

# Bağlayıcı tanımı bulamadı

**Hata mesajı:** `undefined reference / unresolved external symbol`
**Teknoloji:** C++
**Sınıf:** Bağlama

Bildirim görülür fakat gerçek fonksiyon veya değişken tanımı bağlama aşamasında bulunmaz.

## Olası nedenler

- Kaynak dosya build listesinde değil
- İmza bildirimle uyuşmuyor
- Kütüphane sırası veya mimarisi yanlış
- Namespace farkı

## Teşhis sırası

1. Tam sembol adını okuyun.
2. Tanımın object dosyaya derlenip derlenmediğini kontrol edin.
3. nm veya dumpbin ile kütüphane sembollerini inceleyin.

## Düzeltme yaklaşımları

- Kaynak dosyayı hedefe ekleyin.
- Bildirim ve tanımı birebir eşleştirin.
- Doğru mimari ve bağlama sırasını kullanın.

## Hatalı örnek

```c++

```

## Düzeltilmiş örnek

```c++

```

---
Canonical: https://kutarya.com/hatalar/cpp-undefined-reference
