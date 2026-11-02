// Blok Diyarı: dünya, envanter ve kayıt kuralları. Tarayıcıdan bağımsızdır.
export const SIZE = 160,
  HEIGHT = 64,
  SEA = 21;
export const BLOCKS = {
  1: { name: "Çimen", color: "#6f9647", hard: 0.65 },
  2: { name: "Toprak", color: "#896044", hard: 0.6 },
  3: { name: "Taş", color: "#838b87", hard: 2, tier: 1 },
  4: { name: "Kum", color: "#dac593", hard: 0.5 },
  5: { name: "Su", color: "#438eae", hard: 0 },
  6: { name: "Kütük", color: "#786046", hard: 1.3 },
  7: { name: "Yaprak", color: "#46815a", hard: 0.25 },
  8: { name: "Tahta", color: "#c39963", hard: 0.8 },
  9: { name: "Kömür cevheri", color: "#536162", hard: 2, tier: 1, drop: 21 },
  10: { name: "Demir cevheri", color: "#b39c83", hard: 2.5, tier: 2, drop: 22 },
  11: { name: "Kristal cevheri", color: "#52d7c1", hard: 3, tier: 3, drop: 24 },
  12: { name: "Kar", color: "#d6e8e2", hard: 0.7 },
  13: { name: "Taş tuğla", color: "#6d807a", hard: 1.5, tier: 1 },
  14: { name: "Cam", color: "#a7d9d4", hard: 0.3 },
  15: { name: "Üretim tezgâhı", color: "#ae7751", hard: 1 },
  16: { name: "Fırın", color: "#4e5b60", hard: 2, tier: 1 },
  17: { name: "Meşale", color: "#f1bb55", hard: 0.1 },
  18: { name: "Fide", color: "#70b85c", hard: 0.1, drop: 26 },
  19: { name: "Olgun buğday", color: "#dfc366", hard: 0.1, drop: 27 },
  20: { name: "Ana kaya", color: "#303d3b", hard: Infinity },
  28: { name: "Yatak", color: "#b16c55", hard: 0.7 },
  29: { name: "Harabe sandığı", color: "#9c794c", hard: 0.8 },
  40: { name: "İşaret kulesi", color: "#76e1c0", hard: Infinity },
};
export const ITEMS = {
  ...BLOCKS,
  21: { name: "Kömür", color: "#363e40" },
  22: { name: "Ham demir", color: "#b99a80" },
  23: { name: "Demir külçesi", color: "#bbc9c8" },
  24: { name: "Kristal", color: "#55e5bf" },
  25: { name: "Çubuk", color: "#ab895d" },
  26: { name: "Tohum", color: "#8ec66c" },
  27: { name: "Buğday", color: "#e0c474" },
  30: { name: "Tahta kazma", color: "#b59770", tier: 1, durability: 65 },
  31: { name: "Taş kazma", color: "#9baca6", tier: 2, durability: 140 },
  32: { name: "Demir kazma", color: "#c4e2de", tier: 3, durability: 280 },
  33: { name: "Taş kılıç", color: "#a6bcb3", damage: 6, durability: 130 },
  34: { name: "Ekmek", color: "#d8a764", food: 7 },
  35: { name: "Elma", color: "#df7366", food: 4 },
  36: { name: "Pusula", color: "#a3d8d0" },
};
export const RECIPES = [
  {
    id: "plank",
    name: "4 tahta",
    out: [8, 4],
    costs: [[6, 1]],
    station: "hand",
  },
  {
    id: "stick",
    name: "4 çubuk",
    out: [25, 4],
    costs: [[8, 2]],
    station: "hand",
  },
  {
    id: "bench",
    name: "Üretim tezgâhı",
    out: [15, 1],
    costs: [[8, 4]],
    station: "hand",
  },
  {
    id: "woodpick",
    name: "Tahta kazma",
    out: [30, 1],
    costs: [
      [8, 3],
      [25, 2],
    ],
    station: "bench",
  },
  {
    id: "stonepick",
    name: "Taş kazma",
    out: [31, 1],
    costs: [
      [3, 3],
      [25, 2],
    ],
    station: "bench",
  },
  {
    id: "ironpick",
    name: "Demir kazma",
    out: [32, 1],
    costs: [
      [23, 3],
      [25, 2],
    ],
    station: "bench",
  },
  {
    id: "sword",
    name: "Taş kılıç",
    out: [33, 1],
    costs: [
      [3, 2],
      [25, 1],
    ],
    station: "bench",
  },
  {
    id: "furnace",
    name: "Fırın",
    out: [16, 1],
    costs: [[3, 8]],
    station: "bench",
  },
  {
    id: "torch",
    name: "4 meşale",
    out: [17, 4],
    costs: [
      [21, 1],
      [25, 1],
    ],
    station: "hand",
  },
  {
    id: "iron",
    name: "Demir erit",
    out: [23, 1],
    costs: [
      [22, 1],
      [21, 1],
    ],
    station: "furnace",
    seconds: 6,
  },
  {
    id: "glass",
    name: "2 cam",
    out: [14, 2],
    costs: [
      [4, 2],
      [21, 1],
    ],
    station: "furnace",
    seconds: 5,
  },
  {
    id: "brick",
    name: "4 taş tuğla",
    out: [13, 4],
    costs: [[3, 4]],
    station: "bench",
  },
  {
    id: "bread",
    name: "Ekmek",
    out: [34, 1],
    costs: [[27, 3]],
    station: "hand",
  },
  {
    id: "bed",
    name: "Yatak",
    out: [28, 1],
    costs: [
      [8, 6],
      [7, 8],
    ],
    station: "bench",
  },
  {
    id: "compass",
    name: "Pusula",
    out: [36, 1],
    costs: [
      [23, 2],
      [24, 1],
    ],
    station: "bench",
  },
];
export function hash(x, y, z, s = 1) {
  let n =
    Math.imul(x | 0, 374761393) ^
    Math.imul(y | 0, 668265263) ^
    Math.imul(z | 0, 2147483647) ^
    Math.imul(s | 0, 1274126177);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
export function seedNumber(text) {
  let n = 2166136261;
  for (const c of String(text)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return n >>> 0;
}
export function noise(x, z, scale, seed) {
  x /= scale;
  z /= scale;
  const ix = Math.floor(x),
    iz = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t),
    u = f(x - ix),
    v = f(z - iz);
  const a = hash(ix, 0, iz, seed),
    b = hash(ix + 1, 0, iz, seed),
    c = hash(ix, 0, iz + 1, seed),
    d = hash(ix + 1, 0, iz + 1, seed);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
export const index = (x, y, z) => (y * SIZE + z) * SIZE + x;
export function inside(x, y, z) {
  return x >= 0 && z >= 0 && y >= 0 && x < SIZE && z < SIZE && y < HEIGHT;
}
export function get(world, x, y, z) {
  x = Math.floor(x);
  y = Math.floor(y);
  z = Math.floor(z);
  return inside(x, y, z) ? world.blocks[index(x, y, z)] : y < 0 ? 20 : 0;
}
export const solid = (id) =>
  id > 0 && id !== 5 && id !== 17 && id !== 18 && id !== 19;
export function set(world, x, y, z, id, record = true) {
  if (!inside(x, y, z) || !Number.isInteger(id) || !(id === 0 || BLOCKS[id]))
    return false;
  const i = index(x, y, z);
  if (world.blocks[i] === id) return false;
  world.blocks[i] = id;
  if (record) world.edits.set(i, id);
  world.dirty.add(`${x >> 4},${z >> 4}`);
  for (const [dx, dz] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ])
    if (x >> 4 !== (x + dx) >> 4 || z >> 4 !== (z + dz) >> 4)
      world.dirty.add(`${(x + dx) >> 4},${(z + dz) >> 4}`);
  return true;
}
export function surface(world, x, z) {
  for (let y = HEIGHT - 1; y > 0; y--)
    if (solid(get(world, x, y, z)) && get(world, x, y, z) !== 7) return y + 1;
  return 1;
}
export function terrain(x, z, seed) {
  const region = noise(x, z, 55, seed + 91),
    hills = noise(x, z, 35, seed),
    detail = noise(x, z, 9, seed + 3);
  let h = Math.floor(13 + hills * 26 + detail * 5);
  const camp = Math.max(
    SEA + 3,
    Math.floor(
      13 + noise(80, 80, 35, seed) * 26 + noise(80, 80, 9, seed + 3) * 5,
    ),
  );
  const dist = Math.hypot(x - 80, z - 80);
  if (dist < 10) h = camp;
  else if (dist < 15)
    h = Math.round((h * (dist - 10)) / 5 + (camp * (15 - dist)) / 5);
  const biome =
    dist < 15
      ? "Yeşil ova"
      : h > 38
        ? "Kar zirveleri"
        : region > 0.65
          ? "Kum vadisi"
          : region < 0.35
            ? "Çam ormanı"
            : "Yeşil ova";
  return {
    h,
    biome,
    top:
      h <= SEA + 1 || biome === "Kum vadisi"
        ? 4
        : biome === "Kar zirveleri"
          ? 12
          : 1,
  };
}
export function* generate(seed) {
  const w = {
    seed,
    blocks: new Uint8Array(SIZE * SIZE * HEIGHT),
    edits: new Map(),
    dirty: new Set(),
    spawn: [80.5, terrain(80, 80, seed).h + 1, 80.5],
    ruin: [112, 0, 100],
    crops: new Map(),
  };
  const put = (x, y, z, id) => {
    if (inside(x, y, z)) w.blocks[index(x, y, z)] = id;
  };
  for (let z = 0; z < SIZE; z++) {
    for (let x = 0; x < SIZE; x++) {
      const { h, top } = terrain(x, z, seed);
      for (let y = 0; y <= Math.max(h, SEA); y++) {
        let id =
          y === 0
            ? 20
            : y > h
              ? 5
              : y === h
                ? top
                : y > h - 4
                  ? top === 4
                    ? 4
                    : 2
                  : 3;
        if (id === 3 && y > 3 && y < h - 6) {
          // Dalga tünelleri yüzeyin altında bağlanan mağara ağı oluşturur.
          const cave =
            Math.sin(x * 0.18 + (seed % 11)) +
            Math.sin(z * 0.15) +
            Math.sin(y * 0.48 + x * 0.08);
          if (cave > 2.25) id = 0;
          else {
            const r = hash(x, y, z, seed);
            if (r < 0.027) id = 9;
            else if (r < 0.044 && y < 26) id = 10;
            else if (r < 0.048 && y < 16) id = 11;
          }
        }
        put(x, y, z, id);
      }
    }
    if (z % 8 === 0) yield { progress: (z / SIZE) * 0.75 };
  }
  for (let z = 4; z < SIZE - 4; z++)
    for (let x = 4; x < SIZE - 4; x++) {
      const t = terrain(x, z, seed);
      if (t.top !== 1 || t.h <= SEA + 1 || Math.hypot(x - 80, z - 80) < 13)
        continue;
      if (hash(x, 1, z, seed) > (t.biome === "Çam ormanı" ? 0.987 : 0.996)) {
        const h = 4 + Math.floor(hash(x, 2, z, seed) * 3);
        for (let y = 1; y <= h; y++) put(x, t.h + y, z, 6);
        for (let dy = h - 2; dy <= h + 1; dy++)
          for (let dz = -2; dz <= 2; dz++)
            for (let dx = -2; dx <= 2; dx++)
              if (
                Math.abs(dx) + Math.abs(dz) < 4 &&
                (!dx && !dz ? dy > h : true)
              )
                put(x + dx, t.h + dy, z + dz, 7);
      }
    }
  // Başlangıç kampı ve keşfedilecek iki yapı tamamen bu oyuna aittir.
  const sy = w.spawn[1];
  put(83, sy, 80, 15);
  put(83, sy, 82, 29);
  put(78, sy, 83, 28);
  const ry = Math.max(SEA + 2, terrain(112, 100, seed).h + 1);
  w.ruin = [112, ry, 100];
  for (let z = 96; z <= 104; z++)
    for (let x = 108; x <= 116; x++) {
      for (let y = ry; y < ry + 7; y++) put(x, y, z, 0);
      put(x, ry - 1, z, 13);
      if ((x === 108 || x === 116) && (z === 96 || z === 104))
        for (let y = ry; y < ry + 5; y++) put(x, y, z, 13);
    }
  put(112, ry, 100, 40);
  put(110, ry, 100, 29);
  const cy = Math.max(SEA + 2, terrain(56, 65, seed).h + 1);
  for (let z = 62; z <= 68; z++)
    for (let x = 53; x <= 59; x++)
      for (let y = cy - 1; y <= cy + 4; y++) {
        let id = y === cy - 1 || y === cy + 4 ? 8 : 0;
        if (
          (x === 53 || x === 59 || z === 62 || z === 68) &&
          y >= cy &&
          y < cy + 4
        )
          id = 6;
        if (x === 56 && z === 68 && y < cy + 2 && y >= cy) id = 0;
        if ((x === 53 || x === 59) && z === 65 && y === cy + 2) id = 14;
        put(x, y, z, id);
      }
  put(55, cy, 64, 16);
  put(57, cy, 64, 29);
  for (let z = 0; z < 10; z++)
    for (let x = 0; x < 10; x++) w.dirty.add(`${x},${z}`);
  yield { progress: 1, world: w };
  return w;
}
export const newInventory = () => Array.from({ length: 27 }, () => null);
export function addItem(inv, id, count = 1) {
  if (!ITEMS[id] || !Number.isInteger(count) || count < 1) return false;
  const copy = inv.map((s) => (s ? { ...s } : null)),
    max = ITEMS[id].durability ? 1 : 64;
  let left = count;
  for (let i = 0; i < copy.length && left; i++)
    if (copy[i]?.id === id && copy[i].count < max) {
      const n = Math.min(left, max - copy[i].count);
      copy[i].count += n;
      left -= n;
    }
  for (let i = 0; i < copy.length && left; i++)
    if (!copy[i]) {
      const n = Math.min(left, max);
      copy[i] = {
        id,
        count: n,
        ...(ITEMS[id].durability ? { wear: ITEMS[id].durability } : {}),
      };
      left -= n;
    }
  if (left) return false;
  inv.splice(0, inv.length, ...copy);
  return true;
}
export const countItem = (inv, id) =>
  inv.reduce((n, s) => n + (s?.id === id ? s.count : 0), 0);
export function consume(inv, id, n = 1) {
  if (countItem(inv, id) < n) return false;
  for (let i = 0; i < inv.length && n; i++)
    if (inv[i]?.id === id) {
      const take = Math.min(n, inv[i].count);
      inv[i].count -= take;
      n -= take;
      if (!inv[i].count) inv[i] = null;
    }
  return true;
}
export function craft(inv, recipe, station = "hand", creative = false) {
  if (recipe.station !== "hand" && recipe.station !== station)
    return {
      ok: false,
      message:
        "Gerekli istasyona yaklaş: " +
        (recipe.station === "bench" ? "tezgâh" : "fırın"),
    };
  if (!creative && recipe.costs.some(([id, n]) => countItem(inv, id) < n))
    return { ok: false, message: "Malzeme eksik." };
  const copy = inv.map((s) => (s ? { ...s } : null));
  if (!creative) for (const [id, n] of recipe.costs) consume(copy, id, n);
  if (!addItem(copy, ...recipe.out))
    return { ok: false, message: "Envanter dolu." };
  inv.splice(0, inv.length, ...copy);
  return { ok: true };
}
export function raycast(world, origin, dir, max = 6) {
  // Voxel DDA: ince sınır geçişlerinde komşu blok doğru bulunur.
  let [x, y, z] = origin.map(Math.floor),
    last = [x, y, z],
    dist = 0;
  const p = [x, y, z],
    step = dir.map((v) => (v >= 0 ? 1 : -1)),
    delta = dir.map((v) => (v ? Math.abs(1 / v) : Infinity));
  const next = dir.map((v, i) =>
    v ? (p[i] + (v >= 0 ? 1 : 0) - origin[i]) / v : Infinity,
  );
  while (dist <= max) {
    const id = get(world, ...p);
    if (id && id !== 5)
      return { x: p[0], y: p[1], z: p[2], id, previous: last, distance: dist };
    let a =
      next[0] < next[1]
        ? next[0] < next[2]
          ? 0
          : 2
        : next[1] < next[2]
          ? 1
          : 2;
    last = [...p];
    dist = next[a];
    p[a] += step[a];
    next[a] += delta[a];
  }
  return null;
}
export function collides(world, x, y, z) {
  for (let xx = Math.floor(x - 0.29); xx <= Math.floor(x + 0.29); xx++)
    for (let zz = Math.floor(z - 0.29); zz <= Math.floor(z + 0.29); zz++)
      for (let yy = Math.floor(y + 0.02); yy <= Math.floor(y + 1.72); yy++)
        if (solid(get(world, xx, yy, zz))) return true;
  return false;
}
export function validateSave(data) {
  if (
    !data ||
    data.format !== "kutarya-blok-1" ||
    !Number.isInteger(data.seed) ||
    data.seed < 0 ||
    data.seed > 4294967295 ||
    !["survival", "creative"].includes(data.mode)
  )
    throw Error("Geçerli Blok Diyarı kaydı değil.");
  if (
    typeof data.name !== "string" ||
    data.name.length > 40 ||
    !Array.isArray(data.inventory) ||
    data.inventory.length !== 27
  )
    throw Error("Kayıt alanları geçersiz.");
  for (const s of data.inventory)
    if (
      s &&
      (!ITEMS[s.id] ||
        !Number.isInteger(s.count) ||
        s.count < 1 ||
        s.count > (ITEMS[s.id].durability ? 1 : 64) ||
        (ITEMS[s.id].durability &&
          (!Number.isFinite(s.wear) ||
            s.wear < 1 ||
            s.wear > ITEMS[s.id].durability)))
    )
      throw Error("Envanter geçersiz.");
  if (!Array.isArray(data.edits) || data.edits.length > SIZE * SIZE * HEIGHT)
    throw Error("Blok kayıtları geçersiz.");
  for (const e of data.edits)
    if (
      !Array.isArray(e) ||
      e.length !== 2 ||
      !Number.isInteger(e[0]) ||
      e[0] < 0 ||
      e[0] >= SIZE * SIZE * HEIGHT ||
      !Number.isInteger(e[1]) ||
      !(e[1] === 0 || BLOCKS[e[1]])
    )
      throw Error("Blok verisi geçersiz.");
  if (
    !Array.isArray(data.position) ||
    data.position.length !== 3 ||
    data.position.some(
      (v, i) =>
        !Number.isFinite(v) || v < 0 || v > (i === 1 ? HEIGHT + 5 : SIZE - 1),
    )
  )
    throw Error("Konum geçersiz.");
  for (const k of ["time", "health", "hunger", "yaw", "pitch"])
    if (!Number.isFinite(data[k])) throw Error("Oyuncu durumu geçersiz.");
  if (
    data.health < 0 ||
    data.health > 20 ||
    data.hunger < 0 ||
    data.hunger > 20 ||
    data.time < 0 ||
    data.time > 1e7 ||
    Math.abs(data.yaw) > 1e6 ||
    Math.abs(data.pitch) > 1.56
  )
    throw Error("Oyuncu değerleri sınır dışında.");
  if (
    !data.stats ||
    ["mined", "placed", "crafted", "kills", "days"].some(
      (k) =>
        !Number.isInteger(data.stats[k]) ||
        data.stats[k] < 0 ||
        data.stats[k] > 1e7,
    )
  )
    throw Error("İlerleme geçersiz.");
  if (typeof data.beacon !== "boolean") throw Error("Hedef kaydı geçersiz.");
  if (
    data.crops !== undefined &&
    (!Array.isArray(data.crops) ||
      data.crops.length > 10000 ||
      data.crops.some(
        (e) =>
          !Array.isArray(e) ||
          e.length !== 2 ||
          !Number.isInteger(e[0]) ||
          e[0] < 0 ||
          e[0] >= SIZE * SIZE * HEIGHT ||
          !Number.isFinite(e[1]) ||
          e[1] < 0,
      ))
  )
    throw Error("Tarım kaydı geçersiz.");
  if (
    data.smelt !== undefined &&
    data.smelt !== null &&
    (!Array.isArray(data.smelt.out) ||
      !RECIPES.some(
        (r) =>
          r.seconds &&
          r.out[0] === data.smelt.out[0] &&
          r.out[1] === data.smelt.out[1],
      ) ||
      !Number.isFinite(data.smelt.left) ||
      data.smelt.left < 0 ||
      data.smelt.left > 6)
  )
    throw Error("Fırın kaydı geçersiz.");
  return structuredClone(data);
}
