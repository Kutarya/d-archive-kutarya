// Tarayıcı alıştırması ve sunucu aynı kuralları kullanır; online otorite sunucudur.
export const BJ_VERSION = '2.0.0';
export const TURN_MS = 25000, RECONNECT_MS = 30000, TABLE_MS = 45 * 60000;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUITS = ['♠', '♥', '♦', '♣'];
export function secureInt(max) {
  const values = new Uint32Array(1), limit = Math.floor(4294967296 / max) * max;
  do { globalThis.crypto.getRandomValues(values); } while (values[0] >= limit);
  return values[0] % max;
}
export function seededInt(seed) {
  let state = 2166136261;
  for (const char of String(seed)) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return max => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * max); };
}
export function playerId() {
  // data: ve korumalı yerel önizlemede randomUUID olmayabilir; getRandomValues çalışır.
  const bytes = new Uint8Array(16); globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export function value(cards) {
  let total = 0, aces = 0;
  for (const card of cards.filter(Boolean)) { if (card.rank === 'A') { total += 11; aces++; } else total += Math.min(10, Number(card.rank) || 10); }
  while (total > 21 && aces) { total -= 10; aces--; }
  return { total, soft: aces > 0 };
}
export const natural = hand => !hand.split && hand.cards.length === 2 && value(hand.cards).total === 21;
export function shoe(random = secureInt) {
  const cards = Array.from({ length: 4 }, () => SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit })))).flat();
  for (let i = cards.length - 1; i > 0; i--) { const j = random(i + 1); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards;
}
export function playerName(input) {
  return String(input || '').normalize('NFC').replace(/[\p{C}<>]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20) || 'Misafir';
}
export function turkeyDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export class BlackjackTable {
  constructor(code, options = {}, dependencies = {}) {
    this.code = code; this.solo = options.solo === true; this.max = this.solo ? 1 : Math.min(5, Math.max(2, Math.floor(Number(options.max) || 5)));
    this.public = options.public === true; this.players = []; this.host = ''; this.phase = 'lobby'; this.round = 0;
    this.revision = 0; this.serial = 0; this.active = ''; this.handIndex = 0; this.deadline = 0; this.dealer = []; this.history = [];
    this.createdAt = dependencies.now ?? Date.now(); this.random = dependencies.random || secureInt;
    this.makeId = dependencies.makeId || playerId;
    this.makeShoe = dependencies.makeShoe || (() => shoe(this.random));
  }
  touch() { this.revision++; }
  player(id) { const p = this.players.find(p => p.id === id); if (!p) throw Error('Bu masada oyuncu oturumun yok.'); return p; }
  ensureHost() { if (!this.players.some(p => p.id === this.host && p.connected && !p.departed)) this.host = this.players.find(p => p.connected && !p.departed)?.id || ''; }
  add(name, now = Date.now()) {
    if (this.phase !== 'lobby') throw Error('Tur sürüyor. Yeni turu bekle.');
    if (this.players.length >= this.max) throw Error('Bu masa dolu.');
    const base = playerName(name); let unique = base, index = 2;
    while (this.players.some(p => p.name.toLocaleLowerCase('tr') === unique.toLocaleLowerCase('tr'))) unique = `${base.slice(0, 16)} ${index++}`;
    const p = { id: this.makeId(), name: unique, bank: 1000, bet: 50, ready: false, connected: true, departed: false, seen: now, hands: [], wins: 0, rounds: 0 };
    this.players.push(p); this.ensureHost(); this.touch(); return p;
  }
  profile(id, name) {
    if (this.phase === 'playing') throw Error('Adını tur bitince değiştirebilirsin.');
    const p = this.player(id), clean = playerName(name);
    if (this.players.some(other => other.id !== id && other.name.toLocaleLowerCase('tr') === clean.toLocaleLowerCase('tr'))) throw Error('Bu ad masada kullanılıyor.');
    p.name = clean; this.touch();
  }
  bet(id, amount) {
    if (this.phase !== 'lobby') throw Error('Puanı yeni turdan önce seç.');
    const p = this.player(id);
    if (!Number.isInteger(amount) || amount < 10 || amount > 500 || amount % 10 || amount > p.bank) throw Error('10–500 arasında, 10’un katı ve bakiyene uygun bir puan seç.');
    p.bet = amount; p.ready = false; this.touch();
  }
  ready(id, ready) {
    if (this.phase !== 'lobby') throw Error('Tur zaten başladı.');
    const p = this.player(id); if (p.bank < p.bet) throw Error('Puanını azalt veya puanını yenile.');
    p.ready = ready === true; this.touch();
  }
  topup(id) {
    if (this.phase === 'playing') throw Error('Tur sürerken puan yenilenmez.');
    const p = this.player(id); if (p.bank >= 10) throw Error('Yalnız puan bitince yenileyebilirsin.');
    p.bank = 1000; p.bet = 50; p.ready = false; this.touch();
  }
  start(id, now = Date.now()) {
    this.ensureHost(); if (id !== this.host) throw Error('Turu yalnız masa sahibi başlatabilir.');
    if (this.phase !== 'lobby') throw Error('Tur zaten başladı.');
    const seated = this.players.filter(p => p.connected && !p.departed);
    if (seated.length < (this.solo ? 1 : 2)) throw Error('Başlamak için en az iki oyuncu gerekir.');
    if (seated.some(p => !p.ready || p.bank < p.bet)) throw Error('Masadaki herkes puanını seçip hazır olmalı.');
    this.players = seated; this.round++; this.phase = 'playing'; this.deck = this.makeShoe();
    this.dealer = [this.draw(), this.draw()]; this.active = ''; this.handIndex = 0;
    for (const p of this.players) {
      p.bank -= p.bet; p.ready = false;
      p.hands = [{ cards: [this.draw(), this.draw()], stake: p.bet, split: false, status: 'playing', outcome: '', net: 0 }];
      if (natural(p.hands[0])) p.hands[0].status = 'blackjack';
    }
    if (value(this.dealer).total === 21) this.settle(); else this.advance(now);
    this.touch();
  }
  draw() { if (!this.deck?.length) throw Error('Deste tükendi.'); return this.deck.pop(); }
  advance(now) {
    const currentSeat = Math.max(0, this.players.findIndex(p => p.id === this.active));
    for (let seat = currentSeat; seat < this.players.length; seat++) {
      const p = this.players[seat];
      for (let index = 0; index < p.hands.length; index++) {
        const hand = p.hands[index];
        if (hand.status !== 'playing') continue;
        if (!p.connected || p.departed) { hand.status = 'stand'; continue; }
        const changed = this.active !== p.id || this.handIndex !== index;
        this.active = p.id; this.handIndex = index; this.serial++;
        if (changed || !this.deadline) this.deadline = now + TURN_MS;
        return;
      }
    }
    this.settle();
  }
  actions(id) {
    if (this.phase !== 'playing' || this.active !== id) return [];
    const p = this.player(id), h = p.hands[this.handIndex], first = h.cards.length === 2;
    return ['hit', 'stand', ...(first && p.bank >= h.stake ? ['double'] : []), ...(first && !h.split ? ['surrender'] : []), ...(first && p.hands.length === 1 && p.bank >= h.stake && value([h.cards[0]]).total === value([h.cards[1]]).total ? ['split'] : [])];
  }
  action(id, action, turnId, now = Date.now()) {
    if (this.phase !== 'playing' || id !== this.active) throw Error('Sıra sende değil.');
    if (turnId !== `${this.round}:${this.serial}`) throw Error('Bu hamle eski bir sıraya ait.');
    if (now >= this.deadline) { this.tick(now); throw Error('Hamle süresi doldu; otomatik duruldu.'); }
    if (!this.actions(id).includes(action)) throw Error('Bu elde bu hamle kullanılamaz.');
    const p = this.player(id), h = p.hands[this.handIndex];
    if (action === 'stand') h.status = 'stand';
    if (action === 'surrender') h.status = 'surrender';
    if (action === 'hit' || action === 'double') {
      if (action === 'double') { p.bank -= h.stake; h.stake *= 2; }
      h.cards.push(this.draw()); const total = value(h.cards).total;
      h.status = total > 21 ? 'bust' : total === 21 || action === 'double' ? 'stand' : 'playing';
    }
    if (action === 'split') {
      p.bank -= h.stake; const second = h.cards.pop(); h.split = true; h.cards.push(this.draw());
      const other = { cards: [second, this.draw()], stake: h.stake, split: true, status: 'playing', outcome: '', net: 0 };
      p.hands.push(other);
      for (const hand of p.hands) if (second.rank === 'A' || value(hand.cards).total === 21) hand.status = 'stand';
    }
    this.advance(now); this.touch();
  }
  settle() {
    const dealerNatural = this.dealer.length === 2 && value(this.dealer).total === 21;
    const comparing = this.players.some(p => p.hands.some(h => !['bust', 'surrender', 'blackjack'].includes(h.status)));
    if (!dealerNatural && comparing) while (value(this.dealer).total < 17) this.dealer.push(this.draw());
    const dealerTotal = value(this.dealer).total;
    for (const p of this.players) {
      let net = 0;
      for (const h of p.hands) {
        const total = value(h.cards).total; let payout = 0;
        if (h.status === 'surrender') { payout = h.stake / 2; h.outcome = 'Teslim'; }
        else if (total > 21) h.outcome = 'Aştın';
        else if (natural(h) && !dealerNatural) { payout = h.stake * 2.5; h.outcome = 'Blackjack'; }
        else if (dealerNatural && !natural(h)) h.outcome = 'Dağıtıcı Blackjack';
        else if (total === dealerTotal) { payout = h.stake; h.outcome = 'Berabere'; }
        else if (dealerTotal > 21 || total > dealerTotal) { payout = h.stake * 2; h.outcome = 'Kazandın'; }
        else h.outcome = 'Dağıtıcı kazandı';
        p.bank += payout; h.net = payout - h.stake; net += h.net; h.status = 'done';
      }
      p.rounds++; if (net > 0) p.wins++;
    }
    this.phase = 'result'; this.active = ''; this.deadline = 0; this.serial++;
    this.history.unshift({ round: this.round, dealer: dealerTotal, players: this.players.map(p => ({ id: p.id, name: p.name, net: p.hands.reduce((sum, h) => sum + h.net, 0) })) });
    this.history = this.history.slice(0, 8);
  }
  next(id) {
    this.ensureHost(); if (id !== this.host) throw Error('Yeni turu masa sahibi açar.');
    if (this.phase !== 'result') throw Error('Önce bu turu tamamla.');
    this.players = this.players.filter(p => p.connected && !p.departed);
    this.phase = 'lobby'; this.deadline = 0;
    for (const p of this.players) { p.ready = false; p.hands = []; if (p.bet > p.bank && p.bank >= 10) p.bet = Math.min(50, Math.floor(p.bank / 10) * 10); }
    this.ensureHost(); this.touch();
  }
  disconnect(id, now = Date.now(), departed = false) {
    const p = this.player(id); p.connected = false; p.ready = false; p.seen = now; p.departed = departed;
    if (this.phase !== 'playing' && departed) this.players = this.players.filter(p => p.id !== id);
    this.ensureHost(); this.touch();
  }
  reconnect(id, now = Date.now()) {
    const p = this.player(id); if (p.departed || p.connected || now - p.seen >= RECONNECT_MS) throw Error('Oturum süresi doldu veya başka bağlantıda açık.');
    p.connected = true; p.seen = now; this.ensureHost(); this.touch(); return p;
  }
  tick(now = Date.now()) {
    if (this.phase === 'playing' && now >= this.deadline) {
      const h = this.player(this.active).hands[this.handIndex]; h.status = 'stand'; this.deadline = 0; this.advance(now); this.touch();
    }
    if (this.phase !== 'playing') {
      const before = this.players.length;
      this.players = this.players.filter(p => p.connected || (!p.departed && now - p.seen < RECONNECT_MS));
      if (before !== this.players.length) { this.ensureHost(); this.touch(); }
    }
  }
  snapshot(viewer = '', now = Date.now()) {
    const hidden = this.phase === 'playing';
    const dealer = hidden ? [this.dealer[0], null] : this.dealer;
    return { version: BJ_VERSION, code: this.code, max: this.max, public: this.public, host: this.host, phase: this.phase, round: this.round, revision: this.revision,
      serverNow: now, createdAt: this.createdAt, expiresAt: this.createdAt + TABLE_MS, active: this.active, handIndex: this.handIndex,
      turnId: `${this.round}:${this.serial}`, deadline: this.deadline, dealer: dealer.map(c => c ? { ...c } : null), dealerValue: value(dealer).total,
      players: this.players.map(p => ({ id: p.id, name: p.name, bank: p.bank, bet: p.bet, ready: p.ready, connected: p.connected, wins: p.wins, rounds: p.rounds,
        hands: p.hands.map(h => ({ ...h, cards: h.cards.map(c => ({ ...c })), total: value(h.cards).total, soft: value(h.cards).soft })) })),
      actions: this.actions(viewer), history: structuredClone(this.history) };
  }
}
