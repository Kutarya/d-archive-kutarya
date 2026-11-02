// Gerçek yeni bulut servisi; test masaları normal leave ile temizlenir.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { WebSocket } from '../roulette-server/node_modules/ws/wrapper.mjs';
import { out, version } from './roulette-paths.mjs';
const { url } = JSON.parse(await readFile(`${out}/service.json`, 'utf8'));
const clients = [], checks = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function until(fn, label, ms = 20000) { const end = Date.now() + ms; while (Date.now() < end) { if (fn()) return; await sleep(70); } throw Error('Zaman aşımı: ' + label); }
function send(c, m) { c.ws.send(JSON.stringify(m)); }
async function connect(name = 'KABUL') {
  const ws = new WebSocket(url.replace('https:', 'wss:') + '/play', { origin: 'https://kutarya.com' });
  const c = { ws, s: null, id: null, token: null, messages: [], errors: [], rooms: [] }; clients.push(c);
  ws.on('error', () => {}); ws.on('message', raw => {
    const m = JSON.parse(raw); c.messages.push(m); if (m.type === 'error') c.errors.push(m.message);
    if (['joined', 'state'].includes(m.type)) { c.s = m.room; c.clockOffset = m.room.serverNow - Date.now(); if (m.type === 'joined') { c.id = m.id; c.token = m.token; } }
    if (m.type === 'rooms') c.rooms = m.rooms;
    if (m.type === 'left') c.s = null;
  });
  await new Promise((ok, fail) => { ws.once('open', ok); ws.once('error', fail); }); send(c, { type: 'hello', version, name, color: 0 });
  await until(() => c.messages.some(m => m.type === 'hello'), 'hello'); return c;
}
async function rejected(c, m, match) { const n = c.errors.length; send(c, m); await until(() => c.errors.length > n, 'red'); assert.match(c.errors.at(-1), match); }
try {
  const health = await fetch(url + '/health'); assert.equal(health.status, 200); assert.equal((await health.json()).version, version); assert.equal((await fetch(url + '/not-found')).status, 404); checks.push('HTTPS health/404');
  const forbidden = new WebSocket(url.replace('https:', 'wss:') + '/play', { origin: 'https://example.net' });
  forbidden.on('error', () => {}); const denied = await new Promise(done => { forbidden.on('unexpected-response', (_, r) => { r.resume(); forbidden.terminate(); done(r.statusCode); }); }); assert.equal(denied, 403); checks.push('yabancı origin 403');
  const a = await connect('Yağız'), b = await connect('İpek'); send(a, { type: 'create', max: 2, public: false }); await until(() => a.id, 'oda'); const code = a.s.code;
  send(b, { type: 'list' }); await sleep(200); assert(!b.rooms.some(r => r.code === code)); checks.push('özel oda listede yok');
  await rejected(b, { type: 'join', code: 'ZZZZZZ' }, /bulunamadı/); send(b, { type: 'join', code }); await until(() => b.id && a.s.players.length === 2, 'kodla katılım');
  assert(a.s.players.some(p => p.name === 'İpek')); checks.push('iki gerçek bağlantı/Türkçe ad/kod');
  const c = await connect('Üçüncü'); await rejected(c, { type: 'join', code }, /dolu/); checks.push('kapasite 2/üçüncü reddi');
  await rejected(b, { type: 'start' }, /sahibi/); await rejected(a, { type: 'start' }, /hazır/); send(b, { type: 'ready', ready: true }); await until(() => a.s.players.find(p => p.id === b.id).ready, 'hazır'); send(a, { type: 'start' }); await until(() => a.s.state === 'playing' && b.s.state === 'playing' && a.s.turnId === b.s.turnId, 'başlat'); checks.push('sahip/hazır kapıları');
  const actor = a.s.turn === a.id ? a : b, other = actor === a ? b : a;
  await rejected(other, { type: 'action', action: 'pull', turnId: a.s.turnId, id: actor.id, result: 'safe', score: 999 }, /Sıranın/);
  assert.equal(a.s.remaining, 6); assert(!('loaded' in a.s)); assert(!JSON.stringify(a.s).includes(a.token)); checks.push('kimlik/sonuç enjeksiyonu ve gizli hazne reddi');
  await until(() => Date.now() + actor.clockOffset >= actor.s.lockUntil + 150, 'spin'); const tid = actor.s.turnId;
  send(actor, { type: 'action', action: 'pass', turnId: tid }); await until(() => actor.s.pending, 'pas'); await rejected(actor, { type: 'action', action: 'pass', turnId: tid }, /Sıranın/); assert.equal(actor.s.remaining, 6); checks.push('tek hamle/tekrar paket/pas hazne tüketmez');
  const end = Date.now() + 40000;
  while (Date.now() < end && a.s.state !== 'result') {
    if (a.s.state === 'playing' && !a.s.pending && Date.now() + a.clockOffset >= a.s.lockUntil + 150) {
      const current = a.s.turn === a.id ? a : b; send(current, { type: 'action', action: 'pull', turnId: a.s.turnId }); await sleep(200);
    }
    await sleep(100);
  }
  await until(() => a.s.state === 'result' && b.s.state === 'result', 'sonuç'); assert.equal(a.s.winner, b.s.winner); assert.equal(a.s.players.filter(p => p.alive).length, 1); checks.push('gerçek oyun/iki istemcide aynı kazanan');
  await rejected(b, { type: 'rematch' }, /sahibi/); send(a, { type: 'rematch' }); await until(() => b.s.state === 'lobby', 'rövanş'); checks.push('rövanş/sahip doğrulama');
  const token = a.token, originalId = a.id; a.ws.terminate(); await until(() => b.s.players.find(p => p.id === originalId)?.connected === false, 'kopma');
  const resumed = await connect('Farklı Ad'); send(resumed, { type: 'resume', code, token }); await until(() => resumed.id, 'yeniden bağlanma'); assert.equal(resumed.id, originalId); assert.equal(resumed.s.players.find(p => p.id === originalId).name, 'Yağız'); checks.push('gerçek kopma/aynı kimlik ve adla dönüş');
  const intruder = await connect('Yanlış Anahtar'); await rejected(intruder, { type: 'resume', code, token: 'a'.repeat(48) }, /Oturum/); checks.push('yanlış dönüş anahtarı reddi');
  send(resumed, { type: 'leave' }); await until(() => b.s.host === b.id, 'sahiplik'); checks.push('oda sahibi ayrılınca sahiplik geçişi'); send(b, { type: 'leave' }); await until(() => !b.s, 'özel oda temizliği');
  send(c, { type: 'create', public: true, max: 6 }); await until(() => c.id, 'açık masa'); const publicCode = c.s.code;
  send(intruder, { type: 'list' }); await until(() => intruder.rooms.some(r => r.code === publicCode), 'liste'); checks.push('gerçek açık masa listesi');
  const extras = []; for (let i = 0; i < 5; i++) { const p = await connect('Altılı ' + i); send(p, { type: 'join', code: publicCode }); await until(() => p.id, 'altılı katılım'); extras.push(p); }
  await until(() => c.s.players.length === 6, 'altılı durum'); assert.equal(c.s.players.length, 6); await rejected(intruder, { type: 'join', code: publicCode }, /dolu/); checks.push('altı oyuncu/yedinci reddi');
  for (const p of [c, ...extras]) send(p, { type: 'leave' }); await until(() => !c.s, 'altılı temizliği');
  const q = await connect('Hızlı A'), r = await connect('Hızlı B'); send(q, { type: 'quick' }); await until(() => q.id, 'hızlı A'); send(r, { type: 'quick' }); await until(() => r.id && r.s.code === q.s.code, 'hızlı B');
  await until(() => q.s.state === 'playing' && r.s.state === 'playing', 'otomatik başlat', 16000); checks.push('hızlı eşleşme/aynı oda/8 saniye otomatik başlangıç');
  send(q, { type: 'leave' }); send(r, { type: 'leave' }); await until(() => !q.s && !r.s, 'hızlı oda temizliği');
  const third = await connect('Hızlı C'); send(q, { type: 'quick' }); await until(() => q.s?.quick, 'ikinci hızlı masa'); send(r, { type: 'quick' }); await until(() => r.s?.code === q.s.code, 'ikinci hızlı rakip'); send(third, { type: 'quick' }); await until(() => third.s?.code === q.s.code, 'üçlü hızlı masa');
  const departedHost = q.id; q.ws.terminate(); await until(() => r.s.players.find(p => p.id === departedHost)?.connected === false, 'geri sayım kopması');
  await until(() => r.s.state === 'playing' && r.s.players.length === 2, 'kopmuş sahip olmadan başlama', 16000); assert.equal(r.s.host, r.id); assert(r.s.players.some(p => p.id === r.s.host)); checks.push('geri sayımda sahip kopması/bağlı oyuncuya sahiplik');
  const oversized = await connect('Boyut'); const closed = new Promise(done => oversized.ws.once('close', done)); oversized.ws.send('x'.repeat(3000)); const closeCode = await closed; assert.equal(closeCode, 1009); checks.push('paket boyutu sınırı');
  const service = JSON.parse(await readFile(`${out}/service.json`, 'utf8'));
  await writeFile(`${out}/protocol-acceptance.json`, JSON.stringify({ passed: true, live: true, at: new Date().toISOString(), service: url, revision: service.revision, checks, listeningServerStarted: false, physicalNetworkLoadTested: false }, null, 2)); console.log(JSON.stringify({ passed: true, checks }));
} catch (error) {
  await writeFile(`${out}/protocol-failure.json`, JSON.stringify({ at: new Date().toISOString(), message: error.message, checks, clients: clients.map(c => ({ id: c.id, errors: c.errors, state: c.s })) }, null, 2)); throw error;
} finally {
  for (const c of clients) if (c.ws.readyState === WebSocket.OPEN) send(c, { type: 'leave' });
  await sleep(400); for (const c of clients) c.ws.close();
}
