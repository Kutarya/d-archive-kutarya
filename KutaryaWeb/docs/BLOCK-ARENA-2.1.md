# Kutarya Block Arena 2.1 — isim ve online hareket düzeltmesi

11 Ekim 2026. Kullanıcı online oyuncu adını seçememe ve yüksek ms sorununu
bildirip sistemi ve oyunu geliştirmeyi istedi. Bu devam isteği, aynı sohbetin
bu oyunu geliştirip yayımlama talimatıyla birlikte ele alındı. Eski 1.0.0 ve
2.0.0 runtime/ZIP/görseller korunur; güncelleme ayrı 2.1.0 dizinindedir.

## Ölçülen sorun ve değişiklik

2.0'da gerçek klavyeyle odaya girmeden ad yazılabiliyordu; **odaya girdikten
sonra input disabled** oluyordu. Artık odaya girmeden, oda içinden ve maç
menüsünden ad değiştirilebilir. Her oturum kendi aktörünü değiştirir;
Türkçe adlar korunur, aynı odadaki çakışmalara numara eklenir. Kimlik/hesap
veya ortak Firebase profili oluşturulmaz. Ayrı sekme/indirilen HTML'de yerel
profil kaydı korunur; korumalı iframe kalıcı kaydı kısıtlar.

Bu PC/ağdaki ilk ölçüm: ham WebSocket20 örnek, ortanca104/p95271 ms;
Edge lobi16 örnek, ortanca74/p95186 ms. Bu kullanıcının bütün ağlarında
yaşadığı yüksek pingin birebir yeniden üretimi veya kapasite testi değildir.
Eski hareket kodu yerel hareketten sonra her karede **eski sunucu konumuna
çekiyordu**; gerçek RTT'ye ek olarak yavaşlık ve geri çekilme hissi doğurur.

- İstemci ve sunucu aynı `arena-server/movement.mjs` adımını kullanır.
  60 Hz sabit yerel hareket, sunucu işledi sıra numarası, henüz işlenmeyen
  girdilerin yeniden uygulanması. Sağlık/mühimmat/eleme sunucuya aittir.
- Girdiler30 paket/sn içinde en fazla6 sabit adım olarak gönderilir.
  Sunucu gerçek zaman bütçesiyle işler: fazla paket hız hilesi sağlamaz;
  eski/geçersiz sıra, NaN ve konum/hasar/skor alanları kabul edilmez.
- Yeni doğmada yaşam numarası değişir, önceki tahmin kuyruğu iptal edilir.
  Zıplama/atılma tutma durumları aynı kuralla uzlaştırılır. Kamera küçük
  düzeltmeleri yumuşatır; büyük fark/ölüm/yeni doğma doğrudan düzeltilir.
- Rakip konumu85 ms örnek tamponunda iki durum arasında çizilir; açı
  dönüşü360 derece sınırını doğru geçer. 60 Hz sunucu/20 Hz maç durum iletimi;
  lobi4 Hz ve değişiklikte erken güncelleme. Bunlar yapılandırılmış hızlardır,
  yüksek oyuncu yükünde performans garantisi değildir.
- Yeni istemci rakiplerin mühimmat vb. ihtiyaç duymadığı alanlarını almaz.
  Kuyruk büyüdüğünde yeni snapshot atlanır; gönderilmemiş olayın sıra numarası
  ilerletilmez. Sınırsız ağ kuyruğu ve eski durum birikmesi engellenir.
- Silah sesi/geri tepme yerelde hemen başlar; sunucu onayında aynı efekt
  iki kez çalışmaz. İsabet, hasar ve skor hâlâ sunucu onayından gelir.
- Ping performance.now() ile gerçek son RTT'yi gösterir. Tooltip ortanca
  ve dalgalanmayı, renk yüksek gecikmeyi gösterir; yüksek son örnek gizlenmez.
  İletim/ping çizim rAF'ından ayrı zamanlanır. FPS gerçek kare süresinden
  hesaplanır; yavaş kareyi dt sınırı yüzünden hızlı göstermez.
