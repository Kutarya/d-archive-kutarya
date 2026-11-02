// npm prepare:video güncel sürümün tamamlanmış paket kabulünü seçer.
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { kutaryaVideo } from '../projects-src/kutarya-video.mjs';
assert.equal(kutaryaVideo.version, '1.1.0', 'Yeni sürüm için hazırlama/kabul hattını önce güncelle.');
const input = resolve(process.argv[2] || 'D:/KutaryaVideo');
let runtimeDirectory = input;
if (!input.includes('Kanitlar')) {
  const evidence = resolve(input, 'Kanitlar'); let selected;
  const names = (await readdir(evidence)).filter(n => /^portable-\d+$/.test(n)).sort((a,b) => Number(b.slice(9)) - Number(a.slice(9)));
  for (const name of names) {
    try {
      const report = JSON.parse(await readFile(resolve(evidence, name, 'kabul.json'), 'utf8'));
      if (report.passed && report.packaged && report.appVersion === kutaryaVideo.version) { selected = resolve(evidence, name); break; }
    } catch {}
  }
  assert(selected, 'Güncel gerçek portable kabulü gerekli: kaynak içinde node scripts/smoke.cjs --portable.');
  runtimeDirectory = selected;
}
process.argv[2] = runtimeDirectory;
await import('./prepare-video-1.1-site.mjs');
