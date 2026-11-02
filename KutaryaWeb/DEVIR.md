# KutaryaWeb — çalışma devir kaydı

## 21 Ekim 2026 — Blackjack 2.0 / Oyun Gecesi / keşif ve günlük; yalnız yerel

- Kullanıcı mevcut Blackjack'e online, yeni görünüm ve site konsepti istedi;
  sonra siteyi geliştirmeye devam etmemizi istedi. Canlı yayın için yeni onay
  henüz alınmadı. Hosting/Cloud Run/katalog/Storage/Auth/kurallara yazılmadı.
- Yeni kaynak `games-src/blackjack/{table.html,style.css,core.mjs,client.js}`;
  eski `index.html` ve public/games/blackjack/1.0.3 korunur. Royal Night2.0:
  yeşil keçe/krem kartlar/pirinç, mobil masa, ses, ipucu/geçmiş, bölme,
  teslim, double; dört deste/S17/3:2, tek bölme, bölünmüş aslara bir kart.
- Tek kişilik alıştırma ve Türkiye tarihine göre beş turluk günlük; en iyi
  sonuç yalnız tarayıcıda. Hesapsız2–5 kişilik online oda/kod/davet/açık liste,
  hazır olma, sunucu kart/puan/sıra,25sn otomatik dur,30sn dönüş,45dk oda.
  Sunucu `blackjack-server/`; diğer iki oyun sunucusu değişmedi. Kapalı kart
  ve deste gönderilmez; hamle sıra kimliği tekrar kullanılamaz.
- `/oyun-gecesi` ve ana sayfa oyun vitrini mevcut beş oyunu bir araya getirir;
  tarz/URL filtreleri ve tekrar etmeyen oyun seçici vardır. Yeni örnek proje,
  sahte oyuncu/oda/puan tablosu veya ziyaretçi hesabı eklenmedi.
- Devam isteğiyle `/kesif`: oyun/üretim/kaynak rotaları, cihaz filtresi,
  güncel dosya/depo olanaklarından öneri, boş sonuç/sıfırlama/paylaşım URL'si.
  Ana sayfaya üç rota ve gerçek sürüm notlarından kısa güncelleme kartları.
  `/duyurular` sürüm günlüğü/tür/Türkçe arama/not açma ve korunan duyurular.
  Bu ikinci grup da tamamlandı; bütün akışlar aşağıdaki son kabulde vardır.
- Son kabul:87/87 site+kurallar (16 yeni oyun testi dahil),
  TypeScript/Vite ve SEO13 proje/26 sitemap/27HTML. Yerel Node24.15.0;
  bulut konteksi22 hedefler, henüz bulutta çalıştırılmadı. Oyun31 görünüm240–1366px;
  iki başsız Edge oturumu üretim gateway'ine kontrollü WebSocket köprüsüyle
  bağlandı: aynı sonuç, gerçek Türkçe klavye, davet/hazır/kopmada dönüş geçti.
  Bu gerçek Cloud Run/internet kabulü değildir. ZIP SHA/içerik ve file HTML'de
  gerçek offline tur geçti. Site51 görünüm/üç tema: ana sayfa, oyun gecesi,
  keşif ve günlük360/390/768/1280; gerçek sandbox Player1280/390/320.
  Amaç/cihaz/boş sonuç/sıfırlama,13not/tür/Türkçe arama/tam not/tek duyuru,
  data URL'ye gömülü gerçek Blackjack offline tur geçti. Son ziyaretçi/admin
  regresyonu26 görünüm/8eylem; renderer/ağ hatası0. Eski1.x dosyaları yeni
  sürüm önizlemesinde eski bölümünde kaldığından genel indirme regresyonu
  güncel paketi mevcut başka projeyi kullanır; yeni oyunun kabulü ayrıdır.
- Eski100 Hosting dosyasının yerel gzip9/SHA değeri18Ekim after.json ile aynı.
  Sunucu ws8.22.0 audit0. Eski AI385/Desktop102 klasörleri yine yok; koşulmuş
  sayılmaz. Fiziksel telefon/farklı ağ/yoğun yük ve canlı indirme/mail yapılmadı.
  PC sunucu/debug portu veya masaüstü kontrolü kullanılmadı; no-listeners.cjs.
- Kanıt/paket/yedek `artifacts/releases/blackjack/2.0.0/`; dört gerçek ekran,
  giriş `inceleme.html`, kaynak SHA/test logu `local-validation.json` ve
  `unit-tests.log`. İnceleme ZIP21701bayt/SHA256
  `47c24a38edeaae480d134ced14a6ac9379cfc99cb98aadbf6ce0a795c8c24e06`.
  pending katalog patch'i ve container konteksi hazır. `build-blackjack.mjs`
  servis adresi yokken açıkça inceleme ZIP'i üretir, online butonu yayın bekler.
  `prepare-blackjack-release.mjs` yalnız yerel hazırlıktır. Kullanıcı önizlemesi
  site-review/inceleme.html; Blackjack tek HTML olarak içine gömülür. QA taşımayı
  yalnız `qa-game=1` ile kontrollü adrese değiştirir; kullanıcı önizlemesi ağsız oynar.
- Yayın sırası: açık kullanıcı onayı; gerçek hedef/domain ve before bulut yedeği;
  ayrı kutarya-blackjack Cloud Run (yetkisiz runtimeSA,service+revision min0/max1);
  gerçek endpoint ile paket; bulut protokol/iki tarayıcı kabulü; sürümlü import,
  mevcut admin Storage paketi/görseli/katalog etkinleştirme ve kontrollü Hosting;
  gerçek HTTPS/iframe/indirme SHA/after kabulü. deploy-blackjack.mjs onay env
  kapısıyla hazırdır, çalıştırılmadı. Katalog1.0.3 dosyası/sürümü silinmez.
- Tuzaklar: projects.mjs sonundaki eski1.0.3 ataması2.0.0'ı geri alıyordu;
  kaldırıldı, metaveri/runtime testi eklendi. Player davet `masa` sorgusunu
  yalnız doğrulanmış altı karakterli Blackjack kodunda runtime'a aktarır.
  Sandbox allow-forms/same-origin eklenmez. Playwright serviceWorkers:block
  opak iframe'de navigator.serviceWorker SecurityError üretir; servis worker
  içermeyen bu düzeneğe o enjeksiyon yapılmaz. React filtre tıklamasından sonra
  eski DOM anlık okunmaz; URL ve sonuç sayısının birlikte değişmesi beklenir.
  240px başlık rozeti ve puan paneli taşması ölçülüp düzeltildi; uzun eller sarılır.
  data iframe'de crypto.randomUUID yoktu; kimlik crypto.getRandomValues ile
  üretilir ve çalışan kullanıcı önizlemesinde gerçek turla kabul edildi.
- Bakım/kabul ayrıntıları `docs/BLACKJACK-2-OYUN-GECESI.md`. Yerel ve üst
  DEVIR güncellendi. Bu not canlıya yayımlandığı anlamına gelmez.

## 18 Ekim 2026 — Rus Ruleti: Son Tur 1.0.1 geliştirildi ve yayımlandı

- Kullanıcının HTML/CSS/JS oyun/oda/oyuncu bulma/yayın talimatıyla https://kutarya.com/oyna/rus-ruleti ve /proje/rus-ruleti etkin. Katalog13 gerçek proje. İstemci1.0.1; bulut servisi1.0.0/ağ sözleşmesi1 korunur. Hosting sites/kutarya-ai-3169/versions/b559d71ce1f095d4; önceki sites/kutarya-ai-3169/versions/ac73c06b30067506; görev başlangıcı6cdaeae4c630d99a. İlk1.0.0 paketi/runtime/görseller korunur.
- Animasyonlu metal hazne,2–6 kişilik özel/açık oda, kod/davet, gerçek masa listesi, hızlı eşleşme/8 saniye, hazır olma,25 saniye/otomatik çekim, tek pas, sunucu sonucu, rövanş, emoji, ses, mobil/azaltılmış hareket, ayrı üç botlu antrenman. Botlar insan gösterilmez; hesap/bahis yok.1.0.1 dar site iframe'inde kesilen düğmeleri düzeltti;240 piksel iç genişlik sınanır.
- Ayrı Cloud Run kutarya-rus-ruleti/europe-west1: kutarya-rus-ruleti-00002-r8k, trafik%100, service/revision min0/max1,1CPU/256MiB,timeout3600s; runtime SA proje rolü0. Odalar geçici/45 dakika; kopmada30 saniyeye kadar dönüş denenir. Açık WebSocket aktif bulut kullanımı oluşturur.
- Kabul: oyun15/15, site64/64+TypeScript/Vite,audit0. Değişmeyen gerçek bulut servisinin 18 protokol grubu1.0.0 kanıtından korunur (altı/yedinci sınırı,yetkisiz hamle/kopma/dönüş/geri sayımda sahiplik). Yeni1.0.1 istemci gerçek iki Edge bağlamında ayrıca aynı kazanan/kod/hazır/klavye/pas/rövanş/hızlı eşleşme ile sınandı.240/282/320/390/768/1366 görünüm ve gerçek /oyna korumalı iframe geçti.
- Canlı25 HTML SHA,sitemap/robots,üç runtime/dörtPNG,1280/390 proje sayfası ve gerçek İndir düğmesinden yeni ZIP tam bayt/SHA/içerik geçti. Eski1.0.0 dosyası korunur. Fiziksel telefon/farklı ağ/yoğun yük ölçülmedi; eski AI385/Desktop102 klasörleri yok, koşulmuş sayılmaz.
- Diğer12 katalog kaydı/sekiz Functions/diğer Cloud Run/kurallar/Auth/admin ve93 eski Hosting dosyası korundu. Geçici IAM geri alındı. PC portu,etkileşimli giriş/parola,sır payload'ı veya açık masaüstü uygulaması üzerinde kontrol yok.
- Kaynak games-src/rus-ruleti,roulette-server; kanıt artifacts/releases/rus-ruleti/1.0.1/. ZIP21750 bayt/SHA 893c71e4d78a087ecf833ab8187bb8c2f121957e0ce43e1c0d163a4948e220dd; HTML71244 bayt/SHA 82a68625013f8d7fcfb7499cff734c3186bebc1873c2da2a39b856a36d465acf. Sabit yayımlanmış paketler üzerine yazılmaz. Önceki1.0.0 kanıtı artifacts/releases/rus-ruleti/1.0.0/ altındadır.
- İş akışı: roulette-cloud before; build-roulette; roulette-accept-rules; review-roulette/iframe/matchmaking; prepare-roulette-release; freeze-roulette; authorize-roulette upload; deploy-release hosting; gerçek live kabulü; authorize-roulette activate; deploy-release hosting; gerçek katalog iframe/site; roulette-cloud after. Yeni gateway yayını gerekirse deploy-roulette; Node çağrıları --require ./scripts/no-listeners.cjs ile. Ayrıntı docs/RUS-RULETI.md.


Önce üst proje belgesi `D:\Kutarya\DEVIR.md` ve `AGENTS.md` okunmalıdır.
Ana ürün/uygulama planı: `SITE-PLANI.md`.

## 18 Ekim 2026 — Kutarya Jenerik 1.4.0 canlı yayını

- Kullanıcının açık siteye yayın talimatıyla yalnız Jenerik katalog/Storage paketleri ve Hosting yayımlandı. Hedef kutarya-ai-3169 / kutarya.com; Hosting `6cdaeae4c630d99a`, önceki `8856063159d3f95a`.
- Güncel dosyalar Setup1.4.0-r2 (225363910 bayt) ve portable1.4.0 (202505900 bayt). Eski1.2/1.3.1 dosyaları korunur; yeni dosyalar güncel bölümde, eskiler açılır bölümde.
- r2 yalnız kurulum korumasıdır; uygulama aynı1.4.0. Eski resources verisi kaldırıcıdan önce yedeklenir, eski yollar korunur, boş AppData alanı hazırlanır; mevcut yeni veri ezilmez. Açık uygulama zorla kapatılmaz. Altı gerçek NSIS kanca/ayrı sahte veri senaryosu geçti; gerçek Setup kullanıcı kurulumunda test edilmedi.
- Uygulama72 birim+59 paket kontrolünden geçen136 dosyayla eşit. Site64/64+build; gerçek HTTPS24 HTML SHA, Edge1280/390, dört görsel, iki gerçek İndir düğmesinden tam dosya/boyut/SHA kabulü geçti. Fiziksel telefon/canlı ElevenLabs yok.
- Diğer11 proje, sekiz Functions, kurallar, Auth/admin ve82 eski Hosting dosyası korundu; IAM eski durumunda. PC portu/parola/secret payload veya açık Jenerik üzerinde kontrol yok.
- Sürüm yolları scripts/jenerik-release-paths.mjs ile ayrıdır. Hazırlık: prepare-jenerik-release.mjs; yedek/kabul: jenerik-release-audit.mjs before|after; mevcut admin yüklemesi: authorize-jenerik-release.mjs; Hosting: deploy-release.mjs hosting; canlı kabul: verify-jenerik-live.mjs. Eski giriş betikleri bu güncel akışa yönlenir. Node çağrıları no-listeners.cjs ile, yayın logu KUTARYA_RELEASE_LOG_DIR üzerinden sürüm dizinine gider.
- Kanıt/geri dönüş: artifacts/releases/kutarya-jenerik/1.4.0/; paketler artifacts/kutarya-jenerik/1.4.0/; görseller public/media/projects/kutarya-jenerik/1.4.0/. Ayrıntı docs/KUTARYA-JENERIK-1.4-YAYIN.md. Yayın NSIS kaynağı ve yerel kaynak ZIP C:/Users/yunus/Documents/Codex/2026-10-18/im/outputs/Kutarya-Jenerik-1.4.0-Web-Yayini/ altında; eski1.4.0 teslimi üzerine yazılmadı.

## 14 Ekim 2026 — site yenileme tamamlandı ve yayımlandı

- Kullanıcı ikinci isteğinde geliştirmeye devam edilmesini, iş bitince canlı
  yayını açıkça onayladı. Bu görevde PC/masaüstü kontrolü yapılmadı; tüm tarayıcı
  testleri ayrı geçici profilde başsız Edge ve pipe ile, HTTP/debug portu açmadan
  çalıştı. Bu, bir sanal makine kullanıldığı iddiası değildir. Kullanıcının
  şimdilik PC'yi kontrol etmeme talimatı geçerlidir.
- https://kutarya.com üzerinde yalnız Hosting `8856063159d3f95a` yayımlandı;
  önceki sürüm `b13d7b2803ee333a`. Yayın öncesi config/katalog/kurallar/claim
  yedeği `artifacts/site-refresh/2026-10-14/before.json`; son durum ve kabul
  aynı dizinde. Yeni yayın günlükleri `KUTARYA_RELEASE_LOG_DIR` ile bu dizine
  ayrılır; helper hedefi artifacts altında doğrular. Mevcut etkileşimsiz yayın
  helper'ı ve parola/port kapıları kullanıldı; IAM değişikliği yapılmadı.
- İlk turdaki ana sayfa/kart/keşif/güncel indirme yenilemesi tamamlandı.
  Galeri artık sayfadan ayrılmadan açılır, oklarla dolaşılır ve Escape ile
  kapanır. Tab odağı pencere içinde tutulur ve kapatınca açan düğmeye döner.
  Mobil menüde mevcut sayfaya yeniden basmak da menüyü kapatır.
- Yönetici düzenleyicisinde kaydetmeden proje önizlemesi ve kaydedilmemiş
  değişiklik göstergesi var. Düzenleyicinin geri düğmesi, sayfa bağlantıları
  ve yenileme/kapatma için ayrılma uyarısı eklendi. Dosya/versions/updatedAt
  sunucu metaverisi form değişikliği sayılmaz. SPA içindeki tarayıcı Geri/İleri
  hareketi bu uyarıyla engellenmez; tüm gezinmeyi koruduğu söylenmez.
- Yerel son kaynak: `npm run check` 64/64 + TypeScript/Vite build ve SEO build
  geçti (12 proje / 23 sitemap / 24 HTML). Eski AI385/Desktop102 test klasörleri
  halen yok; çalıştırıldığı iddia edilmedi. Başsız kontrollü kabul: mevcut
  ziyaretçi/admin senaryoları 26 görünüm + 8 eylem grubu; yeni kabul 48 görünüm
  (360/390/768/1280 × açık/sıcak/koyu × dört sayfa) ve 6 eylem grubu geçti.
  Mobil/masaüstü galeri ve taslak önizleme ekran görüntüleri incelendi.
- Gerçek HTTPS kabulü: 24 HTML tam SHA eşleşmesi, 14 genel görünüm ve altı eski
  yol, anonim admin reddi, gerçek Blackjack iframe/play açılışı, gerçek İndir
  düğmesiyle 3185 bayt model-beyni ZIP'inin SHA kontrolü geçti. Yeni filtreler,
  tarayıcı geri geçmişi, mobil arama/Günlük, galeri/odak, URL Dosyalar sekmesi
  ve eski dosyalar canlıda geçti; renderer hatası yok. Yönetici girişi/mail/
  kaydetme yalnız kontrollü servislerle denendi; gerçek parola/mail testi yok.
