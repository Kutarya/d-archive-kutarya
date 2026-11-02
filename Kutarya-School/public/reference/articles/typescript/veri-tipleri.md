---
title: "TypeScript Tür Sistemi, Union ve Narrowing"
type: "technical-article"
canonical: "https://kutarya.com/konu/typescript/veri-tipleri"
publisher: "Kutarya"
language: "tr-TR"
technology: "TypeScript"
date_published: "2026-09-20"
date_modified: "2026-09-20"
is_accessible_for_free: true
---

# TypeScript Tür Sistemi, Union ve Narrowing

TypeScript tür sistemi, union, unknown, narrowing, discriminated union ve çalışma zamanı veri doğrulaması arasındaki sınır.

**Canonical:** https://kutarya.com/konu/typescript/veri-tipleri
**Yayıncı:** Kutarya
**Yayın tarihi:** 2026-09-20
**Son güncelleme:** 2026-09-20
**Teknoloji:** TypeScript
**Referans kapsamı:** Güncel TypeScript Handbook ve JavaScript runtime davranışı.

## Özet

TypeScript çalışma zamanını değiştiren yeni bir runtime değil, JavaScript kodunu çalışmadan önce analiz eden statik tür denetleyicisidir. Türler API sözleşmesini görünür kılar fakat dışarıdan gelen veriyi çalışma zamanında otomatik doğrulamaz.

TypeScript türleri derleme sırasında denetlenir ve çalışma zamanında dış verinin gerçekten belirtilen şemaya uyduğunu kanıtlamaz. API, localStorage veya URL gibi güven sınırlarında runtime validation ayrı bir sorumluluktur.

unknown bu ayrımı görünür kılar; any ise tür denetimini devre dışı bırakarak belirsizliği sessizce uygulamanın içine taşır. Discriminated union ise state modelinde geçersiz kombinasyonları azaltmak için kullanılır.

## Kapsam maddeleri

- Type inference ile annotation dengesini kurmak
- Union türleri modellemek
- unknown veriyi güvenle daraltmak
- any kullanımını azaltmak

## Temel kavramlar

### Inference

Derleyici birçok değerin türünü açık annotation olmadan çıkarabilir.

### Union

Bir değerin sınırlı birden fazla türden biri olabileceğini ifade eder.

### Narrowing

typeof, in, equality veya özel type guard ile union daha özel türe indirgenir.

## Teknik açıklama

### Türler yalnız compile time’da yaşar

TypeScript tip anotasyonları JavaScript çıktısında çoğunlukla silinir. Bu yüzden bir API response’unu User diye annotate etmek, sunucunun gerçekten o şekli döndürdüğünü kanıtlamaz.

Güven sınırlarında — network, localStorage, URL parametresi, kullanıcı girdisi — runtime doğrulama hâlâ gerekir. TypeScript doğrulanan verinin uygulama içinde güvenli taşınmasını kolaylaştırır.

- Compile-time tür ile runtime veri ayrımını koru.
- Dış veriye kör cast yapma.
- Doğrulamayı sınırda yap.

### unknown, any’den daha güvenli bilinmezliktir

any, tür denetimini o değer çevresinde büyük ölçüde devre dışı bırakır. unknown ise “bu değerin ne olduğunu henüz bilmiyorum” der ve kullanmadan önce kanıt ister.

Bu zorunluluk özellikle JSON ve third-party veriyle çalışırken hatayı derleme zamanında görünür kılar.

- Bilinmeyen dış veride unknown tercih et.
- Guard ile türü daralt.
- as cast’i kanıt yerine kullanma.

### Discriminated union state modelini güçlendirir

Loading, success ve error durumlarını bağımsız boolean ve nullable alanlarla tutmak geçersiz kombinasyonlar üretebilir. Tek bir status alanına bağlı union, yalnız geçerli state şekillerini temsil eder.

Bu yaklaşım switch içinde exhaustive kontrol yapmayı ve eksik durumları derleyicide yakalamayı kolaylaştırır.

- Geçersiz state’i tür seviyesinde azalt.
- Ortak discriminant alanı kullan.
- Exhaustive switch kontrolü ekle.

## Teknik iddialar ve kaynak notları

### Static type checking sınırı

TypeScript JavaScript’e derlenmeden önce tür hatalarının önemli bölümünü yakalar ancak tür bilgisi varsayılan olarak çalışma zamanında mevcut değildir. Dış API, localStorage veya kullanıcı girdisi gibi veriler type annotation yazıldığı için doğrulanmış olmaz; çalışma zamanı doğrulaması ayrıca gerekir.

