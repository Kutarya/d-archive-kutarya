# Kutarya — Yapılacaklar

**Güncelleme:** 2026-09-18  
**Kapsam:** Kutarya sitesi, web API, Kutarya PC Agent ve bunların yayın/işletim
akışı. PayTR bilinçli olarak bu listenin dışındadır.

Bu liste güncel çalışma kuyruğudur. Tarihî `DENETIM-EKSIKLER.md` içindeki
doğrulanmamış adaylar buraya otomatik taşınmaz; önce güncel kaynakta yeniden
ölçülür.

## P0 — Önce yapılacaklar

- [ ] **Mobil backend içindeki düz metin Gmail parolasını kaldır.**
  - Parolayı sağlayıcı tarafında döndür.
  - `KutaryaAIBackend/functions/src/services/email-service.js` ve
    `KutaryaAIBackend/functions/test-email.js` içindeki kopyaları kaldır.
  - Secret Manager/ortam değişkenine geçir; kaynak ve yayın paketinde sır
    kalmadığını tara.
  - `npm run check`, testler ve emulator smoke geçmeden yalnız
    `functions:mobile-backend` yayınlanmalı.
  - **Tamamlanma ölçütü:** Eski parola geçersiz, kaynakta sır yok, yeni sırla
    gerçek test e-postası başarılı.
  - **Durum:** Kaynak kopyaları kaldırıldı, `MOBILE_MAIL_PASS` Secret Manager'a
    taşındı, test/emulator/deploy geçti. Google hesabında eski uygulama parolasını
    döndürmek ve yeni sırla gerçek alıcıya e-posta göndermek hesap erişimi bekliyor.

- [ ] **Temiz bir Windows makinede PC Agent 1.6.8 kabul testi yap.**
  - Kurulum/kaldırma, masaüstü ve Başlat menüsü kısayolu, giriş, sohbet,
    ayarların yeniden açılışta korunması, dosya seçimi ve harici bağlantılar.
  - Agent izinleri ile uzaktan kontrolün varsayılan kapalı olduğu doğrulanmalı.
  - İnternet kesilmesi, API 401/5xx ve uygulama yeniden başlatma davranışı
    görülmeli.
  - **Tamamlanma ölçütü:** Yeni kullanıcı profilinde baştan sona kritik akışlar
    geçiyor ve kaldırma işlemi artık dosya bırakmıyor.
  - **Durum:** 1.6.9 paket ve gerçek Electron açılış smoke geçti; temiz VM yok.
    Uygulanacak kesin liste `KABUL-TESTI-PC.md` içinde.

- [ ] **PC Agent kurulumunu kod imzalı hâle getir.**
  - Windows kod imzalama sertifikası edin; CI/yerel paketleme sırrı olarak
    güvenli sakla.
  - EXE ve mümkünse uygulama ikililerini zaman damgalı imzala.
  - **Tamamlanma ölçütü:** `Get-AuthenticodeSignature` sonucu `Valid`; temiz
    Windows indirme/kurulumunda yayımlayıcı doğrulanıyor.
  - **Durum:** Paketleme imzaya hazır ve prosedür `KOD-IMZALAMA.md` içinde;
    sertifika bulunmadığı için 1.6.9 ölçümü `NotSigned`.

- [ ] **Geri alınabilir kaynak yönetimi kur.** `[Benim önerim]`
  - `D:\Kutarya` şu anda Git deposu değil; yanlış düzenleme veya bozuk yayın
    için güvenilir geri dönüş noktası yok.
  - Bileşenleri özel Git depolarına veya dikkatle hazırlanmış tek özel depoya
    al; `.env*`, anahtarlar, model dosyaları, `node_modules`, build/release ve
    kullanıcı verilerini kesin olarak dışla.
  - İlk commit öncesi gizli bilgi taraması yap.
  - **Tamamlanma ölçütü:** Temiz klondan web ve masaüstü test/build alınabiliyor;
    hiçbir sır geçmişe girmiyor.
  - **Durum:** Yerel Git deposu, kapsamlı `.gitignore` ve sır tarayıcısı kuruldu;
    gerçek eski Admin özel anahtarı kaynak ağacından kaldırıldı ve `29aa51c`
    geri dönüş commit'i oluşturuldu. Özel uzak depo ve temiz klon provası Git
    sağlayıcısı erişimi bekliyor.

