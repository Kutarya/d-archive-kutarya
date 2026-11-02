import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { transform } from "lightningcss";
import {
  SIZE,
  HEIGHT,
  ITEMS,
  RECIPES,
  seedNumber,
  generate,
  get,
  set,
  index,
  newInventory,
  addItem,
  countItem,
  consume,
  craft,
  raycast,
  collides,
  validateSave,
} from "../games-src/blok-diyari/core.mjs";
function make(seed = "kutarya-vadi") {
  const gen = generate(seedNumber(seed));
  let world;
  for (const value of gen) if (value.world) world = value.world;
  return world;
}
const world = make();
test("Blok dünyası aynı tohumla tekrarlanır; farklı tohum araziyi değiştirir", () => {
  const same = make(),
    different = make("baska-dunya");
  assert.deepEqual(world.blocks, same.blocks);
  assert.notDeepEqual(world.blocks, different.blocks);
  assert.equal(world.blocks.length, SIZE * SIZE * HEIGHT);
  for (const id of [9, 10, 11, 29, 40])
    assert.ok(world.blocks.includes(id), "Eksik dünya içeriği " + id);
  assert.equal(collides(world, ...world.spawn), false);
  assert.equal(get(world, 80, world.spawn[1] - 1, 80), 1);
});
test("DDA ışını komşu yerleştirme konumunu bulur ve menzili aşmaz", () => {
  const w = { blocks: new Uint8Array(SIZE * SIZE * HEIGHT) };
  w.blocks[index(8, 5, 5)] = 3;
  const hit = raycast(w, [5.5, 5.5, 5.5], [1, 0, 0]);
  assert.equal(hit.x, 8);
  assert.deepEqual(hit.previous, [7, 5, 5]);
  assert.equal(hit.distance, 2.5);
  assert.equal(raycast(w, [5.5, 5.5, 5.5], [1, 0, 0], 2), null);
});
test("Dolu envanter ekleme/üretim başarısızlığı malzeme kaybettirmez", () => {
  const inv = Array.from({ length: 27 }, () => ({ id: 3, count: 64 }));
  const before = structuredClone(inv);
  assert.equal(addItem(inv, 35), false);
  assert.deepEqual(inv, before);
  inv[0] = { id: 6, count: 2 };
  const snapshot = structuredClone(inv);
  const r = craft(
    inv,
    RECIPES.find((r) => r.id === "plank"),
  );
  assert.equal(r.ok, false);
  assert.deepEqual(inv, snapshot);
});
test("Kazma üretimi istasyon ve malzeme ister; işlemi atomik tüketir", () => {
  const inv = newInventory();
  addItem(inv, 8, 3);
  addItem(inv, 25, 2);
  const r = RECIPES.find((r) => r.id === "woodpick");
  assert.equal(craft(inv, r).ok, false);
  assert.equal(countItem(inv, 8), 3);
  assert.equal(craft(inv, r, "bench").ok, true);
  assert.equal(countItem(inv, 8), 0);
  assert.equal(countItem(inv, 25), 0);
  assert.equal(countItem(inv, 30), 1);
  assert.equal(inv.find((s) => s?.id === 30).wear, ITEMS[30].durability);
  assert.equal(consume(inv, 3), false);
});
test("Sınır blokları güvenlidir; chunk komşusu yeniden çizilir", () => {
  const w = {
    blocks: new Uint8Array(SIZE * SIZE * HEIGHT),
    edits: new Map(),
    dirty: new Set(),
  };
  assert.equal(set(w, -1, 1, 0, 3), false);
  assert.equal(set(w, 15, 4, 16, 3), true);
  assert.ok(w.dirty.has("1,1"));
  assert.ok(w.dirty.has("0,0"));
  assert.equal(w.edits.get(index(15, 4, 16)), 3);
});
const save = () => ({
  format: "kutarya-blok-1",
  name: "Dünya",
  seed: 17,
  mode: "survival",
  inventory: newInventory(),
  edits: [[index(5, 5, 5), 8]],
  position: [80.5, 26, 80.5],
  yaw: 0,
  pitch: 0,
  health: 20,
  hunger: 20,
  time: 90,
  stats: { mined: 0, placed: 0, crafted: 0, kills: 0, days: 0 },
  beacon: false,
  crops: [],
  smelt: { out: [23, 1], left: 3 },
});
test("Kayıt envanter, değişen bloklar ve yarım fırın işini taşır; bozuk veri reddedilir", () => {
  const data = save();
  addItem(data.inventory, 32);
  const result = validateSave(data);
  assert.deepEqual(result, data);
  result.edits[0][1] = 3;
  assert.equal(data.edits[0][1], 8);
  for (const invalid of [
    { ...data, position: [Infinity, 0, 0] },
    { ...data, edits: [[-1, 8]] },
    { ...data, health: 999 },
    { ...data, smelt: { out: [24, 64], left: 3 } },
    { ...data, inventory: [{ id: 999, count: 1 }] },
  ])
    assert.throws(() => validateSave(invalid));
});
test("Oyun paketi çevrimdışı HTML, geçerli CSS ve JavaScript içerir", async () => {
  const html = await readFile("games-src/blok-diyari/index.html", "utf8");
  assert.ok(
    !/src=["']https?:|@import|\/\* (CORE|GAME|RENDERER) \*\//.test(html),
  );
  for (const css of html.matchAll(/<style>([\s\S]*?)<\/style>/g))
    transform({ code: Buffer.from(css[1]), filename: "blok-diyari.css" });
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
    new Function(script[1]);
});
