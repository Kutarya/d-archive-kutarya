---
title: "HTML Formları: Etiketleme, Doğrulama ve Erişilebilir Hata Mesajları"
type: "technical-article"
canonical: "https://kutarya.com/konu/html/formlar"
publisher: "Kutarya"
language: "tr-TR"
technology: "HTML"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# HTML Formları: Etiketleme, Doğrulama ve Erişilebilir Hata Mesajları

HTML formlarında label/fieldset semantiği, native validation, autocomplete, erişilebilir hata ilişkileri ve sunucu tarafı doğrulama sınırı.

**Canonical:** https://kutarya.com/konu/html/formlar
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** HTML
**Referans kapsamı:** Güncel HTML form davranışı ve MDN erişilebilirlik referansları.

## Özet

İyi form yalnız güzel input kutularından oluşmaz. Kullanıcı alanın ne istediğini, hangi formatın beklendiğini ve hata olduğunda nasıl düzelteceğini klavye veya yardımcı teknolojiyle de anlayabilmelidir.

Form erişilebilirliği yalnız aria eklemekle çözülmez; doğru input türü, görünür label, fieldset/legend gruplaması ve hata mesajının ilgili alanla ilişkilendirilmesi temel HTML semantiğidir.

İstemci doğrulaması kullanıcı deneyimini iyileştirir ancak güvenlik ve veri bütünlüğü için sunucu tarafındaki doğrulamanın yerini alamaz. Makale bu iki katmanın sorumluluklarını ayrı tutar.

## Kapsam maddeleri

- Form alanına kalıcı erişilebilir ad vermek
- İlişkili alanları fieldset ile gruplamak
- Doğrulama mesajını alanla bağlamak
- Doğru input type ve autocomplete seçmek

## Temel kavramlar

### label

Kontrolün görünür adını sağlar; for değeri input id’siyle eşleştirilebilir.

### fieldset/legend

Birbiriyle ilişkili seçenek grubunun ortak anlamını belirtir.

### autocomplete

Tarayıcı ve parola yöneticilerine alanın semantik amacını anlatır.

## Teknik açıklama

### Placeholder bir label değildir

Placeholder kullanıcı yazmaya başlayınca kaybolur ve çoğu tasarımda düşük kontrastlı ipucu gibi görünür. Alanın kalıcı adı için görünür label daha güvenilir bir yapıdır.

Label’a tıklamak ilgili input’u odaklar; bu da küçük kontrol hedeflerinde kullanılabilirliği artırır.

- Kalıcı görünür label kullan.
- Placeholder’ı örnek/ipuçları için ayır.
- for/id eşleşmesini kontrol et.

### Doğrulama UX ile güvenliği ayır

Browser veya JavaScript doğrulaması kullanıcıya hızlı geri bildirim sağlar fakat istemci kontrolü atlanabilir. Sunucu gelen veriyi her zaman kendi kurallarıyla yeniden doğrulamalıdır.

Aynı kuralın mesajını iki tarafta tutarken tutarsızlık riskini azaltacak ortak şema veya API hata sözleşmesi düşün.

- Client validation güvenlik sınırı değildir.
- Server doğrulamasını zorunlu tut.
- Hata sözleşmesini tutarlı yap.

### Autocomplete kullanıcı hatasını ve süreyi azaltır

Doğru autocomplete token’ları tarayıcıya alanın e-posta, isim, adres veya parola gibi amacını açıklar. Bu özellikle mobil klavye ve parola yöneticileriyle form doldurmayı hızlandırır.

autocomplete="off" değerini her forma refleks olarak eklemek kullanıcı deneyimini ve parola yöneticilerini gereksiz yere bozabilir.

- Semantik autocomplete token kullan.
- Parola yöneticileriyle test et.
- Autofill’i sebepsiz kapatma.

## Teknik iddialar ve kaynak notları

### Yerel form semantiği

HTML form kontrolleri label ilişkisi, input type, name, required ve autocomplete gibi yerel mekanizmalar sunar. Görsel placeholder label yerine geçmez; label kontrolün erişilebilir adını ve tıklanabilir açıklamasını sağlar. İlişki explicit for/id veya uygun sarmalama ile kurulabilir.

**Birincil referans:** [2], [1]

### İstemci ve sunucu doğrulaması

Tarayıcının constraint validation özellikleri kullanıcıya erken geri bildirim sağlar fakat istemci tarafı her zaman değiştirilebilir veya atlanabilir. Yetkilendirme, veri bütünlüğü ve güvenlik kuralları sunucuda yeniden doğrulanmalıdır.

