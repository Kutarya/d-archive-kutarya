# Kutarya — Devir Belgesi

Bu dosya **herhangi bir yapay zekâ asistanı ya da geliştirici** için yazıldı.
Amacı: sistemi çalıştırabilmek ve daha önce pahalıya mal olmuş hataları
tekrar yapmamak.

Bir işe başlamadan önce "TUZAKLAR" bölümünü oku. Buradaki maddelerin her biri
gerçekten yaşandı ve saatler kaybettirdi; hiçbiri teorik değil.

> ## BU BELGE CANLI TUTULUR
>
> **Her görevin sonunda gözden geçir ve güncelle.** Nereye yazılacağı:
>
> - Yeni bir tuzak / sessiz hata bulduysan → **§3**. Somut yaz: ne yapıldı,
>   ne oldu, ölçüm neydi, doğrusu ne.
> - Yayın ya da işletim akışı değiştiyse → **§2**
> - Yeni gizli bilgi / ortam değişkeni → **§4**
> - Bilerek yapılmayan şey, bilinen sınır → **§5**
> - Yarım kalan iş → **§6**
>
> Sebebi: bu projede birden çok asistan çalışıyor ve hiçbiri ötekinin özel
> notlarını göremiyor. **Burada yazmayan bilgi kaybolur** ve aynı hata tekrar
> yapılır. "Zaten biliyorum" diye atlama; belge senin için değil, senden
> sonraki için.

---

## 1. Sistem neyden oluşuyor

| Parça | Yer | Ne yapar |
|---|---|---|
| **KutaryaAIWeb** | `D:\Kutarya\KutaryaAIWeb` | Site (React) + API (Firebase Functions, kaynak `server/`) |
| **KutaryaChatUI** | `D:\Kutarya\KutaryaChatUI` | Kutarya Us deneme ekranı (`/dene`) + araç sunucusu + yerel model betikleri |
| **KutaryaDesktop** | `D:\Kutarya\KutaryaDesktop` | Kutarya Studio masaüstü uygulaması (Electron) |
| **KutaryaAIBackend** | `D:\Kutarya\KutaryaAIBackend` | Android için ayrı `mobile-backend` Firebase Functions kod tabanı + agent görsel/video aktarma uçları |
| **KutaryaAIMobile** | `D:\Kutarya\KutaryaAIMobile` | Android Java istemcisi; Play ve doğrudan dağıtım varyantları |
| **KutaryaModelLab** | `D:\Kutarya\KutaryaModelLab` | Yerel model, veri ve eğitim laboratuvarı; üretimdeki Qwen3 GGUF burada, ince ayar hattı ayrıdır |
| **Kutarya-Studio** | `D:\Kutarya\Kutarya-Studio` | **Şube 17** banka/aile hayatta kalma oyunu; `Sube17Pc` Electron+React prototipi ve ana tasarım planı |
| **Kutarya-KTY** | `D:\Kutarya\Kutarya-KTY` | KTY Türkçe programlama dili çekirdeği (Rust workspace: `motor`, `cli`) |

`Backups`, `Recovery`, `Builds`, `kty-test` ve ikon klasörleri üretim bileşeni
değil; yedek, çıktı veya yardımcı çalışma alanıdır. Bu kökte `.git` deposu yoktur;
geri alma ve değişiklik geçmişi için Git'e güvenilemez.

**Kutarya Us** = sahibin kendi bilgisayarında çalışan yerel model (Qwen3-4B).
Kullanıcıya görünen ad **her zaman "Kutarya Us"**; `kty-us` yalnız kod içi
kimliktir ve arayüzde/e-postada/duyuruda **asla** geçmez.

### Kutarya Us zinciri

```
ziyaretçi → kutarya.com/dene → Cloud Run (api) → Cloudflare tüneli → PC:8912 (model)
                                              → Cloudflare tüneli → PC:8913 (araç sunucusu)
```

Modelin gerçek adresi tarayıcıya **hiç gitmez**. Kapı: `server/routes/kutaryaUs.js`.

### Kutarya Us sohbet denetimi

Sohbetler ziyaretçinin tarayıcısında (localStorage) tutulur; ayrıca vekil her
turu `kutaryaUsSohbetler` Firestore koleksiyonuna ÖZETLER (soru + cevap + efor +
zaman; kimlik/IP YOK — anonim kullanım var). Admin panelde **Kutarya Us**
bölümü bunu okur (`src/pages/admin/KutaryaUs.jsx`). Yazım fire-and-forget:
hata olursa yutulur, sohbet akışını bozmaz. Firestore kuralı: yalnız admin
okur, istemci yazamaz (sunucu Admin SDK ile yazar).

Bölüm KULLANICI BAZLI: sol tarafta Kutarya Us kullananların listesi (üye
e-postası ya da misafir), bir kişiye tıklayınca sağda o kişinin tüm sohbeti
balon balon (soru sağda, cevap solda; zaman + efor). Kimlik `/dene` sayfasından
gelir: girişliyse App.jsx'in localStorage'a yazdığı uid/email, misafirse
tarayıcıya özel kalıcı `kty-us-misafir` kimliği. Vekil bunu `kullanici`
alanında alır, üst modele GÖNDERMEZ (ayıklar), kayda `kullaniciKey/Tur/Eposta`
yazar. Kimlik istemciden gelir — KESİN doğrulama değil, GRUPLAMA içindir.

Eski boş **Agent Kayıtları** bölümü kaldırıldı (`AgentLogs.jsx` silindi); yerine
bu geldi. `agentLogs` koleksiyonu ve `subscribeToAgentLogs` durur — masaüstü
agent hâlâ oraya yazıyor olabilir, okuma fonksiyonu ileride lazım olabilir.

---

## 2. Günlük işletim

### 21 Ekim 2026 — KutaryaWeb Blackjack2 / Oyun Gecesi / keşif; yerel geliştirme

Kullanıcı Blackjack'i geliştirip online eklemeyi ve siteyi canlandırmayı,
ardından geliştirmeye devam etmeyi istedi. Canlı yayın onayı henüz alınmadı;
bulut/Storage/katalog/Auth/kurallar değişmedi. Kaynak KutaryaWeb/games-src/blackjack
(table.html/style.css/core.mjs/client.js) ve ayrı blackjack-server. Eski1.0.3
runtime/ZIP/kaynak korunur; diğer oyun servislerine dokunulmadı.

Royal Night2: yeşil masa/krem kartlar/pirinç; bölme/teslim/double, S17/3:2,
tek kişilik ve günlük beş tur; hesap gerektirmeyen2–5 kişilik online
kod/davet/açık oda/hazır, sunucuda deste/puan/sıra,25sn hamle/30sn dönüş/45dk oda.
Kapalı kart/deste istemciye gönderilmez. /oyun-gecesi ve ana sayfa vitrini,
tarz filtreleri, oyun seçici gerçek beş oyunu kullanır. Devamında /kesif için
üç amaç/cihaz/güncel olanak önerileri; /duyurular için gerçek sürüm notları,
arama/tür filtresi ve mevcut duyurular eklendi. Ana sayfada rota/güncelleme kartları.

Son kabul87/87+TS/Vite/SEO(13proje/26sitemap/27HTML), oyun31 görünüm ve iki Edge oturumunda üretim
gateway'inin kontrollü taşımasıyla online akış; gerçek file HTML offline tur
ve ZIP SHA geçti. Bu gerçek bulut/telefon/yük kabulü değildir. Son site kabulü
51 görünüm/üç tema/korumalı Player: keşif amacı/cihaz/boş sonuç ve günlük13
gerçek not/Türkçe arama/tür/tam not/korunan duyuru; ziyaretçi/admin26 görünüm/
8eylem geçti. data iframe'deki kullanıcı önizlemesinde de gerçek offline tur
çalıştı; randomUUID yerine getRandomValues kimliği kullanılır. Yerel Node24.15.0;
hedef Cloud Run22 henüz yayımlanmadı. Ayrıntılar yerel DEVIR'dedir.
Eski100 Hosting dosyası18Ekim manifestine eşit. Eski385/102 test klasörleri yok.
No-listeners koruması/başsız ayrı profil; PC portu veya masaüstü kontrolü yok.

Kanıt/yedek/paket KutaryaWeb/artifacts/releases/blackjack/2.0.0/;
giriş inceleme.html, local-validation.json ve unit-tests.log. İnceleme ZIP21701
bayt/SHA47c24a38edeaae480d134ced14a6ac9379cfc99cb98aadbf6ce0a795c8c24e06.
bakım docs/BLACKJACK-2-OYUN-GECESI.md. Yayın onayından sonra ayrı Cloud Run,
gerçek endpoint/kabul, mevcut admin Storage ve sürümlü Hosting/katalog hattı
tamamlanır; gerçek bulut/HTTPS/indirme kabulü sonra yapılır. Deploy helper
hazır ama çalıştırılmadı. Kayıt hem yerel hem üst DEVIR'dedir.

### 18 Ekim 2026 — Rus Ruleti: Son Tur 1.0.1 geliştirildi ve yayımlandı

- Kullanıcının HTML/CSS/JS oyun/oda/oyuncu bulma/yayın talimatıyla https://kutarya.com/oyna/rus-ruleti ve /proje/rus-ruleti etkin. Katalog13 gerçek proje. İstemci1.0.1; bulut servisi1.0.0/ağ sözleşmesi1 korunur. Hosting sites/kutarya-ai-3169/versions/b559d71ce1f095d4; önceki sites/kutarya-ai-3169/versions/ac73c06b30067506; görev başlangıcı6cdaeae4c630d99a. İlk1.0.0 paketi/runtime/görseller korunur.
- Animasyonlu metal hazne,2–6 kişilik özel/açık oda, kod/davet, gerçek masa listesi, hızlı eşleşme/8 saniye, hazır olma,25 saniye/otomatik çekim, tek pas, sunucu sonucu, rövanş, emoji, ses, mobil/azaltılmış hareket, ayrı üç botlu antrenman. Botlar insan gösterilmez; hesap/bahis yok.1.0.1 dar site iframe'inde kesilen düğmeleri düzeltti;240 piksel iç genişlik sınanır.
- Ayrı Cloud Run kutarya-rus-ruleti/europe-west1: kutarya-rus-ruleti-00002-r8k, trafik%100, service/revision min0/max1,1CPU/256MiB,timeout3600s; runtime SA proje rolü0. Odalar geçici/45 dakika; kopmada30 saniyeye kadar dönüş denenir. Açık WebSocket aktif bulut kullanımı oluşturur.
- Kabul: oyun15/15, site64/64+TypeScript/Vite,audit0. Değişmeyen gerçek bulut servisinin 18 protokol grubu1.0.0 kanıtından korunur (altı/yedinci sınırı,yetkisiz hamle/kopma/dönüş/geri sayımda sahiplik). Yeni1.0.1 istemci gerçek iki Edge bağlamında ayrıca aynı kazanan/kod/hazır/klavye/pas/rövanş/hızlı eşleşme ile sınandı.240/282/320/390/768/1366 görünüm ve gerçek /oyna korumalı iframe geçti.
- Canlı25 HTML SHA,sitemap/robots,üç runtime/dörtPNG,1280/390 proje sayfası ve gerçek İndir düğmesinden yeni ZIP tam bayt/SHA/içerik geçti. Eski1.0.0 dosyası korunur. Fiziksel telefon/farklı ağ/yoğun yük ölçülmedi; eski AI385/Desktop102 klasörleri yok, koşulmuş sayılmaz.
- Diğer12 katalog kaydı/sekiz Functions/diğer Cloud Run/kurallar/Auth/admin ve93 eski Hosting dosyası korundu. Geçici IAM geri alındı. PC portu,etkileşimli giriş/parola,sır payload'ı veya açık masaüstü uygulaması üzerinde kontrol yok.
- Kaynak games-src/rus-ruleti,roulette-server; kanıt artifacts/releases/rus-ruleti/1.0.1/. ZIP21750 bayt/SHA 893c71e4d78a087ecf833ab8187bb8c2f121957e0ce43e1c0d163a4948e220dd; HTML71244 bayt/SHA 82a68625013f8d7fcfb7499cff734c3186bebc1873c2da2a39b856a36d465acf. Sabit yayımlanmış paketler üzerine yazılmaz. Önceki1.0.0 kanıtı artifacts/releases/rus-ruleti/1.0.0/ altındadır.
- İş akışı: roulette-cloud before; build-roulette; roulette-accept-rules; review-roulette/iframe/matchmaking; prepare-roulette-release; freeze-roulette; authorize-roulette upload; deploy-release hosting; gerçek live kabulü; authorize-roulette activate; deploy-release hosting; gerçek katalog iframe/site; roulette-cloud after. Yeni gateway yayını gerekirse deploy-roulette; Node çağrıları --require ./scripts/no-listeners.cjs ile. Ayrıntı docs/RUS-RULETI.md.


### 18 Ekim 2026 — Kutarya Jenerik 1.4.0 canlı yayını

- Kullanıcının açık siteye yayın talimatıyla yalnız Jenerik katalog/Storage paketleri ve Hosting yayımlandı. Hedef kutarya-ai-3169 / kutarya.com; Hosting `6cdaeae4c630d99a`, önceki `8856063159d3f95a`.
- Güncel dosyalar Setup1.4.0-r2 (225363910 bayt) ve portable1.4.0 (202505900 bayt). Eski1.2/1.3.1 dosyaları korunur; yeni dosyalar güncel bölümde, eskiler açılır bölümde.
- r2 yalnız kurulum korumasıdır; uygulama aynı1.4.0. Eski resources verisi kaldırıcıdan önce yedeklenir, eski yollar korunur, boş AppData alanı hazırlanır; mevcut yeni veri ezilmez. Açık uygulama zorla kapatılmaz. Altı gerçek NSIS kanca/ayrı sahte veri senaryosu geçti; gerçek Setup kullanıcı kurulumunda test edilmedi.
- Uygulama72 birim+59 paket kontrolünden geçen136 dosyayla eşit. Site64/64+build; gerçek HTTPS24 HTML SHA, Edge1280/390, dört görsel, iki gerçek İndir düğmesinden tam dosya/boyut/SHA kabulü geçti. Fiziksel telefon/canlı ElevenLabs yok.
- Diğer11 proje, sekiz Functions, kurallar, Auth/admin ve82 eski Hosting dosyası korundu; IAM eski durumunda. PC portu/parola/secret payload veya açık Jenerik üzerinde kontrol yok.
- Sürüm yolları scripts/jenerik-release-paths.mjs ile ayrıdır. Hazırlık: prepare-jenerik-release.mjs; yedek/kabul: jenerik-release-audit.mjs before|after; mevcut admin yüklemesi: authorize-jenerik-release.mjs; Hosting: deploy-release.mjs hosting; canlı kabul: verify-jenerik-live.mjs. Eski giriş betikleri bu güncel akışa yönlenir. Node çağrıları no-listeners.cjs ile, yayın logu KUTARYA_RELEASE_LOG_DIR üzerinden sürüm dizinine gider.
- Kanıt/geri dönüş: artifacts/releases/kutarya-jenerik/1.4.0/; paketler artifacts/kutarya-jenerik/1.4.0/; görseller public/media/projects/kutarya-jenerik/1.4.0/. Ayrıntı docs/KUTARYA-JENERIK-1.4-YAYIN.md. Yayın NSIS kaynağı ve yerel kaynak ZIP C:/Users/yunus/Documents/Codex/2026-10-18/im/outputs/Kutarya-Jenerik-1.4.0-Web-Yayini/ altında; eski1.4.0 teslimi üzerine yazılmadı.



### Kutarya Us'u aç / kapat
```
Masaüstü: "KUTARYA US - BASLAT"  /  "KUTARYA US - DURDUR"
Betik   : D:\Kutarya\KutaryaChatUI\KUTARYA-US-BASLAT.ps1  (-Sessiz otomasyon için)
```
Betik: model + araç sunucusu + iki tünel + adresi canlıya bildir + doğrula.
**~24 saniye.** Bilgisayar her kapanıp açıldığında çalıştırılmalı.

**Neden her seferinde:** ücretsiz Cloudflare tünellerinin adresi her açılışta
değişir. Adres `config/kutaryaUs` Firestore belgesine yazılır, sunucu oradan
okur (20 sn önbellek). Deploy GEREKMEZ.

### Güncel paylaşım sitesi — 14 Ekim 2026

Kullanıcı geliştirmeye devam ve bitince canlıya alma onayı verdi. Yalnız
Hosting `8856063159d3f95a` (önceki `b13d7b2803ee333a`) yayımlandı. Ana sayfa gerçek
proje vitrini/son güncellemeler, açıklamalı sürümlü kartlar, mobil arama/Günlük,
olanak filtreleri, güncel paket düğmesi ve eski dosya ayrımıyla yenilendi.
Galeri büyütme/oklar/Escape/odak dönüşü, yönetici taslak önizlemesi ve belirli
ayrılma yollarında kaydedilmemiş değişiklik uyarısı eklendi. SPA tarayıcı Geri/
İleri bu uyarıyla engellenmez; kapsamı abartılmaz.

64/64 + TypeScript/Vite/SEO build; başsız kontrollü 48 yeni görünüm/6 eylem ve
26 mevcut görünüm/8 eylem geçti. Gerçek HTTPS 24 HTML SHA,14 genel görünüm,6 eski
yol, yeni filtre/geri geçmişi/mobil arama/galeri/dosya sekmesi, anonim admin
reddi, gerçek Blackjack açılışı ve3185 bayt ZIP indirme SHA geçti. Gerçek yönetici
parola girişi/mail teslimi/kaydetme testi yapılmadı; ilgili UI kontrollü serviste
doğrulandı. Eski AI385/Desktop102 klasörleri yok; koşuldu sayılmaz.

12 proje,8 Functions,kategoriler/duyuru/ayar/adres kayıtları,Auth/admin ve canlı
kurallar aynı.82 oyun/medya/özel dosya Hosting manifest hash'i öncesi/sonrası
birebir; özel paylaşım noindex/sitemap sınırı korundu. IAM değişmedi. Kanıt ve
geri dönüş yedeği `KutaryaWeb/artifacts/site-refresh/2026-10-14/`; bakım belgesi
`KutaryaWeb/docs/SITE-YENILEME-2026-10-14.md`.

Bu devam görevinde PC/masaüstü kontrolü yapılmadı. Kullanıcı şimdilik PC'yi
kontrol etmemeyi istedi; testler başsız Edge'in ayrı geçici profili/pipe ile
gerçekleştirildi. Sanal makine kullanıldığı iddia edilmez. Yeni Node dinleme/
debug portu/parola/etkileşimli login açılmadı. Yayın logu için
KUTARYA_RELEASE_LOG_DIR yalnız artifacts altına yönlendirilebilir.

### Paylaşım sitesi önceki yayın — 12 Ekim 2026

Kullanıcının Muvv proje ZIP'ini kaynak/görsel/iyileştirmelerle yayımlama
talimatı tamamlandı: https://kutarya.com/ozel. Yalnız adresle paylaşım; genel
menü/katalog/sitemap bağlantısı yok. Adresi bilen herkes erişebilir; parola
koruması uygulanmadı. Sayfa ve özel dosyalar `noindex, nofollow`,
`Referrer-Policy: no-referrer` taşır. `robots.txt` özel adresi listelemez.

Yalnız Firebase Hosting `b13d7b2803ee333a` (önceki `7216642c926abdca`).
ZIP1.218.590 bayt/SHA256
`6dc8ca25036ed73096231543323b5ff1a1ec387660cc7205e115d348fd2f3b62`;
ilk BRS teslimiyle birebir. `/ozel/muvv/0.4.0-20261012/` altında ZIP/altıPNG/CSS
sürümlü immutable; üzerlerine yazılmaz. Kaynak sayfa `KutaryaWeb/public/ozel.html`,
yol kuralları `firebase.json`; mevcut SEO yayın helper'ı kullanılmaya devam eder.

Site58/58 + TypeScript/SEO build; 24 genel HTML SHA/23 sitemap, özel sayfa/CSS/
ZIP/altıPNG SHA, gerçek Edge İndir düğmesinin tam bayt/SHA,1280/390 görüntü,
beş görsel decode'u/tam boy açma/checksum kontrolü geçti; taşma ve renderer/
console hatası0. Sekiz Functions, 12 katalog kaydı ve diğer koleksiyonlar,
Firestore/Storage ruleset, admin/Auth aynı; IAM değişimi yapılmadı.
PC sunucusu/port/parola yok. Eski AI385/Desktop102 klasörleri yok; koşulmuş sayılmaz.

Windows Muvv demo/temiz kurulum doğrulandı; 176 uygulama testinde162 geçti,
14 Linux/POSIX testi atlandı,33 gerçek Tk senaryosu var. Linux/Rival3 donanım/
firmware kabulü yapılmadı. Kanıt `KutaryaWeb/artifacts/releases/muvv-private/0.4.0-20261012/`;
ayrıntı `KutaryaWeb/docs/OZEL-MUVV-YAYIN.md`. Hosting REST başlıkları nesnedir;
config'in key/value dizisi varsayımı yapılmaz. Yerel tarayıcı yanıt taklidi
gerçek dosya indirme kabulü değildir; canlı HTTPS kabulü ayrı yapılır.

### Paylaşım sitesi önceki yayın — 11 Ekim 2026

Kutarya Block Arena2.1.0 aynı sohbetin geliştirme/yayın talimatı ve kullanıcının
online ad/yüksek ms düzeltmesi isteğiyle https://kutarya.com/oyna/pixelgun
üzerinde etkin. Hosting `7216642c926abdca`; görev öncesi `abd4fd17259a8865`.
Herkes lobide ve maç menüsünde kendi adını değiştirebilir; Türkçe ad/çakışma
numarası ve başlangıç silahı seçimi var. Ziyaretçi hesabı eklenmedi.

