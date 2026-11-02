import { fields, languages } from '../data/catalog.js';
import { errors } from '../data/errors.js';
import { fieldGuides } from '../data/fieldGuides.js';
import { systemGuides } from '../data/systemGuides.js';
import { lessons } from '../data/lessons.js';

const normalize = (value) => value
  .toLocaleLowerCase('tr')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/ı/g, 'i');

export const searchEntries = [
  ...languages.map((language) => ({
    id: `language:${language.id}`,
    type: 'Dil',
    title: language.name,
    description: language.summary,
    href: `/dil/${language.id}`,
    keywords: `${language.family} ${language.areas.join(' ')}`,
  })),
  ...fields.map((field) => ({
    id: `field:${field.id}`,
    type: 'Alan',
    title: field.name,
    description: field.summary,
    href: `/alan/${field.id}`,
    keywords: `${field.stages.join(' ')} ${field.languages.join(' ')}`,
  })),
  ...Object.entries(fieldGuides).flatMap(([fieldId, guide]) => guide.tracks.map((track) => ({
    id: `field-track:${fieldId}:${track.id}`,
    type: 'Uzmanlık',
    title: track.title,
    description: track.summary,
    href: `/alan/${fieldId}#${track.id}`,
    keywords: `${guide.headline} ${track.goal} ${track.concepts.join(' ')} ${track.tools.join(' ')} ${track.build} ${track.debug}`,
  }))),
  ...errors.map((item) => ({
    id: `error:${item.id}`,
    type: 'Hata',
    title: item.title,
    description: item.message,
    href: `/hatalar/${item.id}`,
    keywords: `${item.technology} ${item.summary} ${item.causes.join(' ')}`,
  })),
  ...systemGuides.map((item) => ({
    id: `system:${item.id}`,
    type: 'Sistem',
    title: item.title,
    description: item.summary,
    href: `/sistemler/${item.id}`,
    keywords: `${item.category} ${item.stack.join(' ')} ${item.debug.flat().join(' ')}`,
  })),
  ...languages.flatMap((language) => language.groups.flatMap((group) => group.topics.map(([topicId, title]) => {
    const lesson = lessons[`${language.id}:${topicId}`];
    const detailed = Boolean(lesson);
    const lessonKeywords = detailed
      ? [
          lesson.title,
          lesson.description,
          lesson.overview,
          ...(lesson.goals || []),
          ...(lesson.concepts || []).flatMap((item) => [item.title, item.body]),
          ...(lesson.chapters || []).flatMap((item) => [item.title, ...(item.paragraphs || []), ...(item.bullets || [])]),
          ...(lesson.likelyErrors || []).flatMap((item) => [item.message, item.cause, item.fix]),
        ].join(' ')
      : '';
    return {
      id: `topic:${language.id}:${topicId}`,
      type: detailed ? 'Makale' : 'Konu',
      title: `${language.name}: ${title}`,
      description: detailed ? lesson.description : `${group.title} kapsamında kavramsal çerçeve, temel kullanım notları ve kontrol noktaları.`,
      href: `/konu/${language.id}/${topicId}`,
      keywords: `${language.name} ${group.title} ${group.description} ${lessonKeywords}`,
      detailed,
    };
  }))),
];

export function searchCatalog(query, limit = 20) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  return searchEntries
    .map((entry) => {
      const title = normalize(entry.title);
      const body = normalize(`${entry.type} ${entry.title} ${entry.description} ${entry.keywords}`);
      const idParts = normalize(entry.id).split(':');
      const score = words.reduce((total, word) => {
        if (title === word) return total + 20;
        if (idParts.includes(word)) return total + 14;
        if (title.startsWith(word)) return total + 12;
        if (title.includes(word)) return total + 8;
        if (body.includes(word)) return total + 3;
        return total - 20;
      }, 0);
      return { ...entry, score: score + (entry.detailed ? 6 : 0) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'tr'))
    .slice(0, limit);
}
