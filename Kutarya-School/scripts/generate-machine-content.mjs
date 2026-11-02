import { mkdir, rm, writeFile } from 'node:fs/promises';
import { languages, fields, languageMap } from '../src/data/catalog.js';
import { lessons } from '../src/data/lessons.js';
import { errors } from '../src/data/errors.js';
import { systemGuides } from '../src/data/systemGuides.js';
import { SITE, articlePublicationMeta } from '../src/data/siteConfig.js';

const publicRoot = new URL('../public/', import.meta.url);
const refRoot = new URL('../public/reference/', import.meta.url);

const countWords = (value = '') => String(value).trim().split(/\s+/).filter(Boolean).length;
const clean = (value = '') => String(value).replace(/\r\n/g, '\n').trim();
const escapeXml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const yamlValue = (value = '') => JSON.stringify(String(value));
const codeFence = (code, language = '') => `\n\`\`\`${language}\n${clean(code)}\n\`\`\`\n`;

await rm(refRoot, { recursive: true, force: true });
await mkdir(new URL('./articles/', refRoot), { recursive: true });
await mkdir(new URL('./errors/', refRoot), { recursive: true });
await mkdir(new URL('./systems/', refRoot), { recursive: true });

const indexEntries = [];
const articleFeedEntries = [];

for (const [key, lesson] of Object.entries(lessons)) {
  const [languageId, topicId] = key.split(':');
  const language = languageMap[languageId];
  const publication = articlePublicationMeta(lesson);
  const canonical = `${SITE.url}/konu/${languageId}/${topicId}`;
  const textPath = `/reference/articles/${languageId}/${topicId}.md`;
  const textUrl = `${SITE.url}${textPath}`;
  const dir = new URL(`./articles/${languageId}/`, refRoot);
  await mkdir(dir, { recursive: true });

  const lines = [
    '---',
    `title: ${yamlValue(lesson.title)}`,
    `type: ${yamlValue('technical-article')}`,
    `canonical: ${yamlValue(canonical)}`,
    `publisher: ${yamlValue(SITE.publisher)}`,
    `language: ${yamlValue(SITE.language)}`,
    `technology: ${yamlValue(language?.name || languageId)}`,
    `date_published: ${yamlValue(publication.publishedAt)}`,
    `date_modified: ${yamlValue(publication.updatedAt)}`,
    `is_accessible_for_free: true`,
    '---',
    '',
    `# ${lesson.title}`,
    '',
    clean(lesson.description),
    '',
    `**Canonical:** ${canonical}`,
    `**Yayıncı:** ${SITE.publisher}`,
    `**Yayın tarihi:** ${publication.publishedAt}`,
    `**Son güncelleme:** ${publication.updatedAt}`,
    `**Teknoloji:** ${language?.name || languageId}`,
    lesson.versionScope ? `**Referans kapsamı:** ${clean(lesson.versionScope)}` : '',
    '',
    '## Özet',
    '',
    clean(lesson.overview),
    '',
    ...(lesson.referenceContext || []).flatMap((paragraph) => [clean(paragraph), '']),
    '## Kapsam maddeleri',
    '',
    ...(lesson.goals || []).map((goal) => `- ${clean(goal)}`),
    '',
    '## Temel kavramlar',
    '',
    ...(lesson.concepts || []).flatMap((concept) => [`### ${concept.title}`, '', clean(concept.body), '']),
  ];

  if (lesson.chapters?.length) {
    lines.push('## Teknik açıklama', '');
    for (const chapter of lesson.chapters) {
      lines.push(`### ${chapter.title}`, '');
      for (const paragraph of chapter.paragraphs || []) lines.push(clean(paragraph), '');
      for (const bullet of chapter.bullets || []) lines.push(`- ${clean(bullet)}`);
      lines.push('');
    }
  }

  if (lesson.evidenceNotes?.length) {
    lines.push('## Teknik iddialar ve kaynak notları', '');
    for (const note of lesson.evidenceNotes) {
      const refs = (note.sourceIndexes || []).map((index) => `[${index}]`).join(', ');
      lines.push(`### ${note.title}`, '', clean(note.text), '', refs ? `**Birincil referans:** ${refs}` : '', '');
    }
  }

  if (lesson.boundaryCases?.length) {
    lines.push('## Sınır durumları', '');
    for (const item of lesson.boundaryCases) lines.push(`- ${clean(item)}`);
    lines.push('');
  }

  if (lesson.caseStudy) {
    lines.push('## Uygulama vakası', '', `### ${lesson.caseStudy.title}`, '', '**Bağlam**', '', clean(lesson.caseStudy.context), '', '**Teknik analiz**', '', clean(lesson.caseStudy.analysis), '', '**Beklenen sonuç**', '', clean(lesson.caseStudy.outcome), '');
    if (lesson.observability?.length) {
      lines.push('### İzlenecek sinyaller', '');
      for (const item of lesson.observability) lines.push(`- ${clean(item)}`);
      lines.push('');
    }
  }

  lines.push('## Kod ve çalışma akışı', '');
  const examples = lesson.examples || [{ title: lesson.codeTitle, code: lesson.code, language: languageId, steps: lesson.walkthrough }];
  for (const example of examples) {
    lines.push(`### ${example.title}`, '');
    if (example.explanation) lines.push(clean(example.explanation), '');
    lines.push(codeFence(example.code, example.language || languageId));
    for (const [index, step] of (example.steps || []).entries()) lines.push(`${index + 1}. ${clean(step)}`);
    lines.push('');
  }

  if (lesson.referenceTable?.length) {
    lines.push('## Referans tablosu', '', '| Terim | Açıklama |', '| --- | --- |');
    for (const [term, meaning] of lesson.referenceTable) lines.push(`| \`${term}\` | ${clean(meaning).replaceAll('|', '\\|')} |`);
    lines.push('');
  }

  lines.push('## Tasarım seçenekleri', '');
  for (const item of lesson.alternatives || []) lines.push(`### ${item.title}`, '', clean(item.body), '');

  lines.push('## Arıza biçimleri', '');
  for (const item of lesson.likelyErrors || []) {
    lines.push(`### ${item.message}`, '', `- **Olası neden:** ${clean(item.cause)}`, `- **Teşhis / düzeltme:** ${clean(item.fix)}`, '');
  }

  if (lesson.productionNotes?.length) {
    lines.push('## Üretim ve işletim notları', '');
    for (const item of lesson.productionNotes) lines.push(`- ${clean(item)}`);
    lines.push('');
  }

  lines.push('## Birincil referanslar', '');
  for (const [index, source] of (lesson.sources || []).entries()) lines.push(`${index + 1}. [${source.label}](${source.url})`);
  lines.push('', '## Doğrulama senaryoları', '');
  for (const item of lesson.practice || []) lines.push(`- ${clean(item)}`);
  lines.push('', '## Üretim kontrol listesi', '');
  for (const item of lesson.checklist || []) lines.push(`- [ ] ${clean(item)}`);
  lines.push('', '---', `Bu dosya ${canonical} sayfasının makine-okunabilir referans kopyasıdır. İnsanlara yönelik ana yayın canonical URL'dedir.`, '');

  await writeFile(new URL(`./articles/${languageId}/${topicId}.md`, refRoot), lines.filter((line) => line !== undefined).join('\n'), 'utf8');

  indexEntries.push({
    id: `article:${languageId}:${topicId}`,
    type: 'technical-article',
    title: lesson.title,
    description: lesson.description,
    technology: language?.name || languageId,
    canonical_url: canonical,
    text_url: textUrl,
    date_published: publication.publishedAt,
    date_modified: publication.updatedAt,
    source_urls: (lesson.sources || []).map((source) => source.url),
    editorial_class: 'reference-article',
    citation_ready: true,
    word_count: countWords(lines.join(' ')),
  });

  articleFeedEntries.push({ title: lesson.title, description: lesson.description, url: canonical, updated: publication.updatedAt, id: canonical });
}

