import test from 'node:test';
import assert from 'node:assert/strict';
import { nightEntries } from '../src/game-night.mjs';
import { pageSeo, publicRoutes } from '../src/seo.mjs';
import { userGames } from '../games-src/projects.mjs';
const game = { id: 'blackjack', slug: 'blackjack', title: 'Royal Night', subtitle: '', kind: 'game', status: 'published', engine: 'web', runtime: '/games/blackjack/1.0.3/index.html', tags: [], platforms: ['web'] };
test('Oyun Gecesi yalnız yayınlı/açılabilir oyunları sunar, örnek kayıt üretmez', () => {
  const entries = nightEntries([game, { ...game, id: 'gizli', status: 'draft' }, { ...game, id: 'paket', engine: 'download' }, { ...game, id: 'yok', runtime: '' }, { ...game, id: 'arac', kind: 'tool' }]);
  assert.equal(entries.length, 1); assert.equal(entries[0].game, game); assert.deepEqual(nightEntries([]), []);
});
test('Eski Blackjack online gösterilmez; online filtresi gerçek katalog etiketini izler', () => {
  assert.equal(nightEntries([game])[0].online, false); assert.equal(nightEntries([game], 'arkadaslarla').length, 0);
  assert.equal(nightEntries([{ ...game, version: '2.0.0', tags: ['Online'] }], 'arkadaslarla').length, 1);
  assert.equal(nightEntries([game], 'kisa').length, 1); assert.equal(nightEntries([game], 'kesif').length, 0);
});
test('Oyun Gecesi SEO/sitemap adresi vardır; filtre kopyası indekslenmez', () => {
  const catalog = { games: [game] }; assert(publicRoutes(catalog).includes('/oyun-gecesi'));
  assert.equal(pageSeo('/oyun-gecesi', catalog).title, 'Oyun Gecesi — Kutarya');
  assert.equal(pageSeo('/oyun-gecesi?hava=kisa', catalog).robots, 'noindex,follow');
  assert.equal(pageSeo('/oyun-gecesi?hava=kisa', catalog).canonical, 'https://kutarya.com/oyun-gecesi');
});
test('Yeni Blackjack kaynak metaverisi sürüm 2.0.0 ve aynı sürüm runtime yolunu kullanır', () => {
  const project = userGames.find(g => g.id === 'blackjack'); assert.equal(project.version, '2.0.0');
  assert.equal(project.runtime, '/games/blackjack/2.0.0/index.html'); assert(project.tags.includes('Online'));
});
