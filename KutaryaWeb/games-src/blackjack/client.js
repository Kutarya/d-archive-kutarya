// Tek HTML paketi; dış font/oyun kütüphanesi ve kalıcı hesap bağımlılığı yok.
const BJ_ENDPOINT = '@blackjack-endpoint';
const $ = id => document.getElementById(id), esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const labels = { hit: 'Kart çek', stand: 'Dur', double: 'İkiye katla', split: 'Eli böl', surrender: 'Teslim ol' };
let mode = '', localGame = null, state = null, me = '', ws = null, connected = false, connecting = null;
let resume = null, reconnectStarted = 0, reconnectTimer = null, pingTimer = null, serverOffset = 0, busy = false, audio = null, sound = false;
let toastTimer = null, actionPending = false, dailyRecorded = false, rtt = null, lastFocus = null;
const day = turkeyDay();
function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } }
function read(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
function saveResume(value) { resume = value; try { value ? sessionStorage.setItem('kutarya-bj-resume', JSON.stringify(value)) : sessionStorage.removeItem('kutarya-bj-resume'); } catch {} }
function toast(message) { (document.querySelector('dialog[open]') || document.body).append($('toast')); $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000); }
function openDialog(id) { lastFocus = document.activeElement; $(id).showModal(); }
function closeDialog(dialog) { dialog.close(); lastFocus?.focus?.(); }
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => lastFocus?.focus?.()));
$('help').onclick = () => openDialog('help-dialog');
$('sound').onclick = () => { sound = !sound; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Sesi kapat' : 'Sesi aç'); store('kutarya-bj-sound', sound); chime(); };
function chime(result = false) {
  if (!sound) return;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume().catch(() => {}); const o = audio.createOscillator(), g = audio.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(result ? 660 : 390, audio.currentTime); o.frequency.exponentialRampToValueAtTime(result ? 880 : 280, audio.currentTime + .12); g.gain.setValueAtTime(.055, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .22); o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + .23); } catch {}
}
const fmt = n => new Intl.NumberFormat('tr-TR').format(n), signed = n => `${n > 0 ? '+' : ''}${fmt(n)}`;
function cardHtml(card, index = 0) {
  if (!card) return `<div class="card hidden-card" aria-label="Kapalı kart" style="--i:${index}"><span class="card-symbol" aria-hidden="true">k.</span></div>`;
  return `<div class="card ${['♥', '♦'].includes(card.suit) ? 'red' : ''}" role="img" aria-label="${esc(card.rank + ' ' + card.suit)}" style="--i:${index}"><span class="card-corner" aria-hidden="true">${esc(card.rank)}<small>${esc(card.suit)}</small></span><span class="card-symbol" aria-hidden="true">${esc(card.suit)}</span></div>`;
}
function emptyCards() { return '<div class="card empty-card" aria-hidden="true"><span class="card-symbol">♠</span></div><div class="card empty-card" aria-hidden="true"><span class="card-symbol">♥</span></div>'; }
function currentPlayer() { return state?.players.find(p => p.id === me); }
function coachHint() {
  if (!state || state.phase !== 'playing') return 'Kartlar dağıtılınca eline ve dağıtıcının açık kartına göre bir ipucu görebilirsin.';
  const p = currentPlayer(), h = p?.hands[state.active === me ? state.handIndex : 0];
  if (!h) return 'Sıranı bekle. Her oyuncu ortak dağıtıcıya karşı oynar.';
  const up = value([state.dealer[0]]).total, total = h.total, available = state.actions;
  if (available.includes('split') && h.cards[0].rank === 'A') return 'İki ası bölmek iki güçlü başlangıç sağlar. Bölünmüş aslara birer kart gelir.';
  if (available.includes('split') && h.cards[0].rank === '8') return 'İki sekizi bölmek, 16 ile tek elde kalmaktan daha elverişli olabilir.';
  if (available.includes('double') && !h.soft && total === 11 && up < 11) return '11 iyi bir başlangıç. İkiye katlamak bir kartla elini tamamlar; ek puanın da riske girer.';
  if (h.soft) return total >= 19 ? 'Yumuşak 19 veya üzeri güçlü bir el. Durmak makul bir seçim.' : 'Asın şu an 11 sayılıyor. Bir yüksek kart gelirse as 1’e dönebilir; yumuşak elin esnek.';
  if (total >= 17) return '17 ve üzeri elde kart çekmek 21’i aşma ihtimalini artırır. Durmayı düşün.';
  if (total <= 11) return 'Toplamın 11 veya altı: bir kartla 21’i aşamazsın.';
  if (total >= 12 && up >= 2 && up <= 6) return 'Dağıtıcının açık kartı düşük. Durup onun kart çekmesini beklemek bir seçenek.';
  return 'Dağıtıcının açık kartı güçlü; düşük toplamını geliştirmek için kart çekmeyi düşün.';
}
function applyState(next) {
  const previous = state; state = next; actionPending = false; serverOffset = next.serverNow - Date.now();
  if (next.phase === 'result' && previous?.phase !== 'result') { chime(true); recordDaily(); }
  render();
}
function recordDaily() {
  if (mode !== 'daily' || state.round < 5 || dailyRecorded) return;
  dailyRecorded = true; const score = currentPlayer()?.bank ?? 0, previous = read('kutarya-bj-daily');
  const best = previous?.day === day ? Math.max(Number(previous.best) || 0, score) : score;
  const saved = store('kutarya-bj-daily', { day, best });
  $('daily-best').textContent = saved ? `Bugün bu tarayıcıdaki en iyi sonuç: ${fmt(best)} puan · ${day}` : 'Bu korumalı alanda günlük sonuç kaydedilemiyor. Ayrı sekmede kaydedebilirsin.';
}
function render() {
  $('home').hidden = Boolean(state); $('table').hidden = !state;
  if (!state) return;
  const p = currentPlayer(); if (!p) return;
  const isLocal = mode !== 'online', isHost = state.host === me, result = state.phase === 'result', lobby = state.phase === 'lobby', playing = state.phase === 'playing';
  $('mode-label').textContent = mode === 'daily' ? `GÜNÜN 5 TURU / ${day}` : mode === 'practice' ? 'TEK KİŞİLİK ALIŞTIRMA' : `ARKADAŞLARLA / ${state.players.length} KİŞİ`;
  $('round-label').textContent = mode === 'daily' ? `Tur ${Math.max(1, state.round)} / 5` : `Tur ${Math.max(1, state.round)}`;
  $('invite').hidden = isLocal; $('reactions').hidden = isLocal;
  $('room-label').textContent = isLocal ? 'BU CİHAZDA OYNANIYOR' : `MASA ${state.code}${rtt == null ? '' : ` · ${rtt} ms`}`;
  $('dealer').innerHTML = state.dealer.length ? state.dealer.map(cardHtml).join('') : emptyCards();
  $('dealer-total').textContent = state.dealer.length ? `${state.dealerValue}${playing ? ' + ?' : ''}` : '—';
  $('players').innerHTML = state.players.map(player => {
    const mine = player.id === me, active = state.active === player.id;
    const hands = player.hands.map((h, index) => `<div class="hand ${active && state.handIndex === index ? 'is-active' : ''}"><div class="cards">${h.cards.map(cardHtml).join('')}</div><div class="hand-info"><b>${h.total}${h.soft ? ' / yumuşak' : ''}</b><span>· ${h.stake} puan${player.hands.length > 1 ? ` · El ${index + 1}` : ''}</span></div>${h.outcome ? `<div class="hand-outcome ${h.net > 0 ? 'net-positive' : h.net < 0 ? 'net-negative' : ''}">${esc(h.outcome)} · ${signed(h.net)}</div>` : ''}</div>`).join('');
    return `<article class="seat ${mine ? 'me' : ''} ${active ? 'active' : ''}" data-player="${esc(player.id)}"><div class="seat-head"><strong><span class="avatar" aria-hidden="true">${esc([...player.name][0])}</span>${esc(player.name)}</strong><small>${mine ? 'SEN' : player.id === state.host ? 'MASA SAHİBİ' : ''}</small></div>${lobby ? `<span class="seat-status ${player.ready ? 'is-ready' : ''}">${!player.connected ? 'Bağlantı bekleniyor' : player.ready ? '✓ Hazır' : 'Puan seçiyor'} · ${player.bet} puan</span>` : hands}<div class="seat-bank">${fmt(player.bank)} puan${!player.connected && !lobby ? ' · Bağlantısı kesildi' : ''}</div></article>`;
  }).join('');
  let status;
  if (lobby) status = isLocal ? 'Tur puanını seç, kartları dağıt.' : state.players.length < 2 ? 'Davet kodunu paylaş, arkadaşını bekle.' : state.players.every(p => p.ready) ? 'Herkes hazır. Masa sahibi kartları dağıtabilir.' : 'Herkes hazır olduğunda masa sahibi başlatır.';
  else if (result) status = 'Kartlar açıldı. Gecenin bir turu daha tamam.';
  else status = state.active === me ? `Sıra sende${p.hands.length > 1 ? ` · ${state.handIndex + 1}. el` : ''}. Kararını ver.` : `${state.players.find(p => p.id === state.active)?.name || 'Oyuncu'} düşünüyor…`;
  if (mode === 'online' && !connected) status = 'Bağlantı koptu. Aynı masaya dönülmeye çalışılıyor…';
  $('status').textContent = status;
  $('bank').innerHTML = `${fmt(p.bank)}<small>puan</small>`;
  $('session-score').textContent = mode === 'daily' ? `${Math.min(state.round, 5)} / 5 tur · Başlangıç 1.000 puan` : `Başlangıca göre ${signed(p.bank + (playing ? p.hands.reduce((sum, h) => sum + h.stake, 0) : 0) - 1000)} puan`;
  $('rounds').textContent = p.rounds; $('wins').textContent = p.wins; $('hint').textContent = coachHint();
  $('betting').hidden = !lobby; $('actions').hidden = !playing; $('after-round').hidden = !result;
  const stake = $('stake'); if (!Array.from(stake.options).some(o => Number(o.value) === p.bet)) stake.add(new Option(String(p.bet), String(p.bet)));
  stake.value = p.bet; stake.disabled = mode === 'daily' || p.ready || !lobby || (mode === 'online' && !connected);
  for (const option of stake.options) option.disabled = Number(option.value) > p.bank;
  $('ready').hidden = isLocal; $('ready').textContent = p.ready ? 'Hazırım ✓' : 'Hazırım'; $('ready').setAttribute('aria-pressed', String(p.ready));
  $('ready').disabled = !connected && !isLocal || p.bank < p.bet;
  $('deal').hidden = !isHost && !isLocal; $('deal').disabled = p.bank < p.bet || !isLocal && (!connected || state.players.length < 2 || !state.players.every(p => p.ready));
  for (const action of Object.keys(labels)) $(action).disabled = actionPending || !state.actions.includes(action) || mode === 'online' && !connected;
  const net = p.hands.reduce((sum, h) => sum + h.net, 0);
  $('result-copy').textContent = mode === 'daily' && state.round === 5 ? `Beş tur tamam! Sonucun ${fmt(p.bank)} puan.` : `Bu tur: ${signed(net)} puan${p.hands.length === 1 ? ` · ${p.hands[0].outcome || ''}` : ' · İki el tamamlandı'}`;
  $('next').hidden = !isHost && !isLocal; $('next').disabled = !isLocal && !connected;
  $('next').textContent = mode === 'daily' && state.round === 5 ? 'Aynı günü yeniden dene ↗' : isLocal ? 'Yeni tur ↗' : 'Yeni turu aç ↗';
  $('topup').hidden = p.bank >= 10 || playing || mode === 'daily';
  $('history').innerHTML = state.history.length ? state.history.map(h => { const own = h.players.find(player => player.id === p.id); return `<li><b>Tur ${h.round} <span class="${own?.net > 0 ? 'net-positive' : own?.net < 0 ? 'net-negative' : ''}">${signed(own?.net || 0)} puan</span></b><span>Dağıtıcı: ${h.dealer}</span></li>`; }).join('') : '<li>İlk tur tamamlandığında burada göreceksin.</li>';
  updateClock();
}
function updateClock() {
  if (!state) return;
  $('clock').textContent = state.phase === 'playing' ? `${Math.max(0, Math.ceil((state.deadline - Date.now() - serverOffset) / 1000))}s` : '';
}
function runLocal(op, data = {}) {
  try {
    if (op === 'action') localGame.action(me, data.action, data.turnId, Date.now());
    else if (op === 'bet') localGame.bet(me, data.amount);
    else if (op === 'start') { localGame.ready(me, true); localGame.start(me); chime(); }
    else if (op === 'next') localGame.next(me);
    else if (op === 'topup') localGame.topup(me);
    applyState(localGame.snapshot(me));
  } catch (error) { actionPending = false; toast(error.message); render(); }
}
function startLocal(selected) {
  if (ws?.readyState === 1 && ws.roomActive) transmit({ type: 'leave' });
  stopReconnect(); saveResume(null); if (ws) { ws.onclose = null; ws.close(); ws = null; } connected = false; clearInterval(pingTimer);
  mode = selected; dailyRecorded = false; state = null;
  localGame = new BlackjackTable('LOCAL', { solo: true }, { random: selected === 'daily' ? seededInt(`kutarya-royal-night:${day}`) : secureInt });
  me = localGame.add($('player-name').value).id; applyState(localGame.snapshot(me)); $('table').scrollIntoView({ block: 'start' });
}
$('practice').onclick = () => startLocal('practice'); $('daily').onclick = () => startLocal('daily');
$('stake').onchange = () => command('bet', { amount: Number($('stake').value) });
$('ready').onclick = () => command('ready', { ready: !currentPlayer()?.ready });
$('deal').onclick = () => command('start'); $('topup').onclick = () => command('topup');
$('next').onclick = () => { if (mode === 'daily' && state.round === 5) startLocal('daily'); else command('next'); };
function command(op, data = {}) {
  if (mode !== 'online') { runLocal(op, data); return; }
  if (!connected) { toast('Bağlantı yeniden kuruluyor. Biraz bekle.'); return; }
  transmit({ type: op, ...data });
}
function action(name) {
  if (!state?.actions.includes(name) || actionPending) return;
  actionPending = true; const turnId = state.turnId;
  for (const key of Object.keys(labels)) $(key).disabled = true;
  chime(); command('action', { action: name, turnId });
}
for (const name of Object.keys(labels)) $(name).onclick = () => action(name);
document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || document.querySelector('dialog[open]') || /INPUT|SELECT|TEXTAREA|BUTTON/.test(event.target.tagName)) return;
  const key = { h: 'hit', s: 'stand', d: 'double', p: 'split' }[event.key.toLocaleLowerCase('tr')];
  if (key && state?.actions.includes(key)) { event.preventDefault(); action(key); }
});
function transmit(message) { if (ws?.readyState === 1) ws.send(JSON.stringify(message)); }
function connectionLabel(message) { $('connection').textContent = message; $('connection').classList.toggle('connected', connected); }
function stopReconnect() { clearTimeout(reconnectTimer); reconnectTimer = null; reconnectStarted = 0; }
async function connect() {
  if (connected && ws?.readyState === 1) return;
  if (connecting) return connecting;
  if (!BJ_ENDPOINT) throw Error('Online masalar yayın onayından sonra açılacak. Tek kişilik masa ve günlük meydan okuma hazır.');
  connectionLabel('Masalara bağlanılıyor…');
  connecting = new Promise((resolve, reject) => {
    const socket = new WebSocket(BJ_ENDPOINT.replace(/^https:/, 'wss:') + '/play'); ws = socket;
    const timer = setTimeout(() => { socket.close(); reject(Error('Masa servisine zamanında ulaşılamadı. Yeniden dene.')); }, 15000);
    socket.onopen = () => transmit({ type: 'hello', version: BJ_VERSION, name: $('player-name').value });
    socket.onmessage = event => {
      let m; try { m = JSON.parse(event.data); } catch { return; }
      if (m.type === 'hello') {
        clearTimeout(timer); connected = true; connectionLabel('Masalara bağlı'); clearInterval(pingTimer);
        pingTimer = setInterval(() => transmit({ type: 'ping', at: performance.now() }), 5000); resolve();
      }
      if (m.type === 'rooms') renderRooms(m.rooms);
      if (m.type === 'joined') { mode = 'online'; me = m.id; socket.roomActive = true; stopReconnect(); saveResume({ code: m.room.code, token: m.token, at: Date.now() }); applyState(m.room); closeCreate(); }
      if (m.type === 'state' && mode === 'online') applyState(m.room);
      if (m.type === 'pong') { rtt = Math.round(performance.now() - m.at); if (state && mode === 'online') $('room-label').textContent = `MASA ${state.code} · ${rtt} ms`; }
      if (m.type === 'error') {
        actionPending = false; toast(m.message); if (!connected) { clearTimeout(timer); reject(Error(m.message)); }
        if (reconnectStarted) { saveResume(null); stopReconnect(); returnHome(); } else render();
      }
      if (m.type === 'expired') { toast(m.message); saveResume(null); returnHome(); }
      if (m.type === 'reaction') showReaction(m.id, m.reaction);
      if (m.type === 'left') { socket.roomActive = false; saveResume(null); returnHome(); }
    };
    socket.onerror = () => { connectionLabel('Bağlantı kurulamadı · Tekrar deneyebilirsin'); };
    socket.onclose = () => {
      clearTimeout(timer); clearInterval(pingTimer); connected = false; connecting = null; connectionLabel('Bağlantı kapalı · Yeniden dene');
      reject(Error('Masa servisine bağlanılamadı. İnternetini kontrol edip yeniden dene.'));
      if (mode === 'online' && resume && state) { render(); scheduleReconnect(); }
    };
  }).finally(() => { connecting = null; });
  return connecting;
}
function scheduleReconnect() {
  if (!reconnectStarted) reconnectStarted = Date.now();
  if (Date.now() - reconnectStarted > RECONNECT_MS) { toast('Geri dönüş süresi doldu. Yeni bir masaya katıl.'); saveResume(null); stopReconnect(); returnHome(); return; }
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(async () => { try { await connect(); if (resume) transmit({ type: 'resume', code: resume.code, token: resume.token }); } catch { scheduleReconnect(); } }, 1500);
}
async function online(op, extra = {}) {
  if (busy) return; busy = true;
  try { await connect(); transmit({ type: 'profile', name: $('player-name').value }); transmit({ type: op, ...extra }); }
  catch (error) { toast(error.message); connectionLabel(BJ_ENDPOINT ? 'Masalara ulaşılamadı · Yeniden dene' : 'Online masalar yayın bekliyor'); }
  finally { busy = false; }
}
function renderRooms(rooms) {
  $('rooms').innerHTML = rooms.length ? rooms.map(r => `<button class="room-item" data-code="${esc(r.code)}"><span>${esc(r.name)}’nın masası <small>· ${esc(r.code)}</small></span><small>${r.count} / ${r.max} kişi ↗</small></button>`).join('') : '<p>Şu an açık masa yok. Yeni bir masa kurup arkadaşını çağırabilirsin.</p>';
}
$('rooms').onclick = event => { const button = event.target.closest('[data-code]'); if (button) online('join', { code: button.dataset.code }); };
$('create').onclick = () => openDialog('create-dialog');
function closeCreate() { if ($('create-dialog').open) closeDialog($('create-dialog')); }
$('create-submit').onclick = () => online('create', { max: Number($('capacity').value), public: $('public-room').checked });
$('quick').onclick = () => online('quick'); $('refresh').onclick = () => online('list');
$('join').onclick = () => online('join', { code: $('room-code').value.trim().toUpperCase() });
for (const id of ['player-name', 'room-code']) $(id).addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); $('join').click(); } });
$('room-code').addEventListener('input', () => { $('room-code').value = $('room-code').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
$('player-name').addEventListener('change', () => store('kutarya-bj-name', $('player-name').value));
$('invite').onclick = () => { $('invite-code').value = state.code; $('invite-link').value = `https://kutarya.com/oyna/blackjack?masa=${state.code}`; openDialog('invite-dialog'); };
$('copy-invite').onclick = async () => { try { await navigator.clipboard.writeText($('invite-link').value); toast('Davet bağlantısı kopyalandı.'); } catch { $('invite-link').focus(); $('invite-link').select(); toast(`Masa kodu: ${state.code}. Bağlantıyı seçip kopyalayabilirsin.`); } };
function returnHome() { state = null; localGame = null; mode = ''; me = ''; actionPending = false; if (ws) ws.roomActive = false; render(); $('home').hidden = false; $('table').hidden = true; $('practice').focus(); }
function leave() {
  closeDialog($('leave-dialog')); stopReconnect(); saveResume(null);
  if (mode === 'online') { if (connected) transmit({ type: 'leave' }); else { if (ws) { ws.onclose = null; ws.close(); } returnHome(); } }
  else returnHome();
}
$('leave').onclick = () => { if (state?.phase === 'playing') openDialog('leave-dialog'); else leave(); };
$('leave-confirm').onclick = leave;
function showReaction(id, reaction) {
  const seat = [...document.querySelectorAll('.seat')].find(s => s.dataset.player === id); if (!seat) return;
  seat.querySelector('.reaction-bubble')?.remove(); const bubble = document.createElement('span'); bubble.className = 'reaction-bubble'; bubble.textContent = { wave: '👋', clap: '👏', luck: '🍀', wow: '😮' }[reaction] || ''; seat.append(bubble); setTimeout(() => bubble.remove(), 2200);
}
document.querySelectorAll('[data-reaction]').forEach(button => { button.onclick = () => command('reaction', { reaction: button.dataset.reaction }); });
setInterval(() => { updateClock(); if (localGame && state?.phase === 'playing') { const revision = localGame.revision; localGame.tick(Date.now()); if (localGame.revision !== revision) applyState(localGame.snapshot(me)); } }, 200);
const savedName = read('kutarya-bj-name'); if (typeof savedName === 'string') $('player-name').value = playerName(savedName);
const savedDaily = read('kutarya-bj-daily'); if (savedDaily?.day === day && Number.isFinite(savedDaily.best)) $('daily-best').textContent = `Bugün bu tarayıcıdaki en iyi sonuç: ${fmt(savedDaily.best)} puan · ${day}`;
sound = read('kutarya-bj-sound') === true; $('sound').setAttribute('aria-pressed', String(sound)); $('sound').setAttribute('aria-label', sound ? 'Sesi kapat' : 'Sesi aç');
let inviteCode = new URL(location.href).searchParams.get('masa');
try { inviteCode ||= new URL(document.referrer).searchParams.get('masa'); } catch {}
if (/^[A-HJ-NP-Z2-9]{6}$/.test(inviteCode || '')) { $('room-code').value = inviteCode; $('player-name').focus(); }
try { const saved = JSON.parse(sessionStorage.getItem('kutarya-bj-resume') || 'null'); if (saved && Date.now() - saved.at < TABLE_MS && !inviteCode) { saveResume(saved); connect().then(() => transmit({ type: 'resume', code: saved.code, token: saved.token })).catch(error => toast(error.message)); } } catch {}
window.royalNight = { get state() { return state; }, get mode() { return mode; }, get connected() { return connected; } };
