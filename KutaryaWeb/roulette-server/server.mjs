// Bu servisin proje/veritabanı/sır erişimi yoktur; yalnız geçici oyun odaları.
import http from 'node:http';
import { randomBytes, randomInt } from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { DuelRoom, VERSION, ROOM_MS } from './rules.mjs';
import { ensureHost, capacity } from './lobby.mjs';

const rooms = new Map(), clients = new Set(), ipCounts = new Map();
const MAX_CLIENTS = 150, MAX_ROOMS = 30;
const allowed = new Set(['https://kutarya.com', 'https://www.kutarya.com', 'https://kutarya-ai-3169.web.app', 'https://kutarya-ai-3169.firebaseapp.com', 'null']);
const server = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url !== '/health') { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, game: 'rus-ruleti', version: VERSION, protocol: 1, maxPlayers: 6 }));
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 1536, perMessageDeflate: false });
const send = (ws, data) => {
  if (ws.readyState !== WebSocket.OPEN) return;
  if (ws.bufferedAmount > 32768) { ws.close(1013, 'Bağlantı yavaşladı'); return; }
  ws.send(JSON.stringify(data));
};
const roomState = record => ({ type: 'state', room: record.game.snapshot(Date.now()) });
function broadcast(record) { ensureHost(record.game); const state = roomState(record); for (const ws of record.sockets.values()) send(ws, state); }
function list() {
  return [...rooms.values()].filter(r => r.game.public && r.game.state === 'lobby' && r.game.active().length && r.game.players.size < r.game.max).slice(0, 30).map(({ game }) => ({ code: game.code, name: game.players.get(game.host)?.name || 'Oyuncu', count: game.active().length, max: game.max, quick: game.quick }));
}
function lobby(ws) { send(ws, { type: 'rooms', rooms: list(), online: [...clients].filter(c => c.profile).length, tables: rooms.size }); }
function create(settings) {
  if (rooms.size >= MAX_ROOMS) throw Error('Masalar şu an dolu. Biraz sonra tekrar dene.');
  let code; do { code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(32)]).join(''); } while (rooms.has(code));
  const record = { game: new DuelRoom(code, { ...settings, max: capacity(settings.max) }, Date.now(), randomInt, () => randomBytes(8).toString('hex')), tokens: new Map(), sockets: new Map() };
  rooms.set(code, record); return record;
}
function join(ws, record, resume) {
  if (ws.room) throw Error('Önce bulunduğun odadan ayrıl.');
  let p, token;
  if (resume) {
    const found = [...record.tokens].find(([, value]) => value === resume);
    if (!found) throw Error('Oturum süresi doldu. Odaya yeniden katıl.');
    p = record.game.reconnect(found[0], Date.now()); token = found[1];
  } else {
    p = record.game.add(ws.profile.name, ws.profile.color, Date.now());
    token = randomBytes(24).toString('hex'); record.tokens.set(p.id, token);
  }
  ws.room = record; ws.actor = p.id; record.sockets.set(p.id, ws);
  send(ws, { type: 'joined', id: p.id, token, room: record.game.snapshot(Date.now()) }); broadcast(record);
}
function leave(ws) {
  const record = ws.room;
  if (!record) return;
  record.game.remove(ws.actor, Date.now()); record.tokens.delete(ws.actor); record.sockets.delete(ws.actor);
  ws.room = null; ws.actor = null; send(ws, { type: 'left' });
  if (record.game.players.size) broadcast(record); else rooms.delete(record.game.code);
}
server.on('upgrade', (req, socket, head) => {
  // X-Forwarded-For, Cloud Run tarafından eklenir; yalnız eşzamanlı kötüye kullanım sınırı.
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (req.url !== '/play' || !allowed.has(req.headers.origin) || clients.size >= MAX_CLIENTS || (ipCounts.get(ip) || 0) >= 16) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
  wss.handleUpgrade(req, socket, head, ws => { ws.ip = ip; wss.emit('connection', ws); });
});
wss.on('connection', ws => {
  clients.add(ws); ipCounts.set(ws.ip, (ipCounts.get(ws.ip) || 0) + 1);
  ws.alive = true; ws.profile = null; ws.window = Date.now(); ws.messages = 0; ws.reactionAt = 0;
  const handshake = setTimeout(() => { if (!ws.profile) ws.close(1008, 'Oturum başlamadı'); }, 10000); handshake.unref();
  ws.on('error', () => {}); ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    const now = Date.now(); if (now - ws.window > 1000) { ws.window = now; ws.messages = 0; }
    if (++ws.messages > 20) { ws.close(1008, 'Çok fazla mesaj'); return; }
    let m;
    try { m = JSON.parse(raw.toString()); if (!m || typeof m !== 'object' || Array.isArray(m)) throw Error(); }
    catch { ws.close(1008, 'Geçersiz mesaj'); return; }
    try {
      if (m.type === 'hello') {
        if (ws.profile) throw Error('Oturum zaten açık.');
        if (m.version !== VERSION) throw Error('Oyun güncellendi. Sayfayı yenile.');
        ws.profile = { name: m.name, color: m.color }; clearTimeout(handshake);
        send(ws, { type: 'hello', version: VERSION }); lobby(ws); return;
      }
      if (!ws.profile) throw Error('Önce bağlantıyı kur.');
      if (m.type === 'profile') { if (!ws.room) ws.profile = { name: m.name, color: m.color }; return; }
      if (m.type === 'ping') { if (typeof m.at === 'number' && Number.isFinite(m.at)) send(ws, { type: 'pong', at: m.at }); return; }
      if (m.type === 'list') { lobby(ws); return; }
      if (['create', 'join', 'quick', 'resume'].includes(m.type)) {
        if (ws.room) throw Error('Önce bulunduğun odadan ayrıl.');
        let record;
        if (m.type === 'create') record = create({ public: m.public === true, max: m.max });
        else if (m.type === 'quick') record = [...rooms.values()].find(r => r.game.quick && r.game.state === 'lobby' && r.game.active().length && r.game.players.size < r.game.max) || create({ public: true, quick: true, max: 6 });
        else {
          if (!/^[A-HJ-NP-Z2-9]{6}$/.test(String(m.code || ''))) throw Error('6 karakterli oda kodunu yaz.');
          record = rooms.get(m.code); if (!record) throw Error('Oda bulunamadı veya kapanmış.');
        }
        join(ws, record, m.type === 'resume' ? m.token : null); return;
      }
      if (m.type === 'leave') { leave(ws); lobby(ws); return; }
      if (!ws.room) throw Error('Önce bir odaya katıl.');
      const record = ws.room, game = record.game;
      if (m.type === 'ready') game.ready(ws.actor, m.ready, now);
      else if (m.type === 'start') game.start(ws.actor, now);
      else if (m.type === 'rematch') game.rematch(ws.actor, now);
      else if (m.type === 'action') game.action(ws.actor, m.action, m.turnId, now);
      else if (m.type === 'reaction') {
        if (now - ws.reactionAt < 1800 || !['wave', 'fire', 'luck', 'wow'].includes(m.reaction)) return;
        ws.reactionAt = now; game.event('reaction', { player: ws.actor, reaction: m.reaction });
      } else throw Error('Bilinmeyen işlem.');
      broadcast(record);
    } catch (error) { send(ws, { type: 'error', message: error.message }); }
  });
  ws.on('close', () => {
    clearTimeout(handshake); clients.delete(ws); ipCounts.set(ws.ip, Math.max(0, (ipCounts.get(ws.ip) || 1) - 1));
    if (ipCounts.get(ws.ip) === 0) ipCounts.delete(ws.ip);
    if (ws.room) { ws.room.sockets.delete(ws.actor); ws.room.game.disconnect(ws.actor, Date.now()); broadcast(ws.room); }
  });
});
setInterval(() => {
  const now = Date.now();
  for (const [code, record] of rooms) {
    if (now - record.game.createdAt >= ROOM_MS) {
      for (const ws of record.sockets.values()) { send(ws, { type: 'expired', message: 'Bu masanın 45 dakikalık süresi doldu. Yeni bir oda aç.' }); ws.room = null; ws.actor = null; }
      rooms.delete(code); continue;
    }
    const previous = record.game.eventId, turnId = record.game.turnId;
    record.game.tick(now);
    for (const id of record.tokens.keys()) if (!record.game.players.has(id)) record.tokens.delete(id);
    if (!record.game.players.size) rooms.delete(code);
    else if (previous !== record.game.eventId || turnId !== record.game.turnId) broadcast(record);
  }
}, 100).unref();
setInterval(() => { for (const ws of clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); } }, 20000).unref();
setInterval(() => { for (const ws of clients) if (ws.profile && !ws.room) lobby(ws); }, 5000).unref();
process.on('SIGTERM', () => { for (const ws of clients) ws.close(1012, 'Servis yenileniyor'); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 8000).unref(); });
server.listen(Number(process.env.PORT || 8080), '0.0.0.0');
