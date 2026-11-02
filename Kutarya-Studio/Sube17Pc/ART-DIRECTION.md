# Şube 17 — çizim ve animasyon yönü

12 Eylül 2026. Kullanıcının ilk beş resmi eski oyunu, son üç resmi ise yalnız
stil referansını gösteriyordu. Referans oyunların ekranları, logoları ve
karakterleri dağıtılan dosyalara kopyalanmadı.

## Uygulanan yön

Belirgin koyu mürekkep konturları, mat ve sınırlı renk alanları, iki kademeli
gölge, zeytin yeşili/kiremit/krem paleti. Hayalî imparatorluk, erken/orta 20.
yüzyılı çağrıştıran binalar ve eşya. Bu dönem seçimi prototip sanat kararıdır.
Fotoğraf dokusu ve sinematik gerçekçilik azaltıldı. Özellikle ev çiziminde
bankaya göre daha fazla yüzey dokusu kaldı; sonraki sanat geçişinde sadeleşebilir.

Üretim: yerleşik OpenAI `image_gen` aracı. Harici API anahtarı veya CLI
kullanılmadı. Tüm son varlıklar `public/assets` içine kopyalandı; SHA-256 ve
kaynak kaydı `asset-provenance.json` içindedir.

## Varlıklar

| Dosya | Kullanım |
|---|---|
| `street-illustrated.png` | Menü, kurulum ve sokak; 1672×941 koordinat uzayı |
| `bank-illustrated.png` | Banka içi; belge ve müşteri katmanları ayrı |
| `home-illustrated.png` | Ev içi ortak taban; oda etkileşimleri ayrı |
| `family-illustrated.png` | Soldan sağa Leyla, Nermin, Elif, Deniz, Cemal; beşli atlas |
| `customers-illustrated.png` | Altı müşteri portresi; hem kimlik hem görüşmede aynı portre |
| `customer-illustrated.png` | İlk tekil portre denemesi; artık ekranda kullanılmıyor, korunuyor |

Önceki `street-main.png`, `street-hub-v2.png` ve logo kaynakları geri dönüş için
korundu. Yeni menü başlığı yazı ve çizgi katmanlarıyla oluşturuldu. Logo yalnız
açılışta, simge de işletim sistemi penceresinde kullanılmaya devam eder.

## Arka plan üretim özetleri

- Sokak: özgün çizimli imparatorluk meydanı; solda ev ve bar, karşıda kazino,
  sağda eczane ve banka. Koyu boş kapı açıklıkları; resme gömülü kapı kanadı,
  arayüz, yazı ve insan olmadan. Okunaklı cepheler, düz renkler, koyu konturlar.
- Banka: gişe çalışanı bakışı; önde masa, merkezde boş müşteri yeri, geride
  kurumsal mimari ve hayalî imparatorluk bayrağı. İnsan ve arayüz olmadan.
- Ev: aynı çizim dilinde oturma odası, koltuk, lamba ve televizyon; karakterler
  ve oynanış kontrolleri ayrı katmanlarda kullanılacak şekilde boş oda.

Bu üç madde yardımcı sanat çalışmasının üretim özetidir; birebir istem
dökümü değildir. Aşağıdaki iki atlasın son istemleri ise doğrudan kullanıldı.

## Aile atlası — kullanılan istem

Use case: illustration-story. Create ONE clean production character portrait
sprite sheet for original Turkish fictional mid-century empire banking survival
game Şube 17. Exactly FIVE equally spaced EQUAL-WIDTH panels in ONE horizontal
row, every panel occupied by one fully visible waist-up character at same scale,
plain matte warm paper background, no text no labels no logos no borders.
Left-to-right: 1 Leyla the wife, 35 year old woman auburn shoulder length hair
simple rust blouse; 2 Nermin grandmother, elderly silver haired woman round
glasses sage cardigan; 3 Elif daughter age10 warm ochre dress, dark hair; 4 Deniz
son age14 short dark hair blue shirt; 5 Cemal uncle, stout 55 year old mustached
man in burgundy waistcoat. Affectionate but tired, serious expressive faces,
hands relaxed fully in each panel. Stylistic invariant: clearly hand-drawn 2D
point and click adventure cel illustration, bold irregular dark ink contour,
deliberately simple flat color fields, 2-step shadows, restrained earthy
olive/rust/ochre/cream palette, pencil-like facial lines. NO photo realism,
NO painterly microtexture, NO 3D rendering, NO cinematic light, NO smooth
airbrushed skin. Do not copy any existing game's characters. Uniform baseline,
each character centered exactly at x10%,30%,50%,70%,90%. Width 2500 height 1000
approximate aspect2.5:1, no character overlaps panel boundaries. Must look like
illustrated game characters not realistic paintings.

## Müşteri atlası — kullanılan istem

Use case illustration-story. ONE production character sprite sheet for original
fictional mid-century empire banking game. EXACTLY SIX equal-width panels ONE
HORIZONTAL ROW. All six at same waist-up scale, plain light warm paper background,
no text, no logos, no borders. Alternating women and men LEFT TO RIGHT: (1) young
adult female tailor bobbed black hair rust jacket; (2) middle aged male baker
clean shaven wearing flat cap olive coat; (3) middle aged female teacher red brown
bun wire spectacles dark green cardigan; (4) elderly male railway worker short
gray hair thick eyebrows navy jacket; (5) adult female nurse curly dark hair cream
blouse ochre cardigan; (6) adult male bookkeeper wavy brown hair round glasses
maroon waistcoat. Hands relaxed visible fully within each panel. All ordinary
sympathetic citizens slightly worried, appearance must not indicate honesty or
guilt. Clearly hand drawn 2D point-and-click adventure game cel illustration,
bold dark ink contours, simple flat warm color shapes, two-tone shadow planes,
very restrained paper texture. Never photorealistic, no 3D, no painted realistic
texture, no copy of existing game characters. Width~2304 height~768, ratio3:1,
centered exactly at x8.33%,25%,41.67%,58.33%,75%,91.67%; no overlap across panels.
Good detailed expressive ink faces but simple color filling.

## Katman ve hareket sözleşmesi

- `Street.jsx` içindeki `BUILDINGS` kapı ve bina kutularının tek kaynağıdır.
  Sahne `1672 / 941` oranını korur; boşluk gerektiğinde mektup kutusu görünümü
  kullanılır. Taban ve etkileşimler birbirinden bağımsız büyütülmez.
- Kapıların iki kanadı özgün kod çizimidir; menteşe uçlarından ±59° döner.
  İç oda, ışık ve eşik ayrı katmanlardır. Eski resmin pikselleri örneklenmez.
- Fare ve klavye odağı aynı hareket durumunu kullanır. Mekân kartları hafif
  yükselir, etiketler çıkar, yapraklar süzülür, lamba ışığı yavaşça değişir.
- Belgeler, damgalar, müşteri girişi, oda kapıları, kart dağıtımı ve uyku için
  ayrı geçişler vardır. `prefers-reduced-motion` hareketi azaltır.
- Atlaslar CSS ile gösterilir; raster kaynaklar parçalanıp tekrar kaydedilmez.

Sonraki sanat işleri: evin dört odasına özgü ayrı çizimler; bar/eczane/büfe
tam çevre resimleri; müşteri yürüyüş/oturma ve yüz ifadesi sprite'ları;
televizyonda çizimli haber sahneleri; daha geniş portre kadrosu.
