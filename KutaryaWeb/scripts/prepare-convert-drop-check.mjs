// Sadece yerel kabul: nihai HTML'e sentetik dosyaları taşıyan test yüzeyi ekler.
import { readFile, writeFile } from "node:fs/promises";
const html = await readFile(
  "public/games/kutarya-convert/1.0.0/index.html",
  "utf8",
);
const helper = `<div id="drop-fixtures" draggable="true" style="position:fixed;z-index:100;top:12px;left:12px;padding:18px;background:#ffe8ba;border:2px dashed #096b79;font:14px Segoe UI">İki kabul dosyasını aşağıya sürükle <button id="test-drop">Bırakma olayını dene</button><span id="test-result"></span></div><script>
function fixtureTransfer(){const d=new DataTransfer();d.items.add(new File(['Çağrı — Türkçe'],'birakma.txt',{type:'text/plain'}));d.items.add(new File(['ad,numara\\nÇağrı,0012'],'birakma.csv',{type:'text/csv'}));return d;}
document.querySelector('#drop-fixtures').addEventListener('dragstart',e=>{const d=fixtureTransfer();for(const f of d.files)e.dataTransfer.items.add(f);e.dataTransfer.effectAllowed='copy';document.querySelector('#test-result').textContent='Drag başladı: '+e.dataTransfer.files.length;});
document.querySelector('#test-drop').onclick=()=>{const d=fixtureTransfer();document.querySelector('#test-result').textContent='Sentetik bırakma: '+d.files.length;document.querySelector('#drop-zone').dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:d}));};
</script>`;
const end = html.lastIndexOf("</body>");
if (end < 0) throw new Error("HTML son etiketi yok.");
await writeFile(
  "public/tools-preview/convert-drop-check.html",
  html.slice(0, end) + helper + html.slice(end),
);
