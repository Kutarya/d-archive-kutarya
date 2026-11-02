(() => {
  'use strict';
  const ENDPOINT = '@roulette-endpoint';
  const $ = id => document.getElementById(id);
  const palette = ['#c9b480', '#f27353', '#b2c891', '#95bccc', '#c9a4c0', '#c4c6bd'];
  const colorNames = ['Altın', 'Mercan', 'Adaçayı', 'Buz mavisi', 'Leylak', 'Gümüş'];
  const reactionText = { wave: '👋', fire: '🔥', luck: '🍀', wow: '😮' };
  let profile = { name: 'Misafir ' + Math.floor(100 + Math.random() * 900), color: 0 }, sound = false;
  try { const saved = JSON.parse(localStorage.getItem('kutarya-son-tur-profile') || 'null'); if (saved) profile = { name: cleanName(saved.name), color: Math.max(0, Math.min(5, Number(saved.color) | 0)) }; } catch {}
  let room = null, me = null, session = null, practice = null, ws = null, connected = false, intentional = false;
  let connecting = null, reconnectAt = 0, retryTimer = null, pingTimer = null, listTimer = null;
  let lastEvent = 0, lastRound = 0, lastPlayers = '', clockOffset = 0, audioContext = null, busy = false, lastReaction = 0;
  let botAt = 0, toastTimer = null, lastStartAt = 0, actionTurn = null;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const serverTime = () => Date.now() + clockOffset;
  function saveProfile() {
    profile.name = cleanName($('player-name').value); $('player-name').value = profile.name;
    try { localStorage.setItem('kutarya-son-tur-profile', JSON.stringify(profile)); } catch {}
  }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000); }
  function status(label, okay) { $('connection-label').textContent = label; $('connection-dot').classList.toggle('connected', okay); }
  function audio(kind) {
    if (!sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const notes = kind === 'win' ? [392, 494, 587, 784] : kind === 'hit' ? [130, 98] : kind === 'start' ? [220, 330, 440] : [400];
      for (let i = 0; i < notes.length; i++) {
        const o = audioContext.createOscillator(), gain = audioContext.createGain(), t = audioContext.currentTime + i * .12;
        o.type = kind === 'hit' ? 'triangle' : 'sine'; o.frequency.setValueAtTime(notes[i], t);
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(.045, t + .012); gain.gain.exponentialRampToValueAtTime(.001, t + .2);
        o.connect(gain); gain.connect(audioContext.destination); o.start(t); o.stop(t + .22);
      }
    } catch {}
  }
  function showHome() {
    room = null; me = null; session = null; practice = null; botAt = 0; busy = false;
    lastEvent = 0; lastRound = 0; lastPlayers = ''; $('table-view').hidden = true; $('home').hidden = false; $('reconnect-banner').hidden = true;
    reconnectAt = 0; clearTimeout(retryTimer); actionTurn = null;
    try { sessionStorage.removeItem('kutarya-son-tur-session'); } catch {}
    if (connected) send({ type: 'list' });
  }
  function send(message) { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message)); }
  function clearNetworkTimers() { clearInterval(pingTimer); clearInterval(listTimer); }
  function connect() {
    if (connected) return Promise.resolve();
    if (connecting) return connecting;
    intentional = false; status(reconnectAt ? 'Yeniden bağlanıyor' : 'Bağlanıyor', false);
    const promise = new Promise((resolve, reject) => {
      const socket = new WebSocket(ENDPOINT.replace(/^http/, 'ws') + '/play'); ws = socket;
      const timeout = setTimeout(() => { socket.close(); reject(Error('Bağlantı kurulamadı. Tekrar deneyebilir veya botlarla oynayabilirsin.')); }, 15000);
      let welcomed = false;
      socket.addEventListener('open', () => { send({ type: 'hello', version: VERSION, name: profile.name, color: profile.color }); });
      socket.addEventListener('message', event => {
        let data; try { data = JSON.parse(event.data); } catch { return; }
        if (data.type === 'hello') {
          clearTimeout(timeout); welcomed = true; connected = true; status('Çevrim içi', true); clearNetworkTimers();
          pingTimer = setInterval(() => send({ type: 'ping', at: performance.now() }), 5000);
          listTimer = setInterval(() => { if (!room) send({ type: 'list' }); }, 8000);
          if (session && !practice) send({ type: 'resume', code: session.code, token: session.token });
          resolve(); return;
        }
        if (data.type === 'pong') { if (room && !practice) $('latency').textContent = '● Çevrim içi · ' + Math.round(performance.now() - data.at) + ' ms'; return; }
        if (data.type === 'rooms') { renderRooms(data); return; }
        if (data.type === 'joined') {
          if (room?.code !== data.room.code || practice) { lastEvent = 0; lastRound = 0; lastPlayers = ''; $('activity').replaceChildren(); }
          me = data.id; session = { code: data.room.code, token: data.token }; reconnectAt = 0; clearTimeout(retryTimer);
          try { sessionStorage.setItem('kutarya-son-tur-session', JSON.stringify(session)); } catch {}
          $('reconnect-banner').hidden = true; $('table-view').hidden = false; $('home').hidden = true; $('latency').textContent = '● Çevrim içi · Gecikme ölçülüyor'; busy = false; render(data.room);
          $('copy-code').focus({ preventScroll: true }); return;
        }
        if (data.type === 'state') { if (!practice && session) render(data.room); return; }
        if (data.type === 'left') { if (!practice) showHome(); return; }
        if (data.type === 'expired') { showHome(); toast(data.message); return; }
        if (data.type === 'error') {
          busy = false; actionTurn = null;
          if (reconnectAt || (session && !room)) { showHome(); reconnectAt = 0; }
          toast(data.message); updateControls();
        }
      });
      socket.addEventListener('error', () => {});
      socket.addEventListener('close', () => {
        clearTimeout(timeout); if (ws !== socket) return;
        connected = false; connecting = null; clearNetworkTimers(); status('Bağlantı yok', false);
        if (!welcomed) reject(Error('Sunucuya ulaşılamadı. Yeniden deneyebilir veya botlarla oynayabilirsin.'));
        if (intentional) return;
        if (session && !practice) {
          reconnectAt ||= Date.now(); $('reconnect-banner').hidden = false; updateControls();
          if (Date.now() - reconnectAt < 29000) retryTimer = setTimeout(() => connect().catch(() => {}), 1800);
          else { showHome(); reconnectAt = 0; toast('Bağlantı süresi doldu. Odaya kodla yeniden katılabilirsin.'); }
        } else { $('population').textContent = 'Bağlantı yok · Bot antrenmanı kullanılabilir'; }
      });
    });
    connecting = promise.finally(() => { connecting = null; });
    return connecting;
  }
  async function command(message) {
    if (busy) return;
    saveProfile(); busy = true;
    try { await connect(); send({ type: 'profile', name: profile.name, color: profile.color }); send(message); }
    catch (error) { toast(error.message); }
    finally { setTimeout(() => { busy = false; }, 800); }
  }
  function renderRooms(data) {
    $('population').textContent = `${data.online} oyuncu bağlı · ${data.tables} masa`;
    const list = $('room-list'); list.replaceChildren();
    if (!data.rooms.length) { const p = document.createElement('p'); p.className = 'empty-message'; p.textContent = 'Henüz açık masa yok. İlk masayı sen kur veya hızlı eşleşmede rakibini bekle.'; list.append(p); return; }
    for (const item of data.rooms) {
      const row = document.createElement('div'); row.className = 'room-row';
      row.innerHTML = `<span class="room-icon" aria-hidden="true">✳</span><span class="room-data"><b>${escape(item.name)} masası</b><small>${escape(item.code)} · ${item.quick ? 'HIZLI EŞLEŞME' : 'AÇIK MASA'}</small></span><span class="room-seats">${Number(item.count)} / ${Number(item.max)}</span>`;
      const button = document.createElement('button'); button.className = 'button secondary'; button.textContent = 'Katıl ↗'; button.addEventListener('click', () => command({ type: 'join', code: item.code })); row.append(button); list.append(row);
    }
  }
  function animate(kind) {
    const el = $('game-cylinder'); el.classList.remove('spin', 'click', 'hit'); void el.offsetWidth; el.classList.add(kind);
    if (kind === 'hit') { $('effect').classList.remove('pop'); void $('effect').offsetWidth; $('effect').classList.add('pop'); }
  }
  function eventText(event, state) {
    const name = event.name || state.players.find(p => p.id === event.player)?.name || 'Bir oyuncu';
    if (event.type === 'join') return `${name} masaya oturdu.`;
    if (event.type === 'leave') return `${name} masadan ayrıldı.`;
    if (event.type === 'start') return 'Hazneler karıştı. Oyun başladı.';
    if (event.type === 'pass') return `${name} tek pasını kullandı.`;
    if (event.type === 'pull') return event.hit ? `${name} kıvılcımı buldu ve elendi.` : `${name}: boş hazne.${event.timeout ? ' Süre doldu; otomatik çekim.' : ''}`;
    if (event.type === 'result') return name + ' masayı kazandı!';
    if (event.type === 'disconnect') return `${name} koptu. 30 saniye bekleniyor.`;
    if (event.type === 'reconnect') return `${name} masaya döndü.`;
    if (event.type === 'rematch') return 'Yeni oyun için lobi açıldı.';
    return '';
  }
  function render(next) {
    if (next.turnId !== actionTurn || next.pending) actionTurn = null;
    room = next; clockOffset = next.serverNow - Date.now();
    $('offline-banner').hidden = !practice; $('mode-label').textContent = practice ? 'BOT ANTRENMANI' : next.quick ? 'HIZLI EŞLEŞME' : next.public ? 'AÇIK MASA' : 'ÖZEL MASA';
    $('table-code').textContent = practice ? 'BOTLAR' : next.code; $('copy-code').disabled = !!practice; $('player-count').textContent = `${next.players.length} / ${next.max}`;
    if (practice) $('latency').textContent = '● Çevrimdışı · Gerçek oyuncu yok';
    const signature = JSON.stringify([next.players, next.turn, next.state]);
    if (signature !== lastPlayers) {
      lastPlayers = signature; $('players').innerHTML = next.players.map(p => `<div class="player-card${next.state === 'playing' && p.id === next.turn ? ' is-turn' : ''}${!p.alive ? ' is-out' : ''}" data-player="${escape(p.id)}" style="--c:${palette[p.color] || palette[0]}"><span class="small-avatar">${escape(p.name.slice(0, 1).toLocaleUpperCase('tr'))}</span><span class="player-details"><strong>${escape(p.name)}${p.id === me ? '<span class="you">SEN</span>' : ''}</strong><small>${!p.connected ? 'Bağlantı bekleniyor' : next.state === 'lobby' ? p.id === next.host ? 'Oda sahibi' : p.ready ? 'Hazır ✓' : 'Hazırlanıyor…' : !p.alive ? 'Elendi' : p.usedPass ? 'Pas kullanıldı' : '1 pas hakkı'}${p.wins ? ` · ${p.wins} galibiyet` : ''}</small></span>${p.id === next.host ? '<span class="host-mark" title="Oda sahibi">♛</span>' : ''}</div>`).join('');
    }
    if (next.round !== lastRound && next.state === 'playing') { animate('spin'); lastRound = next.round; }
    for (const event of next.events.filter(e => e.id > lastEvent)) {
      lastEvent = event.id;
      if (event.type === 'reaction') { const card = [...$('players').children].find(el => el.dataset.player === event.player); if (card) { const span = document.createElement('span'); span.className = 'player-reaction'; span.textContent = reactionText[event.reaction] || ''; card.append(span); setTimeout(() => span.remove(), 2100); } continue; }
      const text = eventText(event, next); if (!text) continue;
      const li = document.createElement('li'); li.className = event.type === 'pull' && event.hit ? 'hit-event' : event.type === 'result' ? 'winner-event' : '';
      li.textContent = text; $('activity').prepend(li); while ($('activity').children.length > 9) $('activity').lastChild.remove();
      if (event.type === 'pull') { animate(event.hit ? 'hit' : 'click'); audio(event.hit ? 'hit' : 'click'); }
      if (event.type === 'start') { animate('spin'); audio('start'); }
      if (event.type === 'result') audio('win');
    }
    [...$('game-cylinder').querySelectorAll('.slot')].forEach((el, index) => el.classList.toggle('spent', index >= next.remaining));
    $('round-label').textContent = next.state === 'lobby' ? 'ARKADAŞLARINI MASAYA ÇAĞIR' : `TUR ${String(next.round).padStart(2, '0')}`;
    $('risk').textContent = next.state === 'lobby' ? '6 HAZNE · 1 KIVILCIM' : `İHTİMAL 1 / ${next.remaining || 1}`;
    $('result').hidden = next.state !== 'result';
    if (next.state === 'result') {
      const winner = next.players.find(p => p.id === next.winner); $('winner-name').textContent = winner?.name || 'Oyun bitti';
      $('winner-description').textContent = winner?.id === me ? 'Son sözü sen söyledin. Masa senin!' : 'Şans bu kez onun yanındaydı. Bir el daha?';
      $('rematch').hidden = next.host !== me; $('rematch-wait').hidden = next.host === me;
    }
    updateControls(); updateClock();
  }
  function updateControls() {
    if (!room) return;
    const p = room.players.find(p => p.id === me), actor = room.players.find(p => p.id === room.turn), owner = me === room.host;
    const canAct = room.state === 'playing' && room.turn === me && p?.alive && !room.pending && actionTurn !== room.turnId && serverTime() >= room.lockUntil && (practice || connected);
    $('lobby-actions').hidden = room.state !== 'lobby'; $('match-actions').hidden = room.state !== 'playing'; $('timer').hidden = room.state !== 'playing';
    $('start').hidden = !owner || room.quick; $('ready').hidden = owner || room.quick;
    $('start').disabled = room.players.filter(p => p.connected).length < 2 || room.players.some(p => p.connected && p.id !== me && !p.ready) || (!practice && !connected);
    $('ready').textContent = p?.ready ? 'Hazırım ✓ · Geri al' : 'Hazırım ✓'; $('ready').disabled = !practice && !connected;
    $('pull').disabled = !canAct; $('pass').disabled = !canAct || p?.usedPass; $('passes').textContent = p?.usedPass ? '0' : '1';
    $('rematch').disabled = !practice && !connected;
    if (room.state === 'lobby') {
      $('turn-kicker').textContent = room.quick ? 'RAKİBİNİ BULUYORUZ' : 'DAVETİNİ GÖNDER';
      $('turn-title').textContent = room.players.length < 2 ? 'Masada bir yer daha var.' : room.quick ? 'Rakibin masada.' : 'Masa tamamlanıyor.';
      $('turn-description').textContent = room.quick ? 'İkinci oyuncuyla otomatik geri sayım başlar.' : owner ? 'Diğer oyuncular hazır olunca oyunu başlat.' : 'Hazırım düğmesine bas. Oda sahibi oyunu başlatır.';
      $('field-note').textContent = practice ? 'Yapay rakiplerin hazır. Oyunu başlatabilirsin.' : 'Oda koduna basarak davet bağlantısını kopyala.';
    } else if (room.state === 'playing') {
      const mine = room.turn === me;
      $('turn-kicker').textContent = !p?.alive ? 'İZLEYİCİSİN' : room.pending ? 'HAMLE SONUÇLANDI' : mine ? 'ŞİMDİ SIRA SENDE' : 'RAKİBİNİN SIRASI';
      $('turn-title').textContent = room.pending ? 'Sıra değişiyor…' : mine ? 'Şansına güveniyor musun?' : `${actor?.name || 'Oyuncu'} düşünüyor…`;
      $('turn-description').textContent = !p?.alive ? 'Bu el bittikten sonra rövanşta yeniden oynayabilirsin.' : `Kalan ${room.remaining} haznede bir kıvılcım. ${p?.usedPass ? 'Pas hakkını kullandın.' : 'Bir pas hakkın var.'}`;
      $('field-note').textContent = mine ? 'Süre dolarsa otomatik çekilir. Space / Enter: çek · P: pas' : 'Masadaki herkes aynı sonucu görür.';
      if (!room.pending && serverTime() < room.lockUntil) { $('turn-kicker').textContent = 'MEKANİZMA HAZIRLANIYOR'; $('turn-title').textContent = 'Hazneler karışıyor…'; }
    }
  }
  function updateClock() {
    if (!room) return;
    if (room.startAt && room.state === 'lobby') {
      const seconds = Math.max(0, Math.ceil((room.startAt - serverTime()) / 1000)); $('turn-kicker').textContent = 'OYUN BAŞLIYOR'; $('turn-title').textContent = `${seconds} saniye sonra başlıyor.`;
      if (lastStartAt !== seconds && seconds > 0 && seconds < 4) audio('click'); lastStartAt = seconds;
    }
    if (room.state === 'playing') {
      const remaining = Math.max(0, room.deadline - serverTime()); $('timer-bar').style.transform = `scaleX(${Math.min(1, remaining / TURN_MS)})`;
      $('timer').setAttribute('aria-label', `Sıranın bitmesine ${Math.ceil(remaining / 1000)} saniye`);
      if (!room.pending && serverTime() >= room.lockUntil && room.turn === me && room.players.find(p => p.id === me)?.alive) $('turn-kicker').textContent = `ŞİMDİ SIRA SENDE · ${Math.ceil(remaining / 1000)} SN`;
    }
  }
  function localSnapshot() { render(practice.snapshot(Date.now())); }
  function startPractice() {
    saveProfile();
    if (room && !practice) send({ type: 'leave' });
    let id = 0; practice = new DuelRoom('BOTLAR', { max: 4 }, Date.now(), max => Math.floor(Math.random() * max), () => 'bot-' + ++id);
    me = practice.add(profile.name, profile.color, Date.now()).id;
    for (const [i, name] of ['Mira · BOT', 'Atlas · BOT', 'Luna · BOT'].entries()) { const p = practice.add(name, (profile.color + i + 1) % 6, Date.now()); p.ready = true; }
    session = null; clockOffset = 0; lastEvent = 0; lastPlayers = ''; lastRound = 0; $('activity').replaceChildren();
    $('table-view').hidden = false; $('home').hidden = true; $('reconnect-banner').hidden = true; localSnapshot(); $('start').focus();
  }
  function act(type) {
    if (!room) return;
    if (type === 'pull' && $('pull').disabled || type === 'pass' && $('pass').disabled) return;
    if (practice) { try { practice.action(me, type, practice.turnId, Date.now()); localSnapshot(); } catch (e) { toast(e.message); } }
    else { actionTurn = room.turnId; send({ type: 'action', action: type, turnId: room.turnId }); $('pull').disabled = true; $('pass').disabled = true; }
  }
  $('player-name').value = profile.name;
  function updateAvatar() { $('name-avatar').textContent = ($('player-name').value.trim()[0] || '?').toLocaleUpperCase('tr'); $('name-avatar').style.background = palette[profile.color]; }
  for (let i = 0; i < palette.length; i++) { const button = document.createElement('button'); button.type = 'button'; button.className = 'color-option'; button.style.setProperty('--c', palette[i]); button.setAttribute('aria-label', colorNames[i]); button.setAttribute('aria-pressed', String(profile.color === i)); button.addEventListener('click', () => { profile.color = i; [...$('color-options').children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === i))); updateAvatar(); }); $('color-options').append(button); }
  updateAvatar(); $('player-name').addEventListener('input', updateAvatar);
  $('sound').addEventListener('click', () => { sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Oyun seslerini kapat' : 'Oyun seslerini aç'); $('sound-label').textContent = sound ? 'Ses açık' : 'Ses kapalı'; audio('click'); });
  $('help').addEventListener('click', () => $('help-dialog').showModal());
  for (const button of document.querySelectorAll('[data-close]')) button.addEventListener('click', () => button.closest('dialog').close());
  $('create').addEventListener('click', () => $('create-dialog').showModal());
  $('create-form').addEventListener('submit', event => event.preventDefault());
  $('create-room-submit').addEventListener('click', () => { $('create-dialog').close(); command({ type: 'create', public: $('public-room').checked, max: Number($('room-capacity').value) }); });
  $('quick').addEventListener('click', () => command({ type: 'quick' }));
  $('practice').addEventListener('click', startPractice);
  function joinByCode() { const code = $('room-code').value.trim().toUpperCase(); if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) { toast('Altı karakterli oda kodunu yaz.'); return; } command({ type: 'join', code }); }
  $('join-form').addEventListener('submit', event => event.preventDefault());
  $('join-code').addEventListener('click', joinByCode);
  $('room-code').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); joinByCode(); } });
  $('room-code').addEventListener('input', () => { $('room-code').value = $('room-code').value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g, ''); });
  $('refresh').addEventListener('click', async () => { try { await connect(); send({ type: 'list' }); } catch (e) { toast(e.message); } });
  $('leave').addEventListener('click', () => { if (!practice && connected) send({ type: 'leave' }); showHome(); });
  $('start').addEventListener('click', () => { if (practice) { try { practice.start(me, Date.now()); localSnapshot(); } catch (e) { toast(e.message); } } else send({ type: 'start' }); });
  $('ready').addEventListener('click', () => send({ type: 'ready', ready: !room.players.find(p => p.id === me)?.ready }));
  $('pull').addEventListener('click', () => act('pull')); $('pass').addEventListener('click', () => act('pass'));
  $('rematch').addEventListener('click', () => { if (practice) { practice.rematch(me, Date.now()); for (const p of practice.players.values()) if (p.id !== me) p.ready = true; localSnapshot(); } else send({ type: 'rematch' }); });
  $('copy-code').addEventListener('click', async () => {
    if (!room || practice) return;
    const url = new URL(ENDPOINT + '/'); url.href = 'https://kutarya.com/oyna/rus-ruleti'; url.searchParams.set('oda', room.code);
    try { await navigator.clipboard.writeText(url.href); toast('Davet bağlantısı kopyalandı. Oda kodu: ' + room.code); }
    catch { toast('Oda kodun: ' + room.code + '\nArkadaşın oyunda bu kodu yazarak katılabilir.'); }
  });
  for (const button of document.querySelectorAll('[data-reaction]')) button.addEventListener('click', () => {
    if (!room || Date.now() - lastReaction < 1800) return; lastReaction = Date.now();
    if (practice) { practice.event('reaction', { player: me, reaction: button.dataset.reaction }); localSnapshot(); }
    else send({ type: 'reaction', reaction: button.dataset.reaction });
  });
  document.addEventListener('keydown', event => {
    if (event.repeat || document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(event.target.tagName)) return;
    if (!room || room.state !== 'playing') return;
    if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); act('pull'); }
    if (event.code === 'KeyP') { event.preventDefault(); act('pass'); }
  });
  setInterval(() => {
    updateControls(); updateClock();
    if (!practice) return;
    practice.tick(Date.now());
    const p = practice.players.get(practice.turn);
    if (practice.state === 'playing' && p?.id !== me && !practice.pending && Date.now() >= practice.lockUntil) {
      if (!botAt) botAt = Date.now() + 1100 + Math.random() * 1100;
      if (Date.now() >= botAt) { try { practice.action(p.id, !p.usedPass && practice.remaining <= 3 && Math.random() < .55 ? 'pass' : 'pull', practice.turnId, Date.now()); } catch {} botAt = 0; }
    } else botAt = 0;
    localSnapshot();
  }, 150);
  // Kod davetleri korumalı iframe'e de ulaşır; yalnız aynı origin'li üst sayfa okunur.
  let invited = new URLSearchParams(location.search).get('oda');
  try { if (!invited && top !== window) invited = new URL(document.referrer).searchParams.get('oda'); } catch {}
  if (/^[A-HJ-NP-Z2-9]{6}$/.test(invited || '')) { $('room-code').value = invited; toast('Davet kodu hazır. Adını seçip ok düğmesiyle masaya katıl.'); }
  try { session = JSON.parse(sessionStorage.getItem('kutarya-son-tur-session') || 'null'); if (session && !/^[A-HJ-NP-Z2-9]{6}$/.test(session.code)) session = null; } catch {}
  connect().catch(() => { status('Bağlantı yok', false); $('population').textContent = 'Sunucuya ulaşılamadı · Botlarla deneyebilirsin'; });
  // Kabul araçları yalnız görünen/halka açık durumu okur; istemci sonucu sunucuya yazamaz.
  window.sonTur = { get state() { return room; }, get playerId() { return me; }, get practice() { return !!practice; }, get connected() { return connected; } };
})();
