# Şube 17 — sahne etkileşimi devam kaydı

12 Eylül 2026. Devam eden görev: çalışan sistemlerin üzerine çizilmiş dünya etkileşimi.

## Korunan başlangıç

Yedek: `checkpoints/2026-09-12-scene-ux-baseline` (src, test, package ve raporlar).
`src/game/engine.js` SHA256: `63947A3ACF600AEB751649E6DA4DD0E5C432FFD02727B346D5762C9D4B8F55A4`.
Motor, SAVE_VERSION=1, kayıt modeli, gün/saat, ekonomi, aile durumları, kararlar ve sonuçlar değiştirilmeyecek. App'in mevcut onNavigate/onChange bağlantıları kullanılacak. Hiçbir proje sıfırlanmıyor.

## Gerçek mekân envanteri ve erişim dönüşümü

| Mekân | Mevcut sistem / hedef etkileşim | Durum |
|---|---|---|
| Sokak | 5 bina kapısı; büfe için fiziksel tezgâh, sonra hızlı menünün kaldırılması | Bekliyor |
| Ev / koridor | Dört oda kapısı ve dış kapı | Görsel hazırlanıyor |
| Ev / oturma odası | Leyla, Nermin; televizyon → mevcut haber | Hazırlanıyor |
| Ev / mutfak | Cemal; erzak dolabı → mevcut erzak sistemi | Görsel hazırlanıyor |
| Ev / yatak odası | Yatak → mevcut uyku; not → günlük bilgi | Görsel hazırlanıyor |
| Ev / çocuk odası | Elif, Deniz → mevcut konuşma/ihtiyaç | Görsel hazırlanıyor |
| Banka | Masa → mesai, müşteri/dosya → mevcut belge-görüşme, genelge, kapı | Bekliyor |
| Bar | Barmen/masa → mevcut akşam işlemi, kapı | Görsel hazırlanıyor |
| Eczane | Eczacı/ilaç → mevcut hasta tedavisi, kapı | Görsel hazırlanıyor |
| Mahalle büfesi | Esnaf/erzak → mevcut satın alma, kapı | Görsel hazırlanıyor |
| Kazino | Krupiye/masa → mevcut blackjack, kapı | Görsel hazırlanıyor |

Kaynakta başka oynanabilir lokasyon yok. Ayarlar, kayıt, son ekran ve mesai raporu mekân değildir; yardımcı UI olarak korunur. Telefon sistemi kaynakta yok; varmış gibi yeni mekanik eklenmeyecek.

## Devam noktası

Önce ortak SceneInteraction katmanı tamamlanacak. Ev ve yeni resimler bağımsız hazırlanıyor. Ardından bankanın ve üç dükkânın mevcut panelleri fiziksel hedeflerden açılacak. Eski menü yolları yeni yol doğrulandıktan sonra kaldırılacak.

Her büyük mekân için kod, tarayıcıda gerçek etkileşim, durum koşulu, kapı ve kapanıp sahneye dönüş ayrı doğrulanacak. Kodun yazılması tek başına tamamlandı sayılmaz.

## Kontroller

Başlangıç test/build tekrar çalıştırılıyor. Sonuçlar ve mekân kontrol kanıtları aşağıya eklenecek.
