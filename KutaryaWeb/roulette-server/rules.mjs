// Sunucu ve açıkça etiketlenmiş çevrimdışı antrenman aynı kuralları kullanır.
export const VERSION = '1.0.0';
export const TURN_MS = 25000;
export const RECONNECT_MS = 30000;
export const ROOM_MS = 45 * 60000;
export function cleanName(value) {
  return String(value || '').normalize('NFC').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 18) || 'Oyuncu';
}
export class DuelRoom {
  constructor(code, settings, now, random, makeId) {
    this.code = code; this.public = settings.public === true; this.quick = settings.quick === true;
    this.max = Math.max(2, Math.min(6, Number(settings.max) || 6));
    this.random = random; this.makeId = makeId; this.createdAt = now;
    this.players = new Map(); this.host = null; this.state = 'lobby';
    this.round = 0; this.turnId = 0; this.events = []; this.eventId = 0;
    this.remaining = 6; this.turn = null; this.deadline = 0; this.startAt = 0;
    this.pending = false; this.lockUntil = 0; this.winner = null;
  }
  event(type, data = {}) {
    this.events.push({ id: ++this.eventId, type, ...data });
    if (this.events.length > 30) this.events.shift();
  }
  add(name, color, now) {
    if (this.state !== 'lobby') throw Error('Bu masada oyun başladı. Başka bir oda seç.');
    if (this.players.size >= this.max) throw Error('Bu oda dolu.');
    let label = cleanName(name), suffix = 2;
    const base = label;
    while ([...this.players.values()].some(p => p.name.toLocaleLowerCase('tr') === label.toLocaleLowerCase('tr'))) label = base.slice(0, 14) + ' ' + suffix++;
    const p = { id: this.makeId(), name: label, color: Math.max(0, Math.min(5, Number(color) | 0)), ready: this.quick, alive: true, connected: true, usedPass: false, wins: 0, disconnectedAt: 0 };
    this.players.set(p.id, p); this.host ||= p.id; this.event('join', { player: p.id, name: p.name }); this.updateAuto(now); return p;
  }
  ready(id, value, now) {
    const p = this.players.get(id);
    if (!p || this.state !== 'lobby') throw Error('Hazır durumu lobide değişir.');
    p.ready = value === true; this.updateAuto(now);
  }
  active() { return [...this.players.values()].filter(p => p.connected); }
  living() { return [...this.players.values()].filter(p => p.alive); }
  updateAuto(now) {
    if (this.quick && this.state === 'lobby' && this.active().length >= 2) this.startAt ||= now + 8000;
    else this.startAt = 0;
  }
  reload() { this.remaining = 6; this.loaded = this.random(6); this.cursor = 0; this.round++; }
  start(id, now, auto = false) {
    if (id !== this.host && !auto) throw Error('Oyunu oda sahibi başlatır.');
    if (this.state !== 'lobby') throw Error('Oyun zaten başladı.');
    const active = this.active();
    if (active.length < 2) throw Error('Başlamak için en az iki oyuncu gerekli.');
    if (!auto && active.some(p => p.id !== this.host && !p.ready)) throw Error('Diğer oyuncuların hazır olmasını bekle.');
    for (const p of [...this.players.values()]) if (!p.connected) this.players.delete(p.id);
    for (const p of active) { p.alive = true; p.usedPass = false; p.ready = false; }
    this.state = 'playing'; this.winner = null; this.round = 0; this.reload();
    this.turn = active[this.random(active.length)].id; this.turnId++; this.pending = false;
    this.lockUntil = now + 1600; this.deadline = this.lockUntil + TURN_MS; this.startAt = 0;
    this.event('start', { player: this.turn });
  }
  checkTurn(id, turnId, now) {
    const p = this.players.get(id);
    if (this.state !== 'playing' || !p?.alive || !p.connected || this.turn !== id || turnId !== this.turnId || this.pending || now < this.lockUntil) throw Error('Sıranın gelmesini bekle.');
    return p;
  }
  action(id, type, turnId, now, timeout = false) {
    const p = this.checkTurn(id, turnId, now);
    if (!['pull', 'pass'].includes(type)) throw Error('Bilinmeyen hamle.');
    if (type === 'pass' && p.usedPass) throw Error('Bu oyundaki pas hakkını kullandın.');
    if (type === 'pass') { p.usedPass = true; this.event('pass', { player: id, name: p.name }); }
    else {
      const hit = this.cursor === this.loaded; this.cursor++; this.remaining--;
      if (hit) p.alive = false;
      this.event('pull', { player: id, name: p.name, hit, timeout, remaining: this.remaining });
      if (hit && this.living().length > 1) this.reload();
    }
    this.turnId++; this.pending = true; this.lockUntil = now + 1400;
    this.checkWinner(); return true;
  }
  checkWinner() {
    if (this.state !== 'playing') return;
    const living = this.living();
    if (living.length <= 1) {
      this.state = 'result'; this.winner = living[0]?.id || null;
      if (living[0]) living[0].wins++;
      this.event('result', { player: this.winner, name: living[0]?.name || '' }); this.deadline = 0;
    }
  }
  advance(now) {
    const order = [...this.players.keys()], start = order.indexOf(this.turn);
    for (let n = 1; n <= order.length; n++) {
      const candidate = this.players.get(order[(start + n) % order.length]);
      if (candidate?.alive) { this.turn = candidate.id; break; }
    }
    this.pending = false; this.turnId++; this.lockUntil = now;
    this.deadline = now + TURN_MS;
    const p = this.players.get(this.turn);
    if (p && !p.connected) this.deadline = Math.max(this.deadline, p.disconnectedAt + RECONNECT_MS);
  }
  disconnect(id, now) {
    const p = this.players.get(id); if (!p || !p.connected) return;
    p.connected = false; p.disconnectedAt = now; p.ready = false;
    if (this.state === 'playing' && this.turn === id) this.deadline = Math.max(this.deadline, now + RECONNECT_MS);
    this.updateAuto(now); this.event('disconnect', { player: id, name: p.name });
  }
  reconnect(id, now) {
    const p = this.players.get(id);
    if (!p || p.connected || now - p.disconnectedAt >= RECONNECT_MS) throw Error('Oturum süresi doldu. Odaya yeniden katıl.');
    p.connected = true; p.disconnectedAt = 0; this.updateAuto(now); this.event('reconnect', { player: id, name: p.name }); return p;
  }
  remove(id, now) {
    const p = this.players.get(id); if (!p) return;
    if (this.state === 'playing') {
      p.alive = false; this.checkWinner();
      if (this.state === 'playing' && this.turn === id) { this.pending = true; this.lockUntil = now + 500; }
    }
    this.players.delete(id);
    if (this.host === id) this.host = this.active()[0]?.id || this.players.keys().next().value || null;
    this.updateAuto(now); this.event('leave', { player: id, name: p.name });
  }
  rematch(id, now) {
    if (id !== this.host || this.state !== 'result') throw Error('Yeni lobiyi oda sahibi açar.');
    for (const p of [...this.players.values()]) if (!p.connected) this.players.delete(p.id);
    for (const p of this.players.values()) { p.alive = true; p.ready = this.quick; p.usedPass = false; }
    this.state = 'lobby'; this.turn = null; this.deadline = 0; this.pending = false; this.winner = null; this.remaining = 6;
    this.updateAuto(now); this.event('rematch');
  }
  tick(now) {
    for (const p of [...this.players.values()]) if (!p.connected && now - p.disconnectedAt >= RECONNECT_MS) this.remove(p.id, now);
    this.updateAuto(now);
    if (this.startAt && now >= this.startAt) this.start(this.host, now, true);
    if (this.state === 'playing') {
      if (this.pending && now >= this.lockUntil) this.advance(now);
      const actor = this.players.get(this.turn);
      if (!this.pending && now >= this.deadline && actor?.connected) this.action(actor.id, 'pull', this.turnId, now, true);
    }
  }
  snapshot(now) {
    return { code: this.code, public: this.public, quick: this.quick, max: this.max, state: this.state, host: this.host, players: [...this.players.values()].map(({ disconnectedAt, ...p }) => p), round: this.round, remaining: this.remaining, turn: this.turn, turnId: this.turnId, deadline: this.deadline, startAt: this.startAt, pending: this.pending, lockUntil: this.lockUntil, winner: this.winner, events: this.events, serverNow: now, expiresAt: this.createdAt + ROOM_MS };
  }
}
