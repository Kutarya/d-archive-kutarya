import http from 'node:http';
import { WebSocketServer } from 'ws';
import { createGateway } from './gateway.mjs';
import { BJ_VERSION } from './rules.mjs';

const gateway = createGateway(), ipCounts = new Map();
const allowed = new Set(['https://kutarya.com', 'https://www.kutarya.com', 'https://kutarya-ai-3169.web.app', 'https://kutarya-ai-3169.firebaseapp.com', 'null']);
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url !== '/health') { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, game: 'blackjack', version: BJ_VERSION, protocol: 1, maxPlayers: 5 }));
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 1536, perMessageDeflate: false });
server.on('upgrade', (req, socket, head) => {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (req.url !== '/play' || !allowed.has(req.headers.origin) || gateway.clients.size >= 150 || (ipCounts.get(ip) || 0) >= 12) {
    socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return;
  }
  wss.handleUpgrade(req, socket, head, ws => { ws.ip = ip; wss.emit('connection', ws); });
});
wss.on('connection', ws => {
  if (!gateway.connect(ws)) return;
  ipCounts.set(ws.ip, (ipCounts.get(ws.ip) || 0) + 1); ws.alive = true;
  ws.on('error', () => {}); ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => gateway.receive(ws, raw));
  ws.on('close', () => { gateway.close(ws); const count = (ipCounts.get(ws.ip) || 1) - 1; count ? ipCounts.set(ws.ip, count) : ipCounts.delete(ws.ip); });
});
setInterval(() => gateway.tick(), 200).unref();
setInterval(() => { for (const ws of gateway.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); } }, 20000).unref();
setInterval(() => { for (const ws of gateway.clients) if (ws.profile && !ws.room) gateway.list(ws); }, 5000).unref();
process.on('SIGTERM', () => { for (const ws of gateway.clients) ws.close(1012, 'Servis yenileniyor'); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 8000).unref(); });
server.listen(Number(process.env.PORT || 8080), '0.0.0.0');
