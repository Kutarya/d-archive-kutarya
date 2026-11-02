# Kutarya Studio — Oyun Ana Planı

> Durum: Şube 17 PC prototipi geliştiriliyor; splash ve ana menüden sonra yeni
> oyun kurulumundan sokağa ulaşan ilk akış mevcut.
> Son güncelleme: 12 Eylül 2026
> Çalışma adı: Şube 17.

Bu belge, konuşmada kesinleşen oyun kararlarının ana kaynağıdır. Yeni kararlar
alındıkça burası güncellenecek; belirsiz konular kesinleşmiş gibi uygulanmayacak.

## 1. Ürün ve yayın hedefi

- Oyun, hayalî **Kutarya Empire** ülkesinde geçer.
- `kutarya.com`, Kutarya AI kimliğinden **Kutarya Studio** kimliğine
  dönüştürülecek ve stüdyonun oyunlarını tanıtıp indirme sunacak.
- Oyun internet sitesinde oynanmayacak. Web teknolojileriyle geliştirilecek ve
  **Electron ile Windows PC uygulaması** olarak paketlenecek.
- İlk hedef PC sürümüdür. Mobil sürüm şu an kesinleşmiş değildir.
- Oyun tek oyunculu ve yerel çalışacak; hesap sistemi ve çevrim içi kayıt yoktur.
- Kayıtların cihazda tutulması planlanıyor. İlk düşünce `localStorage` olsa da
  uzun süreli kayıt güvenliği, yedekleme ve sürüm geçişi uygulama aşamasından
  önce ayrıca kararlaştırılacak.
- Gerçek yapay zekâ konuşmaları isteğe bağlı bir özellik olacak. Gerekli model,
  donanım veya bağlantı bulunmuyorsa bu seçenek kullanılamayacak; hazır diyalog
  modu oyunu tek başına oynanabilir tutacak.

### Yayın ve üretim güvenliği

- Eklenen her görsel, ses, yazı tipi, kod bağımlılığı ve başka varlığın kaynağı
  ile ticari/yaygın dağıtıma uygunluğu projeye alınmadan önce kontrol edilecek.
- Bilgisayarda uygun bir kaynak varsa önce o değerlendirilecek; ancak yerel
  olması kullanım hakkını kanıtlamaz. Kaynağı veya lisansı belirsiz içerik
  kullanılmayacak.
- Varlık kaydı `Sube17Pc/asset-provenance.json`, otomatik kontrol ise
  `npm run check:publishability` ile tutulacak. Otomatik sonuç hukuki garanti
  değildir; son yayın öncesinde benzerlik ve marka incelemesi insan tarafından
  tekrarlanacak.
- Yeni sahne ve tasarımlar sonradan animasyon eklenebilmesi için taban görsel,
  ışık, atmosfer, sis, karakter ve arayüz gibi değiştirilebilir katmanlar halinde
  hazırlanacak. Hareketlerde mümkün olduğunca dönüşüm ve saydamlık kullanılacak.

## 2. Temel oyun fikri

Oyuncu, rejimi yeni değişmiş Kutarya Empire'da yaşayan bir banka çalışanıdır.
Kendisini ekranda görmez; karakter erkektir ve oyuncu adını seçebilir. Oyuncu
gündüzleri müşterilerin kredi başvurularını değerlendirir, akşamları kazandığı
maaşla ailesinin ihtiyaçlarını karşılamaya ve kendi stresini yönetmeye çalışır.

Ana amaç belirli bir sona ulaşmak değil, doğru kararlar vererek aileyi ve hayatı
mümkün olduğunca uzun süre ayakta tutmaktır. Oyun sonsuz gün yapısındadır ve ana
rekor **hayatta kalınan gün sayısıdır**.

Ana gerilim şudur:

- Müşterileri hızlı değerlendirerek daha fazla iş yapmak.
- Yalanları ve tutarsızlıkları kaçırmayacak kadar dikkatli davranmak.
- Kazanılan maaşı aile, sağlık ve kişisel stres arasında bölmek.
- Rejim değişiklikleriyle her birkaç günde değişen kurallara uyum sağlamak.

## 3. Görsel ve etkileşim biçimi

