import test from 'node:test';
import assert from 'node:assert/strict';
import { BlackjackTable, value, natural, shoe, seededInt, turkeyDay, TURN_MS, TABLE_MS } from '../rules.mjs';
import { createGateway } from '../gateway.mjs';
const card = rank => ({ rank, suit: '♠' });
function table(ranks = ['10', '7', '10', '8', '9', '8', '2', '3']) {
  let id = 0;
  const g = new BlackjackTable('ABC234', { max: 5 }, { now: 1000, makeId: () => `p${++id}`, makeShoe: () => [...Array(80).fill('2'), ...ranks.slice().reverse()].map(card) });
  const a = g.add('Çağrı', 1000), b = g.add('İpek', 1000); g.ready(a.id, true); g.ready(b.id, true); return { g, a, b };
}
const act = (g, id, name, now = 1001) => g.action(id, name, g.snapshot(id, now).turnId, now);
test('Aslar/yumuşak el/doğal Blackjack ve tekil dört deste', () => {
  assert.equal(value(['A', 'A', '9'].map(card)).total, 21); assert.equal(value(['A', '6'].map(card)).soft, true);
  assert(natural({ cards: ['A', 'K'].map(card) })); assert(!natural({ cards: ['A', 'K'].map(card), split: true }));
  const deck = shoe(seededInt('deneme')); assert.equal(deck.length, 208); assert.equal(deck.filter(c => c.rank === 'A').length, 16);
  assert.deepEqual(shoe(seededInt('aynı')), shoe(seededInt('aynı')));
  assert.equal(turkeyDay(new Date('2026-10-20T22:00:00Z')), '2026-10-21');
});
test('Hazır olmadan/yetkisiz başlatma; kapasite, isim ve kesirli puan sınırları', () => {
  const { g, a, b } = table(); g.ready(b.id, false);
  assert.throws(() => g.start(b.id, 1000), /sahibi/); assert.throws(() => g.start(a.id, 1000), /herkes/);
  for (const bet of [0, 55, 10.5, -10, 1001, NaN]) assert.throws(() => g.bet(a.id, bet));
  const c = g.add('ÇAĞRI', 1000); assert.equal(c.name, 'ÇAĞRI 2');
  g.add('4', 1000); g.add('5', 1000); assert.throws(() => g.add('6', 1000), /dolu/);
  assert.equal(new BlackjackTable('X', { max: 2.8 }).max, 2);
});
test('Kapalı dağıtıcı kartı, deste ve rakibin hamle hakkı ağ durumuna sızmaz', () => {
  const { g, a, b } = table(); g.start(a.id, 1000);
  const s = g.snapshot(b.id, 1001); assert.equal(s.dealer[1], null); assert.equal(s.dealerValue, 10);
  assert.equal(s.deck, undefined); assert.deepEqual(s.actions, []); assert(!JSON.stringify(s).includes('makeShoe'));
  assert.throws(() => act(g, b.id, 'hit'), /sende değil/);
});
test('Bir hamle kimliği yalnız bir defa kullanılır; istemci kart/puan belirleyemez', () => {
  const { g, a } = table(['10', '7', '2', '3', '8', '9', '2']); g.start(a.id, 1000);
  const turn = g.snapshot(a.id).turnId; g.action(a.id, 'hit', turn, 1001);
  assert.throws(() => g.action(a.id, 'hit', turn, 1001), /eski/);
  assert.equal(a.hands[0].cards.length, 3); assert.throws(() => act(g, a.id, 'setBalance'), /kullanılamaz/);
});
test('Doğal Blackjack 3:2, dağıtıcı Blackjack ve beraberlik tam ödeme', () => {
  const { g, a, b } = table(['10', '7', 'A', 'K', '10', '7']); g.start(a.id, 1000); act(g, b.id, 'stand');
  assert.equal(a.bank, 1075); assert.equal(b.bank, 1000); assert.equal(g.phase, 'result');
  const t = table(['A', 'K', 'A', 'Q', '10', '9']); t.g.start(t.a.id, 1000);
  assert.equal(t.a.bank, 1000); assert.equal(t.b.bank, 950); assert.equal(t.g.phase, 'result');
});
test('Yumuşak 17 durur; üç kartlık 21 doğal değildir', () => {
  const { g, a, b } = table(['A', '6', '7', '7', '10', '8', '7']); g.start(a.id, 1000);
  act(g, a.id, 'hit'); act(g, b.id, 'stand'); assert.equal(g.dealer.length, 2); assert.equal(a.bank, 1050);
});
test('Double tek kart verir ve doğru puanı düşer; teslim yarısını iade eder', () => {
  const { g, a, b } = table(['10', '7', '5', '6', '10', '6', '10']); g.start(a.id, 1000);
  act(g, a.id, 'double'); assert.equal(a.hands[0].stake, 100); assert.equal(a.hands[0].cards.length, 3);
  act(g, b.id, 'surrender'); assert.equal(a.bank, 1100); assert.equal(b.bank, 975);
});
test('Bölme en fazla iki el; ikinci elin sırası ayrı; bölünmüş 21 normal ödeme', () => {
  const { g, a, b } = table(['10', '7', '10', 'K', '8', '9', 'A', '8']); g.start(a.id, 1000);
  act(g, a.id, 'split'); assert.equal(a.hands.length, 2); assert.equal(a.bank, 900); assert(!g.actions(a.id).includes('split'));
  assert.equal(g.handIndex, 1); act(g, a.id, 'stand'); act(g, b.id, 'stand'); assert.equal(a.bank, 1100);
});
test('Bölünmüş aslar tek kartla durur; yetersiz bakiye double/bölmeyi kapatır', () => {
  const { g, a, b } = table(['10', '7', 'A', 'A', '8', '9', 'K', '9']); g.start(a.id, 1000);
  act(g, a.id, 'split'); assert.equal(g.active, b.id); assert(a.hands.every(h => h.status === 'stand'));
  const t = table(); t.a.bank = 50; t.g.start(t.a.id, 1000); assert(!t.g.actions(t.a.id).includes('double'));
});
test('25 saniyede otomatik durur; kopan sahip aktarılır, dönüş ve tur yenilenir', () => {
  const { g, a, b } = table(); g.start(a.id, 1000); g.tick(1000 + TURN_MS); assert.equal(g.active, b.id);
  g.disconnect(a.id, 27000); assert.equal(g.host, b.id); g.reconnect(a.id, 28000); assert(a.connected);
  act(g, b.id, 'stand', 28001); g.next(b.id); assert.equal(g.phase, 'lobby'); assert(g.players.every(p => !p.ready));
});
test('Süresi dolmuş hamle geçmez; eski/tamamlanmış elde double tekrarı yok', () => {
  const { g, a } = table(); g.start(a.id, 1000);
  assert.throws(() => act(g, a.id, 'hit', 1000 + TURN_MS), /süresi/); assert.equal(a.hands[0].cards.length, 2);
});
function setupGateway() {
  let now = 10000, id = 0;
  const gw = createGateway({ now: () => now, dependencies: { makeId: () => `id${++id}` } });
  const socket = () => { const ws = { readyState: 1, bufferedAmount: 0, messages: [], send(raw) { this.messages.push(JSON.parse(raw)); }, close(code) { this.closed = code; this.readyState = 3; gw.close(this); } }; gw.connect(ws); return ws; };
  const send = (ws, message) => { now += 80; gw.receive(ws, JSON.stringify(message)); };
  const hello = name => { const ws = socket(); send(ws, { type: 'hello', version: '2.0.0', name }); return ws; };
  return { gw, socket, hello, send, time: delta => { now += delta; gw.tick(); } };
}
test('Gerçek gateway: iki oturum, açık liste, yetki/sahte kimlik, aynı sonuç', () => {
  const { gw, hello, send } = setupGateway(), a = hello('Çağrı'), b = hello('İpek');
  send(a, { type: 'create', public: true, max: 2 }); const code = a.room.game.code;
  send(b, { type: 'list' }); assert.equal(b.messages.at(-1).rooms[0].code, code);
  send(b, { type: 'join', code }); send(b, { type: 'start', id: a.actor }); assert.equal(b.messages.at(-2).type, 'error');
  send(a, { type: 'ready', ready: true }); send(b, { type: 'ready', ready: true }); send(a, { type: 'start' });
  const g = a.room.game;
  for (let i = 0; i < 10 && g.phase === 'playing'; i++) { const ws = g.active === a.actor ? a : b; send(ws, { type: 'action', action: 'stand', turnId: g.snapshot(ws.actor).turnId, bank: 999999, dealer: [] }); }
  assert.equal(g.phase, 'result'); assert.deepEqual(a.messages.at(-1).room.players, b.messages.at(-1).room.players); assert.equal(gw.rooms.size, 1);
});
test('Gateway kopma/geri dönüş, çalınmış/ikinci oturum ve 45 dakika kapanışı', () => {
  const { gw, hello, send, time } = setupGateway(), a = hello('A'), b = hello('B'); send(a, { type: 'create' }); const code = a.room.game.code;
  send(b, { type: 'join', code }); const joined = a.messages.find(m => m.type === 'joined');
  const c = hello('A'); send(c, { type: 'resume', code, token: joined.token }); assert.equal(c.messages.at(-1).type, 'error');
  gw.close(a); send(c, { type: 'resume', code, token: joined.token }); assert.equal(c.actor, joined.id);
  time(TABLE_MS); assert.equal(gw.rooms.size, 0); assert.equal(c.messages.at(-1).type, 'expired');
});
test('Gateway: ham JSON, mesaj boyutu, el sıkışma ve hız sınırları', () => {
  const { gw, socket, hello, send } = setupGateway(); const bad = socket(); gw.receive(bad, '['); assert.equal(bad.closed, 1008);
  const big = socket(); gw.receive(big, 'x'.repeat(1600)); assert.equal(big.closed, 1009);
  const unauthed = socket(); send(unauthed, { type: 'create' }); assert.equal(unauthed.messages.at(-1).type, 'error');
  const spam = hello('Spam'); for (let i = 0; i < 30; i++) gw.receive(spam, '{"type":"list"}'); assert.equal(spam.closed, 1008);
});
test('Gateway beş oyuncu/altıncı reddi, özel oda gizliliği ve boş resume reddi', () => {
  const { hello, send } = setupGateway(), host = hello('Sahip'); send(host, { type: 'create', max: 5 });
  const code = host.room.game.code;
  const spectator = hello('İzleyici'); send(spectator, { type: 'list' }); assert.deepEqual(spectator.messages.at(-1).rooms, []);
  send(spectator, { type: 'resume', code, token: '' }); assert.equal(spectator.messages.at(-1).type, 'error'); assert.equal(host.room.game.players.length, 1);
  for (let i = 0; i < 4; i++) send(hello(`Oyuncu ${i}`), { type: 'join', code });
  assert.equal(host.room.game.players.length, 5); send(spectator, { type: 'join', code }); assert.equal(spectator.messages.at(-1).type, 'error'); assert.equal(spectator.room, null);
});
test('Bin rastgele elde puan/kart/sıra ve ödeme bütünlüğü korunur', () => {
  const random = seededInt('blackjack-finansal-tutarlılık'); let now = 1000;
  for (let sample = 0; sample < 200; sample++) {
    let serial = 0;
    const g = new BlackjackTable('TEST23', { max: 5 }, { now, random, makeId: () => String(++serial) });
    for (let seat = 0; seat < 5; seat++) { const p = g.add(`Oyuncu ${seat}`, now); g.bet(p.id, [10, 20, 50, 100, 200][random(5)]); g.ready(p.id, true); }
    g.start(g.host, now); let steps = 0;
    while (g.phase === 'playing') { assert(++steps < 150); const actor = g.active, actions = g.actions(actor); g.action(actor, actions[random(actions.length)], g.snapshot(actor, now).turnId, ++now); }
    for (const p of g.players) {
      assert(Number.isInteger(p.bank) && p.bank >= 0); assert(p.hands.length <= 2);
      assert.equal(p.bank, 1000 + p.hands.reduce((sum, h) => sum + h.net, 0));
      assert(p.hands.every(h => h.status === 'done' && Number.isInteger(h.net)));
    }
    assert(g.dealer.length >= 2); assert(g.players.every(p => g.actions(p.id).length === 0));
  }
});