**Birincil referans:** [1]

### unknown ve narrowing

unknown, any’den farklı olarak değer kullanılmadan önce türün daraltılmasını gerektirir. typeof, in, discriminant alanları ve kullanıcı tanımlı type guard’lar kontrol akışı içinde daha kesin tür elde edilmesini sağlar. Bu yaklaşım güvenilmeyen sınır verilerinde doğrudan assertion kullanmaktan daha güçlüdür.

**Birincil referans:** [2]

## Sınır durumları

- as ifadesi runtime conversion yapmaz; yalnız derleyiciye iddia sunar.
- Optional property ile property: T | undefined aynı kullanım sonuçlarına yakın olsa da nesne şekli semantiği farklı olabilir.
- Structural typing nedeniyle farklı domain kavramları aynı şekle sahipse istemeden uyumlu kabul edilebilir.
- Discriminated union’da her varyant benzersiz ve literal discriminator taşımazsa exhaustive checking zayıflar.

## Uygulama vakası

### API response’a as ile güvenildiğinde production hatası

**Bağlam**

Frontend fetch sonucunu `as User` ile işaretler. Backend bir release’te profile alanını opsiyonel hâle getirir. TypeScript derlemesi geçer çünkü assertion veri doğrulaması yapmaz; UI `user.profile.name` satırında runtime TypeError üretir.

**Teknik analiz**

Network sınırı unknown olarak alınır ve schema validator/type guard ile daraltılır. Hata payload’ı, eski API sürümü ve geçerli payload ayrı sonuçlara dönüştürülür. İç uygulama kodu yalnız doğrulanmış User tipini alır.

**Beklenen sonuç**

Contract değişimi runtime’ın derin bir noktasında değil veri giriş sınırında yakalanır. Validation failure metriği backend deploy’larıyla korele edilebilir hâle gelir.

### İzlenecek sinyaller

- Runtime schema failure oranı
- any/as kullanım noktaları
- API contract testleri
- Discriminated union exhaustive check hataları

## Kod ve çalışma akışı

### unknown API verisini daralt


```typescript
type User = {
  id: number;
  name: string;
};

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;
  return typeof record.id === 'number'
    && typeof record.name === 'string';
}

function readUser(value: unknown): User {
  if (!isUser(value)) throw new Error('Geçersiz kullanıcı verisi');
  return value;
}
```

1. Dış veri any yerine unknown kabul edilir.
2. Runtime kontrolleri type guard içinde yapılır.
3. Guard başarılı olduğunda TypeScript türü User olarak daraltır.
4. Geçersiz veri sınırda reddedilir.

## Tasarım seçenekleri

### Schema validator

Büyük veri şemalarında elle type guard yerine Zod benzeri runtime doğrulayıcılar değerlendirilebilir.

### Discriminated union

Birden fazla durum modelinde ortak kind/type alanı üzerinden güvenli kontrol akışı sağlar.

## Arıza biçimleri

### Object is possibly undefined

- **Olası neden:** Tür sistemi değerin her kontrol akışında bulunduğunu kanıtlayamıyor.
- **Teşhis / düzeltme:** Gerçek bir guard ekle; gereksiz non-null assertion ile uyarıyı susturma.

### Property does not exist on type

- **Olası neden:** Union yeterince daraltılmadan türe özel alan kullanılıyor.
- **Teşhis / düzeltme:** typeof/in/discriminant ile doğru branch’i kanıtla.

## Üretim ve işletim notları

- Güvenilmeyen sınırda unknown + runtime validator kullan.
- Domain kimlikleri için gerektiğinde branded/opaque type yaklaşımını değerlendir.
- Compiler strict seçeneklerini proje başında bilinçli seç.
- Public type tanımlarını gerçek API payload örnekleri ve contract testleriyle senkron tut.

## Birincil referanslar

1. [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
2. [TypeScript Handbook — Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Doğrulama senaryoları

- Success/error için discriminated union tasarla.
- JSON.parse sonucunu unknown kabul edip doğrula.
- Projede bir any kullanımını unknown + guard ile değiştir.

## Üretim kontrol listesi

- [ ] Inference yeterliyken gereksiz annotation yok.
- [ ] any sınırlandırılmış.
- [ ] Dış veri runtime’da doğrulanıyor.
- [ ] Union durumlarının hepsi ele alınıyor.
- [ ] Non-null assertion istisna olarak kullanılıyor.

---
Bu dosya https://kutarya.com/konu/typescript/veri-tipleri sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.