İstemci/sunucu ortak60 Hz sabit hareket, işlenen sıra numarası/bekleyen girdi
tekrarı, rakiplerde örnekler arasında çizim, anında kendi atış sesi/geri tepme.
Hasar/mühimmat/skor sunucuda. Gönderim30 paket/sn, maç20 Hz/lobi4 Hz;
protokol3 daha az alan taşır. Eski2.0/protokol2 de aynı serviste çalışır.
Cloud Run aynı servis/region/kimlik, revision `kutarya-block-arena-00003-zvm`,
trafik%100; service/revision min0/max1,1 CPU/256Mi, timeout3600s. Runtime SA
proje IAM rolü0; iki operatör geçici imza izni de kaldırıldı.

Canlı kontrollü120+120 ms gecikme testinde toplam RTT328 ms, ilk hareket
tepkisi13 ms, sonunda sunucu farkı0. Aynı sekiz kişilik odada eski/yeni paket
ortancası5035/2492 bayt, %51 küçülme; eski revision yük benchmark'ı değildir.
Bu ağda Edge önce16 örnek ortanca74/p95186 ms; son canlı tek tarayıcı14 örnek
ortanca81/p9595 ms. Ham20 örnek ortanca77/max741 ms (hello ile prob birlikte
başlar). Ağ pinginin her bağlantıda düştüğü iddia edilmez; FPS iyileşmesi
kanıtı yok. Fiziksel telefon/farklı ağlar/yoğun oyuncu yükü ölçülmedi.

Arena15/15, site58/build, üretim audit0; gerçek bulut vuruş/eleme/yeni doğma,
180 saniye sonuç/rövanş/takım/sekiz katılımcı sınırı ve eski istemci uyumu geçti.
Yerel/canlı Edge25 görünüm/üç harita/iki ayrı oturum, gerçek klavye ile iki
kişinin bağımsız ad değişimi/çakışma/maç menüsü ve gecikme kabulü geçti.
HTTPS24 HTML SHA/23 sitemap, altı eski/yeni runtime dosyası SHA/beş PNG;
1280/390 kart/detay/Dosyalar, üç ZIP gerçek düğmeden tam bayt/SHA/içerik,
korumalı iframe'de gerçek ad değişimi/oda/bot WebGL geçti. Renderer/taşma0.

ZIP46.443 bayt/SHA256
`acc678166409c47105ad66ccdf896dc6745cf477afccf6a163ef36104b0871ad`.
Eski1.0/2.0 runtime/ZIP/görseller ve diğer11 proje/sekiz Functions/diğer
Cloud Run/ortak ruleset/admin UID-claim aynı. Ortak Auth/AI/mobile/PayTR
değişmedi; PC portu/parola/secret payload yok. Eski AI385/Desktop102 klasörleri
yok; koşulmuş sayılmaz. Kanıt KutaryaWeb/artifacts/releases/block-arena/2.1.0/;
ayrıntı KutaryaWeb/docs/BLOCK-ARENA-2.1.md ve yerel DEVIR içinde.
Güncel sürüm helpers tarafından arena-release-paths.mjs'den okunur; eski
paket üzerine üretim durur. Hosting geri alma katalog/Storage/Cloud Run'u
geri almaz. Geçici odalar/45 dakika sınırı/30 saniye yeniden bağlanma ve
aktif bağlantı maliyeti sürer.

Önceki2.0 yayın kaydı — 10 Ekim 2026:

Kutarya Block Arena2.0.0 kullanıcının grafik/tasarım/mantık/efekt/online
geliştirme ve yeni sürümü yayımlama talimatıyla
https://kutarya.com/oyna/pixelgun üzerinde yayımlandı. O görevde Hosting
`abd4fd17259a8865`; görev öncesi `1de14f25e4536bb1`. Yeni menü/HUD,
ışık/sis/malzeme/şehir/arena detayları, vuruş/eleme/patlama efektleri,
koşu enerjisi ve atılma; üç harita/beş silah ve bot modları korunur.
Hesapsız2–8 kişilik oda kodu, serbest/takım online maç; sunucu hareket,
mühimmat/hasar/yeniden doğma/skor, sonuç/rövanş/30 saniye yeniden bağlanma.

Bağımsız Cloud Run `kutarya-block-arena` europe-west1, revision
`kutarya-block-arena-00002-l2w`, trafik%100; yetkisiz ayrı runtime SA,
DB/Auth/secret erişimi yok. 1 CPU/256Mi, min0/max1;16 oda/128 bağlantı
uygulama sınırıdır, yük kapasitesi kanıtı değildir. Odalar bellekte geçici;
restartta kapanır,45 dakika sınırı vardır. Aktif bağlantı/derleme maliyeti oluşur.
Tuzak: gcloud `--max-instances=1` service scaling20'yi bırakabildi;
`--max=1 --min=0` da yazılır, canlı API'de iki düzey denetlenir.

Arena11/11, site58/build ve npm üretim audit0; gerçek Edge yerel/canlı25
görünüm/üç harita/iki tarayıcı online hareket/ateş/yeniden bağlanma geçti.
Gerçek bulut sekiz oyuncu/dokuzuncu reddi, yetkisiz başlatma/konum-skor
enjeksiyonu reddi, vuruş/eleme/yeniden doğma,180 saniye maç sonu/aynı sonuç/
rövanş/takım odası geçti. Canlı24 HTML SHA/23 sitemap, beş PNG, dört eski/
yeni runtime dosyası SHA; Edge1280/390 kart/detay/Dosyalar ve iki gerçek ZIP
İndir düğmesi tam bayt/SHA/içerik, korumalı iframe online/bot kabulü geçti.
Taşma/renderer hatası0. Fiziksel telefon/farklı ağlar/yoğun yük ölçülmedi.
Eski AI385/Desktop102 test klasörleri yok; koşulmuş sayılmaz.

Yeni ZIP44.123 bayt/SHA256
`8af2017a8f1b95431a787287f8e0bfabf7258e7f01b5023bc2a8c1b03dd28ba6`.
Eski1.0 HTML/OKU/ZIP korunur. Diğer11 proje, sekiz Functions/diğer Cloud Run
servisleri, ortak Firestore/Storage ruleset ve admin UID/claim aynı.
Geçici imza izni yükleme/etkinleştirmeden önce kaldırıldı; PC portu/parola
veya secret payload yok. Kaynak KutaryaWeb/games-src/pixelgun ve arena-server;
kanıt KutaryaWeb/artifacts/releases/block-arena/2.0.0/, ayrıntı
KutaryaWeb/docs/BLOCK-ARENA-2.md. Yayımlanan2.0.0 paket/runtime sabittir.
Hosting geri alma katalog/Storage/Cloud Run'u geri almaz; eski metadata ayrıca seçilir.

Önceki Video yayını:
Kutarya Video1.1.0 kullanıcının mevcut uygulamayı geliştirme ve sitede
yayımlama talimatıyla https://kutarya.com/proje/kutarya-video üzerinde
yayımlandı. O görevde Hosting1de14f25e4536bb1; önceki ba161f8b5c0458d6.
İsim/link alanı, klasör seçimi, temizlenebilir ayrı geçmiş, dört tema ve
açılışta sürüm kontrolü eklendi. D:/KutaryaVideo kaynağı yoktu; SHA doğrulanmış
1.0 portable içinden eski kod/motorlar geri alınarak devam edildi.
22 çekirdek + gerçek portable30 kontrol, Setup93 payload SHA kontrolü ve
site58/build geçti. İki yeni EXE/dört ekran tam bayt/SHA ile yayımlandı;
eski iki Video dosyası/diğer11 proje/sekiz servis/kurallar/Auth/claim/IAM aynı.
Canlı24 HTML SHA/sitemap/robots/canonical, anonim admin401 ve Edge1280/390
kart/detay/Dosyalar/iki gerçek İndir düğmesi tam bayt/SHA geçti; renderer/
taşma0. Canlı sürüm karşılaştırması1.1 güncel/1.0 girdisi için1.1 yeni geçti.
Kanıt KutaryaWeb/artifacts/releases/kutarya-video/1.1.0/.
Gerçek isim araması geçti; YouTube bu ağda429/bot doğrulamasıyla indirmeyi
engelledi, tamamlanmış video/ses kabulü açık. Windows kurulum ve gerçek OS
bildirimi teslimi test edilmedi. Ayrıntı KutaryaWeb/docs/KUTARYA-VIDEO-1.1-YAYIN.md.
1.1.0 paketleri sabittir; yayımlanmış aynı sürüm EXE'sini yeniden üretme.

Önceki Mobile yayını:
Kutarya Mobile1.2 “Siteye yayınla” talimatıyla
https://kutarya.com/proje/kutarya-mobile üzerinde yayımlandı. Güncel Hosting
ba161f8b5c0458d6; önceki f57f0560937b8525. APK/kaynak ve dört gerçek ekran
mevcut admin/Storage hattında; diğer11 proje, sekiz Functions, kurallar/
Auth/claim'ler korundu, geçici IAM geri alındı. Site58/58 + build,24 canlı
HTML SHA'sı, sitemap/canonical ve Edge1280/390 gerçek dört İndir düğmesinin
bayt/SHA kabulü geçti. 1.2 iki dosya başta;1.1 iki eski dosya korunur.
Kanıt KutaryaWeb/artifacts/releases/kutarya-mobile/1.2.0/;
ayrıntı KutaryaWeb/docs/KUTARYA-MOBILE-1.2-YAYIN.md. 1.1/1.2 paketleri
sabittir; devir belgesi değişikliği için aynı sürüm ZIP'inin üzerine yazma.

Kullanıcının yeni talebiyle ziyaretçi hesabı/kayıt, kişisel kütüphane/favoriler
ve otomatik kişisel geçmiş arayüzden kaldırıldı; yönetici paneli/girişi korunur.
Somut değişiklik için "Canlıya yayımla" onayıyla yalnız kutarya-ai-3169 /
kutarya.com Firebase Hosting yayımlandı. 9 Ekim sürümü `43f73b57e6eb7708`,
önceki `de4a2f903b00e3ba`; config/sürüm yedeği
KutaryaWeb/artifacts/release-2026-10-09-public-access/before.json içindedir.
58/58 + build ve gerçek HTTPS/Edge 1280/390 px kabulü geçti: 23 HTML SHA'sı,
14 görünüm, altı eski yol, anonim admin 401, gerçek misafir ZIP indirimi ve
Blackjack runtime açılışı. Sekiz Functions, kurallar, 11 proje, Auth ayarları ve
admin claim'leri aynı. Gerçek yönetici parola girişi/mail teslimi ölçülmedi;
port/parola/secret payload yok. Ayrıntı KutaryaWeb/DEVIR.md ve docs/KABUL.md.

**Model paylaşımında kalıcı sınır:** Kullanıcı "bizim verimiz ve setimiz bize
özel olmalı" talimatını yeniledi. Modeli paylaşma yetkisi eğitim/veri hazırlama
hattını, veri setini, özel site/backend sistemlerini veya servis sırlarını
yayımlama yetkisi değildir. Yalnız seçilen checkpoint ve çalışması için gereken
minimum model/tokenizer/üretim dosyaları izin listesiyle paketlenir; KTY klasörü
ve ham eğitim checkpoint'i topluca yayımlanmaz.

Canlı KTY ZIP'i yeniden tam indirildi; byte/SHA aynı. Sekiz dosya ve checkpoint
alanları, 125 tensörün storage/attribute'ları, standart PyTorch metadata'sı ve
kamu katalog metaverisi kontrol edildi. Veri seti, eğitim kodu/günlüğü,
optimizer/RNG/veri metadata'sı, özel servis/backend veya sır yok. Yayın değişmedi.
Kanıt KutaryaWeb/artifacts/release-2026-10-09-kty-step10000/privacy-audit.json.
Bu, yayımlanan dosya/alan denetimidir; ağırlıkların eğitim örneklerini yeniden
üretmediğine dair gizlilik testi yapılmadı.

Kullanıcının yalnız 10.000. adım checkpoint'ini eğitim verisi olmadan yükleme
talimatıyla https://kutarya.com/proje/kutarya-us-kty-1-0 yayımlandı.
Görünen ad Kutarya Us · KTY-1.0, sürüm 1.0.0-step10000; toplam 11 gerçek proje.
Kaynak D:\KTY-1.0\checkpoints\kty-1.0-v4-50m-step010000.pt payload'ı step=10000;
gerçek parametre toplamı 50.055.680 (50,06 milyon). Daha sonraki checkpoint yok.

Orijinal 600821973 baytlık AdamW checkpoint'i 500 MiB site sınırını aşar.
Yayın kopyasında yalnız ağırlıklar, mimari, adım ve sohbet biçimi bulunur;
optimizer/RNG/eğitim ayarları/veri metadata'sı çıkarıldı. Eğitim verisi,
train.py ve günlükler pakete alınmadı. Kaynak dosya değişmedi, eğitim yapılmadı.
Model tensörleri/dtype birebir aynı; inference PT 200266979 bayt.
ZIP 185880574 bayt, sekiz dosya (PT, model/tokenizer/config/generate Python,
README, requirements, manifest); SHA256
6322DF98556B0CA8A5D76E81590E550E5D369289ED4A012992AA0BF4222E6C5D.
Kaynak checkpoint SHA256
FD14D7E3F5E4B54024BC838226ED95F320E3DB4337049B382CFA6443835D5152.

Checkpoint yayını sırasındaki Hosting de4a2f903b00e3ba; önceki
3da31883d12ecdd3 ve katalog/config yedekli.
KutaryaWeb/artifacts/release-2026-10-09-kty-step10000/ kanıt klasörüdür.
58/58 + build, 11 proje / 22 sitemap URL'si / 23 statik React sayfası.
Sekiz servis, kurallar, admin claim'leri ve 10 diğer kayıt değişmedi; önceki
eğitimsiz 5M beyin ürünü korundu. Mevcut admin/Storage hattı (gamesService
europe-west1, Storage US-EAST1); geçici imza izni yüklemeden önce kaldırıldı.
PC portu veya parola/key payload yok. Tam bulut indirmesi ve gerçek İndir
düğmesinin ZIP'i byte/SHA ile doğrulandı. Tarayıcı ZIP'inden temiz klasörde
strict load, step, tensör eşitliği, parametre sayısı ve gerçek CLI üretimi geçti.
1280 px taşmasız/sıfır renderer hatası; GPU/kalite benchmark'ı yapılmadı.
Hazırlama scripts/prepare-kty-checkpoint.py; yayın operatörü
publish-kutarya-us-beyin.mjs prepare|backup|upload|verify kty-step10000.
Kullanım: ZIP'i çıkarıp python generate.py --prompt "selam" --greedy.
Ayrıntı KutaryaWeb/DEVIR.md. Inference paketi optimizer ile resume sağlamaz.

### Paylaşım sitesi tarihsel Python yayını — 9 Ekim 2026

Kullanıcının Python kodunu siteye yükleme talimatıyla Kutarya Us Model Beyni
1.0.0 kaynak kod koleksiyonunda yayımlandı:
https://kutarya.com/proje/kutarya-us-beyin. Katalog 10 gerçek proje.
Hosting 3da31883d12ecdd3; önceki 0413230d431dbb8a ve katalog/config yedekli.
KutaryaWeb/artifacts/release-2026-10-09-kutarya-us-beyin/ kanıt klasörüdür.

Kaynak ZIP 3185 bayt, yalnız kutarya_us_beyin.py (9036 bayt); Python dosyası
önceki mimari teslimiyle SHA olarak aynı. Eğitim verisi/eğitim/eğitilmiş ağırlık
eklenmedi. Mevcut admin/Storage hattı ve kısa ömürlü token; geçici IAM izni
kaldırıldı, PC portu veya parola/key payload yok. gamesService europe-west1,
Storage US-EAST1; yalnız Hosting yenilendi. Sekiz servis, kurallar, admin
claim'leri ve dokuz önceki katalog kaydı aynı. 58/58 + build; 10 proje için
22 statik React sayfası / 21 sitemap adresi. Tam bulut ve gerçek İndir düğmesi
ZIP byte/SHA ve içindeki tek Python'un aslıyla eşitliği doğrulandı. Doğal
374 px tarayıcı görünümü taşmasız, renderer error 0. Ayrıntı yerel DEVIR.md;
metadata projects-src/kutarya-us-beyin.mjs, operatör publish-kutarya-us-beyin.mjs.

### Paylaşım sitesi tarihsel yayını — 8 Ekim 2026

Kutarya Jenerik 1.3.1 kullanıcının açık yayın talimatıyla güncellendi:
Hosting 0413230d431dbb8a; önceki 5998163b5783affb yedekli.
Yeni Setup 254533579 bayt ve altı güncel ekran tam bulut SHA/boyut ile
doğrulandı. Eski 1.2 Setup korunur, mevcut sürüm ilk sırada gösterilir.
Uygulama 43/43 birim + paketli 75/75; site 58/58 + build. Kayıt hatasında
taslak/çıktı konumu son geçerli değerde kalır; motor sürümü paket bilgisidir.
Canlı YouTube paketli üretim kabulü oturum gereksinimiyle engellendi;
ElevenLabs taklit servis, installer çalıştırılmadı. Sekiz başka katalog ürünü,
sekiz servis, kurallar ve admin claim'leri korundu; geçici IAM kaldırıldı.
PC'ye bağımlı servis/yerel port/parola/key payload yok. Detaylar
KutaryaWeb/docs/KUTARYA-JENERIK.md ve D:\KutaryaJenerik/BAKIM-RAPORU-1.3.1.md.

### Paylaşım sitesi tarihsel yayını — 7 Ekim 2026

Son yayın Kutarya Jenerik 1.2.0: Hosting 5998163b5783affb, dokuz gerçek
proje; https://kutarya.com/proje/kutarya-jenerik. Mevcut 225325235 bayt Setup,
dört gerçek ekran ve ürün/kullanım açıklamaları mevcut admin/Storage hattından
yayımlandı. 58/58 + build, buluttan tam dosya SHA/boyut, gerçek İndir düğmesi,
1280/390 px görünüm/taşma yok/sıfır renderer hatası kabulü geçti. 21 statik
React sayfası/19 sitemap URL'si. Sekiz önceki katalog kaydı ve sekiz Functions
servisi, Firestore/Storage kuralları, admin claim'leri ve Jenerik kaynak/paketleri
korundu. Yerel port veya parola/key payload yok; geçici IAM imza izni kaldırıldı.
Setup çalıştırılmadı; uygulamadaki bekleyen değişikliklere başlanmadı.
Ayrıntılar KutaryaWeb/docs/KUTARYA-JENERIK.md ve artifacts/kutarya-jenerik/.
Önceki SEO 03796011d9d93fce aynı kanıt klasöründe yedeklendi; aşağıdaki kayıt
Jenerik öncesi yayın geçmişidir.

Güncel site kaynağı D:\Kutarya\KutaryaWeb; hedef kutarya-ai-3169 / kutarya.com.
Kullanıcı yeni katalog Hosting yayınını açıkça onayladı; şifre isteyen işlem
iptal edilir, PC portu kullanılmaz ve açık Kutarya Video'ya dokunulmaz.
Güncel SEO Hosting sürümü 03796011d9d93fce; önceki katalog 9a946d116eab4fd9
ve AI 8d7f667bc98add29 kayıtlı/yedekli. Sekiz
gerçek proje, gamesService europe-west1 ve Storage paket hattı canlı.
Yayın akışı KutaryaWeb/docs/YAYIN.md; dar deploy-release.mjs kapsamlarını kullan.
Ortak Firestore kuralları ve önceki yedi Functions servisi korundu.
Mevcut site SEO sonrası 58/58 + build; canlı kabul KutaryaWeb/docs/KABUL.md ve SEO.md.
Eski silinmiş AI testleri çalıştırılmış sayılmaz. Windows kurulum/kaldırma,
normal hesap/mail ve fiziksel cihaz kabulü açık. Sunucu Firebase'de çalışır;
PC'nin açık kalması gerekmez. Eski tarihli "deploy yok" kayıtları tarihseldir.

SEO yayını deploy-release.mjs hosting içinde build-seo.mjs ile yapılır: gerçek
public katalogdan aynı React UI'nın 20 HTML sayfası, 18 sitemap URL'si ve 19
görsel. Generated firebase.seo-release.json kullanılır; normal build + elle
base config deploy SEO'yu siler. dist/app.html özel/yeni dinamik projelerin
SPA girişini korur. Ayrıntılar KutaryaWeb/docs/SEO.md.
Search Console yetkili mevcut Chrome oturumuyla açıldı; yanlış ana sayfa HTML
harita kaydı kaldırılıp sitemap.xml başarıyla yeniden gönderildi. Video için
"Dizine eklenmesi istendi" görüldü; gönderim indekslenme sonucu değildir.
Ana sayfa Google'da mevcut; yeni içerik için yeniden tarama isteği de kabul edildi.
www custom domain ve kutarya.com 301 hedefi eklendi. 7 Ekim 11:09 UTC gerçek
HTTPS sertifika doğrulaması + ana/proje/sitemap yolu koruyan 301 geçti; API
CERT_PROPAGATING. GoDaddy şifre istediği için o adım iptal edildi, DNS değişmedi.
Önceki www sertifika hatası tarihsel. Açık portable PID 28976 ve kaynak/EXE
SHA korundu; yerel sunucu/emülatör/debug portu kullanılmadı.
Canlı www kabulünden sonra iki eski 404 kaydının Search Console doğrulaması
başlatıldı; "Doğrulama başladı" (7.10.2026). Google'ın nihai indeksleme/hata
doğrulaması açık; gönderim ve canlı ölçüm sonucu ile aynı kabul sayılmaz.

