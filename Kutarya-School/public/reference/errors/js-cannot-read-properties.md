---
title: "Cannot read properties of undefined"
type: "error-record"
canonical: "https://kutarya.com/hatalar/js-cannot-read-properties"
publisher: "Kutarya"
language: "tr-TR"
technology: "JavaScript"
---

# Cannot read properties of undefined

**Hata mesajı:** `TypeError: Cannot read properties of undefined (reading '...')`
**Teknoloji:** JavaScript
**Sınıf:** Çalışma zamanı

Bir değişken beklenen nesne yerine undefined olduğunda üyesine erişilmeye çalışılır.

## Olası nedenler

- API yanıtı henüz gelmeden render yapılması
- Dizi içinde bulunamayan öğenin kullanılması
- Yanlış yazılmış özellik adı
- Opsiyonel alanın her zaman var sayılması

## Teşhis sırası

1. Stack trace içindeki kendi dosyanızdaki ilk satırı bulun.
2. Nesnenin tamamını ve typeof sonucunu erişimden hemen önce kaydedin.
3. Değerin nerede üretildiğini geriye doğru takip edin.

## Düzeltme yaklaşımları

- Veri sözleşmesini doğrulayın.
- Yükleniyor, boş ve hata durumlarını ayrı ele alın.
- Opsiyonel zinciri yalnız gerçekten opsiyonel alanlarda kullanın.

## Hatalı örnek

```javascript
const ad = kullanici.profil.ad;
```

## Düzeltilmiş örnek

```javascript
const ad = kullanici?.profil?.ad ?? "İsimsiz";
```

---
Canonical: https://kutarya.com/hatalar/js-cannot-read-properties
