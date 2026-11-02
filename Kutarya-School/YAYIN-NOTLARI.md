# Kutarya Teknik Kaynak v1.0.0 — Final Yayın Notları

Bu sürüm, Kutarya'nın eski AI ürün kimliğinden tamamen ayrılarak Türkçe yazılım ve bilgisayar bilimi için kaynaklandırılmış teknik yayın olarak konumlandığı ilk final sürümdür.

## Yayın yapısı

- 25 kaynaklandırılmış ayrıntılı teknik makale
- 51 teşhis/hata kaydı
- 6 sistem mimarisi ve uygulama rehberi
- 41 dil/teknoloji dizini
- 24 yazılım alanı
- 826 katalog konu yolu
- 153 indekslenebilir web sayfası

Katalog notları teknik makalelerden açık biçimde ayrılır ve ayrıntılı yayın statüsünde olmayan sayfalar `noindex` olarak tutulur.

## Kaynaklandırma ve güven katmanı

- Teknik makalelerde yayın ve son güncelleme tarihi bulunur.
- Birincil dokümantasyon bağlantıları numaralı referans olarak gösterilir.
- Teknik iddialar kaynak notlarıyla birincil referanslara bağlanır.
- Sürüm/kapsam, sınır durumları, üretim etkileri ve doğrulama senaryoları ayrı bölümlerde tutulur.
- İçerik sınıfları `reference-article`, `diagnostic-record` ve `implementation-guide` olarak makine dizininde ayrıştırılır.
- Yalnız birincil referans zinciri bulunan teknik makaleler `citation_ready: true` olarak işaretlenir.

## Makine-okunabilir yayın

Build sırasında aşağıdaki kaynaklar üretilir:

- `/llms.txt`
- `/content-index.json`
- `/feed.xml`
- `/sitemap.xml`
- `/reference/articles/**/*.md`
- `/reference/errors/*.md`
- `/reference/systems/*.md`

`robots.txt`, genel tarayıcılara ve araştırma botlarına açık erişim sağlayacak şekilde hazırlanmıştır. Canonical insan sayfası ana yayındır; `/reference` altındaki Markdown dosyaları aynı içeriğin ayrıştırılabilir karşılığıdır.

## Ürün arayüzü

Ana bilgi mimarisi dört ana girişe ayrılır:

1. Teknik makaleler
2. Hata kayıtları
3. Sistem rehberleri
4. Teknoloji kataloğu

Kod laboratuvarı ve demo/deneme akışları final üründen çıkarılmıştır. Eski `/deneme` ve `/ornekler` yolları teknik makale dizinine yönlendirilir.

## İçerik kalite kontrolü

`npm run validate:content` aşağıdaki bütünlük kontrollerini uygular:

- ayrıntılı makale yapısı
- kaynak URL'leri
- uzun anlatım bölümleri
- kaynak notları ve referans indeksleri
- uygulama vakaları
- gözlemlenebilirlik/üretim notları
- katalog ve sistem veri bütünlüğü

Final doğrulama sonucu: **41 dil, 24 alan, 41 uzmanlık yolu, 826 konu yolu, 25 ayrıntılı makale, 51 hata kaydı, 6 sistem rehberi ve 17 sistem kaynak dosyası.**

## Yerel çalıştırma

```bash
npm ci
npm run dev
```

Production kontrolü:

```bash
npm run build
npm run preview
```

Build çıktısı `dist/` klasöründe oluşur. Release arşivine `node_modules/` ve `dist/` dahil edilmez.
