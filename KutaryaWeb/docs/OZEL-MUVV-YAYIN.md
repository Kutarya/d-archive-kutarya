# Muvv 0.4.0 bağlantıyla paylaşım yayını

12 Ekim 2026. Kullanıcının bu proje ZIP'ini kaynakları, görselleri ve iyileştirmeleriyle `kutarya.com/ozel` üzerinde yayımlama talimatı tamamlandı.

- Sayfa: https://kutarya.com/ozel
- Hosting: `kutarya-ai-3169`, sürüm `b13d7b2803ee333a`.
- Önceki Hosting: `7216642c926abdca`.
- ZIP: `/ozel/muvv/0.4.0-20261012/Muvv-0.4.0-Proje-20261012.zip`.
- ZIP boyutu: 1.218.590 bayt; SHA-256 `6dc8ca25036ed73096231543323b5ff1a1ec387660cc7205e115d348fd2f3b62`.

## Erişim ve içerik

Bu sayfa adresi bilen herkesin açabileceği bağlantıyla paylaşımdır; kimlik doğrulaması uygulanmaz. Menü, katalog, arama sonuçları veya genel sayfalardan `/ozel` bağlantısı eklenmez. Sayfa sitemap'e dahil değildir. HTML `robots` metası ve `/ozel`, `/ozel/`, `/ozel.html`, `/ozel/**` HTTP yanıtları `noindex, nofollow` taşır. `robots.txt` özel yolu listelemez.

Bağımsız HTML; Muvv tanıtımı, dört iyileştirme, beş gerçek demo görüntüsü, kaynak paketinin içeriği, Windows demo kurulumu ve kabul sınırlarını gösterir. Altı orijinal PNG ayrıca sürümlü Hosting dosyaları ve ZIP içinde bulunur. Genel uygulama kabuğu ya da ziyaretçi hesabı eklenmedi.

ZIP önceki teslimle birebir aynıdır; web yayını için yeniden oluşturulmadı. `D:/BRS` kaynak uygulaması veya teslim dosyaları değiştirilmedi. Demo ve otomatik testler fiziksel Rival 3, Linux servisi veya cihaz belleğinde kalıcılık kabulü olarak sunulmaz. Sayfada 162 geçen / 176 toplam test, 14 atlanan Linux/POSIX testi ve 33 arayüz senaryosu açıklanır.

## Yayın ve kabul

1. `prepare-muvv-share.mjs`, SHA-256 ile doğrulanmış ZIP ve altı PNG'yi ayrı sürümlü Hosting dizinine kopyaladı. `firebase.json` yalnız özel yolun iki exact rewrite'ı, HTML yönlendirmesi ve yol kapsamlı başlıklarla genişletildi.
2. `npm test`: 58/58; TypeScript ve canlı katalogdan SEO derlemesi geçti. Eski AI server/Desktop test klasörleri mevcut olmadığından 385/102 test çalışmış sayılmadı.
3. Yerel Edge 1280/390 kontrolleri sunucu/port açmadan dosya yanıtlarıyla yapıldı. Bu ağ taklidi gerçek indirme kabulü değildir; yerelde link ve dosya hash'i kontrol edilir.
4. Kullanıcının açık yayın talimatıyla yalnız Hosting, mevcut `deploy-release.mjs hosting` üzerinden yayımlandı. Etkileşimsiz CLI; kapalı stdin; parola veya yeni giriş istenmedi. Functions, Storage, Firestore veya Auth dağıtılmadı.
5. Gerçek HTTPS kabulünde `/ozel` ve `/ozel/`, HTML/CSS, ZIP ve altı PNG'nin bayt/hash değerleri doğrulandı. İndirme düğmesi gerçek Edge indirmesiyle 1.218.590 bayt ve aynı SHA-256 değerini verdi. Tam boy görsel açılışı, checksum açılır alanı, 1280/390 görünüm, beş görselin decode'u, sıfır renderer/console hatası ve sıfır yatay taşma geçti.
6. Genel 24 sayfanın canlı HTML'i derleme SHA'larıyla eşleşti; özel bağlantı yok. 23 sitemap URL'si ve robots aynı; özel dosya olmayan yol 404 döner. Sekiz Functions, 12 katalog kaydı, kategoriler/duyurular/site ayarları/adres kayıtları, canlı kurallar ve admin/Auth aynı kaldı. Geçici IAM değişimi yapılmadı.

Kanıtlar: `artifacts/releases/muvv-private/0.4.0-20261012/`. `before.json`, `after.json`, `cloud-acceptance.json`, `payload.json`, `local-acceptance.json`, `live-acceptance.json`, test/derleme/dağıtım kayıtları ve masaüstü/mobil görselleri birlikte korunur.

Hosting REST `version.config.headers[].headers` nesne olarak döner; yerel Firebase config'teki key/value dizisiyle aynı biçim varsayılmamalı. Bulut kontrolü iki biçimi de ele alır.

## Sonraki bakım

- Bu projeyi genel kataloğa veya `src/seo.mjs` rotalarına ekleme; kullanıcı yalnız adresle paylaşım istedi.
- `public/ozel.html` kaynak sayfadır. `firebase.json` yol kuralları SEO üretimi tarafından korunur. Elle base config deploy etme; mevcut SEO yayın helper'ını kullan.
- `/ozel/muvv/0.4.0-20261012/` dosyaları `immutable` cache taşır. Yayımlanan ZIP, PNG ve CSS'yi aynı adla değiştirme; yeni içerik için yeni sürüm/revizyon dizini aç ve sayfanın yollarını güncelle.
- `prepare-muvv-share.mjs` bu ilk teslimin yerel, tek seferlik hazırlığıdır; koruma kontrolü yeniden çalıştırmada durur. Gelecek sürümde yeni hedef ve kanıt klasörü seçilir.
- Sayfanın kaldırılması veya parola koruması ayrı kullanıcı talimatı gerektirir. Hosting geri alma önceki sitenin config/dosyalarına döner; kaynak ZIP'i silmez.
