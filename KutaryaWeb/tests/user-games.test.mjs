import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { transform } from "lightningcss";

test("Üç oyunun CSS'i geçerlidir ve çevrimdışı font isteği yoktur", async () => {
  for (const id of ["blackjack", "rulet", "pixelgun"]) {
    const html = await readFile(`games-src/${id}/index.html`, "utf8");
    for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      assert.doesNotThrow(() =>
        transform({
          filename: `${id}.css`,
          code: Buffer.from(match[1]),
          errorRecovery: false,
        }),
      );
    }
    assert.equal(/fonts\.googleapis\.com|@import\s+url/.test(html), false);
  }
});
function element() {
  return {
    style: { setProperty() {} },
    classList: { add() {}, remove() {} },
    dataset: {},
    appendChild() {},
    querySelector() {
      return element();
    },
    animate() {},
    innerHTML: "",
    textContent: "",
    disabled: false,
  };
}
async function load(id) {
  const html = await readFile(`games-src/${id}/index.html`, "utf8");
  const code = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].at(
    -1,
  )[1];
  const nodes = new Map(),
    timers = [];
  const document = {
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, element());
      return nodes.get(id);
    },
    querySelector: () => element(),
    querySelectorAll: () => [],
    createElement: element,
    documentElement: element(),
  };
  const context = vm.createContext({
    document,
    console,
    Math,
    setTimeout(fn, ms) {
      timers.push({ fn, ms });
      return timers.length;
    },
    clearTimeout() {},
    ResizeObserver: class {
      observe() {}
    },
  });
  vm.runInContext(code, context);
  return { run: (code) => vm.runInContext(code, context), timers, nodes };
}
test("Blackjack asları gerektiğinde 1 sayar; doğal blackjack yalnız iki karttır", async () => {
  const g = await load("blackjack");
  assert.equal(g.run(`handValue([{rank:'A'},{rank:'A'},{rank:'9'}])`), 21);
  assert.equal(g.run(`isBlackjack([{rank:'A'},{rank:'K'}])`), true);
  assert.equal(g.run(`isBlackjack([{rank:'7'},{rank:'7'},{rank:'7'}])`), false);
});
test("Blackjack animasyonda ikinci double ve hit para/kart değiştirmez", async () => {
  const g = await load("blackjack");
  g.run(
    `playing=true;playerHand=[{rank:'2',suit:'♠'},{rank:'3',suit:'♠'}];dealerHand=[{rank:'K',suit:'♠'},{rank:'7',suit:'♠'}];currentBet=50;balance=950;deck=Array(20).fill({rank:'2',suit:'♠'});doubleDown();doubleDown();hit();`,
  );
  assert.equal(g.run("balance"), 900);
  assert.equal(g.run("currentBet"), 100);
  assert.equal(g.run("playerHand.length"), 3);
});
test("Blackjack dağıtıcı animasyonu sırasında reset eski turu sürdüremez", async () => {
  const g = await load("blackjack");
  const promise = g.run(
    `playing=true;playerHand=[{rank:'K',suit:'♠'},{rank:'7',suit:'♠'}];dealerHand=[{rank:'2',suit:'♠'},{rank:'3',suit:'♠'}];stand()`,
  );
  g.run("resetGame()");
  g.timers.find((t) => t.ms === 480).fn();
  await promise;
  assert.equal(g.run("dealerHand.length"), 0);
  assert.equal(g.run("games"), 0);
  assert.equal(g.run("balance"), 1000);
});
test("Rulette sıfır dış bahisleri kazandırmaz ve çip geri alma tam iade eder", async () => {
  const g = await load("rulet");
  for (const type of [
    "red",
    "black",
    "odd",
    "even",
    "low",
    "high",
    "dozen1",
    "col1",
  ])
    assert.equal(g.run(`betWins('${type}',0)`), false);
  assert.equal(g.run("betWins('num:0',0)"), true);
  g.run("placeBet('red');undoBet()");
  assert.equal(g.run("balance"), 1000);
  assert.equal(g.run("getTotalBet()"), 0);
});
test("Rulette dönüş sırasında seçimler kilitli; kazanan renk doğru toplam öder", async () => {
  const g = await load("rulet");
  g.run(
    "placeBet('red');spinning=true;placeBet('black');clearBets();undoBet()",
  );
  assert.equal(g.run("balance"), 975);
  assert.equal(g.run("getTotalBet()"), 25);
  g.run("settleRound(32)");
  assert.equal(g.run("balance"), 1025);
  assert.equal(g.run("getTotalBet()"), 0);
  assert.equal(g.run("rounds"), 1);
});