### Kutarya Jenerik masaüstü — 7 Ekim 2026

Kullanıcı yeni D: PC uygulaması istedi; D:\KutaryaJenerik\Kutarya Jenerik.exe
ve kaynak/ oluşturuldu. Şarkı ortada kesilir; siyah ekranda jenerik+seçilen fon
çalarken şarkı durur, sonra aynı yerden devam eder. Hazır kayıt veya metinle
Emel/Ahmet ve diğer sesler; MP4/MP3, sıra/iptal/tekrar/önizleme/kalıcı ayarlar.
Fade yalnız şarkının ses/görüntüsüne, konuşmaya değil. Yerel sunucu/port yok.
Detay/kabul/tuzaklar D:\KutaryaJenerik\DEVIR.md; kaynak kaynak/, kanıt Kanitlar/.
8/8 birim ve teslim EXE'sinde 24/24 kabul geçti; gerçek 1080p YouTube+Ahmet
seslendirmesi+MP4/MP3, geçmişten yeniden yükleme, Emel önizlemesi ve iptal dahil.
Normal EXE açıldı, boş geçmişle bırakıldı; startup görüntüsü ve tüm alt süreçlerin
TCP/UDP port açmadığı Kanitlar/baslangic altında doğrulandı.
Sekiz Kutarya Video kaynak/EXE SHA'sı korundu. Bu görevde site/katalog/Hosting
ve ortak servisler değişmedi; yeni uygulamayı halka yükleme onayı sayılmaz.

### Eski AI sitesi yayın akışı — tarihsel
```
cd D:\Kutarya\KutaryaAIWeb
npx firebase deploy --only hosting,functions --project kutarya-ai-3169
```
İstemci değişikliği → `hosting`. `server/` değişikliği → `functions`. İkisi
birbirine bağlıysa **ikisini birlikte** deploy et.

### Masaüstü uygulaması yayınla
`KutaryaDesktop/CHANGELOG.md` ve aşağıdaki TUZAK #10'a bak. Özet:
sürüm yükselt → **kullanıcı bazlı** yapı üret → `KutaryaAIWeb/public/downloads/`
içine koy, eskisini sil → `src/config/studioSurum.js` güncelle →
`node scripts/surum-manifesti.mjs` → build + deploy.

### Testler
```
cd KutaryaAIWeb/server && npm test     # 385 test
cd KutaryaDesktop      && npm test     # 215 test (12 grup)
```
**Deploy öncesi ikisini de çalıştır.** Yeşil değilse deploy etme.

İlgili bileşende ayrıca:
```powershell
cd KutaryaAIBackend\functions && npm run check
cd KutaryaAIMobile && .\gradlew.bat testPlayDebugUnitTest testDogrudanDebugUnitTest
```
2026-09-11 ölçümü: mobil backend birim testleri **81/81**, entegrasyon
**1 geçti / 1 emülatör olmadığı için atlandı**; fakat `npm run check`,
`src/routes/agent-api-routes.js:248` içindeki kullanılmayan `reqId` yüzünden lint
aşamasında kırılıyor. Android'in iki varyant testi Gradle düzeyinde geçti.

---

## 3. TUZAKLAR — okumadan kod yazma

**KutaryaWeb UI (14 Ekim):** Kullanıcı PC'sini kullanırken masaüstü kontrolü
yapma; bu görevde açıkça başsız/ayrı profil testini istedi. Native dialog kendi
başına tüm Tab döngüsünü ve React unmount sonrası odak dönüşünü sağlamadı.
Modal Tab'ı ilk/son odakta döndürür; açılmadan önceki bağlı elemana kapanışta
açıkça odak verilir. React Router seçimi/tuşu sonrası anlık count/attribute
assert'i eski render'ı okuyabilir; sabit uyku yerine URL/aria-selected/gerçek
sonuç durumunu bekle. Kontrollü servis testi gerçek canlı indirme/mail değildir.

**Kutarya Video1.1 (10 Ekim):** gamesCatalog etiket sınırı6'dır;8 etiket
admin.game için genel invalid-argument verdi. Metadata hazırlığında sınırı
kontrol et. Katalogda sürüm/görsel sayısı aynı diye mevcut görseli seçme;
byte/SHA ile yeni sürüm ekranını doğrula. Kuyruktaki/eski her video kendi
downloadDir değerini taşımalıdır; seçili klasörü sonradan değiştirmek eski
dosyanın açılmasını veya devam eden çıktıyı başka yere yönlendirmemelidir.
Temizleme son duruma geçen fakat motor kapanışı süren işi silmemelidir.
İsim aramasının çalışması video indirme kabulü değildir: gerçek YouTube
indirmesi429/bot doğrulamasında engellendi; başarı olarak kaydetme.

**Kutarya Mobile Android (10 Ekim):** Elle açılan SDK37'de package.xml
olmadığında AGP ikinci platform kopyası oluşturur; SDK yöneticisi paketini
canonical android-37.0 konumunda tut. API37 Play AVD ilk boot'ta2048MB ile
LOW_MEMORY verdi; özel test AVD'si3072MB ile doğrulandı. Compose'un transitif
Espresso3.5 sürümü InputManager erişimini bozdu; androidTest'te3.7 açık seçilir,
gizli API politikası gevşetilmez. Opaque geo: URI'nin query'si Uri.encode ile
kurulur. D:/KutaryaMobile/docs/KABUL.md diğer ölçüm ve test tuzaklarını içerir.

**Kutarya Mobile 1.1 Compose testleri (10 Ekim):** Compose1.12/API37 ile v1
test kuralının Unconfined dispatcher'ında performMeasureAndLayout called
during measure layout hatası yaşandı. Test kuralı
androidx.compose.ui.test.junit4.v2.createAndroidComposeRule olarak güncellendi;
StandardTestDispatcher ile aynı 21 test uçak modunda geçti. Test silinmedi,
gizli Android API politikası değiştirilmedi. Ürün APK'sı bu test kuralını
içermez. Kanıt D:/KutaryaMobile/Kanitlar/v1.1-device-tests-v2-offline.log.

### 3.1 Türkçe + düzenli ifade

**`\b` (kelime sınırı) Türkçe harflerde ÇALIŞMAZ.** `ş ı ğ ç ö ü` ASCII kelime
karakteri sayılmaz. `\b(şiir)\b`, `\b(var mı)\b` gibi desenler **hiç eşleşmez**
ve sessizce başarısız olur — hata vermez, sadece çalışmaz.

Çözüm: kelime bazlı eleme yap (metni boşluktan böl, küme ile karşılaştır) ya da
`\b` kullanma. Örnek: `KutaryaChatUI/js/deneme.js` → `sorguCikar`, `ATILACAK`.

Ayrıca büyük/küçük harf için `toLocaleLowerCase('tr')` kullan — `I/ı` ve `İ/i`
Türkçede farklı davranır.

### 3.2 JS dosyasını Python ile düzenleme

Python'da `"\b"` **backspace karakteridir (0x08)**. Bir düzenli ifadeyi Python
heredoc'uyla JS dosyasına yazarsan `\b` görünmez bir kontrol karakterine döner;
dosya gözle doğru görünür ama desen asla eşleşmez.

**JS/JSX dosyalarını Python ile düzenleme.** `node -e` kullan ya da bloğu ayrı
bir dosyaya birebir yazıp yerine koy.

Aynı aile: `.join('\n')` yazarken kaçış bozulursa string içine gerçek satır
sonu girer ve sözdizimi hatası olur.

### 3.3 PowerShell 5.1 + UTF-8

Windows PowerShell 5.1, **BOM'suz UTF-8 `.ps1` dosyasını ANSI sanır.** Türkçe
karakterler bozulur, tırnak yapısı kırılır ve dosya
`"The string is missing the terminator"` ile parse edilemez — dosyanın baytları
tamamen doğru olsa bile.

**Tüm `.ps1` dosyalarına UTF-8 BOM ekle.** Doğrulama:
```powershell
[System.Management.Automation.Language.Parser]::ParseFile($yol, [ref]$null, [ref]$hata)
```

Ayrıca `Stop-Process` sürecin ölmesini **beklemez**; hemen ardından durum
sorarsan hâlâ "çalışıyor" görünür. `WaitForExit` + döngü ekle.

### 3.4 Tarayıcı `Origin` başlığı göndermez (aynı kaynakta)

Tarayıcılar **aynı kaynaktan yapılan GET isteklerine `Origin` başlığı
EKLEMEZ**. O başlık yalnız çapraz kaynak isteklerinde ve CORS'lu POST'ta gider.

"Origin zorunlu" kuralı yazarsan **kendi sayfanı engellersin** (canlıda 403
yedik). Doğru dayanak `Sec-Fetch-Site`: tarayıcı her istekte ekler, sayfa
JavaScript'i değiştiremez, curl hiç göndermez.

### 3.5 Firebase Hosting akışı (streaming) tamponlar

`kutarya.com/api/**` → Functions yolunda yanıt **sonuna kadar tamponlanır**.
Ölçüm:

| Yol | Sonuç |
|---|---|
| doğrudan model | 36 parça / 2.3 sn — akıyor |
| Cloudflare tüneli | 133 parça / 8.9 sn — akıyor |
| **kutarya.com/api** | 9 parça / **1 ms** — TAMPONLU |
| Cloud Run doğrudan | 35 parça / 2.3 sn — akıyor |

`X-Accel-Buffering: no` eklemek **yetmedi**. Canlı akış gereken uçlarda
Hosting'i atlayıp fonksiyonun kendi adresine git
(`https://api-faferhidua-uc.a.run.app`).

### 3.6 Küçük model (4B) prompt tuzağı

Sistem metnine yazılan **emir kipi ve tırnaklı yasak örnekler cevap olarak
papağanlanır.** Üç kez yaşandı:

- `"Kutarya olarak… YASAK"` → model *"Kutarya olarak selam"* dedi
- `"YAP: aracı çağır"` → ekrana *"Yap: SVG aracı çağır."* yazıldı
- `"Yapabilirsin deme"` → *"Kutarya, sana çizim yapar"*

**Kural: sistem metnine satır eklemeden önce A/B ölç.** Az ve net talimat, çok
ve ayrıntılı talimattan iyi çalışıyor. Şu an ~673 karakter (bir dönem 1889'du
ve model gözle görülür biçimde kötüleşmişti).

**Araç çağırmaya güvenme.** 4B model aracı çağırmayı atlar ve **uydurur**
(olmayan GitHub projeleri, sahte bağlantılar). Kritik veriyi modele sorma —
mesajdan belirle, veriyi kendin çek, bağlam olarak ver.
Bkz. `deneme.js` → "GEREKEN BAĞLAM ÖNCEDEN GETİRİLİR".

### 3.7 Derlenmiş Tailwind paketi

`KutaryaChatUI/css/bundle.css` llama.cpp WebUI'den alınmış **derlenmiş** bir
dosyadır: yalnız orijinal uygulamanın kullandığı sınıfları içerir.
`md:w-64`, `group-hover/item:opacity-100`, `pr-14` gibi sınıflar **yoktur** —
yazarsın, hiçbir şey olmaz. Gerekeni `css/app.css` içine gerçek CSS olarak yaz.

`app.css` bundle'dan **sonra** yüklendiği için oradaki `display` tanımları
Tailwind'in `.hidden` sınıfını ezer ve `classList.add('hidden')` işe yaramaz.
Bu yüzden `app.css` başında `.hidden { display: none !important; }` var.

### 3.7b Telefon düzeni — sabit composer içeriği örter

`.chat-screen` üzerindeki `pb-44` / `md:pb-4` sınıfları da derlenmiş
bundle.css'te YOK (yukarıdaki tuzağın aynısı). Sonuç: telefonda
padding-bottom = 0 ve SABİT konumlu composer son mesajın üstüne biniyordu —
konuşmanın sonu okunamıyordu.

Sabit bir sayı yazmak da yetmez: textarea yazdıkça composer büyüyor
(ölçüldü: 128px → 201px). Çözüm `deneme.js` içinde `ResizeObserver` ile
gerçek yüksekliği ölçüp `--kty-alt-yukseklik` değişkenine yazmak; CSS onu
kullanıyor.

Aynı ekranda çıkan öteki telefon hataları:
- Üst şeritteki bağlantı **ikonsuzdu**; dar ekranda `.kty-dugme-yazi`
  gizlenince BOŞ BİR DAİRE görünüyordu. Yazısı gizlenen her düğmeye ikon koy.
- Kota yazısı (180px) efor seçicinin yanına sığmıyordu. Önce `flex-wrap`
  denendi — bu sefer GÖNDER DÜĞMESİ alt satıra düştü. Doğru çözüm sarmak değil,
  dar ekranda metni kısaltmak (`kotaGuncelle`, innerWidth < 480).
- Metin dar ekranda değişiyorsa `resize` dinleyicisi ŞART; yoksa döndürünce
  eski biçim takılı kalıyor.

### 3.8 Yeni hata kodu uydurma

İstemcideki `PUBLIC_ERROR_MESSAGES` kataloğunda karşılığı olmayan bir hata kodu
sessizce `UNKNOWN_ERROR`'a düşer; kullanıcı gerçek sebebi göremez.
`publicErrorCoverage` testi bunu yakalar. Var olan kodu kullan
(`AUTH_REQUIRED` gibi).

### 3.9 React: boş bağımlılık dizisi "bir kez" demek değildir

`useEffect(..., [])` **mount başına bir kez** çalışır. Bileşen yeniden
kurulursa (sohbet değiştirme gibi) tekrar çalışır. Uygulama oturumunda gerçekten
bir kez olması gereken şeyler için `sessionStorage` kullan.

### 3.10 Masaüstü kurulumu yönetici istememeli

Varsayılan `npm run pack` **`perMachine=true`** üretir → UAC ister. Ama indirme
sayfası *"Yönetici izni istemez"* diye vaat ediyor. Doğru komut:

```
npx electron-builder --win -c.nsis.perMachine=false -c.nsis.oneClick=true \
  -c.nsis.allowToChangeInstallationDirectory=false \
  -c.nsis.artifactName='kutarya-setup-kullanici-${version}.${ext}'
```

Sürüm bilgisinin TEK KAYNAĞI `KutaryaAIWeb/src/config/studioSurum.js`.
Elle başka yere sürüm yazma.

### 3.11 Ölçüm tuzağı (tarayıcı otomasyonu)

Tarayıcı paneli gizliyken `innerText` **boş** döner ve CSS geçişleri ilerlemez;
`getComputedStyle` donmuş değer verir. Var olmayan hatalar kovalanır.
**Ekran görüntüsü boyamayı zorlar** — panel gizliyken layout ölçmek yerine
ekran görüntüsü al ya da `textContent` kullan.

### 3.12 `araclarGerekliMi` varsayılan-açık yanlış-pozitifi

Web arama/araç kapısı bir dönem **varsayılan olarak açıktı**: kısa geri
bildirim bile ("çalışmadı") aracı tetikliyordu, sonra `ilgiliMi` 5 harfli kök
eşleşmesiyle ("çalış" → "Çalışma ve Sosyal Güvenlik Bakanlığı") saçma kaynak
getiriyordu. Kullanıcı sorununu bildirdi diye model web'de bakanlık arıyordu.
**Kapı KAPALI başlamalı**; yalnız açık sinyal (URL, "github", "güncel",
gerçek soru kelimeleri) veya ≥7 kelime varsa açılmalı. "neden/niçin" gibi
tek başına belirsiz kelimeler kapıyı açmamalı. `deneme.js > araclarGerekliMi`.

### 3.13 Destructure ile kullanım aynı yerde eklenmeli

