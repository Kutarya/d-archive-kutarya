# Kutarya — Yayın ve Geri Dönüş

## Yayın öncesi kapılar

1. `KutaryaAIWeb/server`: `npm test`
2. `KutaryaDesktop`: `npm test` ve `npm run build`
3. Mobil backend değiştiyse `KutaryaAIBackend/functions`: `npm run check`
4. Mobil backend değiştiyse Functions + Firestore emulator smoke
5. İlgili yüzeyin sürüm/CHANGELOG kaydı

PayTR hazır değilken ödeme yapılandırması başka yayınlarla birlikte değiştirilmez.

## Yayın komutları

Web istemcisi ve web API birlikte değiştiyse:

```powershell
cd D:\Kutarya\KutaryaAIWeb
npx firebase deploy --only "hosting,functions:api" --project kutarya-ai-3169 --non-interactive
```

Yalnız mobil backend değiştiyse:

```powershell
cd D:\Kutarya\KutaryaAIBackend
npx firebase deploy --only functions:mobile-backend --project kutarya-ai-3169 --non-interactive
```

Bir codebase değişmediği hâlde tüm Functions topluca yayınlanmaz.

## Yayın sonrası doğrulama

```powershell
node D:\Kutarya\scripts\canli-smoke.mjs
```

Komut tüm satırlarda `PASS` ve özet içinde `"kaldi":0` vermelidir. Installer
canlıdan tamamen indirilmeden hash doğrulanmış sayılmaz; betik bunu akış halinde
indirir ve diske geçici kopya bırakmaz.

## Geri dönüş

### Hosting

Firebase Console > Hosting > Release history içinden son sağlam sürümü yeniden
yayınla. Ardından canlı smoke betiğini yeniden çalıştır. Eski installer adresi
yeni sürüme yönlendiriliyorsa yönlendirmeyi de hedef sürüme göre geri al.

### Web veya mobil Function

Functions için yalnız kaynak ağacını geri alıp aynı codebase'i yeniden deploy
et. Başka codebase'leri komuta ekleme. Cloud Run konsolundan elle trafik
bölmek, Firebase Functions yapılandırmasıyla sapma oluşturabileceği için kalıcı
geri dönüş yöntemi değildir.

### Masaüstü installer

Önceki kurulumlar `KutaryaDesktop/release/` altında tutulur. Geri dönüşte:

1. İstenen eski EXE'yi `KutaryaAIWeb/public/downloads/` içine koy.
2. `studioSurum.js` sürüm, boyut ve adres alanlarını eşitle.
3. `node scripts/surum-manifesti.mjs`, web build ve testleri çalıştır.
4. Yalnız Hosting'i yayınla ve canlı smoke yap.

## Geri dönüş kararı

- API sağlık ucu 5xx veriyorsa veya giriş/sohbet kritik akışı bozulduysa geri dön.
- Yalnız geçici Kutarya Us quick-tunnel 503 hatasında önce tüneli yenile; web API
  sürümünü gereksiz yere geri alma.
- Geri dönüşün sebebi, saatleri ve kullanılan sürüm `DEVIR.md` içine yazılır.

