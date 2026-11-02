---
title: "Kararlı kimlikli Unity envanter sistemi"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/unity-envanter"
publisher: "Kutarya"
language: "tr-TR"
category: "Oyun"
---

# Kararlı kimlikli Unity envanter sistemi

ScriptableObject tanımı, çalışma zamanı yığını ve kayıt verisini birbirine karıştırmayan envanter çekirdeği.

**Kategori:** Oyun
**Teknoloji yığını:** C#, Unity
**Seviye:** Orta
**Okuma süresi:** 22 dk

## Sonuç

Öğe ekleyen, yığın sınırını koruyan ve liste sırası değişse bile kayıtları doğru öğeye bağlayan sistem.

## Ön koşullar

- Unity 6 veya güncel LTS
- C# sınıf ve koleksiyon temeli
- ScriptableObject bilgisi

## Dosya ağacı

```text
Assets/Game/Inventory/
  ItemDefinition.cs
  InventorySlot.cs
  Inventory.cs
```

## Kurulum

1. Assets/Game/Inventory klasörünü oluştur.
2. ItemDefinition varlıklarını Create menüsünden üret.
3. Inventory bileşenini oyuncu nesnesine ekle.
4. EditMode testleriyle yığın kurallarını doğrula.

## ItemDefinition.cs

Kayıt dosyası Unity liste sırasını değil değişmeyen string kimliği kullanır.


```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "Game/Item Definition")]
public sealed class ItemDefinition : ScriptableObject
{
    [SerializeField] private string stableId;
    [SerializeField] private string displayName;
    [SerializeField, Min(1)] private int maxStack = 1;

    public string StableId => stableId;
    public string DisplayName => displayName;
    public int MaxStack => maxStack;
}
```

## InventorySlot.cs

Yığın değişikliği tek sınıfta tutulur. Boş ve dolu slota ekleme yolları ayrıdır; ikisi de kalan miktarı döndürür.


```csharp
using System;

[Serializable]
public sealed class InventorySlot
{
    public ItemDefinition Item { get; private set; }
    public int Count { get; private set; }

    public int FillExisting(ItemDefinition item, int amount)
    {
        if (Item != item || amount <= 0) return amount;
        var accepted = Math.Min(amount, item.MaxStack - Count);
        Count += accepted;
        return amount - accepted;
    }

    public int FillEmpty(ItemDefinition item, int amount)
    {
        if (Item != null || amount <= 0) return amount;
        Item = item;
        var accepted = Math.Min(amount, item.MaxStack);
        Count = accepted;
        return amount - accepted;
    }
}
```

## Inventory.cs

Add işlemi önce mevcut yığını doldurur, kalan miktarı yeni slotlara dağıtır ve sığmayan miktarı çağırana döndürür.


```csharp
using System.Collections.Generic;

public sealed class Inventory
{
    private readonly List<InventorySlot> slots;

    public Inventory(int capacity)
    {
        slots = new List<InventorySlot>(capacity);
        for (var i = 0; i < capacity; i++) slots.Add(new());
    }

    public int Add(ItemDefinition item, int amount)
    {
        if (item == null || amount <= 0) return amount;

        foreach (var slot in slots)
            amount = slot.FillExisting(item, amount);
        foreach (var slot in slots)
            amount = slot.FillEmpty(item, amount);

        return amount;
    }
}
```

## Çalışma kontrolleri

1. Maksimum yığın aşılamamalı
2. Dolu envanter kalan miktarı doğru döndürmeli
3. Aynı görünen ama farklı stableId öğeler karışmamalı
4. Kayıt yükleme bilinmeyen kimliği açıkça raporlamalı

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| Kayıt sonrası yanlış öğe geliyor | Öğe kimliği olarak liste indeksi kullanıldı. | Varlık sırasını değiştirip kayıt testini tekrarla. | Kalıcı stableId kullan ve benzersizliği editörde doğrula. |
| MissingReferenceException | Yok edilen Unity nesnesi çalışma zamanı modelinde tutuluyor. | Referansın ScriptableObject mı sahne nesnesi mi olduğunu kontrol et. | Kalıcı modelde sahne nesnesi tutma. |
| Yığın sınırı aşılıyor | UI ve model aynı miktarı ayrı ayrı değiştiriyor. | Tek Add çağrısının öncesi/sonrası miktarı yazdır. | Durumu yalnız Inventory sınıfı değiştirsin. |

## Genişletme noktaları

- Sürükle bırak UI bağlayıcısı
- Ekipman slotu kuralları
- Kayıt şema sürümü
- Editör stableId doğrulayıcısı

---
Canonical: https://kutarya.com/sistemler/unity-envanter
