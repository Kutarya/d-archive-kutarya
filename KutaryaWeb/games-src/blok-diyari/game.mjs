import {
  SIZE,
  HEIGHT,
  SEA,
  BLOCKS,
  ITEMS,
  RECIPES,
  seedNumber,
  generate,
  terrain,
  get,
  set,
  index,
  solid,
  surface,
  raycast,
  collides,
  newInventory,
  addItem,
  countItem,
  consume,
  craft,
  validateSave,
  hash,
} from "./core.mjs";
import { Renderer } from "./renderer.mjs";
const $ = (id) => document.getElementById(id),
  canvas = $("view");
const panels = [
  "menu",
  "new-world",
  "loading",
  "pause",
  "settings",
  "help",
  "inventory",
  "quests",
  "death",
];
let renderer,
  world,
  mode = "survival",
  name = "Benim Blok Diyarı’m",
  inventory = newInventory(),
  selected = 0,
  screen = "menu",
  returnScreen = "menu",
  saved = null;
let player = {
  x: 80.5,
  y: 26,
  z: 80.5,
  yaw: 1.2,
  pitch: -0.25,
  vy: 0,
  health: 20,
  hunger: 20,
  ground: false,
  flying: false,
  breath: 10,
};
let time = 90,
  stats = { mined: 0, placed: 0, crafted: 0, kills: 0, days: 0 },
  beacon = false,
  mobs = [],
  target = null;
let keys = new Set(),
  drag = null,
  mining = false,
  mineValue = 0,
  mineGrace = 0,
  mineKey = "",
  invMove = -1,
  toastTimer = 0,
  damageFlash = 0,
  lastAttack = 0;
let smelt = null,
  hungerClock = 0,
  healClock = 0,
  mobClock = 0,
  cropClock = 0,
  saveClock = 0,
  hudClock = 0,
  mapClock = 0,
  last = 0,
  creativePage = 0;
let settings = {
    distance: 3,
    quality: 1,
    sensitivity: 4,
    touch: matchMedia("(pointer:coarse)").matches,
    sound: false,
  },
  storageOK = false,
  audio = null;
