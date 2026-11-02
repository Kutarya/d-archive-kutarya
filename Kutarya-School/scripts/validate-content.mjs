import { fields, languages } from '../src/data/catalog.js';
import { errors } from '../src/data/errors.js';
import { fieldGuides, homeFieldIds } from '../src/data/fieldGuides.js';
import { getLesson, lessons } from '../src/data/lessons.js';
import { systemGuides } from '../src/data/systemGuides.js';
import { systemGuideSummaries } from '../src/data/systemGuideSummaries.js';

const problems = [];
const countWords = (value) => {
  if (!value) return 0;
  if (typeof value === 'string') return value.trim().split(/\s+/).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countWords(item), 0);
  if (typeof value === 'object') return Object.values(value).reduce((sum, item) => sum + countWords(item), 0);
  return 0;
};
const unique = (items, label) => {
  const ids = new Set();
  for (const item of items) {
    if (!item.id) problems.push(`${label}: kimliği olmayan kayıt var.`);
    if (ids.has(item.id)) problems.push(`${label}: yinelenen kimlik: ${item.id}`);
    ids.add(item.id);
  }
  return ids;
};

const fieldIds = unique(fields, 'Alan');
const languageIds = unique(languages, 'Dil');
unique(errors, 'Hata');
unique(systemGuides, 'Sistem');

for (const language of languages) {
  if (!language.name || !language.summary || !language.example) problems.push(`Dil eksik içerik: ${language.id}`);
  for (const fieldId of language.areas) {
    if (!fieldIds.has(fieldId)) problems.push(`${language.id}: bilinmeyen alan ${fieldId}`);
  }
  const topicIds = language.groups.flatMap((group) => group.topics.map(([id]) => id));
  if (topicIds.length !== new Set(topicIds).size) problems.push(`${language.id}: yinelenen konu kimliği var.`);
  for (const topicId of topicIds) {
    const lesson = getLesson(language.id, topicId);
    if (!lesson?.title || !lesson?.overview || !lesson?.code || !lesson?.likelyErrors?.length) {
      problems.push(`${language.id}:${topicId}: başvuru içeriği eksik.`);
    }
  }
}

for (const field of fields) {
  for (const languageId of field.languages) {
    if (!languageIds.has(languageId)) problems.push(`${field.id}: bilinmeyen dil ${languageId}`);
  }
}

for (const [key, lesson] of Object.entries(lessons)) {
  const [languageId, topicId] = key.split(':');
  const language = languages.find((item) => item.id === languageId);
  const topicExists = language?.groups.some((group) => group.topics.some(([id]) => id === topicId));
  if (!language) problems.push(`Ayrıntılı makale bilinmeyen dile bağlı: ${key}`);
  if (language && !topicExists) problems.push(`Ayrıntılı makale katalogda olmayan konuya bağlı: ${key}`);
  if (!lesson.title || !lesson.description || !lesson.overview || !lesson.code || !lesson.likelyErrors?.length) {
    problems.push(`Ayrıntılı makale eksik: ${key}`);
  }
  if (!lesson.readingTime || !lesson.chapters || lesson.chapters.length < 3) {
    problems.push(`Ayrıntılı makale uzun anlatım kapsamı yetersiz: ${key}`);
  }
  if (!lesson.sources?.length || lesson.sources.some((source) => !source.label || !source.url?.startsWith('https://'))) {
    problems.push(`Ayrıntılı makale resmî kaynak bilgisi eksik: ${key}`);
  }
  if (!lesson.referenceContext || lesson.referenceContext.length < 2 || !lesson.versionScope) {
    problems.push(`Ayrıntılı makale kaynak bağlamı veya sürüm kapsamı eksik: ${key}`);
  }
  if (!lesson.evidenceNotes || lesson.evidenceNotes.length < 2 || !lesson.boundaryCases || lesson.boundaryCases.length < 4 || !lesson.productionNotes || lesson.productionNotes.length < 4) {
    problems.push(`Ayrıntılı makale araştırma katmanı yetersiz: ${key}`);
  }
  if (!lesson.caseStudy?.title || !lesson.caseStudy?.context || !lesson.caseStudy?.analysis || !lesson.caseStudy?.outcome || !lesson.observability || lesson.observability.length < 4) {
    problems.push(`Ayrıntılı makale uygulama vakası veya gözlem katmanı eksik: ${key}`);
  }
  for (const note of lesson.evidenceNotes || []) {
    if (!note.title || !note.text || !note.sourceIndexes?.length) problems.push(`Ayrıntılı makale kaynak notu eksik: ${key}`);
    for (const sourceIndex of note.sourceIndexes || []) {
      if (!Number.isInteger(sourceIndex) || sourceIndex < 1 || sourceIndex > (lesson.sources?.length || 0)) problems.push(`Ayrıntılı makale geçersiz kaynak numarası: ${key} -> ${sourceIndex}`);
    }
  }
  if (!lesson.publishedAt || !lesson.updatedAt || !lesson.reviewedAt) {
    problems.push(`Ayrıntılı makale yayın meta verisi eksik: ${key}`);
  }
  if (countWords(lesson) < 700) {
    problems.push(`Ayrıntılı makale kapsamı 700 kelimelik asgari yayın eşiğinin altında: ${key}`);
  }
}

