---
title: "Yeniden bağlanabilen gerçek zamanlı sohbet"
type: "system-guide"
canonical: "https://kutarya.com/sistemler/gercek-zamanli-sohbet"
publisher: "Kutarya"
language: "tr-TR"
category: "Web"
---

# Yeniden bağlanabilen gerçek zamanlı sohbet

WebSocket mesaj sözleşmesi, sunucu doğrulaması, istemci bağlantı durumu ve tekrar mesaj koruması.

**Kategori:** Web
**Teknoloji yığını:** TypeScript, Node.js, WebSocket
**Seviye:** İleri
**Okuma süresi:** 26 dk

## Sonuç

Kimlikli mesajları yayınlayan, bozuk veriyi reddeden ve bağlantı kesilince kontrollü yeniden deneyen sohbet çekirdeği.

## Ön koşullar

- Node.js 20 veya üzeri
- TypeScript temeli
- WebSocket yaşam döngüsü bilgisi

## Dosya ağacı

```text
realtime-chat/
  src/server.ts
  public/index.html
  public/client.js
  package.json
  tsconfig.json
```

## Kurulum

npm init -y
npm install ws zod
npm install -D typescript tsx @types/ws serve
npx tsc --init
npx tsx src/server.ts
npx serve public -l 3000

## src/server.ts

Sunucu istemciden gelen JSON’a güvenmez. Şema doğrulamasından geçen mesaja sunucu zamanı eklenir ve açık bağlantılara yayınlanır.


```typescript
import { WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

const Incoming = z.object({
  id: z.string().uuid(),
  author: z.string().trim().min(1).max(40),
  text: z.string().trim().min(1).max(2000),
});

const server = new WebSocketServer({ port: 8080 });
const seen = new Set<string>();

server.on("connection", (socket) => {
  socket.on("message", (raw) => {
    const parsed = Incoming.safeParse(JSON.parse(raw.toString()));
    if (!parsed.success || seen.has(parsed.data.id)) return;
    seen.add(parsed.data.id);

    const message = JSON.stringify({
      ...parsed.data, sentAt: new Date().toISOString()
    });

    for (const client of server.clients)
      if (client.readyState === WebSocket.OPEN) client.send(message);
  });
});
```

## public/index.html

Klavye ile gönderilebilen küçük istemci kabuğu. Kullanıcı mesajları HTML olarak birleştirilmez; client.js metni textContent ile ekler.


```html
<!doctype html>
<html lang="tr">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gerçek Zamanlı Sohbet</title>
<main>
  <h1>Sohbet</h1>
  <p id="status" role="status">Bağlanıyor…</p>
  <ul id="messages" aria-live="polite"></ul>
  <form id="composer">
    <label>Kullanıcı <input id="author" maxlength="40" required></label>
    <label>Mesaj <input id="text" maxlength="2000" required></label>
    <button>Gönder</button>
  </form>
</main>
<script type="module" src="client.js"></script>
</html>
```

## public/client.js

Üstel gecikme bağlantı kopunca sunucuyu sürekli istekle boğmaz. Metin DOM’a textContent ile eklenir.


```javascript
let retry = 0;
let socket;

function connect() {
  socket = new WebSocket("ws://localhost:8080");
  socket.addEventListener("open", () => {
    retry = 0;
    document.querySelector("#status").textContent = "Bağlandı";
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const item = document.createElement("li");
    item.textContent = `${message.author}: ${message.text}`;
    document.querySelector("#messages").append(item);
  });
  socket.addEventListener("close", () => {
    const delay = Math.min(1000 * 2 ** retry++, 30000);
    window.setTimeout(connect, delay);
  });
}

document.querySelector("#composer").addEventListener("submit", (event) => {
  event.preventDefault();
  if (socket.readyState !== WebSocket.OPEN) return;
  const author = document.querySelector("#author").value;
  const input = document.querySelector("#text");
  socket.send(JSON.stringify({ id: crypto.randomUUID(), author, text: input.value }));
  input.value = "";
});

connect();
```

## Çalışma kontrolleri

1. İki sekmede mesaj aynı kimlikle bir kez görünmeli
2. Bozuk JSON sunucuyu kapatmamalı
3. Bağlantı kesilip açıldığında istemci yeniden bağlanmalı
4. HTML içeren mesaj kod olarak çalışmamalı

## Hata ayıklama tablosu

| Belirti | Olası neden | Kontrol | Düzeltme |
| --- | --- | --- | --- |
| WebSocket closes immediately | Yanlış ws/wss protokolü veya proxy yükseltmesi eksik. | Tarayıcı Network > WS kapanış kodunu incele. | HTTPS sayfada wss kullan ve proxy Upgrade başlıklarını geçir. |
| Mesaj iki kez görünüyor | İstemci yeniden gönderdi ve sunucu kimlik ayıklamadı. | Aynı mesaj id değerlerini günlükle. | Sunucuda idempotency/seen kaydı tut. |
| Tarayıcı donuyor | Kapanan bağlantı gecikmesiz döngüyle yeniden açılıyor. | Bağlantı deneme sayısını ölç. | Üstel gecikme ve üst sınır ekle. |

## Genişletme noktaları

- Oda üyeliği ve yetki denetimi
- Kalıcı mesaj geçmişi
- Teslim edildi ve okundu durumu
- Hız sınırı ve kötüye kullanım denetimi

---
Canonical: https://kutarya.com/sistemler/gercek-zamanli-sohbet
