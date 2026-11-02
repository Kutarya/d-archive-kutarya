import { capabilities, currentFiles, discover } from './discovery.mjs';
export const discoveryRoutes = [
  { id: 'play', title: 'Biraz oynamak', subtitle: 'Bir masa, bir arena, bir dünya.', label: 'Oyun rotası' },
  { id: 'make', title: 'İşimi kolaylaştırmak', subtitle: 'Günlük işlere küçük yardımcılar.', label: 'Üretim rotası' },
  { id: 'learn', title: 'Kodun içini görmek', subtitle: 'Kaynağı aç, nasıl yapıldığını keşfet.', label: 'Kaynak rotası' },
];
export function finderMatches(projects, { intent = 'play', platform = '' } = {}) {
  return discover(projects, { platform }).filter(project => {
    const access = capabilities(project);
    if (intent === 'learn') return access.source;
    if (intent === 'make') return !['game', 'source'].includes(project.kind) && (access.browser || access.download);
    return project.kind === 'game' && (access.browser || access.download);
  });
}
export function releaseNotes(projects, { kind = '', q = '', now = Date.now() } = {}) {
  const terms = q.trim().toLocaleLowerCase('tr').split(/\s+/).filter(Boolean);
  return discover(projects, { kind }).filter(p => {
    if (!String(p.changelog || '').trim()) return false;
    const text = [p.title, p.version, p.changelog, ...(p.tags || [])].join(' ').toLocaleLowerCase('tr');
    return terms.every(term => text.includes(term));
  }).map(project => ({ project, text: project.changelog.trim(), date: Number.isFinite(project.updatedAt) && project.updatedAt > 0 && project.updatedAt <= now ? project.updatedAt : null, files: currentFiles(project) }));
}
export function releaseExcerpt(text, max = 190) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}