- Oyun 3B modellerle değil, **katmanlı resimler ve animasyonlarla** yapılacak.
- Mekânlar sabit birer düz resim gibi durmayacak; ışık, hava, çevre, karakter ve
  arayüz katmanları hareket edecek.
- Kapılar, aile üyeleri, müşteri portreleri ve önemli nesneler fare üzerine
  gelince tepki verecek.
- Müşteriler içeri girecek, masaya yaklaşacak ve koltuğa oturacak.
- Portrelerde duruma göre yüz ifadesi, ağız hareketi ve küçük beden hareketleri
  kullanılacak.
- Seslendirme ve daha gelişmiş konuşma animasyonu hedef olabilir; ilk sürümün
  zorunlu kapsamı değildir.
- Oynanış çoğunlukla fareyle nokta-tıkla ve arayüz seçimleriyle ilerleyecek.
  Gerçek yapay zekâ konuşmasında klavye kullanılacak.

## 4. Ana ekranlar

Kesinleşen ana ekranlar:

1. Splash ekranı
2. Ana menü
3. Ayarlar
4. Yeni oyun: oyuncu adı ve zorluk seçimi
5. Ana oyun ekranı
6. Sokak ve mekân alt ekranları
7. Banka çalışma ekranı
8. Gün sonu performans ekranı
9. Televizyon/haber ekranı
10. Üç günlük ruhsal durum zar ekranı
11. Oyun sonu ve gün rekoru ekranı

Devam et/yükle, kayıt yönetimi, krediler, yasal metinler ve içerik uyarısı gibi
yardımcı sayfaların kesin kapsamı daha sonra belirlenecek.

## 5. Dünya ve mekânlar

### 5.1 Sokak

Sokak ana merkezdir. İlk yerleşimde:

- Sağ tarafta banka
- Sol tarafta ev
- Karşı tarafta casino/kumarhane
- Eczane
- Büfe veya temel ihtiyaç dükkânı
- Tekel ve/veya bar-eğlence mekânı
- İleride ana mekaniğe hizmet edecek başka işletmeler

Her mekân yalnızca dekor olmayacak; ekonomiye, aile ihtiyaçlarına, strese veya
riske hizmet edecek.

İlk sokak prototipinde ev, bar, kazino, eczane ve banka yeni katmanlı merkez
görselinde ayrı binalardır. Fare bina alanına geldiğinde mekân etiketi görünür,
kapı kanatları hafifçe aralanır ve mekâna özel kısa hover sesi çalar. Bu aşamada
hiçbir bina tıklamayla açılmaz. Sokakta ayrıca ayarlar düğmesi ve sokağa dönme,
ana menüye dönme veya masaüstüne çıkma seçenekli çıkış paneli vardır.

### 5.2 Ev

Eve girince oyuncu koridorda başlar. Koridordan şu odalara geçilir:

- Oturma odası
- Mutfak
- Yatak odası
- Çocuk odası

Her odadan tekrar koridora dönülebilir. Aile üyeleri odalarda görünür ve
etkileşime açıktır. Aile üyelerinin odalara kesin dağılımı henüz belirlenmedi.

### 5.3 Banka

Banka gündüz oynanışının merkezidir. Oyuncu çalışma gününü başlattıktan sonra
saat 17.00'ye kadar bankadan çıkamaz. İşe gidememe veya vardiyayı kaçırma sistemi
olmayacak.

### 5.4 Diğer işletmeler

- **Casino:** Blackjack, poker ve ileride seçilecek başka oyunlar bulunabilir.
  Kazanma ihtimali bilinçli olarak oyuncunun aleyhine olacak; kolay para kaynağı
  veya kumar övgüsü gibi çalışmayacak.
- **Eczane:** Yalnızca hasta bir aile üyesi varsa gerekli ilaç alınabilir. Hasta
  kimse yoksa satış yapılmaz ve bunun nedeni söylenir.
- **Bar/eğlence:** Para karşılığında stresi azaltır. Akıl sağlığındaki kalıcı
  hasarı doğrudan iyileştirmez.
