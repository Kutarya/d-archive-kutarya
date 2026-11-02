---
title: "Anlamlı HTML ve Sayfa İskeleti"
type: "technical-article"
canonical: "https://kutarya.com/konu/html/moduller"
publisher: "Kutarya"
language: "tr-TR"
technology: "HTML"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Anlamlı HTML ve Sayfa İskeleti

Semantik HTML belge yapısı, landmark bölgeleri, başlık hiyerarşisi, yerel etkileşim denetimleri ve erişilebilirlik ilişkileri.

**Canonical:** https://kutarya.com/konu/html/moduller
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** HTML
**Referans kapsamı:** Güncel HTML element semantiği ve web erişilebilirliği referansları.

## Özet

HTML görünüm değil anlam katmanıdır. Doğru etiket tarayıcıya, arama motoruna ve yardımcı teknolojiye içeriğin ne olduğunu söyler; CSS daha sonra bu yapının görünümünü belirler.

HTML’in temel görevi görünümü değil içeriğin anlamını tanımlamaktır. Doğru landmark, başlık ve etkileşim öğeleri tarayıcıya, arama motoruna ve yardımcı teknolojilere sayfanın yapısını doğrudan aktarır.

button yerine tıklanabilir div veya label yerine placeholder kullanmak kısa vadede aynı görünebilir; ancak klavye davranışı, erişilebilir ad ve form ilişkileri gibi yerel tarayıcı özellikleri kaybolur.

## Kapsam maddeleri

- Doğru semantik etiketi seçmek
- Başlık hiyerarşisini korumak
- Form alanlarını etiketlemek
- Klavye ve ekran okuyucu akışını iyileştirmek

## Temel kavramlar

### Landmark bölgeleri

header, nav, main, aside ve footer sayfanın büyük bölgelerini tanımlar.

### Başlık hiyerarşisi

Başlık seviyesi yazı boyuna göre değil, belge içindeki derinliğe göre seçilir.

### Yerel denetimler

button, input ve select erişilebilir davranışları hazır getirir; tıklanabilir div bunları getirmez.

## Teknik açıklama

### Semantik HTML tarayıcıya niyet verir

header, nav, main, article ve button yalnız görünüm için isimler değildir. Tarayıcı ve yardımcı teknolojiler bu öğelerden belgenin yapısını ve etkileşim türünü çıkarır. Bir div’e click eklemek görsel olarak buton üretebilir ama klavye davranışı, odaklanabilirlik ve varsayılan semantik otomatik gelmez.

Bu yüzden ilk tercih, mevcut native HTML öğesini doğru amacıyla kullanmaktır. ARIA native semantiğin yerine geçen genel bir sihirli katman değil, eksik semantik gerektiğinde ek bilgi sağlayan araçtır.

- Önce native HTML öğesini ara.
- Etkileşim türünü doğru elementle ifade et.
- ARIA’yı gereksiz yere native semantiğin üstüne yığma.

### Başlık hiyerarşisi görsel boyuttan bağımsızdır

h1-h6 seviyeleri yazı büyüklüğünü değil belge yapısındaki seviyeyi ifade eder. Tasarım için CSS kullan; başlık seviyesini yalnız daha küçük görünsün diye değiştirme. Doğru hiyerarşi hem ekran okuyucu gezinmesini hem uzun sayfada anlaşılabilirliği iyileştirir.

Bir kart koleksiyonunda her kartın h2 olması mantıklı olabilir; kart içindeki alt başlıklar h3 olur. Seviye seçimini sayfanın tamamındaki bağlama göre yap.

- Başlık seviyesini yapıya göre seç.
- Görünümü CSS ile kontrol et.
- Uzun sayfada bölüm başlıklarını anlamlı yaz.

### Formlarda görünür etiket ve hata ilişkisi kur

Placeholder alanın amacı için ipucu olabilir fakat label yerine geçmez; kullanıcı yazmaya başladığında kaybolur. Görünür label, hem kullanılabilirlik hem erişilebilir ad açısından daha güvenlidir.

Hata mesajı yalnız kırmızı renk olmamalı. Alanla programatik ilişki kurmak, metinde neyin yanlış olduğunu ve nasıl düzeltileceğini söylemek gerekir. Zorunlu alanları yalnız yıldız işaretiyle anlatmak yerine metinsel anlam da ver.

- Her input için kalıcı label sağla.
- Hata mesajını alanla ilişkilendir.
- Rengi tek bilgi taşıyıcısı yapma.

## Teknik iddialar ve kaynak notları

### Semantik elementler bilgi mimarisidir

HTML element seçimi yalnız stil hook’u değildir. main, nav, article, section, heading, button ve form kontrolleri belgenin yapısını tarayıcıya ve yardımcı teknolojilere aktarır. Yerel semantiğe sahip element kullanmak, aynı davranışı div + ARIA ile yeniden kurmaktan genellikle daha güvenilir bir başlangıçtır.

