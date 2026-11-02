// Ağdan gelen yalnız niyettir; kimlik, sıra, kart ve puan sunucudan gelir.
import { randomBytes, randomInt } from 'node:crypto';
import { BlackjackTable, BJ_VERSION, TABLE_MS, playerName } from './rules.mjs';
export function createGateway(options = {}) {
  const rooms = new Map(), clients = new Set(), now = options.now || Date.now;
  const makeToken = options.token || (() => randomBytes(24).toString('hex'));
  const random = options.random || randomInt;
  const send = (ws, message) => {
    if (ws.readyState !== 1) return;
    if (ws.bufferedAmount > 32768) { ws.close(1013, 'Bağlantı yavaşladı'); return; }
    ws.send(JSON.stringify(message));
  };
  function broadcast(record) {
    record.game.ensureHost();
    for (const [id, ws] of record.sockets) send(ws, { type: 'state', room: record.game.snapshot(id, now()) });
  }
  function list(ws) {
    send(ws, { type: 'rooms', rooms: [...rooms.values()].filter(({ game: g }) => g.public && g.phase === 'lobby' && g.players.some(p => p.connected) && g.players.length < g.max).map(({ game: g }) => ({ code: g.code, name: g.players.find(p => p.id === g.host)?.name || 'Masa', count: g.players.filter(p => p.connected).length, max: g.max })).slice(0, 30) });
  }
  function attach(ws, record, token) {
    let p;
    if (token) {
      const id = [...record.tokens].find(([, saved]) => saved === token)?.[0];
      if (!id) throw Error('Oturum süresi doldu. Odaya yeniden katıl.');
      p = record.game.reconnect(id, now());
    } else { p = record.game.add(ws.profile, now()); token = makeToken(); record.tokens.set(p.id, token); }
    ws.room = record; ws.actor = p.id; record.sockets.set(p.id, ws);
    send(ws, { type: 'joined', id: p.id, token, room: record.game.snapshot(p.id, now()) }); broadcast(record);
  }
  function create(settings) {
    if (rooms.size >= 30) throw Error('Masalar dolu. Biraz sonra tekrar dene.');
    let code; do { code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[random(32)]).join(''); } while (rooms.has(code));
    const record = { game: new BlackjackTable(code, settings, { random, now: now(), ...options.dependencies }), tokens: new Map(), sockets: new Map() };
    rooms.set(code, record); return record;
  }
  function leave(ws) {
    const r = ws.room; if (!r) return;
    r.sockets.delete(ws.actor); r.tokens.delete(ws.actor); r.game.disconnect(ws.actor, now(), true);
    ws.room = null; ws.actor = null; send(ws, { type: 'left' });
    if (!r.game.players.some(p => p.connected)) rooms.delete(r.game.code); else broadcast(r);
  }
  function connect(ws) {
    if (clients.size >= 150) { ws.close(1013, 'Servis dolu'); return false; }
    clients.add(ws); ws.connectedAt = now(); ws.messageWindow = now(); ws.messageCount = 0; ws.profile = ''; ws.room = null; ws.actor = null; return true;
  }
  function receive(ws, raw) {
    if (!clients.has(ws)) return;
    if (String(raw).length > 1536) { ws.close(1009, 'Mesaj çok büyük'); return; }
    if (now() - ws.messageWindow >= 1000) { ws.messageWindow = now(); ws.messageCount = 0; }
    if (++ws.messageCount > 20) { ws.close(1008, 'Çok fazla mesaj'); return; }
    let m;
    try { m = JSON.parse(String(raw)); if (!m || typeof m !== 'object' || Array.isArray(m)) throw Error(); }
    catch { ws.close(1008, 'Geçersiz mesaj'); return; }
    try {
      if (m.type === 'hello') {
        if (ws.profile) throw Error('Oturum zaten açık.');
        if (m.version !== BJ_VERSION) throw Error('Oyun güncellendi. Sayfayı yenile.');
        ws.profile = playerName(m.name); send(ws, { type: 'hello', version: BJ_VERSION }); list(ws); return;
      }
      if (!ws.profile) throw Error('Önce bağlantıyı kur.');
      if (m.type === 'ping') { if (Number.isFinite(m.at)) send(ws, { type: 'pong', at: m.at }); return; }
      if (m.type === 'list') { list(ws); return; }
      if (m.type === 'profile') {
        const name = playerName(m.name); if (ws.room) { ws.room.game.profile(ws.actor, name); broadcast(ws.room); }
        ws.profile = name; return;
      }
      if (['create', 'join', 'resume', 'quick'].includes(m.type)) {
        if (ws.room) throw Error('Önce masadan ayrıl.');
        let r;
        if (m.type === 'create') r = create({ max: m.max, public: m.public === true });
        else if (m.type === 'quick') r = [...rooms.values()].find(({ game: g }) => g.public && g.phase === 'lobby' && g.players.some(p => p.connected) && g.players.length < g.max) || create({ max: 5, public: true });
        else {
          if (!/^[A-HJ-NP-Z2-9]{6}$/.test(String(m.code || ''))) throw Error('6 karakterli masa kodunu yaz.');
          r = rooms.get(m.code); if (!r) throw Error('Masa bulunamadı veya kapanmış.');
        }
        if (m.type === 'resume' && (typeof m.token !== 'string' || !/^[a-f0-9]{48}$/.test(m.token))) throw Error('Geçersiz geri dönüş oturumu.');
        attach(ws, r, m.type === 'resume' ? m.token : null); return;
      }
      if (m.type === 'leave') { leave(ws); list(ws); return; }
      if (!ws.room) throw Error('Önce bir masaya katıl.');
      const r = ws.room, g = r.game;
      if (m.type === 'bet') g.bet(ws.actor, m.amount);
      else if (m.type === 'ready') g.ready(ws.actor, m.ready);
      else if (m.type === 'start') g.start(ws.actor, now());
      else if (m.type === 'next') g.next(ws.actor);
      else if (m.type === 'topup') g.topup(ws.actor);
      else if (m.type === 'action') g.action(ws.actor, m.action, m.turnId, now());
      else if (m.type === 'reaction') {
        if (!['wave', 'clap', 'luck', 'wow'].includes(m.reaction) || now() - (ws.reactedAt || 0) < 1800) return;
        ws.reactedAt = now(); for (const peer of r.sockets.values()) send(peer, { type: 'reaction', id: ws.actor, reaction: m.reaction }); return;
      } else throw Error('Bilinmeyen işlem.');
      broadcast(r);
    } catch (error) { send(ws, { type: 'error', message: error.message }); if (ws.room) broadcast(ws.room); }
  }
  function close(ws) {
    clients.delete(ws);
    const r = ws.room;
    if (r && r.sockets.get(ws.actor) === ws && r.game.players.some(p => p.id === ws.actor)) {
      r.sockets.delete(ws.actor); r.game.disconnect(ws.actor, now()); broadcast(r);
    }
  }
  function tick() {
    for (const ws of clients) if (!ws.profile && now() - ws.connectedAt > 10000) ws.close(1008, 'Oturum başlamadı');
    for (const [code, r] of rooms) {
      if (now() - r.game.createdAt >= TABLE_MS) {
        for (const ws of r.sockets.values()) { send(ws, { type: 'expired', message: 'Masanın 45 dakikalık süresi doldu. Yeni masa aç.' }); ws.room = null; ws.actor = null; }
        rooms.delete(code); continue;
      }
      const before = r.game.revision; r.game.tick(now());
      for (const id of r.tokens.keys()) if (!r.game.players.some(p => p.id === id)) r.tokens.delete(id);
      if (!r.game.players.length) rooms.delete(code); else if (before !== r.game.revision) broadcast(r);
    }
  }
  return { connect, receive, close, tick, list, rooms, clients };
}
