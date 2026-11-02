# Kutarya bakım takvimi

## Her yayın

- Web sunucu, masaüstü ve mobile-backend test kapılarını çalıştır.
- `node scripts/canli-smoke.mjs` sonucunu sakla.
- Yalnız değişen Firebase hedefini yayınla; PayTR'ye dokunma.

## Aylık

- Üç npm kökünde `npm outdated` ve `npm audit --omit=dev` çalıştır.
- Orta/yüksek bulguları bağımlılık zinciriyle kaydet; zorunlu büyük sürüm
  yükseltmesini ayrı test turunda yap.
- Yeni bağımlılıkların lisanslarını ve NOTICE gereksinimini kontrol et.
- Cloud Functions hata/gecikme/kota ve tünel erişilebilirlik raporunu incele.

## Üç aylık

- Temiz Windows profilinde kurulum/kaldırma kabul testini yinele.
- Geri dönüş prosedürünü önceki bir Hosting sürümü ve yerel installer ile prova et.
- Secret Manager erişimlerini ve artık kullanılmayan sır sürümlerini gözden geçir.

