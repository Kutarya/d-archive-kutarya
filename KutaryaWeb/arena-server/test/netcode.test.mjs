import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "../engine.mjs";
import { arenaStepMotion, ARENA_STEP } from "../movement.mjs";
const frame = (seq, extra = {}) => ({
  seq,
  f: 1,
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
function players() {
  const r = new Room("ABCDEF"),
    a = r.add("Şahin", 0, undefined, Date.now(), 3),
    b = r.add("B");
  r.start(a.id);
  r.step(3.1);
  a.x = 0;
  a.z = 20;
  a.y = 0;
  a.vy = 0;
  return { r, a, b };
}
test("Adlar Türkçe harflerle bağımsızdır; aynı oda adları ayrılır ve yalnız verilen aktör değişir", () => {
  const r = new Room("ABCDEF"),
    a = r.add("Şahin"),
    b = r.add("ŞAHİN");
  assert.equal(a.name, "Şahin");
  assert.equal(b.name, "ŞAHİN 2");
  assert.equal(r.rename(b, "Çağrı 42"), "Çağrı 42");
  assert.equal(a.name, "Şahin");
  assert.throws(() => r.rename(b, "A"));
  assert.throws(() => r.rename(a, "   "));
});
test("Geciken toplu girdilerde ortak tahmin ve sunucu aynı hareket/zıplama/enerjiyi üretir", () => {
  const { r, a } = players(),
    predicted = structuredClone(a);
  const inputs = Array.from({ length: 60 }, (_, i) =>
    frame(i + 1, { sprint: true, jump: i < 5, dash: i === 20 }),
  );
  for (const input of inputs)
    arenaStepMotion(predicted, input, r.world, ARENA_STEP);
  let queued = 0;
  for (let tick = 0; tick < 72; tick++) {
    if (tick >= 6 && tick % 6 === 0 && queued < 60) {
      r.queueInputs(a, inputs.slice(queued, queued + 6));
      queued += 6;
    }
    r.step(ARENA_STEP);
    if (a.motionSeq === 60) break;
  }
  assert.equal(a.motionSeq, 60);
  for (const k of ["x", "y", "z", "vy", "stamina", "dashCooldown"])
    assert(Math.abs(a[k] - predicted[k]) < 1e-8, k);
  assert(!("motionQueue" in r.snapshot().players[0]));
  assert(!("token" in r.snapshot().players[0]));
});
test("Sunucu zaman bütçesi hız hilesini, eski sıra numarasını ve sahte konumu engeller", () => {
  const { r, a } = players(),
    z = a.z;
  const batch = Array.from({ length: 6 }, (_, i) =>
    frame(i + 1, { x: 9999, hp: 9999 }),
  );
  assert(r.queueInputs(a, batch));
  assert(!r.queueInputs(a, batch));
  r.step(ARENA_STEP);
  assert.equal(a.motionSeq, 1);
  assert(Math.abs(a.z - z) <= 5.4 / 60 + 0.00001);
  assert.equal(a.hp, 100);
  assert(!r.queueInputs(a, [frame(10000)]));
  assert(!r.queueInputs(a, [frame(7, { r: Infinity })]));
  assert(
    !r.queueInputs(
      a,
      Array.from({ length: 7 }, (_, i) => frame(i + 7)),
    ),
  );
});
test("Yeniden doğma eski tahmin kuyruğunu iptal eder; tutulan zıplama tekrar üretmez", () => {
  const { r, a } = players(),
    life = a.life;
  assert(
    r.queueInputs(a, [frame(1, { jump: true }), frame(2, { jump: true })]),
  );
  r.step(2 * ARENA_STEP);
  const snap = r.snapshot().players.find((p) => p.id === a.id);
  assert(snap.wasJump);
  const predicted = structuredClone(snap);
  arenaStepMotion(predicted, frame(3, { jump: true }), r.world, ARENA_STEP);
  assert(predicted.vy < 7.6);
  r.queueInputs(a, [frame(3)]);
  r.spawn(a);
  assert.equal(a.motionQueue.length, 0);
  assert.equal(a.motionSeq, 3);
  assert.equal(a.life, life + 1);
});
