---
title: "Responsive Tasarım: Breakpoint Değil İçerik Odaklı Yaklaşım"
type: "technical-article"
canonical: "https://kutarya.com/konu/css/responsive"
publisher: "Kutarya"
language: "tr-TR"
technology: "CSS"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# Responsive Tasarım: Breakpoint Değil İçerik Odaklı Yaklaşım

Responsive arayüzlerde mobile-first CSS, içerik tabanlı breakpoint, akışkan boyutlandırma ve container query kararları.

**Canonical:** https://kutarya.com/konu/css/responsive
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** CSS
**Referans kapsamı:** Güncel CSS media/container query ve responsive tasarım davranışı.

## Özet

Responsive tasarım “telefon, tablet, masaüstü” için üç sabit ekran çizmek değildir. Amaç içerik ve etkileşimin mevcut alanda bozulmadan kalmasını sağlamaktır.

Responsive tasarımın amacı belirli cihaz isimlerini hedeflemek değil, içerik ve bileşenler için kullanılabilir düzen aralıkları tanımlamaktır. Sabit “telefon/tablet/masaüstü” eşikleri zamanla gerçek içerik gereksiniminden kopabilir.

Container query, bileşenin viewport yerine yerleştirildiği kapsayıcıya göre davranmasını sağlar; özellikle yeniden kullanılabilir kart ve panel sistemlerinde media query bağımlılığını azaltabilir.

## Kapsam maddeleri

- Mobile-first yaklaşımı uygulamak
- İçeriğe göre breakpoint seçmek
- Akışkan boyutları kullanmak
- Container query ihtiyacını ayırmak

## Temel kavramlar

### Mobile-first

Temel stil dar alanda çalışır, daha geniş alan için min-width koşullarıyla geliştirilir.

### Fluid sizing

%, fr, clamp ve max-width gibi araçlar sabit breakpoint aralığında bile akışkan davranış sağlar.

### Container query

Bileşenin viewport yerine yerleştirildiği container’a göre uyarlanmasını sağlar.

## Teknik açıklama

### Responsive tasarımın ilk testi yatay overflow’dur

Bir sayfa küçük ekranda yatay kayıyorsa çoğu zaman gerçek problem belirli bir child’ın minimum genişliği, sabit width’i veya uzun içeriğidir. body { overflow-x:hidden } eklemek yalnız hatayı görünmez yapar.

DevTools’ta taşan elementi bulmak, sonra width/min-width/white-space/grid minimumlarını incelemek daha güvenilir çözümdür.

- Overflow’u gizleyerek düzeltme.
- Taşan elementi doğrudan bul.
- Gerçek içerikle test et.

### Breakpoint’i cihaz kataloglarından seçme

Yeni ekran boyutları sürekli çıkar. 768 px “tablet” olduğu için breakpoint koymak yerine layout’un artık rahat görünmediği noktayı seçmek tasarımı daha uzun ömürlü yapar.

Bu yaklaşım breakpoint sayısını azaltır ve tasarımı cihaz markalarından bağımsız kılar.

- İçerik bozulduğu yerde kır.
- Az ve anlamlı breakpoint kullan.
- Ara genişlikleri de test et.

### Responsive sadece genişlik değildir

Klavye kullanımı, zoom, kullanıcı font büyüklüğü, reduced motion ve pointer türü de deneyimi etkiler. Görsel düzen daralmıyor diye arayüz otomatik olarak erişilebilir sayılmaz.

Özellikle sabit header, modal ve yatay scroller gibi bileşenleri klavye ve %200 zoom ile denemek yararlıdır.

- %200 zoom test et.
- Keyboard focus görünürlüğünü koru.
- Motion ve pointer tercihlerini düşün.

## Teknik iddialar ve kaynak notları

### İçerik odaklı responsive tasarım

Responsive tasarım viewport boyutuna göre akışkan ölçüler, flexible layout ve media query’leri bir arada kullanır. Breakpoint’in belirli cihaz modeli yerine içeriğin artık okunamaz veya işlevsiz olduğu noktada seçilmesi, tasarımı yeni ekran ölçülerine karşı daha dayanıklı kılar.

**Birincil referans:** [1]

### Container query

Container query bileşenin stilini viewport yerine belirli bir kapsayıcının boyut veya özelliklerine göre değiştirebilir. Bu, aynı kart/panel bileşeninin ana içerik, yan panel veya farklı embed alanlarında yeniden kullanılmasını kolaylaştırır.