`streamChat`e `kullanici` alanı eklerken gövdeye yazan satır (`body.kullanici`)
eklendi ama **opts destructure'ına `kullanici` eklenmedi** → `kullanici is not
defined` → TÜM `/dene` sohbetleri "_Yanıt alınamadı._" verdi. Bir değişkeni
gövdeye koyarken **aynı fonksiyonun destructure listesine** de koy. `node -e`
ile tek satır yama yaparken bu kolayca kaçar; Edit ile bütün bloğu gör.

### 3.14 trycloudflare bedava tünel edge kararsızlığı

Bedava `*.trycloudflare.com` hızlı tünelleri düşer VE bazı yeni adresler
**Cloud Run bölgesinden ulaşılamaz** olabilir (yerelden `curl` 200 döner ama
vekil "Model yanıt vermedi" der — Google'ın ağından o tünel edge'ine yol
kötü). Belirti: model + tünel yerelde 200, ama `/props` ve chat vekilden
502/503. **Çözüm: tüneli kapat-aç, taze adres çek, `uc-guncelle` ile
Firestore'a bildir.** Genelde yeni adres Cloud Run'dan ulaşılır. cloudflared
süreçleri `Get-Process cloudflared` ile sayılır; sıfırsa tüneller düşmüştür.
Adres tazeleme: `~/.kutarya/kty-us-token` → `Authorization: Bearer` →
`POST /api/kutarya-us/uc-guncelle {model,arac}`; ~20 sn önbellek sonra etkili.

**2026-09-17 tekrarı:** BASLAT betiği canlı kontrolde 8/8 sonunda uyarı
verdi. İki `cloudflared` logunda da tüm ön kontroller PASS ve bağlantı
Registered idi; yerel model/araç ile iki doğrudan tünel ucu HTTP 200 döndü.
Cloud Run araç vekili yanıt verirken model `/props` vekili HTTP 503 verdi.
Bu kombinasyon model veya genel Cloudflare arızası değil, yalnız model için
alınan quick-tunnel edge'inin Cloud Run'dan erişilememesi demektir. 8 deneme
önbellek beklemesidir; sekizi de bittiyse uyarı gerçek canlı erişim arızasıdır.
Model tünelini taze adresle yeniden açıp `uc-guncelle` sonrası Cloud Run
`/props` 200 olana kadar doğrula; sağlıklı görünen log tek başına yeterli değil.

### 3.15 Paylaşılan ürün tanımlarının kaynak dosyası

Plan, model ve kredi tanımlarının asıl kaynağı `KutaryaAIWeb/shared/` klasörüdür.
`KutaryaAIWeb/server/shared/` ile `KutaryaDesktop/src/shared/` üretilmiş
kopyalardır; doğrudan düzenleme, sonraki eşitlemede sessizce kaybolur. Asıl
kaynağı değiştir ve ilgili eşitleme/test adımını çalıştır.

### 3.16 Tarihî belgeleri güncel gerçek sanma

`BUILD_REPORT.md`, `PROJECT_MEMORY_REPORT.md`, eski checkpoint/plan dosyaları ve
bazı README'ler zamanlarının kaydıdır; güncel koddan ayrışmış olabilir. Örnekler:
mobil backend CORS'u belgede izin listesi görünürken kodda `origin: '*'`;
masaüstü görsel/video belgesi uçları yapılmamış derken güncel backend uçları
mevcuttur; ChatUI README `/dene`yi yayınlanmamış gösterir. Karar verirken sıralama:
**çalışan kod + test → DEVIR.md → tarihî rapor**.

### 3.17 ModelLab'de çıplak `pytest` yanlış dosyayı topluyor

`pyproject.toml` test dizini olarak `tests` der ama bu klasör yok. Bu yüzden
çıplak `pytest`, operasyon betiği `KTY-1.0/scripts/test_kty_auto.py` dosyasını
test diye toplayıp modeli yükler; betikteki eski/sabit LoRA yolu da mevcut dosya
yerini göstermediğinden koleksiyon kırılır. Açık test hedefi kullan veya önce
test düzenini ve yolu düzelt; bu komutu güvenilir kalite kapısı sayma.

---

### 3.18 Firebase yayını: port, parola ve ham SDK hatası

7 Ekim KutaryaWeb yayını: Functions CLI discovery varsayılanı yerel HTTP portu
açar. FIREBASE_FUNCTIONS_DISCOVERY_OUTPUT_PATH=true SDK'yı manifest dosyasını
yazıp çıkma yoluna alır; scripts/no-listeners.cjs Node listen'i ayrıca engeller.
Mevcut CLI oturumu, --non-interactive ve kapalı stdin kullanılır. Parola isteyen
adımda iptal; login/secret:set veya kalıcı service account key üretilmez.
MOBILE_MAIL_PASS yalnız mevcut secret adıyla bağlandı, payload okunmadı.

Geçici custom token imzası için service account getIamPolicy REST **POST**;
IAM izni ilk denemelerde ~90 sn'de yayıldı. Token üretildikten sonra yalnız
eklenen TokenCreator üyeliği güncel etag ile kaldırıldı. Token bellekte/child
env'de kaldı; dosyaya yazılmadı. Admin SDK özel OAuth credential Auth'ta çalıştı,
Firestore ADC/cert istedi; katalog için OAuth ile Firestore REST kullanıldı.
Ham SDK hata nesnesi bir Authorization başlığını çıktılayabildi. Tekrarında
yalnız error.message + Bearer maskeleme kullan; request/config/credential basma.

### 3.19 Cloud Run revision sınırı servis sınırı demek değil

10 Ekim Block Arena dağıtımında gcloud `--max-instances=1` template/revision
alanını1 yaptı, fakat canlı V2 service scaling20 kaldı. Ayrı
`--max=1 --min=0` ile servis düzeyi de1/0 yapıldı. Tek instance belleğinde
oda tutan oyun için iki düzey de API'den denetlenir; betik deploy-arena.mjs
iki flag çiftini de yazar, audit-arena-service.mjs ikisini doğrular.
Uygulama oda/oyuncu sınırı yük testi veya garanti edilen kapasite değildir.

### 3.20 Oyunda gerçek klavye ve gecikme kabulü

11 Ekim Arena2.0 ad alanına giriş öncesi otomasyonla değer yazılması,
odaya katılınca disabled olmasını ortaya çıkarmamıştı. İsim/oda kodu gerçek
klavye olaylarıyla yazılır; her aktör için lobi ve maç içinde değişiklik,
Türkçe harf/çakışma, korumalı site iframe'i ayrı denetlenir.

Eski konuma her karede geri çekmek gerçek RTT dışında ek yavaşlık yaratır.
Ortak hareket adımı + işlenen girdi onayı + bekleyen girdi tekrarı2.1'de
canlı kontrollü gecikmeyle ölçüldü: RTT328 ms, hareket tepkisi13 ms, son fark0.
Bu13 ms ağ pingi değildir. Ping son gerçek RTT'yi gösterir; ortanca yüksek
son örneği gizlemek için kullanılmaz. FPS gerçek kare süresinden hesaplanır.
Paralel WebGL tarayıcı testleri FPS kıyasını bozar; tek tarayıcı ölçümü ayrıca
tutulur. Sabit yapılandırılmış Hz/oyuncu sınırı yük kapasitesi kanıtı değildir.

### 3.21 Korumalı oyun iframe'inde native form gönderimi

Son Tur eklemesinde iframe allow-forms içermediğinden submit olayı çalışmadan
native form gönderimi engellendi. Oda kur/kodla katıl düğmeleri type=button ve
açık click/Enter işleyicisi kullanır; sandbox gevşetilmez. Kabul yalnız ayrı
sekmede yapılmaz: gerçek /oyna iframe'inde Türkçe klavye, kod/davet, hazır,
hamle ve aynı sonuç sınanır. Hızlı masada kopan sahip start sırasında
çıkarılırsa host varlığı ayrıca korunur. Ayrıntı KutaryaWeb/docs/RUS-RULETI.md.

## 4. Gizli bilgiler

- `server/.env.kutarya-ai-3169` — mail parolası, tünel adresleri,
  `KTY_US_ADMIN_TOKEN`. **`.gitignore`da**, depoya girmez.
- `~/.kutarya/kty-us-token` — başlatma betiğinin kullandığı anahtarın kopyası.
- Web API tarafındaki Gmail parolası ortam değişkenine taşınmıştır. Fakat
  **2026-09-11 denetiminde ayrı mobil backend içinde hâlâ düz metin parola
  bulundu:** `KutaryaAIBackend/functions/src/services/email-service.js` ve
  kopyası `KutaryaAIBackend/functions/test-email.js`. Değer bu belgeye alınmadı.
  Sonraki `mobile-backend` yayınından önce parolayı döndür, Secret Manager/ortama
  taşı ve iki kaynak kopyasını kaldır. Bu, backend'in kendi gizli bilgi kuralıyla
  çelişen açık bir güvenlik borcudur.

---

## 5. Bilinen sınırlar (hata değil)

- Kutarya Block Arena2.1 online oda durumu ayrı Cloud Run instance belleğinde
  geçicidir; restartta kaybolur.30 saniye kopma payı,45 dakika oda sınırı
  vardır. Fiziksel telefon/farklı internet ağları/yoğun yük ölçülmedi.
  Aktif WebSocket ve derleme bulut maliyeti oluşturur. Ortak Firebase hesabı
  veya kalıcı online skor veritabanı kullanılmaz; diğer uygulamalar aynı.
  Yerel hareket tahmini yüksek RTT'de tepkiyi iyileştirir; internet yolu için
  düşük ping garantisi sağlamaz. Eski2.0 istemci de aynı servisle uyumludur.

- KutaryaWeb'de 9 Ekim yeni yönlendirmesiyle ziyaretçi hesabı/kayıt, kişisel
  kütüphane/favoriler ve otomatik kişisel geçmiş canlı arayüzden kaldırıldı.
  Yönetim `/admin/auth/login` ve sunucu gamesAdmin/e-posta/profil denetimleri
  korunur. Ortak Firebase kullanıcıları ve backend hesap uçları silinmedi.
  Eski reset mailinin `/auth/action` yolu oobCode sorgusuyla yeni yönetim
  işlem sayfasına aktarılır; bu köprü kaldırılırsa mevcut mail bağlantısı bozulur.

- Kutarya Us "Düşün" kipinde bir cevabı ~30-40 sn'de verir; belirsiz/kısa
  girdide (ör. tek kelime "çalışmadı") düşünme uzayıp **1-2 dakikayı** bulur,
  sonra cevap gelir. "Hızlı"da 3-4 sn. Model 12-13 token/s üretir. Donanım
  sınırı. Kullanıcı bu sürede "Düşünüyor…" akışını görür; UI kilitli değil.
  (Erken localStorage okuması "_Yanıt alınamadı._" sanılabilir — akış henüz
  bitmemiştir; gerçek hata için konsol/ağ'a bak, TUZAK 3.14.)
- Model **İngilizce düşünür**. Prompt'la güvenilir biçimde zorlanamadı.
- Genel web araması sınırlı: bedava ve anahtarsız arama motorlarının hepsi
  CAPTCHA çıkarıyor (DuckDuckGo, Mojeek, SearXNG ölçüldü; Bing RSS alakasız
  sonuç veriyor). Kaynaklar Vikipedi + Stack Overflow + npm/PyPI + GitHub.
  `BRAVE_API_KEY` verilirse gerçek arama açılır.
- PC kapalıyken `/dene` "çevrimdışı" gösterir — beklenen davranış.
- KutaryaModelLab'de `active/manifest.json` yoktur; SDK/CLI için etkin bir ince
  ayarlı model seçilmemiştir. `/dene`deki Kutarya Us, Qwen3-4B GGUF + sistem
  metnidir; mevcut LoRA çıktılarıyla aynı şey değildir.
- Şube 17'de mevcut oynanabilir sınır şudur: splash → ana menü → ad ve üç
  zorluk seçimi → animasyonlu geçiş → sokak. Sokakta para/saat, stres ve akıl
  sağlığı HUD'u; ayarlar/çıkış kontrolleri; ev, bar, kazino, eczane ve banka için
  hover etiketi ile kapı aralanma animasyonu vardır. Kapı kanatları ayrı renkli
  dikdörtgen değildir: `street-hub-v2.png` içindeki gerçek kapı pikselleri iki
  kanada örneklenir ve perspektifle açılır; bu iş için üçüncü taraf araç veya
  yeni varlık gerekmez. Bina tıklamaları bilinçli olarak hiçbir yere girmez;
  gerçek mekân ekranları henüz eklenmedi.
- Şube 17 varlık kaynakları `Sube17Pc/asset-provenance.json` içinde izlenir;
  bağımlılık ve varlık kapısı `npm run check:publishability` komutudur. Bu kapı
  hukuki garanti değildir; son dağıtım öncesi insan benzerlik/marka incelemesi
  ayrıca yapılır. Yeni görseller animasyon için ayrılabilir katmanlarla tasarlanır.
- Uzun sohbet kesintilerine karşı son çalışma noktası
  `Sube17Pc/work-state.json` dosyasındadır. Her Şube 17 işinin başında
  `in_progress`, doğrulama sonunda `completed` olarak güncellenir.

---

## 6. Yayınlanmamış / bekleyen işler

### 2026-10-14 — KutaryaWeb site yenileme; canlı yayın tamamlandı

- Kullanıcının genel görünüm/eksik geliştirme isteğiyle mevcut platformda ana
  sayfa vitrini, tarih sıralı güncellemeler, açıklamalı/sürümlü kartlar, mobil
  arama/Günlük, Türkçe çok kelimeli arama ve olanak filtreleri hazırlandı.
- Güncel paket detayı üstten indirilebilir; eski paketler ayrı açılır bölümde
  korunur. Dosyalar/sürüm notları URL sekmesi ve klavye gezinmesi eklendi.
  Önceden alınan katalog, arka plan API hatasında görünür kalır. Veri şeması,
  admin/Auth/kurallar, eski oyun/runtime ve yayımlanmış paketler değişmedi.
- `npm run check`: 64/64 ve TypeScript/Vite build geçti. Plan ve açık kabul
  `KutaryaWeb/docs/SITE-YENILEME-2026-10-14.md`. Kaynak başlangıç yedeği ve
  bağımsız önizleme `KutaryaWeb/artifacts/site-refresh/2026-10-14/`.
- `review-public-access.mjs --prepare-only` port açmadan yalnız önizleme üretir;
  katalog/görseller gerçek genel veriden, servisler kontrollü taklittir. Tarayıcı
  testi, gerçek indirme veya canlı yayın kanıtı sayılmaz.
- İlk yerel turdaki PC kontrolü Escape ile kesilmişti. Kullanıcı sonraki
  isteğinde geliştirme/yayın onayı verdi ve şimdilik PC'yi kontrol etmemeyi
  istedi. Devam işi yalnız başsız/ayrı profil testleriyle tamamlandı; Hosting
  `8856063159d3f95a` ve gerçek HTTPS kabulü §2'de kayıtlıdır. Galeri ve yönetici
  önizlemesi de eklendi. Functions/Storage/Auth/kurallar değişmedi.

### 2026-10-09 — KutaryaWeb ziyaretçi hesabı/kütüphane kaldırma; yayın tamamlandı

- Yeni kullanıcı talebi önceki zorunlu ziyaretçi login kapsamını değiştirir.
  Giriş/kayıt, hesap ve Kütüphanem menüsü, favoriler ve detail/player geçmiş
  yazımları kaldırıldı. Eski ziyaretçi adresleri kataloğa replace ile yönlenir;
  normal eski oturumlar yeni profil oluşturmaz. Admin girişi/doğrulama/reset ve
  katalog/indirme/oynama/destek/temalar korunur. Yetkisiz yönetim girişi kapatılır.
- Özel admin düzeninde sidebar gizli olduğundan çıkış düğmesi üst çubuğa alındı.
  Gerçek React/Provider ile kontrollü servis/runtime kabulü 1280/390 px, 26
  yol/görünüm ve 8 eylem grubu geçti; taşma ve renderer hatası yok. Gerçek
  Firebase girişi/mail/indirimi bu taklit servis kabulüyle test edilmiş sayılmaz.
- Son davranış değişikliğinden sonra 58/58 + TypeScript/Vite build; SEO
  hazırlığı 11 gerçek proje, 22 sitemap ve 23 HTML. Kanıt/yerel inceleme
  KutaryaWeb/artifacts/release-2026-10-09-public-access/; betik
  scripts/review-public-access.mjs. SITE-PLANI v4/yerel AGENTS ve belgeler güncel.
- "Canlıya yayımla" onayıyla yalnız kutarya-ai-3169 / kutarya.com Hosting
  `43f73b57e6eb7708` yayımlandı; önceki `de4a2f903b00e3ba` yedekli.
  Gerçek HTTPS/Edge: 23 HTML SHA'sı, 14 görünüm, altı eski yol, anonim admin
  401, misafir gerçek ZIP indirimi (3185 bayt/SHA aynı) ve Blackjack iframe
  açılışı geçti. Sekiz Functions/kurallar/Auth ayarları/admin claim'leri ve 11
  proje aynı; Storage ve diğer uygulamalar değişmedi. Kanıtlar aynı klasörde
  cloud-acceptance.json/live-acceptance.json/hosting-deploy.log.
- Açık kabul sınırı gerçek yönetici parola girişi ve mail teslimidir; yayın
  onayı veya Hosting işlemi beklemiyor. Port/parola/secret payload yok.
- Tam sayfa ekran görüntüsü lazy görsel yükleme/decode işlemini beklemez;
  kapakların eksik çizimi görmeden scroll/complete/naturalWidth/decode sonrası
  kabul yapılır. Bu görevde site değişikliği gerektirmeden görüntüler tamamlandı.

### 2026-09-17 — Merkezî yapılacaklar listesi
- Güncel ve önceliklendirilmiş iş kuyruğu `D:\Kutarya\YAPILACAKLAR.md`
  dosyasına alındı. Liste site, web API ve Kutarya PC Agent odaklıdır; PayTR
  kullanıcı hazırlığı tamamlanana kadar bilinçli biçimde bekler.
- Kök sorun: bekleyen işler `DEVIR.md`, eski geliştirme planları ve büyük ölçüde
  doğrulanmamış `DENETIM-EKSIKLER.md` arasında dağınıktı. Yeni listede yalnız
  güncel doğrulanmış açıklar ile ayrıca `[Benim önerim]` diye işaretlenen
  işletim/güvenlik önerileri bulunur.
- İlk sıra: mobil backend düz metin Gmail sırrını döndürme ve kaldırma, temiz
  Windows PC Agent kabul testi, kod imzalama ve geri alınabilir özel Git kaynak
  yönetimi. Tamamlanan her madde burada sonuç/kök neden/prosedürle kapatılmalı.

### 2026-09-17 — Web ve masaüstü ayarları incelemesi ve yerel düzeltmeler
- `KutaryaAIWeb` ve `KutaryaDesktop` ayar/yapılandırma akışları kaynak koddan
  incelendi. Web ayarları Firestore profilinde, masaüstü tema/aksan/hareket/
  izin/kapsam/kişiselleştirme ve çalışma klasörü tercihleri cihazdaki
  `localStorage` içinde tutuluyor; bunlar kendiliğinden birbiriyle eşitlenmiyor.
- Web ayar şemasındaki tüketilmeyen `modePickerStyle`, `showModeDescriptions`,
  `answerReadyNotifications` ve `productUpdates` alanları kaldırıldı. Arayüzdeki
  manuel mod adları temizlendi; Lite/Core/Prime ürün katmanları korunuyor,
  görev türü kullanıcıya mod seçtirilmeden içeride belirleniyor.
- Webdeki `Tam dosya içeriği iste` anahtarını etkisiz bırakan
  `codeFullFileContent || codeSingleFile` eşlemesi kaldırıldı; istek artık tek
  görünen ayarın değerini kullanıyor. Aynı yazma efekti ayarının iki kez
  gösterilmesi de giderildi.
- Masaüstündeki `uzaktanKontrol` tercihi artık Ayarlar'da görünür, varsayılanı
  kapalı ve açık durumunda net uyarı gösteriyor; eski etkin kayıt kullanıcıdan
  saklanmıyor.
- Masaüstünün etkin ana girişi `electron/main.cjs`; kökteki `main.cjs`
  daha eski ve farklı, paket tarafından kullanılmıyor. Gelecek değişiklikler
  yalnız etkin dosyada yapılmalı; kopya ayrıca temizlenmeli/değerlendirilmeli.
- `npm run pack` varsayılanı kullanıcı bazlı, tek tık ve UAC istemeyen NSIS
  kurulumuna alındı (`perMachine=false`, `oneClick=true`). Çıktı adı da
  `kutarya-setup-kullanici-*` olarak kaynağa sabitlendi.
- Web Hakkında ekranı sürümü doğrudan web `package.json` dosyasından okuyor.
  Güvenlik metni, Studio bağlantı anahtarının hesap ayarlarının parçası olduğunu
  doğru biçimde belirtiyor. Web veri dışa aktarma ve 2FA alanları hâlâ açıkça
  bilgi amaçlıdır; bu görevde yeni ürün işlevi eklenmedi.
- Electron renderer `sandbox=true` ile açılıyor. Ayrı geçici kullanıcı profili
  ve yerel Vite sunucusuyla gerçek `Kutarya Studio` penceresinin oluştuğu
  doğrulandı; test sonunda süreçler kapatıldı.
- Regresyon testleri eklendi. Son doğrulama: web backend `393/393`, masaüstü
  `218/218`; iki Vite üretim derlemesi geçti. Firebase/React/JSZip/Marked
  parçaları ayrıldı ve önceki 500 kB üstü parça uyarıları kalktı.
- PayTR/ödeme akışına dokunulmadı. Deploy, installer paketi veya canlı yayın
  ilk yerel incelemede yapılmadı; aşağıdaki canlı yayın kaydı bu beklemeyi
  kullanıcının açık yayın talebiyle tamamladı.

### 2026-09-17 — Web 1.0.6 / Kutarya PC Agent 1.6.8 canlı yayını
- Kök nedenler: web istemcisinde sunucudan kaldırılmış `/api/video/dry-run`,
  `/api/video/cancel` ve `/api/video/generate` çağrıları kalmıştı; görünmeyen
  `defaultMode`, `rememberLastMode`, `preferredVideoModel` ayarları profil
  sözleşmesinde taşınıyordu; karşılama metni hâlâ kullanıcıdan mod seçmesini
  istiyordu. Yönetici ayarının `PUT` isteği de CORS yöntem listesinde olmadığı
  için yerel Vite kökeninden ön kontrolde engellenebiliyordu. Bunlar temizlendi;
  eski `video_generation` değeri istemci ve sunucuda güvenle sohbete düşüyor.
- Masaüstü preload `invoke` kanallarının tamamının ana süreçte karşılığı olduğu
  (67/67), masaüstünün kullandığı kritik API yollarının web sunucusunda bulunduğu
  ve iki yüzeyin ortak Firebase yapılandırmasının eşleştiği regresyon testleriyle
  doğrulandı. Paket kilidindeki eski masaüstü sürümü de 1.6.8 ile eşitlendi.
- Kalite kapıları: web backend **397/397**, masaüstü **220/220**, Firestore
  emulator kuralları **30/30**; iki üretim derlemesi ve masaüstü `npm run pack`
  başarılı. Web büyük parça uyarısı vermedi.
- Kullanıcı bazlı kurulum paketi:
  `KutaryaDesktop/release/kutarya-setup-kullanici-1.6.8.exe`;
  80.326.801 bayt; SHA-256
  `00AF3E40CD787CD64AD7100640A3716800B025A4CA2114B7E452D25298FC48EA`.
  Canlıdan tekrar indirilip boyut, hash ve `MZ` imzası birebir doğrulandı.
  Paket kod imza sertifikası olmadığı için Authenticode `NotSigned`; site bu
  uyarıyı zaten açıklar. Gerçek dağıtım güven uyarısını kaldırmak için ayrıca
  kod imzalama sertifikası gerekir.
- `kutarya-ai-3169` projesine yalnız Hosting ve `functions:api` yayınlandı;
  mobil backend ile zamanlanmış fonksiyonlara dokunulmadı. Canlı kontroller:
  ana sayfa 200, iki API sağlık yolu 200, agent ve sohbet korumalı uçları
  anahtarsız istekte 401, yönetici `PUT` CORS ön kontrolü 204 ve izinli.
  `studio-surum.json` 1.6.8 ile doğru boyut/adresi döndürüyor. Eski 1.6.7
  indirme adresi iki Hosting alanında da 302 ile 1.6.8'e yönlendiriliyor.
- Yayın sırasında Firebase CLI, `server/package.json` içindeki
  `firebase-functions` bağımlılığının eski olduğunu bildirdi. Yayını engellemedi;
  bağımlılık yükseltmesi davranış değişikliği riski nedeniyle ayrı bir görevde
  testlerle yapılmalı. PayTR/ödeme kodu bu çalışmada değiştirilmedi.

- Yeni oyun projesinin konuşmada kesinleşen ana kaynağı
  `Kutarya-Studio/plan.md` dosyasıdır. `Sube17Pc` içinde Electron+React prototipi,
  splash, ana menü, ses ayarları, yeni oyun kurulumu ve etkileşim önizlemeli
  sokak/HUD ekranı vardır. `street-hub-v2.png` güncel sokak tabanıdır; giriş
  etiketleri kod katmanıdır, kapı kanatlarıysa aynı taban görselden koordinatla
  alınan gerçek kapı dokusudur. Gerçek bina girişleri ile ana banka/aile
  oynanışı henüz yapılmadı.
  `kutarya.com` sitesinin Kutarya AI'dan Kutarya Studio'ya dönüştürülmesi ise
  yalnız ürün kararıdır; henüz uygulanmadı veya yayınlanmadı.
- `DENETIM-EKSIKLER.md` — orta/düşük önemli, doğrulanmamış bulgular.
- Toplu duyuru e-postası hazır ama **gönderilmedi**
  (Admin > Araçlar > Toplu E-posta, "Kutarya Us tanıtımı" şablonu).
  Betik: `server/scripts/ktyUsDuyuru.mjs` (varsayılan kuru çalıştırma).
- Kalıcı tünel adresi için DNS'in Cloudflare'e taşınması gerekir
  (şu an GoDaddy). Bilinçli olarak yapılmadı — kazanç ~14 saniye, risk yüksek.
- Mobil backend lint hatası (`agent-api-routes.js` kullanılmayan `reqId`) kalite
  kapısını kırıyor; düzeltilmeden yayınlama.
- Mobil backend Gmail parolasını döndürme ve kaynak koddan kaldırma işi bekliyor
  (ayrıntı §4).
- ModelLab test keşfi/sabit LoRA yolu düzeltilmeli; ayrıca işlenmiş eski veri
  kümesinde çok sayıda düşük kaliteli/makine çevirisi örneği var. Güncel persona
  eğitiminin ayrı `kty-1.0-egitim.jsonl` hattını kullandığını karıştırma.

### 2026-09-13 — Kutarya Us model konumu doğrulandı
- Model dosyası mevcut: `D:\Kutarya\KutaryaModelLab\models\Qwen3-4B-Q6_K.gguf` (3.306.260.704 bayt).
- Kişilik kaynağı: `KutaryaChatUI/js/persona.js`; `deneme.js` bu sistem promptunu kullanıyor. Kutarya Us kimliği taban Qwen3'e promptla veriliyor; ayrı fine-tune hattıyla karıştırılmamalı.
- Backend vekili: `KutaryaAIWeb/server/routes/kutaryaUs.js`. Bu görevde model başlatılmadı veya test edilmedi.


- Masaüstü kısayolları doğrulandı: `C:\Users\yunus\OneDrive\Desktop\KUTARYA US - BASLAT.lnk` ve `KUTARYA US - DURDUR.lnk`. PowerShell üzerinden sırasıyla `KutaryaChatUI\KUTARYA-US-BASLAT.ps1` ve `KUTARYA-US-DURDUR.ps1` çalıştırıyor; iki betik de mevcut. Kısayollar bu kontrolde çalıştırılmadı.

### 2026-09-13 — Kutarya Us baslat/durdur onarimi
- Kok neden: baslatma betiginin sabit motor yolu altindaki b10549 klasoru ve llama-server.exe eksikti. Resmi ggml-org/llama.cpp b10549 Windows Vulkan x64 paketi APPDATA\kutarya-studio\yerel\motor\b10549 altina yeniden kuruldu; --version build 10549 dogrulandi.
- KUTARYA-US-BASLAT.ps1 sabit 10 saniye yerine /health hazirligini bekliyor; bu acilista model yaklasik 12 saniyede yuklendi. -DeploySiz artik gercekten yalniz yerel sunuculari aciyor. Eski deploy yorumlari duzeltildi; UTF-8 BOM ve PowerShell parser kontrolu korundu.
- Canli Cloud Run sohbet API testi: model 'Merhaba, adım Kutarya.' cevabini verdi. DURDUR -Sessiz testi model/arac/tunelleri kapatti; canli /props HTTP 503 verdi. BASLAT -Sessiz ile tekrar aciliyor; adres bildirimi deploy gerektirmiyor.
- Kullanim: masaustundeki BASLAT siteyi cevrimici yapar; DURDUR cevrimdisi yapar. Bilgisayar kapatildiginda BASLAT yeniden calistirilir.


- Son yeniden acilis dogrulandi: Cloudflare QUIC tunelinde yerel HTTP 200 olmasina ragmen Cloud Run 503 verdi. Tuneller --protocol http2 ile yeniden acildi; canli /props dogrulamasi gecti. Son durumda model, arac sunucusu ve iki HTTP/2 tuneli acik birakildi. Canli sohbet tekrar test edildi.


### 2026-09-13 — TXT/kod inceleme ve baglam tasarimi (uygulanmadi)
- Kullanici kapsam tercihi: dosya inceleme yalniz TXT ve metin tabanli kod dosyalari; her tur ilgili baglam yeniden kurulacak. Bu turda kod degistirilmedi.
- Kaynak incelemesi: deneme.js mevcut mesaj gecmisini istege ekliyor; hata durumunda kimlik + son soruya dusen yeniden deneme kaynak baglamini siliyor. Dosya/kaynak sorularinda bu geri donus uydurma riskini artirir; gerekli kaynak korunmali, sigmiyorsa acik hata verilmeli.
- Onerilen tasarim: metin icerigi dogrulama, token butcesi, ilgili dosya bolumleri ve satir numaralari, son konusmalar ile kullanicinin dogrulanmis kararlarini koruma, arama basarisizligini acik gosterme. Modelin onceki iddialari dogrulanmis kanit sayilmamali. Halusinasyonun sifirlanacagi vaat edilmemeli.


### 2026-09-13 — Dene arac menusu, kaynak baglami ve misafir kotasi (yerel)
- Kapsam: yalniz Web/GitHub arac secimi, kaynak ilgisi, sohbet baglaminin korunmasi ve girissiz ziyaretcinin gunluk mesaj kotasinin kaldirilmasi. Dosya ekleme uygulanmadi; deploy alinmadi.
- Kaynak dosyalar: KutaryaChatUI/deneme.html, js/deneme.js, js/research.js, js/api.js, css/app.css ve arac-sunucu.mjs. Web/scripts/dene-sayfasi-kopyala.mjs research.js dosyasini da uretilen public/dene ve dist/dene ciktilarina tasiyor.
- Arac secimi tek tur icin zorunludur; secim yokken otomatik kapi korunur. GitHub'da arama sonucu ustverisi ve ilk README okunur; Web'de ilgili sonuclarin ilk iki sayfasindan konuyla ilgili bolumler alinir. Gercek kaynak baglantilari gosterilir. Hata ve sinirli arama kapsami acikca belirtilir. BRAVE_API_KEY olmadan genel web aramasi vaadi verilmez; mevcut kaynaklar Vikipedi/Stack Overflow'dur.
- Onceki 5 mesajlik misafir kotasi, kota etiketi ve giris duvari kaldirildi. Eski localStorage sayaci artik kullanilmiyor. Sohbet/durum/arac icin kisa sureli sunucu yuk sinirlari ayrildi; durum yoklamasi ve arac cagrilari sohbet limitini tuketmiyor.
- Baglam: gecmis mesajlar saklanir; kayit artik son 60 mesaja kirpilmaz. Okunan kaynaklar her istekte son kullanici sorusunun yaninda yeniden birlestirilir; eski model cevabi yerine asil kaynagin gorunurlugu korunur. Kaynaklara yonelik takip sorusu gereksiz yeni arama acmaz. Gecici akis hatasi ayni mesaj/kaynak dizisiyle yeniden denenir; kimlik + son soru geri donusu kaldirildi.
- Kapasite: Web/server/services/kutaryaUsContext.js sohbet sablonunu /apply-template ile hazirlar ve /tokenize ile gercek token sayisini olcer. Cevap payi + 256 token ayrilir; sigmayan sohbet HTTP 413 ile acikca reddedilir, gecmis sessizce silinmez. Yerel dogrudan model onizlemesi api.js icinde ayni kontrolu yapar. Sinirsiz gunluk mesaj hakki, sinirsiz model baglami demek degildir.
- Kaynak okuma: article/main oncelikli metin, menulerin ayiklanmasi, yonlendirmelerin adres guvenligi kontrolu, ham yanit boyut/sure siniri ve dogrulama sayfasi tespiti eklendi. Arama ilgisi artik tek 5 harflik kok eslesmesine dayanmiyor; GitHub sorgusu tek genel kelimeye dusurulmuyor.
- Dogrulama: backend 389/389; ChatUI 11/11 odakli test (toplam backend context 4 ile 15/15); son npm run build gecti. Gercek modelde buyuk baglam 413 ile engellendi. SOURCE_RULE icin 3 soruluk A/B yapildi; verilen surum dogru, okunamayan fiyatta ve olmayan kurulum komutunda bilgi uydurulmadi. Yenilenen kaynak baglamiyla takip testinde react-hook-form, zustand ve jotai tekrar listelendi. Bunlar halusinasyonun sifir oldugu garantisi degildir.
- UI: gercek GitHub sohbeti, kaynaklarin sayfa yenilemesinden sonra kalmasi, girissiz 6 mesajin tamamlanmasi ve 375px telefon menusu dogrulandi. Yerel onizleme http://127.0.0.1:8931/deneme.html; onizleme arac sunucusu 18913, model 8912. Canli arac sureci 8913 bu gorevde yeniden baslatilmadi. Kullanici yerelde denedikten ve yayin izni verdikten sonra hosting + ilgili web Functions yayinlanmali, yeni arac kodu icin BASLAT/DURDUR akisiyle yerel arac sureci yeniden acilmali.

- Son kaynak secimi duzeltmesi: tanim sorularinda (ornegin React nedir) Stack Overflow hata/sorun sonuclari alinmaz; ansiklopedi tanimi kullanilir. React tanim aramasinda gereksiz bir CSS kaydirma sorusu gorulunce bu ayrim yapildi.
- Son React nedir kontrolu: yalniz Vikipedi tanim sonucu dondu; Stack Overflow sorun sonucu karismadi. Yerel onizleme son arac koduyla 18913 portunda acik birakildi.

### 2026-09-13 — Kutarya Us yayını tamamlandı
- Kullanıcının "deploy et" talebiyle KutaryaAIWeb hosting ve yalnız functions:api, kutarya-ai-3169 projesine başarıyla yayınlandı. Mobil backend ve diğer Functions yayınlanmadı. Önceki yerel bölümdeki yayın bekleme durumu bu kayıtla tamamlandı.
- Yayın öncesi backend 389/389 testi, masaüstü test zincirinin tamamı ve web build geçti. Firebase deploy çıkış kodu 0; hosting sürümü ve Node 22 api güncellemesi başarılı.
- Canlı https://kutarya.com/dene/ üzerinde araç menüsü ve misafir günlük kotasının kaldırılması doğrulandı. Web araması React tanımını, GitHub araması ilgili react-hook-form ve zustand depolarını döndürdü. Gerçek canlı sohbet "Merhaba, adım Kutarya." yanıtını verdi.
- Canlı büyük bağlam isteği HTTP 413 ile açıkça engellendi; geçmiş sessizce kırpılmadı. Tarayıcıda model Çevrimiçi, mesaj alanı açık ve Web/GitHub menüsü görünür; sayfa kullanıcı denemesi için açık bırakıldı.
- Araç süreci yeniden başlatılırken model-ac-kapat.ps1 içindeki AracSureci kontrolünün 18913 önizleme sürecini de canlı süreç sanması bulundu. Eşleşme yalnız varsayılan/8913 arac-sunucu.mjs komutuna daraltıldı; 18913 artık bu kontrole karışmıyor. UTF-8 BOM ve PowerShell parser kontrolü geçti.
- model-ac-kapat.ps1 ac ile güncel canlı araç sunucusu açıldı; /saglik başarılı. Son durumda model 8912 ve araç sunucusu 8913 çalışıyor, mevcut tüneller korunuyor. Normal kullanım masaüstündeki BASLAT/DURDUR kısayollarıyla sürer.

### 2026-09-18 — Site, PC Agent ve mobile-backend tamamlama/yayın turu

- Sonuç: Kutarya Studio 1.6.9 üretildi ve yayınlandı. Canlı manifest
  `80327194` baytlık installer'ı gösteriyor; SHA-256
  `CF6570E0EEA53A9D58156D8A8EB6766587D1EF02FF05DAC23E5498DF1FDE138B`.
  Web Hosting, `functions:api` ve yalnız `functions:mobile-backend` başarıyla
  güncellendi. PayTR kodu/yayını değiştirilmedi.
- Canlı doğrulama: `node scripts/canli-smoke.mjs` 8/8 geçti (site, manifest,
  installer boyut/hash/MZ, iki API health, korumalı uçlarda 401, admin CORS ve
  1.6.8 → 1.6.9 yönlendirmesi). Altı saatte bir, başarıda sessiz çalışan
  `Kutarya canlı sağlık` heartbeat'i kuruldu. Geri dönüş adımları
  `YAYIN-GERI-DONUS.md` içindedir.
- Test kanıtı: web server 398/398; masaüstü 221/221 ve gerçek Electron açılış
  smoke; mobile-backend lint + 84/84 birim + gerçek Firestore emulator 2/2 ve
  health smoke; ModelLab 3/3; web ve masaüstü production build/pack geçti.
- Güvenlik kök nedeni: mobil Gmail uygulama parolası iki kaynak dosyasında düz
  metindi. `MOBILE_MAIL_PASS` Secret Manager'a taşındı ve mobile function bu
  secret'a bağlandı. Ayrıca sır taraması web altında kullanılmayan gerçek
  `server/secrets/firebase-admin.json` özel anahtarını buldu; uygulama zaten
  managed runtime ADC kullandığı için dosya kaldırıldı. `scripts/gizli-bilgi-tara.mjs`
  artık kaynak ağacında değerleri yazdırmadan path/kural/satır raporlar.
- Masaüstü kök neden/düzeltme: site URL'leri beş dosyaya dağılmıştı, BYOK başarı
  yolu ilk başlığı üretmiyordu, geçici uyarılar kapanmıyordu ve eski kök
  `main.cjs` gerçek Electron girişinden ayrışmıştı. URL'ler `src/siteConfig.js`
  altında toplandı; tüm başarı yolları ortak başlık yardımcısını kullanıyor;
  uyarılara temizleme/kapatma ve erişilebilir durum rolleri eklendi; eski giriş
  kaldırıldı. Web/PC Ayarlar sayfaları hesapla eşitlenen ve yalnız cihazda kalan
  alanları açıkça anlatıyor.
- Bağımlılıklar: web ve mobil Functions `firebase-functions@7.4.0`,
  `firebase-admin@14.4.0`, `nodemailer@10.0.10` ile test edilip yayınlandı.
  Üretim auditinde `@google-cloud/storage → gaxios@6.7.1 → uuid@9.0.1` zincirinde
  2 orta seviye upstream bulgu kalıyor; uyumsuz `--force` uygulanmadı.
- Kaynak yönetimi: kökte yerel Git başlatıldı; model, eğitim verisi, `.env`,
  secret, bağımlılık ve build/release çıktıları `.gitignore` ile dışlandı. Sır
  taraması PASS sonrası ilk geri dönüş noktası `29aa51c` commit'i oluşturuldu.
  Özel uzak depo/temiz klon provası sağlayıcı erişimi gelince yapılır; anahtar
  veya model dosyası commitlenmez.
- Dış erişim bekleyen gerçek kapılar: Gmail eski uygulama parolasının Google
  tarafında döndürülmesi ve gerçek alıcı testi; Windows kod imzalama sertifikası
  (`Get-AuthenticodeSignature` şu an `NotSigned`); temiz Windows VM kabul testi;
  kimlikli canlı E2E için ayrı hesap ID token'ı; Named Tunnel için Cloudflare
  hesap/DNS belirteci. Hazır prosedürler sırasıyla `YAPILACAKLAR.md`,
  `KOD-IMZALAMA.md`, `KABUL-TESTI-PC.md`, `scripts/canli-e2e.mjs` ve
  `TUNEL-KARARI.md` içindedir.

### 2026-09-19 — GitHub kaynak arsivi hazirligi (yukleme bekliyor)

- Hedef: AI urun ailesinin kaynak kodunu kisisel GitHub hesabinda private
  arsive almak; dogrulanmis yukleme sonrasinda yerel kopyalari kontrollu
  kaldirmak. Bu turda ozgun `D:\Kutarya` dosyalari silinmedi.
- Temiz anlik goruntu `work\kutarya-ai-archive` altinda 777 dosya ve yaklasik
  21 MB olarak olusturuldu. Web, ChatUI, Desktop, mobile-backend, Android ve
  ModelLab kaynaklari dahil; Kutarya-Studio, model agirliklari, egitim ham
  verileri, node_modules, build/release, Backups, Recovery ve gizli dosyalar
  haric. Mevcut Git gecmisi olasi eski sirlar nedeniyle tasinmadi.
- Sir taramasi kokteki `api-test.html` icinde gercek eski API anahtari buldu;
  dosya arsivden tamamen dislandi. Firebase istemci anahtarlari arsiv
  kopyasinda yer tutucuyla, agent API test belirteci sahte degerle degistirildi.
- Disk olcumu: KutaryaModelLab 21,88 GB, kok `.cache` 18,39 GB,
  KutaryaDesktop 1,41 GB, KutaryaAIWeb 0,49 GB, KutaryaAIMobile 0,42 GB.
  Kaynak arsivi bunlarin yalniz yeniden kurulabilir kod kismini korur; model ve
  egitim artefaktlarini silmek ayri ve geri donussuz bir karardir.
- GitHub baglantisi `KAJIROZ` kisisel hesabini dogruladi; tarayici ise yalniz
  `Kutarya` hesabinda acik. Yanlis hesapta repo acilmadi. `KAJIROZ` hesabinda
  bos private repo olusturulup/yetkilendirilince yukleme, uzak dosya/commit
  dogrulamasi ve ancak ardindan yerel silme tamamlanacak.
- Tamamlanma: private depo `https://github.com/Kutarya/kutarya-ai-archive`
  olusturuldu. Temiz klon provasi son commit `ee44122d09adb8322b642bfe3f94c53e3ec7044a`
  ve 810 dosya ile gecti. Kok betikler, kty-test referanslari ve ikon kaynaklari
  da ayri commitlerle eklendi.