- Yayın öncesi mevcut Hosting manifestindeki 82 oyun/medya/özel dosya, CLI'nın
  gzip9/SHA-256 yöntemiyle yerel dist'e karşı birebir doğrulandı; yayından sonra
  aynı 82 dosya hash'i korundu. Sekiz Functions, 12 katalog kaydı, kategoriler,
  duyuru/ayar/adres kayıtları, Firestore/Storage kuralları ve admin/Auth aynı.
  Özel paylaşımın noindex başlığı ve sitemap dışında kalması ayrıca doğrulandı.
- Tekrar kabul: `review-public-access.mjs --refresh`, `review-site-refresh.mjs`
  ve canlı için `verify-public-access-live.mjs --refresh`; bütün Node çağrıları
  `--require ./scripts/no-listeners.cjs` ile. Bulut kontrolü
  `site-refresh-cloud.mjs before|after`; before dosyası üzerine yazılmaz.
  Plan/geliştirme ve kabul ayrıntıları `docs/SITE-YENILEME-2026-10-14.md`.

## 14 Ekim 2026 — ilk yerel tur (tarihsel; üstteki yayınla tamamlandı)

- Kullanıcı sitenin görünümünü ve eksiklerini geliştirmek istedi. İnceleme ve
  kabul planı `docs/SITE-YENILEME-2026-10-14.md`; başlangıç kaynak yedeği
  `artifacts/site-refresh/2026-10-14/before/`. Genel canlı HTML'de 12 proje,
  12 öne çıkan kayıt ve tek duyuru doğrulandı; altı genel yol HTTP 200.
- Ana sayfa gerçek proje vitrini, kompakt koleksiyonlar ve tarihe göre son
  güncellemelerle yerelde yenilendi. Kartlar açıklama, sürüm, platform ve
  tarayıcı/indirme/kaynak olanaklarını gösterir. Mobil arama ve Günlük erişimi
  eklendi. Yeni olanak filtreleri diğer türlerdeki kaynak paketlerini de bulur;
  Türkçe çok kelimeli arama, filtre çipleri ve URL'de görünüm seçimi vardır.
- Detayın üstünde yalnız güncel sürümden seçilen paket/rol/platform bilgisi ve
  indirme düğmesi var. Eski dosyalar ayrı açılır bölümde korunur. Dosyalar ve
  sürüm notları `sekme=dosyalar|surumler` ile doğrudan açılır; sekmelerde ok,
  Home/End klavyeleri desteklenir. API, Auth, kurallar ve oyun paketleri değişmedi.
- Katalog yenileme hatası, önceden alınmış katalog varsa artık içeriği kapatmaz;
  son katalog ve yeniden deneme bildirimi gösterilir. İlk yükleme hata ekranı sürer.
- `npm run check`: 64/64 test ve TypeScript/Vite build geçti. Altı yeni test
  Türkçe arama, birleşik filtre, gizli kayıt, güncel/eski paket seçimi ve sıralamayı
  denetler. Bu sonuç gerçek indirme veya görsel tarayıcı kabulü değildir.
- `node --require ./scripts/no-listeners.cjs scripts/review-public-access.mjs
  --prepare-only` gerçek katalog/görsellerle bağımsız `inceleme.html` üretti;
  servisler kontrollü taklittir, port yok, bu seçenek tarayıcı testi çalıştırmaz.
  Dosya `artifacts/site-refresh/2026-10-14/inceleme.html`.
- Browser Use bağlantısı yoktu. Computer Use ile Edge açıldı; kullanıcı fiziksel
  Escape ile kontrolü durdurdu. Sonrasında UI otomasyonu yapılmadı. Yeni görünümün
  masaüstü/mobil/tema/klavye ve gerçek indirme kabulü TAMAMLANMADI; yeniden devam
  talimatı olmadan bu turda UI kontrolü sürdürülmez. Hosting/Functions/Storage
  yayını yok; canlı sürüm değişmedi. Sonraki tur önce önizlemeyi değerlendirir.

## 12 Ekim 2026 — Muvv 0.4.0 yalnız bağlantıyla paylaşım sayfası yayımlandı

- Kullanıcının proje ZIP'ini kaynak, resimler ve iyileştirmelerle yayımlama
  talimatı tamamlandı: https://kutarya.com/ozel. Menü/katalog/sitemap'e bağlantı
  eklenmedi; adresi bilen herkes erişebilir, parola koruması yok.
- Bağımsız `public/ozel.html`: tanıtım, dört iyileştirme, gerçek demo görselleri,
  ZIP indirme, Windows demo kurulumu ve doğrulama sınırları. HTML ve özel yolun
  bütün HTTP yanıtları `noindex, nofollow`, `Referrer-Policy: no-referrer` taşır.
  `robots.txt` yolu listelemez. Katalog 12 proje olarak aynı kaldı.
- Kaynak ZIP önceki D:/BRS teslimiyle birebir: 1.218.590 bayt; SHA-256
  `6dc8ca25036ed73096231543323b5ff1a1ec387660cc7205e115d348fd2f3b62`.
  `/ozel/muvv/0.4.0-20261012/` altında ZIP, altı PNG ve CSS sürümlü/immutable.
  Aynı dosyaları gelecekte üzerine yazma; yeni sürüm dizini kullan.
- Yalnız Hosting `b13d7b2803ee333a`; önceki `7216642c926abdca`. Mevcut
  etkileşimsiz SEO yayın helper'ı kullanıldı; PC sunucu/port/parola yok.
  Sekiz Functions, katalog/kategoriler/duyurular/ayarlar/adres kayıtları,
  Firestore/Storage ruleset ve admin/Auth aynı; IAM değişimi yapılmadı.
- Kabul: site58/58, TypeScript/SEO build; 24 genel canlı HTML SHA; 23 sitemap
  URL'sinde özel yol yok. Özel HTML/CSS/ZIP/altı PNG tam SHA eşleşti. Edge gerçek
  İndir düğmesiyle ZIP tam bayt/SHA eşleşti;1280/390, beş görsel decode'u,
  tam boy resim/checksum açılışı, taşma/renderer/console hatası0.
- Projede 176 test/162 geçti/14 Linux-POSIX atlandı ve33 GUI senaryosu vardır;
  Windows demo/ZIP temiz kurulumu önceki BRS kontrolünde geçti. Fiziksel Rival3,
  Linux servisi ve firmware kalıcılığı doğrulanmış sayılmaz. Eski AI385/Desktop102
  test klasörleri yok; koşulmuş sayılmaz. Yerel tarayıcı taklidi gerçek indirme
  yapmaz; bu kabul gerçek HTTPS'te ayrıca ölçüldü.
- Kanıt `artifacts/releases/muvv-private/0.4.0-20261012/`; bakım/yayın ayrıntısı
  `docs/OZEL-MUVV-YAYIN.md`. Hosting REST başlıkları nesne biçiminde döner;
  key/value dizi varsayımı kontrol aracında düzeltildi. İki DEVIR güncellendi.

## 11 Ekim 2026 — Block Arena 2.1.0: oyuncu adı ve online hareket düzeltildi, yayımlandı

- Kullanıcı aynı oyun için online ad seçememe/yüksek ms sorununu bildirdi,
  sistemi ve oyunu geliştirmeyi istedi. Aynı sohbetin geliştirme/yayın
  talimatı kapsamında 2.1.0 https://kutarya.com/oyna/pixelgun üzerinde etkin.
  Hosting `7216642c926abdca`; görev öncesi `abd4fd17259a8865`.
- Ölçülen ad sorunu: 2.0'da gerçek klavyeyle giriş öncesi ad yazılabiliyor,
  fakat odaya katılınca alan kilitleniyordu. Artık herkes kendi adını lobide
  ve maç menüsünde değiştirebilir. Türkçe adlar/çakışma numarası ve başlangıç
  silahı seçimi var; Firebase ziyaretçi hesabı veya kalıcı profil eklenmedi.
- Eski istemci her karede eski sunucu konumuna çekiyordu. İstemci/sunucu
  ortak 60 Hz sabit hareket adımı, işlenen girdi sıra numarası ve bekleyen
  girdilerin tekrar uygulanması eklendi. Rakipler 85 ms örnek tamponundan
  çizilir; kendi atış sesi/geri tepme anındadır. Hasar/skor/mühimmat sunucuda.
  Yeni doğmada eski girdi kuyruğu sıfırlanır; sunucunun gerçek zaman bütçesi
  hız hilesini engeller. Gönderim/ping çizimden ayrı; gerçek son RTT gösterilir.
- Maç durum iletimi20 Hz, lobi4 Hz, toplu girdi30 paket/sn. Yeni protokol3
  rakiplerin gereksiz alanlarını taşımaz ve büyüyen gönderim kuyruğuna yeni
  durum eklemez. Eski2.0/protokol2 istemcisi aynı serviste çalışmaya devam eder.
- Aynı sekiz kişilik gerçek odada yedişer durum paketi: eski biçim ortanca
  5035 bayt, yeni2492 bayt (%51 küçük). Bu eski revision CPU/yük testi değildir.
  Canlı iki tarayıcıda kontrollü120 ms gidiş/120 ms dönüş: RTT328 ms,
  ilk hareket tepkisi13 ms, sonunda sunucu konumuna fark0. Yerel HTML testi
  RTT319/tepki16 ms. Hareket tepkisi ağ RTT'siyle aynı şey değildir.
- Bu ağda önce Edge16 örnek ortanca74/p95186 ms; son canlı, tek tarayıcı
  ölçümü14 örnek ortanca81/p9595 ms, FPS144. Ham20 örnek ortanca77/max741 ms;
  ham prob hello'dan hemen sonra başlar, oda hazır olmasını beklemez. Ağ RTT'si
  her bağlantıda düşmüş sayılmaz. Paralel tarayıcı kontrollerinde ölçülen
  farklı FPS ayrıca after-latency-parallel.json'da; FPS iyileşme iddiası yok.
- Cloud Run aynı servis/region/kimlik: revision `kutarya-block-arena-00003-zvm`,
  trafik%100, service ve revision min0/max1, 1 CPU/256Mi, timeout3600s.
  Runtime SA proje IAM rolü0; upload/activate geçici imza izni temizliği geçti.
- Kabul: arena15/15; site58/58 + TypeScript/Vite; üretim npm audit0.
  Gerçek bulut eski2.0 uyumu, sekiz oyuncu/dokuzuncu reddi, yetkisiz başlatma/
  konum-skor enjeksiyonu reddi, vuruş/eleme/yeni doğma,180 saniye sonuç/rövanş/
  takım odası geçti. Yerel ve canlı Edge25 görünüm/üç WebGL haritası/iki oturum,
  bağımsız ad/çakışma/maç menüsü değişimi ve kontrollü gecikme kabulü geçti.
- Son HTTPS24 HTML SHA/sitemap/robots/canonical, altı1.0/2.0/2.1 runtime dosyası
  SHA, beş PNG, admin401/eksik JS404;1280/390 kart/detay/Dosyalar geçti.
  Üç eski/yeni ZIP gerçek İndir düğmesinden tam bayt/SHA/içerikle doğrulandı.
  Korumalı iframe'de gerçek klavye/ad değiştirme/online oda/bot WebGL geçti;
  sandbox aynı, taşma/renderer hatası0. Fiziksel telefon/farklı ağ/yük ölçülmedi.
- ZIP46.443 bayt/SHA256
  `acc678166409c47105ad66ccdf896dc6745cf477afccf6a163ef36104b0871ad`;
  HTML184.710 bayt/SHA `f4fb989480cb5a5463cfd245d099593d367dcfaca6002ea0f7aede717bf0c76e`.
  Eski1.0/2.0 runtime/ZIP/görseller sabit. Diğer11 katalog kaydı, sekiz
  Functions/diğer Cloud Run servisleri, ruleset/admin UID-claim aynı.
- Kanıt artifacts/releases/block-arena/2.1.0/; ayrıntı docs/BLOCK-ARENA-2.1.md.
  scripts/arena-release-paths.mjs güncel sürümü seçer; import sonrası aynı
  sürümde build/görsel hazırlığı durur. Canlı isim/gecikme kabulü activate
  kapısıdır. Hosting geri alma katalog/Storage/Cloud Run'u geri almaz.
  Eski AI385/Desktop102 klasörleri yok; koşulmuş sayılmaz. PC portu/parola/
  secret payload yok. Yerel ve üst DEVIR bu görevde güncellendi.

## 10 Ekim 2026 — Kutarya Block Arena 2.0.0 geliştirildi ve yayımlandı

- Kullanıcı mevcut oyunda grafik/tasarım/mantık/efekt ve online geliştirme,
  ardından yeni sürümü yayınlama talimatı verdi. Yeni sürüm
  https://kutarya.com/oyna/pixelgun ve /proje/pixelgun üzerinde etkin.
  Eski `public/games/pixelgun/1.0.0` ve eski ZIP korunur; diğer oyunlar aynı.
- Mevcut voxel motoruna yüzey ışığı/malzeme çizgileri/sis/uzak şehir/arena
  detayları/gölge ve efektler eklendi. Yeni menü/oda/HUD; koşu enerjisi,
  Q atılma, vuruş/eleme/patlama geri bildirimi. Üç harita/beş silah ve
  çevrimdışı serbest/takım/dalga bot modları korunur; profil/ayar anahtarları aynı.
- Hesapsız 2–8 oyunculuk kodlu online serbest/takım odası, geri sayım,
  sunucu hareket/çarpışma/atış/mühimmat/hasar/yeniden doğma/skor, sonuç,
  rövanş ve 30 saniye otomatik yeniden bağlanma. Maç 3/5/10 dakika;
  odalar geçici, en fazla 45 dakika, servis yeniden başlamasında kapanır.
- Yeni bağımsız Cloud Run `kutarya-block-arena`, europe-west1;
  revision `kutarya-block-arena-00002-l2w`, trafik %100. Adres
  https://kutarya-block-arena-faferhidua-ew.a.run.app.
  `kutarya-arena-runtime@kutarya-ai-3169.iam.gserviceaccount.com` proje IAM
  rolü olmayan kimlik; DB/Auth/secret erişimi yok. 1 CPU/256 MiB,
  0 minimum/1 maksimum instance, concurrency160, timeout3600s;
  uygulama sınırı 16 oda/128 bağlantı/oda başına8. Yük kapasitesi kanıtı değildir.
- Yaşanan tuzak: `--max-instances=1` revision'ı sınırlar; service scaling20
  kaldı. Canlı API ile fark bulundu, `--max=1 --min=0` ile servis de1/0 yapıldı.
  deploy-arena her iki düzeyi yazar; audit-arena-service her iki düzeyi doğrular.
  ws8.22.0 üretim bağımlılığı audit0. Aktif WebSocket/derleme bulut maliyeti vardır.
- Hosting `abd4fd17259a8865`; görev öncesi `1de14f25e4536bb1` before.json'da.
  Yeni runtime önce ayrı dizinde Hosting'e alındı, HTTPS/WebGL kabulünden sonra
  katalog2.0 etkinleştirildi ve güncel katalogdan SEO tekrar yayımlandı.
  `firebase.seo-release.json`:101 dosya,12 proje/23 sitemap/24 HTML.
  Diğer11 katalog kaydı, sekiz Functions/diğer Cloud Run servisleri,
  Firestore/Storage ruleset ve admin UID/claim aynı. Ortak kurallar dağıtılmadı.
- Yeni ZIP44.123 bayt; SHA256
  `8af2017a8f1b95431a787287f8e0bfabf7258e7f01b5023bc2a8c1b03dd28ba6`.
  index.html176.360 bayt/SHA
  `a83bed9d4c3505a34d2f3e06a0e92641f0e7d39030ddfb5b78d8ce541ce740d2`.
  Beş gerçek PNG ve ZIP mevcut admin/Storage hattında tam SHA ile doğrulandı.
  Yeni ZIP Dosyalar'da başta; eski1.0 ZIP32.726 bayt/SHA
  `34d9823e0e7f8baad56fbb78e1a55862d115adff669613205a747c990d6dc9b1`.
  İki ZIP gerçek İndir düğmesinden tam indirildi, içindeki HTML/OKU da doğrulandı.
- Kabul: arena11/11; site58/58 + TypeScript/Vite; Edge yerel ve canlı
  25 görünüm/üç WebGL haritası/iki bağımsız tarayıcı oturumu. Gerçek bulutta
  hareket/mermi/yeniden bağlantı; ayrıca sekiz katılımcı/dokuzuncunun reddi,
  yetkisiz başlatma reddi, konum/skor enjeksiyonu reddi, gerçek vuruş/eleme/
  yeniden doğma, gerçek180 saniye maç sonu/aynı sonuç/rövanş/takım odası geçti.
  Sitede sandbox aynı (`allow-scripts allow-pointer-lock`); online oda ve
  bot maçı1280/390 geçti. Canlı24 HTML SHA/sitemap/robots/canonical,
  dört eski/yeni runtime dosyası SHA/beş görüntü/anonim admin401/eksik JS404;
  kart/detay/Dosyalar1280/390, taşma/renderer hatası0.
- Fiziksel telefon, farklı internet ağları ve yüksek eşzamanlı oyuncu yükü
  ölçülmedi. Eski AI server/Desktop klasörleri yok;385/102 çalışmış sayılmaz.
  PC servis/debug TCP portu/parola/secret payload yok; geçici imza izni
  upload ve activate için token alınır alınmaz kaldırıldı, canlı IAM temizliği geçti.