- Online başlangıç silahı seçimi ve maç menüsünde isim alanı eklendi.
  Ortak site ve ziyaretçi/admin/Auth sözleşmeleri değiştirilmedi.

## Kabul ve gerçek sınırlar

15/15 arena testi: gecikmiş toplu girdiyle tahmin/sunucu aynı konum ve
enerjiye ulaşır; hız/konum enjeksiyonu, zıplama tutma, yeni doğma ve ad
çakışmaları kontrol edildi. Mevcut site58/58 + TypeScript/Vite build;
üretim npm audit0. Eski AI server/Desktop klasörleri yok;385/102 çalışmadı.

Gerçek bulutta iki oturum, sekiz kişilik oda/dokuzuncu reddi, yetkisiz
başlatma ve konum/skor enjeksiyonu reddi, gerçek hareket/vuruş/eleme/
yeniden doğma,180 saniye maç sonucu/aynı skor/rövanş/takım odası geçti.
Eski2.0 istemcisi de hâlâ bağlanır; yeni protokol3, eski protokol2 yolu
korunur. Paylaşılan servis eski ZIP'i sürüm hatasıyla kesmez.

Gerçek Edge'de25 görünüm/üç WebGL haritası/iki ayrı tarayıcı bağlamı geçti.
İsim ve oda kodu **fill() yerine gerçek klavye olaylarıyla** yazıldı;
iki kişinin ayrı ad değiştirmesi, çakışma ve maç menüsünde değiştirme geçti.
Ek120 ms gidiş/120 ms dönüş gecikmesi istemci paketlerine kontrollü eklendi:
ölçülen toplam RTT319 ms, ilk hareket tepkisi16 ms, hareket sonrasında
sunucu konumuna fark0. Bu simülasyon başka internet ağı testi değildir.
Anında geri tepme ve sunucunun doğruladığı mühimmat da geçti.

Canlı HTTPS aynı kabulünde RTT328 ms, ilk hareket tepkisi13 ms, son konum
farkı0; iki kişinin gerçek klavyeyle ayrı ad/çakışma/maç menüsü değişimi geçti.
Son canlı tek tarayıcı ölçümü: Edge14 RTT örneği ortanca81/p9595/max95 ms,
ham20 örnek ortanca77/max741 ms. Ham prob hello ile birlikte başlar, oda
hazır olmasını beklemez; yüksek örneğin nedeni kesinleşmiş sayılmaz.
Önce Edge ortanca74 ms idi; bu veriler ağ RTT'sinin düştüğünü kanıtlamaz.
Tek tarayıcı FPS144; paralel WebGL kontrollerinin ölçümü ayrı dosyadadır,
FPS iyileşmesi kıyası olarak kullanılmaz. İyileşme hareket tepkisi/paket
boyutu ve konum uzlaştırması üzerinde gösterilmiştir.

Aynı gerçek sekiz oyunculu oda/sunucuda eski tam durum paketinin ortancası
5035 bayt, yeni paket2492 bayt: %51 küçük, yedişer örnek. Bu ölçüm yeni
sunucunun eski/yeni istemci biçimini karşılaştırır; eski revision'a karşı
kontrollü CPU/yük benchmark'ı değildir. 1 oyunculu paket daha küçülmek
zorunda değildir; yeni protokol onay alanları da taşır.

Fiziksel telefon, farklı ağlar ve yoğun eşzamanlı oyuncu yükü ölçülmedi.
RTT internet yoluna bağlıdır; yerel tahmin düşük ağ pingi taahhüdü değildir.
Tek Cloud Run instance/min0/max1, yetkisiz runtime SA, geçici oda/45 dakika/
30 saniye yeniden bağlanma ve aktif bağlantı maliyeti sınırları sürer.

## Yayın ve tekrar çalışma

`scripts/arena-release-paths.mjs` güncel sürüm/dizini belirler. build/review/
upload/activate/audit araçları onu kullanır; eski kanıtlar üzerine yazılmaz.
build ve görsel hazırlığı runtime içe aktarıldıktan sonra aynı sürümde durur.
Paket/başka görev belgesi değişikliği için yayımlanmış ZIP yeniden üretilmez.