- Yerel temizlik: AI uygulama klasorleri, ModelLab model/egitim artefaktlari,
  `.cache`, Backups, Builds, Recovery, kty-test, ikon kaynaklari, kok scripts
  ve sir iceren `api-test.html` silindi. Calisan llama-server, arac sunucusu ve
  iki Cloudflare tuneli once durduruldu. Tum silme hedeflerinin yoklugu
  dogrulandi; `D:\Kutarya\Kutarya-Studio`, kok Git ve ortak belgeler korundu.
  D surucusunde islem sonu 91,12 GB bos alan olculdu.

### 2026-09-19 — Kutarya School yerel kaynak sitesi

- `D:\Kutarya\Kutarya-School` altında React + Vite tabanlı, açık tema
  varsayılanlı yazılım başvuru sitesi oluşturuldu. Bu ürün doğrusal bir kurs
  veya üyelik sistemi değil; bilgi metni, kod örneği, olası hata, teşhis ve
  kontrol listesi odaklı bir kaynak kataloğudur. Yayın/deploy yapılmadı.
- Katalog 41 dil/teknoloji, 16 kullanım alanı ve 826 adreslenebilir konu yolu
  içeriyor. Her konu yolu ortak başvuru şablonuyla açılıyor; özgün ve derin
  içerik şu anda en güçlü biçimde C# OOP dizininde bulunuyor. OOP ana sayfası
  sınıf/nesne, kapsülleme, kalıtım, polimorfizm, interface, abstract sınıf,
  bileşim, SOLID, record/value object ve generic türler için 10 ayrı ayrıntılı
  sayfaya bağlanıyor.
- Ayrı örnek kütüphanesinde 24 filtrelenebilir kod parçası; hata
  ansiklopedisinde 28 rehber; proje tariflerinde 18 kayıt var. HTML/CSS/JS
  deneme alanı Monaco editörü, iframe önizlemesi ve konsol çıktısıyla canlı
  çalışıyor. Diğer diller için düzenleme/kopyalama yüzeyi var; tarayıcı içi
  çalışma motoru olduğu iddia edilmiyor.
- İçerik doğrulayıcı her dil/alan ilişkisini, 826 konu yolunun açılmasını,
  örneklerin kod/not/etiket alanlarını ve hata/proje veri bütünlüğünü kontrol
  ediyor. `npm run build` geçti: 1925 modül, CSS 59.54 kB, JS 491.77 kB.
- Tarayıcı doğrulaması: ana sayfa, C# OOP dizini, kapsülleme özel sayfası,
  URL ile filtrelenen örnek kütüphanesi, genel arama ve deneme alanı çalıştı.
  Monaco yüklendi, Çalıştır sonrası iframe başlığı doğrulandı. 390x844 mobil
  görünümde yatay sayfa taşması yok; mobil mega menü açılıyor. React key
  uyarısına neden olan `group.name` kullanımı `group.id/group.title` ile
  düzeltildi ve temiz sekmede konsol hatası kalmadı.
- Yerel geliştirme adresi `http://localhost:5173/`; görev sonunda Vite süreci
  kullanıcı denemesi için açık bırakıldı.

### 2026-09-19 — Kutarya School editoryal kaynak yönü

- Kök sorun: İlk ana sayfa katalog, alan, konu, örnek, hata, proje ve deneme
  ürünlerini aynı ağırlıkta gösterdiği için içerik okumadan önce fazla karar
  istiyordu. Ürün yönü artık Medium benzeri okunabilirlik taşıyan fakat kod,
  hata ve proje bağlamını aynı makalede birleştiren **dil merkezli kaynak**tır.
- Ana sayfa sadeleştirildi: kısa ürün açıklaması, arama, 12 temel dil, öne
  çıkan C++ rehberi, seçili okumalar, kullanım alanları, Kutarya Us hata
  desteği açıklaması ve bütün 41 dilin düz dizini bulunur. Eski katalog/hata/
  proje/deneme rotaları korunur ancak ilk deneyimi yönetmez.
- Dil sayfası uzun makale düzenine geçirildi: tarihçe ve çalışma modeli,
  kullanım alanları, açıklamalı kod blokları, beklenen sonuç, hata ihtimali,
  daha fazla örnek bağlantısı, hata teşhis tablosu, projeler ve konu dizini aynı
  okuma akışındadır. C, C++, HTML, CSS, JavaScript, C# ve Python için özgün
  derin içerik; kalan diller için aynı yapıyı koruyan veri tabanlı şablon var.
- Python rehberinde eğitim yapmadan hazır Transformers modeliyle tahmin örneği
  ve eksik `transformers/torch` bağımlılığı teşhisi bulunur. Kutarya Us bu
  turda yeni bir API ile bağlanmadı; arayüz yalnız planlanan bağlamlı hata
  desteğini dürüstçe anlatır, çalışmayan bir sohbet düğmesi göstermez.
- `PlaygroundPage` lazy-load edildi. Son `npm run build` geçti: içerik
  doğrulayıcı 41 dil, 16 alan ve 826 konu yolunu doğruladı; ana JS 499.52 kB,
  deneme alanı ayrı 24.19 kB parça oldu. 1440px masaüstü ve 390x844 telefon
  görünümü kontrol edildi; sayfa yatay taşmıyor, kod blokları kendi içinde
  kayıyor ve tarayıcı konsolunda uyarı/hata yok.
- Yayın yapılmadı. Bu turdaki geliştirme sunucusu, 5173 dolu olduğu için
  kullanıcı denemesi amacıyla `http://127.0.0.1:5174/` adresinde açık bırakıldı.

### 2026-09-19 — KTY Türkçe programlama dili Lexer v0.1