- Kaynak games-src/pixelgun ve arena-server; süreç docs/BLOCK-ARENA-2.md;
  kanıtlar artifacts/releases/block-arena/2.0.0/ altında. Yayımlanmış2.0.0
  HTML/ZIP/görsel üzerine yeniden üretim yapılmaz; sonraki değişiklik yeni sürüm.
  Hosting geri alma katalog/Storage/Cloud Run'u geri almaz; eski metadata ve
  1.0 runtime ayrıca seçilir. Yerel ve üst DEVIR bu görevde güncellendi.

## 10 Ekim 2026 — Kutarya Video 1.1.0 geliştirildi ve yayımlandı

- Kullanıcı mevcut Video'ya açılışta sürüm bildirimi, kayıt klasörü seçimi,
  geçmiş temizleme/kısa liste, isimle arama, sade renkli arayüz ve temalar
  istedi; bitmiş sürüm için doğrudan siteye yayın talimatı verdi.
  https://kutarya.com/proje/kutarya-video güncel1.1.0.
- Eski D:/KutaryaVideo kaynakları yoktu; SHA doğrulanmış1.0 portable'dan
  mevcut kod ve18 vendor/lisans dosyası geri alındı. Referans
  D:/KutaryaVideo/Kurtarilan-1.0.0; devamı kaynak/. Eski web EXE'leri korunur.
- Tek isim/link alanı; isim araması altı gerçek YouTube sonucu getirir,
  seçilen sonucun İndir düğmesi kuyruğa ekler. Kayıt klasörü/tema saklanır;
  her iş kendi klasörünü korur. Ana ekran etkin işler ve son işlem; Geçmiş
  20 satır/sayfa ve tek/toplu temizleme. Temizleme video dosyasını silmez.
  Açık/koyu/canlı/sistem temaları, her açılışta kamu katalog sürüm kontrolü.
  Bildirim için önce1.1 kurulmalıdır;1.0 kendi kendine bu özelliği kazanmaz.
- Son kaynak22/22 çekirdek; geliştirme/unpacked/gerçek portable30/30.
  Kontrollü klasör seçici/gelecek sürüm yanıtı gerçek Windows seçimi veya
  OS bildirimi teslimi sayılmaz. Kurulum/kaldırma çalıştırılmadı; NotSigned.
  Setup93 dosya, uygulama13 kaynak, vendor18 dosya SHA eşleşmesi geçti.
  Orijinal1.0 downloadArgs birebir korunur; kişisel veriye dokunulmadı.
- Gerçek isim araması/sonuç seçimi geçti; gerçek YouTube indirmesi test
  ağında HTTP429/bot doğrulamasıyla tamamlanamadı. İkinci herkese açık video
  da engellendi. Yeni sürümde tamamlanmış gerçek video/ses kabulü açık;
  eski1.0 kabulü yerine sayılmaz. Bu sınır canlı açıklama ve sürüm notlarında.
- Setup191.940.786 bayt / SHA256
  DEA049B17FFEF79C92159D383C907CD78AA892B81DF23425FAA532163E79F059.
  Portable191.783.659 bayt / SHA256
  9E37F6E29E53E0E462A893899C3B0D2E68EA588BE67DAA8DC1BB890FA2502B9E.
  Yayımlanmış1.1 paketleri sabittir; belge değişikliği için yeniden paketleme.
- Mevcut admin/Storage hattında iki yeni EXE/dört gerçek ekran tam bayt/SHA
  ile doğrulandı; eski1.0'ın iki dosyası korunur, yeni iki dosya başta.
  Hosting1de14f25e4536bb1; önceki ba161f8b5c0458d6;93 Hosting dosyası,
  12 proje/23 sitemap/24 HTML. Diğer11 proje, sekiz Functions, kurallar,
  Auth/admin UID-claim/IAM aynı. Geçici imza izni yüklemeden önce kaldırıldı.
- Site58/58 + build; file önizlemesi1280/390 geçti. Canlı HTTPS24 HTML SHA,
  sitemap/robots/canonical, eksik JS404/anonim admin401 ve Edge1280/390
  kart/detay/dört görsel/Dosyalar/iki gerçek İndir düğmesi tam bayt/SHA geçti.
  Taşma/renderer hatası0. Sonuç artifacts/releases/kutarya-video/1.1.0/
  live-acceptance.json ve cloud-acceptance.json altında. Canlı katalog sürüm
  karşılaştırması1.1 güncel/1.0 girdisi için1.1 yeni: live-update-check.json.
  Eski AI server/desktop test klasörleri yok;385/102 çalışmış sayılmaz.
- docs/KUTARYA-VIDEO-1.1-YAYIN.md; metadata projects-src/kutarya-video.mjs.
  Paket/önizleme artifacts/kutarya-video/1.1.0/, uygulama kanıtları
  D:/KutaryaVideo/Kanitlar/. Npm video komutları1.1'e yönlenir,1.0 betikleri
  tarihsel referanstır; aynı sürüm resim/paket hash'i uyuşmazsa hazırlık durur.
  Hosting geri alma katalog/Storage'ı geri almaz; eski metadata ayrıca seçilir.
  Parola/secret payload/PC servis veya debug TCP portu açılmadı.

- Devir güncellemesi bu görev kapsamında yerel ve D:/Kutarya/DEVIR.md ile
  D:/KutaryaVideo/DEVIR.md'ye işlendi. Sitedeki paketlerin SHA'sı değişmedi.

## 10 Ekim 2026 — Kutarya Mobile 1.2 sitede yayımlandı

- Kullanıcı yerel1.2 tesliminin ardından “Siteye yayınla” dedi.
  https://kutarya.com/proje/kutarya-mobile güncel1.2.0.
  Aynı imzalı APK, kaynak ZIP, dört gerçek ekran, açıklama/kurulum/sürüm
  notları mevcut admin/Storage/katalog hattıyla yayımlandı.
- Hosting ba161f8b5c0458d6; önceki f57f0560937b8525. SEO12 proje /
  23 sitemap / 24 HTML;89 Hosting dosyası. Diğer11 proje, sekiz Functions,
  ruleset/Auth/admin UID-claim ve IAM bağları aynı.
- APK13.134.468 bayt / SHA256
  371633E3CA4AA1E62EE36E5911EC5E5730FE49F237AB4ADD7B4A8245EC613500.
  Kaynak177.608 bayt /62 dosya / SHA256
  71840129DDB6F626FC6B3FFC458B424BAF3F4629D7F24E4C2B8E866815E2CF57.
  Teslim paketleri değiştirilmeden yayımlandı; sır/araç/cache/model hariç.
- Site58/58 + build; frontend/deploy kaynakları önceki canlıyla aynı.
  Gerçek24 HTML SHA/sitemap/robots/canonical, eksik JS404, anonim admin401;
  Edge1280/390 kart/detay/dört decode edilen görsel ve gerçek dört İndir
  düğmesiyle yeni1.2 ve eski1.1 paket SHA'ları geçti. Taşma/renderer hatası0.
- 1.1 dosya kimlikleri ve bütün alanları korundu. Yeni1.2'nin iki dosyası
  Dosyalar sekmesinde başta; toplam4. Yayımlanmış1.1 ve1.2 APK/kaynak
  ZIP'leri sabittir; belge güncellemesinde yeniden paketleyip üzerine yazma.
- mobile-release-paths.mjs sürüm bazlı artifact/kanıt/görsel dizinleri
  kullanır. prepare/upload/authorize/audit/verify araçları1.2'ye uyarlandı.
  Aynı sayıda görsel olsa bile hash denetlenir; eski görsel otomatik seçilmez.
- Kanıt/önceki config-kayıt:
  artifacts/releases/kutarya-mobile/1.2.0/ ve artifacts/kutarya-mobile/1.2.0/.
  Ayrıntı docs/KUTARYA-MOBILE-1.2-YAYIN.md. Hosting geri alma tek başına
  katalog/Storage'ı geri almaz; eski Mobile metadata'sı ayrıca geri seçilir.
- Yerel port/parola/key payload yok; geçici imza izni yüklemeden önce kaldırıldı.
  Android62+32 ürün kabulü ayrı; fiziksel telefon/gerçek AI/Play sınırı açık.
  Eski AI server/desktop test klasörleri yok; çalıştırılmış sayılmaz.

## 10 Ekim 2026 — Kutarya Mobile 1.1 sitede yayımlandı

- Kullanıcı bitmiş sürüm için “Sitede yayınla” talimatı verdi.
  https://kutarya.com/proje/kutarya-mobile; imzalı APK, kaynak ZIP ve iki
  gerçek ekran mevcut admin/Storage/katalog hattıyla yayımlandı.
- Hosting f57f0560937b8525; önceki43f73b57e6eb7708. SEO12 proje / 23 sitemap /
  24 HTML. Mevcut frontend kaynakları önceki canlı yayınla aynı; diğer11
  proje, sekiz Functions, kurallar/Auth/admin claim'leri korundu. IAM geri alındı.
- Site58/58 + build geçti. Gerçek HTTPS'te24 HTML SHA'sı, sitemap/robots,
  canonical, eksik JS404 ve anonim admin401; Edge1280/390 kart/detay/Dosyalar
  ve gerçek iki İndir düğmesi geçti. Taşma/renderer hatası yok; görseller decode edildi.
- APK13.085.316 bayt, SHA256
  089136858EE2327D18CC086908BA6B8F446E0C3275CFC38AA7045DB87AE6137E.
  Kaynak146.803 bayt, SHA256
  B0AF71DD13B36B1C0A5FE9A910B51E38F98EF231EF2EBBFB728CA9B1343E92C6.
  50 dosyalı allowlist; imza/API sırrı/araç/cache/model ağırlığı hariç.
