import { writeFile } from 'node:fs/promises';
import { fields, languages } from '../src/data/catalog.js';
import { errors } from '../src/data/errors.js';
import { lessons } from '../src/data/lessons.js';
import { systemGuides } from '../src/data/systemGuides.js';
import { SITE, articlePublicationMeta } from '../src/data/siteConfig.js';

const urls = new Map();
const add = (path, lastmod = null) => urls.set(path, lastmod);

add('/', SITE.lastEditorialReview);
add('/makaleler', SITE.lastEditorialReview);
add('/kesfet', SITE.lastEditorialReview);
add('/hatalar', SITE.lastEditorialReview);
add('/sistemler', SITE.lastEditorialReview);
add('/yayin-ilkeleri', SITE.lastEditorialReview);

for (const language of languages) add(`/dil/${language.id}`, SITE.lastEditorialReview);
for (const field of fields) add(`/alan/${field.id}`, SITE.lastEditorialReview);
for (const item of errors) add(`/hatalar/${item.id}`, SITE.lastEditorialReview);
for (const item of systemGuides) add(`/sistemler/${item.id}`, SITE.lastEditorialReview);
for (const [key, lesson] of Object.entries(lessons)) {
  const [languageId, topicId] = key.split(':');
  add(`/konu/${languageId}/${topicId}`, articlePublicationMeta(lesson).updatedAt);
}

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, lastmod]) => `  <url><loc>${escapeXml(`${SITE.url}${path}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`)
  .join('\n')}\n</urlset>\n`;

await writeFile(new URL('../public/sitemap.xml', import.meta.url), xml, 'utf8');
console.log(`Sitemap oluşturuldu: ${urls.size} indekslenebilir sayfa.`);