- `D:\Kutarya\Kutarya-KTY` altında KTY programlama dili çekirdeğine Lexer v0.1 eklendi.
- `motor/src/lexer.rs` oluşturuldu. `Token` enum (`Yaz`, `SolParantez`, `Metin(String)`, `SagParantez`) ve `Display`/`Debug` formatı eklendi.
- `yaz` anahtar kelimesi, `(` ve `)` simgeleri ile çift tırnak içindeki metinler tanındı; tırnak kapatılmadığında Türkçe hata mesajı üretildi.
- `motor/src/lib.rs` içine `pub mod lexer;` ve `pub use lexer::{ayristir, tara, Token};` bağlandı.
- `cli/src/main.rs` kaynak kodu `kaynak_oku` ile alıp `tara` fonksiyonuna verecek ve her token'ı ekrana yazdıracak şekilde güncellendi.
- `cargo test --all` ile tüm testler (3/3) başarıyla geçti.
- `cargo run -p kty_cli -- örnekler\merhaba.kty` çalıştırılarak `yaz("Merhaba Dünya!")` kodunun beklenen token çıktısını verdiği doğrulandı:
  ```
  Yaz
  SolParantez
  Metin("Merhaba Dünya!")
  SagParantez
  ```

### 2026-09-19 — KTY Türkçe programlama dili Lexer v0.2

- `motor/src/lexer.rs` içine değişkenler, veri türleri ve sayılar için token ve tarama desteği eklendi.
- Yeni token'lar eklendi:
  - `SayiTuru` (`sayı` anahtar kelimesi)
  - `Tanimlayici(String)` (Türkçe karakter destekli değişken adları)
  - `Esittir` (`=`)
  - `Sayi(f64)` (tam sayılar ve ondalıklı sayılar, tam sayılar için `Sayi(15)`, ondalıklı için `Sayi(3.14)` biçiminde)
- `Metin` ve `Yaz` desteği geriye uyumlu biçimde korundu.
- `örnekler/degiskenler.kty` oluşturuldu.
- `cargo test --all` ile tüm testler (4/4) geçti.
- `cargo run -p kty_cli -- örnekler\degiskenler.kty` çalıştırılarak çıktı doğrulandı.

### 2026-09-20 — KTY Türkçe programlama dili Lexer v0.3

- `motor/src/lexer.rs` içine tür ve mantıksal değer token'ları eklendi.
- Yeni token'lar:
  - `MetinTuru` (`metin` anahtar kelimesi; isteğe bağlı kullanım)
  - `MantikTuru` (`mantık` anahtar kelimesi)
  - `Dogru` (`doğru` değişmez değeri)
  - `Yanlis` (`yanlış` değişmez değeri)
- Önceki tüm token'lar (`Yaz`, `SayiTuru`, `Tanimlayici`, `Esittir`, `Sayi`, `Metin`, parantezler) geriye uyumlu korundu.
- `örnekler/turler.kty` oluşturuldu.
- `cargo test --all` ile tüm testler (5/5) geçti.
- `cargo run -p kty_cli -- örnekler\turler.kty` ve eski örnekler çalıştırılarak doğrulandı.

### 2026-09-20 — Kutarya Cascade v0.1 çekirdeği; gerçek Qwen benchmarkı bloklu

- `D:\Kutarya\Kutarya-Cascade` altında Python 3.10+ modüler proje oluşturuldu.
  Prompt Inspector, Integrity Guard, exact-restorable Lossless Compressor,
  risk kapılı Safe Compressor, fail-closed orijinal prompt fallback, llama.cpp
  streaming runtime, RAM/VRAM örnekleyici, kalite sinyalleri ve üç yollu
  benchmark/JSON/CSV raporlama hattı eklendi.
- Korunan alanlar: Türkçe/İngilizce olumsuzluk, sayı, tarih, para, birim,
  entity, quote, fenced/inline kod, parse edilmiş JSON, operatör ve önemli
  talimat. Safe v0.1 bilerek muhafazakârdır; yüksek/kritik riskte sıkıştırmaz.
- Veri seti 30 vaka (15 TR + 15 EN): negation, sayı/birim, tarih/para, kod,
  JSON, matematik, instruction following, kısa/uzun, adversarial, quote,
  entity, operatör, tekrar ve karma kritik örnekler.
- Son doğrulama: `python -m unittest discover -s tests -v` ile 40/40 geçti.
  Yerel sahte llama.cpp HTTP/SSE sunuculu entegrasyon ve 250 rastgele
  whitespace exact round-trip vakası dahildir. Veri setindeki 60 statik
  lossless/safe yolun 60/60'ı Integrity Guard'ı geçti; safe 25/30 vakada
  güvenlik/fayda kapısı nedeniyle orijinale döndü. Bunlar inference performans
  sonucu değildir.
- Kök neden/blok: 13 Eylül'de doğrulanan
  `D:\Kutarya\KutaryaModelLab\models\Qwen3-4B-Q6_K.gguf` artık yoktur. 19 Eylül
  temizlik kaydı ModelLab model/eğitim artefaktlarının silindiğini ve kaynak
  arşivine alınmadığını zaten belirtir. C:/D:, kullanıcı profili ve Geri Dönüşüm
  Kutusu taramasında başka Qwen/GGUF kopyası bulunmadı. Kullanıcının yeniden
  indirmeme/taşımama/değiştirmeme talimatına uyuldu; gerçek model çağrısı ve
  warm-up yapılmadı, tüm inference metrikleri `ölçülemedi` bırakıldı.
- Mevcut runtime doğrulandı:
  `C:\Users\yunus\AppData\Roaming\kutarya-studio\yerel\motor\b10549\llama-server.exe`,
  build 10549 / commit `b2e5e9b28`. Model aynı eski yola kullanıcı tarafından
  geri getirildiğinde prosedür: `cd D:\Kutarya\Kutarya-Cascade`,
  `python -m kutarya_cascade doctor`, ardından
  `python -m kutarya_cascade benchmark --warmups 2 --repeats 3`. Beklenen ham
  kayıt 30 vaka x 3 yol x 3 tekrar = 270;
  eksik metrik tahmin edilmez, kalite regresyonu Cascade başarısızlığı sayılır.
- Kanıt ve sınırlar `README.md`, `CASCADE_SPEC.md`, `TEST_REPORT.md` ve
  `results/benchmark_status.{json,csv}` içindedir. Gerçek Qwen benchmarkı model
  dosyası geri gelmeden tamamlanmış sayılmamalıdır.

### 2026-09-20 — Kutarya Cascade v0.1 public GitHub yayını

- `D:\Kutarya\Kutarya-Cascade` bağımsız Git deposu olarak hazırlandı ve
  `https://github.com/Kutarya/Kutarya-Cascade` adresinde public yayımlandı.
  `main` dalındaki ilk yayın commit'i:
  `1067d7dfe54a0d68306cfdee09ecc782fce77578`.
- Public paket; Türkçe/İngilizce README, katkı ve güvenlik rehberleri,
  changelog, citation bilgisi, issue/PR şablonları ve Windows/Linux üzerinde
  Python 3.10/3.12/3.14 matrisi çalıştıran GitHub Actions CI içerir.
- Lisans olarak BSD 4-Clause kullanıldı. `LICENSE` ve `NOTICE`, kullanım veya
  özelliklerden söz eden tanıtım materyallerinde şu zorunlu atfı ister:
  `This product includes software developed by Kutarya.` Bu seçim Kutarya
  adını şart koşar; eski advertising clause nedeniyle GPL uyumluluğunu ve bazı
  ekosistemlerde benimsenmeyi sınırlayabileceği README'de açıkça yazıldı.
- Yayın öncesi staged secret taraması geçti; public dosyalardaki yerel kullanıcı
  profili yolları temizlendi. Paket veri seti wheel içine dahil edildi ve
  `LICENSE` paket metadata'sına bağlandı.
- Son yerel doğrulama standart kütüphane test koşusuyla 44/44 geçti. GitHub
  Actions CI #1 de 6/6 matris işiyle 31 saniyede başarıyla tamamlandı.
- Gerçek Kutarya Us Qwen benchmark durumu değişmedi: model dosyası diskte
  bulunmadığı ve yeniden indirme açıkça yasaklandığı için inference metrikleri
  hâlâ `ölçülemedi`; public README/rapor hiçbir performans kazancı iddia etmez.

### 2026-09-20 — Kutarya School makale ve tam sistem mimarisi

- Kök neden: önceki arayüz çok sayıda kart, bağımsız örnek ve genel "aşama"
  metni gösteriyordu; kullanıcıya bir sistemi kurmak, çalıştırmak ve hata
  ayıklamak için gereken dosyaları aynı akışta vermiyordu. Logo da markanın
  canlı sitedeki gerçek sembolü yerine yerel bir yorum kullanıyordu.
- `D:\Kutarya\Kutarya-School` ana sayfası Medium benzeri sade bir yayın
  akışına çevrildi. İlk ekranda alanlar, temel diller, seçili uzun makaleler,
  kod önizlemeleri, tam sistem rehberleri ve hata ayıklama kayıtları var.
- Logo `kutarya.com/brand/logo-mark.svg` üzerindeki canlı Kutarya marka
  sembolüyle eşleştirildi; favicon ve üst çubuk aynı kaynağı kullanıyor.
- Üst menü `Diller`, `Makaleler`, `Sistemler` ve `Hata ayıklama` eksenine
  indirildi. Eski `/ornekler` sayfası makale keşfine, `/projeler` sayfası yeni
  `/sistemler` dizinine yönleniyor; tanıtım ve deneme alanı bağlantıları ana
  bilgi mimarisinden çıkarıldı.
- Altı tam rehber eklendi: çevrimdışı Flutter alışkanlık uygulaması, ASP.NET
  Core görev API'si, TypeScript WebSocket sohbeti, Unity envanteri, geri
  alınabilir Python dosya düzenleyicisi ve FastAPI/PyTorch görüntü servisi.
  Rehberler ön koşul, dosya ağacı, kurulum komutu, gerçek kaynak dosyaları,
  çalıştırma kanıtı, hata matrisi ve genişletme yollarını birlikte içeriyor.
- Alan sayfaları genel yol haritası metinleri yerine ilgili makaleleri,
  dilleri ve tam sistemleri bağlıyor. Arama dizini de eski kısa örnekler yerine
  bu sistem rehberlerini tarıyor.
- Doğrulama: `npm run build` geçti; içerik denetimi 41 dil, 16 alan, 826 konu
  yolu, 28 hata, 6 tam sistem ve 17 kaynak dosyasını doğruladı. Tarayıcıda ana
  sayfa, `/sistemler`, `/sistemler/mobil-aliskanlik` ve `/alan/mobile` dar ve
  1440x900 görünümlerde incelendi; yatay taşma ve konsol hatası bulunmadı.
- Yayın yapılmadı. Yerel geliştirme adresi `http://127.0.0.1:5174/`.

### 2026-09-20 — Kutarya School eski Google sonucu ve gerçek 404 düzeltmesi

- Canlı `https://kutarya.com/` HTML'i yeni başlık, açıklama, canonical,
  Open Graph, robots ve yapılandırılmış veriyi doğru veriyor. Sayfa kaynağında
  eski `Kutarya AI` başlığı veya açıklaması bulunmadı. Google sonucu ise altı
  gün önce taranmış eski başlık ve açıklamayı göstermeye devam ediyordu; ana
  sonuç için kök neden eski Google dizini/önbelleğidir.
- İkinci kök neden Firebase Hosting'deki genel `** -> /index.html` SPA
  rewrite'ıydı. Kaldırılmış `/pricing`, `/dene`, `/chat`, `/auth/login` ve
  diğer eski AI adresleri canlıda `200` ile yeni ana sayfa HTML'ini dönüyordu.
  Bu, arama motoruna kaldırılan URL'lerin hâlâ var olduğuna dair yanlış sinyal
  veriyor ve soft-404/tekrarlı sayfa riski oluşturuyordu.
- `Kutarya-School/firebase.json` yalnız mevcut uygulama rotalarını
  `index.html` dosyasına rewrite edecek biçimde daraltıldı. `public/404.html`
  içinde `noindex,follow` kullanan markalı ve yararlı bir gerçek 404 sayfası
  eklendi. Böylece eski ve bilinmeyen adresler Hosting katmanında 404 döner.
- Doğrulama: `npm run build` geçti; 41 dil, 24 alan, 41 uzmanlık yolu, 826 konu
  yolu, 25 ayrıntılı makale, 51 hata, 6 sistem ve 17 kaynak dosyası doğrulandı.
  Firebase Hosting emülatöründe ana/mevcut örnek rotalar `200`; `/pricing`,
  `/dene`, `/chat`, `/auth/login` ve rastgele bilinmeyen rota `404` döndü.
- Canlı `https://www.kutarya.com/` şu anda sertifika ad uyuşmazlığı veriyor
  (`SEC_E_WRONG_PRINCIPAL`); DNS apex domaine işaret etse de `www` adı Firebase
  özel alan adına/sertifikasına ayrıca eklenmeden güvenilir yönlendirme sayılmaz.
- Bu değişiklik yayınlanmadı. Prosedür: önce yalnız Hosting'i yayınla; canlıda
  kök ve gerçek içerik rotalarının 200, eski AI rotalarının 404 olduğunu ölç;
  ardından Search Console URL Denetimi ile `https://kutarya.com/` için dizine
  ekleme iste ve `https://kutarya.com/sitemap.xml` dosyasını gönder. Acilse
  `/pricing` için geçici kaldırma istenebilir, fakat kalıcı çözüm 404'tür.

### 2026-09-20 — Kutarya School etkileşimli alan ve AI uzmanlık katmanı

- Kök neden: ana sayfadaki `Web`, `Backend`, `Mobil`, `Oyun`, `Yapay zeka`,
  `Sistem`, `Otomasyon`, `Veri` ve `Güvenlik` başlıkları yalnız hedef sayfaya
  giden küçük bağlantılardı. Alan sayfaları da dil/makale listesi gösteriyor,
  alt uzmanlıkların kavram, araç, çıktı ve hata sınırlarını ayırmıyordu.
- `src/data/fieldGuides.js` içinde dokuz ana alan için 41 uzmanlık yolu
  tanımlandı. Web için erişilebilirlik, CSS düzeni, tarayıcı, bileşen mimarisi
  ve performans; Backend için HTTP, veri, kimlik, arka plan işleri ve
  gözlemleme; Mobil için arayüz, state, çevrimdışı veri, cihaz ve yayın; Oyun
  için döngü, mimari, fizik, AI ve ağ/optimizasyon içerikleri eklendi.
- Yapay zekâ alanı sekiz bağımsız yola ayrıldı: matematik/veri temeli, klasik
  ML, derin öğrenme, NLP/LLM, bilgisayarlı görü, üretken AI, RAG/ajan ve MLOps.
  Her seçim hedef, kavramlar, araçlar, üretilecek çıktı, kritik hata ve ilgili
  kaynakları aynı panelde güncelliyor. URL hash desteğiyle örneğin
  `/alan/ai#rag-agents` doğrudan doğru uzmanlığı açıyor.
- Ana sayfa alan şeridi `FieldExplorer` ile klavye erişimli iki kademeli bir
  keşif yüzeyine çevrildi. Alan ve uzmanlık seçimleri sayfa yenilenmeden içeriği
  değiştiriyor; mobil görünümde dokuz alan ve AI'ın sekiz yolu gizlenmiyor.
- AI hata kütüphanesine CUDA bellek taşması, tensor boyut uyuşmazlığı, model
  bağlam sınırı, embedding boyut uyuşmazlığı ve veri sızıntısı kayıtları
  eklendi. Arama dizini artık uzmanlık yollarını da kavram, araç ve hata
  anahtarlarıyla buluyor; `RAG` araması doğru hash adresine gidiyor.
- İçerik doğrulayıcı alan/uzmanlık bütünlüğünü, minimum kapsamı, yinelenen
  kimlikleri, konu bağlantılarını ve sistem özetlerinin tam rehberlerle
  eşleşmesini denetleyecek biçimde genişletildi.
- Ayrıntılı sayfalar ve arama dinamik parçalara ayrıldı; ilk JavaScript paketi
  yaklaşık 531 kB'dan 349 kB'a düşürüldü ve Vite büyük paket uyarısı kalktı.
- Son doğrulama: `npm run build` geçti; 41 dil, 16 alan, 41 uzmanlık yolu, 826
  konu yolu, 33 hata, 6 tam sistem ve 17 kaynak dosyası doğrulandı. Temiz
  tarayıcı sekmesinde masaüstü ve 390x844 mobil görünüm, alan/alt alan seçimi,
  hash ile doğrudan açılış, RAG araması ve AI hata ayrıntısı denendi; yatay
  taşma veya güncel konsol hatası bulunmadı.
- Yayın yapılmadı. Yerel geliştirme adresi `http://127.0.0.1:5174/`.

### 2026-09-27 — Kutarya Lens Phase 4 Gemini benchmark devamı; günlük kota bloklu

- `C:\Users\yunus\OneDrive\Desktop\MyAiSystem` içindeki 6.202 başarılı ana cache kaydı korunarak yalnız `gemini-2.5-pro` eksikleri `--workers 1` ile sürdürüldü. Son doğrulanmış ana cache 7.192/7.800: Flash 2.600, Flash-Lite 2.600, Pro 1.992; kalan Pro hücresi 608.
- Dengeli tam ara matris 68 gerçek görüntü, 398 soru ve 5.970 gerçek API cevabına çıktı. `full_protocol_complete=false`; repeatability henüz çalıştırılmadı ve Phase 4 tamamlanmış sayılmıyor.
- Sağlayıcı `generate_requests_per_model_per_day` için model başına 1.000 günlük limit ile HTTP 429 döndürdü ve son olayda yaklaşık 16 saat bekleme istedi. Kota yanıtları cache'e yazılmadı. Devam komutu: proje sanal ortamında `python scripts/run_phase4_benchmark.py full --workers 1 --model gemini-2.5-pro`; anahtar yalnız ortam/getpass üzerinden verilmeli.
- Dört metin koşulu aynı çocuk sorusunda boş model cevabı üretti ve başarı cache'ine girmedi. İstemci boş yanıtı da bounded retry/backoff ile yeniden deneyecek, son başarısız denemeyi ayrı koşu artifact'ına yazacak şekilde sertleştirildi; başarılı cache anahtarı değişmedi.
- Ana matris 7.800'e ulaştıktan sonra 10 görüntü/52 soruluk iki ek tekrar toplam 1.560 istek olarak cache-preserving çalıştırılacak. Ardından analiz, tüm regresyon/integration testleri, Ruff, sdist/wheel, temiz wheel smoke, secret/private KCS ve artifact doğrulamaları yeniden yapılmalı. Phase 5'e geçilmedi.

### 2026-09-27 — Kutarya Lens Phase 4 gerçek text-only vision transfer tamamlandı

- Resmi `Qwen/Qwen3-4B-GGUF` Q6_K, llama.cpp build 10964 ile `D:\KutaryaModels\Qwen3-4B` ve `D:\KutaryaLens-TextOnly-Bench` altında çalıştırıldı. Runtime vision/video/audio yeteneklerini false bildirdi; `--no-mmproj --no-mmproj-auto` kullanıldı ve Qwen'e hiçbir source image verilmedi.
- Aynı 100 görüntü, 520 soru, bağımsız ground truth ve önceden cache'lenmiş Lens açıklamalarıyla 2.080/2.080 primary ve 416/416 repeat çağrısı başarılı oldu; hata ve retry sıfırdı. Model SHA-256 benchmark öncesi/sonrası aynı kaldı; eğitim veya weight update yapılmadı.
- Question Only 0/520 (%0); Lens Compact 92/520 (%17,69), Balanced 95/520 (%18,27), Detailed 96/520 (%18,46). Bunlar sırasıyla +17,69, +18,27 ve +18,46 yüzde puan vision-transfer uplift ve aynı sayıda question-only wrong -> Lens correct eşleşmesidir.
- Üç çağrılı tekrar subset'inde Question Only 52/52; Compact, Balanced ve Detailed ayrı ayrı 51/52 tam kararlıydı. 42 Lens hata satırının manuel semantik örneğinde A=33 bilgi eksik, B=5 yanlış Lens bilgisi, C=4 Lens doğru/Qwen yanlış, D=0 ambiguity, E=0 runtime bulundu; oranlar yalnız örneklem içindir.
- `docs/TEXT_ONLY_VISION_TRANSFER_PHASE4.md` ve `artifacts/phase4/text-only/` üretildi. Text-only artifact doğrulaması geçti. Regression 108 test + 265 subtest ve gerçek perception integration 1/1 geçti; Ruff kaynak/test/script kapsamı, sdist/wheel, temiz wheel smoke ve ara secret/private KCS denetimi geçti.
- Gemini tarafı değişmedi ve genel Phase 4 hâlâ tamamlanmadı: 7.192/7.800 primary, kalan Pro 608, Gemini repeat 0/1.560. Mevcut 7.192 cache dosyasının isim/boyut/SHA-256 manifesti alındı ve 7.192/7.192 değişmeden doğrulandı. Günlük quota reset sonrasında yalnız eksikler `workers=1` ile devam edecek; Phase 5'e geçilmedi.

### 2026-10-04 — KutaryaWeb oyun sitesi planı (uygulama başlamadı)

- Kullanıcının isteğiyle `D:\Kutarya\KutaryaWeb\SITE-PLANI.md` oluşturuldu:
  Unity Web/WebGL ve doğrudan web oyunları kataloğu, kutarya.com/Firebase
  Hosting, hesap, admin, oyun paketleme/sürümleme, kabul ve geri dönüş planı.
- **Admin paneli ve Kutarya AI benzeri giriş sistemi ilk sürümün zorunlu
  gereksinimleridir.** Yerel AGENTS.md ve DEVIR.md içine de kaydedildi.
- Klasör başlangıçta boştu. Eski AI/desktop çalışma klasörlerinin yokluğu
  doğrulandı; mevcut silmeler geri alınmadan kök Git HEAD 338f4c0 kaynakları
  okundu. Eski authService/authApi/AuthPage/VerifyEmailPage kaynaklarında
  e-posta/şifre, Google ve API ile altı haneli kod doğrulama bulundu.
  Parola sıfırlama istemcisi Firebase mail yöntemini kullanıyor; özel kod
  mailiyle aynı gönderim hattı olduğu doğrulanmadı. Eski hesapları korumak
  için canlı Auth havuzu, sağlayıcılar, mail ayarları ve domain incelenmeli.