**Birincil referans:** [1], [2]

### Erişilebilir ad ve etkileşim davranışı

button ve a gibi yerel interactive elementler klavye odağı, aktivasyon ve rol davranışlarını hazır taşır. Tıklanabilir div aynı görünümü sağlayabilir fakat klavye ve erişilebilir ad davranışını ayrıca yeniden uygulamak gerekir; eksik uygulama kullanıcı gruplarını doğrudan etkiler.

**Birincil referans:** [1]

## Sınır durumları

- section elementinin her kullanımı otomatik landmark oluşturmaz; çoğu durumda erişilebilir ad/heading bağlamı gerekir.
- Heading seviyelerini yalnız font boyutu için seçmek doküman outline mantığını bozar.
- aria-label görünür label’ın yerini gereksiz yere almamalıdır.
- role eklemek elementin tüm klavye ve durum davranışını otomatik uygulamaz.

## Uygulama vakası

### Tıklanabilir div tabanlı menünün klavye ile çalışmaması

**Bağlam**

Tasarım sistemi tüm aksiyonları `div onClick` ile üretir. Fare ile çalışan menü Tab tuşuyla odaklanamaz ve Enter/Space ile etkinleşmez. Sonradan role="button" eklenir fakat focus, keyboard activation ve disabled semantiği hâlâ manuel kalır.

**Teknik analiz**

Eylem için native button, navigasyon için a öğesi kullanılır. Görsel stil elementten bağımsız CSS ile korunur. ARIA yalnız native semantik eksik olduğunda eklenir. Heading ve landmark yapısı da aynı sayfada bilgi mimarisine göre düzenlenir.

**Beklenen sonuç**

Keyboard-only ve accessibility tree testleri design system CI kontrolüne eklenir. Yeni bileşenler native element seçimi açısından review checklist’inden geçer.

### İzlenecek sinyaller

- Keyboard reachable interactive öğe oranı
- Axe/accessibility test ihlalleri
- Focus görünürlüğü
- Native element yerine role kullanan bileşen sayısı

## Kod ve çalışma akışı

### Erişilebilir kaynak kartı


```html
<article aria-labelledby="oop-baslik">
  <header>
    <p>C# · Orta seviye</p>
    <h2 id="oop-baslik">Nesne yönelimli programlama</h2>
  </header>

  <p>Sorumluluk, kapsülleme ve bileşim örnekleri.</p>

  <a href="/konu/csharp/oop">
    Konuyu aç <span aria-hidden="true">→</span>
  </a>
</article>
```

1. article bağımsız anlam taşıyan içeriği belirtir.
2. aria-labelledby kartın erişilebilir adını görünür başlıktan alır.
3. Gezinme için button yerine gerçek bağlantı kullanılır.
4. Süs oku ekran okuyucudan gizlenir.

## Tasarım seçenekleri

### section

Sayfanın tematik bir bölümünü ve genellikle kendi başlığını içerir.

### div

Semantik karşılığı olmayan yalnız düzenleme gruplarında uygundur.

## Arıza biçimleri

### Form alanının erişilebilir adı yok

- **Olası neden:** Placeholder, label yerine kullanılmıştır.
- **Teşhis / düzeltme:** for ve id ile bağlı görünür label ekle.

### Buton klavyeyle çalışmıyor

- **Olası neden:** Click olayı div üzerine bağlanmıştır.
- **Teşhis / düzeltme:** Yerel button etiketi kullan; gerekli değilse rol ve klavye davranışını elle taklit etme.

## Üretim ve işletim notları

- Önce doğru native element kullan, ARIA’yı eksik semantiği tamamlamak için ekle.
- DOM sırası ile görsel sıra arasındaki farkı klavye gezinmesinde doğrula.
- Başlık hiyerarşisini sayfanın bilgi mimarisine göre kur.
- Etkileşimli öğelerde focus görünürlüğü ve klavye aktivasyonunu regresyon testine ekle.

## Birincil referanslar

1. [MDN — HTML: a good basis for accessibility](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML)
2. [MDN — HTML elements reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements)

## Doğrulama senaryoları

- Bir blog sayfasını landmark bölgelerine ayır.
- Hatalı formu label ve fieldset ile düzelt.
- Yalnız klavyeyle bütün etkileşimleri dene.

## Üretim kontrol listesi

- [ ] Sayfada tek bir ana içerik bölgesi var.
- [ ] Başlık seviyeleri atlanmıyor.
- [ ] Etkileşimlerde yerel HTML denetimleri kullanılıyor.
- [ ] Her form alanının görünür etiketi var.
- [ ] Görsel olmayan içerik için doğru alternatif sağlanmış.

---
Bu dosya https://kutarya.com/konu/html/moduller sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
