---
title: "Bileşen betiği kayıp"
type: "error-record"
canonical: "https://kutarya.com/hatalar/unity-missing-script"
publisher: "Kutarya"
language: "tr-TR"
technology: "Unity"
---

# Bileşen betiği kayıp

**Hata mesajı:** `The referenced script on this Behaviour is missing`
**Teknoloji:** Unity
**Sınıf:** Varlık

Sahne veya prefab, artık çözülemeyen bir MonoBehaviour kimliğine başvurur.

## Olası nedenler

- Script silinmiş veya taşınmış meta dosyası kaybolmuş
- Sınıf adı ile dosya adı uyuşmuyor
- Derleme hatası türün yüklenmesini engelliyor

## Teşhis sırası

1. Console içindeki tüm derleme hatalarını önce temizleyin.
2. Prefab ve sahnelerde Missing Script bileşenini bulun.
3. Sürüm kontrolünden meta dosyasının GUID geçmişini karşılaştırın.

## Düzeltme yaklaşımları

- Doğru script ve meta dosyasını geri yükleyin.
- Bileşeni bilinçli olarak yeniden bağlayın.
- Meta dosyalarını sürüm kontrolünde tutun.

## Hatalı örnek

```unity

```

## Düzeltilmiş örnek

```unity

```

---
Canonical: https://kutarya.com/hatalar/unity-missing-script
