import test from "node:test";
import assert from "node:assert/strict";
import { Room, cleanName, validInput } from "../engine.mjs";
import { createWorld, WEAPONS } from "../rules.mjs";
const input = (extra = {}) => ({
  seq: 1,
  f: 0,
  r: 0,
  yaw: 0,
  pitch: 0,
  fire: false,
  ads: false,
  sprint: false,
  jump: false,
  dash: false,
  ...extra,
});
function duel(mode = 0) {
  const r = new Room("ABC123", { mode });
  const a = r.add("A"),
    b = r.add("B");
  r.start(a.id);
  r.step(3.1);
  return { r, a, b };
}
test("Üç haritanın duvar, doğma alanı ve ışın çarpışması tutarlıdır", () => {
  for (let i = 0; i < 3; i++) {
    const w = createWorld(i);
    assert(w.map.spawns.length > 100);
    assert(w.blocked(30, 0));
    for (const s of w.map.spawns) assert(!w.blocked(s.x, s.z));
    assert(w.wallRay([0, 1.5, 0], [1, 0, 0], 100) < 100);
  }
});
test("Oda kodu dışındaki profil adı temizlenir, sekiz oyuncu sınırı ve sunucu token gizliliği", () => {
  const r = new Room("ABC123");
  for (let i = 0; i < 8; i++) r.add(i ? `A${i}` : "<isim>\n");
  assert.throws(() => r.add("9"));
  assert.equal(cleanName("<isim>\n"), "isim");
  for (const p of r.snapshot().players) {
    assert(!("token" in p));
    assert(!("input" in p));
  }
});
test("Maçı yalnız oda sahibi ve en az iki gerçek oyuncu başlatır", () => {
  const r = new Room("ABC123"),
    a = r.add("A");
  assert.throws(() => r.start(a.id));
  const b = r.add("B");
  assert.throws(() => r.start(b.id));
  r.start(a.id);
  assert.equal(r.phase, "countdown");
});
test("Girdi NaN, sonsuz ve eski sıra numarasını reddeder; konum/hasar enjekte edilmez", () => {
  const { r, a } = duel();
  assert(!validInput(input({ yaw: NaN })));
  assert(!validInput(input({ f: Infinity })));
  assert(!validInput(input({ r: 2 })));
  const x = a.x;
  assert(r.setInput(a, input({ x: 9999, hp: 9999, kills: 100 })));
  assert.equal(a.x, x);
  assert.equal(a.hp, 100);
  assert.equal(a.kills, 0);
  assert(!r.setInput(a, input()));
});
test("Çapraz hareket hızı sınırlıdır ve duvardan geçiş yoktur", () => {
  const { r, a } = duel();
  a.x = 0;
  a.z = 20;
  r.setInput(a, input({ f: 1, r: 1 }));
  const x = a.x,
    z = a.z;
  r.step(1 / 30);
  assert(Math.hypot(a.x - x, a.z - z) <= 5.4 / 30 + 0.001);
  a.x = 22.6;
  a.z = 0;
  a.y = 0;
  r.setInput(a, input({ seq: 2, r: 1 }));
  for (let i = 0; i < 30; i++) r.step(1 / 30);
  assert(a.x < 23);
});
test("Yeni doğma koruması ve kendi ateşinde korumanın kalkması", () => {
  const { r, a, b } = duel();
  assert(!r.damage(b, 100, a));
  a.cooldown = 0;
  r.fire(a);
  assert.equal(a.safe, 0);
  b.safe = 0;
  assert(r.damage(b, 20, a));
  assert(b.hp < 100);
});
test("Mermi, doldurma ve atış aralığı istemci mesaj sayısından bağımsızdır", () => {
  const { r, a } = duel();
  a.cooldown = 0;
  const n = a.ammo[0].mag;
  r.fire(a);
  for (let i = 0; i < 100; i++) r.fire(a);
  assert.equal(a.ammo[0].mag, n - 1);
  a.ammo[0].mag = 0;
  a.cooldown = 0;
  r.fire(a);
  assert(a.reload > 0);
  r.step(WEAPONS[0].reload + 0.01);
  assert.equal(a.ammo[0].mag, 30);
  assert.equal(a.ammo[0].reserve, 120);
});
test("Takım hasarı kapalı; eleme ve üç saniyelik yeniden doğma sunucuda", () => {
  const { r, a, b } = duel(1),
    c = r.add("C");
  b.safe = 0;
  c.safe = 0;
  c.team = a.team;
  assert(!r.damage(c, 500, a));
  assert(r.damage(b, 500, a));
  assert.equal(a.kills, 1);
  assert.equal(b.deaths, 1);
  assert.equal(r.scores[a.team], 1);
  assert.equal(b.hp, 0);
  r.step(3.01);
  assert.equal(b.hp, 100);
  assert(b.safe > 0);
});
test("Otomatik silah değişimi atış aralığını sıfırlamaz; atılma enerji tüketir", () => {
  const { r, a } = duel();
  a.cooldown = 1;
  r.command(a, { type: "weapon", weapon: 2 });
  assert.equal(a.cooldown, 1);
  r.setInput(a, input({ f: 1, dash: true }));
  r.step(1 / 30);
  assert(a.stamina < 70);
  assert(a.dashCooldown > 2.9);
});
test("Süre bitince sonuç sabittir; geçersiz silah ve komut hasar yazamaz", () => {
  const { r, a } = duel();
  r.command(a, { type: "weapon", weapon: 99 });
  assert.equal(a.weapon, 0);
  r.command(a, { type: "damage", hp: -1 });
  assert.equal(a.hp, 100);
  r.elapsed = r.duration - 0.01;
  r.step(0.02);
  assert.equal(r.phase, "results");
  const hp = a.hp;
  r.command(a, { type: "grenade" });
  assert.equal(a.hp, hp);
});
test("Kopma oda sahipliğini aktarır ve eski hareket zaman aşımında durur", () => {
  const { r, a, b } = duel();
  r.disconnect(a);
  assert.equal(r.host, b.id);
  assert.equal(a.input.f, 0);
  r.setInput(b, input({ f: 1 }), 100);
  const x = b.x,
    z = b.z;
  r.step(0.03, 1000);
  assert.equal(b.x, x);
  assert.equal(b.z, z);
  r.step(0.01, Date.now() + 31000);
  assert(!r.players.has(a.id));
});