## P1 — Sonraki bakım turu

- [x] **Mobil backend kalite kapısını düzelt.**
  - `agent-api-routes.js` içindeki kullanılmayan `reqId` lint hatasını doğrula
    ve düzelt.
  - Birim, entegrasyon ve emulator smoke testlerini birlikte çalıştır.
  - Bu iş PayTR değişikliği gerektirmemeli.

- [x] **`firebase-functions` bağımlılığını kontrollü yükselt.**
  - Güncel yayın 1.6.8 sırasında CLI eski sürüm uyarısı verdi.
  - Sürüm notları/kırıcı değişiklikler incelenmeli; önce yerel/emulator,
    ardından web 397+ ve masaüstü 220+ test kapıları çalıştırılmalı.
  - **Tamamlanma ölçütü:** Uyarısız deploy ve canlı sağlık kontrolleri.
  - **Sonuç:** 7.4.0 yayınlandı. Üretim bağımlılık zincirinde
    `@google-cloud/storage → gaxios → uuid` kaynaklı 2 orta seviye upstream bulgu
    kalıyor; uyumsuz zorunlu yükseltme yapılmadı.

- [ ] **Kimlik doğrulamalı canlı uçtan uca test hesabı oluştur.** `[Benim önerim]`
  - Mevcut smoke testler 200/401/CORS ve dosya bütünlüğünü ölçüyor; gerçek
    kullanıcı sohbeti, ayar kaydı ve agent isteğini otomatik doğrulamıyor.
  - Sınırlı yetkili ayrı test hesabı ve temizlenebilir test verisi kullan.
  - **Tamamlanma ölçütü:** Her yayından sonra giriş → ayar → sohbet → agent
    durum zinciri otomatik geçiyor; hata canlı yayını durduruyor.
  - **Durum:** `scripts/canli-e2e.mjs` hazır; ayrı test hesabından kısa ömürlü
    `KUTARYA_SMOKE_ID_TOKEN` verilmesi bekleniyor. Kimlik bilgisi depoya yazılmaz.

- [x] **Yayın sonrası otomatik sağlık kontrolü ve geri dönüş prosedürü ekle.**
  `[Benim önerim]`
  - Site, manifest, EXE boyut/hash, API health, CORS, korumalı uçların 401'i ve
    eski sürüm yönlendirmesi tek komutla ölçülsün.
  - Önceki Hosting sürümüne ve önceki installer'a dönüş adımları belgelenmeli.
  - **Tamamlanma ölçütü:** Tek komut makinece okunabilir PASS/FAIL raporu üretir.

- [x] **Üretim izleme ve alarm kur.** `[Benim önerim]`
  - Cloud Function 5xx/hata oranı, gecikme, kota, başarısız giriş artışı ve
    Kutarya Us tünel çevrimdışı durumunu izle.
  - Bildirimler sır veya kullanıcı içeriği taşımamalı.
  - **Tamamlanma ölçütü:** Kontrollü test hatası alarm üretir; normal trafik
    gereksiz alarm üretmez.
  - **Sonuç:** Altı saatte bir çalışan `Kutarya canlı sağlık` takibi oluşturuldu;
    başarıda sessiz, hata ve kurtarmada bildirimli.

- [x] **Masaüstündeki teknik borçları tek turda temizle.**
  - Etkin olmayan kök `KutaryaDesktop/main.cjs` kopyasını doğrulayıp kaldır veya
    açıkça arşivle; gerçek giriş `electron/main.cjs`.
  - Beş dosyaya dağılmış `https://kutarya.com` sabitlerini tek yapılandırmaya al.
  - BYOK sohbet başlığı üretimini ana akışla eşitle.
  - Geçici kayıt/depolama uyarılarına kapanma veya başarıda temizlenme davranışı
    ekle; tanıtım şeridine `aria-live` ekle.
  - **Tamamlanma ölçütü:** Masaüstü testleri ve gerçek Electron smoke testi geçer.

