---
title: "Dosya build context içinde bulunamadı"
type: "error-record"
canonical: "https://kutarya.com/hatalar/docker-build-context"
publisher: "Kutarya"
language: "tr-TR"
technology: "Docker"
---

# Dosya build context içinde bulunamadı

**Hata mesajı:** `COPY failed: file not found in build context`
**Teknoloji:** Docker
**Sınıf:** Derleme

Dockerfile içindeki kaynak yol, seçilen build context veya .dockerignore nedeniyle gönderilmez.

## Olası nedenler

- docker build yanlış klasörden çalıştırıldı
- COPY yolu context dışına çıkıyor
- .dockerignore dosyayı hariç tutuyor
- Dosya adı büyük küçük harfle uyuşmuyor

## Teşhis sırası

1. docker build komutundaki son context yolunu kontrol edin.
2. .dockerignore eşleşmelerini inceleyin.
3. Context kökünden kaynak dosyaya giden gerçek yolu doğrulayın.

## Düzeltme yaklaşımları

- Build komutunu doğru context ile çalıştırın.
- COPY yolunu context köküne göre yazın.
- Gerekli dosya için dar kapsamlı ignore istisnası ekleyin.

## Hatalı örnek

```docker

```

## Düzeltilmiş örnek

```docker

```

---
Canonical: https://kutarya.com/hatalar/docker-build-context
