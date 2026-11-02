# Kutarya Teknik Kaynak

Kutarya, Türkçe yazılım ve bilgisayar bilimi için herkese açık bir teknik başvuru kaynağıdır. Yayın; kaynaklandırılmış teknik makaleler, hata kayıtları, sistem mimarisi rehberleri ve programlama dili/alan katalogları içerir.

## Yayın modeli

İçerik üç sınıfa ayrılır:

- **Teknik makaleler:** Uzun anlatım, kod, arıza biçimleri, üretim kontrolü ve birincil referanslar içerir.
- **Hata kayıtları:** Belirti, olası neden, teşhis ve düzeltmeyi ayrı bölümlerde sunar.
- **Sistem rehberleri:** Dosya ağacı, kaynak kod, çalışma kontrolleri ve hata ayıklama noktalarını birlikte verir.

Katalogdaki kısa konu notları ayrıntılı makale sayılmaz ve arama motorlarına makale olarak indekslenmez.

## Makine-okunabilir yayın

Build sırasında aşağıdaki dosyalar otomatik üretilir:

- `public/content-index.json` — indekslenebilir içerik manifesti
- `public/llms.txt` — araştırma araçları için açık içerik giriş noktaları
- `public/feed.xml` — teknik makaleler için Atom feed
- `public/reference/articles/**` — teknik makalelerin Markdown kopyaları
- `public/reference/errors/**` — hata kayıtlarının Markdown kopyaları
- `public/reference/systems/**` — sistem rehberlerinin Markdown kopyaları
- `public/sitemap.xml` — indekslenebilir web sayfaları

Canonical insan sayfası her zaman `https://kutarya.com/...` adresidir. `/reference` altındaki dosyalar aynı içeriğin düz metin/makine-okunabilir karşılığıdır.

## Geliştirme

```bash
npm ci
npm run dev
```

## Yayın doğrulaması

```bash
npm run validate:content
npm run generate:machine
npm run generate:sitemap
npm run build
```

Build çıktısı `dist/` klasöründedir.

## Dağıtım

Vercel, Firebase Hosting veya SPA fallback destekleyen statik hosting üzerinde yayınlanabilir. `public/` altındaki robots, sitemap, feed ve reference dosyalarının deploy çıktısına dahil edildiği doğrulanmalıdır.
