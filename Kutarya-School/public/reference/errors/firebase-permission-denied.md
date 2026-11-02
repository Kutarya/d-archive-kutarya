---
title: "Firestore erişimi reddedildi"
type: "error-record"
canonical: "https://kutarya.com/hatalar/firebase-permission-denied"
publisher: "Kutarya"
language: "tr-TR"
technology: "Firebase"
---

# Firestore erişimi reddedildi

**Hata mesajı:** `FirebaseError: Missing or insufficient permissions`
**Teknoloji:** Firebase
**Sınıf:** Yetki

İstek, yayımlanmış Firestore güvenlik kurallarındaki kimlik veya veri koşulunu karşılamaz.

## Olası nedenler

- Kullanıcı oturum açmamış
- UID ile belge sahibi uyuşmuyor
- Kural yeni alanı doğrulamıyor
- Yerel emulator ile canlı rules farklı

## Teşhis sırası

1. İstekteki auth.uid ve belge yolunu kaydedin.
2. Rules Playground veya emulator testinde aynı veriyle kuralı çalıştırın.
3. Canlı projede yayımlı ruleset sürümünü doğrulayın.

## Düzeltme yaklaşımları

- Kuralı en az yetkiyle gerçek veri sözleşmesine göre düzeltin.
- İstemcideki oturum hazır olmadan sorgu başlatmayın.
- Kuralları emulator testleriyle sürüm kontrolüne alın.

## Hatalı örnek

```firebase

```

## Düzeltilmiş örnek

```firebase

```

---
Canonical: https://kutarya.com/hatalar/firebase-permission-denied
