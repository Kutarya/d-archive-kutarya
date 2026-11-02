# Kutarya Us tünel kararı

Mevcut Quick Tunnel ücretsiz ve kurulumu basit; fakat adres her başlangıçta
değişir, PC/başlatma betiğine bağlıdır ve üretim SLA'sı yoktur.

Önerilen kalıcı çözüm Cloudflare Named Tunnel + Kutarya alan adında sabit DNS
kaydıdır. Böylece istemci adresi değişmez, erişim anahtarı yalnız hizmet
makinesinde tutulur ve sağlık kontrolü sabit bir URL'yi izler. Alternatif olarak
Cloud Run'a doğrudan model taşımak süreklilik sağlar fakat GPU/maliyet ve yerel
model veri sınırı nedeniyle bugün daha pahalıdır.

Geçiş için Cloudflare hesap erişimi, alan adı seçimi ve tünel belirteci gerekir.
Bu üçü olmadan mevcut çalışan Quick Tunnel kaldırılmaz. Geçişte önce yeni sabit
uç paralel açılır, Cloud Run'dan sağlık/sohbet testi yapılır, sonra istemci
yapılandırması değiştirilir; sorun halinde eski başlatma betiği geri açılır.