for (const item of errors) {
  const canonical = `${SITE.url}/hatalar/${item.id}`;
  const textPath = `/reference/errors/${item.id}.md`;
  const lines = [
    '---',
    `title: ${yamlValue(item.title)}`,
    `type: ${yamlValue('error-record')}`,
    `canonical: ${yamlValue(canonical)}`,
    `publisher: ${yamlValue(SITE.publisher)}`,
    `language: ${yamlValue(SITE.language)}`,
    `technology: ${yamlValue(item.technology)}`,
    '---', '',
    `# ${item.title}`, '',
    `**Hata mesajı:** \`${item.message}\``,
    `**Teknoloji:** ${item.technology}`,
    `**Sınıf:** ${item.severity}`, '',
    clean(item.summary), '',
    '## Olası nedenler', '', ...(item.causes || []).map((x) => `- ${clean(x)}`), '',
    '## Teşhis sırası', '', ...(item.diagnosis || []).map((x, i) => `${i + 1}. ${clean(x)}`), '',
    '## Düzeltme yaklaşımları', '', ...(item.fixes || []).map((x) => `- ${clean(x)}`), '',
    '## Hatalı örnek', codeFence(item.badCode, item.technology.toLowerCase()),
    '## Düzeltilmiş örnek', codeFence(item.goodCode, item.technology.toLowerCase()),
    '---', `Canonical: ${canonical}`, '',
  ];
  await writeFile(new URL(`./errors/${item.id}.md`, refRoot), lines.join('\n'), 'utf8');
  indexEntries.push({ id: `error:${item.id}`, type: 'error-record', title: item.title, description: item.summary, technology: item.technology, canonical_url: canonical, text_url: `${SITE.url}${textPath}`, editorial_class: 'diagnostic-record', citation_ready: false, evidence_model: 'reproducible symptom, diagnosis and remediation record' });
}