2.0 belgesindeki iki aşamalı Hosting/katalog sırası uygulanır. Yeni ek kapı:
kontrollü gecikme ve ad kabulü olmadan upload, **canlı** aynı kabul olmadan
activate çalışmaz. Korumalı site iframe'inde de gerçek klavye/ad değiştirme
denetlenir. Ortak sekiz Functions, diğer11 proje, ruleset/admin UID-claim
öncesi/sonrası karşılaştırılır. Token bellektedir; geçici imza izni token
alınır alınmaz kaldırılır. PC servis/debug portu/parola/secret payload yok.

Geri alma: bu görev before.json içindeki2.0 metadata/runtime tekrar seçilir,
güncel katalogdan SEO Hosting yeniden yayımlanır. Cloud Run yeni servis eski
istemciyi desteklediği için eski frontend seçilebilir. Hosting geri alma
katalog/Storage/Cloud Run'u geri almaz; oyun servis revision'ı ayrı işlem olur.
Paketler/runtime'lar geri alma sırasında silinmez.

## Tamamlanan yayın

2.1.0 [oyun](https://kutarya.com/oyna/pixelgun) ve
[proje](https://kutarya.com/proje/pixelgun) üzerinde etkin. Hosting
`sites/kutarya-ai-3169/versions/7216642c926abdca`; görev öncesi
`abd4fd17259a8865`. 109 Hosting dosyası,12 proje/23 sitemap/24 HTML.
Cloud Run revision `kutarya-block-arena-00003-zvm`, trafik%100, aynı URL/SA,
servis ve revision min0/max1,1 CPU/256Mi, timeout3600s; SA proje IAM rolü0.
Upload/activate geçici imza izinleri temizlendi.

ZIP `Kutarya-Block-Arena-2.1.0.zip`:46.443 bayt/SHA256
`acc678166409c47105ad66ccdf896dc6745cf477afccf6a163ef36104b0871ad`.
HTML184.710 bayt/SHA256
`f4fb989480cb5a5463cfd245d099593d367dcfaca6002ea0f7aede717bf0c76e`.
ZIP/beş gerçek PNG mevcut admin/Storage hattında bayt/SHA ile yüklendi.

Oyuncuya görünen sürüm notları sadeleştirildi. Operatörün yalnız `changelog`
alanına, mevcut belge updateTime koşuluyla uyguladığı düzeltmenin diğer tüm
alanları koruduğu metadata-acceptance.json ile doğrulandı. Paket/runtime
yeniden üretilmedi; güncel katalogdan son SEO Hosting tekrar yayımlandı.

Son HTTPS24 HTML SHA/sitemap/robots/canonical, altı eski/yeni runtime dosyası
SHA, beş PNG, anonim admin401/eksik JS404; Edge1280/390 kart/detay/Dosyalar
geçti. Üç1.0/2.0/2.1 ZIP gerçek düğmeden tam bayt/SHA/içerikle indirildi.
Korumalı site iframe'inde gerçek klavye/ad değiştirme/oda/bot WebGL geçti;
sandbox aynı, renderer/taşma hatası0. Diğer11 katalog kaydı/sekiz Functions/
diğer Cloud Run/ortak ruleset/admin UID-claim aynı. Eski1.0/2.0 paket/runtime/
görseller korunur. Yerel ve üst DEVIR bu görevde güncellendi.

Kanıtlar `artifacts/releases/block-arena/2.1.0/`: package.json, before.json,
after.json, protocol-acceptance.json, browser-acceptance.json, live-runtime-acceptance.json,
local/live-netcode-acceptance.json, before/after-latency.json,
after-latency-parallel.json, packet-acceptance.json, live-iframe-acceptance.json,
live-acceptance.json, cloud-acceptance.json, service-audit.json, metadata-acceptance.json, seo-build.json
ve hosting-deploy.log. Kabul dosyaları yayımlanan ZIP'e dahil edilmez.

Saat ölçümü: [MDN performance.now](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now).
Cloud Run işletim sınırları: [resmî WebSocket belgesi](https://docs.cloud.google.com/run/docs/triggering/websockets).
