---
title: "CSS Grid ile Sağlam Sayfa Düzeni"
type: "technical-article"
canonical: "https://kutarya.com/konu/css/grid"
publisher: "Kutarya"
language: "tr-TR"
technology: "CSS"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# CSS Grid ile Sağlam Sayfa Düzeni

CSS Grid track modeli, fr birimi, minmax(), auto-fit/auto-fill ve taşma davranışının sayfa düzenine etkisi.

**Canonical:** https://kutarya.com/konu/css/grid
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** CSS
**Referans kapsamı:** Güncel CSS Grid Layout ve minmax() web platformu davranışı.

## Özet

CSS Grid iki boyutlu yerleşim sistemidir. Sütun ve satır ilişkisini açık tanımlamak, karmaşık margin hesapları veya sabit piksel kart genişliklerinden daha dayanıklı düzenler kurmayı sağlar.

Grid, iki boyutlu yerleşimde satır ve sütunları ayrı ayrı tanımlayabilen bir layout modelidir. Ancak responsive davranış yalnız kolon sayısını değiştirmekten ibaret değildir; track minimumları ve içerik minimum genişliği taşmanın temel belirleyicisidir.

Makale özellikle minmax(0, 1fr), auto-fit ve içerik kaynaklı minimum boyutların beklenmeyen yatay taşma üretmesi gibi üretimde sık görülen ayrıntılara odaklanır.

## Kapsam maddeleri

- Grid container ve track modelini anlamak
- fr ve minmax kullanımını seçmek
- Responsive grid kurmak
- Taşma ve min-width sorunlarını teşhis etmek

## Temel kavramlar

### Track

Grid içindeki satır veya sütun şerididir; px, fr, minmax gibi boyutlarla tanımlanabilir.

### fr

Kullanılabilir alanın payını temsil eder; içerik minimumları yine sonucu etkileyebilir.

### auto-fit

Uygun sayıda track’i mevcut genişliğe göre otomatik yerleştirmede sık kullanılan repeat seçeneğidir.

## Teknik açıklama

### Grid’de görünmeyen minimum içerik kuralını bil

1fr “her koşulda eşit parçaya böl” gibi görünse de grid item’ın min-content genişliği track’in küçülmesini engelleyebilir. Uzun bir kod, URL veya nowrap metin beklenmedik yatay taşma oluşturabilir.

minmax(0, 1fr) ve child üzerinde min-width: 0 bu tür layout hatalarında sık kullanılan araçlardır.

- 1fr minimumu sıfır demek değildir.
- Uzun içerikle layout test et.
- Overflow’u semptom olarak değil kök nedenle çöz.

### auto-fit ve media query farklı problemleri çözer

Kart sayısını mevcut alana göre otomatik ayarlamak için auto-fit/minmax yeterli olabilir. Tasarımın yapısal davranışı — örneğin sidebar’ın drawer’a dönüşmesi — değişiyorsa media veya container query hâlâ gerekir.

Responsive tasarımı yalnız breakpoint listesi olarak görmek yerine hangi bileşenin hangi alanda kırıldığını gözlemle.

- Basit akış için intrinsic layout kullan.
- Yapısal değişimde query kullan.
- Breakpoint’i cihaz adına göre seçme.

### Grid alanlarını isimlendirmek okunabilirliği artırabilir

Karmaşık sayfa kabuğunda grid-template-areas, magic column numaraları yerine header/sidebar/main gibi niyeti gösterebilir. Ancak küçük grid’de aşırı isimlendirme gereksiz olabilir.

Layout kuralı değiştiğinde CSS’in tek yerde okunabilir kalması bakım maliyetini azaltır.

- Karmaşık shell’de alan isimlerini düşün.
- Basit grid’i gereksiz soyutlama.
- DOM sırasını erişilebilirlik için mantıklı tut.

## Teknik iddialar ve kaynak notları

### Grid track modeli

CSS Grid satır ve sütunlardan oluşan iki boyutlu bir yerleşim modeli sağlar. Track boyutları sabit uzunluklar, fr birimleri ve minmax gibi fonksiyonlarla tanımlanabilir. auto-fit/auto-fill ile tekrar eden kolon yapısı kullanılabilir alan ve minimum içerik ölçütüne göre uyarlanabilir.

**Birincil referans:** [1], [2]

### minmax davranışı