- **Büfe/tekel ve diğer dükkânlar:** Kesin ürünleri ve işlevleri daha sonra
  belirlenecek; her biri belirli ihtiyaçlara bağlı olacak.

## 6. Kesin günlük döngü

1. Akşam oyuncu yatak odasındaki yatağa tıklar.
2. Ekran kararır ve uyuma/geçiş animasyonu oynar.
3. Yeni gün yine yatak odasında saat **09.00**'da başlar.
4. Oyuncu bankaya gidip çalışma gününü başlatana kadar saat 09.00'da donmuş
   kalır. Evdeki sabah haberi ve gerekli hazırlıklar bu donmuş zamanda yapılır.
5. Bankada gün başlatılınca sayaç akmaya başlar. **Gerçek hayattaki 1 saniye,
   oyundaki 1 dakikadır.** 09.00–17.00 vardiyası yaklaşık 8 gerçek dakika sürer.
6. Vardiya boyunca oyuncu bankadan çıkamaz ve gelen müşterilerle ilgilenir.
7. Saat 17.00 olduğunda çalışma biter ve gün sonu performans ekranı açılır.
8. Devam düğmesi oyuncuyu otomatik olarak sokağa çıkarır. Banka o gün yeniden
   kullanılamaz.
9. Saat 17.00'de donuk kalır. Oyuncu eve, casinoya, eczaneye ve diğer açık
   mekânlara istediği kadar gidebilir. Bu aşamada sınır zaman değil, para ve
   mekânların koşullarıdır.
10. Sonraki güne geçmenin tek yolu yeniden yatağa tıklamaktır.

## 7. Banka oynanışı

### 7.1 Kredi başvurusu

Her müşteri oyuncunun önüne Kutarya Empire'a ait bir kimlik ve başvuru dosyası
ile gelir. Oyuncunun görebileceği temel bilgiler:

- KT kimlik numarası
- Seri numarası
- Ad ve soyad
- Meslek
- Memleket veya gerekli kişisel bilgiler
- İstenen kredi miktarı
- Kredinin hangi amaçla kullanılacağı
- Kredi için gerekli diğer belgeler

Belgelerin tam listesi ve ülkenin kredi kuralları tasarım ilerledikçe
kesinleştirilecek.

Oyuncunun nihai olarak yalnızca iki işlemi vardır:

- **ONAY** damgası
- **RED** damgası

Para oyuncuya ait değildir. Verilen kredi ve yapılan geri ödeme bankanın
parasıdır; oyuncu bu paralardan doğrudan pay almaz.

### 7.2 Değiştirilemez müşteri gerçeği

Her kredi müşterisinin gerçek durumu daha görüşme başlamadan oyun tarafından
belirlenir:

- Kim olduğu
- Belgelerinin gerçekliği ve aralarındaki tutarlılık
- Söylediği amaç
- Gerçekte ne yapacağı
- Krediyi geri ödeyip ödemeyeceği
- Yalancı/kötü niyetli veya güvenilir olup olmadığı
- Konuşma sırasında açığa çıkabilecek ipuçları
- Nadir bir rüşvet teklif edip etmeyeceği

Bu gerçekler görüşme sırasında değişmez. Yapay zekâ yalnızca kendisine verilen
kişiyi canlandırır; müşterinin doğru kararını, geri ödeme sonucunu veya gizli
gerçeğini yapay zekâ belirlemez. Böylece modelin uydurması oyun sonucunu
haksız biçimde değiştiremez.

### 7.3 İpucu ve adalet ilkesi

Yalancı müşteriler rastgele tahminle değil, gözden kaçabilecek fakat bulunabilir
tutarsızlıklarla anlaşılacak. Örnek yönler:

- Meslek ile gelir arasında şüpheli ama tek başına kesin olmayan fark
- Kimlik, meslek, memleket, gelir, kredi miktarı veya amaç arasında küçük uyumsuzluk
- Konuşmanın farklı yerlerinde değişen ayrıntılar
- Belgedeki bilgiyle sözlü ifadenin uyuşmaması