- Yeni tuzak/ayrım: panelde oyun kaydı veya Storage ZIP yüklemesi, Hosting
  yayını değildir. İlk sürüm planında dosya yayını kontrollü CLI/operatör
  adımı; panel yalnız doğrulanmış sürümle katalog yayını/geri alma yapar.
- Canlı Firebase/Hosting target/domain/billing incelenmedi; uygulama, kurulum,
  test veya deploy yapılmadı. Resmi Firebase/Unity belgeleri plan için okundu.
- Yayın öncesi eski iki test takımı kapısı hâlâ belgelerde bulunuyor, fakat
  ilgili çalışma klasörleri yok. Kapsamı yayından önce çözülmeli; eski test
  adetleri güncel başarılı sonuç kabul edilmemeli. Yeni sitenin gerçek Auth,
  admin yetkisi, veri kuralı ve oyun/tarayıcı kabulü ayrıca zorunlu.
- Sonraki adım: SITE-PLANI.md Aşama 0 envanteri, ardından ana sayfa/login/admin
  görünümü ve proje iskeleti. İlk oyun henüz seçilmedi. Bu görev yalnız plandı.

### 2026-10-04 — KutaryaWeb uygulaması ve yerel kabul; canlı yayın bekliyor

- Kullanıcının geliştirme talimatıyla `D:\Kutarya\KutaryaWeb` içinde site
  oluşturuldu: responsive katalog/arama, Neon Rota/Yörünge/Hafıza Atlası/
  Birleşim oyunları, ortak Auth tabanlı hesap akışları, kütüphane ve gerçek
  sunucu yetkili admin paneli. Yerel ayrıntılı kayıt `KutaryaWeb/DEVIR.md`;
  kapsam ve kanıt `docs/KABUL.md`, yayın prosedürü `docs/YAYIN.md`.
- Yeni callable `gamesService`, `kutarya-games` codebase, europe-west1,
  Node 22, maxInstances=3. Katalog/kapak/kategori/duyuru/destek/profil/üyelik
  kısıtları/audit ayrı oyun koleksiyonlarındadır. Eski AI/mobile/school/PayTR
  kaynakları veya canlı servisleri değiştirilmedi; Auth kullanıcıları korunuyor.
- Testler: üretim build geçti; 12/12 core/paket testi (Node 24 ve ayrıca
  Node 22.23.3), 21/21 Auth/Firestore/Functions/Storage entegrasyonu ve
  11/11 Hosting route/404/MIME/sıkıştırma kontrolü geçti. Audit 0 açık.
  Gerçek browser oyunlar/admin/login/kapak/390 px mobil ve ayrı generic web
  paketini çalıştırdı; test paketi sonrasında temizlendi. Kaynak build başarıları
  gerçek mail/Google/Unity/telefon kabulü olarak sunulmadı.
- Salt okunur canlı envanter doğrulandı: kutarya-ai-3169 mevcut Hosting,
  kutarya.com ACTIVE domain/sertifika, Auth email/Google açık, eski kullanıcılar
  var, billingEnabled=true; bucket kutarya-ai-3169.firebasestorage.app US-EAST1.
  Mevcut MOBILE_MAIL_PASS metadata latest ENABLED; payload okunmadı/kopyalanmadı.
  Yeni API bu Secret Manager kaydını kullanacak; gerçek SMTP kabulü henüz yok.
- Canlı Firestore ruleset incelemesi oyun koleksiyonlarına izin olmadığını
  ve genel deny-all kuralını doğruladı. Yerel deny-all rules dosyaları canlı ortak
  projeye gönderilmemeli; yayın yalnız yeni Functions codebase ve Hosting.
- Yeni tuzak: Windows Firebase Hosting emülatöründe glob-slasher custom header
  glob yollarını ters eğik çizgi yapınca başlıklar sessizce eşleşmiyor. Regex
  header kurallarıyla gerçek MIME/gzip/Brotli/CORS yanıtları ölçüldü.
  functions:list --json environment sırlarını gösterebilir; ham çıktı dökülmez.
- Canlı yayın yapılmadı. Yayın onayı/ilk admin hesabı ve eski iki test kapısının
  bu yeni projeye uygulanması bekleniyor; eski çalışma klasörleri yok, geri
  yüklenmedi. Yayından sonra SMTP gelen kutusu, gerçek Google OAuth (kutarya.com
  /__/auth/handler), kullanıcı akışları ve fiziksel cihaz doğrulanmalı.
  Kullanıcıdan gerçek Unity build sağlanmadı, onun runtime kabulü ayrı iş.

- Yayın sorusuna son kullanıcı yanıtı: **“Önce yerel sürümü incele”**.
  Canlı yayın ve claim değişikliği bu nedenle bekliyor. İlk canlı admin olarak
  **kutaryaai@gmail.com** belirtildi; henüz yetki ataması yapılmadı. Yerel
  demo yönetici hesabı gerçek Gmail hesabı değildir.
- Salt okunur Auth lookup seçilen Gmail hesabını mevcut/doğrulanmış ve henüz
  gamesAdmin yetkisi olmayan hesap olarak doğruladı. Ana sayfa 5180 ve admin
  demo yönetici oturumuyla incelemeye açık bırakıldı; emülatör/Vite çalışıyor.


### 2026-10-04 — KutaryaWeb v3 genel proje platformu; yerel inceleme

- Kullanıcının son isteğiyle oyun odaklı v2 yerini genel proje paylaşımına aldı:
  oyun/.NET/HTML-CSS-JS/mobil/kaynak/araç, açık varsayılan + sıcak/koyu/sistem,
  düzenli mobil/masaüstü katalog ve ayrıntılar, beş bölümlü admin editörü.
  Kutarya Auth/logo/özel mail deneyimi korunuyor. Eski dört native oyun/kapak
  kaldırıldı; final yerel katalog boş. Gelecek blackjack/poker/rulet/FPS üretilmedi.
- Admin panelinden gerçek Storage resumable upload, progress/pause/resume/cancel,
  sürüm/rol/platform; 500 MB sınırı, 20 dosya/proje, temel imza ve immutable
  metadata. Gerçek 12 MB browser yükleme ve küçük ZIP browser indirme/hash kabulü
  yapıldı; gerçek 500 MB/kurulum/Unity çalışması ölçülmedi. Yerel fixture temizlendi.
- Yeni tuzaklar: paused Storage SDK cancel false döner; resume sonra cancel ile
  gerçek iptal düzeldi. Storage emülatöründe allow create tek başına overwrite
  engellemedi; resource == null gerekir. Vite HMR initializeApp duplicate-app
  için getApps/getApp ve tek emulator connect gerekir. CUA viewport görünür
  sekmede etkili; mobile width DOM ile ölçülür, bitişte reset yapılır.
- Kullanıcının Firebase public config'i proje/app/key ile eşleşti; gönderdiği
  Firestore kuralları canlı salt okunur ruleset ile aynı. Firestore deny-all
  yerel dosyası canlıya gönderilmez. Üretim authDomain kutarya.com korunuyor;
  Realtime Database/Analytics config'i veri toplama servisini başlatmadı.
- Dosya upload'ı için canlı Storage kural önerisi hazırlandı: mevcut users/
  public/indirmeler korunur; eski admin catch-all yalnız projectAssets kapsamını
  dışlar, yeni verified gamesAdmin oluşturma/overwrite koruması eklenir.
  Salt okunur güncel taban + SHA merge + 8 karşılaştırmalı local test gerekir.
  Önceki v2 yalnız hosting/functions prosedürü dosya yükleme için yeterli değil;
  güncel daraltılmış Storage release prosedürü KutaryaWeb/docs/YAYIN.md.
  CANLI KURAL DEĞİŞMEDİ; öneri/test yayın onayı yerine geçmez.
- Son ölçüm: build, 11/11 core/import (Node 24 + Node 22.23.3), 38/38 emülatör
  entegrasyonu, 19/19 Hosting, 8/8 Storage önerisi; prod npm audit 0. Gerçek
  tarayıcı 390 px no-overflow, login/admin/cover/gallery/upload/download/tema ve
  generic web iframe kabulü. Gerçek SMTP/Google/Unity/fiziksel telefon açık.
- Kullanıcının Önce yerel sürümü incele tercihi ve ilk canlı admin
  kutaryaai@gmail.com seçimi geçerli. Claim/Hosting/Functions/Storage/canlı
  kullanıcılar değişmedi. Eski silinmiş server/desktop test kapısı çözülmedi,
  geçti denmedi. Eski projeler/silmeler/AI-mobile-PayTR kapsamına dokunulmadı.
- README/SITE-PLANI/docs ve iki DEVIR güncellendi; ayrıntılı v3 devir yerel DEVIR.
  5182 yalnız kontrol emülatörü durduruldu; 5180 ve servis emülatörleri incelemeye
  açık, demo admin oturumu tutuldu. Yerel credentials gerçek Gmail şifresi değil.

### 2026-10-04 — KutaryaWeb Google giriş düzeltmesi

- Yerel Google girişi aynı sekmede emülatör hesap seçimine gider. Üretimde popup,
  popup-blocked redirect ve açık Aynı sekmede giriş yap alternatifi vardır.
  Query/hash hedefi korunur; 30 dakikalık marker token içermez. StrictMode sonucu
  bir kez tüketir, handledRedirect sonraki login'e eski credential taşımaz.
- Profil yükleme hatası Auth hatasından ayrıldı; tekrar tamamlama sunulur.
  Hesap bağlama aynı e-posta ile parola doğrulaması gerektirir. Bilinen Hosting
  hostlarında authDomain aynı host seçilir; Console domain/callback değişmedi.
- Bu görev: npm test 21/21, Node 22.23.3 Google 10/10, build ve değişen kodlarda
  Prettier geçti. Gerçek tarayıcıda yerel hesap seçimi/dönüş/filtreli hedef/iptal
  ve çıkış-sonrası yeniden giriş çalıştı. Google Kabul test hesabı yalnız Auth
  emülatöründedir: google.com, verified, admin değil. Demo admin oturumu geri açıldı.
- Kanıt KutaryaWeb/artifacts/google-auth-acceptance.json ve Google ekranları;
  README/docs/yerel DEVIR ayrıntıları güncel. Canlı Google OAuth hâlâ açık kabul;
  deploy/kurallar/claims/provider ayarları değişmedi. 5180 ve emülatörler açık,
  önce yerel inceleme tercihi korunuyor. Eski silinmiş 385/102 testleri geçti denmedi.

### 2026-10-05 — KutaryaWeb gerçek kullanıcı oyunları; deploy yapılmadı

- Üç sağlanan HTML oyun, asılları korunarak KutaryaWeb/games-src altında
  düzenlendi: Blackjack 1.0.3, Rulet 1.0.1, Kutarya Block Arena 1.0.0. Yerel
  katalog/admin üç yayınlanmış proje, gerçek ekran kapakları ve birer güncel ZIP
  içerir. Runtime public/games altında; ZIP index.html + OKU.txt içerir.
- Blackjack kısa ekranda masa/hamleler sığar; çift işlem ve eski tur yarışı
  düzeldi. Rulet çark gerçek boyutu izler; FPS menüleri dar/kısa ekrana uyarlandı.
  Sandbox korunur; kalıcı FPS profili ayrı sekme/indirilen HTML'de kullanılır.
- İletişim kutaryaai@gmail.com. Yerel Google düğmesi Auth emülatör simülasyonu
  olduğunu açıklar; gerçek Google OAuth ve production provider kabulü ölçülmedi.
- Bu görevde 27/27 kod testi, 38/38 servis entegrasyonu, build ve Prettier geçti.
  Üç oyun gerçek tarayıcıda direct/iframe oynandı; üç indirilmiş ZIP hash'i eşleşti.
  Fiziksel telefon/FPS ölçümü/tüm modlar tam maç ve eski 385/102 kabulü değildir.
- Yerel Auth/Functions/Storage yeniden açıldı; mevcut Firestore 8085 korundu,
  yeni Auth'ta seed/oturum yenilendi. Kısmi Storage reset'te katalog referansları
  kalabilir; yalnız portun açık olması tam ortam kabulü değildir. CSS font URL'si
  semicolon içerir; import silme regex'i tuzağı düzeltildi ve parser testi eklendi.
- Ayrıntılar KutaryaWeb/DEVIR.md ve docs/KULLANICI-OYUNLARI.md. Son ekran
  artifacts/screenshots/user-games-catalog-final.jpg; 5180 yerel inceleme açık.
  Kullanıcı açıkça deploy istemedi: canlı Hosting/Functions/kurallar/claims/
  provider değişmedi. İlk canlı admin kutaryaai@gmail.com hâlâ atanmış değildir.

### 2026-10-05 — KutaryaWeb Blok Diyarı 0.1.0

- Kullanıcı isteğiyle özgün Minecraft tarzı web oyunu geliştirildi; dördüncü
  yerel proje. Unity kaynakları/Mojang varlıkları kullanılmadı. 160x160x64 tohumlu
  dünya, üretim/fırın/tarım/envanter, hayatta kalma/gece gölgeleri/kule hedefi,
  yaratıcı katalog/uçuş, Türkçe menü ve JSON kayıt. Ayrıntı KutaryaWeb/DEVIR.md
  ve docs/BLOK-DIYARI.md. Runtime public/games/blok-diyari/0.1.0; gerçek kapak,
  bir güncel 28.704 bayt ZIP; önceki üç oyun korundu. İndirme hash'i eşleşti.
- Bu görev 34/34 kod, 38/38 servis entegrasyonu ve build geçti. Integration
  önceki doğrulanmış test hesabında fail olmuştu; yalnız yeni@kutarya.test
  başlangıç verification flag'i setup'ta sıfırlandı, ardından 38/38. Genel seed,
  parolalar/diğer oturumlar döndürülmedi. Eski 385/102 takımlarının sonucu değil.
- Gerçek UI: dünya/üretim/kazma/yerleştirme, yaratıcı uçuş, JSON indirme/import,
  site iframe ve 390x466 menü/çanta. Tam survival zinciri/tüm mekanikler/fiziksel
  telefon/FPS ölçümü açık. file:// HTML UI IAB politikasıyla engellendi; HTTP/ZIP
  kabulü bunun yerine sayılmaz. Sandbox same-origin açılmadı; JSON yedek var.
- Canlı Hosting/Functions/Auth/kurallar/claims/provider değişmedi; deploy yok.
  5180 yerel inceleme açık. Kaynak/paket/kabul ayrıntıları KutaryaWeb altında.

## 5 Ekim 2026 — Kutarya OS, ayrı C# Windows Forms okul projesi

- Kullanıcı yeni OOP okul projesi istedi; yalnız C# Windows Forms. Ayrı
  D:\KutaryaOS\ProjeDosyalari çözümü kuruldu. Mevcut web/AI/mobile/PayTR
  uygulamaları bu işte değiştirilmedi; Firebase deploy yapılmadı.
- .NET SDK 10.0.401 ve WindowsDesktop 10.0.12 resmi betikle
  D:\KutaryaOS\Bagimliliklar\dotnet içine; NuGet ve CLI verisi de D: içine.
- İlk kurulum cihaz adı ve gerçek GlobalMemoryStatusEx/DXGI/disk sınırları;
  Kutarya OS masaüstü, özgün bitmap, üç tema, başlangıç/görev çubuğu,
  dosyalar/çöp/notlar/hesap/izleyici/ayarlar ve sağdan animasyonlu Kutarya Us.
  RAM/VRAM sanal bütçedir, fiziksel rezervasyon veya hypervisor değildir.
- Dosya sürükleme gerçek TAŞIMA: DELETE yetkili kaynak tanıtıcısı, geçici
  kopya + SHA-256 + Flush(true), kalıcı hedef, aynı tanıtıcıdan silme.
  Kota/iptal/kilit/doğrulama hatasında kaynak korunur. Silme başarısızsa
  doğrulanmış kopya ve kaynak birlikte korunur. Klasör/link aktarımı yok.
- AI gerçek yerel chat-compatible veya bulut Responses bağlantısı;
  endpoint/model/key uygulama ayarında, sır DPAPI. Sanal dosya araçları var.
  Çalışan model/kimlik bilgisi henüz gelmedi: canlı AI kabulü açık; kontrollü
  loopback HTTP aracı testini gerçek AI sayma. Eski model promptu değişmedi.
- Release 0 hata/uyarı; 34/34 çekirdek, 9 WinForms UI kontrolü geçti.
  Bağımsız yayımlanmış EXE ayrıca SDK env olmadan aynı 34 + 9 kontrolü geçti.
  Fiziksel Explorer drag-drop ve başka bilgisayar/DPI kullanıcı kabulü açık.
- Dağıtım D:\KutaryaOS\Dagitim\KutaryaOS\KutaryaOS.exe (116262135 bayt);
  Windows-x64 ZIP ve kaynak ZIP var. Arşivlere gerçek Veri/SanalCihazlar,
  DPAPI, test geçici dosyaları, bin/obj alınmadı; kaynak 27 dosya.
- Bu kurulumda betik/EXE D:\KutaryaOS\Veri kullanır; taşınabilir başka
  klasörde EXE yanında SanalCihazlar. Başlat: D:\KutaryaOS\KutaryaOS-Baslat.ps1.
  Plan/kabul/sınıf haritası/devir: D:\KutaryaOS\ProjeDosyalari belgeleri.
- WinForms DrawToBitmap fiziksel ekran yakalama değildir; çocuk Form z
  sırasını bununla tek başına kanıtlama. Ayrı form renderları ve UI kontrolleri var.
## 5 Ekim 2026 — Kutarya OS 0.2, okul için sunucusuz AI ve setup

- Ayrı C# WinForms projesi D:\KutaryaOS\ProjeDosyalari; devam notu onun DEVIR.md.
  Kullanıcı veritabanını kendisi halledecek: bu projeye DB kodu/paketi eklenmedi.
- Yerel native CPU GGUF indirme + panelde otomatik yükleme; kendi API alternatifi
  ve DPAPI. Eski Kutarya sunucusu/Ollama profili zorunluluğu kaldırıldı.
  Gerçek sohbet, klasör ve dosya oluşturma ölçüldü; küçük modelin kalite sınırı var.
- Sade masaüstü, ImageGen dağ/göl görseli, üç görünüm ve kısa UI metinleri.
  Gün planı/risk matrisi/OOP ve kabul belgeleri proje docs klasöründe.
- Dagitim\KutaryaOS-Setup-0.2.0-x64.exe gerçek per-user setup; native DLL dahil
  self-contained KutaryaOS-0.2.0 klasörü, kaynak/portable ZIP ve UI görüntüleri.
  Kurulu EXE: 34 çekirdek + 8 indirme + 16 UI/native; kurulum 9 kontrol.
  Yeniden kurulum/kaldırma kullanıcı dosyasını korudu; school PC/DPI/elle drag-drop açık.
- Yeni başlangıç betiği sürümlü klasöre bakar. D: geliştirme veri kökü korunur;
  başka PC’de %LOCALAPPDATA%\KutaryaOS\Veri. Model setup’a dahil değil, yaklaşık640MB.
- Web sitesi ve Firebase/Hosting/Auth/admin/AI/mobile/PayTR değiştirilmedi/deploy yok.
  Kutarya OS’nin eski 0.1 açık penceresi zorla kapatılmadı.


## 5 Ekim 2026 — Kutarya OS 0.3, AI Masaüstü sınırı / kullanıcı aktarımı

- Ayrı C# WinForms okul uygulaması D:\KutaryaOS\ProjeDosyalari. Güncel devam
  kaydı onun DEVIR.md dosyasında. AI yalnız sanal Masaustu ve altında çalışır;
  sınır hem yerel model hem kendi API için VirtualToolExecutor kodundadır.
- Ana PC'ye dosya/klasör taşıma kullanıcı Dosyalar panelinden hedef seçip
  başlatır. AI'a export aracı verilmedi. Kaynak kilidi, SHA, geçici hedef,
  çakışmasız ad ve kaynak koruması; gerçek D→C ve UI düğmesi testleri geçti.
- Son kurulan 0.3: 34 core + 34 sınır/aktarım + 8 indirici + 20 UI/native;
  setup10. Gerçek GGUF sohbet, Masaüstü klasörü ve tam metin içeriği doğrulandı.
  Boş AI cevabını başarı sayan eski test düzeltildi; model kalitesi sınırlı.
- Dagitim\KutaryaOS-Setup-0.3.0-x64.exe, sürümlü bağımsız klasör, portable/
  kaynak ZIP, galeri, risk/OOP/gün planı. Kurulum/kaldırma test verisini korudu.
  Fiziksel klasör seçicisi/Explorer sürükleme, okul PC/DPI ve sınıf provası açık.
- DB, web sitesi, Firebase/Hosting/Auth/admin, eski AI/mobile/PayTR değişmedi.
  Deploy yok. Eski paketler ve açık kullanıcı penceresi korundu.
- Son renderda aktarım sonrası gecikmiş Progress mesajı terminal sonucu ezdi;
  IsTransferring guard ve terminal metin UI kabulüyle düzeltildi. Son setup
  yeniden tam kabul edildi; güncel SHA/kanıt Kutarya OS DEVIR ve manifestinde.

## 5 Ekim 2026 — Kutarya OS web kataloğuna ekleme

- Kullanıcının talebiyle D:\Kutarya\KutaryaWeb yerel kataloğuna kutarya-os
  0.3.0 eklendi: Windows masaüstü / Uygulamalar. Toplam 4 oyun + 1 uygulama.
