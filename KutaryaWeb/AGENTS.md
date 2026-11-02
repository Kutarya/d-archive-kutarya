# KutaryaWeb — proje paylaşım platformu talimatları

Önce `DEVIR.md`, `SITE-PLANI.md` ve üst dizindeki `D:\Kutarya\DEVIR.md`
dosyalarını oku. Üst dizinin `AGENTS.md` talimatları da geçerlidir.

- Kullanıcı Türkçe konuşur; kullanıcı arayüzü ve yorumlar Türkçedir.
- 9 Ekim 2026 yönlendirmesi: ziyaretçi hesabı, kayıt, kişisel kütüphane ve
  favoriler şimdilik kaldırılır. **Admin paneli ve yalnız yönetici girişi
  korunur**; ortak Firebase hesapları/profilleri silinmez. Önceki zorunlu
  ziyaretçi login talebi bu yeni kapsamla değiştirilmiştir.
- Unity Web/WebGL ve web oyunları aynı katalogda desteklenecek.
- Güncel kapsam: oyunlar, .NET/masaüstü, HTML/CSS/JS web projeleri, mobil
  uygulamalar, kaynak kod ve araçlar. Açık tema varsayılan; sıcak, koyu ve
  sistem temaları seçenek. Kullanıcı kaldırılan dört örnek oyunu istemiyor;
  kataloğa yeni örnek veya sahte proje ekleme.
- Proje hedefi `kutarya.com`, dağıtım Firebase Hosting'dir. Güncel bağlı
  site/target ve ortak Auth projesini doğrulamadan deploy yapılandırması seçme.
- Eski AI kaynakları çalışma klasöründe yok; 4 Ekim incelemesinde kök Git HEAD
  üzerinden okunabildi. Sırları taşıma ve eski silmeleri geri alma.
- Eski hesap deneyimini, logo ve mail akışını kaynak/gerçek servis üzerinden
  doğrula. Özel kod doğrulaması ile Firebase parola sıfırlamasını aynı
  gönderim sistemi sanma. Auth/parola sırları istemciye yazılmaz.
- Admin yetkisini API ve veri kurallarıyla doğrula; e-posta listesi veya
  localStorage kontrolünü güvenlik sayma.
- Bu iş paylaşım sitesiyle sınırlı; eski AI/mobile servisleri ve PayTR'yi değiştirme.
- Plan, demo, çalışan uygulama ve canlı ölçümü birbirinden ayır. Başarı,
  oyuncu sayısı, performans veya test sonucu uydurma.
- Paket yükleme ile Hosting yayını farklıdır. İlk sürümde oyun dosyası yayını
  kontrollü CLI/operatör adımı; panel doğrulanmış sürüm seçer.
- İndirilebilir kurulum/kaynak paketleri panelden Storage'a yüklenir.
  Yerel Firestore/Storage kurallarını ortak canlı projeye topluca gönderme.
  Storage yayın önerisi mevcut kurallarla kapsamlı birleştirilir; ayrıntılar
  `docs/YAYIN.md`. Katalog yayını ve 9 Ekim ziyaretçi hesabı/kütüphane kaldırma
  Hosting yayını açık kullanıcı onayıyla tamamlandı; yeni yayınlar kendi
  kapsamları için onay ister. Güncel sürüm ve kabul `DEVIR.md` içindedir.
- Her görevin sonunda yerel `DEVIR.md` ve `D:\Kutarya\DEVIR.md` güncellenir.
