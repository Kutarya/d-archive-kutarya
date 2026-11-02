// Hasar, hareket ve skor istemciden alınmaz; her oda sunucuda simüle edilir.
import { randomBytes, randomInt } from "node:crypto";
import { createWorld, WEAPONS } from "./rules.mjs";
import { arenaStepMotion, ARENA_STEP } from "./movement.mjs";
export const VERSION = "2.1.0";
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const finite = (v, a, b) =>
  typeof v === "number" && Number.isFinite(v) && v >= a && v <= b;
export const direction = (yaw, pitch) => [
  Math.sin(yaw) * Math.cos(pitch),
  Math.sin(pitch),
  -Math.cos(yaw) * Math.cos(pitch),
];
const neutral = () => ({
  f: 0,
  r: 0,
  yaw: 0,
  pitch: 0,
  fire: false,
  ads: false,
  sprint: false,
  jump: false,
  dash: false,
});
const colors = ["#7cf4c4", "#ff9478", "#73caff", "#a99cff", "#ffdc70"];
export function cleanName(v) {
  return (
    String(v || "OYUNCU")
      .normalize("NFC")
      .replace(/[\u0000-\u001f\u007f-\u009f<>]/g, "")
      .trim()
      .slice(0, 18) || "OYUNCU"
  );
}
export function validInput(p) {
  return (
    p &&
    finite(p.f, -1, 1) &&
    finite(p.r, -1, 1) &&
    finite(p.yaw, -10000, 10000) &&
    finite(p.pitch, -1.45, 1.45) &&
    ["fire", "ads", "sprint", "jump", "dash"].every(
      (k) => typeof p[k] === "boolean",
    )
  );
}
export class Room {
  constructor(code, opts = {}, now = Date.now()) {
    this.code = code;
    this.mapIndex =
      Number.isInteger(opts.map) && opts.map >= 0 && opts.map < 3
        ? opts.map
        : 0;
    this.mode = opts.mode === 1 ? 1 : 0;
    this.duration = [180, 300, 600].includes(opts.duration)
      ? opts.duration
      : 180;
    this.world = createWorld(this.mapIndex);
    this.players = new Map();
    this.host = null;
    this.phase = "lobby";
    this.elapsed = 0;
    this.countdown = 0;
    this.scores = [0, 0];
    this.events = [];
    this.eventId = 0;
    this.createdAt = now;
    this.lastActivity = now;
    this.round = 0;
    this.grenades = [];
    this.pickups = Array.from({ length: 9 }, (_, i) => {
      const s =
        this.world.map.spawns[(i * 67 + 28) % this.world.map.spawns.length];
      return { x: s.x, z: s.z, type: i % 3, timer: 0 };
    });
  }
  add(name, weapon = 0, color = colors[0], now = Date.now(), protocol = 2) {
    if (this.players.size >= 8)
      throw Error("Oda dolu. En fazla 8 oyuncu katılabilir.");
    const id = randomBytes(8).toString("hex");
    const count = [...this.players.values()].reduce(
      (n, p) => (n[p.team === 0 ? 0 : 1]++, n),
      [0, 0],
    );
    const team =
      this.mode === 1 ? (count[0] <= count[1] ? 0 : 1) : this.players.size;
    const p = {
      id,
      name: this.uniqueName(name),
      team,
      color:
        this.mode === 1
          ? team === 0
            ? "#70bcff"
            : "#ff7a6b"
          : colors.includes(color)
            ? color
            : colors[0],
      token: randomBytes(24).toString("base64url"),
      connected: true,
      disconnectedAt: 0,
      joinedAt: now,
      weapon:
        Number.isInteger(weapon) && weapon >= 0 && weapon < 5 ? weapon : 0,
      kills: 0,
      deaths: 0,
      shots: 0,
      hits: 0,
      input: neutral(),
      inputAt: now,
      seq: 0,
      protocol,
      motionSeq: 0,
      motionQueue: [],
      motionCredit: 0,
      motionFire: false,
      renamedAt: 0,
      wasFire: false,
      wasJump: false,
      wasDash: false,
    };
    this.players.set(id, p);
    if (!this.host) this.host = id;
    this.spawn(p);
    this.lastActivity = now;
    this.event({ type: "join", name: p.name });
    return p;
  }
  uniqueName(name, exceptId = null) {
    const base = cleanName(name),
      used = new Set(
        [...this.players.values()]
          .filter((p) => p.id !== exceptId)
          .map((p) => p.name.toLocaleLowerCase("tr")),
      );
    if (!used.has(base.toLocaleLowerCase("tr"))) return base;
    for (let i = 2; i <= 9; i++) {
      const candidate = base.slice(0, 16) + " " + i;
      if (!used.has(candidate.toLocaleLowerCase("tr"))) return candidate;
    }
    return base;
  }
  rename(p, name, now = Date.now()) {
    if (now - p.renamedAt < 1000)
      throw Error("Adını değiştirmek için bir saniye bekle.");
    const clean = cleanName(name);
    if (
      !String(name || "").trim() ||
      (clean === "OYUNCU" && !String(name).replace(/[<>\s]/g, ""))
    )
      throw Error("Oyuncu adını yaz.");
    p.name = this.uniqueName(clean, p.id);
    p.renamedAt = now;
    return p.name;
  }
  spawn(p) {
    const candidates = this.world.map.spawns.filter(
      (s) => this.mode !== 1 || (p.team === 0 ? s.z > 7 : s.z < -7),
    );
    const spots = candidates.length ? candidates : this.world.map.spawns;
    let spot = spots[0],
      best = -1;
    for (let i = 0; i < 36; i++) {
      const s = spots[randomInt(spots.length)];
      const enemies = [...this.players.values()].filter(
        (a) => a !== p && a.hp > 0 && (this.mode !== 1 || a.team !== p.team),
      );
      const score = enemies.length
        ? Math.min(...enemies.map((a) => Math.hypot(a.x - s.x, a.z - s.z)))
        : 20;
      if (score > best) {
        spot = s;
        best = score;
      }
    }
    Object.assign(p, {
      life: (p.life || 0) + 1,
      motionQueue: [],
      motionCredit: 0,
      motionSeq: p.seq,
      motionFire: false,
      x: spot.x,
      z: spot.z,
      y: 0,
      vy: 0,
      yaw: Math.atan2(-spot.x, spot.z),
      pitch: 0,
      hp: 100,
      armor: 50,
      safe: 2,
      cooldown: 0.3,
      reload: 0,
      reloadTotal: 0,
      deadTime: 0,
      grenadeCount: 2,
      stamina: 100,
      dashTime: 0,
      dashCooldown: 0,
      walk: 0,
      ammo: WEAPONS.map((w) => ({ mag: w.mag, reserve: w.reserve })),
      input: neutral(),
      wasFire: false,
    });
    p.input.yaw = p.yaw;
  }
  start(id) {
    if (id !== this.host) throw Error("Maçı yalnız oda sahibi başlatabilir.");
    if (!["lobby", "results"].includes(this.phase))
      throw Error("Maç zaten devam ediyor.");
    if ([...this.players.values()].filter((p) => p.connected).length < 2)
      throw Error("Başlamak için en az 2 oyuncu gerekiyor.");
    if (this.mode === 1) {
      let i = 0;
      for (const p of this.players.values()) {
        p.team = i++ % 2;
        p.color = p.team === 0 ? "#70bcff" : "#ff7a6b";
      }
    }
    for (const p of this.players.values()) {
      p.kills = 0;
      p.deaths = 0;
      p.shots = 0;
      p.hits = 0;
      this.spawn(p);
    }
    this.elapsed = 0;
    this.countdown = 3;
    this.scores = [0, 0];
    this.phase = "countdown";
    this.round++;
    this.grenades = [];
    this.pickups.forEach((p) => (p.timer = 0));
    this.event({ type: "start", round: this.round });
  }
  setInput(p, data, now = Date.now()) {
    if (
      !validInput(data) ||
      !Number.isSafeInteger(data.seq) ||
      data.seq <= p.seq
    )
      return false;
    const { f, r, yaw, pitch, fire, ads, sprint, jump, dash } = data;
    p.input = { f, r, yaw, pitch, fire, ads, sprint, jump, dash };
    p.seq = data.seq;
    p.inputAt = now;
    return true;
  }
  queueInputs(p, inputs, now = Date.now()) {
    if (
      p.protocol !== 3 ||
      !Array.isArray(inputs) ||
      !inputs.length ||
      inputs.length > 6 ||
      p.motionQueue.length + inputs.length > 90
    )
      return false;
    let seq = p.seq;
    for (const i of inputs) {
      if (
        !validInput(i) ||
        !Number.isSafeInteger(i.seq) ||
        i.seq <= seq ||
        i.seq > seq + 240
      )
        return false;
      seq = i.seq;
    }
    p.seq = seq;
    p.inputAt = now;
    if (this.phase !== "playing" || p.hp <= 0) {
      p.motionSeq = seq;
      return true;
    }
    p.motionQueue.push(
      ...inputs.map(
        ({ seq, f, r, yaw, pitch, fire, ads, sprint, jump, dash }) => ({
          seq,
          f,
          r,
          yaw,
          pitch,
          fire,
          ads,
          sprint,
          jump,
          dash,
        }),
      ),
    );
    return true;
  }
  command(p, data) {
    if (data.type === "start") return this.start(p.id);
    if (this.phase !== "playing" || p.hp <= 0) return;
    if (data.type === "reload") this.reload(p);
    if (
      data.type === "weapon" &&
      Number.isInteger(data.weapon) &&
      data.weapon >= 0 &&
      data.weapon < 5 &&
      data.weapon !== p.weapon
    ) {
      p.weapon = data.weapon;
      p.reload = 0;
      p.cooldown = Math.max(p.cooldown, 0.22);
    }
    if (data.type === "grenade" && p.grenadeCount > 0) {
      p.grenadeCount--;
      p.safe = 0;
      const d = direction(p.yaw, p.pitch + 0.18);
      this.grenades.push({
        p: [p.x + d[0] * 0.4, p.y + 1.4 + d[1] * 0.4, p.z + d[2] * 0.4],
        v: d.map((v) => v * 13),
        timer: 1.8,
        owner: p,
      });
      this.event({ type: "grenade", actor: p.id });
    }
  }
  reload(p) {
    const w = WEAPONS[p.weapon],
      a = p.ammo[p.weapon];
    if (p.reload <= 0 && a.mag < w.mag && a.reserve > 0)
      p.reload = p.reloadTotal = w.reload;
  }
  damage(victim, damage, killer, kind = "") {
    if (
      victim.hp <= 0 ||
      victim.safe > 0 ||
      (this.mode === 1 && victim !== killer && victim.team === killer.team)
    )
      return false;
    const absorbed = Math.min(victim.armor, damage * 0.55);
    victim.armor -= absorbed;
    victim.hp = Math.max(0, victim.hp - damage + absorbed);
    this.event({
      type: "hit",
      actor: killer.id,
      victim: victim.id,
      head: kind === "KAFA",
      damage: Math.round(damage - absorbed),
    });
    if (victim.hp <= 0) {
      victim.deaths++;
      victim.deadTime = 3;
      victim.reload = 0;
      victim.input = neutral();
      if (killer !== victim) {
        killer.kills++;
        if (this.mode === 1) this.scores[killer.team]++;
      }
      this.event({
        type: "kill",
        actor: killer.id,
        victim: victim.id,
        killer: killer.name,
        name: victim.name,
        kind,
        p: [victim.x, victim.y + 1, victim.z],
        color: victim.color,
      });
    }
    return true;
  }
  fire(p) {
    const w = WEAPONS[p.weapon],
      ammo = p.ammo[p.weapon];
    if (p.hp <= 0 || p.reload > 0 || p.cooldown > 0) return;
    if (ammo.mag <= 0) {
      this.reload(p);
      return;
    }
    ammo.mag--;
    p.cooldown = w.rate;
    p.safe = 0;
    p.shots++;
    const eye = [p.x, p.y + 1.47, p.z];
    let got = false;
    for (let pellet = 0; pellet < w.pellets; pellet++) {
      const spread =
        w.spread *
        (p.input.ads ? 0.32 : 1) *
        (p.vy !== 0 ? 1.6 : 1) *
        (p.input.sprint ? 1.35 : 1);
      const d = direction(
        p.yaw + (Math.random() * 2 - 1) * spread,
        p.pitch + (Math.random() * 2 - 1) * spread,
      );
      let near = this.world.wallRay(eye, d, w.range),
        victim = null;
      for (const b of this.players.values()) {
        if (b === p || b.hp <= 0 || (this.mode === 1 && b.team === p.team))
          continue;
        const t = this.world.rayBox(
          eye,
          d,
          [b.x - 0.34, b.y, b.z - 0.34],
          [b.x + 0.34, b.y + 1.8, b.z + 0.34],
        );
        if (t < near) {
          near = t;
          victim = b;
        }
      }
      const point = eye.map((v, i) => v + d[i] * near);
      if (pellet < 3)
        this.event({
          type: "shot",
          actor: p.id,
          weapon: p.weapon,
          from: eye,
          to: point,
        });
      if (victim) {
        const head = point[1] > victim.y + 1.27;
        got =
          this.damage(
            victim,
            w.damage *
              (head ? 2 : 1) *
              (1 - clamp(near / w.range, 0, 1) * 0.23),
            p,
            head ? "KAFA" : "",
          ) || got;
      }
    }
    if (got) p.hits++;
  }
  step(dt, now = Date.now()) {
    for (const p of this.players.values()) {
      if (!p.connected && now - p.disconnectedAt > 30000) this.remove(p.id);
    }
    if (this.phase === "countdown") {
      this.countdown = Math.max(0, this.countdown - dt);
      if (!this.countdown) {
        this.phase = "playing";
        this.event({ type: "go" });
      }
      return;
    }
    if (this.phase !== "playing") return;
    this.elapsed += dt;
    for (const p of this.players.values()) {
      p.safe = Math.max(0, p.safe - dt);
      p.cooldown = Math.max(0, p.cooldown - dt);
      if (p.hp <= 0) {
        p.deadTime = Math.max(0, p.deadTime - dt);
        if (!p.deadTime) this.spawn(p);
        continue;
      }
      if (p.reload > 0) {
        p.reload = Math.max(0, p.reload - dt);
        if (!p.reload) {
          const w = WEAPONS[p.weapon],
            a = p.ammo[p.weapon],
            n = Math.min(w.mag - a.mag, a.reserve);
          a.mag += n;
          a.reserve -= n;
        }
      }
      let input = p.connected && now - p.inputAt < 400 ? p.input : neutral();
      let firePressed = false;
      if (p.protocol === 3) {
        p.motionCredit = Math.min(0.2, p.motionCredit + dt);
        while (p.motionQueue.length && p.motionCredit + 1e-6 >= ARENA_STEP) {
          input = p.motionQueue.shift();
          p.input = input;
          firePressed ||= input.fire && !p.motionFire;
          p.motionFire = input.fire;
          arenaStepMotion(p, input, this.world, ARENA_STEP);
          p.motionCredit -= ARENA_STEP;
          p.motionSeq = input.seq;
        }
        if (!p.connected || now - p.inputAt >= 400) {
          input = neutral();
          p.motionQueue = [];
          arenaStepMotion(p, input, this.world, dt);
        }
      } else arenaStepMotion(p, input, this.world, dt);
      if (
        (input.fire || firePressed) &&
        (WEAPONS[p.weapon].auto || !p.wasFire || firePressed)
      )
        this.fire(p);
      if (!p.ammo[p.weapon].mag && !p.reload) this.reload(p);
      p.wasFire = input.fire;
      for (const q of this.pickups) {
        if (
          q.timer > 0 ||
          Math.hypot(p.x - q.x, p.z - q.z) >= 1.2 ||
          p.y >= 1.2
        )
          continue;
        let took = false;
        if (q.type === 0 && p.hp < 100) {
          p.hp = Math.min(100, p.hp + 40);
          took = true;
        }
        if (q.type === 1 && p.armor < 100) {
          p.armor = Math.min(100, p.armor + 50);
          took = true;
        }
        if (
          q.type === 2 &&
          p.ammo.some((a, i) => a.reserve < WEAPONS[i].reserve)
        ) {
          p.ammo.forEach(
            (a, i) =>
              (a.reserve = Math.min(
                WEAPONS[i].reserve,
                a.reserve + WEAPONS[i].mag * 2,
              )),
          );
          p.grenadeCount = Math.min(3, p.grenadeCount + 1);
          took = true;
        }
        if (took) {
          q.timer = 18;
          this.event({ type: "pickup", actor: p.id, kind: q.type });
        }
      }
    }
    this.pickups.forEach((p) => (p.timer = Math.max(0, p.timer - dt)));
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.timer -= dt;
      g.v[1] -= 12 * dt;
      const nx = g.p[0] + g.v[0] * dt,
        nz = g.p[2] + g.v[2] * dt;
      if (this.world.blocked(nx, g.p[2], 0.1, g.p[1])) g.v[0] *= -0.55;
      else g.p[0] = nx;
      if (this.world.blocked(g.p[0], nz, 0.1, g.p[1])) g.v[2] *= -0.55;
      else g.p[2] = nz;
      g.p[1] += g.v[1] * dt;
      const floor = this.world.supportHeight(g.p[0], g.p[2], 0.05) + 0.13;
      if (g.p[1] < floor) {
        g.p[1] = floor;
        g.v[1] = Math.abs(g.v[1]) * 0.4;
        g.v[0] *= 0.7;
        g.v[2] *= 0.7;
      }
      if (g.timer <= 0) {
        this.event({ type: "explosion", p: g.p });
        for (const a of this.players.values()) {
          const at = [a.x, a.y + 0.8, a.z],
            diff = at.map((v, j) => v - g.p[j]),
            dist = Math.hypot(...diff);
          if (dist < 7 && a.hp > 0) {
            const d = diff.map((v) => v / (dist || 1));
            this.damage(
              a,
              (1 - dist / 7) *
                150 *
                (this.world.wallRay(g.p, d, dist) < dist - 0.15 ? 0.2 : 1),
              g.owner,
              "BOMBA",
            );
          }
        }
        this.grenades.splice(i, 1);
      }
    }
    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration;
      this.phase = "results";
      this.event({ type: "end" });
    }
  }
  disconnect(p, now = Date.now()) {
    p.connected = false;
    p.disconnectedAt = now;
    p.input = neutral();
    if (p.id === this.host) {
      const next = [...this.players.values()].find((a) => a.connected);
      if (next) this.host = next.id;
    }
    this.event({ type: "disconnect", name: p.name });
  }
  remove(id) {
    this.players.delete(id);
    if (this.host === id)
      this.host =
        [...this.players.values()].find((p) => p.connected)?.id || null;
  }
  event(data) {
    this.events.push({ id: ++this.eventId, ...data });
    if (this.events.length > 100) this.events.shift();
  }
  snapshot() {
    return {
      type: "snapshot",
      room: this.code,
      map: this.mapIndex,
      mode: this.mode,
      duration: this.duration,
      phase: this.phase,
      elapsed: this.elapsed,
      countdown: this.countdown,
      scores: this.scores,
      host: this.host,
      round: this.round,
      players: [...this.players.values()].map((p) => {
        const {
          token,
          input,
          inputAt,
          disconnectedAt,
          joinedAt,
          wasFire,
          motionQueue,
          motionCredit,
          motionFire,
          renamedAt,
          ...publicState
        } = p;
        return publicState;
      }),
      pickups: this.pickups,
      grenades: this.grenades.map((g) => ({ p: g.p, timer: g.timer })),
      events: this.events,
    };
  }
}
