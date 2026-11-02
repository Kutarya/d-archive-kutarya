import test from 'node:test';
import assert from 'node:assert/strict';
import * as e from '../src/game/engine.js';

const fresh = (seed = 42, difficulty = 'normal') => e.createGame({ name: 'Test Memuru', seed, difficulty });
const evening = (seed = 42) => e.dismissReport(e.advanceTime(e.startShift(fresh(seed)), 480));
const storage = () => { const data = new Map(); return { getItem:k=>data.get(k)??null, setItem:(k,v)=>data.set(k,v), removeItem:k=>data.delete(k) }; };

test('Dört zorluk ve başlangıç değerleri geçerli bir kayıt oluşturur', () => {
  for (const d of e.DIFFICULTIES) { const g=fresh(1,d.id); assert.equal(g.money,d.money); assert.equal(g.phase,'morning'); assert.equal(g.minute,540); assert.equal(g.family.length,5); assert.ok(e.validateGame(g)); }
});
test('Sabah/akşam zaman donuk; yalnız vardiya akar ve ikinci kez başlatılamaz', () => {
  const g=fresh(); assert.equal(e.advanceTime(g,500),g); assert.equal(e.sleep(g),g);
  const w=e.startShift(g); assert.equal(e.startShift(w),w); assert.equal(e.advanceTime(w,1).minute,541); assert.equal(e.advanceTime(w,NaN),w);
  const a=evening(); assert.equal(e.advanceTime(a,100),a); assert.equal(e.startShift(a),a);
});
test('17.00 raporu ve maaş yalnız bir kez yazılır; saat taşmaz', () => {
  const w=e.startShift(fresh()); const r=e.advanceTime(w,9000);
  assert.equal(r.phase,'report'); assert.equal(r.minute,1020); assert.equal(e.advanceTime(r,1),r); assert.equal(r.money,w.money+r.report.salary);
  const a=e.dismissReport(r); assert.equal(a.phase,'evening'); assert.equal(e.dismissReport(a),a);
});
test('Çok sayıda dosyada doğru karar yalnız görünür belge ve cevaplardan çıkarılabilir', () => {
  let count=0;
  for (let seed=1;seed<=150;seed++) for (const d of e.DIFFICULTIES) {
    const g=fresh(seed,d.id); if(seed%3===0) {g.news.cap=4;g.news.banned='İthal mücevher';}
    const shift=e.startShift(g);
    for(const c of shift.bank.queue) {
      const incomeAnswer=c.questions.find(q=>q.id==='income').answer;
      const expected=c.id===c.bankId && c.income===c.declaredIncome && c.amount<=c.income*g.news.cap && !incomeAnswer.includes('Dün oradan ayrıldım') && c.purpose!==g.news.banned;
      assert.equal(c.truth.approve,expected,`${seed} ${c.uid}`); assert.ok(Object.isFrozen(c.truth)); count++;
    }
  }
  assert.equal(count,7200);
});
test('Hazır diyalog gizli gerçeği değiştirmez; aynı soru mükerrer işlenmez', () => {
  const w=e.startShift(fresh());const c=e.currentCustomer(w);const q=e.askQuestion(w,'income');
  assert.deepEqual(q.bank.queue,w.bank.queue);assert.deepEqual(q.bank.asked,['income']);assert.equal(e.askQuestion(q,'income'),q);assert.deepEqual(w.bank.asked,[]);assert.ok(Object.isFrozen(c));
});
test('Onay/red bir dosyaya bir kez uygulanır; kredi kişisel cüzdanı değiştirmez', () => {
  const w=e.startShift(fresh());const c=e.currentCustomer(w);const next=e.decide(w,c.truth.approve);
  assert.equal(next.bank.correct,1);assert.equal(next.money,w.money);assert.equal(next.bank.index,1);assert.equal(e.decide(next,true),next);assert.equal(w.bank.correct,0);
});
test('Doğruluk, hatalı dosya hızından daha fazla maaş getirir', () => {
  assert.ok(e.salaryFor(4,0)>e.salaryFor(12,6));assert.equal(e.salaryFor(0,0),0);assert.equal(e.salaryFor(0,0,'easy'),180);assert.equal(e.salaryFor(18,0),990);
});
test('Tek doğru müşteri tam maaş açmaz; ilk altı dosya kapsam oluşturur', () => {
  assert.equal(e.salaryFor(1,0),155);assert.equal(e.salaryFor(6,0),930);assert.ok(e.salaryFor(1,0)<e.salaryFor(6,0)/3);
});
test('Geri ödeme tahsil edilene kadar ertesi gün yeniden gelebilir, banka parası maaş değildir', () => {
  const g=fresh();g.escaped=[{uid:'past',name:'Eski Müşteri',id:'KT-1',amount:2000,repays:true,due:1,announced:false}];
  const w=e.startShift(g);assert.equal(e.currentCustomer(w).type,'repayment');assert.equal(w.escaped.length,1);
  const paid=e.collectRepayment(w);assert.equal(paid.bank.repayments,1);assert.equal(paid.money,g.money);assert.equal(paid.escaped.length,0);assert.equal(e.collectRepayment(paid),paid);
});
test('Yeni gün yalnız akşam uyumakla başlar; erzak tüketilir, anne için ilaç açılır', () => {
  const a=evening();const b=e.sleep(a);assert.equal(b.day,2);assert.equal(b.minute,540);assert.equal(b.phase,'morning');assert.equal(b.inventory.food,a.inventory.food-1);assert.ok(b.family.find(p=>p.id==='mother').illDays>0);assert.equal(e.sleep(b),b);
});
test('Hasta olmayan aile üyesine ilaç satılmaz, hasta tedavisi tek ödeme alır', () => {
  const g=fresh();assert.equal(e.buyMedicine(g,'wife'),g);const day2=e.sleep(evening());const p=day2.family.find(p=>p.id==='mother');const cost=e.medicinePrice(day2,p);const cured=e.buyMedicine(day2,'mother');
  assert.equal(cured.money,day2.money-cost);assert.equal(cured.family.find(p=>p.id==='mother').illDays,0);assert.equal(e.buyMedicine(cured,'mother'),cured);
});
test('Erzak stok ve para sınırını aşmaz; aile isteği yalnız bir kez ödenir', () => {
  let g=fresh();g=e.buyFood(e.buyFood(g));assert.equal(g.inventory.food,3);assert.equal(e.buyFood(g),g);
  const need=g.family.find(p=>p.need);const paid=e.payNeed(g,need.id);assert.equal(paid.money,g.money-need.need.cost);assert.equal(e.payNeed(paid,need.id),paid);
  const poor={...fresh(),money:0};assert.equal(e.buyFood(poor),poor);assert.equal(e.payNeed(poor,'daughter'),poor);
});
test('Aileyle konuşmak gelir üretmez, aynı gün yinelenmez', () => {
  const g=fresh();const a=e.talkToFamily(g,'wife');assert.equal(a.money,g.money);assert.equal(a.stress,g.stress);assert.equal(e.talkToFamily(a,'wife'),a);
});
test('Bar yalnız akşam stres azaltır; kalıcı akıl sağlığını onarmaz', () => {
  const g=fresh();assert.equal(e.visitBar(g),g);const a={...evening(),stress:70,health:45};const b=e.visitBar(a);assert.equal(b.stress,52);assert.equal(b.health,45);assert.ok(b.money<a.money);
});
test('Ruhsal zar 80 hasardan önce ölüm üretemez, ilk rüşvet yakalanmaz', () => {
  assert.equal(e.mentalRisk(21),0);assert.equal(e.mentalRisk(100),0);assert.ok(e.mentalRisk(20)>0);assert.ok(e.mentalRisk(0)>e.mentalRisk(20));assert.equal(e.bribeRisk(1),0);assert.ok(e.bribeRisk(2)<e.bribeRisk(3));
  for(let seed=1;seed<=80;seed++) { const g={...evening(seed),day:3,health:21,stress:0};g.family=g.family.map(p=>({...p,need:null,illDays:0}));const n=e.sleep(g);assert.equal(n.phase,'morning');assert.equal(n.risk.chance,0);assert.notEqual(n.risk.roll,6); }
});
test('Genelge zamanı sabah yürürlüğe girer, gün 3 haberini izlemeden de kural okunabilir', () => {
  let g=e.sleep(evening());g=e.sleep(e.dismissReport(e.advanceTime(e.startShift(g),480)));assert.equal(g.day,3);assert.equal(g.news.unread,true);assert.equal(g.news.day,3);assert.equal(g.news.cap,5);const read=e.readNews(g);assert.equal(read.news.unread,false);assert.equal(read.news.cap,g.news.cap);
});
test('Blackjack 52 benzersiz kartı korur, bahis tekrarlanamaz, ödeme ikinci kez alınamaz', () => {
  for(let seed=1;seed<=60;seed++) {
    const g=evening(seed);let b=e.startBlackjack(g,100);assert.ok(e.validateGame(b));
    if(b.casino.status==='playing') {assert.equal(e.startBlackjack(b,100),b);const serialized=JSON.stringify(b);const next=e.blackjackAction(b,'stand');assert.equal(JSON.stringify(b),serialized);b=next;}
    assert.equal(b.casino.status,'done');assert.equal(e.blackjackAction(b,'stand'),b);assert.equal(b.money,g.money-100+b.casino.payout);assert.ok(e.validateGame(b));
  }
  assert.equal(e.cardValue([{rank:'A'},{rank:'A'},{rank:'9'}]),21);
});
test('Çalışan vardiya ve aktif casino eli kayıttan aynen devam eder', () => {
  for(const game of [e.askQuestion(e.startShift(fresh()),'income'),e.startBlackjack(evening(),100)]) {const mem=storage();assert.equal(e.saveGame(game,mem).ok,true);const loaded=e.loadGame(mem);assert.deepEqual(loaded.game,game);assert.equal(loaded.recovered,false);}
});
test('Bozuk ana kayıt sağlam yedeğe döner ve yedeği bozmaz', () => {
  const mem=storage();const g=fresh();e.saveGame(g,mem);e.saveGame(e.startShift(g),mem);mem.setItem(e.SAVE_KEY,'bozuk');const recovered=e.loadGame(mem);assert.equal(recovered.recovered,true);assert.deepEqual(recovered.game,g);e.saveGame(g,mem);assert.equal(e.loadGame(mem).recovered,false);
});
test('Geçersiz kayıt, eksik kart ve depolama hataları ekranı kırmadan raporlanır', () => {
  assert.equal(e.validateGame({...fresh(),money:NaN}),false);const b=e.startBlackjack(evening(),100);const broken={...b,casino:{...b.casino,deck:[]}};assert.equal(e.validateGame(broken),false);
  const bad={getItem(){throw Error('disk');},setItem(){throw Error('disk');}};assert.equal(e.saveGame(fresh(),bad).ok,false);assert.equal(e.loadGame(bad).game,null);assert.equal(e.getRecord(bad),0);
});
test('Otuz günlük deterministik simülasyonlarda para, ruhsal sınırlar ve kayıt bütünlüğü korunur', () => {
  for(const d of e.DIFFICULTIES) {let g=fresh(983,d.id);for(let day=0;day<30 && g.phase!=='gameover';day++) {g=e.startShift(g);while(g.bank.index<g.bank.queue.length){let c=e.currentCustomer(g);if(!c){g=e.advanceTime(g,12);continue;}g=c.type==='repayment'?e.collectRepayment(g):e.decide(g,c.truth.approve);}g=e.dismissReport(e.advanceTime(g,480));for(const p of g.family){if(p.illDays)g=e.buyMedicine(g,p.id);if(p.need)g=e.payNeed(g,p.id);}if(!g.inventory.food)g=e.buyFood(g);g=e.sleep(g);assert.ok(e.validateGame(g),`${d.id} day${g.day}`);assert.ok(g.money>=0);}}
});