- [x] **Webde bilgi amaçlı görünen ayarları ürün kararına bağla.**
  - Veri dışa aktarma ve 2FA gerçekten yapılacaksa sunucu sözleşmesi, güvenlik
    modeli ve testleriyle uygula; yakın planda yoksa tıklanabilir özellik gibi
    göstermeyi bırak.
  - **Tamamlanma ölçütü:** Arayüzde görünen her kontrol çalışır veya açıkça
    “yakında” olarak pasiftir.

- [x] **Web ve PC ayarlarının sınırını kullanıcıya açık göster.** `[Benim önerim]`
  - Hesapla eşitlenen ayarlar ile yalnız bu cihazda tutulan agent/izin/klasör
    ayarları etiketlensin.
  - Güvenlik açısından cihaz izinleri buluta otomatik taşınmamalı.
  - **Tamamlanma ölçütü:** Kullanıcı hangi ayarın başka cihazda geleceğini
    tahmin etmek zorunda kalmaz.

## P2 — Dayanıklılık ve uzun vadeli işler

- [ ] **Kutarya Us için geçici tünel bağımlılığını azalt.**
  - Mevcut ücretsiz Cloudflare tüneli PC her açıldığında adres değiştiriyor ve
    Başlat betiğine bağımlı.
  - Kalıcı tünel/DNS veya uygun sürekli çalışma seçeneğinin maliyet ve riskini
    karşılaştır; mevcut akışı bozacak geçişi plansız yapma.
  - **Durum:** Karar ve güvenli geçiş sırası `TUNEL-KARARI.md` içinde. Named
    Tunnel için Cloudflare hesap/DNS erişimi ve tünel belirteci gerekiyor.

- [x] **ModelLab test keşfini ve LoRA yollarını düzelt.**
  - Çıplak `pytest` operasyon betiğini test sanıyor; eski sabit LoRA yolu
    koleksiyonu kırıyor.
  - Test dizinini açıklaştır; 1.5B eğitim başarısını yalnız log ve artefaktla
    kanıtla. GTX 1650 4 GB sınırını koru.

- [x] **Tarihî denetim listesini yeniden doğrula ve küçült.**
  - `DENETIM-EKSIKLER.md` içindeki orta/düşük bulguları güncel kodda tek tek
    ölç; yanlış pozitifleri kapat, gerçek olanları bu dosyaya taşı.
  - **Tamamlanma ölçütü:** Aktif kuyrukta yalnız yeniden üretilmiş işler kalır.
  - **Sonuç:** Güncel kaynakta yeniden üretilen beş masaüstü bulgusu kapatıldı;
    2026-09-02 adayları tarihî kayıt olarak işaretlendi ve aktif kuyruğa yalnız
    ölçülmüş maddeler bırakıldı.

- [x] **Bağımlılık ve lisans bakım takvimi oluştur.** `[Benim önerim]`
  - Aylık `npm audit`/outdated incelemesi, lisans/NOTICE kontrolü ve kontrollü
    güncelleme penceresi belirle.
  - Otomatik büyük sürüm yükseltmesi yapma; her yüzey kendi test kapısından geçsin.
  - **Sonuç:** `BAKIM-TAKVIMI.md` eklendi.

## Bilinçli olarak bekleyen

- [ ] **PayTR ve ödeme yayını:** Kullanıcı PayTR hazırlığını tamamlayana kadar
  değiştirilmeyecek ve bu listedeki diğer teknik işlerle karıştırılmayacak.

## Önerilen uygulama sırası

1. Mobil e-posta sırrı ve kaynak yönetimi.
2. Temiz Windows kabul testi ve kod imzalama.
3. Mobil lint/kalite kapısı ile `firebase-functions` bakımı.
4. Canlı E2E, otomatik smoke/rollback ve alarm sistemi.
5. Masaüstü teknik borçları ve ayarların kullanıcıya açıklığı.
6. Tünel, ModelLab ve tarihî denetim temizliği.
