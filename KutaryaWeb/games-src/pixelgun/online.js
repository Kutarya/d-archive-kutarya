// Oda oturumu bellekte kalır; ziyaretçi hesabı veya ortak Auth oturumu oluşturulmaz.
const ARENA_ENDPOINT = "@arena-endpoint";
const net = (arenaNet = {
  active: false,
  socket: null,
  id: null,
  token: null,
  room: null,
  seq: 0,
  round: 0,
  phase: "lobby",
  eventId: 0,
  lastSnapshot: 0,
  lastInput: 0,
  lastPing: 0,
  lastUi: 0,
  ping: 0,
  retries: 0,
  closing: false,
  connecting: false,
  goal: null,
  targets: new Map(),
  startedAt: 0,
  resultRound: 0,
  pending: [],
  unsent: [],
  motionAccumulator: 0,
  visualError: { x: 0, y: 0, z: 0 },
  visualCooldown: 0,
  predictedShots: [],
  samples: [],
  packets: [],
  pingPending: new Map(),
  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(data));
  },
  setup() {
    $("onlineName").value = profile.name;
    $("saveOnlineName").onclick = () => {
      const name = $("onlineName").value.trim();
      if (!name) {
        networkMessage("Önce oyuncu adını yaz.");
        $("onlineName").focus();
        return;
      }
      if (this.active) this.send({ type: "rename", name });
      else {
        syncArenaName(name.slice(0, 18));
        networkMessage("Oyuncu adın kaydedildi.");
      }
    };
    $("pauseSaveName").onclick = () => {
      const name = $("pauseName").value.trim();
      if (name) this.send({ type: "rename", name });
    };
    $("onlineWeapon").value = profile.weapon;
    // İletim ve ping, çizim kare hızına veya pencere saatinin değişimine bağlanmaz.
    setInterval(() => this.pump(), 33);
    setInterval(() => this.measurePing(), 1500);
    $("createRoom").onclick = () =>
      connectArena({
        create: {
          map: Number($("onlineMap").value),
          mode: Number($("onlineMode").value),
          duration: Number($("onlineDuration").value),
        },
      });
    $("joinRoom").onclick = () => {
      const code = $("roomInput").value.trim().toUpperCase();
      if (!/^[A-F0-9]{6}$/.test(code)) {
        networkMessage("Altı karakterli oda kodunu kontrol et.");
        return;
      }
      connectArena({ room: code });
    };
    $("onlineStart").onclick = () => this.send({ type: "start" });
    $("leaveRoom").onclick = () => {
      this.leave();
      resetArenaScreen();
      showPage("online");
    };
    $("onlineBack").onclick = () => {
      if (this.active || this.connecting) this.leave();
      resetArenaScreen();
      showPage("home");
    };
    $("copyRoom").onclick = async () => {
      try {
        await navigator.clipboard.writeText(this.room);
        toast("Oda kodu kopyalandı.");
      } catch {
        toast("Oda kodun: " + this.room);
      }
    };
    $("roomInput").addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("joinRoom").click();
    });
    $("restart").textContent = "MAÇI YENİDEN BAŞLAT";
  },
  leave() {
    this.closing = true;
    this.active = false;
    this.connecting = false;
    clearTimeout(this.reconnectTimer);
    clearTimeout(this.timeout);
    this.send({ type: "leave" });
    this.socket?.close(1000, "Oyuncu ayrıldı");
    this.socket = null;
    this.token = null;
    this.id = null;
    this.room = null;
    this.targets.clear();
    this.pending = [];
    this.unsent = [];
    this.packets = [];
    this.motionAccumulator = 0;
    this.samples = [];
    this.pingPending.clear();
    this.visualError = { x: 0, y: 0, z: 0 };
    this.predictedShots = [];
    this.goal = null;
    $("networkHud").hidden = true;
    $("onlineName").disabled = false;
    $("onlineWeapon").disabled = false;
    $("pauseIdentity").hidden = true;
    $("onlineForms").hidden = false;
    $("roomLobby").hidden = true;
    $("restart").disabled = false;
    $("again").disabled = false;
    $("again").textContent = "TEKRAR OYNA";
    $("pause").querySelector(".eyebrow").textContent = "MAÇ DURAKLATILDI";
    $("pause").querySelector("p").textContent =
      "Devam etmek için butona tıkla. Fare oyun alanına kilitlenir.";
    $("createRoom").disabled = false;
    $("joinRoom").disabled = false;
  },
  pump() {
    if (!this.active || this.socket?.readyState !== WebSocket.OPEN) return;
    if (this.socket.bufferedAmount > 8192) return;
    if (this.unsent.length)
      this.send({ type: "inputs", inputs: this.unsent.splice(0, 6) });
  },
  measurePing() {
    if (!this.active || this.socket?.readyState !== WebSocket.OPEN) return;
    const at = performance.now();
    this.pingPending.set(at, at);
    for (const [key, t] of this.pingPending)
      if (at - t > 10000) this.pingPending.delete(key);
    this.send({ type: "ping", at });
  },
  frame(dt) {
    time += dt;
    const now = performance.now();
    for (const k of ["x", "y", "z"]) this.visualError[k] *= Math.exp(-dt * 14);
    this.visualCooldown = Math.max(0, this.visualCooldown - dt);
    if (
      player &&
      ["playing", "paused"].includes(state) &&
      this.phase === "playing" &&
      player.hp > 0 &&
      now - this.lastSnapshot < 2500
    ) {
      this.motionAccumulator = Math.min(0.1, this.motionAccumulator + dt);
      while (
        this.motionAccumulator >= ARENA_STEP &&
        this.pending.length < 120
      ) {
        const playing = state === "playing",
          input = {
            seq: ++this.seq,
            f: playing
              ? clamp(
                  (keys.KeyW || keys.ArrowUp ? 1 : 0) -
                    (keys.KeyS || keys.ArrowDown ? 1 : 0) -
                    moveTouch.y,
                  -1,
                  1,
                )
              : 0,
            r: playing
              ? clamp(
                  (keys.KeyD || keys.ArrowRight ? 1 : 0) -
                    (keys.KeyA || keys.ArrowLeft ? 1 : 0) +
                    moveTouch.x,
                  -1,
                  1,
                )
              : 0,
            yaw: player.yaw,
            pitch: player.pitch,
            fire: !!(playing && (trigger || triggerEdge)),
            ads: !!(playing && ads),
            sprint: !!(playing && (keys.ShiftLeft || keys.ShiftRight)),
            jump: !!(playing && keys.Space),
            dash: !!(playing && keys.KeyQ),
          };
        arenaStepMotion(
          player,
          input,
          { moveActor, supportHeight },
          ARENA_STEP,
        );
        this.pending.push(input);
        this.unsent.push(input);
        this.motionAccumulator -= ARENA_STEP;
        if (
          input.fire &&
          (WEAPONS[player.weapon].auto || triggerEdge) &&
          this.visualCooldown <= 0 &&
          !player.reload &&
          player.ammo[player.weapon].mag > 0
        ) {
          const w = WEAPONS[player.weapon];
          this.visualCooldown = w.rate;
          recoil += w.kick;
          soundShot(player.weapon);
          this.predictedShots.push(now);
          this.predictedShots = this.predictedShots.filter(
            (t) => now - t < 2500,
          );
        }
        triggerEdge = false;
      }
    } else this.motionAccumulator = 0;
    if (player) {
      player.deadTime = Math.max(0, player.deadTime - dt);
      if (player.hp <= 0)
        showNotice("ELENDİN · " + Math.ceil(player.deadTime) + " SANİYE", 0.15);
      if (this.phase === "countdown")
        showNotice(
          "HAZIR OL · " + Math.max(1, Math.ceil(this.countdown)),
          0.15,
        );
    }
    // Diğer oyuncular iki durum örneği arasında çizilir; en son hedefe sürekli çekilmez.
    const target = now - 85,
      packets = this.packets;
    while (packets.length > 2 && packets[1].at < target) packets.shift();
    const left = packets[0],
      right = packets[1] || left;
    if (left && right)
      for (const a of bots) {
        const p = left.players.get(a.id),
          q = right.players.get(a.id);
        if (!p || !q) continue;
        const t = clamp(
          (target - left.at) / Math.max(1, right.at - left.at),
          0,
          1,
        );
        if (p.life !== q.life || Math.hypot(q.x - p.x, q.z - p.z) > 5) {
          a.x = q.x;
          a.y = q.y;
          a.z = q.z;
        } else {
          a.x = p.x + (q.x - p.x) * t;
          a.y = p.y + (q.y - p.y) * t;
          a.z = p.z + (q.z - p.z) * t;
        }
        const angle = Math.atan2(
          Math.sin(q.yaw - p.yaw),
          Math.cos(q.yaw - p.yaw),
        );
        a.yaw = p.yaw + angle * t;
        a.pitch = p.pitch + (q.pitch - p.pitch) * t;
      }
    updateArenaEffects(dt);
    if (now - this.lastUi > 80) {
      updateHud();
      this.lastUi = now;
    }
    if (
      this.active &&
      now - this.lastSnapshot > 5000 &&
      this.socket?.readyState === WebSocket.OPEN
    ) {
      $("netStatus").textContent = "YANIT BEKLENİYOR";
      if (now - this.lastSnapshot > 10000)
        this.socket.close(4000, "Sunucu yanıt vermiyor");
    }
  },
});
function networkMessage(message) {
  $("onlineStatus").textContent = message;
}
function syncArenaName(name) {
  profile.name = name;
  $("onlineName").value = name;
  $("pauseName").value = name;
  $("playerName").value = name;
  $("homeName").textContent = name;
  save("kba-profile", profile);
}
function resetArenaScreen() {
  state = "menu";
  exitLock();
  player = null;
  bots = [];
  match = null;
  feed = [];
  grenades = [];
  particles = [];
  tracers = [];
  $("restart").textContent = "MAÇI YENİDEN BAŞLAT";
  $("pause").querySelector("p").textContent =
    "Maç seni bekliyor. Hazır olduğunda devam et.";
}
function connectArena(request, resume = false) {
  if (net.connecting) return;
  if (!resume) {
    net.leave();
    net.closing = false;
    net.round = 0;
    net.resultRound = 0;
    net.eventId = 0;
    net.seq = 0;
    net.retries = 0;
    const name = $("onlineName").value.trim();
    if (!name) {
      networkMessage("Odaya girmeden önce oyuncu adını yaz.");
      $("onlineName").focus();
      return;
    }
    profile.name = name.slice(0, 18);
    profile.weapon = Number($("onlineWeapon").value);
    save("kba-profile", profile);
  }
  net.connecting = true;
  $("createRoom").disabled = true;
  $("joinRoom").disabled = true;
  networkMessage(
    resume
      ? "Bağlantı koptu. Odaya yeniden bağlanılıyor…"
      : "Arena sunucusuna bağlanılıyor…",
  );
  let ws;
  try {
    ws = new WebSocket(ARENA_ENDPOINT.replace(/^https:/, "wss:") + "/play");
  } catch {
    net.connecting = false;
    net.leave();
    networkMessage("Bağlantı açılamadı. İnternet bağlantını kontrol et.");
    return;
  }
  net.socket = ws;
  net.timeout = setTimeout(() => {
    if (net.connecting && net.socket === ws)
      ws.close(4001, "Bağlantı zaman aşımı");
  }, 25000);
  ws.onopen = () =>
    net.send({
      type: "hello",
      version: "2.1.0",
      protocol: 3,
      name: profile.name,
      weapon: profile.weapon,
      color: profile.skin,
      ...request,
    });
  ws.onmessage = (event) => {
    let s;
    try {
      s = JSON.parse(event.data);
    } catch {
      return;
    }
    if (net.socket !== ws) return;
    if (s.type === "error") {
      networkMessage(s.message);
      toast(s.message);
      if (net.connecting) {
        net.leave();
        resetArenaScreen();
        showPage("online");
        networkMessage(s.message);
      }
      return;
    }
    if (s.type === "pong") {
      if (!net.pingPending.has(s.at)) return;
      const value = Math.max(0, performance.now() - net.pingPending.get(s.at));
      net.pingPending.delete(s.at);
      net.samples.push(value);
      net.samples = net.samples.slice(-15);
      const sorted = net.samples.toSorted((a, b) => a - b);
      net.ping = Math.round(value);
      const jitter = Math.round(Math.max(...sorted) - Math.min(...sorted));
      $("netPing").textContent = net.ping + " ms";
      $("netPing").title =
        "Son " +
        sorted.length +
        " ölçümün ortancası " +
        Math.round(sorted[Math.floor(sorted.length / 2)]) +
        " ms · dalgalanma " +
        jitter +
        " ms";
      $("networkHud").dataset.quality =
        net.ping > 180 ? "poor" : net.ping > 100 ? "fair" : "good";
      return;
    }
    if (s.type === "profile") {
      syncArenaName(s.name);
      networkMessage("Oyuncu adın güncellendi: " + s.name);
      toast("Adın güncellendi.");
      return;
    }
    if (s.type === "welcome") {
      clearTimeout(net.timeout);
      net.connecting = false;
      net.active = true;
      net.closing = false;
      net.retries = 0;
      net.id = s.id;
      net.token = s.token;
      syncArenaName(s.players.find((p) => p.id === s.id).name);
      net.seq = Math.max(net.seq, s.seq || 0);
      net.room = s.room;
      net.eventId = s.events?.at(-1)?.id || net.eventId;
      $("onlineName").disabled = false;
      $("onlineWeapon").disabled = true;
      $("onlineForms").hidden = true;
      $("roomLobby").hidden = false;
      $("roomCode").textContent = s.room;
      $("networkHud").hidden = false;
      net.startedAt = performance.now();
      net.pending = [];
      net.unsent = [];
      net.motionAccumulator = 0;
      net.packets = [];
      net.measurePing();
      networkMessage("Bağlandın. Oda kodunu arkadaşlarınla paylaş.");
    }
    if (s.type === "snapshot" || s.type === "welcome") applyArenaSnapshot(s);
  };
  ws.onerror = () => {};
  ws.onclose = () => {
    if (net.socket !== ws || net.closing) return;
    clearTimeout(net.timeout);
    net.connecting = false;
    if (net.active && net.token && net.retries < 6) {
      net.retries++;
      $("netStatus").textContent = "YENİDEN BAĞLANIYOR";
      trigger = false;
      triggerEdge = false;
      keys = {};
      net.reconnectTimer = setTimeout(
        () => connectArena({ room: net.room, resume: net.token }, true),
        Math.min(2500, 500 * net.retries),
      );
    } else {
      net.leave();
      resetArenaScreen();
      showPage("online");
      networkMessage(
        "Sunucu bağlantısı kurulamadı veya oda kapandı. Tekrar katılabilirsin; botlarla oynama internet gerektirmez.",
      );
    }
  };
}
function renderRoom(s) {
  const key = JSON.stringify([
    s.phase,
    s.host,
    s.players.map((p) => [p.id, p.name, p.connected, p.team]),
  ]);
  if (net.lobbyKey === key) return;
  net.lobbyKey = key;
  $("roomDetails").textContent =
    MAPS[s.map].name +
    " · " +
    MODES[s.mode].name +
    " · " +
    s.duration / 60 +
    " dakika · " +
    s.players.filter((p) => p.connected).length +
    "/8 oyuncu";
  const nodes = s.players.map((p) => {
    const row = document.createElement("div");
    row.className = "room-player";
    const dot = document.createElement("i");
    dot.style.background = p.connected ? p.color : "#647488";
    const name = document.createElement("span");
    name.textContent = p.name + (p.id === net.id ? " (SEN)" : "");
    const badge = document.createElement("small");
    badge.textContent =
      p.id === s.host ? "ODA SAHİBİ" : p.connected ? "HAZIR" : "BAĞLANTI KOPTU";
    row.append(dot, name, badge);
    return row;
  });
  $("roomPlayers").replaceChildren(...nodes);
  const host = s.host === net.id;
  $("onlineStart").disabled =
    !host ||
    !["lobby", "results"].includes(s.phase) ||
    s.players.filter((p) => p.connected).length < 2;
  $("onlineStart").textContent = !["lobby", "results"].includes(s.phase)
    ? "MAÇ DEVAM EDİYOR"
    : host
      ? "MAÇI BAŞLAT"
      : "ODA SAHİBİ BEKLENİYOR";
  $("again").disabled = !host;
  $("again").textContent = host ? "RÖVANŞI BAŞLAT" : "ODA SAHİBİ BEKLENİYOR";
  $("restart").disabled = true;
  $("restart").textContent = "ONLINE MAÇ DEVAM EDİYOR";
}
function applyArenaSnapshot(s) {
  net.lastSnapshot = performance.now();
  net.phase = s.phase;
  net.countdown = s.countdown;
  $("netStatus").textContent =
    "ODA " +
    s.room +
    (s.mode === 1
      ? s.players.find((p) => p.id === net.id)?.team === 0
        ? " · MAVİ"
        : " · KIRMIZI"
      : "");
  renderRoom(s);
  if (s.phase === "lobby") return;
  const me = s.players.find((p) => p.id === net.id);
  if (!me) return;
  if (net.round !== s.round || !player) {
    net.round = s.round;
    mapIndex = s.map;
    modeIndex = s.mode;
    loadMap(mapIndex);
    match = {
      mode: s.mode,
      map: s.map,
      duration: s.duration,
      elapsed: s.elapsed,
      scores: s.scores,
      kills: 0,
      deaths: 0,
      shots: 0,
      hits: 0,
      recorded: false,
      completed: false,
    };
    player = { ...newActor(me.name, me.team, true), ...me, isPlayer: true };
    bots = [];
    particles = [];
    tracers = [];
    feed = [];
    net.targets.clear();
    net.goal = null;
    net.pending = [];
    net.unsent = [];
    net.motionAccumulator = 0;
    net.packets = [];
    net.visualError = { x: 0, y: 0, z: 0 };
    $("pauseIdentity").hidden = false;
    state = "playing";
    page = null;
    hideScreens();
    $("menuShade").style.display = "none";
    document
      .querySelectorAll(".overlay")
      .forEach((e) => e.classList.remove("active"));
    $("hud").classList.add("active");
    applyTouch();
    initAudio();
    $("pause").querySelector("p").textContent =
      "Online maç devam ediyor. Menüdeyken de hasar alabilirsin.";
    $("pause").querySelector(".eyebrow").textContent =
      "OYUN MENÜSÜ · MAÇ DEVAM EDİYOR";
    toast("Online maç başladı. Fareyi kilitlemek için oyun alanına tıkla.");
  }
  const oldHp = player.hp,
    oldWeapon = player.weapon,
    respawn = player.life !== me.life;
  const camera = {
    x: player.x,
    y: player.y,
    z: player.z,
    yaw: player.yaw,
    pitch: player.pitch,
    walk: player.walk,
  };
  net.pending = net.pending.filter((i) => i.seq > me.motionSeq);
  Object.assign(player, me, { isPlayer: true });
  if (respawn || me.hp <= 0) {
    net.pending = [];
    net.unsent = [];
    net.motionAccumulator = 0;
    net.visualError = { x: 0, y: 0, z: 0 };
  } else
    for (const i of net.pending)
      arenaStepMotion(player, i, { moveActor, supportHeight }, ARENA_STEP);
  player.yaw = camera.yaw;
  player.pitch = camera.pitch;
  if (respawn) {
    player.yaw = me.yaw;
    player.pitch = me.pitch;
    showNotice("YENİDEN DOĞDUN", 1);
  } else if (me.hp > 0) {
    const delta = Math.hypot(
      camera.x - player.x,
      camera.y - player.y,
      camera.z - player.z,
    );
    if (delta < 0.5)
      for (const k of ["x", "y", "z"])
        net.visualError[k] += camera[k] - player[k];
    else net.visualError = { x: 0, y: 0, z: 0 };
  }
  if (oldWeapon !== me.weapon) {
    recoil = 0;
    ads = false;
  }
  net.goal = me;
  if (me.hp < oldHp) {
    damageFlash = Math.min(1, damageFlash + 0.5);
    if (me.hp <= 0) {
      trigger = false;
      ads = false;
    }
  }
  match.elapsed = s.elapsed;
  match.scores = s.scores;
  match.kills = me.kills;
  match.deaths = me.deaths;
  match.shots = me.shots;
  match.hits = me.hits;
  const previous = new Map(bots.map((p) => [p.id, p]));
  bots = s.players
    .filter((p) => p.id !== net.id)
    .map((p) => {
      const a = previous.get(p.id) || { ...p, isPlayer: false };
      const pos = { x: a.x, y: a.y, z: a.z };
      Object.assign(a, p, pos, { isPlayer: false });
      net.targets.set(p.id, p);
      return a;
    });
  net.packets.push({
    at: performance.now(),
    players: new Map(s.players.map((p) => [p.id, p])),
  });
  net.packets = net.packets.slice(-10);
  pickups = s.pickups;
  grenades = s.grenades.map((g) => ({ ...g, v: [0, 0, 0] }));
  for (const e of s.events || []) {
    if (e.id <= net.eventId) continue;
    net.eventId = e.id;
    arenaEvent(e);
  }
  if (s.phase === "results" && net.resultRound !== s.round) {
    net.resultRound = s.round;
    const top = Math.max(...s.players.map((p) => p.kills));
    const won =
      s.mode === 1
        ? s.scores[me.team] > s.scores[1 - me.team]
        : me.kills === top &&
          s.players.filter((p) => p.kills === top).length === 1;
    finishMatch(won);
    $("resultEyebrow").textContent = "ONLINE MAÇ TAMAMLANDI";
    renderRoom({ ...s, phase: "results" });
  }
  updateHud();
}
function arenaEvent(e) {
  if (e.type === "shot") {
    addTracer(e.from, e.to, e.actor === net.id ? "#ffdc70" : "#ff9478", 0.11);
    if (e.actor === net.id) {
      if (net.predictedShots.length) net.predictedShots.shift();
      else {
        recoil += WEAPONS[e.weapon].kick;
        soundShot(e.weapon);
      }
    } else soundShot(e.weapon, true);
  }
  if (e.type === "hit") {
    const victim =
      e.victim === net.id ? player : bots.find((p) => p.id === e.victim);
    if (victim)
      emitParticles(
        [victim.x, victim.y + 1.2, victim.z],
        e.head ? "#ffdc70" : "#ff9478",
        5,
        2,
      );
    if (e.actor === net.id) {
      hitUntil = time + 0.16;
      combatFeedback(e.head ? "KAFA · " + e.damage : "−" + e.damage);
      tone(650, 0.035, 0.03);
    }
  }
  if (e.type === "kill") {
    addFeed(e.killer, e.name, e.kind);
    emitParticles(e.p, e.color, 24, 5);
    if (e.actor === net.id) {
      combatFeedback(e.kind === "KAFA" ? "KAFADAN ELEME" : "ELEME +1", 1.2);
      tone(520, 0.12, 0.1, "triangle", 900);
    }
  }
  if (e.type === "explosion") {
    emitParticles(e.p, "#ffc978", 48, 9);
    noise(0.5, 0.35, 650);
    tone(50, 0.35, 0.16, "triangle", 20);
    addBurst(e.p);
  }
  if (e.type === "pickup" && e.actor === net.id) {
    showNotice(["+40 CAN", "+50 ZIRH", "MÜHİMMAT YENİLENDİ"][e.kind], 0.8);
    tone(600, 0.15, 0.09, "triangle", 1100);
  }
  if (e.type === "go") showNotice("ARENA SENİN · İYİ OYUNLAR", 1.5);
}
function updateArenaEffects(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.v[1] -= 10 * dt;
    p.p = v3.add(p.p, v3.mul(p.v, dt));
    if (p.life <= 0 || p.p[1] < 0) particles.splice(i, 1);
  }
  tracers = tracers.filter((t) => (t.life -= dt) > 0);
  damageFlash = Math.max(0, damageFlash - dt * 1.7);
  recoil = Math.max(0, recoil - dt * 0.55);
  const old = feed.length;
  feed = feed.filter((f) => f.until > time);
  if (feed.length !== old) renderFeed();
}
