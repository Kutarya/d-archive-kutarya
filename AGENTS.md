# Kutarya — asistan talimatı

**Bu depoda iş yapmadan önce `DEVIR.md` dosyasını oku.**

**Her görevin sonunda `DEVIR.md`'yi güncelle** — sahibin kalıcı talimatı.
Yeni öğrendiğin tuzak, değişen yayın akışı, yarım kalan iş oraya yazılır.
Burada yazmayan bilgi kaybolur; projede birden çok asistan çalışıyor ve
hiçbiri ötekinin özel notlarını göremiyor.

Orada sistemin nasıl çalıştığı, nasıl yayınlandığı ve daha önce saatler
kaybettirmiş tuzaklar var. Tuzakların hepsi gerçekten yaşandı; hiçbiri teorik
değil ve çoğu **sessizce** başarısız oluyor (hata vermiyor, sadece çalışmıyor).

## Kısa hatırlatmalar

- Kullanıcı Türkçe konuşur; kod yorumları da Türkçedir. Aynı dilde devam et.
- Kullanıcıya görünen model adı **her zaman "Kutarya Us"**. `kty-us` yalnız
  kod içi kimliktir.
- Deploy öncesi iki test takımını da çalıştır:
  `KutaryaAIWeb/server` (385) ve `KutaryaDesktop` (102).
- Düzenli ifadelerde `\b` Türkçe harflerde çalışmaz. JS dosyalarını Python ile
  düzenleme. `.ps1` dosyaları UTF-8 BOM ister. (Ayrıntı: DEVIR.md §3)
- Kutarya Us'un sistem metnine kural eklemeden önce **A/B ölç** — küçük model
  emir kipini cevap olarak tekrarlıyor.
- Tahmin etme, ölç. Bu projede "olması gereken" ile "olan" sık sık ayrıştı.
