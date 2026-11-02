---
title: "Sonsuz render döngüsü"
type: "error-record"
canonical: "https://kutarya.com/hatalar/react-too-many-renders"
publisher: "Kutarya"
language: "tr-TR"
technology: "React"
---

# Sonsuz render döngüsü

**Hata mesajı:** `Too many re-renders. React limits the number of renders`
**Teknoloji:** React
**Sınıf:** Arayüz

Render sırasında tekrar state güncellendiği için bileşen kendini durmadan yeniden çizer.

## Olası nedenler

- Setter fonksiyonunun render gövdesinde çağrılması
- onClick alanına fonksiyon yerine çağrı sonucunun verilmesi
- Her renderda değişen bağımlılıkla çalışan effect

## Teşhis sırası

1. React DevTools Profiler ile tekrar sayısını görün.
2. Bileşen gövdesindeki set ile başlayan çağrıları arayın.
3. Effect bağımlılıklarının her renderda yeni nesne olup olmadığını kontrol edin.

## Düzeltme yaklaşımları

- State değişimini olay işleyiciye veya doğru bağımlılıklı effect içine taşıyın.
- Türetilmiş değeri ayrı state yerine render sırasında hesaplayın.
- Nesne bağımlılıklarını yalnız gerekliyse useMemo ile kararlı tutun.

## Hatalı örnek

```react
return <button onClick={setAcik(true)}>Aç</button>;
```

## Düzeltilmiş örnek

```react
return <button onClick={() => setAcik(true)}>Aç</button>;
```

---
Canonical: https://kutarya.com/hatalar/react-too-many-renders
