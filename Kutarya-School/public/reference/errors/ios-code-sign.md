---
title: "Kod imzalama başarısız"
type: "error-record"
canonical: "https://kutarya.com/hatalar/ios-code-sign"
publisher: "Kutarya"
language: "tr-TR"
technology: "iOS / Swift"
---

# Kod imzalama başarısız

**Hata mesajı:** `Code signing is required / No profiles for ... were found`
**Teknoloji:** iOS / Swift
**Sınıf:** Yayın

Uygulama kimliği, sertifika, takım ve provisioning profile eşleşmez.

## Olası nedenler

- Bundle identifier kayıtlı değil
- Yanlış Apple takım hesabı seçili
- Sertifikanın özel anahtarı yok
- Capability profile içinde etkin değil

## Teşhis sırası

1. Xcode Signing & Capabilities bölümündeki takım ve bundle kimliğini doğrulayın.
2. Keychain içinde sertifikanın özel anahtarla göründüğünü kontrol edin.
3. Archive günlüğündeki ilk signing hatasını okuyun.

## Düzeltme yaklaşımları

- Doğru takım ve benzersiz bundle identifier seçin.
- Gerekli capability’leri App ID ve profile üzerinde eşleştirin.
- CI için ayrı ve süreli imzalama kimliği yönetin.

## Hatalı örnek

```ios / swift

```

## Düzeltilmiş örnek

```ios / swift

```

---
Canonical: https://kutarya.com/hatalar/ios-code-sign
