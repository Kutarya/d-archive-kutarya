# Kutarya Rus Ruleti — Son Tur 1.0.1

18 Ekim 2026. Kullanıcının yeni HTML/CSS/JS oyun, gerçek çevrim içi oda,
oyuncu bulma ve kutarya.com üzerinde yayın talimatı kapsamında geliştirildi ve yayımlandı.

## Kapsam ve kabul

- 2–6 gerçek oyuncu; özel/açık oda, altı karakterli kod, hızlı eşleşme,
  gerçek açık oda listesi, hazır olma, oda sahibi başlatma, rövanş.
- Altı hazne, tek kıvılcım; sıra başına 25 saniye, oyun başına bir pas.
  Kıvılcımı bulan elenir, son kalan kazanır. Kan/grafik yaralanma yoktur.
- Metal hazne animasyonu, özgün karanlık masa, animasyonlu oyuncu kartları,
  dokunmatik/klavye kullanımı, ses aç/kapat ve azaltılmış hareket desteği.
- Ayrı ve açıkça etiketlenmiş bot antrenmanı internetsiz çalışır.
- Sonuç, sıra, rastgelelik, süre ve yetki bulut sunucusundadır. İstemcinin
  gönderdiği sonuç/skor/kimlik kabul edilmez. Kopmada 30 saniye geri dönüş.
- Ayrı kutarya-rus-ruleti Cloud Run servisi; europe-west1, min0/max1,
  1CPU/256MiB. Runtime hesabına proje/veri/sır yetkisi verilmez.
  Açık WebSocket bağlantısı bulut kullanım maliyeti oluşturur.
- Odalar geçicidir; 45 dakika sınırı ve servis yeniden başlama sınırı
  arayüzde açıklanır. PC üzerinde sunucu veya debug portu açılmaz.
- Önce kurallar ve yetki testleri, sonra ayrı başsız Edge profilleriyle
  masaüstü/mobil/bot ve gerçek bulut çok oyunculu kabulü yapılır.
- Runtime önce sürümlü bağımsız adreste yayımlanır; gerçek HTTPS kabulünden
  sonra katalog etkinleştirilir. Diğer katalog, eski oyun/paketler, sekiz
  Functions, kurallar, Auth/admin ve diğer Cloud Run servisleri korunur.

## Kanıt ve geri dönüş

Kaynak: games-src/rus-ruleti ve roulette-server. Kanıtlar ve önceki bulut
durumu: artifacts/releases/rus-ruleti/1.0.1. Yayımlanmış runtime ve ZIP aynı
sürümde yeniden üretilmez. Hosting geri dönüşü katalog/Cloud Run'u geri almaz.
Yeni katalog kaydı taslağa çekilir ve önceki Hosting seçilir; eski oyunlar
silinmez. Gerçek fiziksel telefon ve yoğun oyuncu yükü ayrıca ölçülür.

## Tamamlanan yayın

