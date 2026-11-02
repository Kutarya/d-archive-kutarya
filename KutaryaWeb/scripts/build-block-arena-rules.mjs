// Harita ve silahlar mevcut oyun kaynağından alınır; sunucu/istemci geometrisi ayrışmaz.
import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const html = await readFile("games-src/pixelgun/index.html", "utf8");
function between(start, end) {
  const a = html.indexOf(start),
    b = html.indexOf(end, a + start.length);
  assert(a >= 0 && b > a, `Oyun kaynak sınırı bulunamadı: ${start}`);
  return html.slice(a, b);
}
const constants =
  between("const WEAPONS =", "const SKINS =") +
  between("const MAPS =", "const MODES =");
const mapCode = between("function seeded(", "function loadMap(");
const geometry = between("function blocked(", "function lineOfSight(");
const source = `// build-block-arena-rules.mjs tarafından mevcut oyun kaynağından üretilir.\n
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TAU=Math.PI*2;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
// Sunucu çizim yapmaz; aynı tohumlu harita üretimindeki rastgele tüketimi korunur.
const cube=()=>{};
${constants}
${mapCode}
export {WEAPONS,MAPS};
export function createWorld(index){
 const map=makeMap(index);
 ${geometry}
 return {map,blocked,moveActor,supportHeight,rayBox,wallRay};
}\n`;
await writeFile("arena-server/rules.mjs", source);
console.log("Arena sunucu haritası ve silah kuralları mevcut motorla eşlendi.");