İpuçları karikatür düzeyinde bariz olmayacak; ancak oyuncunun hiç erişemeyeceği
bir bilgi yüzünden de yanlış sayılmayacak. Güvenilir bir müşteri bazen tuhaf,
yalancı bir müşteri bazen çok düzgün görünebilir. Başarı, basit bir tipe veya
memlekete göre ezber yapmak yerine dosya ve konuşmayı birlikte okumaya dayanmalı.

### 7.4 Konuşma seçimi

Her kredi görüşmesinden önce iki seçenek sunulur:

#### Hazır diyalog

- Oyuncu hazır soru balonlarından birini seçer.
- Müşteri hazırlanmış cevaplarla karşılık verir.
- Klavyeden serbest yazı yazılmaz.
- Gerçek yapay zekâ kullanılamayan bilgisayarlarda ana oynanış budur.

#### Gerçek Yapay Zekâ

- Oyuncu klavyeyle istediği soruyu yazabilir.
- Seçeneğin üzerine gelince şu anlamda bir uyarı gösterilir: yapay zekâ cevabı
  gecikebilir, bu gecikme oyun zamanından yer; karşılığında daha gerçek bir
  müşteri görüşmesi sunar.
- Yapay zekâ cevap üretirken vardiya saati **durmaz**.
- Müşterinin ayrıca bir sabır sayacı olmaz.
- Her görüşmeye bir mesaj sınırı konur. Amaç gereksiz maliyeti, çok uzun
  konuşmaları ve modelin bağlam uzadıkça saçmalamasını sınırlamaktır.
- Model kendisini asistan veya yapay zekâ olarak tanıtamaz; tamamen müşterinin
  kimliğinde kalır.
- Dil, meslek, yaşanılan yer, eğitim ve karaktere göre değişebilir; bazı
  müşteriler memleketine uygun hafif şiveyle yazabilir. Şive anlaşılmaz veya
  abartılı bir parodiye dönüşmemelidir.
- Bugünkü hedef model Kutarya Us'tur; ileride farklı bir model açılırsa aynı
  müşteri sistemi onu da kullanabilmelidir.

Gerçek yapay zekâ için desteklenen donanım, yerel/uzak model düzeni, bağlantı
gereksinimi, mesaj sınırı ve olası kullanım maliyeti henüz kesinleşmedi.

### 7.5 Geri ödeme müşterileri

Kredi borcunu ödemeye gelen müşteride karar mekaniği yoktur. Oyuncu ödemeyi
alır ve makbuzu verir. Gün sonu raporunda **geri ödeme yapan müşteri sayısı**
ayrı gösterilir. Geri ödemenin maaşa etkisi ve eski başvuruyla ne kadar ayrıntılı
bağlanacağı daha sonra netleştirilecek.

### 7.6 Gün sonu değerlendirmesi ve maaş

Gün sonu ekranında müşteri isimleri gösterilmez. En az şu bilgiler bulunur:

- Bakılan kredi müşterisi sayısı
- Doğru karar sayısı
- Yanlış karar sayısı
- Başarı/doğruluk oranı
- Geri ödeme yapan müşteri sayısı
- O gün kazanılan maaş

Maaşın ana belirleyicisi doğruluk oranıdır; yalnızca hızlı davranıp çok kişiye
bakmak yüksek doğruluğun önüne geçmemelidir. İşlenen müşteri sayısı da emeği
yansıtabilir fakat kesin formül henüz kararlaştırılmadı. Kredi tutarı ve banka
kârı doğrudan oyuncunun kişisel parası olmaz.

Yanlışlıkla onaylanmış ve kaçmış kötü müşteriler, sonraki sabah haberlerinde
kimlikleriyle görülebilir. Oyuncu kendisini kimin kandırdığını burada öğrenir.
Gün sonu ekranı ise yalnız toplu sonucu verir.

## 8. Rüşvet sistemi

- Rüşvet teklifi çok nadir gelir.
- Oyuncu reddedebilir veya kabul ederek kişisel para alabilir.
- İlk kabulde yakalanma olmayacak ya da pratikte sıfır olacak.
- Kabul sayısı biriktikçe risk artacak; yaklaşık 2–4 kabul sonrasında yakalanma
  ihtimali belirgin biçimde yükselecek. Kesin eşik ve olasılık tablosu açık.