const STORE = "kutarya-blok-diyari-v1";
try {
  localStorage.setItem(STORE + "-probe", "1");
  localStorage.removeItem(STORE + "-probe");
  storageOK = true;
  const raw = localStorage.getItem(STORE);
  if (raw) saved = validateSave(JSON.parse(raw));
  const opt = JSON.parse(localStorage.getItem(STORE + "-settings") || "null");
  if (opt) {
    for (const k of ["distance", "quality", "sensitivity"])
      if (Number.isFinite(opt[k])) settings[k] = opt[k];
    settings.touch = !!opt.touch;
    settings.sound = !!opt.sound;
  }
} catch {
  saved = null;
}
settings.distance = Math.max(2, Math.min(4, settings.distance));
settings.quality = Math.max(0, Math.min(2, settings.quality));
settings.sensitivity = Math.max(1, Math.min(10, settings.sensitivity));
function toast(text) {
  $("toast").textContent = text;
  $("toast").classList.remove("hidden");
  toastTimer = 3.8;
}
function beep(freq = 330, duration = 0.06) {
  if (!settings.sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.frequency.value = freq;
    o.type = "triangle";
    g.gain.setValueAtTime(0.045, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + duration);
  } catch {
    settings.sound = false;
  }
}
function show(id) {
  screen = id;
  for (const p of panels) $(p).classList.toggle("hidden", p !== id);
  $("hud").classList.toggle("hidden", id !== "playing");
  keys.clear();
  mining = false;
  drag = null;
  if (id !== "playing" && document.pointerLockElement)
    document.exitPointerLock();
  if (id === "menu") {
    $("continue-btn").disabled = !saved && (!world || world.preview);
    $("status-note").textContent = storageOK
      ? "Dünya bu tarayıcıya otomatik kaydedilir. Ek güvence için menüden JSON kaydını indir."
      : "Bu korumalı alanda otomatik kayıt kapalı. Menüdeki “Kaydı indir” ile dünyanı sakla; ayrı sekmede otomatik kayıt kullanabilirsin.";
  }
  if (id === "pause") {
    $("save-note").textContent = storageOK
      ? "Aynı tarayıcıda devam edebilirsin."
      : "Bu oyun alanında yerel kayıt kullanılamıyor. Kaydı indirerek ilerlemeni koru.";
    $("save-btn").disabled = !storageOK;
  }
  if (id === "inventory") drawInventory();
  if (id === "quests") drawQuests();
  if (id === "settings") syncSettings();
}
function syncSettings() {
  for (const k of ["distance", "quality", "sensitivity"])
    $(k).value = settings[k];
  $("touch-toggle").checked = settings.touch;
  $("sound-toggle").checked = settings.sound;
}
function applySettings() {
  for (const k of ["distance", "quality", "sensitivity"])
    settings[k] = Number($(k).value);
  settings.touch = $("touch-toggle").checked;
  settings.sound = $("sound-toggle").checked;
  if (renderer) {
    renderer.distance = settings.distance;
    renderer.quality = settings.quality;
  }
  $("touch-controls").classList.toggle("hidden", !settings.touch);
  try {
    localStorage.setItem(STORE + "-settings", JSON.stringify(settings));
  } catch {}
}
function serialize() {
  return {
    format: "kutarya-blok-1",
    name,
    seed: world.seed,
    mode,
    inventory: inventory.map((s) => (s ? { ...s } : null)),
    edits: [...world.edits],
    position: [player.x, Math.max(0, Math.min(HEIGHT + 5, player.y)), player.z],
    yaw: player.yaw,
    pitch: player.pitch,
    health: player.health,
    hunger: player.hunger,
    time,
    stats: { ...stats },
    beacon,
    crops: [...world.crops],
  };
}
function save(notify = false) {
  if (!world || world.preview || screen === "loading") return;
  const data = serialize();
  data.smelt = smelt ? { out: [...smelt.out], left: smelt.left } : null;
  saved = data;
  if (storageOK)
    try {
      localStorage.setItem(STORE, JSON.stringify(data));
      if (notify) toast("Dünya bu tarayıcıya kaydedildi.");
    } catch {
      storageOK = false;
      if (notify) toast("Tarayıcı kaydı kullanılamıyor. Kaydı indir.");
    }
  else if (notify) toast("Kaydı indir seçeneğini kullan.");
}
function downloadSave() {
  if (!world || world.preview) return;
  save();
  const blob = new Blob([JSON.stringify(saved)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "kutarya-blok-diyari-kayit.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Dünya kaydı hazır. İçe aktararak devam edebilirsin.");
}
async function createWorld(data = null) {
  show("loading");
  $("loadingbar").firstElementChild.style.width = "0%";
  try {
    if (!renderer) renderer = new Renderer(canvas);
    renderer.distance = settings.distance;
    renderer.quality = settings.quality;
    renderer.clear();
    const seed = data
      ? data.seed
      : seedNumber($("world-seed").value || "kutarya-vadi");
    const gen = generate(seed);
    for (let item = gen.next(); !item.done; item = gen.next()) {
      $("loadingbar").firstElementChild.style.width =
        Math.floor(item.value.progress * 85) + "%";
      if (item.value.world) world = item.value.world;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    mode = data?.mode || $("world-mode").value;
    name = data?.name || $("world-name").value.trim() || "Blok Diyarı";
    inventory = data
      ? data.inventory.map((s) => (s ? { ...s } : null))
      : newInventory();
    time = data?.time ?? 90;
    stats = data
      ? { ...data.stats }
      : { mined: 0, placed: 0, crafted: 0, kills: 0, days: 0 };
    beacon = data?.beacon || false;
    if (data) {
      for (const [i, id] of data.edits) {
        world.blocks[i] = id;
        world.edits.set(i, id);
      }
      world.crops = new Map(data.crops || []);
    }
    const p = data?.position || world.spawn;
    player = {
      x: p[0],
      y: p[1],
      z: p[2],
      yaw: data?.yaw ?? 1.2,
      pitch: data?.pitch ?? -0.25,
      vy: 0,
      health: data?.health || 20,
      hunger: data?.hunger ?? 20,
      ground: false,
      flying: false,
      breath: 10,
    };
    if (collides(world, player.x, player.y, player.z)) {
      player.y = surface(world, player.x | 0, player.z | 0);
      toast("Güvenli yüzey konumuna taşındın.");
    }
    if (!data) {
      if (mode === "creative")
        for (const id of [1, 3, 6, 8, 13, 14, 17, 28, 32])
          addItem(inventory, id, ITEMS[id].durability ? 1 : 64);
      else {
        addItem(inventory, 6, 4);
        addItem(inventory, 35, 4);
        addItem(inventory, 26, 5);
        addItem(inventory, 17, 4);
      }
    }
    selected = 0;
    smelt = data?.smelt
      ? { out: [...data.smelt.out], left: data.smelt.left }
      : null;
    hungerClock = healClock = mobClock = cropClock = saveClock = 0;
    mining = false;
    mineValue = 0;
    renderer.ruin = world.ruin;
    mobs = [];
    for (const [dx, dz] of [
      [5, 7],
      [-7, 4],
      [8, -6],
    ])
      spawnMob(false, player.x + dx, player.z + dz);
    for (let i = 0; i < 10; i++) {
      renderer.update(world, [player.x, player.y, player.z], 3);
      $("loadingbar").firstElementChild.style.width = 85 + i * 1.5 + "%";
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    applySettings();
    drawHotbar();
    updateHUD();
    show("playing");
    save();
    toast(
      mode === "creative"
        ? "Yaratıcı dünya hazır. V ile uç, E ile blok kataloğunu aç."
        : "Kamp sandığını F ile aç. Tezgâh yanında E ile kazma üret.",
    );
  } catch (e) {
    show("menu");
    toast("Dünya açılamadı: " + e.message);
  }
}
function direction() {
  return [
    Math.sin(player.yaw) * Math.cos(player.pitch),
    Math.sin(player.pitch),
    -Math.cos(player.yaw) * Math.cos(player.pitch),
  ];
}
function aim() {
  return raycast(world, [player.x, player.y + 1.62, player.z], direction(), 6);
}
function nearestStation() {
  for (let y = Math.floor(player.y) - 2; y <= player.y + 3; y++)
    for (let z = Math.floor(player.z) - 4; z <= player.z + 4; z++)
      for (let x = Math.floor(player.x) - 4; x <= player.x + 4; x++)
        if (
          Math.hypot(x + 0.5 - player.x, y - player.y, z + 0.5 - player.z) <=
            4 &&
          get(world, x, y, z) === 16
        )
          return "furnace";
  for (let y = Math.floor(player.y) - 2; y <= player.y + 3; y++)
    for (let z = Math.floor(player.z) - 4; z <= player.z + 4; z++)
      for (let x = Math.floor(player.x) - 4; x <= player.x + 4; x++)
        if (
          Math.hypot(x + 0.5 - player.x, y - player.y, z + 0.5 - player.z) <=
            4 &&
          get(world, x, y, z) === 15
        )
          return "bench";
  return "hand";
}
function stationAvailable(station) {
  if (station === "hand") return true;
  for (let z = Math.floor(player.z) - 4; z <= player.z + 4; z++)
    for (let x = Math.floor(player.x) - 4; x <= player.x + 4; x++)
      for (let y = Math.floor(player.y) - 2; y <= player.y + 3; y++)
        if (
          Math.hypot(x + 0.5 - player.x, y - player.y, z + 0.5 - player.z) <=
            4 &&
          get(world, x, y, z) === (station === "bench" ? 15 : 16)
        )
          return true;
  return false;
}
function slotHTML(slot, i, sel) {
  const item = slot && ITEMS[slot.id];
  return `<button class="slot ${sel ? "selected" : ""}" data-slot="${i}" title="${item ? item.name + " · " + slot.count : "Boş yuva"}" aria-label="${i + 1}. yuva: ${item ? item.name + " " + slot.count : "boş"}"><small>${i < 9 ? i + 1 : ""}</small>${item ? `<span class="tile ${item.durability ? "tool" : ""}" style="--c:${item.color}"></span><b>${slot.count}</b>${slot.wear ? "<em>" + Math.ceil((slot.wear / item.durability) * 100) + "%</em>" : ""}` : ""}</button>`;
}
function drawHotbar() {
  $("hotbar").innerHTML = inventory
    .slice(0, 9)
    .map((s, i) => slotHTML(s, i, i === selected))
    .join("");
  $("selected-label").textContent = inventory[selected]
    ? ITEMS[inventory[selected].id].name
    : "Boş el";
}
function drawInventory() {
  $("inventory-grid").innerHTML = inventory
    .map((s, i) => slotHTML(s, i, i === invMove || i === selected))
    .join("");
  $("inventory-note").textContent =
    mode === "creative"
      ? "Yaratıcı: malzemeler sınırsız. Katalogdan bir bloğu hızlı yuvana alabilirsin."
      : "Hızlı yuvalar ilk satırdır. Yiyeceği hızlı yuvada seçip R ile yiyebilirsin.";
  $("creative-next").classList.toggle("hidden", mode !== "creative");
  const stations = [
    "hand",
    ...(stationAvailable("bench") ? ["bench"] : []),
    ...(stationAvailable("furnace") ? ["furnace"] : []),
  ];
  $("station-label").textContent =
    "Üretim · " +
    stations
      .map((s) => ({ hand: "El", bench: "Tezgâh", furnace: "Fırın" })[s])
      .join(" + ");
  if (mode === "creative") {
    const ids = Object.keys(ITEMS)
        .map(Number)
        .filter((id) => id !== 5 && id !== 20 && id !== 40),
      chunk = ids.slice(creativePage * 12, creativePage * 12 + 12);
    $("recipes").innerHTML = chunk
      .map(
        (id) =>
          `<div class="recipe"><span>${ITEMS[id].name}<small>Hızlı yuvana al</small></span><button data-creative="${id}">Al</button></div>`,
      )
      .join("");
  } else
    $("recipes").innerHTML = RECIPES.map((r) => {
      const available =
        stations.includes(r.station) &&
        r.costs.every(([id, n]) => countItem(inventory, id) >= n) &&
        (!r.seconds || !smelt);
      return `<div class="recipe"><span>${r.name}<small>${r.costs.map(([id, n]) => n + " " + ITEMS[id].name).join(" · ")}${r.seconds ? " · " + r.seconds + " sn" : ""}</small></span><button data-recipe="${r.id}" ${available ? "" : "disabled"}>Üret</button></div>`;
    }).join("");
  $("smelting").textContent = smelt
    ? "Fırın çalışıyor: " + Math.ceil(smelt.left) + " sn"
    : "";
}
function makeRecipe(id) {
  const r = RECIPES.find((r) => r.id === id);
  if (!r) return;
  const station = stationAvailable(r.station) ? r.station : "hand";
  if (r.seconds) {
    if (smelt) return;
    const copy = inventory.map((s) => (s ? { ...s } : null)),
      result = craft(copy, r, station);
    if (!result.ok) return toast(result.message);
    for (const [item, n] of r.costs) consume(inventory, item, n);
    smelt = { out: r.out, left: r.seconds };
    toast("Fırın çalışmaya başladı.");
  } else {
    const result = craft(inventory, r, station);
    if (!result.ok) return toast(result.message);
    stats.crafted++;
    beep(520);
    toast(r.name + " üretildi.");
  }
  drawInventory();
  drawHotbar();
  save();
}
function wearTool() {
  const item = inventory[selected];
  if (item?.wear && mode !== "creative") {
    item.wear--;
    if (item.wear <= 0) {
      toast(ITEMS[item.id].name + " kırıldı.");
      inventory[selected] = null;
    }
  }
}
function addDrop(id, n = 1) {
  if (mode === "creative") return true;
  const ok = addItem(inventory, id, n);
  if (!ok) toast("Çanta dolu. Önce bir yuva boşalt.");
  return ok;
}
function hitMob() {
  const dir = direction();
  const m = mobs.find((m) => {
    const dx = m.x - player.x,
      dy = m.y + 0.9 - player.y - 1.62,
      dz = m.z - player.z,
      dist = Math.hypot(dx, dy, dz);
    return (
      dist < 3.5 && (dx * dir[0] + dy * dir[1] + dz * dir[2]) / dist > 0.86
    );
  });
  if (!m || time - lastAttack < 0.45) return false;
  lastAttack = time;
  m.hp -= ITEMS[inventory[selected]?.id]?.damage || 2;
  m.x = Math.max(1, Math.min(SIZE - 2, m.x + dir[0] * 0.6));
  m.z = Math.max(1, Math.min(SIZE - 2, m.z + dir[2] * 0.6));
  wearTool();
  beep(180);
  if (m.hp <= 0) {
    if (m.hostile) {
      stats.kills++;
      addDrop(21);
      toast("Gece gölgesi dağıldı.");
    } else {
      addDrop(35, 2);
      toast("2 elma toplandı.");
    }
    mobs = mobs.filter((v) => v !== m);
  }
  drawHotbar();
  return true;
}
function mineStep(dt, force = false) {
  if (force) mineGrace = 1.5;
  if (!world || screen !== "playing") return;
  if (hitMob()) {
    mineValue = 0;
    return;
  }
  target = aim();
  if (!target) {
    mineValue = 0;
    return;
  }
  const b = BLOCKS[target.id],
    key = `${target.x},${target.y},${target.z}`;
  if (key !== mineKey) {
    mineValue = 0;
    mineKey = key;
  }
  if (!Number.isFinite(b.hard)) {
    if (force)
      toast(
        target.id === 40 ? "Kuleyi F ile etkinleştir." : "Ana kaya kırılamaz.",
      );
    return;
  }
  const tool = ITEMS[inventory[selected]?.id],
    tier = tool?.tier || 0;
  if (mode !== "creative" && b.tier && tier < b.tier) {
    if (force) toast("Daha iyi bir kazma gerekiyor.");
    return;
  }
  mineValue +=
    mode === "creative"
      ? 1
      : ((force ? 0.45 : dt) * (tier ? 1.7 + tier * 0.45 : 1)) /
        Math.max(0.2, b.hard);
  if (mineValue < 1) return;
  let drop = b.drop || target.id;
  if (target.id === 1) drop = 2;
  if (target.id === 19) {
    const copy = inventory.map((s) => (s ? { ...s } : null));
    if (
      mode !== "creative" &&
      (!addItem(copy, 27, 2) || !addItem(copy, 26, 2))
    ) {
      toast("Hasat için çantada yer aç.");
      return;
    }
    if (mode !== "creative") inventory = copy;
  } else if (target.id === 29) {
    interact();
    mineValue = 0;
    return;
  } else if (!addDrop(drop)) {
    mineValue = 0;
    return;
  }
  if (
    target.id === 7 &&
    mode !== "creative" &&
    hash(target.x, target.y, target.z, world.seed) > 0.65
  )
    addDrop(26);
  set(world, target.x, target.y, target.z, 0);
  world.crops.delete(index(target.x, target.y, target.z));
  stats.mined++;
  wearTool();
  mineValue = 0;
  beep(230);
  drawHotbar();
}
function place() {
  if (screen !== "playing") return;
  target = aim();
  const s = inventory[selected];
  if (!target || !s)
    return toast("Bir yüzeye nişan al ve hızlı yuvadan blok seç.");
  let id = s.id;
  if (id === 26) id = 18;
  if (!BLOCKS[id] || [5, 19, 20, 29, 40].includes(id))
    return toast("Bu eşya blok olarak yerleştirilemez.");
  const [x, y, z] = target.previous;
  if (!(
    x >= 1 &&
    x < SIZE - 1 &&
    z >= 1 &&
    z < SIZE - 1 &&
    y >= 1 &&
    y < HEIGHT - 1
  ))
    return toast("Dünya sınırına ulaştın.");
  if (
    x >= Math.floor(player.x - 0.29) &&
    x <= Math.floor(player.x + 0.29) &&
    z >= Math.floor(player.z - 0.29) &&
    z <= Math.floor(player.z + 0.29) &&
    y >= Math.floor(player.y) &&
    y <= Math.floor(player.y + 1.72)
  )
    return toast("Kendi bulunduğun yere blok koyamazsın.");
  if (id === 18 && ![1, 2].includes(get(world, x, y - 1, z)))
    return toast("Tohumu toprak veya çimen üstüne ek.");
  if (get(world, x, y, z) !== 0 && get(world, x, y, z) !== 5) return;
  set(world, x, y, z, id);
  if (id === 18) world.crops.set(index(x, y, z), time);
  if (mode !== "creative") consume(inventory, s.id);
  stats.placed++;
  beep(360);
  drawHotbar();
}
function eat() {
  const s = inventory[selected],
    b = ITEMS[s?.id];
  if (!b?.food) return toast("Hızlı yuvada bir elma veya ekmek seç.");
  if (player.hunger >= 20) return toast("Şu an toksun.");
  player.hunger = Math.min(20, player.hunger + b.food);
  if (mode !== "creative") consume(inventory, s.id);
  drawHotbar();
  if (screen === "inventory") drawInventory();
  toast(b.name + " yedin.");
  beep(440);
}
function interact() {
  if (screen !== "playing") return;
  target = aim();
  if (!target) return eat();
  const id = target.id;
  if (id === 15 || id === 16) {
    show("inventory");
    return;
  }
  if (id === 29) {
    const copy = inventory.map((s) => (s ? { ...s } : null)),
      loot = [
        [35, 3],
        [21, 3],
        [26, 4],
        [3, 6],
      ];
    if (mode !== "creative" && loot.some(([id, n]) => !addItem(copy, id, n)))
      return toast("Sandık için çantada yer aç.");
    if (mode !== "creative") inventory = copy;
    set(world, target.x, target.y, target.z, 8);
    drawHotbar();
    toast("Sandık: elma, kömür, tohum ve taş topladın.");
    save();
    return;
  }
  if (id === 28) {
    if ((time % 480) / 480 < 0.48)
      return toast("Gündüz. Gece olunca yatakta dinlenebilirsin.");
    time = (Math.floor(time / 480) + 1) * 480 + 30;
    player.health = 20;
    player.hunger = Math.max(12, player.hunger);
    mobs = mobs.filter((m) => !m.hostile);
    stats.days++;
    toast("Günaydın. Yeni bir keşif seni bekliyor.");
    save();
    return;
  }
  if (id === 40) {
    if (beacon) return toast("Kulenin ışığı yanıyor. Dünya artık senin.");
    if (
      mode !== "creative" &&
      (countItem(inventory, 23) < 5 || countItem(inventory, 24) < 3)
    )
      return toast("Kule için 5 demir külçesi ve 3 kristal gerekiyor.");
    if (mode !== "creative") {
      consume(inventory, 23, 5);
      consume(inventory, 24, 3);
    }
    beacon = true;
    drawHotbar();
    save();
    beep(660, 0.5);
    toast(
      "Kulenin ışığı yandı! Macerayı tamamladın; inşa etmeye devam edebilirsin.",
    );
    return;
  }
  if (id === 19) {
    mineValue = 1;
    mineStep(0.1, true);
    return;
  }
  eat();
}
function damage(n) {
  if (mode === "creative" || screen !== "playing") return;
  player.health = Math.max(0, player.health - n);
  damageFlash = 0.65;
  beep(110, 0.13);
  if (player.health === 0) {
    save();
    show("death");
  }
}
function spawnMob(hostile, x, z) {
  x = Math.max(2, Math.min(SIZE - 3, x));
  z = Math.max(2, Math.min(SIZE - 3, z));
  const y = surface(world, Math.floor(x), Math.floor(z));
  if (get(world, x, y - 1, z) === 5 || y < SEA) return;
  mobs.push({
    hostile,
    x,
    y,
    z,
    hp: hostile ? 12 : 6,
    phase: Math.random() * 8,
    angle: Math.random() * Math.PI * 2,
    attack: 0,
  });
}
function movePlayer(dt) {
  const f = (keys.has("KeyW") ? 1 : 0) - (keys.has("KeyS") ? 1 : 0),
    s = (keys.has("KeyD") ? 1 : 0) - (keys.has("KeyA") ? 1 : 0),
    run = keys.has("ShiftLeft") && player.hunger > 2;
  let dx = Math.sin(player.yaw) * f + Math.cos(player.yaw) * s,
    dz = -Math.cos(player.yaw) * f + Math.sin(player.yaw) * s;
  const len = Math.hypot(dx, dz) || 1,
    speed = player.flying ? 9 : run ? 6.3 : 4.2;
  const water = get(world, player.x, player.y + 0.8, player.z) === 5;
  dx = (dx / len) * speed * dt * (water ? 0.62 : 1);
  dz = (dz / len) * speed * dt * (water ? 0.62 : 1);
  if (player.flying) {
    player.x = Math.max(1, Math.min(SIZE - 2, player.x + dx));
    player.z = Math.max(1, Math.min(SIZE - 2, player.z + dz));
    player.y = Math.max(
      1,
      Math.min(
        HEIGHT + 3,
        player.y +
          ((keys.has("Space") ? 1 : 0) - (keys.has("KeyQ") ? 1 : 0)) *
            speed *
            dt,
      ),
    );
    player.vy = 0;
  } else {
    const nx = Math.max(1, Math.min(SIZE - 2, player.x + dx));
    if (!collides(world, nx, player.y, player.z)) player.x = nx;
    const nz = Math.max(1, Math.min(SIZE - 2, player.z + dz));
    if (!collides(world, player.x, player.y, nz)) player.z = nz;
    if (keys.has("Space") && (player.ground || water)) {
      player.vy = water ? 3 : 7.6;
      player.ground = false;
    }
    player.vy = Math.max(-25, player.vy - (water ? 5 : 22) * dt);
    if (water) player.vy = Math.max(-3, player.vy);
    const steps = Math.max(1, Math.ceil(Math.abs(player.vy * dt) / 0.18)),
      dy = (player.vy * dt) / steps;
    player.ground = false;
    for (let i = 0; i < steps; i++) {
      if (collides(world, player.x, player.y + dy, player.z)) {
        if (dy < 0) {
          player.ground = true;
          if (player.vy < -12 && !water)
            damage(Math.ceil((-player.vy - 12) * 0.7));
        }
        player.vy = 0;
        break;
      }
      player.y += dy;
    }
  }
  if (player.y < 0.5) {
    player.x = world.spawn[0];
    player.z = world.spawn[2];
    player.y = world.spawn[1];
    player.vy = 0;
    damage(5);
  }
  if (mode === "survival") {
    hungerClock += dt * (f || s ? (run ? 2 : 1) : 0.35);
    if (hungerClock >= 22) {
      hungerClock = 0;
      player.hunger = Math.max(0, player.hunger - 1);
    }
    healClock += dt;
    if (healClock > 5) {
      healClock = 0;
      if (player.hunger >= 14 && player.health < 20) {
        player.health++;
        player.hunger--;
      } else if (player.hunger === 0 && player.health > 1) damage(1);
    }
    if (get(world, player.x, player.y + 1.62, player.z) === 5) {
      player.breath -= dt;
      if (player.breath <= 0) {
        player.breath = 1;
        damage(2);
      }
    } else player.breath = Math.min(10, player.breath + dt * 3);
  }
}
function updateMobs(dt) {
  const night = time % 480 > 250;
  mobClock += dt;
  if (mobClock > 8) {
    mobClock = 0;
    if (
      night &&
      mode === "survival" &&
      mobs.filter((m) => m.hostile).length < 7
    ) {
      const a = Math.random() * Math.PI * 2;
      spawnMob(true, player.x + Math.sin(a) * 16, player.z + Math.cos(a) * 16);
    }
    if (!night) mobs = mobs.filter((m) => !m.hostile);
  }
  for (const m of mobs) {
    m.phase += dt * 4;
    m.attack -= dt;
    let a = m.angle;
    const dist = Math.hypot(player.x - m.x, player.z - m.z);
    if (m.hostile && dist < 22) a = Math.atan2(player.x - m.x, player.z - m.z);
    else if (Math.random() < dt * 0.6) m.angle += Math.random() * 2 - 1;
    const speed = m.hostile ? 1.5 : 0.55,
      nx = Math.max(1, Math.min(SIZE - 2, m.x + Math.sin(a) * speed * dt)),
      nz = Math.max(1, Math.min(SIZE - 2, m.z + Math.cos(a) * speed * dt)),
      y = surface(world, nx | 0, nz | 0);
    if (
      Math.abs(y - m.y) <= 1 &&
      get(world, nx, y - 1, nz) !== 5 &&
      Math.hypot(nx - player.x, nz - player.z) > 0.7
    ) {
      m.x = nx;
      m.z = nz;
      m.y = y;
    } else m.angle += dt;
    if (
      m.hostile &&
      dist < 1.5 &&
      Math.abs(m.y - player.y) < 2 &&
      m.attack <= 0
    ) {
      m.attack = 1.4;
      damage(2);
    }
  }
}
function drawMap() {
  const ctx = $("map").getContext("2d"),
    s = 104;
  for (let z = 0; z < s; z++)
    for (let x = 0; x < s; x++) {
      const t = terrain((x / s) * SIZE, (z / s) * SIZE, world.seed);
      ctx.fillStyle =
        t.h < SEA
          ? "#407b92"
          : t.top === 4
            ? "#c6b784"
            : t.top === 12
              ? "#d9e8dd"
              : t.biome === "Çam ormanı"
                ? "#456b45"
                : "#80965b";
      ctx.fillRect(x, z, 1, 1);
    }
  ctx.fillStyle = "#e5c787";
  for (const p of [
    [83, 82],
    [56, 65],
  ])
    ctx.fillRect((p[0] / SIZE) * s - 2, (p[1] / SIZE) * s - 2, 4, 4);
  ctx.fillStyle = "#a3ffe0";
  ctx.fillRect(
    (world.ruin[0] / SIZE) * s - 2,
    (world.ruin[2] / SIZE) * s - 2,
    5,
    5,
  );
  ctx.save();
  ctx.translate((player.x / SIZE) * s, (player.z / SIZE) * s);
  ctx.rotate(player.yaw);
  ctx.fillStyle = "#fff7c9";
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(-3, 3);
  ctx.lineTo(3, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function updateHUD() {
  if (!world) return;
  if (inventory[selected]?.id === 36) {
    const distance = Math.round(
      Math.hypot(world.ruin[0] - player.x, world.ruin[2] - player.z),
    );
    const angle = Math.atan2(
      world.ruin[0] - player.x,
      -(world.ruin[2] - player.z),
    );
    const relative = Math.atan2(
      Math.sin(angle - player.yaw),
      Math.cos(angle - player.yaw),
    );
    $("selected-label").textContent =
      `Pusula · Kule ${distance} blok · ${Math.abs(relative) < 0.35 ? "önünde" : relative > 0 ? "sağında" : "solunda"}`;
  }
  $("world-label").textContent =
    name + " · " + (mode === "creative" ? "Yaratıcı" : "Hayatta kalma");
  $("location").textContent =
    terrain(player.x, player.z, world.seed).biome +
    " · " +
    Math.floor(player.x) +
    ", " +
    Math.floor(player.y) +
    ", " +
    Math.floor(player.z);
  $("vitals").innerHTML =
    `<span>♥ ${player.health}/20</span><span>◒ ${player.hunger}/20</span>${player.breath < 9 ? "<span>≈ " + Math.ceil(player.breath) + "/10</span>" : ""}`;
  const hour = Math.floor(((time % 480) / 480) * 24 + 6) % 24;
  $("clock").textContent =
    "Gün " +
    (Math.floor(time / 480) + 1) +
    " · " +
    String(hour).padStart(2, "0") +
    ":" +
    String(Math.floor(((time % 20) / 20) * 60)).padStart(2, "0") +
    (player.flying ? " · Uçuş" : "");
  $("target-label").textContent = target
    ? BLOCKS[target.id].name +
      ([15, 16, 28, 29, 40].includes(target.id) ? " · F" : "")
    : "";
  $("mine-progress").value = mineValue;
}
function drawQuests() {
  const tier = Math.max(0, ...inventory.map((s) => ITEMS[s?.id]?.tier || 0));
  const tasks = [
    ["İlk kaynaklar", "6 blok çıkar.", stats.mined >= 6],
    [
      "Üretmeye başla",
      "En az 3 üretim yap; tezgâhın yanına yaklaş.",
      stats.crafted >= 3,
    ],
    [
      "Derinlere in",
      "Taş veya demir kazma üret ve maden bul.",
      tier >= 2 || beacon,
    ],
    [
      "Kuleyi uyandır",
      "Harabe: " +
        world.ruin[0] +
        ", " +
        world.ruin[1] +
        ", " +
        world.ruin[2] +
        ". 5 demir külçesi ve 3 kristal götür.",
      beacon,
    ],
  ];
  $("quest-list").innerHTML = tasks
    .map(
      ([title, desc, done], i) =>
        `<div class="quest ${done ? "done" : ""}"><strong>${done ? "✓" : String(i + 1).padStart(2, "0")} · ${title}</strong>${desc}</div>`,
    )
    .join("");
  $("stats").textContent =
    `${stats.mined} blok kazıldı · ${stats.placed} blok yerleştirildi · ${stats.crafted} üretim · ${stats.kills} gece gölgesi` +
    (beacon ? " · Kule etkin" : "");
}
function resume() {
  show("playing");
  drawHotbar();
  canvas.focus();
}
function unlock() {
  if (document.pointerLockElement) document.exitPointerLock();
}
function requestLock() {
  try {
    const p = canvas.requestPointerLock?.();
    p?.catch?.(() => {});
  } catch {}
}
function look(dx, dy) {
  player.yaw += dx * 0.001 * settings.sensitivity;
  player.yaw %= Math.PI * 2;
  player.pitch = Math.max(
    -1.5,
    Math.min(1.5, player.pitch - dy * 0.001 * settings.sensitivity),
  );
}
function clearInput() {
  keys.clear();
  mining = false;
  drag = null;
}
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
let hadPointerLock = false;
document.addEventListener("pointerlockchange", () => {
  const locked = document.pointerLockElement === canvas;
  if (hadPointerLock && !locked && screen === "playing") show("pause");
  hadPointerLock = locked;
});
canvas.addEventListener("pointerdown", (e) => {
  if (screen !== "playing") return;
  e.preventDefault();
  canvas.focus();
  if (e.button === 2) {
    place();
    return;
  }
  if (e.pointerType === "touch") {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    return;
  }
  drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
  mining = true;
  if (mode === "creative") mineStep(0.1, true);
  requestLock();
});
document.addEventListener("pointermove", (e) => {
  if (screen !== "playing") return;
  if (document.pointerLockElement === canvas) {
    look(e.movementX, e.movementY);
    return;
  }
  if (drag && drag.id === e.pointerId) {
    look(e.clientX - drag.x, e.clientY - drag.y);
    drag.x = e.clientX;
    drag.y = e.clientY;
    mining = false;
  }
});
document.addEventListener("pointerup", () => {
  drag = null;
  mining = false;
});
document.addEventListener("pointercancel", clearInput);
canvas.addEventListener(
  "wheel",
  (e) => {
    if (screen !== "playing") return;
    e.preventDefault();
    selected = (selected + (e.deltaY > 0 ? 1 : 8)) % 9;
    drawHotbar();
  },
  { passive: false },
);
document.addEventListener("keydown", (e) => {
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  const k = e.code;
  if (k === "Escape") {
    e.preventDefault();
    if (screen === "playing") show("pause");
    else if (["inventory", "quests", "pause"].includes(screen)) resume();
    else if (["help", "settings", "new-world"].includes(screen))
      show(returnScreen);
    return;
  }
  if (
    (k === "KeyE" || k === "KeyM") &&
    ["playing", "inventory", "quests"].includes(screen)
  ) {
    e.preventDefault();
    if (e.repeat) return;
    if (screen !== "playing") resume();
    else show(k === "KeyE" ? "inventory" : "quests");
    return;
  }
  if (screen !== "playing") return;
  if (
    ["Space", "KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "KeyQ"].includes(k)
  ) {
    e.preventDefault();
    keys.add(k);
  }
  if (e.repeat) return;
  if (/^Digit[1-9]$/.test(k)) {
    selected = Number(k.slice(-1)) - 1;
    drawHotbar();
  }
  if (k === "KeyF") interact();
  if (k === "KeyR") eat();
  if (k === "KeyV" && mode === "creative") {
    player.flying = !player.flying;
    player.vy = 0;
    toast(player.flying ? "Uçuş açık. Space yüksel, Q alçal." : "Uçuş kapalı.");
  }
});
document.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  clearInput();
  if (screen === "playing") show("pause");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    if (screen === "playing") show("pause");
    save();
  }
});
window.addEventListener("pagehide", () => save());
$("hotbar").addEventListener("click", (e) => {
  const b = e.target.closest("[data-slot]");
  if (b) {
    selected = Number(b.dataset.slot);
    drawHotbar();
  }
});
$("inventory-grid").addEventListener("click", (e) => {
  const b = e.target.closest("[data-slot]");
  if (!b) return;
  const i = Number(b.dataset.slot);
  if (i < 9) selected = i;
  if (invMove < 0) {
    invMove = i;
    $("item-info").textContent = inventory[i]
      ? ITEMS[inventory[i].id].name + " · Başka bir yuvaya tıklayarak taşı."
      : "Boş yuva seçildi. Bir eşya seçerek yerlerini değiştir.";
  } else {
    [inventory[i], inventory[invMove]] = [inventory[invMove], inventory[i]];
    invMove = -1;
    $("item-info").textContent = "Yuvalar değiştirildi.";
    drawHotbar();
    save();
  }
  drawInventory();
});
$("recipes").addEventListener("click", (e) => {
  const recipe = e.target.closest("[data-recipe]"),
    block = e.target.closest("[data-creative]");
  if (recipe) makeRecipe(recipe.dataset.recipe);
  if (block) {
    const id = Number(block.dataset.creative);
    inventory[selected] = {
      id,
      count: ITEMS[id].durability ? 1 : 64,
      ...(ITEMS[id].durability ? { wear: ITEMS[id].durability } : {}),
    };
    drawInventory();
    drawHotbar();
    save();
    toast(ITEMS[id].name + " hızlı yuvaya alındı.");
  }
});
$("creative-next").onclick = () => {
  const count = Object.keys(ITEMS).filter(
    (id) => ![5, 20, 40].includes(Number(id)),
  ).length;
  creativePage = (creativePage + 1) % Math.ceil(count / 12);
  drawInventory();
};
for (const button of document.querySelectorAll("[data-key]")) {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    keys.add(button.dataset.key);
    button.setPointerCapture(e.pointerId);
  });
  button.addEventListener("pointerup", () => keys.delete(button.dataset.key));
  button.addEventListener("pointercancel", () =>
    keys.delete(button.dataset.key),
  );
}
$("touch-mine").onclick = () => mineStep(0.2, true);
$("touch-place").onclick = place;
$("touch-use").onclick = interact;
$("new-btn").onclick = () => {
  if (world && !world.preview) save();
  returnScreen = "menu";
  show("new-world");
};
$("create-btn").onclick = () => createWorld();
$("continue-btn").onclick = () => {
  if (world && !world.preview) resume();
  else if (saved) createWorld(saved);
};
for (const [id, panel, back] of [
  ["settings-menu", "settings", "menu"],
  ["help-menu", "help", "menu"],
  ["settings-pause", "settings", "pause"],
  ["help-pause", "help", "pause"],
])
  $(id).onclick = () => {
    returnScreen = back;
    show(panel);
  };
for (const button of document.querySelectorAll("[data-back]"))
  button.onclick = () => {
    if (screen === "settings") applySettings();
    show(returnScreen);
  };
$("bag-btn").onclick = () => show("inventory");
$("quest-btn").onclick = () => show("quests");
$("pause-btn").onclick = () => show("pause");
$("close-bag").onclick = resume;
$("close-quests").onclick = resume;
$("resume-btn").onclick = resume;
$("save-btn").onclick = () => save(true);
$("export-btn").onclick = downloadSave;
$("eat-btn").onclick = eat;
$("return-menu").onclick = () => {
  save();
  show("menu");
};
$("respawn-btn").onclick = () => {
  player.x = world.spawn[0];
  player.z = world.spawn[2];
  player.y = surface(world, 80, 80);
  player.vy = 0;
  player.health = 20;
  player.hunger = 14;
  player.breath = 10;
  player.flying = false;
  mobs = mobs.filter((m) => !m.hostile);
  resume();
  save();
};
$("import-menu").onclick = () => $("import-file").click();
$("import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    if (file.size > 12 * 1024 * 1024) throw Error("Kayıt dosyası çok büyük.");
    const data = validateSave(JSON.parse(await file.text()));
    await createWorld(data);
  } catch (error) {
    toast("Kayıt yüklenmedi: " + error.message);
  }
});
function frame(now) {
  const dt = Math.min(0.045, Math.max(0, (now - last) / 1000));
  last = now;
  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) $("toast").classList.add("hidden");
  }
  if (world && renderer && screen !== "loading") {
    if (screen === "playing") {
      const previousDay = Math.floor(time / 480);
      time += dt;
      if (Math.floor(time / 480) > previousDay) stats.days++;
      movePlayer(dt);
      updateMobs(dt);
      target = aim();
      mineGrace = Math.max(0, mineGrace - dt);
      if (mining) mineStep(dt);
      else if (mineGrace === 0) mineValue = 0;
      cropClock += dt;
      if (cropClock > 3) {
        cropClock = 0;
        for (const [i, planted] of world.crops)
          if (time - planted > 80) {
            const y = Math.floor(i / (SIZE * SIZE)),
              z = Math.floor(i / SIZE) % SIZE,
              x = i % SIZE;
            if (get(world, x, y, z) === 18) set(world, x, y, z, 19);
            world.crops.delete(i);
          }
      }
      saveClock += dt;
      if (saveClock > 25) {
        saveClock = 0;
        save();
      }
      hudClock += dt;
      if (hudClock > 0.15) {
        hudClock = 0;
        updateHUD();
      }
      mapClock += dt;
      if (mapClock > 0.4) {
        mapClock = 0;
        drawMap();
      }
    }
    if (smelt && ["playing", "inventory"].includes(screen)) {
      smelt.left -= dt;
      if (smelt.left <= 0) {
        if (addItem(inventory, ...smelt.out)) {
          stats.crafted++;
          toast(ITEMS[smelt.out[0]].name + " hazır.");
          smelt = null;
          drawHotbar();
          if (screen === "inventory") drawInventory();
          save();
        } else {
          smelt.left = 0;
          $("smelting").textContent = "Ürün hazır. Çantada yer aç.";
        }
      } else if (screen === "inventory")
        $("smelting").textContent =
          "Fırın çalışıyor: " + Math.ceil(smelt.left) + " sn";
    }
    damageFlash = Math.max(0, damageFlash - dt);
    $("damage").style.opacity = damageFlash;
    renderer.update(world, [player.x, player.y, player.z]);
    renderer.render(
      player,
      time,
      mobs,
      screen === "playing" ? target : null,
      beacon,
    );
  }
  requestAnimationFrame(frame);
}
show("menu");
syncSettings();
requestAnimationFrame(frame);
// Menüde aynı çizim motorundan gerçek dünya önizlemesi; bağımsız görsel gerekmez.
$("new-btn").disabled = true;
$("continue-btn").disabled = true;
(async () => {
  try {
    renderer = new Renderer(canvas);
    renderer.distance = settings.distance;
    renderer.quality = settings.quality;
    const gen = generate(seedNumber("kutarya-vadi"));
    for (let item = gen.next(); !item.done; item = gen.next()) {
      if (item.value.world) {
        world = item.value.world;
        world.preview = true;
      }
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    renderer.ruin = world.ruin;
    for (let i = 0; i < 8; i++) {
      player.y = world.spawn[1] + 7;
      player.z = 88;
      player.yaw = 0.6;
      player.pitch = -0.35;
      renderer.update(world, [player.x, player.y, player.z], 3);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    $("continue-btn").disabled = !saved;
    $("new-btn").disabled = false;
  } catch (e) {
    toast(e.message);
    $("new-btn").disabled = true;
  }
})();