for (const guide of systemGuides) {
  const canonical = `${SITE.url}/sistemler/${guide.id}`;
  const textPath = `/reference/systems/${guide.id}.md`;
  const lines = [
    '---',
    `title: ${yamlValue(guide.title)}`,
    `type: ${yamlValue('system-guide')}`,
    `canonical: ${yamlValue(canonical)}`,
    `publisher: ${yamlValue(SITE.publisher)}`,
    `language: ${yamlValue(SITE.language)}`,
    `category: ${yamlValue(guide.category)}`,
    '---', '',
    `# ${guide.title}`, '',
    clean(guide.summary), '',
    `**Kategori:** ${guide.category}`,
    `**Teknoloji yığını:** ${(guide.stack || []).join(', ')}`,
    `**Seviye:** ${guide.level}`,
    `**Okuma süresi:** ${guide.readTime}`, '',
    '## Sonuç', '', clean(guide.result), '',
    '## Ön koşullar', '', ...(guide.prerequisites || []).map((x) => `- ${clean(x)}`), '',
    '## Dosya ağacı', codeFence(guide.tree, 'text'),
    '## Kurulum', '', clean(guide.setup), '',
  ];
  for (const file of guide.files || []) {
    lines.push(`## ${file.path}`, '', clean(file.explanation), '', codeFence(file.code, file.language));
  }
  lines.push('## Çalışma kontrolleri', '');
  for (const [i, item] of (guide.runChecks || []).entries()) lines.push(`${i + 1}. ${clean(item)}`);
  lines.push('', '## Hata ayıklama tablosu', '', '| Belirti | Olası neden | Kontrol | Düzeltme |', '| --- | --- | --- | --- |');
  for (const row of guide.debug || []) lines.push(`| ${row.map((cell) => clean(cell).replaceAll('|', '\\|')).join(' | ')} |`);
  lines.push('', '## Genişletme noktaları', '', ...(guide.extensions || []).map((x) => `- ${clean(x)}`), '', '---', `Canonical: ${canonical}`, '');
  await writeFile(new URL(`./systems/${guide.id}.md`, refRoot), lines.join('\n'), 'utf8');
  indexEntries.push({ id: `system:${guide.id}`, type: 'system-guide', title: guide.title, description: guide.summary, category: guide.category, stack: guide.stack, canonical_url: canonical, text_url: `${SITE.url}${textPath}`, editorial_class: 'implementation-guide', citation_ready: false, evidence_model: 'reference implementation and runtime verification checklist' });
}