- Gün sonunda zar çevirme animasyonu oynar. Altı sonucu yakalanmayı temsil eder;
  ancak zarın ağırlığı geçmiş rüşvet sayısına göre değişebilir.
- Yakalanırsa oyuncu bankadan kovulur ve intihar ederek oyun biter. Arada
  işsiz kalıp başka işe geçme veya işe gidememe aşaması olmayacak.

## 9. Aile sistemi

Oyuncunun ailesi:

- Eşi
- Annesi
- Kızı
- Oğlu
- Kilolu dayısı

Her üyenin birbirinden farklı istekleri, temel ihtiyaçları, ruh hâli ve sağlık
olayları olacak. Aile üyeleri oyuncunun banka işine karışmayacak, eve gelir
getirmeyecek ve mekanik fayda sağlamayacak. Oyuncunun sorumluluğu ve duygusal
bağı olarak çalışacaklar.

İstekler uzun süre karşılanmazsa ilgili kişi mutsuz olabilir, evi terk edebilir
veya şartlara bağlı olarak ölebilir. Bu büyük olaylar oyuncunun ruhsal durumuna
doğrudan ağır etki eder. İsteklerin sıklığı ve maliyeti zorluğa göre değişir.

Hastalık durumunda eczaneden ilaç alınması gerekir. İlaç alınmazsa hastalık
ağırlaşabilir. Hastalıkların süresi, ölüm ihtimali ve önceden verilen uyarılar
adil ve okunabilir biçimde ayrıca tasarlanacak.

## 10. Para ve ihtiyaç baskısı

Oyuncunun kişisel parası şu kaynak ve giderlere bağlıdır:

- Günlük performans maaşı
- Zorluğa göre başlangıç parası
- En kolay modda günlük ek destek
- Nadir rüşvet geliri
- Aile ihtiyaçları
- Gıda ve temel ürünler
- İlaç ve sağlık harcamaları
- Bar/eğlence giderleri
- Casino kayıpları veya nadir kazançları
- Rejim kararlarının yol açtığı fiyat ve kıtlık değişimleri

Ekonominin amacı yalnız para biriktirmek değil, hangi eksikliğin önce
karşılanacağına dair baskı kurmaktır.

## 11. Stres ve akıl sağlığı

İki ayrı sistem vardır:

### Stres

- Günlük ve değişken baskıdır.
- Yanlış kararlar, aileye yetememek, para sıkıntısı, biriken ihtiyaçlar ve başka
  başarısızlıklar stresi yükseltir.
- İçki, bar veya yetişkin eğlencesi para karşılığında yalnızca stresi düşürür.
- Stresin düşmesi, akıl sağlığında oluşmuş büyük hasarı otomatik olarak geri
  almaz; yalnızca daha fazla kötüleşmeyi yavaşlatır.

### Akıl sağlığı

- Uzun vadeli ruhsal durumdur.
- Uzun süre yüksek kalan stres akıl sağlığını kötüleştirir.
- Aile üyesinin ölmesi veya evi terk etmesi gibi büyük olaylar yaklaşık yüzde
  15–20 büyüklüğünde doğrudan etki yapabilir.
- Bazı hasarlar geri döndürülemez veya çok zor geri çevrilebilir olacak.
- Göstergenin ekranda “sağlık azalır” mı yoksa “bozulma yüzdesi artar” mı
  biçiminde sunulacağı henüz kesinleştirilmedi. Formüllerde yanlış yön
  kullanılmaması için bu karar uygulamadan önce sabitlenecek.

Her üç günde bir ruhsal durum zarı atılır. Akıl sağlığındaki tehlike yüzde 80
eşiğine ulaşmadan intihar sonucu **hiç mümkün değildir**. Eşik aşıldıktan sonra
sağlık kötüleştikçe altı gelme ihtimali artar. Altı gelirse oyuncu intihar eder
ve oyun biter. Kesin olasılık eğrisi denge testleriyle belirlenecek.

## 12. Haberler, devrim ve rejim kararları

- Haberler her gün değil, yaklaşık **2–4 günde bir** gelir.
- Oyuncu yatağın ardından koridora çıktığında oturma odası kapısında ünlem
  işareti görür; odaya girince ünlem televizyonda görünür.
