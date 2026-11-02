import test from 'node:test';
import assert from 'node:assert/strict';
import { finderMatches, releaseNotes, releaseExcerpt } from '../src/curation.mjs';
const base = { title: 'Örnek', status: 'published', version: '2.0.0', engine: 'download', platforms: ['windows'], files: [], updatedAt: 100, changelog: '2.0.0 · Türkçe güncelleme', tags: [] };
const data = [{ ...base, id: 'game', kind: 'game', engine: 'web', runtime: '/game' }, { ...base, id: 'desktop', kind: 'desktop', files: [{ version: '2.0.0', role: 'installer' }, { version: '2.0.0', role: 'source' }] }, { ...base, id: 'old', kind: 'mobile', files: [{ version: '1.0.0', role: 'source' }, { version: '1.0.0', role: 'installer' }] }, { ...base, id: 'repo', kind: 'source', repository: 'https://example.com/source' }, { ...base, id: 'hidden', kind: 'tool', status: 'draft', engine: 'web', runtime: '/private' }];
test('Keşif rotası gerçek güncel olanakları seçer; eski dosya/taslak önermez', () => {
  assert.deepEqual(finderMatches(data, { intent: 'play' }).map(p => p.id), ['game']);
  assert.deepEqual(finderMatches(data, { intent: 'make' }).map(p => p.id), ['desktop']);
  assert.deepEqual(finderMatches(data, { intent: 'learn' }).map(p => p.id), ['desktop', 'repo']);
  assert.deepEqual(finderMatches(data, { intent: 'make', platform: 'android' }), []);
});
test('Sürüm günlüğü tarihi uydurmaz; gelecekteki/geçersiz tarih boş kalır', () => {
  const notes = releaseNotes([{ ...base, id: 'future', updatedAt: 2000 }, { ...base, id: 'unknown', updatedAt: null }, { ...base, id: 'normal', updatedAt: 100 }], { now: 1000 });
  assert.equal(notes.find(n => n.project.id === 'future').date, null); assert.equal(notes.find(n => n.project.id === 'unknown').date, null); assert.equal(notes.find(n => n.project.id === 'normal').date, 100);
});
test('Günlük Türkçe metin/sürüm ve türe göre filtrelenir; boş/taslak notlar görünmez', () => {
  assert.equal(releaseNotes(data, { q: 'türkçe 2.0', kind: 'desktop' }).length, 1);
  assert.equal(releaseNotes([{ ...base, changelog: '' }, { ...base, status: 'draft' }]).length, 0);
  assert(releaseNotes(data).every(n => n.files.every(f => f.version === n.project.version)));
  assert.equal(releaseExcerpt('  Kısa   bir not. '), 'Kısa bir not.'); assert(releaseExcerpt('uzun '.repeat(80), 50).length <= 50);
});
