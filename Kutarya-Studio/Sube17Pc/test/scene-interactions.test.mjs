import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { evaluateInteraction } from '../src/sceneInteractionRules.js';
import * as engine from '../src/game/engine.js';

const fresh = () => engine.createGame({ name: 'Sahne Testi', difficulty: 'normal', seed: 42 });
const evening = () => engine.dismissReport(engine.advanceTime(engine.startShift(fresh()), 480));
const storage = () => {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};

test('Görünür nesne varsayılan olarak etkileşir; saklı nesne tıklanamaz', () => {
  const game = fresh();
  assert.deepEqual(evaluateInteraction({ id: 'desk-folder' }, game), { visible: true, enabled: true });
  assert.deepEqual(evaluateInteraction({ id: 'desk-folder', visible: false, enabled: true }, game), { visible: false, enabled: false });
  assert.deepEqual(evaluateInteraction({ id: 'desk-folder', enabled: false }, game), { visible: true, enabled: false });
});

test('Evde olan aile üyesi görünür; ayrılan, ölen veya bulunamayan kişi görünmez', () => {
  const game = fresh();
  const target = { id: 'living-mother', npcId: 'mother' };
  assert.deepEqual(evaluateInteraction(target, game), { visible: true, enabled: true });
  for (const status of ['left', 'dead']) {
    const changed = { ...game, family: game.family.map(person => person.id === 'mother' ? { ...person, status } : person) };
    assert.deepEqual(evaluateInteraction(target, changed), { visible: false, enabled: false });
  }
  assert.deepEqual(evaluateInteraction({ ...target, npcId: 'unknown-person' }, game), { visible: false, enabled: false });
  assert.deepEqual(evaluateInteraction(target, {}), { visible: false, enabled: false });
});

test('Hastalık ve günlük konuşma durumları aynı NPC üzerindeki farklı erişimleri belirler', () => {
  const healthy = fresh();
  const ill = engine.sleep(evening());
  const medicine = { id: 'mother-medicine', npcId: 'mother', visible: game => game.family.find(person => person.id === 'mother')?.illDays > 0 };
  const talk = { id: 'mother-talk', npcId: 'mother', enabled: game => game.family.find(person => person.id === 'mother')?.talkedDay !== game.day };
  assert.deepEqual(evaluateInteraction(medicine, healthy), { visible: false, enabled: false });
  assert.deepEqual(evaluateInteraction(medicine, ill), { visible: true, enabled: true });
  assert.equal(evaluateInteraction(talk, ill).enabled, true);
  const talked = engine.talkToFamily(ill, 'mother');
  assert.deepEqual(evaluateInteraction(talk, talked), { visible: true, enabled: false });
  assert.equal(evaluateInteraction(medicine, engine.buyMedicine(ill, 'mother')).visible, false);
});

test('Yatak yalnız akşam açılır; banka dış kapısı mesai ve rapor sırasında kilitlenir', () => {
  const bed = { id: 'bedroom-bed', phases: ['evening'] };
  const door = { id: 'bank-exit', phases: ['morning', 'evening'] };
  const morning = fresh();
  const working = engine.startShift(morning);
  const report = engine.advanceTime(working, 480);
  const night = engine.dismissReport(report);
  for (const game of [morning, working, report]) assert.deepEqual(evaluateInteraction(bed, game), { visible: true, enabled: false });
  assert.equal(evaluateInteraction(bed, night).enabled, true);
  for (const game of [working, report]) assert.deepEqual(evaluateInteraction(door, game), { visible: true, enabled: false });
  for (const game of [morning, night]) assert.equal(evaluateInteraction(door, game).enabled, true);
});