- Televizyonda rejimin yeni kararları, kısıtlamalar, ekonomik değişiklikler ve
  kaçan kötü müşteriler gösterilebilir.
- Haber ekranda gösterildiği sabah yürürlüğe girer.
- Kararlar kredi kurallarını, yasakları, fiyatları, ürün bulunabilirliğini,
  aile ihtiyaçlarını ve müşteri davranışlarını değiştirebilir.
- Oyuncunun televizyonu izlemeyi atlayıp atlayamayacağı ve atlıyorsa kuralları
  nasıl öğreneceği henüz kararlaştırılmadı.

## 13. Zorluk seviyeleri

Seviyeler:

- Kolay
- Orta
- Zor
- İmkânsız

Zorluğun değiştireceği başlıca değerler:

- Başlangıç parası
- En kolay modda günlük ek para
- Aile isteklerinin sıklığı ve büyüklüğü
- Yalancı müşterilerin oranı
- Yalanların ve belgelerdeki tutarsızlıkların fark edilme güçlüğü
- Müşterilerin ikna kabiliyeti
- Stresin artış hızı ve akıl sağlığına etkisi
- Günler ilerledikçe zorluk artışının hızı

Oyuncu ilerlemeyi seviye veya bölüm numarasından değil, hayatta kaldığı gün
sayısından ve giderek ağırlaşan koşullardan hisseder.

## 14. Müşteri çeşitliliği ve içerik üretimi

“30 kişilik” sabit bir kadro hedeflenmiyor. Bunun yerine çok sayıda kimlik,
kişilik, memleket, meslek, gelir, ihtiyaç, kredi amacı ve gizli niyet birleşimi
üretilecek. Aynı meslekten veya aynı memleketten iki kişi farklı konuşabilir,
farklı miktar isteyebilir ve farklı gerçeğe sahip olabilir.

Her müşteri kaydı en az şu katmanlara sahip olmalı:

- Kalıcı kimlik bilgileri
- Görünen başvuru dosyası
- Gizli gerçek ve geri ödeme sonucu
- Oyuncunun bulabileceği tutarlı ipuçları
- Kişilik ve konuşma biçimi
- Hazır soru-cevapları
- Yapay zekâ rol bilgileri
- Portre, ifade ve animasyon bilgileri
- Haberlerde kullanılabilecek olay sonucu

Tekrara düşmemek için sabit elle yazılmış özel müşteriler ile kontrollü
bileşimlerden oluşan müşteriler birlikte kullanılabilir. Aynı şablonun yalnızca
adı değiştirilerek yeniden sunulması yeterli sayılmaz.

## 15. Temel tasarım kuralları

1. Müşterinin gizli gerçeği yapay zekâdan bağımsız ve değiştirilemezdir.
2. Yanlış kararın nedeni sonradan anlaşılabilir olmalıdır; tamamen rastgele
   cezalandırma yapılmamalıdır.
3. Gerçek yapay zekâ daha doğal ama zaman ve olası kullanım maliyeti açısından
   daha pahalı bir seçenektir; hazır diyalog daha kontrollü ve hızlıdır.
4. Banka parası ile oyuncunun kişisel parası birbirine karıştırılmaz.
5. Doğruluk, maaşta salt müşteri hızından daha değerlidir.
6. Akşam zamanı donuktur; bankaya dönülemez ve yeni gün yalnız yataktan başlar.
7. Aile banka işine karışmaz ve oyuncuya mekanik gelir/fayda üretmez.
8. Casino uzun vadeli güvenilir para kazanma yolu değildir.
9. Rejim kararları haberde gösterildiği sabah etkili olur.
10. Oyunun ana skoru hayatta kalınan gün sayısıdır.

## 16. Önerilen geliştirme sırası

### Aşama 0 — Tasarım kilidi

- Oyunun adı, tonu ve görsel dönemi
- Kesin maaş formülü
- Müşteri sonuç/puan tablosu
- Stres ve akıl sağlığı sayı yönleri
- Üç günlük zar olasılıkları
- Rüşvet risk tablosu
- İlk rejim kararları ve temel ekonomi tablosu
- İlk müşteri, aile ihtiyacı ve haber içerik şemaları