const contentIndex = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  site: { name: SITE.longName, url: SITE.url, language: SITE.language, publisher: SITE.publisher },
  policy_url: `${SITE.url}/yayin-ilkeleri`,
  entries: indexEntries.sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title, 'tr')),
};
await writeFile(new URL('./content-index.json', publicRoot), `${JSON.stringify(contentIndex, null, 2)}\n`, 'utf8');

const llmsLines = [
  `# ${SITE.longName}`,
  '',
  `> ${SITE.description}`,
  '',
  'Kutarya, Türkçe teknik içerikleri insanlara yönelik web sayfalarıyla birlikte makine-okunabilir Markdown kopyaları halinde yayımlar. Canonical web sayfası ana yayındır; /reference altındaki Markdown dosyaları aynı içeriğin araştırma ve ayrıştırma amaçlı düz metin karşılığıdır.',
  '',
  '## Temel giriş noktaları',
  '',
  `- [Teknik makaleler](${SITE.url}/makaleler)` ,
  `- [Hata kayıtları](${SITE.url}/hatalar)` ,
  `- [Sistem rehberleri](${SITE.url}/sistemler)` ,
  `- [Teknoloji kataloğu](${SITE.url}/kesfet)` ,
  `- [Kaynaklandırma ve yayın ilkeleri](${SITE.url}/yayin-ilkeleri)` ,
  `- [Makine-okunabilir içerik dizini](${SITE.url}/content-index.json)` ,
  `- [Sitemap](${SITE.url}/sitemap.xml)` ,
  `- [Atom feed](${SITE.url}/feed.xml)` ,
  '',
  '## Teknik makaleler — Markdown',
  '',
  ...indexEntries.filter((item) => item.type === 'technical-article').map((item) => `- [${item.title}](${item.text_url}) — ${item.description}`),
  '',
  '## Diğer makine-okunabilir koleksiyonlar',
  '',
  `- Hata kayıtları: ${SITE.url}/reference/errors/`,
  `- Sistem rehberleri: ${SITE.url}/reference/systems/`,
  '',
  '## Kaynak kullanımı',
  '',
  '- Teknik makalelerde birincil kaynak URL’leri “Birincil referanslar” bölümünde açıkça listelenir.',
  '- Sürüme duyarlı davranışlar için canonical makaledeki son güncelleme tarihi ve bağlı resmî dokümantasyon birlikte değerlendirilmelidir.',
  '- Katalog içi kısa konu notları ayrıntılı teknik makalelerden ayrı tutulur.',
  '- content-index.json içindeki citation_ready alanı yalnız birincil referans zinciri bulunan teknik makalelerde true değerindedir.',
  '- Hata kayıtları teşhis kaydı, sistem rehberleri ise referans uygulama sınıfındadır; bu iki sınıf birincil kaynaklı makalelerle aynı editoryal statüde değildir.',
  '',
];
await writeFile(new URL('./llms.txt', publicRoot), llmsLines.join('\n'), 'utf8');

const feedUpdated = articleFeedEntries.map((item) => item.updated).sort().at(-1) || SITE.lastEditorialReview;
const feed = `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>${escapeXml(SITE.longName)} — Teknik Makaleler</title>\n  <id>${SITE.url}/</id>\n  <link href="${SITE.url}/feed.xml" rel="self" />\n  <link href="${SITE.url}/makaleler" />\n  <updated>${feedUpdated}T12:00:00Z</updated>\n  <author><name>${escapeXml(SITE.publisher)}</name></author>\n${articleFeedEntries.map((item) => `  <entry>\n    <title>${escapeXml(item.title)}</title>\n    <id>${escapeXml(item.id)}</id>\n    <link href="${escapeXml(item.url)}" />\n    <updated>${item.updated}T12:00:00Z</updated>\n    <summary>${escapeXml(item.description)}</summary>\n  </entry>`).join('\n')}\n</feed>\n`;
await writeFile(new URL('./feed.xml', publicRoot), feed, 'utf8');

console.log(`Makine-okunabilir yayın üretildi: ${Object.keys(lessons).length} makale, ${errors.length} hata kaydı, ${systemGuides.length} sistem rehberi.`);