- Setup, portable ve kaynak ZIP; mevcut sunucu yetkili admin/Storage hattı.
  1 kapak + 4 gerçek WinForms renderı. OS dağıtımı yeniden paketlenmedi.
- scripts/install-kutarya-os-local.mjs yalnız demo loopback servislerinde;
  paket manifest/SHA ve önceki tam setup kabulüne bakar. Tekrar çalıştırmada
  kopya yok, dört eski proje aynı. Paketler Hosting public/dist içinde değildir.
- 3 oturumsuz API indirimi + 3 gerçek browser indirimi SHA/boyut eşleşti.
  Admin/masaüstü filtresi, 1280/390 px ve görseller doğrulandı. 34/34 + build.
  OS runtime/setup veya önceki38 servis entegrasyonu tekrar çalıştırılmadı.
- Ayrıntı/kanıt/yerel yeniden ekleme KutaryaWeb\docs\KUTARYA-OS.md ve DEVIR.md.
  Site http://127.0.0.1:5180/proje/kutarya-os. Yerel inceleme/deploy kapısı aynı;
  canlı Firebase/Hosting/Functions/Auth/claims/kurallar ve PayTR değişmedi.
  Yeni canlı dosya/görseller gerçek admin üzerinden yüklenmeli; 9199 URL'leri
  üretime taşınmaz. OS DB'siz; fiziksel okul PC/DPI/elle sürükleme açık.




## 5 Ekim 2026 — KutaryaWeb: Convert 1.0.0 eklendi, Google butonu kaldırıldı

- KutaryaWeb yerel kataloğu 6 gerçek proje: 4 oyun, Kutarya OS, Kutarya Convert.
  Convert tool/arac/web; önceki beş kayıt korundu. Gerçek görsel, belge/PDF,
  tablo ve ses kodlama; çoklu kuyruk, PDF işlemleri, ZIP, iptal, 4 tema.
- Google butonu/linking/redirect tamamlama Auth UI'dan çıkarıldı; parola/kayıt/
  kod/reset ve admin korunur. Ortak canlı Firebase Google sağlayıcısı değişmedi.
  0 Google butonu ve mevcut local admin parola girişi Araçlar hedefiyle ölçüldü.
- Tek HTML runtime + web ZIP 4.8 MiB + kaynak ZIP 3.2 MiB. Yerel Storage/admin
  hattından 2 API ve 2 browser indirimi SHA/boyut aynı. İkinci kurulum kopyasız.
  Kaynak 20 izinli dosya; ayrı npm ci/test19/build ile aynı HTML SHA üretildi.
- Runtime 1.0.0 immutable; kaynak tools-src/convert. scripts/install-convert-local
  yalnız demo loopback. Detay düğmesi kendi çalışma sekmesine açılır.
- Tuzaklar: inline JS String.replace callback ister (dolar kalıpları parse bozar);
  importer gerçek HTML parse etmelidir, JS template href varlık değildir.
  Storage create application/octet-stream ister. Kurallar gevşetilmedi.
  Vite public preview'ları dist'e kopyalar; plugin dist/tools-preview'ı çıkarır.
  Hosting ignore emülatör servisinde uygulanmadı; yalnız ignore yeterli değil.
- Kabul: KutaryaWeb 53/53 + build, 38/38 servis, 22/22 yerel Hosting. Browser gerçek
  4 aile + roundtrip/Türkçe/Excel sıfırlar/PDF sayfalar/MP3 ffprobe/iptal;
  bozuk 3 dosya yanında 4 başarı; 15 girdi byte/SHA aynı. 390 px taşma yok.
- Sentetik drop 2/2; Explorer/telefon/her kodek ayrı kabul açık. CUA file:// URL
  politikası engelledi; bypass yapılmadı. ZIP çift tıklama kabulü açık, HTTP ölçüldü.
  Opaque iframe chooser araçtan dönmedi; sandbox gevşetilmedi. Ana yol kendi sekmesi.
- Ayrıntı KutaryaWeb/DEVIR.md ve docs/KUTARYA-CONVERT.md. Yerel inceleme devam;
  canlı Hosting/Functions/Storage/kurallar/claims/PayTR değişmedi. Üretimde 9199
  URL taşıma; kullanıcı yayın onayı + docs/YAYIN kapıları gerekir. OS DB'siz kaldı.

## 5 Ekim 2026 — KutaryaWeb: Kutarya Cep 1.0.0

- Kullanıcı sunucusuz Java Android Studio AI sohbet uygulaması, SQLite geçmiş/
  hafıza ve kaynak/okul belgeleriyle mevcut siteye ekleme istedi. Deploy yasak.
  Kaynak KutaryaWeb/mobile-src/kutarya-cep; com.kutarya.cep, min26/target36.
- Kutarya Cep / asistan Kutarya Us: geçmiş/arama/sabitleme, yönetilebilir global/
  sohbet hafızası, dört doğrudan API (OpenAI/OpenRouter/Gemini/Grok), stream/stop/
  retry, model seçimi, Keystore AES-GCM anahtar, tema/animasyon/sistem voice/TTS,
  SAF JSON/Markdown. Ayrı backend veya cihaz içi LLM yok; BYOK+internet gerekir.
- Son test APK debug/v2 1.534.513 bayt; kaynak ZIP 100.478 bayt/39 dosya; PDF
  85.390 bayt/4 render edilmiş sayfa. artifacts/kutarya-cep manifest/SHA/kabul.
  60 saat/15 iş günü öneri plan, gerçekleşen süre ölçülmedi; 12 risk/OOP/SQLite/
  sunum belgesi. Öğrenci/ders/öğretmen kimliği uydurulmadı.
- 27/27 Java birim/HTTP, 12/12 son kurulu APK instrumentation; Android build/
  lint 0 hata/25 tavsiye. ZIP ayrı build/test27; 10 APK girdisi byte/SHA aynı.
  Gerçek UI send/stop/retry testli. Kontrollü yanıt galeride açık etiketlidir.
- Mevcut katalog/admin/Storage hattı: yedinci gerçek proje mobile/uygulama;
  önceki altı kayıt aynı. Installer yalnız demo/loopback, iki çalıştırma kopyasız.
  3 gerçek browser indirmesi SHA/boyut aynı; 1280/390 px taşmasız/5 galeri,
  admin/koleksiyon, 53/53 site + build. Servis/Hosting bu görevde tekrar koşulmadı.
  Mobile kapak/galeri CSS'i dikey ekranı tam gösterir; diğer türler korunur.
- Tuzak: Gradle connected test APK'yı kaldırıp screenshotları siler; son APK
  elle adb install/instrument/pull ile kabul edildi. Activity sync idle yerine
  RESUMED monitor kullan; test animasyonunu kapat, ürün animasyonunu kaldırma.
- Gerçek API anahtarları/kalite/kota/latency, fiziksel API26+ telefon, TalkBack/
  büyük font, elle SAF/voice/TTS/FPS ve Play Store üretim imzası açık. SQLite ve
  dış yedek şifresiz, API anahtarları yedeğe girmez. Eğitim/çevrimdışı AI iddiası yok.
- Ayrıntı KutaryaWeb/DEVIR.md ve docs/KUTARYA-CEP.md. Site yerel:
  http://127.0.0.1:5180/proje/kutarya-cep. Canlı Hosting/Functions/Storage/rules/
  claims/Auth ve eski AI/mobile/PayTR değişmedi; deploy yok. Üretime 9199 URL
  taşıma; ayrıca yayın onayı/YAYIN kapıları gerekir. Kök silmeler/OS korunur.

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

## 9 Ekim 2026 — KutaryaWeb: yalnız Kutarya Us model mimarisi

- Kullanıcı tek bir eğitilmeye hazır beyin kodu istedi; eğitim verisi/eğitim/
  eğitilmiş model hazırlanmaması açık sınırdır. Tek kaynak
  `D:\Kutarya\KutaryaWeb\kutarya_us_beyin.py`; ayrıntı yerel DEVIR.md.
- KutaryaUsConfig/KutaryaUs: UTF-8 256 bayt sözlüğü, varsayılan 1024 bayt bağlam,
  256 embedding, 6 decoder katmanı, 8 başlık, nedensel SDPA, ön LayerNorm,
  artık bağlantılar, GELU FFN ve paylaşılan embedding/çıkış; 5.052.928 parametre.
  Forward `[B,T,256]` logits + isteğe bağlı loss; sonraki bayt hedeflerini bir
  konum kaydırmak gelecekteki eğitim koduna aittir. -100 hedefler yok sayılır.
- PyTorch 2.14.1+cpu: geçici sayısal tensörlerle 7/7 kontrol grubu ve doğrudan
  çalıştırma geçti. Forward, geleceğe sızıntı, eval, loss/backward/sonlu gradyan,
  tümü maskeli hedef, CPU bfloat16, özel boyut ve geçersiz girdiler kontrol edildi.
  Backward sırasında ağırlıklar değişmedi; optimizer veya eğitim yapılmadı.
  Veri, eğitim betiği, checkpoint veya ağırlık dosyası üretilmedi.
- SDPA dropout'u eval için açıkça sıfırlanır; context_size karakter değil bayttır.
  CUDA ve öğrenilmiş yanıt kalitesi ölçülmedi. Import model oluşturmaz; dosyayı
  çalıştırmak yalnız rastgele başlatılan mimariyi ve parametre sayısını gösterir.
- Mevcut web/katalog/Auth/admin, Firebase/Hosting/Storage, eski AI/mobile/PayTR
  değişmedi; siteye yükleme/deploy yok. Eğitim veya site servisine bağlama bu
  teslimin parçası değildir; yalnız mimari hazırlandı.

## 9 Ekim 2026 — Kutarya Mobile, Siri benzeri mobil agent planı

- Kullanıcı telefonda Türkçe konuşarak arama/arama bulma ve çok adımlı görev
  yapan Kutarya Mobile için plan istedi. Plan:
  KutaryaWeb/docs/KUTARYA-MOBILE-PLANI.md; ürün Kutarya Mobile, asistan Kutarya Us.
- Öneri Android native, cihazda telefon araçları + bulutta güçlü görev
  planlama. Model önerir; cihazdaki izin/onay kapısı yürütmeyi sınırlar,
  araç sonucu doğrulanır. İlk sürüm basarak konuşma; asistan rolü ve
  Hey Kutarya cihaz/pil denemesiyle takip edilir. iOS ayrı kapsamdır.
- Güncel resmî kural: genel asistanın Accessibility API ile otonom
  plan/işlem yapması Google Play'de yasak. Android16+ AppFunctions çağrısı
  izin ve runtime allowlist koşuluna bağlı; MVP bağımlılığı değildir.
  Intent açılışı tamamlanmış işlem değildir; bilinmeyen sonuç başarı sayılmaz.
- Dağıtım kanalı kesinleşmedi; kişisel APK'da kullanıcı başlatmalı deneysel
  ekran kontrolü ayrı seçenek olarak planda yer alır. Play kabulü veya
  Android sınırlarından muafiyet iddiası değildir.
- Mevcut Kutarya Cep kaynakları yerelde var; ProviderApi/KeyVault/ChatDb
  tekrar kullanım adayı. Önceki D:/KutaryaVsJarvis app/build.gradle.kts ve
  DEVIR.md yolları bulunamadı; geçmiş Pocket-AI derlemesi kabul edilmiş
  uygulama gibi kullanılamaz. Kaynak/cihaz seçimi ilk uygulama adımıdır.
- Süreler öneri: erken demo 1–2 hafta, toplam Android MVP 4–6 hafta ve geniş
  beta 10–14 hafta. Gerçek cihaz, canlı API, görev doğruluğu, gecikme ve pil
  kabulü yapılmadan tamamlandı denmez. İlk aşama cihaz ve işlem denemeleridir.
- Bu görev yalnız plan/devir belgeleri: mobil kod, APK, model eğitimi, kurulum,
  ücretli API isteği ve site/Firebase/mağaza yayını yapılmadı. Mevcut ortak
  Auth, katalog/admin, eski AI/mobile/PayTR veya açık uygulamalar değişmedi.

## 10 Ekim 2026 — Kutarya Mobile 1.0 yerel Android APK teslimi

- Kullanıcı planın uygulanmasını, ayrı D klasörü ve APK istedi. Yeni proje
  D:/KutaryaMobile; teslim Dagitim/Kutarya-Mobile-1.0.0.apk. Native Kotlin/Compose,
  com.kutarya.mobile, min26/target36/compile37; asistan adı Kutarya Us.
- Yerel telefon komutları, ses/TTS kaynakları, şifreli not/görev/rutin/bildirim,
  belge eki, 16 kayıtlı araç, bounded agent döngüsü ve kendi Gemini anahtarıyla
  AI bağlantısı geliştirildi. Varsayılan asistan rolü ve widget girişi var.
  Ortak anahtar veya kullanıcıya ait anahtar APK'ya gömülmedi.
- 35 JVM + 13 Android emülatör testi geçti; debug/release lint 0 error,
  19 warning. İmzalı release aynı özel emülatöre kuruldu; gerçek Gönder ile
  Android Ayarlar açıldı ve ASSIST tuşu Kutarya Mobile'ı açtı. Soğuk açılış
  tek emülatör ölçümü1467ms; fiziksel telefon performansı iddiası değildir.
- APK 13.019.712 bayt; SHA256
  8F23EAB07B006A11D71EC9775D19CC81AE1758227AFDCBBEBF5309AC883A7D67.
  v2 imza doğrulandı. Kaynak/arşiv/kanıtlar yeni kökte; ayrıntı docs/KABUL.md.
- JBR21, Gradle9.4.1, SDK ve cache/temp/AVD yeni kökün .tools dizininde.
  .secrets/release jks ve signing.properties güncelleme imzasıdır; korunur,
  paylaşılmaz ve kaynak arşivine alınmaz. Genel AI ayarı Gemini API anahtarı
  ve aktarım tercihi ister; telefon araçları anahtarsızdır.
- Gerçek ARM64 telefon, Türkçe mikrofon/TTS, hat/rehber/mesaj/takvim/widget,
  üçüncü uygulama bildirim dinleme, Doze/yeniden başlama ve gerçek Gemini
  hesabı kabulü açık. Hey Kutarya sürekli dinleme, ekran tıklama agent'i ve
  iOS bu sürümde yok. Dış intent aktarımı dış işlemi tamamlandı saymaz.
- Yaşanan tuzaklar: manuel SDK37 package.xml olmayınca ikinci platform kurulur;
  canonical SDK yöneticisi paketi tutuldu. API37 Play AVD 2048MB'de LOW_MEMORY
  verdi,3072MB ile doğrulandı. Compose transitif Espresso3.5 InputManager
  erişimini bozdu; test bağımlılığı3.7 seçildi, gizli API politikası gevşetilmedi.
  Opaque geo URI query'si Uri.encode ile kurulur. Ayrıntı yeni DEVIR/KABUL'de.
- Mevcut web/katalog/admin/Auth, eski AI/mobile/PayTR, Firebase/Hosting/Storage
  veya açık masaüstü uygulamaları değiştirilmedi. Site/mağaza yayını,
  model eğitimi veya ücretli gerçek AI isteği yapılmadı. Bu kayıt önceki
  yalnız plan kaydından sonraki kullanıcı uygulama talebini karşılar.
- Sonraki "default sürümlere göre yap" yanıtıyla genel Android 8+ tabanı
  korundu; özel marka/model seçilmedi. Uyumluluk yeni README/devir ve kaynak
  ZIP'e işlendi. Mevcut min26/target36/compile37 APK değişmedi; kaynakta
  sürüm denetimli ses/izin/asistan yolları doğrulandı. Bütün sürümlerde
  fiziksel telefon kabulü yapılmış sayılmaz.

## 10 Ekim 2026 — Kutarya Mobile 1.1 yerel geliştirme ve yeni APK

- Kullanıcı yerel model eklemeden API'siz kabiliyetlerin güçlenmesini,
  tasarımın iyileşmesini ve gereksiz metinlerin kalkmasını istedi.
  D:/KutaryaMobile yerinde geliştirildi; yerel LLM/model ağırlığı eklenmedi.
- 28 araç: not arama/düzenleme, hatırlatma iptali, yapılacak listeleri,
  fener, medya sesi, ayar ekranları, Türkçe sayı/birim/yüzde/sıcaklık/tarih,
  sonraki mesajla eksik bilgiyi tamamlama, rutin adıyla çalıştırma ve
  200 KB UTF-8 metin dosyasında kaynak cümlelerinden özet/sayım/arama.
  Dosya/not içeriği komut olarak yürütülmez. Genel AI bağlantısı isteğe bağlıdır.
- Ana sayfa açık/koyu yeni tasarım, dört hızlı kart ve kısa metinlerle
  düzenlendi; not/geçmiş ve komut araması, plan/listeler eklendi. API kurulum
  metinleri Ayarlar'da; gerekli işlem onayları korunur.
- Yeni release D:/KutaryaMobile/Dagitim/Kutarya-Mobile-1.1.0.apk;
  versionCode2, 13.085.316 bayt, v2 imza aynı sertifikayla doğrulandı.
  SHA256 089136858EE2327D18CC086908BA6B8F446E0C3275CFC38AA7045DB87AE6137E.
  Önceki 1.0 APK/kaynak ve özel güncelleme anahtarı korunur.
- 49 JVM + 21 Android emülatör testi geçti; son 21 test uçak modunda,
  Wi-Fi kapalı ve API anahtarı olmadan çalıştı. Debug/release lint 0 error,
  19 warning. Compose test ortamı v2'ye taşındı; testler kaldırılmadı.
- Gerçek release 1.0'dan 1.1'e güncellendi; eski şifreli not okundu.
  Gerçek Android dosya seçicisinde TXT özeti, medya sesi %40, gerçek Wi-Fi
  ayar ekranı ve ASSIST açılışı doğrulandı. Ayrıntı/kanıtlar
  D:/KutaryaMobile/docs/KABUL-1.1.md. Fiziksel ARM64 telefon/ses/fener,
  gerçek hat/mesaj/takvim/bildirim/widget/Doze ve canlı AI hesabı kabulü açık.
- Site/katalog/admin/Auth/PayTR, ortak Firebase/Hosting/Storage ve eski
  uygulamalar değiştirilmedi; yeni site/mağaza yayını veya ücretli AI isteği yok.

## 10 Ekim 2026 — Kutarya Mobile 1.2 değerlendirme, geliştirme ve rapor

- Kullanıcının son uygulama talebi D:/KutaryaMobile içinde tamamlandı.
  Önce mevcut deneyimin sorunları/olması gereken akış kaydedildi,
  plan uygulandı; docs/GELISTIRME-1.2.md, RAPOR-1.2.md ve KABUL-1.2.md.
  Yerel LLM yok; aynı Kotlin/Compose/package/Keystore mimarisi korunur.
- 31 araç; kalıcı şifreli konuşmalar ve kontrollü AI bağlamı, günlük özet,
  yeni açık/koyu ana ekran/mesajlar, Türkçe kibar komut/ilgili öneriler,
  ses canlı metin/seviye ve önce düzenleme, kayıt formları, onaylı
  liste/madde kaldırma, doğrulanan rutin adımları ve kayıt ID'siyle seçim.
- Son imzalı D:/KutaryaMobile/Dagitim/Kutarya-Mobile-1.2.0.apk:
  versionCode3, 13.134.468 bayt, v2/same certificate, DEBUGGABLE yok.
  SHA256 371633E3CA4AA1E62EE36E5911EC5E5730FE49F237AB4ADD7B4A8245EC613500.
  Eski1.0/1.1 çıktıları korunur; canlı1.1 paket/hash değişmedi.
- 62 JVM + 32 native Android testi, 0 atlanan; uçak modu/Wi-Fi kapalı ve
  anahtarsız. Debug/release lint0 error/18 warning. Son derleme1m49s.
  Gerçek1.1 release üzerine son1.2 APK kuruldu ve şifreli eski not okundu;
  son release'te iki mesaj kapat/aç sonrası döndü. Kanıtlar yeni KABUL'de.
- Yaşanan tuzaklar: StateFlow.value composition'da lint hatası; collectAsState.
  Klavye açık konuşma sheet'i IME padding/ağırlıklı liste ister. Yeni
  kayıt listesi ilk ID değişiminde başa alınır. Aynı adlı rutin kartı ada
  göre değil kayıt ID'siyle çalıştırılır. Test arama metni ile kayıt metni
  ayrılır; gerçek doğrulamalar kaldırılmadı.
- Fiziksel ARM64/gerçek Türkçe ses/hat/üçüncü uygulama/bildirim/widget/Doze
  ve canlı AI kalite kabulü açık. Hotword/genel ekran agent'i/iOS yok.
  Bu geliştirme talebinde yeni site/mağaza yayını yapılmadı. Mevcut canlı
  KutaryaWeb, ortak Firebase/Auth/Hosting/Storage/PayTR ve diğer uygulamalar
  değişmedi; bu devir ve web devir kaydı güncellendi.


## 2 Kasım 2026 — GitHub arşiv aktarımı

Kullanıcı D: projelerini GitHub'a aktarıp ardından yerel kopyaları silmeyi istedi.
Hedef özel depo: https://github.com/Kutarya/d-archive-kutarya. Kaynak anlık kopyası ve
şifreli tam dosya arşivleri aktarılır; sırlar kaynak görünümünden çıkarılır.
Yerel silme yalnız bütün dosyaların arşiv CRC/boyut denetimi, GitHub SHA-256
eşleşmesi ve son kaynak değişiklik kontrolünden sonra yapılabilir. Bu not
tek başına aktarımın veya silmenin tamamlandığını kanıtlamaz; nihai durum
GitHub release dosyaları ve sahibine teslim edilen aktarım raporundadır.