**Birincil referans:** [1]

## Sınır durumları

- disabled kontrol form submit’inde successful control olarak gönderilmez; readonly davranışı farklıdır.
- Birden fazla kontrol grubu fieldset/legend ile anlamlı ilişki kazanabilir.
- Hata mesajı yalnız renk ile verilmemeli ve ilgili input ile programatik ilişki kurulmalıdır.
- autocomplete kapatmak kullanıcı/parola yöneticisi davranışı ve erişilebilirlik üzerinde olumsuz etki yaratabilir.

## Uygulama vakası

### Placeholder tabanlı formun hata anında kullanılamaz hâle gelmesi

**Bağlam**

Giriş formunda görünür label yoktur; input yalnız placeholder taşır. Kullanıcı değer yazınca alanın ne olduğu görünmez. Sunucu hata döndürdüğünde kırmızı border eklenir fakat ekran okuyucu hangi alanın hatalı olduğunu veya hata metnini ilişkilendiremez.

**Teknik analiz**

Her input görünür label ile bağlanır. Hata metni input’a `aria-describedby` üzerinden ilişkilendirilir, invalid state uygun attribute ile belirtilir ve odak yönetimi form özetinden ilk hataya kontrollü yapılır. Sunucu doğrulaması aynı alan isimleriyle UI’a geri map edilir.

**Beklenen sonuç**

Form klavye, ekran okuyucu ve zoom senaryolarıyla test edilir. Hata durumunda kullanıcının girdiği geçerli alanlar korunur ve sorun yalnız renk ile ifade edilmez.

### İzlenecek sinyaller

- Form validation error field dağılımı
- Label/input association otomatik testleri
- Keyboard tab order
- Submit sonrası focus hedefi

## Kod ve çalışma akışı

### Erişilebilir kayıt alanı


```html
<div class="field">
  <label for="email">E-posta</label>
  <input
    id="email"
    name="email"
    type="email"
    autocomplete="email"
    aria-describedby="email-help email-error"
    required
  />
  <p id="email-help">Hesap bildirimleri için kullanılacak.</p>
  <p id="email-error" role="alert" hidden>
    Geçerli bir e-posta adresi gir.
  </p>
</div>
```

1. label görünür ve input ile id/for üzerinden bağlıdır.
2. type=email tarayıcıya giriş türünü anlatır.
3. autocomplete semantik amacı belirtir.
4. Yardım ve hata metni aria-describedby ile alanla ilişkilidir.

## Tasarım seçenekleri

### Native validation

Basit required/type/min/max kurallarında JavaScript yazmadan temel doğrulama sağlayabilir.

### Server validation

İstemci doğrulaması UX içindir; güvenlik ve veri bütünlüğü için sunucu her zaman yeniden doğrulamalıdır.

## Arıza biçimleri

### Input erişilebilir adı yok

- **Olası neden:** Placeholder label yerine kullanılmıştır.
- **Teşhis / düzeltme:** Görünür label ekle ve kontrolle ilişkilendir.

### Hata sadece kırmızı border ile gösteriliyor

- **Olası neden:** Renk dışındaki kullanıcılar nedenini ve çözümü alamıyor.
- **Teşhis / düzeltme:** Alan yanında metinsel hata mesajı ver ve programatik ilişki kur.

## Üretim ve işletim notları

- Her kontrol için kalıcı ve görünür label sağla.
- Doğru input type ve autocomplete token kullan.
- Sunucu hatalarını alan seviyesinde kullanıcı girdisini kaybetmeden geri bağla.
- Klavye, ekran okuyucu ve yüksek zoom senaryolarını form testine dahil et.

## Birincil referanslar

1. [MDN — Web forms](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms)
2. [MDN — label element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label)

## Doğrulama senaryoları

- Adres formuna uygun autocomplete değerleri ekle.
- Radio grubunu fieldset/legend ile düzenle.
- Sunucudan gelen field errors nesnesini ilgili alanlara bağla.

## Üretim kontrol listesi

- [ ] Her kontrolün görünür etiketi var.
- [ ] Placeholder tek etiket değil.
- [ ] Doğru input type seçilmiş.
- [ ] Autocomplete değerleri uygun.
- [ ] Hata renk dışında metinle açıklanıyor.
- [ ] Sunucu doğrulaması ayrıca var.

---
Bu dosya https://kutarya.com/konu/html/formlar sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