minmax minimum ve maksimum track boyutunu birlikte ifade eder. repeat(auto-fit, minmax(...)) kalıbı sabit breakpoint listesi olmadan esnek kart ızgaraları kurabilir; ancak minimum değerin gerçek içerik gereksiniminden küçük seçilmesi metin taşmasına veya aşırı sıkışmaya yol açabilir.

**Birincil referans:** [2]

## Sınır durumları

- Grid item’ın varsayılan min-width:auto davranışı uzun içerikte track’in beklenenden geniş kalmasına neden olabilir.
- auto-fit boş track’leri collapse ederken auto-fill yer ayırmaya devam edebilir.
- Implicit grid, tanımlanmayan satır/sütunlara item yerleştiğinde otomatik track üretebilir.
- Source order erişilebilirlik/tab sırası için önemini korur; yalnız görsel grid yerleşimi DOM sırasını değiştirmez.

## Uygulama vakası

### Uzun başlıklı kartın grid kolonunu taşırması

**Bağlam**

Kart listesi `repeat(3, 1fr)` ile düzgündür ancak bir kartta kesintisiz uzun URL bulunur. Grid item’ın min-content davranışı nedeniyle kolon beklenen genişliğin altına küçülemez ve sayfa yatay taşar. Sadece kısa örnek verilerle yapılan test bunu göstermez.

**Teknik analiz**

Layout DevTools ile item’ın min-width davranışı incelenir. Gerekli bileşende `min-width: 0`, overflow/wrapping politikası ve `minmax(0,1fr)` gibi track seçimi değerlendirilir. Çözüm içerik kaybı yaratmadan gerçek worst-case metinle doğrulanır.

**Beklenen sonuç**

Grid farklı container genişliklerinde ve uzun içerik fixture’larıyla görsel regresyon testine alınır. Yatay overflow metriği/otomatik kontrol eklenir.

### İzlenecek sinyaller

- Horizontal overflow kontrolü
- Track computed size
- Min-content üreten öğeler
- Container genişliği kırılma noktaları

## Kod ve çalışma akışı

### Kırılma noktası olmadan kart grid’i


```css
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 1rem;
}

.resource-card {
  min-width: 0;
  padding: 1rem;
  border: 1px solid #d8e0e8;
}
```

1. auto-fit uygun kart sayısını otomatik seçer.
2. minmax minimum kart genişliğini ve büyüyebilmesini tanımlar.
3. min(100%, 260px) dar container’da taşmayı önler.
4. Kartta min-width: 0 uzun içeriğin grid taşmasını azaltır.

## Tasarım seçenekleri

### Flexbox

Tek eksenli dağıtım ve içerik boyutuna göre satır akışı için genellikle daha doğaldır.

### Container queries

Bileşen davranışı viewport yerine kendi container genişliğine göre değişecekse kullanılabilir.

## Arıza biçimleri

### Grid yatay taşıyor

- **Olası neden:** Track minimumu veya child min-content genişliği container’dan büyük kalıyor.
- **Teşhis / düzeltme:** minmax(0, 1fr), min-width:0 ve uzun içerik davranışını kontrol et.

### 1fr sütun eşit görünmüyor

- **Olası neden:** İçerik minimumları track’in küçülmesini engelliyor olabilir.
- **Teşhis / düzeltme:** minmax(0, 1fr) kullanarak minimumu açıkla.

## Üretim ve işletim notları

- Minimum track genişliğini gerçek içerikle test et.
- Taşan itemlarda min-width:0 gereksinimini kontrol et.
- Görsel sıralamayı CSS order/grid placement ile DOM anlamından koparma.
- Layout kırılmalarını yalnız birkaç viewport ölçüsünde değil container aralıklarında test et.

## Birincil referanslar

1. [MDN — CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
2. [MDN — minmax()](https://developer.mozilla.org/en-US/docs/Web/CSS/minmax)

## Doğrulama senaryoları

- Sidebar + content için iki sütunlu grid kur.
- auto-fit kart grid’ini 220/320 px minimumlarla karşılaştır.
- Uzun URL ekleyip taşmayı düzelt.

## Üretim kontrol listesi

- [ ] Grid iki boyutlu ihtiyaç için seçilmiş.
- [ ] Track minimumları bilinçli.
- [ ] Child overflow test edilmiş.
- [ ] Mobilde sabit genişlik taşmıyor.

---
Bu dosya https://kutarya.com/konu/css/grid sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
