# Kutarya Video — site içeriği ve tarihsel 1.0.0 kabulü

10 Ekim 2026 güncel geliştirme: 1.1.0, isimle arama, kayıt klasörü, kısa/
temizlenebilir geçmiş, dört tema ve açılışta uygulama sürümü bildirimi.
Yeni kabul ve yayın kaydı [KUTARYA-VIDEO-1.1-YAYIN.md](KUTARYA-VIDEO-1.1-YAYIN.md).
`npm run prepare:video` ve `npm run review:video` güncel sürüme yönlenir;
eski yardımcılar `*-1.0-*` adlarında tarihsel kaynak olarak saklanır.
Aşağıdaki 1.0.0 video/ses kabulü yeni sürümün ağda engellenen indirme testinin
yerine geçmez. Eski paketler ve SHA kayıtları korunur.

Mevcut gerçek Windows uygulaması için fotoğraf/açıklama/paket hazırlığı.
Kullanıcı PC'de sunucu veya port açılmamasını ve açık uygulamanın korunmasını
istedi. Yeni uygulama veya site sistemi oluşturulmadı.

## Hazır içerik

- Kayıt: `projects-src/kutarya-video.mjs`; Uygulamalar / desktop / download /
  Windows. Canlı hedef `https://kutarya.com/proje/kutarya-video`; yayımlanmış.
- Türkçe açıklama, kullanım/kurulum, gereksinimler, otomatik kalite, kuyruk,
  kayıt klasörleri, erişim/kodek sınırları ve gerçek kabul durumu.
- Kapak + iki galeri PNG'si: `public/media/projects/kutarya-video/`.
  Gerçek çalışan portable 1.0.0 ekranları. Tamamlanan indirme, Blender'ın
  Big Buck Bunny videosuyla gerçek 1080p testidir. Setup kabulünün boş PNG'leri
  veya kullanıcının kişisel geçmişi kullanılmadı.
- `artifacts/kutarya-video/Kutarya-Video-Setup-1.0.0.exe`: 237.083.465 bayt;
  SHA256 `1D87FD81AC720F4904EBF855BAC8EFD99CA3BEA01C75125D4415C5D1278D3E0F`.
- `artifacts/kutarya-video/Kutarya-Video-Portable-1.0.0.exe`: 237.025.881 bayt;
  SHA256 `4ECFD64DCF74D69F512951297F6BB51F206D38F406690C0091EB7FCEA8127B9E`.
  Yalnız kopyanın adı değişti; kullanılan orijinal EXE değişmedi.

## Port açmayan hazırlama ve inceleme

```powershell
npm run prepare:video
npm run review:video
npm run check
```

Hazırlayıcı kabul raporlarını, EXE dosya imzasını, boyut/SHA ve PNG boyutunu
kontrol eder; kopyaları tekrar SHA ile karşılaştırır. Normal profil, videolar,
kısayol, registry ve açık süreç üzerinde değişiklik yapmaz.

`artifacts/kutarya-video/site-onizleme.html` gerçek `src/App.tsx` ve site CSS'i
ile derlenmiş tek HTML incelemesidir. Firebase/state yalnız inceleme derlemesinde
devre dışıdır; gerçek paket bilgisi ve PNG'ler gömülür. Üretim kaynakları
değiştirilmez. Art'ın gömülü PNG kabulü yalnız inceleme içindir; üretimde
mevcut Storage URL kontrolü korunur.

Edge headless, Playwright pipe bağlantısıyla çalıştı; HTTP/Vite/emülatör/debug
TCP sunucusu başlatılmadı. 1280/390 px: kapak + iki galeri fotoğrafı yüklendi;
iki dosya satırı ve sekmeler çalıştı; yatay taşma, renderer hatası ve dış ağ
isteği yok. İnceleme İndir düğmesi canlı hizmete bağlanmaz. Bu, canlı
katalog/yükleme/indirme kabulü değildir. Kanıt `site-kabul.json`, `site-*.png`
ve `dosyalar-*.png`. Site 53/53 + TypeScript/Vite build geçti.

## 7 Ekim 2026 — canlı yayın ve kabul

Kullanıcı Hosting yayınını Kutarya AI projesine açıkça onayladı; şifre isteyen
işlemin iptalini istedi. Hedef `kutarya-ai-3169` doğrulandı. Yeni katalog ana
sitesi yayımlandı; mevcut admin/login sistemi korunur. Hosting sürümü
`sites/kutarya-ai-3169/versions/9a946d116eab4fd9`; önceki sürüm/config yedeklendi.
Mevcut doğrulanmış admin'e gamesAdmin claim'i önceki claim'ler korunarak eklendi.
gamesService ve birleştirilmiş Storage kuralları canlıda; Firestore kuralları ve
önceki yedi Functions servisi aynı. Parola/login/kalıcı anahtar istenmedi.

`scripts/upload-video.mjs` port açmadan mevcut admin/dosya/Storage API hattını
kullanır. Sabit HTTPS üretim endpoint/bucket; emülatör hedefi yok. Yayın onayı
bayrağı ve mevcut doğrulanmış gamesAdmin hesabının kısa ömürlü custom token'ı
gerekir; token/şifre dosyaya yazılmaz. Servis/kategori hazır olmadan durur;
claim atamaz, Hosting veya kural deploy etmez. Aynı isim/sürüm dosyasının üzerine
yazmaz; diğer katalog kayıtlarının değişmediğini kontrol eder. İki canlı
misafir indirmenin ve üç PNG'nin SHA/boyutunu doğrular; başarılıysa
`production-upload.json` yazar. **Betik çalıştı:** iki gerçek misafir EXE
indirmesi ve üç PNG boyut/SHA olarak orijinallerle aynı. Önceki yedi katalog
kaydı Video yüklemesinde değişmedi. Önceki projeler ayrıca mevcut API hattıyla
aktarıldı; katalogda toplam sekiz gerçek proje var.

Gerçek `https://kutarya.com/proje/kutarya-video` Edge headless/pipe ile
1280/390 px açıldı; kapak + iki galeri, iki dosya, sekmeler, yatay taşma ve
renderer kontrolü geçti. Canlı Setup İndir düğmesi 237.083.465 baytı indirdi;
SHA yukarıdakiyle aynı. Installer çalıştırılmadı. Anonim admin paneli/API erişimi
engellendi. 11 gerçek rota 200, eksik JS 404; beş web runtime'ının 12 dosyası
Hosting'den indirilip manifest SHA/boyutuyla eşleşti. Yeni oyun oynanışı/FPS
kabulü bu yayında tekrar ölçülmedi. Kanıtlar ignore
`artifacts/release-2026-10-07/live-site-acceptance.json`,
`cloud-release-acceptance.json` ve `canli-*.png`.

Hedef `kutarya-ai-3169` / `kutarya.com`; gamesService europe-west1, Storage
US-EAST1; üretim PC'ye bağımlı değildir. Mevcut ücretli Firebase planında
trafik/depolama/Functions/Firestore/mail maliyeti oluşabilir. Port talimatı
nedeniyle emülatör entegrasyon/Hosting testleri koşulmadı. Eski 385/102
klasörleri yok; eski testler başarılı sayılmadı. Kullanıcının açık yayın
talimatıyla mevcut 53 test/build ve gerçek HTTPS/kural kabulü tamamlandı.

Setup payload'ı önceki görevde 11 kontrol ve 92 dosya SHA kontrolünü geçti.
Windows kurulum/registry/kısayol/kaldırma kabulü açık; açık uygulamaya dokunmama
talimatı korunur. Portable önceki gerçek YouTube kabulü ayrı: 14/14,
1920×1080 video + ses.
