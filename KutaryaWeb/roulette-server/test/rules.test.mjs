import test from 'node:test';
import assert from 'node:assert/strict';
import { DuelRoom, cleanName, RECONNECT_MS } from '../../games-src/rus-ruleti/rules.mjs';
import { ensureHost, capacity } from '../lobby.mjs';
function fixture(settings = {}, loaded = 2) {
  let id = 0, call = 0;
  const room = new DuelRoom('ABC234', settings, 1000, max => (call++ % 2 === 0 ? loaded : 0) % max, () => 'p' + ++id);
  const a = room.add('Yağız', 0, 1000), b = room.add('İpek', 1, 1000);
  return { room, a, b, start() { room.ready(b.id, true, 1000); room.start(a.id, 2000); } };
}
test('Türkçe adlar korunur, HTML/kontrol karakterleri ve aşırı uzun adlar temizlenir', () => {
  assert.equal(cleanName('İpek Çağrı'), 'İpek Çağrı'); assert(!cleanName('<script>\n').includes('<')); assert.equal(cleanName('a'.repeat(100)).length, 18);
});
test('ad çakışması, kapasite ve oyun sırasında katılma sunucuda korunur', () => {
  const f = fixture({ max: 2 }); assert.throws(() => f.room.add('X', 0, 2000), /dolu/); f.start(); assert.throws(() => f.room.add('X', 0, 4000), /başladı/);
  const g = fixture(); const c = g.room.add('İPEK', 0, 1000); assert.equal(c.name, 'İPEK 2');
});
test('yalnız oda sahibi başlatır; en az iki hazır oyuncu gerekir', () => {
  const f = fixture(); assert.throws(() => f.room.start(f.b.id, 1000), /sahibi/); assert.throws(() => f.room.start(f.a.id, 1000), /hazır/); f.room.remove(f.b.id, 1000); assert.throws(() => f.room.start(f.a.id, 1000), /iki/);
});
test('snapshot gizli hazne/rastgelelik ve oturum anahtarı içermez', () => {
  const f = fixture(); f.start(); const s = f.room.snapshot(4000); for (const key of ['loaded', 'cursor', 'random', 'makeId', 'token']) assert(!Object.hasOwn(s, key)); assert.equal(s.remaining, 6);
});
test('yanlış oyuncu, erken hamle ve yeniden gönderilen hamle reddedilir', () => {
  const f = fixture(); f.start(); const r = f.room; assert.throws(() => r.action(f.b.id, 'pull', r.turnId, 4000)); assert.throws(() => r.action(f.a.id, 'pull', r.turnId, 2000)); const tid = r.turnId; r.action(f.a.id, 'pull', tid, 4000); assert.throws(() => r.action(f.a.id, 'pull', tid, 4001)); assert.equal(r.remaining, 5);
});
test('pas hakkı oyuncu başına birdir ve hazne tüketmez', () => {
  const f = fixture(); f.start(); const r = f.room; r.action(f.a.id, 'pass', r.turnId, 4000); assert.equal(r.remaining, 6); r.tick(5500); r.action(f.b.id, 'pass', r.turnId, 5500); r.tick(7000); assert.throws(() => r.action(f.a.id, 'pass', r.turnId, 7000), /kullandın/);
});
test('altı hazne sırayla ilerler; en geç altıncı çekimde sonuç vardır', () => {
  for (let loaded = 0; loaded < 6; loaded++) {
    const f = fixture({}, loaded); f.start(); const r = f.room;
    let now = 4000, shots = 0;
    while (r.state === 'playing' && shots < 7) { r.action(r.turn, 'pull', r.turnId, now); shots++; now += 1500; r.tick(now); }
    assert.equal(shots, loaded + 1); assert.equal(r.state, 'result'); assert.equal(r.living().length, 1); assert.equal(r.players.get(r.winner).wins, 1);
  }
});
test('üç oyuncuda elemeden sonra yeni altı hazne gelir', () => {
  const f = fixture({}, 0); const c = f.room.add('Can', 2, 1000); f.room.ready(c.id, true, 1000); f.start(); f.room.action(f.a.id, 'pull', f.room.turnId, 4000); assert.equal(f.room.round, 2); assert.equal(f.room.remaining, 6); assert.equal(f.room.state, 'playing');
});
test('süre bittiğinde hamle sunucuda otomatik yürür', () => {
  const f = fixture(); f.start(); f.room.tick(f.room.deadline); assert.equal(f.room.remaining, 5); assert(f.room.events.some(e => e.type === 'pull' && e.timeout));
});
test('hızlı eşleşme en az iki kişiyle sekiz saniye sonra başlar', () => {
  const f = fixture({ public: true, quick: true }); assert.equal(f.room.startAt, 9000); f.room.tick(8999); assert.equal(f.room.state, 'lobby'); f.room.tick(9000); assert.equal(f.room.state, 'playing');
});
test('ikinci kişi ayrılınca otomatik başlangıç iptal olur', () => {
  const f = fixture({ quick: true }); f.room.disconnect(f.b.id, 1500); f.room.tick(9000); assert.equal(f.room.state, 'lobby'); assert.equal(f.room.startAt, 0);
});
test('bağlantı 30 saniye korunur; aktif oturum devralınamaz', () => {
  const f = fixture(); f.start(); assert.throws(() => f.room.reconnect(f.a.id, 4000)); f.room.disconnect(f.a.id, 4000); assert(f.room.deadline >= 34000); f.room.reconnect(f.a.id, 33999); assert(f.a.connected);
  f.room.disconnect(f.a.id, 35000); assert.throws(() => f.room.reconnect(f.a.id, 35000 + RECONNECT_MS)); f.room.tick(65000); assert.equal(f.room.state, 'result'); assert.equal(f.room.winner, f.b.id);
});
test('oda sahibi ayrılınca sahiplik aktarılır ve yalnız sahip rövanş açar', () => {
  const f = fixture({}, 0); f.start(); f.room.action(f.a.id, 'pull', f.room.turnId, 4000); assert.throws(() => f.room.rematch(f.b.id, 6000)); f.room.remove(f.a.id, 6000); assert.equal(f.room.host, f.b.id); f.room.rematch(f.b.id, 6000); assert.equal(f.room.state, 'lobby'); assert.equal(f.b.usedPass, false);
});
test('hızlı geri sayımda kopan sahip çıkarılınca bağlı oyuncuya sahiplik geçer', () => {
  const f = fixture({ quick: true }); f.room.add('Can', 2, 1000); f.room.disconnect(f.a.id, 2000); f.room.tick(9000); assert.equal(f.room.state, 'playing'); assert(!f.room.players.has(f.a.id)); ensureHost(f.room); assert.equal(f.room.host, f.b.id);
});
test('oda kapasitesi her girdide 2–6 arasında tam sayıdır', () => {
  for (const v of [undefined, -100, 0, 2.5, 7, Infinity, '4', 'hata']) { const n = capacity(v); assert(Number.isInteger(n) && n >= 2 && n <= 6); }
});