**Birincil referans:** [2]

## Sınır durumları

- Viewport meta etiketi olmadan mobil tarayıcı layout viewport davranışı responsive sonucu değiştirebilir.
- Sadece px breakpoint kullanmak tek başına hatalı değildir; sorun breakpoint’in cihaz listesine sabitlenmesidir.
- Container query için uygun containment/container-type sınırı tanımlanmalıdır.
- Responsive görünümde yalnız genişlik değil klavye, dokunma hedefi, zoom ve metin büyütme davranışı da kontrol edilmelidir.

## Uygulama vakası

### Cihaz adına göre breakpoint tasarımının çökmesi

**Bağlam**

Arayüz 768px “tablet” ve 1024px “desktop” eşikleriyle tasarlanır. Yan panel içine gömülen aynı kart 900px viewport içinde yalnız 420px alan bulur fakat desktop stilini koruduğu için içerik sıkışır. Problem viewport doğruyken container’ın dar olmasıdır.

**Teknik analiz**

Kartın kendi kullanılabilir alanına bağlı davranışları container query’ye taşınır; sayfa düzeyi navigasyon gibi gerçekten viewport’a bağlı kararlar media query olarak kalır. Breakpoint cihaz listesine değil içerik kırılmasına göre seçilir.

**Beklenen sonuç**

Bileşen ana grid, modal ve sidebar içinde aynı test matrisiyle doğrulanır. Tasarım sistemi breakpoint yerine bileşen ölçü sınırlarını dokümante eder.

### İzlenecek sinyaller

- Container width aralıkları
- Metin wrap/sıkışma eşiği
- 200% zoom taşmaları
- Dokunma hedefi boyutları

## Kod ve çalışma akışı

### Akışkan içerik kabuğu ve tipografi


```css
.page {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}

.page h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}

@media (min-width: 52rem) {
  .layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 2rem;
  }
}
```

1. Container ekranı aşmadan maksimum genişlikte kalır.
2. clamp başlığı alt/üst sınırlar arasında akışkan büyütür.
3. Sidebar ancak yeterli alan olduğunda iki sütuna geçer.
4. Ana sütunda minmax(0, 1fr) taşmayı önlemeye yardım eder.

## Tasarım seçenekleri

### Container query

Aynı kart farklı sayfa bölgelerinde farklı genişlik alıyorsa viewport query yerine bileşen odaklı çözüm olabilir.

### Intrinsic layout

flex-wrap, grid auto-fit ve minmax ile bazı responsive davranışlar breakpoint olmadan kurulabilir.

## Arıza biçimleri

### Mobilde yatay kaydırma

- **Olası neden:** Sabit genişlik, min-content veya taşan medya elemanı viewport’u genişletiyor.
- **Teşhis / düzeltme:** Overflow’u gizlemeden önce hangi elemanın genişliği aştığını DevTools ile bul.

### Breakpoint sayısı sürekli artıyor

- **Olası neden:** Her cihaz modeli için ayrı düzeltme yapılmıştır.
- **Teşhis / düzeltme:** Breakpoint’i içerik gerçekten bozulduğu noktada tanımla.

## Üretim ve işletim notları

- Önce doğal document flow ve esnek ölçülerle çöz; media query’yi gerçekten kırılan noktada ekle.
- Bileşenleri dar/geniş container içinde ayrı test et.
- Sabit yükseklik ve overflow:hidden ile içerik kaybı üretme.
- 200% zoom ve uzun yerelleştirilmiş metinle kritik ekranları doğrula.

## Birincil referanslar

1. [MDN — Responsive design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
2. [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)

## Doğrulama senaryoları

- Bir sidebar düzenini tek breakpoint ile mobile-first kur.
- Başlık boyutunu clamp ile akışkan yap.
- Bir kartı container query ile dar/geniş varyanta geçir.

## Üretim kontrol listesi

- [ ] 320 px civarında yatay taşma yok.
- [ ] Zoom ve büyük font test edilmiş.
- [ ] Breakpoint cihaz adına bağlı değil.
- [ ] Tıklama hedefleri dar ekranda kullanılabilir.
- [ ] Metin satır uzunluğu okunabilir.

---
Bu dosya https://kutarya.com/konu/css/responsive sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
