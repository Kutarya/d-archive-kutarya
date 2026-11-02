import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fieldMap, languageMap } from '../data/catalog';
import { errors } from '../data/errors';
import { lessons, getLesson } from '../data/lessons';
import { systemGuides } from '../data/systemGuides';
import { SITE, articlePublicationMeta } from '../data/siteConfig';

const DEFAULT_DESCRIPTION = SITE.description;

function setMeta(selector, match, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(match).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLink(rel, href, extra = {}) {
  const selector = `link[rel="${rel}"]${extra.type ? `[type="${extra.type}"]` : ''}`;
  let element = document.head.querySelector(selector);
  if (!href) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    if (extra.type) element.setAttribute('type', extra.type);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
  Object.entries(extra).forEach(([key, value]) => element.setAttribute(key, value));
}

function setJsonLd(data) {
  let element = document.head.querySelector('script[data-kutarya-jsonld]');
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.dataset.kutaryaJsonld = 'true';
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

export default function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    let title = `${SITE.longName} | Türkçe Yazılım Başvuru Kaynağı`;
    let description = DEFAULT_DESCRIPTION;
    let robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
    let ogType = 'website';
    let publishedAt = null;
    let updatedAt = null;
    let alternateMarkdown = null;

    const organization = {
      '@type': 'Organization',
      '@id': `${SITE.url}/#organization`,
      name: SITE.publisher,
      url: SITE.url,
      logo: `${SITE.url}/brand/logo-primary.png`,
    };

    let pageEntity = {
      '@type': 'WebPage',
      '@id': `${SITE.url}${location.pathname}#webpage`,
      url: `${SITE.url}${location.pathname}`,
      name: title,
      description,
      inLanguage: SITE.language,
      isPartOf: { '@id': `${SITE.url}/#website` },
    };

    if (location.pathname === '/makaleler') {
      title = `Teknik Makaleler | ${SITE.name}`;
      description = 'Kaynaklandırılmış Türkçe yazılım makaleleri: çalışma modeli, kod, arıza biçimleri, üretim kararları ve birincil dokümantasyon bağlantıları.';
    } else if (location.pathname === '/kesfet') {
      title = `Teknoloji Kataloğu | ${SITE.name}`;
      description = 'Programlama dilleri, yazılım alanları ve konu başlıkları için Türkçe teknoloji kataloğu.';
    } else if (location.pathname === '/yayin-ilkeleri') {
      title = `Kaynaklandırma ve Yayın İlkeleri | ${SITE.name}`;
      description = 'Kutarya teknik içeriklerinin kaynak önceliği, içerik sınıfları, güncelleme yöntemi ve makine-okunabilir yayın politikası.';
    } else if (location.pathname === '/ara') {
      title = `Arama | ${SITE.name}`;
      description = 'Kutarya teknik kaynaklarında makale, hata kaydı, sistem rehberi, teknoloji ve konu ara.';
      robots = 'noindex,follow';
    } else if (parts[0] === 'dil' && languageMap[parts[1]]) {
      const language = languageMap[parts[1]];
      title = `${language.name} Teknik Dizini | ${SITE.name}`;
      description = language.summary;
    } else if (parts[0] === 'alan' && fieldMap[parts[1]]) {
      const field = fieldMap[parts[1]];
      title = `${field.name} Kaynak Dizini | ${SITE.name}`;
      description = field.summary;
    } else if (parts[0] === 'konu' && parts[1] && parts[2]) {
      const lesson = getLesson(parts[1], parts[2]);
      const article = lessons[`${parts[1]}:${parts[2]}`];
      if (lesson) {
        title = `${lesson.title} | ${SITE.name}`;
        description = lesson.description;
        if (!article) {
          robots = 'noindex,follow';
        } else {
          const publication = articlePublicationMeta(article);
          publishedAt = publication.publishedAt;
          updatedAt = publication.updatedAt;
          ogType = 'article';
          alternateMarkdown = `${SITE.url}/reference/articles/${parts[1]}/${parts[2]}.md`;
          pageEntity = {
            '@type': ['Article', 'TechArticle'],
            '@id': `${SITE.url}${location.pathname}#article`,
            mainEntityOfPage: `${SITE.url}${location.pathname}`,
            headline: article.title,
            description: article.description,
            datePublished: publication.publishedAt,
            dateModified: publication.updatedAt,
            inLanguage: SITE.language,
            isAccessibleForFree: true,
            articleSection: languageMap[parts[1]]?.name || 'Yazılım',
            copyrightHolder: organization,
            author: organization,
            publisher: organization,
            about: [languageMap[parts[1]]?.name, article.eyebrow].filter(Boolean),
            citation: (article.sources || []).map((source) => source.url),
            url: `${SITE.url}${location.pathname}`,
            encoding: { '@type': 'MediaObject', contentUrl: alternateMarkdown, encodingFormat: 'text/markdown' },
          };
        }
      }
    } else if (parts[0] === 'hatalar' && parts[1]) {
      const item = errors.find((error) => error.id === parts[1]);
      if (item) {
        title = `${item.title} | ${SITE.name}`;
        description = item.summary || item.message;
        ogType = 'article';
        publishedAt = SITE.firstPublicationDate;
        updatedAt = SITE.lastEditorialReview;
        alternateMarkdown = `${SITE.url}/reference/errors/${item.id}.md`;
        pageEntity = {
          '@type': ['Article', 'TechArticle'],
          '@id': `${SITE.url}${location.pathname}#article`,
          mainEntityOfPage: `${SITE.url}${location.pathname}`,
          headline: item.title,
          description,
          datePublished: SITE.firstPublicationDate,
          dateModified: SITE.lastEditorialReview,
          articleSection: 'Teşhis kaydı',
          inLanguage: SITE.language,
          isAccessibleForFree: true,
          author: organization,
          publisher: organization,
          about: [item.technology, item.message],
          url: `${SITE.url}${location.pathname}`,
          encoding: { '@type': 'MediaObject', contentUrl: alternateMarkdown, encodingFormat: 'text/markdown' },
        };
      }
    } else if (location.pathname === '/hatalar') {
      title = `Hata Kayıtları | ${SITE.name}`;
      description = 'Yazılım hatalarını belirti, kök neden, teşhis sırası ve düzeltme adımlarıyla ele alan teknik hata dizini.';
    } else if ((parts[0] === 'sistemler' || parts[0] === 'projeler') && parts[1]) {
      const item = systemGuides.find((guide) => guide.id === parts[1]);
      if (item) {
        title = `${item.title} | ${SITE.name}`;
        description = item.summary;
        ogType = 'article';
        publishedAt = SITE.firstPublicationDate;
        updatedAt = SITE.lastEditorialReview;
        alternateMarkdown = `${SITE.url}/reference/systems/${item.id}.md`;
        pageEntity = {
          '@type': ['Article', 'TechArticle'],
          '@id': `${SITE.url}/sistemler/${item.id}#article`,
          mainEntityOfPage: `${SITE.url}/sistemler/${item.id}`,
          headline: item.title,
          description: item.summary,
          datePublished: SITE.firstPublicationDate,
          dateModified: SITE.lastEditorialReview,
          articleSection: 'Uygulama rehberi',
          inLanguage: SITE.language,
          isAccessibleForFree: true,
          author: organization,
          publisher: organization,
          about: [item.category, ...(item.stack || [])],
          url: `${SITE.url}/sistemler/${item.id}`,
          encoding: { '@type': 'MediaObject', contentUrl: alternateMarkdown, encodingFormat: 'text/markdown' },
        };
      }
    } else if (location.pathname === '/sistemler') {
      title = `Sistem Rehberleri | ${SITE.name}`;
      description = 'Dosya ağacı, bileşenler, kaynak kod, çalışma kontrolleri ve arıza noktalarıyla uçtan uca sistem mimarisi rehberleri.';
    } else if (parts.length) {
      title = `Sayfa Bulunamadı | ${SITE.name}`;
      robots = 'noindex,follow';
    }

    if (pageEntity['@type'] === 'WebPage') {
      pageEntity.name = title;
      pageEntity.description = description;
    }

    document.title = title;
    setMeta('meta[name="description"]', { name: 'description' }, description);
    setMeta('meta[name="robots"]', { name: 'robots' }, robots);
    setMeta('meta[property="og:title"]', { property: 'og:title' }, title);
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description);
    setMeta('meta[property="og:type"]', { property: 'og:type' }, ogType);
    setMeta('meta[property="og:url"]', { property: 'og:url' }, `${SITE.url}${location.pathname}`);
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, SITE.longName);
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title);
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description);

    if (publishedAt) setMeta('meta[property="article:published_time"]', { property: 'article:published_time' }, publishedAt);
    else document.head.querySelector('meta[property="article:published_time"]')?.remove();
    if (updatedAt) setMeta('meta[property="article:modified_time"]', { property: 'article:modified_time' }, updatedAt);
    else document.head.querySelector('meta[property="article:modified_time"]')?.remove();

    setLink('canonical', `${SITE.url}${location.pathname}`);
    setLink('alternate', alternateMarkdown, alternateMarkdown ? { type: 'text/markdown' } : { type: 'text/markdown' });

    setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        organization,
        {
          '@type': 'WebSite',
          '@id': `${SITE.url}/#website`,
          url: SITE.url,
          name: SITE.longName,
          description: SITE.description,
          inLanguage: SITE.language,
          publisher: { '@id': `${SITE.url}/#organization` },
        },
        pageEntity,
      ],
    });
  }, [location.pathname]);

  return null;
}