- Kullanıcının HTML/CSS/JS oyun/oda/oyuncu bulma/yayın talimatıyla https://kutarya.com/oyna/rus-ruleti ve /proje/rus-ruleti etkin. Katalog13 gerçek proje. İstemci1.0.1; bulut servisi1.0.0/ağ sözleşmesi1 korunur. Hosting sites/kutarya-ai-3169/versions/b559d71ce1f095d4; önceki sites/kutarya-ai-3169/versions/ac73c06b30067506; görev başlangıcı6cdaeae4c630d99a. İlk1.0.0 paketi/runtime/görseller korunur.
- Animasyonlu metal hazne,2–6 kişilik özel/açık oda, kod/davet, gerçek masa listesi, hızlı eşleşme/8 saniye, hazır olma,25 saniye/otomatik çekim, tek pas, sunucu sonucu, rövanş, emoji, ses, mobil/azaltılmış hareket, ayrı üç botlu antrenman. Botlar insan gösterilmez; hesap/bahis yok.1.0.1 dar site iframe'inde kesilen düğmeleri düzeltti;240 piksel iç genişlik sınanır.
- Ayrı Cloud Run kutarya-rus-ruleti/europe-west1: kutarya-rus-ruleti-00002-r8k, trafik%100, service/revision min0/max1,1CPU/256MiB,timeout3600s; runtime SA proje rolü0. Odalar geçici/45 dakika; kopmada30 saniyeye kadar dönüş denenir. Açık WebSocket aktif bulut kullanımı oluşturur.
- Kabul: oyun15/15, site64/64+TypeScript/Vite,audit0. Değişmeyen gerçek bulut servisinin 18 protokol grubu1.0.0 kanıtından korunur (altı/yedinci sınırı,yetkisiz hamle/kopma/dönüş/geri sayımda sahiplik). Yeni1.0.1 istemci gerçek iki Edge bağlamında ayrıca aynı kazanan/kod/hazır/klavye/pas/rövanş/hızlı eşleşme ile sınandı.240/282/320/390/768/1366 görünüm ve gerçek /oyna korumalı iframe geçti.
- Canlı25 HTML SHA,sitemap/robots,üç runtime/dörtPNG,1280/390 proje sayfası ve gerçek İndir düğmesinden yeni ZIP tam bayt/SHA/içerik geçti. Eski1.0.0 dosyası korunur. Fiziksel telefon/farklı ağ/yoğun yük ölçülmedi; eski AI385/Desktop102 klasörleri yok, koşulmuş sayılmaz.
- Diğer12 katalog kaydı/sekiz Functions/diğer Cloud Run/kurallar/Auth/admin ve93 eski Hosting dosyası korundu. Geçici IAM geri alındı. PC portu,etkileşimli giriş/parola,sır payload'ı veya açık masaüstü uygulaması üzerinde kontrol yok.
- Kaynak games-src/rus-ruleti,roulette-server; kanıt artifacts/releases/rus-ruleti/1.0.1/. ZIP21750 bayt/SHA 893c71e4d78a087ecf833ab8187bb8c2f121957e0ce43e1c0d163a4948e220dd; HTML71244 bayt/SHA 82a68625013f8d7fcfb7499cff734c3186bebc1873c2da2a39b856a36d465acf. Sabit yayımlanmış paketler üzerine yazılmaz. Önceki1.0.0 kanıtı artifacts/releases/rus-ruleti/1.0.0/ altındadır.
- İş akışı: roulette-cloud before; build-roulette; roulette-accept-rules; review-roulette/iframe/matchmaking; prepare-roulette-release; freeze-roulette; authorize-roulette upload; deploy-release hosting; gerçek live kabulü; authorize-roulette activate; deploy-release hosting; gerçek katalog iframe/site; roulette-cloud after. Yeni gateway yayını gerekirse deploy-roulette; Node çağrıları --require ./scripts/no-listeners.cjs ile. Ayrıntı docs/RUS-RULETI.md.

## Ölçülen tuzaklar

- Oyun iframe'i allow-forms içermez. Native form submit, submit olayına ulaşmadan engellendi. Kod/oda düğmeleri type=button ve açık click/Enter işleyicisine çevrildi; sandbox gevşetilmedi.
- Tablet dekoratif orbit transform'u yatay taşırdı; yalnız dekoratif sanat alanında kırpıldı. 320–1366 kabulü geçti.
- Hızlı geri sayım metni her150ms kontrol güncellemesiyle eziliyordu; kontrol/clock sırası düzeltildi ve iki gerçek tarayıcıyla sayım sınandı.
- Hızlı geri sayım sırasında kopan sahip start() tarafından çıkarılınca host boşa düşebiliyordu. Gateway ensureHost ile bağlı oyuncuya aktarır; kesirli kapasite de tam sayıya sınırlandı.15 kural testi ve gerçek üçlü/kopan sahip akışı geçti.
- Ham protokol aracında PC saatiyle bulut lockUntil karşılaştırması erken hamle üretti. Her snapshot serverNow farkı uygulanır; istemci zaten bu farkı kullanıyordu. Geçersiz hamle sunucuda reddedildi, test aracı düzeltildi.

[Cloud Run WebSocket işletimi](https://docs.cloud.google.com/run/docs/triggering/websockets) açık bağlantı maliyeti, zaman aşımı ve yeniden bağlantı sınırlarını açıklar. Rastgele hazne sunucuda [Node crypto.randomInt](https://nodejs.org/api/crypto.html#cryptorandomintmin-max-callback) ile seçilir.