test('Gün ve saat sınırları başlangıç ile bitiş anlarını içerir; dışındaki anlar kilitlidir', () => {
  const game = fresh();
  const delivery = { id: 'dated-letter', minDay: 2, maxDay: 4, minMinute: 600, maxMinute: 720, phases: ['morning', 'working'] };
  for (const day of [2, 4]) for (const minute of [600, 720]) {
    assert.equal(evaluateInteraction(delivery, { ...game, day, minute }).enabled, true);
  }
  for (const [day, minute] of [[1, 600], [5, 600], [2, 599], [2, 721]]) {
    assert.deepEqual(evaluateInteraction(delivery, { ...game, day, minute }), { visible: true, enabled: false });
  }
  assert.equal(evaluateInteraction(delivery, { ...game, day: 2, minute: 600, phase: 'evening' }).enabled, false);
});

test('Tek kullanımlı hedef tüketilince kilitlenir; başka hedef ve tekrarlı hedef etkilenmez', () => {
  const game = fresh();
  const consumed = new Set(['hall-letter']);
  assert.equal(evaluateInteraction({ id: 'hall-letter', once: true }, game).enabled, true);
  assert.deepEqual(evaluateInteraction({ id: 'hall-letter', once: true }, game, consumed), { visible: true, enabled: false });
  assert.equal(evaluateInteraction({ id: 'kitchen-pantry', once: true }, game, consumed).enabled, true);
  assert.equal(evaluateInteraction({ id: 'hall-letter', once: false }, game, consumed).enabled, true);
  assert.deepEqual([...consumed], ['hall-letter']);
});

test('Erişim koşulları kayıt verisini, oyun ekonomisini ve tüketim kümesini değiştirmez', () => {
  const game = engine.sleep(evening());
  const original = JSON.stringify(game);
  const consumed = new Set();
  const freeze = value => {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) return;
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  };
  freeze(game);
  for (let i = 0; i < 30; i++) {
    evaluateInteraction({ id: 'mother', npcId: 'mother', enabled: state => state.money >= 0 }, game, consumed);
    evaluateInteraction({ id: 'bed', phases: ['evening'], once: true }, game, consumed);
  }
  assert.equal(JSON.stringify(game), original);
  assert.equal(consumed.size, 0);
});

test('Kayıt yüklenince gün, hastalık, konuşma ve mekân koşulları aynı erişimi verir', () => {
  let game = engine.sleep(evening());
  game = { ...engine.talkToFamily(game, 'wife'), location: 'home' };
  game.family = game.family.map(person => person.id === 'uncle' ? { ...person, status: 'left' } : person);
  const specs = [
    { id: 'wife', npcId: 'wife', enabled: state => state.family.find(person => person.id === 'wife').talkedDay !== state.day },
    { id: 'uncle', npcId: 'uncle' },
    { id: 'mother', npcId: 'mother', enabled: state => state.family.find(person => person.id === 'mother').illDays > 0 },
    { id: 'bed', phases: ['evening'] },
    { id: 'hall-exit', minDay: 2, visible: state => state.location === 'home' },
  ];
  const before = specs.map(spec => evaluateInteraction(spec, game));
  const memory = storage();
  assert.equal(engine.saveGame(game, memory).ok, true);
  const restored = engine.loadGame(memory);
  assert.equal(restored.recovered, false);
  assert.deepEqual(restored.game, game);
  assert.deepEqual(specs.map(spec => evaluateInteraction(spec, restored.game)), before);
});

test('Sahne dönüşümü korunan oyun motorunu ve kayıt sürümünü değiştirmedi', async () => {
  // Bu görevdeki açık koruma sınırı: engine değişecekse yeni bir çalışma kapsamı gerekir.
  const current = await readFile(new URL('../src/game/engine.js', import.meta.url));
  const baseline = await readFile(new URL('../checkpoints/2026-09-12-scene-ux-baseline/src/game/engine.js', import.meta.url));
  assert.ok(current.equals(baseline), 'Motor başlangıç checkpointiyle aynı baytları korumalı');
  assert.equal(createHash('sha256').update(current).digest('hex').toUpperCase(), '63947A3ACF600AEB751649E6DA4DD0E5C432FFD02727B346D5762C9D4B8F55A4');
  assert.equal(engine.SAVE_VERSION, 1);
});
