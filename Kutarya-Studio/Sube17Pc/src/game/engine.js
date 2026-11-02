// Şube 17: modelden ve arayüzden bağımsız, deterministik oyun kuralları.
export const SAVE_VERSION = 1;
export const SAVE_KEY = 'sube17.save.v1';
export const BACKUP_KEY = 'sube17.save.backup.v1';
export const RECORD_KEY = 'sube17.record.v1';
export const DIFFICULTIES = [
  { id: 'easy', label: 'KOLAY', money: 3000, note: 'Günlük 180 KT destek, daha yumuşak baskı', pressure: .75, lies: .25, cost: .8 },
  { id: 'normal', label: 'ORTA', money: 2000, note: 'Aile ile iş arasında hassas bir denge', pressure: 1, lies: .4, cost: 1 },
  { id: 'hard', label: 'ZOR', money: 1200, note: 'Pahalı ihtiyaçlar, daha çok tutarsız dosya', pressure: 1.3, lies: .52, cost: 1.2 },
  { id: 'impossible', label: 'İMKÂNSIZ', money: 700, note: 'Dar bütçe ve hızla ağırlaşan koşullar', pressure: 1.6, lies: .64, cost: 1.45 },
];
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const difficulty = g => DIFFICULTIES.find(d => d.id === g.profile.difficulty) || DIFFICULTIES[1];
const clone = g => ({ ...g, family: g.family.map(p => ({ ...p, need: p.need ? { ...p.need } : null })), news: { ...g.news }, bank: { ...g.bank }, inventory: { ...g.inventory }, escaped: [...g.escaped], log: [...g.log] });
function random(g) { let x = g.seed >>> 0; x ^= x << 13; x ^= x >>> 17; x ^= x << 5; g.seed = x >>> 0 || 1; return g.seed / 4294967296; }
const pick = (g, values) => values[Math.floor(random(g) * values.length)];
const integer = (g, min, max) => min + Math.floor(random(g) * (max - min + 1));
function log(g, message) { g.log = [message, ...g.log].slice(0, 16); g.notice = message; }
function freeze(value) { if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
export const formatTime = minute => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
export const moneyText = money => `${Math.round(money).toLocaleString('tr-TR')} KT`;
const FAMILY = [
  { id: 'wife', name: 'Leyla', role: 'Eşin', room: 'living', color: '#9a5545', line: 'Birlikte oturabildiğimiz akşamları özlüyorum.', item: 'Kışlık kumaş', base: 180 },
  { id: 'mother', name: 'Nermin', role: 'Annen', room: 'living', color: '#758274', line: 'Sana çay koydum. İşin yorgunluğu yüzüne vurmuş.', item: 'Sıcak bir şal', base: 120 },
  { id: 'daughter', name: 'Elif', role: 'Kızın', room: 'children', color: '#b78948', line: 'Bugün okulda yeni bir resim yaptım. Bakacak mısın?', item: 'Okul defterleri', base: 100 },
  { id: 'son', name: 'Deniz', role: 'Oğlun', room: 'children', color: '#567c83', line: 'Sokağın öbür ucundaki saha da kapatılmış.', item: 'Ayakkabı tamiri', base: 140 },
  { id: 'uncle', name: 'Cemal', role: 'Dayın', room: 'kitchen', color: '#836b89', line: 'Çarşıda herkes fiyat konuşuyor. Kimse yarını bilmiyor.', item: 'Gözlük tamiri', base: 150 },
];
export function createGame(profile = {}) {
  const d = DIFFICULTIES.find(x => x.id === profile.difficulty) || DIFFICULTIES[1];
  const g = {
    version: SAVE_VERSION, profile: { name: String(profile.name || 'Memur').trim().slice(0, 28) || 'Memur', difficulty: d.id },
    seed: Number.isInteger(profile.seed) ? profile.seed >>> 0 || 1 : ((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0 || 1),
    money: d.money, day: 1, minute: 540, stress: 18, health: 100, phase: 'morning',
    family: FAMILY.map((p, i) => ({ ...p, mood: 85, status: 'home', illDays: 0, talkedDay: 0, need: i === 2 ? { title: p.item, cost: Math.round(p.base * d.cost), due: 3 } : null })),
    inventory: { food: 1 }, foodBoughtDay: 0, bribes: 0, bribesToday: 0, escaped: [],
    news: { unread: true, day: 1, nextDay: 3, title: 'Yeni düzen, aynı masa', body: 'Merkez Bankası Şube 17 yeniden açılıyor. Kimlik ve başvuru tutarlı olmalı; kredi doğrulanmış aylık gelirin altı katını aşamaz.', price: 1, cap: 6, banned: null, regime: 'Geçici Konsey' },
    bank: { queue: [], index: 0, asked: [], correct: 0, wrong: 0, repayments: 0, decisions: [], nextAt: 540, started: false },
    report: null, casino: null, risk: null, gameover: null, log: ['Şube 17 seni bekliyor. Bankaya gidene kadar saat 09.00’da kalır.'], notice: '',
  };
  return g;
}
const FIRST = ['Aylin', 'Murat', 'Selin', 'Orhan', 'Derya', 'Kemal', 'Bahar', 'Fikret', 'Suna', 'Tarık', 'İpek', 'Selim', 'Gül', 'Cihan', 'Eren', 'Nalan'];
const LAST = ['Yalın', 'Ergin', 'Sayar', 'Aksu', 'Demir', 'Özer', 'Koral', 'Duran', 'Aydın', 'Şen', 'Güner', 'Ekin'];
const PLACES = ['Kuzeyyaka', 'Demirköy', 'Aşağıhisar', 'Güneyova', 'Taşliman', 'Kavaklı'];
const JOBS = [
  { job: 'Terzi', purpose: 'Dikiş makinesi', detail: 'Atölyedeki makine sık sık iplik koparıyor. İki yeni sipariş aldım.', employer: 'Yaka Dikiş Atölyesi' },
  { job: 'Fırıncı', purpose: 'Fırın onarımı', detail: 'Fırının taşları çatladı. Sabah ekmeğini yetiştiremiyoruz.', employer: 'Mahalle Fırını' },
  { job: 'Öğretmen', purpose: 'Ev onarımı', detail: 'Çatı yağmurda akıtıyor. Çocukların odasını kıştan önce onarmak istiyorum.', employer: 'Halk Mektebi' },
  { job: 'Demiryolu işçisi', purpose: 'Sağlık gideri', detail: 'Babamın tedavi masrafı için geldim. Hastanenin dökümü dosyada.', employer: 'İmparatorluk Demiryolları' },
  { job: 'Kitapçı', purpose: 'Dükkân yenileme', detail: 'Raflar rutubetten çürüdü. Kitapları korumak için yeni dolaplar yaptıracağım.', employer: 'Liman Kitabevi' },
  { job: 'Hemşire', purpose: 'Eğitim gideri', detail: 'Akşam okuluna kabul edildim. Kayıt ücretini peşin istiyorlar.', employer: 'Merkez Hastanesi' },
  { job: 'Tamirci', purpose: 'İş ekipmanı', detail: 'Yeni ölçüm cihazı alacağım. Eldeki aletler artık güvenilir değil.', employer: 'Koral Tamirhanesi' },
  { job: 'Muhasebeci', purpose: 'Nakliye gideri', detail: 'İş yerim değişti. Eşyalarımı yeni mahalleye taşımam gerekiyor.', employer: 'Şehir Ticaret Birliği' },
];
export function generateCustomer(g, index) {
  const d = difficulty(g); const spec = pick(g, JOBS); const name = `${pick(g, FIRST)} ${pick(g, LAST)}`;
  const income = integer(g, 9, 30) * 100; const city = pick(g, PLACES); const id = `KT-${integer(g, 100000, 999999)}`;
  const bad = random(g) < Math.min(.78, d.lies + (g.day - 1) * .006);
  const fault = bad ? pick(g, ['identity', 'income', 'amount', 'testimony']) : null;
  const amount = Math.round(income * (fault === 'amount' ? g.news.cap + 1.5 : 2 + random(g) * (g.news.cap - 2)) / 100) * 100;
  const declaredIncome = fault === 'income' ? income + 600 : income;
  const bankId = fault === 'identity' ? id.slice(0, -1) + ((Number(id.at(-1)) + 1) % 10) : id;
  const purpose = g.news.banned && random(g) < .12 ? g.news.banned : spec.purpose;
  const forbidden = purpose === g.news.banned;
  const employerReply = fault === 'testimony' ? 'Dün oradan ayrıldım. Dosyayı eski iş yerime göre doldurmuştum; henüz yeni bir gelirim yok.' : `${spec.employer} bünyesinde çalışıyorum. Bordromdaki ${moneyText(income)} net aylık gelir değişmedi.`;
  const reasons = { identity: 'Kimlik kartındaki KT numarası başvurudaki numarayla uyuşmuyor.', income: 'Bordrodaki doğrulanmış gelir, başvuruda beyan edilen gelirden farklı.', amount: `Kredi tutarı, doğrulanmış gelirin ${g.news.cap} katını aşıyor.`, testimony: 'Müşteri, gelir belgesinde görünen işten ayrıldığını söyledi; düzenli geliri artık geçerli değil.' };
  const customer = {
    uid: `${g.day}-${index}-${id}`, type: 'loan', name, city, id, serial: `S${integer(g, 10000, 99999)}`,
    job: spec.job, employer: spec.employer, income, declaredIncome, bankId, amount, purpose,
    greeting: pick(g, [`Günaydın. Belgelerimi getirdim; ${purpose.toLocaleLowerCase('tr')} için başvuracağım.`, `Sıram geldi mi? ${purpose} için sizinle görüşmem söylendi.`, 'Kolay gelsin. Dosyam burada; merak ettiğiniz her şeyi sorabilirsiniz.']),
    color: pick(g, ['#946657', '#657d7d', '#9b8458', '#746884']),
    questions: [
      { id: 'purpose', label: 'Krediyi ne için kullanacaksınız?', answer: purpose === spec.purpose ? spec.detail : 'Yeni düzen birikimlerimizi eritti. İthal mücevher alarak değerini korumayı düşünüyorum.' },
      { id: 'income', label: 'İşinizi ve aylık gelirinizi doğrular mısınız?', answer: employerReply },
      { id: 'identity', label: 'Kimlik numaranız ve ikametiniz?', answer: `${id}, ${city}. Kimlik kartımdaki bilgiler doğrudur.` },
      { id: 'repayment', label: 'Taksitleri nasıl ödeyeceksiniz?', answer: fault === 'amount' ? 'İstediğim tutarın gelirime göre yüksek olduğunu biliyorum. Yine de bir yolunu bulurum diye düşündüm.' : 'Aylık gelirimden ayıracağım. Dosyada yazan koşulları kabul ediyorum.' },
    ],
    bribe: random(g) < .015 ? integer(g, 2, 5) * 100 : 0,
    truth: { approve: !bad && !forbidden, repays: !bad && !forbidden, reason: forbidden ? `Yürürlükteki genelge “${purpose}” için krediyi yasaklıyor.` : bad ? reasons[fault] : 'Kimlik, başvuru, bordro ve görüşme birbiriyle tutarlı; tutar kredi sınırında.' },
  };
  return freeze(customer);
}
export function currentCustomer(g) { return g.phase === 'working' && g.minute >= g.bank.nextAt ? g.bank.queue[g.bank.index] || null : null; }
export function startShift(game) {
  if (game.phase !== 'morning') return game;
  const g = clone(game); g.phase = 'working'; g.minute = 540; g.bribesToday = 0;
  const repayments = g.escaped.filter(e => e.repays && e.due <= g.day);
  const queue = repayments.map(e => freeze({ ...e, uid: `repay-${e.uid}`, type: 'repayment' }));
  for (let i = 0; i < Math.min(22, 12 + Math.floor(g.day / 3)); i++) queue.push(generateCustomer(g, i));
  g.bank = { queue, index: 0, asked: [], correct: 0, wrong: 0, repayments: 0, decisions: [], nextAt: 540, started: true };
  log(g, 'Vardiya başladı. Gerçek 1 saniye = oyunda 1 dakika. Saat 17.00’de mesai biter.'); return g;
}
export function askQuestion(game, id) {
  const c = currentCustomer(game); if (!c || c.type !== 'loan' || game.bank.asked.includes(id) || !c.questions.some(q => q.id === id)) return game;
  const g = clone(game); g.bank.asked = [...g.bank.asked, id]; return g;
}
function nextCustomer(g) { g.bank.index++; g.bank.asked = []; g.bank.nextAt = Math.min(1020, g.minute + integer(g, 5, 12)); }
export function decide(game, approved, takeBribe = false) {
  const c = currentCustomer(game); if (!c || c.type !== 'loan' || typeof approved !== 'boolean') return game;
  const g = clone(game); const correct = approved === c.truth.approve;
  g.bank.correct += correct ? 1 : 0; g.bank.wrong += correct ? 0 : 1;
  g.bank.decisions = [...g.bank.decisions, { uid: c.uid, correct, approved }];
  g.stress = clamp(g.stress + (correct ? -.5 : 4 * difficulty(g).pressure));
  if (takeBribe && approved && c.bribe) { g.money += c.bribe; g.bribes++; g.bribesToday++; }
  if (approved) g.escaped.push({ uid: c.uid, name: c.name, id: c.id, amount: c.amount, repays: c.truth.repays, due: g.day + 2, announced: false });
  log(g, `${approved ? 'ONAY' : 'RED'} damgası dosyaya işlendi. Sonuçlar mesai sonunda değerlendirilecek.`); nextCustomer(g); return g;
}
export function collectRepayment(game) {
  const c = currentCustomer(game); if (!c || c.type !== 'repayment') return game;
  const g = clone(game); g.bank.repayments++;
  g.escaped = g.escaped.filter(e => `repay-${e.uid}` !== c.uid);
  log(g, `${moneyText(c.amount)} banka kasasına işlendi; makbuz teslim edildi.`); nextCustomer(g); return g;
}
export function salaryFor(correct, wrong, level = 'normal') {
  const total = correct + wrong; if (!total) return level === 'easy' ? 180 : 0;
  const accuracy = correct / total;
  // İlk altı dosya tam mesai tabanını açar; tek doğru dosyayla tam maaş alınamaz.
  // Bundan sonra doğruluk 900 KT, iş hacmi en çok 90 KT belirler.
  const coverage = Math.min(total / 6, 1);
  return Math.round(900 * accuracy ** 2 * coverage + Math.min(total, 18) * 5 * accuracy) + (level === 'easy' ? 180 : 0);
}
export function bribeRisk(count) { return count <= 1 ? 0 : count === 2 ? .12 : count === 3 ? .28 : Math.min(.72, .42 + (count - 4) * .06); }
export function mentalRisk(health) { return health > 20 ? 0 : Math.min(.7, .08 + (20 - Math.max(health, 0)) * .025); }
function finishShift(g) {
  const total = g.bank.correct + g.bank.wrong; const salary = salaryFor(g.bank.correct, g.bank.wrong, g.profile.difficulty);
  const risk = g.bribesToday ? bribeRisk(g.bribes) : 0; const caught = g.bribesToday > 0 && random(g) < risk;
  g.report = { day: g.day, total, correct: g.bank.correct, wrong: g.bank.wrong, accuracy: total ? Math.round(g.bank.correct / total * 100) : 0, repayments: g.bank.repayments, salary, bribeRoll: g.bribesToday ? (caught ? 6 : integer(g, 1, 5)) : null, bribeRisk: risk, caught };
  g.money += salary; g.minute = 1020; g.phase = 'report'; log(g, `Vardiya tamamlandı. ${moneyText(salary)} maaş hesabına yatırıldı.`); return g;
}
export function advanceTime(game, minutes = 1) {
  if (game.phase !== 'working' || !Number.isFinite(minutes) || minutes < 1) return game;
  const g = clone(game); g.minute = Math.min(1020, g.minute + Math.floor(minutes));
  return g.minute >= 1020 ? finishShift(g) : g;
}
function endGame(g, cause, description) { g.phase = 'gameover'; g.gameover = { cause, description, days: g.day }; log(g, description); return g; }
export function dismissReport(game) {
  if (game.phase !== 'report') return game;
  const g = clone(game); if (g.report.caught) return endGame(g, 'Rüşvet soruşturması', 'Soruşturma rüşveti ortaya çıkardı. İşini kaybettin; yaşadığın ruhsal çöküş hayatını sona erdirdi.');
  g.phase = 'evening'; return g;
}
export function readNews(game) { const g = clone(game); g.news.unread = false; return g; }
export function talkToFamily(game, id) {
  if (!['morning', 'evening'].includes(game.phase)) return game;
  const g = clone(game); const p = g.family.find(x => x.id === id);
  if (!p || p.status !== 'home' || p.talkedDay === g.day) return game;
  p.talkedDay = g.day; p.mood = clamp(p.mood + 5); log(g, `${p.name} ile biraz vakit geçirdin.`); return g;
}
export function payNeed(game, id) {
  if (!['morning', 'evening'].includes(game.phase)) return game;
  const g = clone(game); const p = g.family.find(x => x.id === id);
  if (!p || p.status !== 'home' || !p.need || g.money < p.need.cost) return game;
  g.money -= p.need.cost; log(g, `${p.name}: ${p.need.title} ihtiyacı karşılandı.`); p.need = null; p.mood = clamp(p.mood + 18); return g;
}
export function foodPrice(g) { return Math.round(145 * difficulty(g).cost * g.news.price); }
export function medicinePrice(g, person) { return Math.round((person?.id === 'mother' ? 190 : 140) * difficulty(g).cost * g.news.price); }
export function buyFood(game) {
  if (!['morning', 'evening'].includes(game.phase) || game.money < foodPrice(game) || game.inventory.food >= 3) return game;
  const g = clone(game); g.money -= foodPrice(g); g.inventory.food++; log(g, 'Bir günlük aile erzağı mutfağa bırakıldı.'); return g;
}
export function buyMedicine(game, id) {
  if (!['morning', 'evening'].includes(game.phase)) return game;
  const g = clone(game); const p = g.family.find(x => x.id === id);
  if (!p || p.status !== 'home' || p.illDays < 1 || g.money < medicinePrice(g, p)) return game;
  g.money -= medicinePrice(g, p); p.illDays = 0; p.mood = clamp(p.mood + 12); log(g, `${p.name} için ilaç alındı ve tedavisi uygulandı.`); return g;
}
export function visitBar(game) {
  const cost = Math.round(120 * game.news.price);
  if (game.phase !== 'evening' || game.money < cost || game.stress <= 0) return game;
  const g = clone(game); g.money -= cost; g.stress = clamp(g.stress - 18); log(g, 'Sessiz bir masa, sıcak yemek. Stresin 18 puan azaldı.'); return g;
}
function publishNews(g) {
  const chapters = [
    { title: 'Karne uygulaması başlıyor', body: 'Geçici Konsey temel ürünlerin dağıtımını daralttı. Gıda ve ilaç fiyatları yükseldi; kredi üst sınırı gelirin beş katına indirildi.', cap: 5, price: 1.15, banned: null, regime: 'Geçici Konsey' },
    { title: 'Meydandaki kalabalık büyüyor', body: 'İşçi Meclisi meydanın kontrolünü aldı. İthal mücevher için kredi yasaklandı. Gelirin altı katına kadar kredi verilebilir.', cap: 6, price: 1.25, banned: 'İthal mücevher', regime: 'İşçi Meclisi' },
    { title: 'Olağanüstü ekonomi genelgesi', body: 'Yürütme Kurulu yeni tasarruf kararını duyurdu. Kredi üst sınırı doğrulanmış gelirin dört katı; ithal mücevher yasağı sürüyor.', cap: 4, price: 1.4, banned: 'İthal mücevher', regime: 'Yürütme Kurulu' },
    { title: 'Çarşı yeniden açılıyor', body: 'Uzlaşma Konseyi tedarik yollarını açtı. Ürünler yeniden bulunabiliyor. Kredi üst sınırı gelirin altı katı; amaç kısıtlaması kaldırıldı.', cap: 6, price: 1.05, banned: null, regime: 'Uzlaşma Konseyi' },
  ];
  const chapter = chapters[Math.floor((g.day - 2) / 3) % chapters.length];
  const fugitives = g.escaped.filter(e => !e.repays && !e.announced && e.due <= g.day);
  g.escaped = g.escaped.map(e => fugitives.some(f => f.uid === e.uid) ? { ...e, announced: true } : e);
  g.news = { ...chapter, day: g.day, nextDay: g.day + integer(g, 2, 4), unread: true, body: chapter.body + (fugitives.length ? ` Tahsilat duyurusu: ${fugitives.map(e => `${e.name} (${e.id})`).join(', ')} krediyi ödemeden kayboldu.` : ''), price: chapter.price + Math.floor(g.day / 12) * .1 };
  log(g, 'Yeni bir genelge yayımlandı. Televizyonu ve banka kural defterini kontrol et.');
}
export function sleep(game) {
  if (game.phase !== 'evening') return game;
  const g = clone(game); const d = difficulty(g); g.risk = null;
  const fed = g.inventory.food > 0; if (fed) g.inventory.food--;
  else { g.stress = clamp(g.stress + 9 * d.pressure); log(g, 'Mutfakta erzak kalmadı. Aile geceyi aç geçirdi.'); }
  for (const p of g.family) {
    if (p.status !== 'home') continue;
    p.mood = clamp(p.mood - (fed ? 1 : 12));
    if (p.need && g.day >= p.need.due) { p.mood = clamp(p.mood - 12 * d.pressure); g.stress = clamp(g.stress + 3 * d.pressure); }
    if (p.illDays) {
      p.illDays++; p.mood = clamp(p.mood - 8);
      if (p.illDays >= 5) { p.status = 'dead'; g.health = clamp(g.health - 20); g.stress = clamp(g.stress + 20); log(g, `${p.name} tedavisiz kalan hastalığı nedeniyle hayatını kaybetti.`); }
      else log(g, `${p.name} hâlâ hasta. ${p.illDays >= 3 ? 'Durumu ağırlaşıyor; eczaneden acilen ilaç almalısın.' : 'İlaç ihtiyacı devam ediyor.'}`);
    }
    if (p.status === 'home' && p.need && g.day - p.need.due >= 5 && p.mood <= 20) { p.status = 'left'; g.health = clamp(g.health - 18); log(g, `${p.name} uzun süren ihmalin ardından evden ayrıldı.`); }
  }
  if (g.stress >= 60) g.health = clamp(g.health - Math.ceil((g.stress - 50) / 8 * d.pressure));
  if (g.day % 3 === 0) {
    const chance = mentalRisk(g.health); const fatal = chance > 0 && random(g) < chance;
    g.risk = { type: 'mental', day: g.day, chance, roll: fatal ? 6 : integer(g, 1, 5), fatal };
    if (fatal) return endGame(g, 'Ruhsal çöküş', 'Birikmiş kayıplar ve ruhsal çöküş hayatını sona erdirdi.');
  }
  g.day++; g.minute = 540; g.phase = 'morning'; g.report = null; g.casino = null; g.stress = clamp(g.stress - 8);
  for (const p of g.family) {
    if (p.status !== 'home') continue;
    if (!p.need && random(g) < Math.min(.6, .14 * d.pressure + g.day * .003)) p.need = { title: p.item, cost: Math.round(p.base * d.cost * g.news.price), due: g.day + 2 };
    if (!p.illDays && (g.day === 2 && p.id === 'mother' || random(g) < .025 * d.pressure)) { p.illDays = 1; log(g, `${p.name} hastalandı. Eczanede gerekli ilaç mevcut.`); }
  }
  if (g.day >= g.news.nextDay) publishNews(g);
  if (!g.notice) log(g, `${g.day}. gün. Saat 09.00; bankaya gidene kadar zaman ilerlemez.`);
  return g;
}
export function cardValue(cards) { let value = 0, aces = 0; for (const card of cards) { value += card.rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(card.rank) ? 10 : Number(card.rank); if (card.rank === 'A') aces++; } while (value > 21 && aces > 0) { value -= 10; aces--; } return value; }
function deck(g) { const cards = []; for (const suit of ['♠', '♥', '♦', '♣']) for (const rank of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) cards.push({ rank, suit }); for (let i = cards.length - 1; i > 0; i--) { const j = integer(g, 0, i); [cards[i], cards[j]] = [cards[j], cards[i]]; } return cards; }
function settle(g, forced) {
  const hand = g.casino; const player = cardValue(hand.player), dealer = cardValue(hand.dealer);
  const result = forced || (player > 21 ? 'lose' : dealer > 21 || player > dealer ? 'win' : player === dealer ? 'push' : 'lose');
  const payout = result === 'blackjack' ? hand.bet * 2.2 : result === 'win' ? hand.bet * 2 : result === 'push' ? hand.bet : 0;
  g.money += Math.round(payout); hand.status = 'done'; hand.result = result; hand.payout = Math.round(payout); g.stress = clamp(g.stress + (result === 'lose' ? 4 : -2)); return g;
}
export function startBlackjack(game, bet) {
  if (game.phase !== 'evening' || game.casino?.status === 'playing' || ![50, 100, 200].includes(bet) || game.money < bet) return game;
  const g = clone(game); g.money -= bet; const cards = deck(g);
  g.casino = { bet, deck: cards, player: [cards.pop(), cards.pop()], dealer: [cards.pop(), cards.pop()], status: 'playing', result: null };
  if (cardValue(g.casino.player) === 21 || cardValue(g.casino.dealer) === 21) return settle(g, cardValue(g.casino.player) === 21 ? cardValue(g.casino.dealer) === 21 ? 'push' : 'blackjack' : 'lose');
  return g;
}
export function blackjackAction(game, action) {
  if (game.phase !== 'evening' || game.casino?.status !== 'playing' || !['hit', 'stand'].includes(action)) return game;
  const g = clone(game); g.casino = { ...game.casino, deck: [...game.casino.deck], player: [...game.casino.player], dealer: [...game.casino.dealer] };
  if (action === 'hit') { g.casino.player.push(g.casino.deck.pop()); if (cardValue(g.casino.player) > 21) return settle(g, 'lose'); return g; }
  while (cardValue(g.casino.dealer) < 17) g.casino.dealer.push(g.casino.deck.pop()); return settle(g);
}
function validNumber(value, min, max) { return Number.isFinite(value) && value >= min && value <= max; }
export function validateGame(g) {
  if (!g || g.version !== SAVE_VERSION || !g.profile || typeof g.profile.name !== 'string' || !DIFFICULTIES.some(d => d.id === g.profile.difficulty)) return false;
  if (!['morning', 'working', 'report', 'evening', 'gameover'].includes(g.phase) || !Number.isInteger(g.day) || g.day < 1 || !Number.isInteger(g.minute) || !validNumber(g.minute, 540, 1020)) return false;
  if (!validNumber(g.money, 0, 1e12) || !validNumber(g.stress, 0, 100) || !validNumber(g.health, 0, 100) || !Number.isInteger(g.seed) || g.seed < 1) return false;
  if (!Array.isArray(g.family) || g.family.length !== 5 || !FAMILY.every(f => g.family.filter(p => p?.id === f.id).length === 1)) return false;
  if (g.family.some(p => !['home', 'left', 'dead'].includes(p.status) || !validNumber(p.mood, 0, 100) || !Number.isInteger(p.illDays) || p.illDays < 0 || p.need && (!validNumber(p.need.cost, 0, 1e9) || typeof p.need.title !== 'string' || !Number.isInteger(p.need.due)))) return false;
  if (!g.bank || !Array.isArray(g.bank.queue) || !Array.isArray(g.bank.asked) || !Array.isArray(g.bank.decisions) || !Number.isInteger(g.bank.index) || g.bank.index < 0 || g.bank.index > g.bank.queue.length) return false;
  if (['correct', 'wrong', 'repayments'].some(k => !Number.isInteger(g.bank[k]) || g.bank[k] < 0) || !validNumber(g.bank.nextAt, 540, 1020)) return false;
  if (g.bank.queue.some(c => !c || !['loan', 'repayment'].includes(c.type) || typeof c.name !== 'string' || !validNumber(c.amount, 0, 1e9) || c.type === 'loan' && (!Array.isArray(c.questions) || !c.questions.every(q => typeof q.id === 'string' && typeof q.answer === 'string') || typeof c.truth?.approve !== 'boolean' || typeof c.truth?.repays !== 'boolean'))) return false;
  if (!g.news || typeof g.news.body !== 'string' || !validNumber(g.news.price, .1, 1e6) || !validNumber(g.news.cap, 1, 20) || !Number.isInteger(g.news.nextDay)) return false;
  if (!g.inventory || !Number.isInteger(g.inventory.food) || g.inventory.food < 0 || !Array.isArray(g.escaped) || !Array.isArray(g.log) || !g.log.every(x => typeof x === 'string')) return false;
  if (!Number.isInteger(g.bribes) || g.bribes < 0 || !Number.isInteger(g.bribesToday) || g.bribesToday < 0) return false;
  if (g.phase === 'report' && (!g.report || !validNumber(g.report.salary, 0, 1e9))) return false;
  if (g.phase === 'gameover' && (!g.gameover || typeof g.gameover.description !== 'string')) return false;
  if (g.phase === 'morning' && g.minute !== 540 || ['evening', 'report'].includes(g.phase) && g.minute !== 1020) return false;
  if (g.casino && (!['playing', 'done'].includes(g.casino.status) || !Array.isArray(g.casino.deck) || !Array.isArray(g.casino.player) || !Array.isArray(g.casino.dealer) || ![50, 100, 200].includes(g.casino.bet) || [...g.casino.deck, ...g.casino.player, ...g.casino.dealer].some(c => !c || !['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].includes(c.rank) || !['♠', '♥', '♦', '♣'].includes(c.suit)))) return false;
  if (g.location !== undefined && !['street', 'home', 'bank', 'bar', 'pharmacy', 'casino', 'market'].includes(g.location)) return false;
  if (g.family.some(p => !['name', 'role', 'room', 'line', 'item'].every(k => typeof p[k] === 'string') || !['living', 'children', 'kitchen'].includes(p.room) || !Number.isInteger(p.talkedDay))) return false;
  if (!['title', 'body', 'regime'].every(k => typeof g.news[k] === 'string') || !Number.isInteger(g.news.day) || typeof g.news.unread !== 'boolean') return false;
  if (g.bank.queue.some(c => c.type === 'loan' && (!['uid', 'id', 'serial', 'job', 'city', 'employer', 'bankId', 'purpose', 'greeting'].every(k => typeof c[k] === 'string') || !validNumber(c.income, 0, 1e9) || !validNumber(c.declaredIncome, 0, 1e9) || !c.questions.every(q => typeof q.label === 'string')))) return false;
  const current = g.bank.queue[g.bank.index];
  if (g.bank.asked.some(id => !current || current.type !== 'loan' || !current.questions.some(q => q.id === id))) return false;
  if (g.phase === 'report' && (!['total', 'correct', 'wrong', 'accuracy', 'repayments', 'salary'].every(k => Number.isFinite(g.report[k])) || typeof g.report.caught !== 'boolean')) return false;
  if (g.risk && (!validNumber(g.risk.chance, 0, 1) || !Number.isInteger(g.risk.roll) || g.risk.roll < 1 || g.risk.roll > 6)) return false;
  if (g.escaped.some(e => !e || !['uid', 'name', 'id'].every(k => typeof e[k] === 'string') || !Number.isInteger(e.due) || typeof e.repays !== 'boolean' || !validNumber(e.amount, 0, 1e9))) return false;
  if (g.casino) {
    const cards = [...g.casino.deck, ...g.casino.player, ...g.casino.dealer];
    if (cards.length !== 52 || new Set(cards.map(c => `${c.rank}${c.suit}`)).size !== 52 || g.casino.player.length < 2 || g.casino.dealer.length < 2) return false;
  }
  return true;
}
function checksum(text) { let hash = 2166136261; for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619); return (hash >>> 0).toString(16); }
function decode(text) { const data = JSON.parse(text); if (!data || data.version !== SAVE_VERSION || typeof data.payload !== 'string' || data.checksum !== checksum(data.payload)) throw new Error('Kayıt bütünlüğü doğrulanamadı.'); const g = JSON.parse(data.payload); if (!validateGame(g)) throw new Error('Kayıt alanları geçersiz.'); g.bank.queue.forEach(freeze); return g; }
export function getRecord(storage) { try { storage ??= globalThis.localStorage; const n = Number(storage?.getItem(RECORD_KEY)); return Number.isInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
export function saveGame(game, storage) {
  try {
    storage ??= globalThis.localStorage;
    if (!storage || !validateGame(game)) return { ok: false, error: 'Oyun kaydı doğrulanamadı.' };
    const old = storage.getItem(SAVE_KEY); if (old) { try { decode(old); storage.setItem(BACKUP_KEY, old); } catch { /* Sağlam yedeği bozuk ana kayıtla ezme. */ } }
    const payload = JSON.stringify(game); storage.setItem(SAVE_KEY, JSON.stringify({ version: SAVE_VERSION, checksum: checksum(payload), payload }));
    storage.setItem(RECORD_KEY, String(Math.max(getRecord(storage), game.gameover?.days || game.day - 1))); return { ok: true };
  } catch { return { ok: false, error: 'Yerel kayıt yazılamadı. Depolama alanını ve erişim iznini kontrol et.' }; }
}
export function loadGame(storage) {
  try {
    storage ??= globalThis.localStorage;
    if (!storage) return { game: null, recovered: false, error: null };
    const main = storage.getItem(SAVE_KEY), backup = storage.getItem(BACKUP_KEY);
    if (!main && !backup) return { game: null, recovered: false, error: null };
    try { return { game: decode(main), recovered: false, error: null }; } catch { if (backup) { try { return { game: decode(backup), recovered: true, error: 'Ana kayıt okunamadı; son sağlam yedek kurtarıldı.' }; } catch { /* İki kayıt da geçersiz. */ } } }
    return { game: null, recovered: false, error: 'Kayıt ve yedeği okunamadı. Dosyalar korunuyor; yeni oyun başlatabilirsin.' };
  } catch { return { game: null, recovered: false, error: 'Yerel kayda erişilemiyor.' }; }
}
export function clearSavedGame(storage) { try { storage ??= globalThis.localStorage; storage?.removeItem(SAVE_KEY); storage?.removeItem(BACKUP_KEY); return true; } catch { return false; } }