for (const item of errors) {
  if (!item.causes.length || !item.diagnosis.length || !item.fixes.length) problems.push(`Hata kaydı eksik: ${item.id}`);
}

for (const fieldId of homeFieldIds) {
  if (!fieldIds.has(fieldId)) problems.push(`Ana alan kimliği katalogda yok: ${fieldId}`);
  if (!fieldGuides[fieldId]) problems.push(`Ana alan rehberi eksik: ${fieldId}`);
}

for (const [fieldId, guide] of Object.entries(fieldGuides)) {
  if (!fieldIds.has(fieldId)) problems.push(`Alan rehberi katalogda yok: ${fieldId}`);
  if (!guide.headline || !guide.description || guide.workflow.length < 5 || guide.tracks.length < 3) {
    problems.push(`Alan rehberi kapsamı yetersiz: ${fieldId}`);
  }
  const trackIds = new Set();
  for (const track of guide.tracks) {
    if (trackIds.has(track.id)) problems.push(`${fieldId}: yinelenen uzmanlık kimliği ${track.id}`);
    trackIds.add(track.id);
    if (!track.title || !track.summary || !track.goal || !track.build || !track.debug) problems.push(`${fieldId}:${track.id}: uzmanlık metni eksik.`);
    if (track.concepts.length < 4 || track.tools.length < 2 || track.links.length < 1) problems.push(`${fieldId}:${track.id}: uzmanlık kapsamı yetersiz.`);
    for (const item of track.links) {
      const topicMatch = item.to.match(/^\/konu\/([^/]+)\/([^/#?]+)/);
      if (topicMatch && !getLesson(topicMatch[1], topicMatch[2])) problems.push(`${fieldId}:${track.id}: geçersiz konu bağlantısı ${item.to}`);
    }
  }
}

for (const guide of systemGuides) {
  if (!guide.title || !guide.summary || !guide.result || !guide.tree || !guide.setup) {
    problems.push(`Sistem rehberi ana içeriği eksik: ${guide.id}`);
  }
  if (guide.prerequisites.length < 2 || guide.files.length < 1 || guide.runChecks.length < 3 || guide.debug.length < 2) {
    problems.push(`Sistem rehberi kapsamı yetersiz: ${guide.id}`);
  }
  const filePaths = new Set();
  for (const file of guide.files) {
    if (filePaths.has(file.path)) problems.push(`${guide.id}: yinelenen dosya ${file.path}`);
    filePaths.add(file.path);
    if (!file.path || !file.language || !file.explanation || !file.code) problems.push(`${guide.id}: eksik kaynak dosyası.`);
    const fileName = file.path.split('/').at(-1);
    if (!guide.tree.includes(fileName)) problems.push(`${guide.id}: dosya ağacında bulunmayan kaynak ${file.path}`);
  }
  for (const row of guide.debug) {
    if (row.length !== 4 || row.some((cell) => !cell)) problems.push(`${guide.id}: hata ayıklama satırı eksik.`);
  }
}

for (const summary of systemGuideSummaries) {
  const guide = systemGuides.find((item) => item.id === summary.id);
  if (!guide) problems.push(`Özeti olup tam rehberi olmayan sistem: ${summary.id}`);
  if (guide && (guide.title !== summary.title || guide.category !== summary.category || guide.readTime !== summary.readTime)) {
    problems.push(`Sistem özeti tam rehberle uyuşmuyor: ${summary.id}`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

const topicCount = languages.reduce((sum, language) => sum + language.groups.reduce((total, group) => total + group.topics.length, 0), 0);
const systemFileCount = systemGuides.reduce((sum, guide) => sum + guide.files.length, 0);
const fieldTrackCount = Object.values(fieldGuides).reduce((sum, guide) => sum + guide.tracks.length, 0);
console.log(`İçerik doğrulandı: ${languages.length} dil, ${fields.length} alan, ${fieldTrackCount} uzmanlık yolu, ${topicCount} konu yolu, ${Object.keys(lessons).length} ayrıntılı makale, ${errors.length} hata, ${systemGuides.length} tam sistem ve ${systemFileCount} kaynak dosyası.`);