- Kanıt/geri alma: artifacts/release-2026-10-10-kutarya-mobile/ ve
  artifacts/kutarya-mobile/; ayrıntı docs/KUTARYA-MOBILE-YAYIN.md.
  Metadata projects-src/kutarya-mobile.mjs; scripts/*mobile*.mjs yayın araçları.
- PC portu/parola/secret payload yok. 1.1 paketleri sabittir: belge
  değişikliği için aynı sürüm arşivi üzerine yazılmaz. Gelecek yayın ayrı onay
  ister; fiziksel telefon/gerçek AI ve Play kabulü bu işle tamamlanmış sayılmaz.

## 9 Ekim 2026 — Kutarya Mobile sesli mobil agent planı

- Kullanıcı Siri gibi konuşarak telefon işleri ve çok adımlı görevler yapan
  uygulama için plan istedi; uygulama adı Kutarya Mobile, asistan Kutarya Us.
  Ayrıntı docs/KUTARYA-MOBILE-PLANI.md. Bu teslim yalnız plandır.
- Öneri Android native Kotlin/Compose, cihazda telefon araçları + bulutta
  görev planlama, izin/onay kapısı ve gerçek sonuç kontrolü. İlk MVP arama,
  uygulama açma, alarm, harita, not, web araştırması, mesaj/takvim taslağı.
  Bildirim/dosya/görsel, rutinler ve iOS takip kapsamıdır.
- Resmî kaynaklar 9 Ekim'de kontrol edildi: Google Play, genel asistanın
  Accessibility API ile otonom plan/işlem yapmasını yasaklıyor. AppFunctions
  Android16+ ve EXECUTE_APP_FUNCTIONS runtime allowlist koşuluna bağlı;
  erişim doğrulanmadan çekirdek bağımlılığı yapılmaz. VoiceInteractionService
  rolü hotword garantisi değildir; Türkçe ses ve pil gerçek cihazda ölçülür.
- Mağaza dağıtımı kullanıcı tarafından kesinleştirilmedi. Plan ayrıca kişisel
  APK için kullanıcı başlatmalı, desteklenen uygulamalarda deneysel ekran
  kontrolünü ayrı seçenek olarak açıklar; bu seçenek Play kabulü veya
  Android erişim sınırlarının kaldırılması gibi sunulmaz.
- Intent başlatma, işlem tamamlandı kanıtı değildir. Alarm/takvim/mesaj
  aktarımında doğrulanamayan sonuç başarı gibi sunulmaz. Anahtar APK'ya konmaz;
  kişisel telefon verisi genel web aramasına kendiliğinden gönderilmez.
- Kutarya Cep ProviderApi/KeyVault/ChatDb kaynaklarının varlığı doğrulandı;
  uygun parçalar incelenerek değerlendirilecek, eski uygulama yeniden kurulmaz.
  Önceki Pocket-AI kaydının D:/KutaryaVsJarvis/app/build.gradle.kts ve DEVIR.md
  yolları bu görevde bulunamadı; eski çalışma hazır APK temeli sayılmaz.
- Öneri süre: 1–2 haftada erken demo, toplam 4–6 haftada Android MVP,
  10–14 haftada geniş beta; gerçekleşmiş süre/garanti değil. Sonraki iş
  cihaz/kaynak envanteri ve gerçek arama/ses/alarm/rol denemeleridir.
- Yalnız plan ve iki DEVIR güncellendi. Mobil kod/APK/eğitim, kurulum, ücretli
  API isteği, site/katalog/Auth/admin/servis/Firebase/mağaza yayını yapılmadı.

## 9 Ekim 2026 — ziyaretçi hesabı/kütüphane kaldırma canlıya yayımlandı

- Kullanıcı somut değişiklik için **"Canlıya yayımla"** onayı verdi. Yalnız
  kutarya-ai-3169 / kutarya.com Firebase Hosting yayımlandı; güncel sürüm
  `43f73b57e6eb7708`, önceki `de4a2f903b00e3ba`. Önceki Hosting config/sürümü
  `artifacts/release-2026-10-09-public-access/before.json` içinde yedeklidir.
- `read-inventory.mjs` domain/sertifika/Auth/kurallar/billing durumunu salt okunur
  yeniledi. `public-access-release.mjs before|after`: sekiz Functions servisi,
  Firestore/Storage kuralları, 11 proje, Auth ayarları ve admin claim'leri aynı;
  yayın sırasında uygulama kaynak hash'leri değişmedi. Functions/Storage/Auth
  veya diğer uygulamalara yayın yapılmadı. Kanıt `cloud-acceptance.json`.
- SEO Hosting helper'ı 11 proje / 22 sitemap URL'si / 23 statik React sayfası
  üretti. Gerçek HTTPS'te 23 HTML'in SHA'sı derlemeyle eşleşti; sitemap/robots
  aynı, eksik JS 404, anonim `admin.data` 401/UNAUTHENTICATED.
- `verify-public-access-live.mjs`: gerçek Edge pipe ile 1280/390 px'te 14
  görünüm ve altı eski ziyaretçi yolu geçti. Hesap/kütüphane/favori kontrolleri
  yok; taşma/renderer hatası yok. Mobil menü, kapalı yönetici kayıt yolu, reset
  talep sayfası ve eski reset sorgusunun korunması kontrol edildi. Ana sayfa ve
  katalog görselleri yüklenip decode edildikten sonra görüntüler incelendi.
- Misafir gerçek İndir düğmesiyle mevcut `Kutarya-Us-Model-Beyni-1.0.0.zip`
  paketini aldı: 3185 bayt, manifest SHA'sıyla eşleşti. Blackjack'in gerçek
  iframe/runtime açılışı ve toplu `play` cevabı geçti; tam oynanış/FPS kabulü
  değildir. Ziyaretçi profil/favori/geçmiş isteği bulunmadı. Kanıt
  `live-acceptance.json`, `canli-*.png`, `hosting-deploy.log` aynı klasördedir.
- Gerçek yetkili hesapla parola girişi ve gerçek mail teslimi ölçülmedi;
  kontrollü yerel Auth kabulünden ayrı açık sınırlardır. Parola/secret payload
  istenmedi; PC HTTP/emülatör/debug portu açılmadı. Eski silinmiş AI server/
  desktop testleri çalıştırılmış sayılmadı. Yerel 58/58 + build sonucu aşağıda.
- Görsel kabul tuzağı: Playwright fullPage ekran görüntüsü lazy görsellerin
  decode/çizimini beklemez; eksik görünen kapakları site hatası sanmadan her
  görsele scroll, complete/naturalWidth ve decode kontrolü yap.

## 9 Ekim 2026 — ziyaretçi hesabı/kütüphane kaldırma; yayın öncesi yerel kabul

- Kullanıcının yeni talebi, önceki zorunlu ziyaretçi login/kütüphane kapsamının
  yerini alır. Genel giriş/kayıt, profil ve Kütüphanem menüsü; kart/detay/player
  favori düğmeleri kaldırıldı. Katalog, koleksiyonlar, indirme, oynama, destek,
  temalar ve admin paneli mevcut yapıda korunur. Genel metinlerde katalog adı kullanılır.
- `/hesabim`, `/kutuphanem` ve `/auth/*` eski ziyaretçi yolları `/projeler`e
  replace ile yönlenir. Yönetim girişi `/admin/auth/login`; kayıt formu yoktur.
  Yalnız gamesAdmin claim'li hesap kabul edilir; yetkisiz girişte oturum kapatılır.
  Sunucunun mevcut admin/e-posta/profil kısıt denetimleri değiştirilmedi.
- `/auth/action` istisnası gereklidir: mevcut reset maili sunucuda hâlâ bu
  yolu üretir. Sorgu/oobCode korunarak `/admin/auth/action`a aktarılır. Yönetici
  doğrulama/kod yenileme/reset korunur; Functions veya ortak Auth sağlayıcısı
  değişmedi. Yönetim özel düzeninde yan menü gizlidir; hesap sayfası kaldırıldığı
  için erişilebilir çıkış düğmesi yönetim üst çubuğuna eklendi.
- Detay/player kişisel `recent` yazımları ve istemci `favorite` işlemi kaldırıldı.
  Provider eski normal ziyaretçi oturumları için `me` çağırmaz/yeni profil oluşturmaz.
  Ortak Firebase hesapları/UID'ler, geçmiş profil verisi ve backend hesap uçları
  silinmedi. Account.tsx ve eski Google regresyon yardımcıları etkin UI'da import
  edilmez; ileride yeniden açma açık kullanıcı kapsamı ister.
- Son davranış değişikliğinden sonra `npm run check`: 58/58 + TypeScript/Vite
  build geçti. `review-public-access.mjs` gerçek React/Provider'ı file üzerinden
  Edge pipe ile 1280/390 px'te kontrol etti: 26 yol/görünüm ve 8 işlem grubu,
  taşma/renderer hatası yok. Eski ziyaretçi oturumu, eski adres yönlendirmeleri,
  yetkisiz giriş reddi, admin giriş/çıkış/doğrulama ve eski reset sorgusu geçti.
  İndirme ve player kullanıcı eylemleri kontrollü servis/runtime ile ölçüldü;
  gerçek Firebase giriş/mail veya canlı dosya kabulü olarak sunulmaz.
- Katalog/görseller salt okunur canlıdan: 11 proje. Yayın öncesi SEO üretimi
  11 proje / 22 sitemap / 23 statik sayfa; eski hesap/favori linkleri genel
  HTML'de yok. Kanıt/inceleme ignore `artifacts/release-2026-10-09-public-access/`.
  README, SITE-PLANI v4, AGENTS, KABUL/YAYIN ve üst DEVIR güncellendi.
- Bu bölüm yayın öncesi yerel kabul kaydıdır; aynı gün verilen açık onayla
  yalnız Hosting yayını ve gerçek canlı kabul üstteki bölümde tamamlandı.
  Ortak Auth UID'leri, Functions/Storage/claims/kurallar ve diğer uygulamalar
  değiştirilmedi; port/parola/secret payload yok.

## 9 Ekim 2026 — model paylaşımında veri ve özel sistem sınırı

- Kullanıcı açıkça hatırlattı: "bizim verimiz ve setimiz bize özel olmalı".
  Model paylaşımı eğitim setini, veri hazırlama/eğitim hattını, özel site/backend
  sistemlerini, servis yapılandırmalarını veya sırları yayımlama yetkisi değildir.
  Yalnız istenen checkpoint ve çalışması için gereken minimum model/tokenizer/
  üretim dosyaları paylaşılır. KTY klasörü veya ham eğitim checkpoint'i topluca
  paketlenmez; dosya listesi ve checkpoint alanları açık izin listesiyle seçilir.
- Mevcut canlı KTY ZIP'i kamu indirme API'sinden yeniden tam indirildi;
  185880574 bayt/SHA256 6322DF98556B0CA8A5D76E81590E550E5D369289ED4A012992AA0BF4222E6C5D
  önceki yayımlanan paketle aynı. Sekiz dosyalı listede eğitim seti, train.py,
  günlük, özel backend/site kodu, mutlak özel yol veya servis sırrı yok.
  Python bağımlılıkları yalnız standart kütüphane/PyTorch/model/tokenizer/config.
- Checkpoint'in sekiz alanı ve mimari config'i izin listesiyle kontrol edildi.
  125 tensörün ek Python attribute'u veya tensör dışı storage verisi yok;
  state_dict metadata'sı yalnız standart PyTorch modül sürümleri. Optimizer,
  RNG, training_config, dataset_fingerprint ve veri ağırlıkları bulunmuyor.
  Public manifest'teki kaynak checkpoint SHA'sı veri seti fingerprint'i değildir.
- Kamu katalog metaverisi de özel yerel yol/eğitim alanı/sır içermiyor. Kabul
  ignore artifacts/release-2026-10-09-kty-step10000/privacy-audit.json ve
  privacy-audit-live-download.json, privacy-audit-content.json içinde.
  Bu turda yayın/paket değişmedi. Denetim yayımlanan dosya/alan kapsamındadır;
  modelin öğrenilen ağırlıklardan eğitim örneği üretmediğine dair test yapılmadı.

## 9 Ekim 2026 — KTY-1.0 tam 10.000. adım checkpoint'i canlı

- Kullanıcının yalnız 10.000. adım ağırlıklarını, parametre sayısıyla ve eğitim
  verisi olmadan yükleme talimatıyla https://kutarya.com/proje/kutarya-us-kty-1-0
  yayımlandı. Görünen ad Kutarya Us · KTY-1.0; sürüm 1.0.0-step10000, kaynak kod
  koleksiyonu. Önceki eğitimsiz 5M beyin ürünü korundu; toplam 11 gerçek proje.
- Kaynak D:\KTY-1.0\checkpoints\kty-1.0-v4-50m-step010000.pt, 600821973 bayt.
  SHA256 FD14D7E3F5E4B54024BC838226ED95F320E3DB4337049B382CFA6443835D5152.
  Filename yerine payload step=10000 doğrulandı; daha yeni 10348/10932 dosyaları
  kullanılmadı. Mimari: vocab 256, bağlam 768 bayt, dim 640, 10 katman/başlık,
  FFN 2560. Gerçek model parametre toplamı 50.055.680 (yaklaşık 50,06 milyon).
- AdamW eğitim checkpoint'i site 500 MiB dosya sınırını aşar. Yayın kopyasında
  yalnız model_name, checkpoint_version, chat_format, end_marker, reasoning_tag,
  model_state_dict, step, config bırakıldı. Optimizer, RNG, training_config,
  dataset_fingerprint ve metrics alınmadı; eğitim verisi/dizinleri okunmadı veya
  kopyalanmadı. train.py ve günlükler dahil değil. Kaynak checkpoint ve KTY
  çalışma dosyaları değişmedi; eğitim başlatılmadı, dtype/quantization uygulanmadı.
- Paket Kutarya-Us-KTY-1.0-Adim-10000.zip, 185880574 bayt; SHA256
  6322DF98556B0CA8A5D76E81590E550E5D369289ED4A012992AA0BF4222E6C5D.
  Sekiz dosya: kty-1.0-step10000.pt (200266979 bayt), model.py, tokenizer.py,
  yalnız mimari/üretim config.py, generate.py, README.md, requirements.txt,
  manifest.json. Inference PT SHA256
  AE4BC1A168A53F6ADCAF548C980E36174822B66212B4478C47F3562A17270594.
  Inference kopyası optimizer ile eğitim oturumuna devam checkpoint'i değildir.
- Hazırlama: python -X utf8 -B scripts/prepare-kty-checkpoint.py prepare.
  Yerel/bulut operatörü: node --require ./scripts/no-listeners.cjs
  scripts/publish-kutarya-us-beyin.mjs prepare|backup|upload|verify kty-step10000.
  Profilesiz komut önceki tek Python ürününü kullanır; onun paket hazırlama
  kabulü de geçti. Metadata projects-src/kutarya-us-kty-1-0.mjs. Kanıtlar ignore
  artifacts/release-2026-10-09-kty-step10000/; token/parola içermiyor.
- Model tensörleri kaynakla tek tek aynı; strict yükleme, 50.055.680 parametre,
  sonlu ağırlık/forward, ZIP CRC ve bütün iç dosya SHA'ları geçti. CPU gerçek
  selam üretimi: "Selam, buradayım. Ne konuşalım?". Temiz klasörde CLI de geçti.
  Windows Python 3.12.10/PyTorch 2.14.1+cpu; kalite benchmark'ı veya GPU ölçümü yok.
  Kullanım ZIP'i çıkarıp python generate.py --prompt "selam" --greedy;
  model.py/generate.py importları eğitim verisi olmadan çalışır.
- Hedef/domain/sertifika/Auth/bucket/kurallar salt okunur yenilendi; mevcut
  gamesService europe-west1 ve Storage US-EAST1 admin.fileBegin/Complete hattı.
  Geçici TokenCreator üyeliği token üretilince, yükleme öncesinde kaldırıldı.
  npm run check 58/58 + TypeScript/Vite build; yalnız Hosting yenilendi.
  Güncel Hosting de4a2f903b00e3ba, önceki 3da31883d12ecdd3 before.json'da yedekli.
  SEO: 11 proje, 22 sitemap adresi, 23 statik React sayfası. Sekiz Functions,
  Firestore/Storage ruleset'leri, admin claim'leri ve 10 diğer proje değişmedi.
- Tam bulut indirmesi ve gerçek canlı İndir düğmesinin ZIP'i byte/SHA ile geçti.
  Tarayıcıdan indirilen paket tekrar açılıp orijinalle tensör eşitliği, step,
  strict load ve CLI üretimi doğrulandı (download-acceptance.json).
  Canlı 1280 px görünüm taşmasız, renderer error 0; live-checkpoint-files.jpg.
  Yerel HTTP portu, parola/key payload veya yeni GPU testi yok.

## 9 Ekim 2026 — Kutarya Us Model Beyni kaynak kodu canlı

- Kullanıcının "siteye yükle bu python kodunu" talimatıyla
  https://kutarya.com/proje/kutarya-us-beyin yayımlandı. Kaynak kod koleksiyonu;
  1.0.0, Python/PyTorch, katalogda toplam 10 gerçek proje.
- `kutarya_us_beyin.py` değişmedi. Kaynak ZIP yalnız bu tek dosyayı içerir;
  veri, eğitim döngüsü veya eğitilmiş ağırlık eklenmedi, eğitim çalıştırılmadı.
  Sunucu kaynak rolünde ham .py kabul etmez; mevcut arşiv yükleme hattı kullanıldı.
- Paket Kutarya-Us-Model-Beyni-1.0.0.zip: 3185 bayt; SHA256
  93D3B2BD99802AC9BC2E3F701ED824DE66DEB9A931202A00CDEDE824EE470E95.
  İçindeki Python: 9036 bayt; SHA256
  F76135E9C23110F094859F565851651CF81D04F7A735F740A06FFCF70C104EC5.
- Metadata projects-src/kutarya-us-beyin.mjs; hazırlama/yedek/yükleme/kabul
  scripts/publish-kutarya-us-beyin.mjs prepare|backup|upload|verify.
  Kanıtlar ignore artifacts/release-2026-10-09-kutarya-us-beyin/.
  Kullanıcı lisans seçmedi; sayfada "Lisans belirtilmedi" yazıyor.
- Canlı hedef/sertifika/bucket doğrulandı; mevcut gamesService europe-west1
  ve Storage US-EAST1 kullanıldı. Doğrulanmış mevcut gamesAdmin hesabıyla
  admin.fileBegin/Complete; kısa ömürlü token bellekte, geçici IAM imza izni
  yüklemeden önce kaldırıldı. Parola/key payload veya yerel port kullanılmadı.
- npm run check 58/58 + TypeScript/Vite build geçti. Yalnız Hosting yayınlandı;
  SEO helper 10 proje / 21 sitemap adresi / 22 statik React sayfası üretti.
  Güncel Hosting 3da31883d12ecdd3; önceki 0413230d431dbb8a, katalog ve config
  before.json içinde yedekli. Sekiz Functions servisi, Firestore/Storage
  ruleset'leri, admin claim'leri ve dokuz diğer projenin kayıtları aynı kaldı.
- API'den tam bulut ZIP indirmesi ve gerçek canlı İndir düğmesinin indirdiği
  dosya ayrı ayrı byte/SHA ile doğrulandı; ZIP içindeki tek Python aslıyla aynı.
  Canlı sayfa/canonical/schema/sitemap ve kaynak koleksiyonu doğrulandı.
  Tarayıcı doğal 374 px görünümde taşma yok, renderer error 0; gerçek JPEG
  live-model-files.jpg. Bu turda 1280 px veya yeni GPU/model eğitimi testi yok.

## 8 Ekim 2026 — Kutarya Jenerik 1.3.1 canlı

Kullanıcının test/geliştirme/sürüm/yayın talimatıyla mevcut ürün güncellendi.
Uygulamada disk kayıt hatasında taslak ve çıktı klasörünün son geçerli değeri
korunur; motor sürümü package.json'dan okunur. 43/43 birim ve paketli 75/75
kabul, gerçek Emel/Ahmet, MP4/MP3 ve görüntü/ses ölçümü geçti. Canlı YouTube
paketli üretim kabulü oturum gereksinimiyle engellendi; ElevenLabs servis taklidi.

Setup 1.3.1: 254533579 bayt; SHA256
494F592E3BA1E520A3AC7796DEFC8548142B62517DBB7D29A55EEB38196640C0.
Altı gerçek 1.3.1 ekranı ve ürün açıklamaları yenilendi. Önceki 1.2 Setup
korundu; dosya listesi mevcut ürün sürümünü ilk sıraya alır. Tam bulut
indirmesi ve altı ekran boyut/SHA ile doğrulandı. Setup çalıştırılmadı.

Hosting 0413230d431dbb8a; önceki 5998163b5783affb yedeklendi.
58/58 + build, 21 statik React sayfası ve 19 sitemap URL'si.
Sekiz diğer katalog ürünü, sekiz Functions servisi, Firestore/Storage
kuralları ve admin claim'leri korundu; geçici IAM izni kaldırıldı.
Yerel sunucu/port veya parola/key payload yok. Kanıtlar
artifacts/kutarya-jenerik/; uygulama teslimi D:\KutaryaJenerik\Kanitlar\1.3.1-teslim/.
Yayın betikleri artık sürümden manifest adını ve güncel teslim/screenshot yolunu
okur; sabit 1.2 dosyalarıyla yanlış sürüm yayımlamaz. Görsellerin eski URL'leri
aynı sayıdaki yeni ekranları gizlemesin diye upload SHA karşılaştırması vardır.
Canlı 1280/390 px altı ekran/iki Setup, güncel sürüm ilk sırada, taşma yok,
sıfır renderer hatası ve gerçek yeni Setup İndir düğmesi kabulü geçti.

## 7 Ekim 2026 — Kutarya Jenerik 1.2.0 canlı

Kullanıcı mevcut Jenerik Setup'ını resim/açıklamalarla siteye eklemeyi istedi.
https://kutarya.com/proje/kutarya-jenerik yayımlandı; katalog artık dokuz gerçek
proje içeriyor. Ana sayfada yeni ürün kartı, Masaüstü koleksiyonu, dört gerçek
1.2.0 ekranı, açıklama, kullanım/kurulum ve Windows gereksinimleri var.
Tek dosya: Kutarya-Jenerik-Setup-1.2.0.exe, 225325235 bayt; SHA256
E22F2BF6647A37FA8E0211B5C906FFD79ABC9B8D15F66F557CCA98D88ACC8A58.
Tam dosya buluttan indirilip byte/SHA ile; gerçek tarayıcı İndir düğmesinin
başlattığı dosya ayrıca adı/Storage adresiyle doğrulandı. İkinci büyük tarayıcı
transferi başladıktan sonra iptal edildi. Installer çalıştırılmadı.

Güncel Hosting sürümü 5998163b5783affb; önceki 03796011d9d93fce
artifacts/kutarya-jenerik/hosting-before.json içinde yedeklendi. SEO helper'ı
21 statik React sayfası ve 19 sitemap adresi üretti. 58/58 + build;
1280/390 px dört resim/tek dosya/taşma yok/sıfır renderer hatası kabulü geçti.
Sekiz önceki katalog kaydı, sekiz Functions servisi, Firestore/Storage kuralları,
mevcut admin claim'leri ve 19 Jenerik kaynak/paket dosyası değişmedi.
Mevcut admin kısa ömürlü token'ıyla yükleme; geçici IAM imza izni kaldırıldı.
Şifre/key payload istenmedi; yerel sunucu/port açılmadı; Kutarya Video korundu.

Uygulamanın bekleyen +/textbox, her şarkıya ayrı jenerik, şarkıyı dinleme ve
zorunlu çıktı adı talepleri uygulanmadı; mevcut Setup aynen yayımlandı.
Kaynak açıklama projects-src/kutarya-jenerik.mjs; komut/kabul ayrıntıları
docs/KUTARYA-JENERIK.md. Kanıtlar ignore artifacts/kutarya-jenerik/.

## Önceki canlı durum — 7 Ekim 2026, Jenerik öncesi

Kullanıcı Hosting yayınını açıkça onayladı: **kutarya-ai-3169 / kutarya.com**.
Şifre isteyen işlem iptal edilir; PC'de sunucu/port açılmaz; açık Kutarya Video
korunur. Güncel SEO Hosting sürümü `03796011d9d93fce`; önceki katalog
`9a946d116eab4fd9` ve AI `8d7f667bc98add29` sürümleri kayıtlı/yedekli.
Yeni paylaşım kataloğu ve sekiz gerçek proje canlı. gamesService europe-west1;
mevcut doğrulanmış admin'de gamesAdmin. Firestore kuralları ve önceki yedi servis
aynı; Storage users/public/indirmeler korunarak projectAssets kapsamı eklendi.
Eski tarihli "deploy yok / onay bekliyor" paragrafları tarihsel durumdur.

İlk yayın 53/53 + build; SEO sonrası 58/58. Rules REST 12/12, canlı 12 rota, 1280/390 px görünüm, gerçek
Setup düğmesiyle 237.083.465 bayt/SHA kabulü geçti. 14 paket ve 19 görsel
Storage'dan SHA/boyut ile; beş runtime'ın 12 dosyası Hosting'den doğrulandı.
Normal kullanıcı girişi/mail teslimi, fiziksel cihaz ve Windows kurulum/kaldırma
bu yayında ölçülmedi. Installer çalıştırılmadı; açık portable süreç korundu.
Kanıtlar ignore artifacts/release-2026-10-07 ve artifacts/kutarya-video;
ayrıntılar docs/YAYIN.md, docs/KUTARYA-VIDEO.md, docs/KABUL.md.

Yayın helper'ı deploy-release.mjs sabit hedef, --non-interactive, kapalı stdin,
şifre talebinde iptal kullanır. FIREBASE_FUNCTIONS_DISCOVERY_OUTPUT_PATH=true
CLI discovery'yi sunucu yerine manifest çıktısı yapar; no-listeners.cjs listen'i
engeller. Mevcut CLI oturumu kullanıldı; secret payload veya kalıcı key yok.
authorize-catalog-release geçici IAM imza iznini token üretiminin hemen ardından
kaldırdı; token yalnız child env/bellekte. IAM getIamPolicy REST **POST**;
izin yayılması ilk denemelerde ~90 sn sürdü. Admin SDK özel OAuth credential'i
Auth'ta çalıştı, Firestore'da ADC/cert istedi; katalog operatörü Firestore REST
kullanır. Ham SDK hata nesnesi Authorization taşıyabilir: yalnız error.message,
Bearer maskeleme kullan; ham request/config/credential yazma.

## 7 Ekim 2026 — SEO ve Search Console

Kullanıcı sitemaps/SEO'yu düzenleme ve Search Console'da işlem yapmayı istedi.
Mevcut Kutarya Chrome oturumu sc-domain:kutarya.com yetkili; parola gerekmedi.
Yanlış ana sayfa HTML site haritası kaydı kaldırıldı; doğru sitemap.xml yeniden
gönderildi, Google başarı mesajı görüldü. Yeni 18 URL henüz işlendi diye sunulmaz.
Kutarya Video için canlı kontrol sonrası "Dizine eklenmesi istendi" görüldü.
Ana sayfa Google'da mevcut; yeni içerik için yeniden tarama isteği de kabul edildi.
Google işlemesi henüz tamamlandı diye sunulmaz; sonuçlar docs/SEO.md'de.

src/seo.mjs istemci/build ortak metadata; scripts/build-seo.mjs gerçek public
katalog + aynı React UI'dan 20 statik HTML/18 sitemap adresi/19 görsel üretir.
Deploy helper her Hosting'de SEO'yu yeniler; firebase.seo-release.json generated
config kullanılır. Normal build'in firebase.json config'ini elle deploy etme.
dist/app.html auth/admin/yeni panel projelerinin aynı SPA akışını korur;
exact genel rewrites önce. Proje bulunmadığında JS noindex; HTTP 404 iddiası yok.
58/58, 20 canlı HTML SHA, XML/JSON-LD/301/noindex/PNG ve tarayıcı meta/dosya
kontrolleri geçti. 1200x630 paylaşım PNG'si mevcut vektör logo ile oluşturuldu.

www Firebase'de eksikti; CNAME zaten ana domain üzerinden Hosting'e gidiyordu.
Custom domain + kutarya.com 301 hedefi eklendi; host/ownership ACTIVE,
sertifika CERT_PROPAGATING. GoDaddy şifre istedi, o işlem iptal edilip kapatıldı;
DNS değişmedi. 11:09 UTC gerçek HTTPS/TLS geçti: www ana sayfa/proje/sitemap
yolu koruyarak kutarya.com'a 301 verir. İstenen CNAME kutarya-ai-3169.web.app;
mevcut apex CNAME üzerinden çalıştı. docs/SEO.md / artifacts/seo-2026-10-07.
İki eski www 404 kaydı için Google düzeltme doğrulaması başladı (7.10.2026);
Google'ın nihai doğrulama/indeksleme sonucunu başarılı sayma.
Portable PID 28976 aynı başlangıçla açık; yedi kaynak ve EXE SHA baseline ile
aynı. Bu SEO işi yerel sunucu/emülatör/debug portu açmadı.

## 7 Ekim 2026 — ayrı Kutarya Jenerik masaüstü uygulaması

Kullanıcı yeni bir D: PC uygulaması istedi; fonu da kendilerinin seçeceğini
belirtti. D:\KutaryaJenerik kuruldu; kaynak ve EXE ayrı, Kutarya Video dosyaları
sekiz baseline SHA ile aynı. YouTube/yerel şarkı → tam ortada siyah ekran →
hazır jenerik veya metin+Emel/Ahmet/diğer ses → seçilen fon → şarkı devamı.
Fade şarkıya; jenerik sesine yok. MP4/MP3, kuyruk/iptal/kalıcı ayarlar/önizleme.
8/8 birim ve teslim EXE'sinde 24/24 kabul geçti; gerçek 1080p YouTube+TTS+
MP4/MP3 üretimi, tekrar kullanım/geçmiş, önizleme/seek ve iptal doğrulandı.
Normal uygulama boş geçmişle açık bırakıldı; gerçek başlangıç ekranı alındı.
15:40'ta launcher ve tüm Electron alt süreçlerinde TCP listen/UDP endpoint yoktu.
Son kabul durumu D:\KutaryaJenerik\DEVIR.md ve Kanitlar/ altındadır.
Yerel HTTP/emülatör/debug portu, site/Firebase/GSC işlemi bu görevde yapılmadı.
Bu kayıt uygulamayı siteye yükleme/deploy onayı değildir; yeni katalog eklenmedi.

## 4 Ekim 2026 — oyun sitesi planı

- Kullanıcı bu klasörde Unity ve web oyunları içeren bir site planı istedi.
  Hedef `kutarya.com`, Firebase Hosting. **Admin paneli ve Kutarya AI benzeri
  login ilk sürümün zorunlu parçalarıdır.**
- Başlangıçta klasör boştu. Ayrıntılı plan ve yerel asistan talimatı yazıldı.
- Eski AI çalışma klasörleri yok; kök Git HEAD `338f4c0` üzerindeki Auth
  kaynakları read-only incelendi. E-posta/şifre, Google popup/redirect,
  API ile altı haneli kod doğrulama bulundu. Parola sıfırlama istemcisi
  Firebase sendPasswordResetEmail kullanıyor; özel doğrulama mailiyle
  aynı göndericiyi kullandığı henüz kanıtlanmadı.
- Ortak Kutarya hesabını korumak hedefleniyor; canlı Auth kullanıcıları,
  mail ayarları, Hosting target/domain ve billing henüz doğrulanmadı.
- İlk sürüm için misafir oynama, üye kütüphanesi, katalog/admin önerildi.
  İlk oyun ve kesin görsel tercih henüz seçilmedi.
- Panel katalog ve etkin doğrulanmış sürümü yönetir. İlk sürümde oyun paketi
  Hosting yayını kontrollü CLI adımıdır; otomatik ZIP hattı sonraki aşama.
- Uygulama/paket kurulumu, Firebase ayarı veya canlı yayın yapılmadı.
  Çalışan oyun, gerçek mail teslimi veya test geçti iddiası yok.
- Sonraki iş: plandaki Aşama 0 envanteri, ardından ana sayfa/login/admin
  tasarım ve proje iskeleti. Kullanıcının mevcut talebi planla sınırlıydı.

## 4 Ekim 2026 — uygulama ve yerel kabul tamamlandı; yayın bekliyor

- Kullanıcı planı genişletmemizi ve siteyi kurup tamamlanana kadar çalışmamızı
  istedi. Plan v2 ve React/TypeScript/Vite uygulaması bu klasörde oluşturuldu.
  Ana sayfa/katalog/arama/cihaz filtreleri, dört gerçek native oyun,
  login/kayıt/Google kodu/altı haneli doğrulama/özel reset, hesap/kütüphane ve
  zorunlu admin paneli uygulandı. Ayrıntılar `docs/KABUL.md`.
- Sunucu `functions/index.js` içindeki tek callable `gamesService`;
  ayrı `kutarya-games` codebase, europe-west1, Node 22, maxInstances=3.
  Admin yetkisi doğrulanmış `gamesAdmin` claim'iyle sunucuda uygulanır.
  Eski AI/mobile API'leri, ödeme, kullanıcı Auth UID'leri değiştirilmedi.
- Catalog, kategori, duyuru, destek, profil/favori/geçmiş, kapak (1 MB,
  MIME+imza kontrolü) ve audit gerçek API'ye bağlı. UI testinde admin çıkışı
  ve üye girişi rol/profil taşımadı. Geç eski profil yanıtının yeni oturuma
  yazılması engellendi. Oyun açılışı tekrarında sayaç artmaz/hata gösterilmez.
- Yerelde Auth 9099, Firestore 8085, Functions 5005, Storage 9199;
  proje `demo-kutarya-games`, Vite 5180. `scripts/start-local.ps1`
  UTF-8 BOM, parser ve `-NoSeed` çalıştırması geçti. İlk çalıştırma emülatör
  discovery için `FUNCTIONS_DISCOVERY_TIMEOUT=60` ister. CLI/Java gerekir.
- `npm run seed:local` üç yerel test hesabının şifrelerini değiştirir ve
  örnek profilleri/kataloğu sıfırlar; eski tarayıcı oturumunu yenile.
  Kimlik bilgileri yalnız ignore `artifacts/local-credentials.json`.
  Entegrasyon testi doğrulanmamış kullanıcıyı doğrular; tekrar koşmadan seed yap.
- Son doğrulama: build geçti; 12/12 güvenlik/2048/paket testi Node 24 ve
  ayrıca Node 22.23.3 üzerinde geçti; 21/21 emülatör entegrasyonu geçti;
  11/11 Hosting rota/404/MIME/gzip/Brotli/CORS kontrolü geçti; npm audit
  uygulama ve Functions için 0 açık. Entegrasyon sunucusu yerelde Node 24
  kullandı; üretim Node 22 runtime/kullanıcı kabulü yayın sonrası yapılacak.
- Tarayıcıda Neon/Yörünge oynandı, Memory tamamen çözüldü, 2048 hamleleri
  doğrulandı. Desktop ve 390 px mobil ana/login/katalog/detay/hesap/admin/destek
  incelendi; yatay taşma yok. Kapak yükleme/kaydetme ve gerçek görüntü açıldı.
  Kanıtlar `artifacts/screenshots/`; kabul/Hosting/integration JSON raporları var.
- Paket hattı `import-game.mjs` + `operator.mjs register-version`;
  eksik kaynak, değişmez sürüm, SHA/boyut ve gerçek browser raporu ister.
  Ayrı generic web test paketi gerçek iframe/tam ekran ve Hosting üzerinde
  eksik paket/yeniden deneme ile geçti. Test paketi temizlendi. Gerçek Unity
  build sağlanmadı: Unity runtime, IndexedDB, WebAssembly/telefon kabulü yok.
- Canlı salt okunur envanter: proje/Hosting `kutarya-ai-3169`, mevcut web App
  1:436645080136:web:1bc70319d7aadd1b6bfc7d; kutarya.com domain/sertifika
  ACTIVE; Google/e-posta enabled; mevcut Auth kullanıcıları var; billing açık.
  Kapak bucket `kutarya-ai-3169.firebasestorage.app`, US-EAST1.
- Mail yeni servis tarafından mevcut Secret Manager `MOBILE_MAIL_PASS`
  kullanılarak gönderilecek; latest ENABLED yalnız metadata ile doğrulandı.
  Sırrın payload'ı okunmadı/kopyalanmadı. Gerçek SMTP teslimi hâlâ açık.
  Üretim Auth domain kutarya.com; OAuth redirect URI /__/auth/handler gerçek
  Google giriş kabulünde ayrıca doğrulanmalı. Prod web config ignore .env dosyası.
- Canlı Firestore ruleset incelendi: oyun koleksiyonlarına izin yok, genel
  deny-all var. Lokal firestore/storage deny-all kuralları ortak projeye
  DEPLOY EDİLMEZ; yalnız hosting ve functions:kutarya-games yayımlanır.
- Yeni Windows tuzağı: Firebase CLI Superstatic glob-slasher header glob
  yollarını ters eğik çizgiye çevirip sessizce eşleşmeyebiliyor. Header kuralları
  / ve ters eğik çizgiyi kabul eden RE2 uyumlu regex oldu; Hosting emülatöründe
  gerçek Content-Type/Encoding yanıtları ölçüldü. JS gzip/br de JavaScript MIME
  ister; yalnız Content-Encoding yeterli değildir.
- Emülatör dosya değişikliği sonrası discovery tamamlanmadan test başlatılırsa
  eski worker yanıt verebilir. Son entegrasyon yeni `counted` alanını kontrol ederek
  yeniden koşuldu ve 21/21 geçti. “Loaded functions definitions” sonrasını bekle.
- `firebase functions:list --json` mevcut Functions env sırlarını gösterebilir;
  ham çıktıyı dökme. `scripts/read-inventory.mjs` yalnız güvenli metadata
  ve yetkili kuralları toplar. Prod sırları repoya/sohbete taşıma.
- Canlı yayın YAPILMADI. Kullanıcının somut yayın/test kapısı kararı ve ilk
  admin hesabı bekleniyor. Kök AGENTS eski iki test takımını istiyor, klasörler
  silinmiş; bu koşul geçti denmedi, eski projeler geri yüklenmedi.
  Yayın sonrası gerçek mail, Google hesabı, canlı oyuncu akışları ve fiziksel
  cihaz kabulü `docs/YAYIN.md` üzerinden kapatılmalı. Tüm site bitişiyle
  yerel uygulama kabulünü birbirine karıştırma.

### Kullanıcının yayın kararı

- Kullanıcı somut yayın sorusuna **“Önce yerel sürümü incele”** yanıtını verdi.
  Bu turda canlı deploy veya claim değişimi yapma; yerel sürümü incelemesine sun.
- İlk canlı admin için **kutaryaai@gmail.com** hesabını belirtti. Bu seçim,
  yayın bekletme kararını kaldırmaz; claim ataması henüz yapılmadı.
- Salt okunur Auth lookup bu hesabın mevcut ve e-posta doğrulanmış olduğunu,
  henüz gamesAdmin claim'i olmadığını doğruladı. UID yalnız ignore
  `artifacts/admin-account-inventory.json` dosyasında. Üretim değişikliği yok.
- Yerel admin ayrı demo hesabıdır; credentials dosyası yerel test içindir,
  bu Gmail hesabının gerçek şifresi değildir.
- Yerel önizleme admin için demo yönetici hesabıyla açık bırakıldı. Ana sayfa
  5180 ve /admin kullanılabilir; emülatörler/Vite çalışıyor. Yalnız ek 5182
  Hosting kontrol emülatörü sonlandırıldı. Kullanıcının incelemesi bekleniyor.


## 4 Ekim 2026 — v3 proje paylaşımı, açık tema ve dosya hattı

Bu kayıt eski v2 oyun kapsamının yerini alır. Kullanıcı sitenin .NET,
HTML/CSS/JS, mobil uygulama/kaynak, Unity kurulum ve web oyunları için genel
paylaşım platformu olmasını istedi. Açık varsayılan ve çoklu tema, daha düzenli
CSS/paneller/görseller; eski dört oyunu kaldırma talebi uygulandı. Admin/login
zorunluluğu korunuyor. Canlı tercih hâlâ Önce yerel sürümü incele.

- Katalog altı tür: game/desktop/web/mobile/source/tool. Home/koleksiyon/filtre/
  liste/detay/galeri/dosya/sürüm notları ve admin editörü yenilendi. Açık, sıcak,
  koyu, sistem seçimi ve prepaint kalıcılığı var. Koyu temada button renk
  özgüllüğü :where ile düzeltildi; outline ve krem hero butonu okunaklı.
- Native Games.tsx/merge ve SVG kapakları kaldırıldı; games başlangıcı boş.
  Seed yalnız neon-rota/yorunge/hafiza-atlasi/birlesim eski kayıtları ve eski üç
  kategoriyi kaldırır; kullanıcının diğer projelerini silmez. Sitemap yeni
  genel/koleksiyon adresleri oldu, eski oyun sayfaları kaldırıldı.
- Gerçek resumable Storage upload: 500 MB/dosya, 20 dosya/proje, ilerleme/
  duraklat/sürdür/iptal. 12 MB browser transferi ölçüldü; 500 MB transferi değil.
  ZIP/7Z/EXE/MSI/APK/AAB/GZ/TGZ/PDF, kaynak yalnız arşiv; imza kontrolü tam
  dosya analizi/virüs veya gerçek kurulum kabulü sayılmaz.
- admin.fileBegin/Complete/Abort/Remove ve download API; özel projectUploads
  bileti, kendi UID kapsamı, metadata/boyut/imza, immutable generation,
  transaction ile dosya kaydı, aynı ad/sürüm/rol/platform tekrarına ret. Kamu
  dosya modelinde Storage yolu/generation yok. Sunucu admin + e-posta doğrulama
  ve platform üyelik kısıtlarını uygular. Yayın için gerçek dosya/depo veya
  doğrulanmış web sürümü gerekir; istemci files/verified enjekte edemez.
- admin.game transaction mevcut güvenilir dosya/sürümleri korur; projectSlugs
  ile eşzamanlı adres tekilliği ölçüldü. Metin/görsel save, dosya complete ile
  hemen kaydedilir; form kullanıcısına iki işleyiş aynıymış gibi anlatma.
- İndirmede generation/boyut kontrolü ve attachment URL; kaynağı ve browser
  indirilen ZIP SHA eşleşti. Arşiv katalog/API erişimini gizler, önceden verilen
  Firebase Storage token URL'sini geri çağırmaz. Gerekirse silme/token iptali ayrı.
- İptal tuzağı: kurulu Firebase Storage SDK 12.19 paused durumunda cancel()
  çağrısında false döndürüp callback üretmiyor. Önce resume sonra cancel gerekir.
  Gerçek paused yüklemede iptal ve formun açılması gözlendi; cleanup aynı yolu izler.
- Storage emulator allow create tek başına overwrite'ı önlemedi; resource == null
  eklendi, gerçek üzerine yazma reddedildi. Emulator kural hot reload'una güvenme;
  test kuralları initializeTestEnvironment üzerinden yükler.
- Kullanıcı Firebase public config ve Firestore kurallarını iki kez verdi.
  Son attachment d95caeb2-f379-458b-a2a2-2293ef188548/Yapıştırılan metin.txt canlı
  salt okunur Firestore metniyle normalize edilmiş karşılaştırmada aynı.
  apiKey/project/appId eşleşti. Public storage/sender/database/measurement config
  env'e eklendi; üretim authDomain kutarya.com mevcut özel-domain akışını korur.
  Realtime Database ve Analytics bu sürümde etkinleştirilmedi. Sırlar taşınmadı.
- Vite HMR tuzağı: initializeApp opsiyonlarına yeni undefined alanlar eklemek
  JSON aynı görünse bile duplicate-app üretir. Firebase bağlantısı getApps/getApp
  ile tekrar kullanılır, emulator connect yalnız ilk init'te olur. Gerçek browser
  reload/admin Yenile çalıştı, düzeltmeden sonra yeni console error gözlenmedi.
- Canlı Storage kuralları read-inventory.mjs ile salt okunur alındı. Eski global
  email-admin catch-all yeni yolun kısıtlarını aşabileceği için öneride sadece
  projectAssets dışlanır; users/public/indirmeler mevcut davranışını korur.
  prepare-storage-rules.mjs uyumsuz taban yapısında durur; canlı taban ve öneri
  SHA kaydı verir. Ayrı firebase.storage-release.json yalnız bu bucket/rules'i
  kapsar. 8 karşılaştırmalı test yalnız yerel emulatörde geçti, local kurallar
  ardından geri yüklenir. CANLI KURAL YAYINI YAPILMADI. Önceki 'yalnız hosting/
  functions yayınla' v2 prosedürü artık indirilebilir browser upload için yeterli
  değildir; docs/YAYIN.md güncel Storage merge/onay adımını oku. Genel deploy yok.
- Dekoratif studio hero builtin imagegen ile üretildi: public/media/kutarya-studio.png,
  1672x941, 1.8 MB; kullanıcı oyun kapağı/gerçek oyun sahnesi diye sunulmaz.
  Logo korundu; project cover/gallery admin gerçek yüklemesidir.
- Son test: üretim build geçti; 11/11 core/import (Node 24, ayrıca 22.23.3),
  38/38 Auth/Firestore/Functions/Storage entegrasyonu, 19/19 gerçek Hosting
  rota/404/MIME/gzip/Brotli/CORS ve 8/8 öneri Storage karşılaştırması. Prod
  bağımlılık audit uygulama/Functions 0; Prettier tüm kodlarda geçti.
- Browser gerçek draft/cover/gallery/file/publish/download, filtre/arama/liste,
  paused/resume/cancel ve dört tema; 390 px home/catalog/detail/login/admin/editor
  yatay taşma yok. Generic web fixture gerçek iframe Tur tamamlandı: 1, kontroller
  ve tam ekran görünümü çalıştı. Unity/kurulum/fiziksel telefon kabulü değildir.
- CUA viewport global sanma: override görünür sekmeye uygulanır, arka sekme eski
  genişlikte kalır. Her mobil ölçümde innerWidth/clientWidth/scrollWidth oku.
  Sonunda görünür sekme viewport.reset() ile 746/default genişliğe geri döndü.
- İki kabul projesi, bağlı Storage dosyaları ve public/games paket fixture temizlendi;
  final read-only gamesCatalog remainingProjects=[] doğrulandı. Test audit kayıtları
  gerçek yerel işlemlerdir; fake kullanıcı/indirme metriği değildir.
- start-local.ps1 BOM/parser ve -NoSeed geçti. Aynı çalışan serviste kimlikleri
  gereksiz döndürmez; yeni emulator başlangıcında seed yapar, -Reseed elle yeniler.
  Test kod maili unverified hesabı doğrular; integration tekrarından önce seed gerekir.
- README/SITE-PLANI v3/AGENTS/docs KABUL/YAYIN güncellendi. Yeni 5182 Hosting
  kontrolü sonlandırıldı; 5180 Vite + Auth/Firestore/Functions/Storage açık.
  Home ve /admin/projeler sekmeleri güncel yerel demo yönetici oturumuyla tutuldu;
  credentials ignore artifacts/local-credentials.json, gerçek Gmail şifresi değil.
  Son ekranlar v3-final-home-light.jpg ve v3-final-admin.jpg.
- Canlı Hosting/Functions/Storage/claim değişmedi. Gerçek SMTP/Google OAuth,
  gerçek kullanıcı paketleri/Unity, fiziksel telefon ve eski silinmiş 385/102 test
  kapısının uygulanması canlı yayın öncesi/sonrası açık. Önceki kullanıcının
  yerel inceleme kararı kaldırılmadı. Yeni testleri eski takım sonucu gibi sunma.

### 2026-10-04 — Google giriş akışı düzeltmesi; yalnız yerel kabul

- Codex tarayıcısında popup girişi işlem durumunda bekliyordu. Yerel emülatörde
  varsayılan aynı sekme akışı; üretimde popup-blocked redirect ve ayrıca
  Aynı sekmede giriş yap seçeneği kullanılır. Google hesap seçimi Türkçedir.
- google-flow.ts dönüş hedefini güvenli iç adrese sınırlar, query/hash korur.
  Session marker yalnız hedef/zaman içerir, 30 dakika geçerlidir; token içermez.
  StrictMode redirect sonucunu bir kez okur; handledRedirect sonraki login
  ziyaretine eski credential taşınmasını engeller. Bunu regresyon testi korur.
- İptal/ağ/domain/provider/depolama hataları ayrıldı. Auth başarılı olup profil
  yüklenmezse ayrı açıklama ve tekrar tamamlama sunulur. Hesap bağlamada parola
  girişinin aynı e-postaya ait olması gerekir; credential yalnız React belleğinde.
- Bilinen Hosting adreslerinde authDomain mevcut host seçilir; diğerlerinde
  yapılandırma korunur. Console authorizedDomains ve Google /__/auth/handler
  callback ayarları değiştirilmedi; her canlı host gerçek OAuth ile doğrulanmalı.
- Bu görevde npm test 21/21 (11 mevcut + 10 Google), Node 22.23.3 Google 10/10,
  build ve değişen kodların Prettier kontrolü geçti. Önceki entegrasyon takımları
  bu görevde yeniden çalıştırılmadı; gerçek Google OAuth ölçülmedi.
- Gerçek yerel tarayıcı: hesap seçimi -> kütüphane, filtreli dönüş hedefi,
  provider ekranından geri -> yeniden deneme ve çıkış -> yeniden Google girişi
  gözlendi. Auth emülatörü Google Kabul / google-kabul@kutarya.test hesabında
  google.com, emailVerified=true, gamesAdmin=false salt okunur doğrulandı.
  Bu test hesabı yerelde bırakıldı; inceleme için demo admin oturumu geri açıldı.
- Kanıt: artifacts/google-auth-acceptance.json,
  artifacts/screenshots/google-signin-fixed.jpg ve google-signin-success.jpg.
  README/docs KABUL/YAYIN güncellendi. 5180 ve servis emülatörleri açık.
  Canlı yayın/kurallar/claim/provider ayarları değişmedi; kullanıcının önce yerel
  inceleme tercihi geçerli.

### 2026-10-05 — Kullanıcının üç HTML oyunu; yalnız yerel güncelleme

- Kullanıcı blackjack.html, rulet.html ve pixelgun.html sağladı. Masaüstü ve
  Downloads asılları değiştirilmedi. Kaynaklar games-src/, etkin runtime'lar
  public/games/: blackjack 1.0.3, rulet 1.0.1, pixelgun 1.0.0. Üç gerçek proje
  yerel katalogda yayında; her birinde yalnız bir güncel indirilebilir ZIP var.
- Blackjack sabit masa yerine akış düzeni kullanır. 390x466 gerçek tarayıcıda
  hamlelerin altı 434 px; iki el ve dört hamle görünür. Animasyonda çift işlem ve
  sıfırlama sırasında eski turun devam etmesi resolving/roundEpoch ile düzeldi.
  Rulet çark/etiket/top boyutu ResizeObserver ile izlenir. Block Arena menü ve
  dar ekran ayarları düzeldi; mevcut WebGL/bot oyunu korundu.
- Masa oyunları sanal puandır. Harici fontlar kaldırıldı; çevrimdışı paket
  index.html ve OKU.txt içerir. CSS @import silerken URL içinde semicolon olabilir:
  [^;]+ regex'i kırık CSS bıraktı; düzeltildi. LightningCSS parser regresyonu var.
- Kapaklar gerçek oyun ekran görüntüleridir: public/media/games/*.jpg. CUA
  screenshot JPEG döndü; uzantı/magic eşleştirildi. İndirme admin.fileBegin/
  Complete + Storage SDK hattından geçer. Üç gerçek tarayıcı ZIP indirmesinin
  SHA'sı kaynak ZIP ile eşleşti; artifacts/user-games/download-acceptance.json.
- Player ayrı sekmede açabilir; sandbox allow-scripts/allow-pointer-lock kaldı,
  same-origin eklenmedi. Block Arena kalıcı profil için ayrı sekme/indirilen HTML
  ister. Fiziksel telefon, FPS ölçümü ve her mod/silahın tam maçı ölçülmedi.
- Doğrudan iletişim kaynak ve yerel settings'te kutaryaai@gmail.com.
  Google'ın görülen hesap ekleme ekranı Auth emülatörü simülasyonuydu; yerel
  düğme bunu açıkça söyler. Üretim sağlayıcı akışı değişmedi; gerçek Google OAuth
  canlı kabulü hâlâ açık. Yerel test sayfasına gerçek Google şifresi girilmez.
- Bu görev: npm test 27/27, servis entegrasyonu 38/38, build ve değişen kodlarda
  Prettier geçti. Üç oyun direct runtime ve site iframe'inde oynandı; admin üç
  published proje/birer dosya gösterdi. Son katalogdaki üç kapak yüklenmiş olarak
  gözlendi. Eski silinmiş 385/102 takımları bu sonuçlar değildir.
- scripts/install-user-games-local.mjs yalnız demo-kutarya-games'e yazar.
  draft/publish aşamaları hazır paket ve gerçek browser raporu ister. Ara sürümler
  clean-user-game-iterations-local.mjs ile yedeklenip yerelden temizlendi.
  Firestore tek başına açıkken Auth/Functions/Storage kapalıydı: yalnız eksik üç
  servis açıldı, Firestore 8085 korundu; yeni Auth için seed/oturum yenilendi.
  Kısmi Storage sıfırlamasında mevcut katalog dosya kayıtları otomatik onarılmaz;
  tam reset ile yeniden kurulum veya panelden eksik dosyaları yeniden yükleme gerekir.
- docs/KULLANICI-OYUNLARI.md analiz/kabul/yükleme açıklamasıdır. Güncel ekran
  artifacts/screenshots/user-games-catalog-final.jpg. 5180 ve servis emülatörleri
  açık, yerel demo admin oturumu tutuldu. Canlı deploy/kurallar/claim/provider
  değişmedi; kullanıcı bu görevde özellikle deploy istemedi.

### 2026-10-05 — Kutarya Blok Diyarı 0.1.0

- Kullanıcı Minecraft tarzında geniş, çok mekanikli web oyunu istedi. Özgün
  Blok Diyarı dördüncü oyun olarak yerel kataloğa eklendi; Unity projeleri/Mojang
  varlıkları kullanılmadı. Kaynak games-src/blok-diyari core/renderer/game.mjs
  ve template.html; build-blok-diyari.mjs tek çevrimdışı HTML üretir.
- 160x160x64 tohumlu dünya/biyom/mağara/maden, chunk WebGL, kazma/yerleştirme,
  27 envanter/9 hızlı yuva, 15 tarif, kazma aşınması, fırın/yakıt, tarım,
  açlık/can/hasar, gece gölgeleri/yatak/yeniden doğma, sandıklar/kule hedefi,
  yaratıcı katalog/uçuş ve Türkçe menüler. Dinamik meşale ışığı/sıvı akışı yok.
- Save seed+edits+player+inventory+crops+pending smelt içerir; sıkı JSON içe
  aktarım kontrolü var. Sandbox same-origin açılmadı; iframe otomatik kayıt
  kapalı uyarır, JSON dışa/içe aktar veya ayrı sekmede oyna. Fare kilidi çıkışı
  duraklatır; fallback drag ve dokunmatik düğmeler var. Kaz tap'lerinde ilerleme
  pointerup'ta sıfırlanıyordu; 1.5 sn grace ile düzeldi. Kamp yüksekliği tohum
  arazisine uyarlanarak yapay derin başlangıç çukuru kaldırıldı.
- Etkin paket public/games/blok-diyari/0.1.0 immutable manifestli 2 dosya,
  98.890 bayt. ZIP 28.704 bayt, yalnız index.html+OKU.txt. Gerçek tarayıcı
  indirmesi SHA C041A3062A1A20A114E1F03815BE87969F349C346D8DBB0BF70F1D7AA06645B0
  ile eşleşti. Kapak gerçek uçuş ekranı public/media/games/blok-diyari.jpg.
- Installer --game=blok-diyari filtresi yalnız yeni projeyi kurdu; önceki üç
  oyun/versiyon korunuyor. local-install.json son filtreli kurulumu içerir,
  kataloğun tamamı değildir. Gerçek katalog 4 proje; yeni projede 1 dosya.
- Bu görev: 34/34 kod testi, 38/38 entegrasyon ve build geçti. Integration ilk
  tekrarında eski doğrulanmış yeni@kutarya.test yüzünden fail oldu. Setup yalnız
  bu sentetik hesabın emailVerified bayrağını sıfırlar; genel seed/parola/diğer
  oturumlar değiştirilmeden sonra 38/38 geçti. Aynı test tekrarına artık reseed
  gerekmez. Eski silinmiş 385/102 takım sonucu değildir.
- Gerçek UI: survival üretim zinciri (tahta/çubuk/kazma), 1 kazma/1 yerleştirme,
  reload ve indirilen JSON'u seçiciyle geri yükleme, gece can azalması; final
  runtime yaratıcı uçuş 31->37/katalog ve site iframe dünya/tahta üretimi.
  390x466 menü scroll390, hotbar x7.8..382.6 bottom459.4; çanta client/scroll346.
  IAB download için waitForEvent(download) işlemi click'ten önce kaydedilmeli.
  Blob JSON download olayı timeout olmasına rağmen dosya Downloads'a geldi;
  dosya validateSave + gerçek chooser import ile doğrulandı. Kernel reset'te
  CUA handle'ları yeniden seçilir. file:// UI IAB politikasıyla engellendi;
  başka yüzeyden aşılmadı. ZIP hash/HTTP kabulü file:// kabulü diye sunulmaz.
- Tam survival hedef zinciri/her mekanik/fiziksel telefon/FPS ölçümü açık.
  docs/BLOK-DIYARI.md kapsam/kabul raporu; ekran blok-diyari-site-final.jpg.
  README/SITE-PLANI/KABUL/sitemap güncel. Canlı deploy/Auth/kurallar/claims/
  provider değişmedi. 5180 ve servis emülatörleri incelemeye açık.

## 5 Ekim 2026 — kullanıcının yeni Kutarya OS OOP görevi

- Site görevinin ardından ayrı okul projesi istendi: yalnız C# Windows Forms,
  D:\KutaryaOS\ProjeDosyalari. Web katalog/Auth/admin/oyunlar değişmedi;
  site deploy alınmadı ve bu yeni uygulama kataloğa sahte proje olarak eklenmedi.
- Kutarya OS ilk kurulum/hardware sınırları, masaüstü/uygulamalar/temalar,
  gerçek dosya taşıma, DPAPI ve sağ AI paneliyle çalışır ilk sürüm.
  34/34 çekirdek + 9 UI; bağımsız dağıtım EXE'sinde aynı kontroller geçti.
- Gerçek AI model bağlantısı ve fiziksel Explorer sürükleme kabulü açık.
  Kaynak/EXE/ZIP ve ders OOP anlatımı yeni proje klasöründedir;
  devam için D:\KutaryaOS\ProjeDosyalari\DEVIR.md okunur.
## 5 Ekim 2026 — ayrı Kutarya OS görevi 0.2

- Web kodu, katalog, oyunlar, Auth/admin, canlı Firebase ve deploy değişmedi.
- Yeni okul uygulaması yalnız C# WinForms: D:\KutaryaOS\ProjeDosyalari.
  Güncel devam kaydı o projenin DEVIR.md dosyası; bu web projesinin kapsamı değildir.
- Kullanıcının son talimatı: ortak sunucu kullanma, kendi API veya native yerel
  model indir seçimi; panel açılınca model otomatik yüklenir. DB kodu/paketi yok.
- 0.2 tasarım/görsel düzeltmeleri, gerçek GGUF sohbet/dosya araçları, per-user
  setup ve kaynak/portable arşivler hazır. Kurulu uygulama 34 + 8 + 16,
  setup 9 kontrol; testler gerçek kullanıcı dosyalarını değiştirmez.
- Plan/risk/OOP/kabul tabloları, galeri ve paket hashleri D:\KutaryaOS altındadır.
  Okul PC/DPI ve elle Explorer sürükleme açık; web deploy onayı hâlâ verilmedi.


## 5 Ekim 2026 — ayrı okul uygulaması Kutarya OS 0.3

- Web kodu/katalog/oyunlar, Auth/admin ve canlı Firebase değişmedi; deploy yok.
- Kullanıcı okul uygulamasında AI'ı yalnız sanal Masaüstüne sınırlamayı,
  klasörü ana PC'ye kullanıcı seçimiyle taşımayı istedi. Her iki özellik
  D:\KutaryaOS\ProjeDosyalari içinde tamamlandı; devam kaydı oradaki DEVIR.md.
- Son 0.3 setup kuruldu: 34 + 34 + 8 + 20 uygulama kontrolü, 10 kurulum kontrolü.
  Gerçek native AI sohbet/klasör/tam dosya içeriği ve gerçek D→C taşıma ölçüldü.
  Kaynak/portable/setup, güncel görüntüler ve ders belgeleri D:\KutaryaOS altındadır.
- AI'a host aktarım aracı verilmedi. DB yok. Okul PC, fiziksel klasör seçicisi/
  Explorer sürükleme ve DPI kabulü açık; web yayın onayı hâlâ bekliyor.
- Son paket, aktarım UI'sindeki gecikmiş ilerleme mesajı da düzeltilerek
  tekrar tam kabul edildi. Son hash/kanıt ayrı OS projesinin DEVIR/manifestinde.

## 5 Ekim 2026 — Kutarya OS 0.3.0 paylaşım sitesine eklendi

- Kullanıcı ayrı okul projesini siteye eklemeyi istedi. Gerçek kayıt kutarya-os,
  tür desktop, engine download, kategori uygulama, Windows; 4 oyun + 1 uygulama.
- projects-src/kutarya-os.mjs metni; scripts/install-kutarya-os-local.mjs yalnız
  demo-kutarya-games / loopback emülatörlerine yazar. Canlı seçenek yok.
  D:\KutaryaOS\Dagitim manifest/SHA ve tam setup kabulüyle paketleri doğrular.
- 0.3.0 setup, portable, source mevcut admin ticket/Storage/complete hattından
  yüklendi. Paketler public/dist altında değil; artifacts/kutarya-os ignore.
  Uygulama renderlarından 1 kapak + 4 galeri PNG'si değiştirilmeden kullanıldı.
- Betiğin ikinci çalıştırması dosya/görsel üretmedi; dört oyun tüm kayıtlarıyla
  aynı kaldı. Üç API guest indirmesi + üç tarayıcı İndir düğmesi: byte/SHA aynı.
  Admin'de üç rol/sürüm; Masaüstü filtresinde tek uygulama doğrulandı.
- 1280/390 px: yatay taşma yok; mobilde 5 görsel yüklendi. 34/34 + build geçti.
  OS runtime/setup ve önceki 38 servis testi bu eklemede tekrar çalıştırılmadı.
- Kanıt/yeniden ekleme docs/KUTARYA-OS.md. Emülatör sıfırlanırsa start-local
  ardından node scripts/install-kutarya-os-local.mjs; Auth hesaplarını sırf
  içerik yenilemek için reseed etme. Açık admin sekmesi eski metinleri cache'ledi;
  CLI değişikliğinden sonra Yenile/reload gerekir, eski editörü kaydetme.
- Yerel inceleme geçerli; canlı Hosting/Storage/Functions/rules/claims yok.
  Üretime yerel 9199 URL'lerini taşıma; gerçek admin dosya/görsel yüklemesi gerekir.
  DB kodu OS projesine eklenmedi. Okul PC/DPI/elle Explorer kabulü OS'de açık.




## 5 Ekim 2026 — Kutarya Convert 1.0.0 ve Google giriş düğmesinin kaldırılması

- Yeni gerçek proje kutarya-convert: tool/arac/web, 1.0.0. 4 oyun + OS + Convert.
  projects-src/kutarya-convert.mjs; kaynak tools-src/convert. Önceki 5 kayıt aynı.
- Gerçek Canvas görsel, font gömülü PDF/DOCX/metin, PDF.js okuma/render,
  ExcelJS/CSV/JSON ve Web Audio+LAME ses. 20 dosya, 25 MiB tek / 100 MiB toplam;
  24 MP, 80 PDF sayfa, 5 dk ses; limitler ve kayıplar UI/docs'ta açıklanır.
  Kaynak dosyaya yazmaz; seçilen dosyaları sunucuya yüklemez. OCR/video/HEIC/
  eski DOC/XLS yok; Word/PDF metin yerleşimi birebir korunmaz. Font/kodek sınırları var.
- npm run build:convert tek HTML+web ZIP ve kaynak ZIP üretir. Inline motor,
  PDF worker/font; CDN yok. LGPL/GPL/OFL metinleri ve MP3 upstream kaynak arşivi.
  Kaynak ZIP 20 izinli dosya; ayrı npm ci/test/build 19/19, HTML SHA aynı.
- Paket public/games/kutarya-convert/1.0.0 altında değişmez. Yeni değişiklik
  yeni sürüm ister. Runtime importer artık htmlparser2 ile gerçek tag attr'larını
  okur; JS template href metnini varlık saymaz. Yol/eksik varlık sınırları testli.
- scripts/install-convert-local.mjs draft|publish yalnız demo/loopback hedefe
  gider. Önce kabul+operator sürüm kaydı, sonra publish. 2 paket mevcut ticket /
  Storage / complete / guest download hattında byte/SHA; 2 browser indirmesi aynı.
  Tekrar publish dosya/kapak kopyası üretmedi. 9199 URL'lerini üretime taşıma.
- Tuzak: Storage yükleme contentType application/octet-stream olmalı; zip MIME
  create kuralında reddedilir. Rule gevşetilmedi; upload düzeltilip geçti.
- Tuzak: büyük derlenmiş JS'yi HTML'e String.replace replacement-string ile
  ekleme. Kaynaktaki dolar kalıpları HTML'i/JS'yi bozar. Callback kullan; build
  vm.Script ile bağımsız JS ve inline JS parse eder. İlk syntax hataları düzeltildi.
- Vite public'teki yerel test yüzeylerini dist'e kopyalar. Build plugin doğrulanmış
  dist/tools-preview yolunu çıkarır; Hosting ignore ek korumadır. Emulator ignore'ı
  servis sırasında uygulamadı; yalnız ignore yeterli değildi. 404 ile ölçüldü.
- Google düğmesi, aynı sekme/linking ve redirect tamamlama Auth.tsx'ten kaldırıldı.
  E-posta/şifre/kayıt/kod/reset/admin kaldı. Eski google helper yalnız regresyonda;
  canlı ortak sağlayıcı/UID/claim/rule değişmedi. Browser login hedefi korudu.
- Tool detay düğmesi kendi sekmesine gider; oyunlar eski player akışını korur.
  Tool iframe scripts+downloads; allow-same-origin yok. CUA opaque iframe chooser
  olayı dönmedi; normal sekmedeki gerçek çoklu chooser çalıştı. Blob download
  event beklemesi dönmese de Downloads ZIP geldi; gerçek dosya açılarak doğrulandı.
- Kabul: 53/53 + build, 38/38 servis ve 22/22 Hosting; browser 4 aile, gerçek
  roundtrip/PDF işlemleri/hata ayrışması/iptal. 15 girdi değişmedi. 390 px app,
  proje/dosya ve kayıt taşmadı. Sentetik drop 2/2; Explorer/telefon ölçülmedi.
- file:// CUA URL politikası engelledi; workaround denenmedi. ZIP'in doğrudan
  çift tıklama kabulü açık; aynı HTML'in HTTP çalışması ve kaynak build ölçüldü.
  PDF.js IIFE Node-only import.meta uyarısı var; browser PDF render/okuma geçti.
- Kanıtlar artifacts/convert (ignore); docs/KUTARYA-CONVERT.md, KABUL/plan güncel.
  Site/proje: http://127.0.0.1:5180/proje/kutarya-convert. Canlı inceleme/onay
  kapısı aynı: Hosting/Functions/Storage/rules/claims/PayTR yayını yapılmadı.
  Kutarya OS DB ve kaynaklarına dokunulmadı. Kök eski silmeler geri alınmadı.

## 5 Ekim 2026 — Kutarya Cep 1.0.0 Java mobil okul uygulaması

- Kullanıcı Android Studio/Java, SQLite sohbet geçmişi ve hatırlama, dört API,
  animasyonlu uygulama ve kaynak/okul tablolarıyla siteye ekleme istedi; açık
  talimat deploy yapma. Önce yerel/kök devir, plan, mevcut admin/katalog okundu.
- Kaynak mobile-src/kutarya-cep; paket com.kutarya.cep, min26/target36, Gradle
  9.4.1/AGP9.2.1, JBR21 ile ölçüldü. Uygulama Kutarya Cep, asistan Kutarya Us.
  Java native UI/XML kök; SQLite WAL/parametrik sorgu, geçmiş/arama/sabitleme,
  kapsam/kaynak bağlı hafıza, AES-GCM AndroidKeystore ile ayrı API anahtarları.
- OpenAI/OpenRouter/xAI chat SSE, Gemini native SSE; yalnız resmî HTTPS, yönlendirme
  yok. Model listesi/elle model, streaming/stop/retry, kısmî/interrupted durum,
  temalar/animasyon kapatma, kopyala/paylaş, sistem voice/TTS, SAF JSON/Markdown.
  Ayrı backend/Firebase login/yerel LLM yok; AI internet ve BYOK hesabı ister.
- Hafıza açık kullanıcı ifadelerini çıkarır, AI cevabından öğrenmez; aktif
  global/sohbet notları bağlama gider. Eğitim değildir. Notlar görülebilir/
  düzenlenir/kapanır/silinir; sohbet kaynak notlarını cascade siler. Bağlam
  yaklaşık karakter bütçesi, gerçek token sayımı değil. SQLite ve kullanıcı
  yedek dosyaları şifresiz; anahtar yedek/APK'ya girmez. Sınırlar README'de.
- Teslim artifacts/kutarya-cep (ignore): test APK 1.534.513 bayt (debug/v2),
  kaynak ZIP 100.478 bayt/39 izinli dosya, okul PDF 85.390 bayt/4 sayfa. SHA'lar
  paket-bilgisi-1.0.0.json. PDF tüm sayfalar render edilip incelendi. 60 saat/
  15 iş günü öneri zaman planı, fiilen harcanan süre değil; 12 risk/OOP/SQLite/
  sınıf provası dolu. Öğrenci/ders/öğretmen kimliği verilmedi, uydurulmadı.
- APK son hâliyle 27/27 birim/HTTP, 12/12 kurulu Android instrumentation;
  lint 0 hata/25 bastırılmamış tavsiye. ZIP ayrı çıkarılıp 27/27 + build;
  10 APK kod/manifest/kaynak girdisi byte/SHA aynı. Kanıt android-kabul.json/
  txt, source-rebuild.json. Gerçek native send/stop/retry düğmeleri testli.
- Tuzak: connectedDebugAndroidTest sonunda uygulamayı kaldırır ve ekran
  çıktıları silinir. Dağıtım kanıtı için son APK/testAPK elle adb install,
  am instrument ve sonra ekranları pull kullanıldı. startActivitySync bazı
  emülatör idle/yenileme durumlarında dönmedi; testler RESUMED monitor ve
  motion=false ile bekler. Ürün animasyonları kaldırılmadı. Test fixture
  yanıtı gerçek sağlayıcı değildir diye görüntüde etiketli.
- projects-src/kutarya-cep.mjs mobile/uygulama/android/download, order6;
  dört oyun + OS + Convert + Cep = yedi gerçek proje. scripts/install-cep-local
  yalnız demo-kutarya-games/loopback, aynı admin ticket/Storage complete/cover.
  Kaynak rebuild ve APK kabul SHA'sına bağlı ön kontrol; iki çalıştırma kopyasız,
  önceki altı kayıt aynı. Storage contentType application/octet-stream korunur.
- Altı gerçek Android ekranı public/media/projects/kutarya-cep; son görünüm
  CSS/UI mobile türüne kapsamlı, dikey ekranlar kesilmez. Diğer türler aynı.
  scripts/verify-cep-site: gerçek üç İndir dosyası SHA/boyut, admin/koleksiyon,
  1280/390 px taşma yok/5 galeri, pageerror yok. Lazy görseller ekranın altına
  kaydırılarak yüklenir, sonra en üste dönüp tam sayfa screenshot alınır.
- Site 53/53 + TypeScript/Vite build geçti. Önceki 38 servis/22 Hosting bu
  görevde tekrar çalıştırılmadı; eski silinen 385/102 takımlar geçti denmez.
- Gerçek dört API anahtarı/yanıt kalitesi/kota/latency, fiziksel telefon/API26,
  TalkBack/büyük font, elle SAF/voice/TTS ve FPS açık. Test düzeneklerini bu
  kabuller yerine sayma. Play Store üretim sertifikası yok; okul test APK'sı.
- docs/KUTARYA-CEP.md kabul/yeniden ekleme. Auth/kataloğu içerik için reseed etme;
  emülatörler sıfırlanırsa mevcut start-local ve installer akışı. 1.0.0 kaynak/
  paket değişirse yeni sürüm/kabul ister. Site http://127.0.0.1:5180/proje/kutarya-cep.
- Deploy yok; canlı Hosting/Functions/Storage/rules/claims/Auth, eski AI/mobile/
  PayTR değişmedi. 9199 URL üretime taşınmaz; canlı ayrı onay/YAYIN kapılarıyla
  gerçek admin dosya yüklemesi. Eski kök silmeler geri alınmadı. OS kaynağı aynı.

## 7 Ekim 2026 — ayrı Windows uygulaması Kutarya Video 1.0.0

- Kullanıcı D sürücüsünde ayarsız YouTube indiricisi ve EXE istedi. Ayrı kök
  D:\KutaryaVideo; devam kaydı oradaki DEVIR.md. KutaryaWeb kodu/katalog/Auth/
  admin/oyunlar, Firebase ve canlı yayın değişmedi; deploy yapılmadı.
- Kutarya Video.exe taşınabilir x64; 237.025.881 bayt. Yapıştırınca otomatik,
  çoklu sıralı kuyruk, en iyi mevcut kalite, MP4, EXE yanındaki Videolar;
  iptal/retry/geçmiş/.part devamı/tepsi ve resmî SHA doğrulamalı motor güncellemesi.
  Uygulama indirme kotası koymaz; disk/ağ/YouTube erişim kısıtları devam eder.
- 10/10 çekirdek + gerçek portable EXE 14/14 geçti. Blender Big Buck Bunny
  YouTube'dan 82.006.518 bayt indi; ffprobe 1920x1080 AV1 + Opus ses doğruladı.
  Gerçek renderer yapıştırması, sandbox IPC, dar pencere ve kalıcı geçmiş ölçüldü.
- Kanıtlar D:\KutaryaVideo\Kanitlar\paket\kabul.json ve görüntüler;
  EXE SHA/imza Kanitlar\paket-bilgisi.json. Normal kullanıcı geçmişi boş,
  test videoları ayrı Kanitlar altında. Windows başka PC/SmartScreen ve tüm
  YouTube videoları doğrulanmadı; EXE NotSigned. Kullanım OKU.txt.
- Gerçek tuzaklar: PATH FFmpeg 2013 wrapper'ı yerine paket motoru; Electron
  ZIP'i resmî SHA ile yerelde açıp electronDist kullanma; gizli screenshot için
  yalnız kabulde offscreen software capture; portable compression level 3.
## 7 Ekim 2026 — Kutarya Video Setup; açık portable uygulama korundu

- Kullanıcı Setup paketi istedi ve açık kullandığı uygulamaya dokunulmamasını
  özellikle belirtti. Kaynak/portable EXE değişmedi; mevcut süreç PID 28976
  aynı başlangıç zamanıyla açık kaldı. Setup kurulmadı, kısayol/registry/normal
  Veriler/Videolar değiştirilmedi; kullanıcı verileri otomatik taşınmadı.
- Teslim D:\KutaryaVideo\Kutarya-Video-Setup-1.0.0.exe, 237.083.465 bayt;
  SHA-256 1d87fd81ac720f4904ebf855bac8efd99ca3bea01c75125d4415c5d1278d3e0f.
  NSIS oneClick=true, perMachine=false, allowElevation=false, runAfterFinish=false;
  Türkçe, masaüstü/Başlat kısayolu, uninstall data koruma; imza NotSigned.
- Ayrı SetupKaynak ve SetupPaketleri; asıl kaynak dosyaları ile portable EXE'nin
  SHA değerleri başlangıçla aynı. Setup içine nsis.include install-safe.nsh
  eklendi: customCheckAppRunning açık uygulamada bilgi verip Abort yapar;
  varsayılan otomatik/zorla süreç kapatma yolu kullanılmaz. Bu koruma derlendi,
  installer çalıştırılmadığı için gerçek kurulum sırasında tetikleme ölçülmedi.
- Kurulu sürüm için eski portable ../.. varsayımı yalnız snapshot'ta düzeldi:
  video İndirilenler\Kutarya Video\Videolar; veri AppData\Roaming\Kutarya Video.
  Portable halen D:\KutaryaVideo\Videolar/Veriler kullanır ve çalışmaya devam eder.
- Setup içinden çıkarılan 92 dosya, paket çıktısıyla SHA olarak aynı; çıkarılan
  EXE ayrı profil ile 11/11 başlangıç/IPC/kayıt yolu kontrolü geçti. Yeni video
  indirmesi bu paket görevinde tekrar koşulmadı; önceki portable 1080p kabulü ayrı.
  Windows kurulum kaydı/kısayol/kaldırma kabulü kullanıcı açık uygulamaya
  dokunma dediği için koşulmadı; geçmişteki testler bu kabul yerine sayılmaz.
- Kanıt Kanitlar\setup\setup-kabul.json, baseline.json ve runtime-2\kabul.json.
  Gizli runtime capturePage UnknownVizError verdi; paint kareleri de boş çıktı.
  Yeni ekran görüntülerinin görsel kabulü yok (visualCaptureVerified=false).
  UI kaynakları önceki sürümle aynı; başarılı DOM/IPC kontrolü görsel kabul değildir.
- İlk NSIS son çıktı adımı Can't open output file verdi; dosya sonradan kilitsiz
  ölçüldü. --prepackaged ile aynı çıktı yeniden derlenince başarılı oldu; kesin
  kilit sebebi belirlenmedi. Asıl uygulama bu sırada durdurulmadı.
- Paket içeriğini mevcut 7za, NSIS yerine gömülü ham 7z bloğu olarak açıyor;
  92 uygulama dosyası doğrulandı, NSIS kuyruğundaki uninstaller ayrıştırılmadı.
  Kaldırıcı başarılı NSIS derlemesiyle üretildi; gerçek uninstall doğrulaması yok.
- Yeniden üretme: node SetupKaynak\build-setup.mjs. Kontrol betiği ayrı/boş
  test dizini ister. SETUP-OKU.txt konum ve kullanım ayrımını açıklar.
- KutaryaWeb kodu/katalog/Auth/admin/Firebase ve canlı yayın değişmedi; deploy yok.

## 7 Ekim 2026 — Kutarya Video site içeriği; port açılmadı

- Kullanıcı fotoğraflar/açıklamalarla siteye yükleme ve PC portunun kullanılmamasını istedi.
  D:/KutaryaVideo açık uygulamasına, geçmişe, videolara ve asıl EXE'lere dokunulmadı.
- projects-src/kutarya-video.mjs: gerçek 1.0.0 Windows desktop/download taslağı;
  açıklama, kullanım, sistem gereksinimleri ve sürüm notu. Mevcut admin/login/katalog sistemi korunur.
- public/media/projects/kutarya-video: kapak + 2 galeri, gerçek portable kabul PNG'leri.
  Setup testinin boş görüntüleri kullanılmaz. artifacts/kutarya-video altında Setup
  237.083.465 ve portable 237.025.881 bayt; kopyaların SHA değerleri orijinallerle aynı.
- prepare-video-site.mjs ve review-video-site.mjs / npm prepare:video, review:video
  port açmadan hazırlama ve gerçek React/CSS tek HTML incelemesi oluşturur.
  Edge headless pipe ile 1280/390 px, 3 görsel, 2 dosya satırı/sekme, taşma/renderer/ağ
  kontrolü geçti. Bu inceleme verisidir; canlı upload/download kabulü değildir.
  Site 53/53 + TypeScript/Vite build geçti. Emülatör/Hosting testleri port talimatıyla koşulmadı.
- 7 Ekim salt okunur canlı doğrulama: kutarya.com eski AI sitesi; gamesService yok;
  mevcut admin doğrulanmış ama gamesAdmin yok. Canlı kurallar önceki genel admin yapısında.
  Site hedefi (eski canlı AI / yeni katalog) soruldu, yanıt bekleniyor. Ana siteyi
  yeni katalogla değiştirme onayı docs/YAYIN.md'ye göre ayrıca gerekir; eski 385/102
  klasörleri yok, alternatif yayın kabulü kullanıcıyla çözülmeli.
- upload-video.mjs hazır ama çalıştırılmadı: sabit üretim HTTPS hedefi, onay bayrağı +
  kısa ömürlü mevcut admin custom token; gerçek API/Storage yükleme, misafir SHA/boyut
  doğrulaması ve diğer katalogların korunması. Claim/Hosting/kural deploy etmez.
- Canlı Firebase/Storage/katalog/Hosting/Auth/claims değişmedi. Yerel Firestore'a da
  yeni kayıt yazılmadı; içerik ve paket hazırlığını siteye yükleme diye raporlama.
  Önceki 7 yerel proje aynı. Devam: docs/KUTARYA-VIDEO.md; Kanıt site-kabul.json.
- İnceleme Vite lib derlemesi process.env.NODE_ENV=production define ister; normal
  uygulama build'inden farklı olarak varsayılan lib çıktısı bunu değiştirmiyordu.

## 9 Ekim 2026 — Windows USB fare teşhisi; sistem değişikliği yapılmadı

- Bu sohbetin işi yazılım geliştirme değil, mevcut Windows sisteminin salt okunur teşhisidir.
- Ayrı rapor/kanıt: D:\Windows-Mouse-Teshis\2026-10-09_1117\RAPOR.md ve KANIT.json.
- Casper Excalibur G770 / Windows 11 Pro 25H2 26200.9457. USB fare ve denetleyiciler problem 0.
- Interception mouse/keyboard filtreleri ve Veyon 4.11.2 etkin; varlıkları tek başına arıza kanıtı değil.
- 20 saniyede 80 örnek/74 farklı imleç konumu; kullanıcı yalnız USB fareyi hareket ettirdiğini ve imleci gördüğünü doğruladı. Arıza bu ölçümde tekrar üretilemedi; kök neden kesinleşmedi.
- Touchpad COL01 fare kaydı Kod 22, COL02 touchpad kaydı OK; bu ayrım USB fare arızası gibi sunulmaz.
- SFC verifyonly / DISM ScanHealth yükseltilmemiş terminal nedeniyle başlamadı (1/740). Sürücü, registry, hizmet, güç ayarı, yeniden başlatma veya kurulum işlemi uygulanmadı.
- Sorun tekrarlanırsa önce görünürlük/hareket ayrımı, ardından ayrıca onayla geçici Veyon hizmet karşılaştırması. Kutarya uygulama kodu/katalog/canlı servis/yayın değişmedi.

## 9 Ekim 2026 — Kutarya Us, yalnız eğitilmeye hazır model beyni

- Kullanıcı yalnız tek model kodu istedi; eğitim verisi, eğitim veya eğitilmiş
  model hazırlamak bu görevin kapsamına dahil değildir.
- Tek kaynak: `kutarya_us_beyin.py`. `KutaryaUsConfig` ve `KutaryaUs(nn.Module)`;
  UTF-8 bayt sözlüğü 256, varsayılan 1024 bayt bağlam, 256 embedding, 6 decoder
  katmanı, 8 dikkat başlığı, 4 kat FFN, dropout 0.1; 5.052.928 parametre.
- Nedensel SDPA attention, ön LayerNorm, artık bağlantılar, GELU ve paylaşılan
  giriş/çıkış ağırlığı. Ağırlıklar yalnız model oluşturulurken rastgele başlatılır.
  Import hiçbir model oluşturmaz; doğrudan çalıştırma yalnız mimari bilgisidir.
- `forward(x, targets=None)` tüm konumlar için `[B,T,256]` logits ve isteğe
  bağlı loss verir. x/targets torch.long; targets önceden bir konum kaydırılmış
  sonraki baytlardır. Kaydırma gelecekteki eğitim kodunun sorumluluğudur.
  -100 hedefler yok sayılır; tümü -100 olduğunda loss/gradyan sıfır, NaN yok.
- PyTorch 2.14.1+cpu üzerinde geçici sayısal tensörlerle 7/7 kontrol grubu geçti:
  import/parametre/weight tying; 1/17/1024 bayt forward; geleceğe sızıntı ve eval;
  maskeli loss/sonlu backward/ağırlıkların değişmediği; tüm hedefler maskeli;
  özel boyut/kesintili tensör/CPU bfloat16; geçersiz ayar ve girdiler.
  Doğrudan Python çalıştırması da geçti. Optimizer adımı uygulanmadı;
  veri, eğitim betiği veya checkpoint/ağırlık dosyası üretilmedi.
- SDPA eval kipinde dropout'u kendiliğinden kapatmaz; `dropout_p=0.0` açıkça
  verilir. Bağlam birimi bayttır, Türkçe karakter sayısıyla aynı değildir.
- GPU/CUDA ve öğrenilmiş yanıt kalitesi ölçülmedi; bu mimari henüz eğitilmedi.
  Web UI/katalog/Auth/admin/Firebase veya eski AI/mobile/PayTR değiştirilmedi;
  siteye yükleme/deploy yapılmadı. Eğitim ve site bağlantısı ayrı gelecekteki
  kullanıcı talebidir; bu kaynak bir eğitilmiş model teslimi sayılmaz.

## 10 Ekim 2026 — Kutarya Mobile ayrı klasör Android uygulaması ve APK

- Kullanıcının sonraki uygulama talebiyle D:/KutaryaMobile açıldı. Bu iş
  KutaryaWeb'e yeni mobil servis eklemedi; web kaynağına dokunulmadı.
- Kotlin/Compose, com.kutarya.mobile, min26/target36/compile37, Kutarya Us.
  Yerel telefon komutları, ses/TTS, şifreli not/geçmiş/rutin/bildirim, belge eki,
  16 araçlı sınırlı AI agent, kendi Gemini anahtarı ayarı, asistan rolü/widget.
- İmzalı release APK: D:/KutaryaMobile/Dagitim/Kutarya-Mobile-1.0.0.apk;
  13.019.712 bayt, v2 imza doğrulandı. SHA256:
  8F23EAB07B006A11D71EC9775D19CC81AE1758227AFDCBBEBF5309AC883A7D67.
- 35 JVM + 13 Android emülatör testi geçti; debug/release lint 0 error,
  19 warning. Aynı release özel API37/x86_64/16KB emülatöre kuruldu; gerçek
  Ayarlar açılışı ve ASSIST rolü açılışı doğrulandı. Kanıt ve sınırlar:
  D:/KutaryaMobile/docs/KABUL.md, Kanitlar/verified-build.log,
  Kanitlar/device-tests-final.log. Kullanım D:/KutaryaMobile/README.md.
- Gerçek ARM64 telefon/ses/hat/diğer uygulamalar ve canlı Gemini hesabı,
  bildirim erişimi/Doze/yeniden başlama/widget kabulü açık. Sürekli Hey Kutarya,
  serbest ekran kontrolü ve iOS yok. Intent aktarımı dış sonuç kanıtı değildir.
- SDK/JBR/Gradle/cache/temp/AVD .tools altında D'de. İmza anahtarı .secrets
  dizininde korunur; kaynak ZIP'e girmez. Ortak API anahtarı gömülmedi.
  Eski Kutarya Cep, ortak Auth/Firebase/PayTR, katalog/admin ve Hosting
  değiştirilmedi; web/Storage/Play yayını ve ücretli AI isteği yapılmadı.
- Telefon modeli sorusunun sonraki yanıtı "default sürümlere göre yap" oldu.
  D:/KutaryaMobile genel Android 8+ minimumuyla korunur; sürüm denetimli
  ses/izin/asistan yolları doğrulandı. Uyumluluk README ve kaynak ZIP'e
  işlendi. Aynı imzalı APK geçerlidir; bütün sürümlerde fiziksel cihaz
  kabulü yapılmış sayılmaz.

## 10 Ekim 2026 — Kutarya Mobile 1.1 yerel geliştirme ve APK

- Kullanıcının sonraki talebi D:/KutaryaMobile içinde karşılandı. Yerel LLM
  eklenmeden 28 araç, not arama/düzenleme, hatırlatma iptali, listeler,
  fener/ses/ayar, Türkçe matematik/birim/yüzde/tarih ve dosyadan yerel
  kaynak cümlesi özeti geliştirildi. Genel AI isteğe bağlı API ayarında kaldı.
- Açık/koyu UI, dört hızlı kart, aranabilir kayıt/komut ve plan/listeler
  düzenlendi; gereksiz ana sayfa/API metinleri kaldırıldı. İşlem onayları korundu.
- İmzalı APK D:/KutaryaMobile/Dagitim/Kutarya-Mobile-1.1.0.apk;
  versionCode2, 13.085.316 bayt; aynı sertifika/v2 doğrulandı. SHA256:
  089136858EE2327D18CC086908BA6B8F446E0C3275CFC38AA7045DB87AE6137E.
  1.0 çıktıları ve güncelleme anahtarı korunur. Sürüm bazlı kaynak ZIP var.
- 49 JVM + 21 Android emülatör testi geçti; son 21 test uçak modu/Wi-Fi
  kapalı/anahtarsız. Debug/release lint 0 error, 19 warning. Compose v1
  test kuralındaki layout reentry hatası v2 kuralıyla düzeldi; test silinmedi.
- Gerçek 1.0 → 1.1 release güncellemesinde eski şifreli not, gerçek Android
  dosya seçicisinde yerel TXT özeti, medya sesi %40, Android Wi-Fi ayar
  ekranı ve ASSIST tuşu doğrulandı. Ayrıntı D:/KutaryaMobile/docs/KABUL-1.1.md.
  Fiziksel telefon/ses/fener ve gerçek hat/mesaj/widget/Doze/AI kabulü açık.
- KutaryaWeb ürün kaynağı/katalog/admin/Auth veya ortak Firebase/Hosting/
  Storage/PayTR değişmedi. Site/mağaza yayını ve ücretli AI isteği yapılmadı.

## 10 Ekim 2026 — Kutarya Mobile 1.2 geliştirme teslimi

- Kullanıcının uygulamayı değerlendirme/planlama/geliştirme ve madde madde
  raporlama talebi D:/KutaryaMobile içinde tamamlandı. Plan
  docs/GELISTIRME-1.2.md; özellik raporu docs/RAPOR-1.2.md;
  kabul docs/KABUL-1.2.md. 31 araç; yerel LLM eklenmedi.
- Devam eden şifreli konuşmalar, son konuşmayı geri açma, sınırlı/özel veri
  kontrollü AI bağlamı; günlük plan, yeni açık/koyu UI, Türkçe kibar
  komutlar/öneriler, ses kısmi metin/seviye ve düzeltip gönderme,
  not/liste/hatırlatma formları, onaylı madde/liste silme, rutin
  plan doğrulaması ve aynı adlı rutini kayıt ID'siyle çalıştırma.
- Yerel release: D:/KutaryaMobile/Dagitim/Kutarya-Mobile-1.2.0.apk;
  versionCode3, 13.134.468 bayt, aynı sertifika/v2, DEBUGGABLE yok.
  SHA256 371633E3CA4AA1E62EE36E5911EC5E5730FE49F237AB4ADD7B4A8245EC613500.
  Yayımlanmış1.1 APK ve kaynak arşivi değişmedi; üzerine yazılmaz.
- 62 JVM + 32 Android testi geçti, atlanan0; uçak1/Wi-Fi0/anahtarsız.
  Debug/release lint0 error/18 warning. Gerçek1.1 → son hash'li1.2
  release güncellemesinde eski şifreli not korundu; son release'teki
  iki mesaj force-stop/start sonrasında geri geldi. Kanıtlar yeni KABUL'de.
- Compose state izleme, IME'de konuşma sheet'i, yeni kayıt görünürlüğü,
  aynı adlı rutin seçimi ve düzenlenebilir alandan ayrılan test
  assertion'ları düzeltildi; test/onay veya lint kuralı kaldırılmadı.
- Bu görev yeni Hosting/katalog/Storage yayını değildir. Canlı1.1 ve
  diğer projeler, admin/Auth/kurallar/PayTR korunur. Web ürünü değişmedi;
  bu devir kaydı güncellendi. Fiziksel telefon/ses/hat/bildirim/widget/Doze
  ve canlı sağlayıcı kalite kabulü açık; sınırsız ekran agent'i/hotword/iOS yok.


## 2 Kasım 2026 — GitHub arşiv aktarımı

Kullanıcı D: projelerini GitHub'a aktarıp ardından yerel kopyaları silmeyi istedi.
Hedef özel depo: https://github.com/Kutarya/d-archive-kutarya. Kaynak anlık kopyası ve
şifreli tam dosya arşivleri aktarılır; sırlar kaynak görünümünden çıkarılır.
Yerel silme yalnız bütün dosyaların arşiv CRC/boyut denetimi, GitHub SHA-256
eşleşmesi ve son kaynak değişiklik kontrolünden sonra yapılabilir. Bu not
tek başına aktarımın veya silmenin tamamlandığını kanıtlamaz; nihai durum
GitHub release dosyaları ve sahibine teslim edilen aktarım raporundadır.