### Aşama 1 — Hazır diyaloglu dikey dilim

- Splash, menü, ayarlar ve yeni oyun
- Sokak, ev koridoru, yatak odası ve banka
- Uyuma animasyonu ve kesin günlük saat döngüsü
- Tek vardiya, birkaç kredi müşterisi, onay/red damgası
- Geri ödeme ve gün sonu performans ekranı
- Yerel kayıt ve yeniden açılış doğrulaması

Bu aşamada gerçek yapay zekâ olmadan ana oyunun eğlenceli ve anlaşılır olduğu
kanıtlanmalı.

### Aşama 2 — Aile ve ekonomi

- Beş aile üyesi
- İstek, hastalık, ilaç, mutsuzluk, ayrılma ve ölüm olayları
- Para, stres ve akıl sağlığı bağlantısı
- Eczane, büfe/tekel, bar ve temel satın alımlar

### Aşama 3 — Rejim ve sonsuz gün yapısı

- Televizyon haberleri
- Yeni kurallar, kısıtlamalar, fiyat ve kıtlık değişimleri
- Günle birlikte yükselen müşteri zorluğu
- Üç günlük zar ve oyun sonu
- Gün rekoru

### Aşama 4 — Gerçek yapay zekâ görüşmesi

- Sistem gereksinimi kontrolü
- Serbest yazılı konuşma
- Müşteri kimliğine kilitli rol yapma
- Süre akarken yanıt üretimi
- Mesaj ve maliyet sınırı
- Hazır diyaloga güvenli geri dönüş
- Kutarya Us ve ileride başka modeller için ortak bağlantı katmanı

### Aşama 5 — İçerik ve denge

- Çok sayıda müşteri bileşimi ve özel müşteri
- Dört zorluk seviyesinin ayrı dengesi
- Tekrar, haksız ipucu, kolay ezber ve gelir açıklarının test edilmesi
- Casino, rüşvet ve aile ekonomisinin sömürülebilir döngülerinin kapatılması

### Aşama 6 — Yayın

- Electron Windows paketi
- Temiz kurulum, güncelleme ve kayıt taşıma testleri
- Kutarya Studio marka dönüşümü
- `kutarya.com` oyun tanıtım ve indirme sayfası
- Sistem gereksinimleri ve yapay zekâ özelliğinin açık açıklaması

Kullanıcı görsel olarak denemeden canlı yayın/deploy yapılmayacak.

## 17. Henüz cevaplanmamış önemli kararlar

- Oyunun adı nedir?
- Görsel dönem ve teknoloji seviyesi nedir?
- Temel ton tamamen ciddi mi, kara mizah mı, yoksa ikisinin dengesi mi?
- Maaşta doğruluk ile işlenen müşteri sayısının kesin formülü nedir?
- Bir vardiyada müşteri geliş aralığı ve olası maksimum sayı nedir?
- İyi müşteriyi reddetme ve kötü müşteriyi onaylamanın puan ağırlıkları eşit mi?
- Onaylanan kredinin geri ödeme günü nasıl belirlenir?
- Haberlerde kaçak müşterinin görünmesi kaç gün sürer?
- Aile üyelerinin kişilikleri, odaları ve temel ihtiyaçları nelerdir?
- Akıl sağlığı göstergesi hangi yönde çalışır ve kalıcı hasar geri dönebilir mi?
- Yüzde 80 sonrası zar olasılığı hangi tabloyla artar?
- Rüşvette ikinci, üçüncü ve dördüncü kabulün kesin riskleri nedir?
- Sabah televizyonu izlenmeden bankaya gidilebilir mi?
- Casino oyunlarının bahis sınırları ve olasılıkları nedir?
- Otomatik kayıt, kayıt yuvası ve oyun sonrasında kaydın durumu nedir?
- Gerçek yapay zekâ yerel mi, uzak API üzerinden mi, yoksa ikisini de mi destekler?
- Mesaj sınırı kaç oyuncu mesajıdır ve yapay zekâ seçeneğinin asgari sistemi nedir?
