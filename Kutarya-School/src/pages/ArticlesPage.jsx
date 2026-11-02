import { ArrowRight, BookOpen, CalendarDays, FileText, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { languageMap } from '../data/catalog';
import { lessons } from '../data/lessons';
import { articlePublicationMeta, formatTurkishDate } from '../data/siteConfig';

const articles = Object.entries(lessons)
  .map(([key, lesson]) => {
    const [languageId, topicId] = key.split(':');
    const publication = articlePublicationMeta(lesson);
    return { key, languageId, topicId, language: languageMap[languageId], publication, ...lesson };
  })
  .filter((item) => item.language)
  .sort((a, b) => a.title.localeCompare(b.title, 'tr'));

const articleLanguages = [...new Map(articles.map((item) => [item.languageId, item.language])).entries()];

export default function ArticlesPage() {
  const [languageFilter, setLanguageFilter] = useState('all');
  const visibleArticles = languageFilter === 'all' ? articles : articles.filter((item) => item.languageId === languageFilter);

  return (
    <div className="content-width page-view articles-page">
      <Breadcrumbs items={[{ label: 'Teknik makaleler' }]} />
      <header className="page-intro articles-page__intro articles-page__intro--reference">
        <p className="eyebrow">Kaynaklandırılmış yayınlar</p>
        <h1>Teknik makaleler</h1>
        <p>Her makale çalışma modelini, kod örneklerini, üretim kararlarını, hata biçimlerini ve konuya ait birincil dokümantasyon bağlantılarını birlikte sunar.</p>
        <div className="articles-page__stats">
          <span><strong>{articles.length}</strong> teknik makale</span>
          <span><strong>{articles.reduce((sum, item) => sum + (item.sources?.length || 0), 0)}</strong> birincil referans</span>
          <Link to="/yayin-ilkeleri"><ShieldCheck size={14} /> Yayın ilkeleri</Link>
        </div>
      </header>

      <div className="articles-page__filters" aria-label="Makaleleri teknolojiye göre filtrele">
        <button type="button" className={languageFilter === 'all' ? 'is-active' : ''} onClick={() => setLanguageFilter('all')}>Tümü <span>{articles.length}</span></button>
        {articleLanguages.map(([id, language]) => {
          const count = articles.filter((item) => item.languageId === id).length;
          return <button type="button" key={id} className={languageFilter === id ? 'is-active' : ''} onClick={() => setLanguageFilter(id)}><i style={{ background: language.color }} />{language.name} <span>{count}</span></button>;
        })}
      </div>

      <div className="articles-page__grid articles-page__grid--reference">
        {visibleArticles.map((article) => (
          <Link className="article-card article-card--reference" to={`/konu/${article.languageId}/${article.topicId}`} key={article.key} style={{ '--article-accent': article.language.color }}>
            <div className="article-card__top">
              <span><i /> {article.language.name}</span>
              <ArrowRight size={17} />
            </div>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <div className="article-card__meta article-card__meta--stacked">
              <span><BookOpen size={14} /> {article.readingTime || article.duration}</span>
              <span><FileText size={14} /> {article.sources?.length || 0} birincil kaynak</span>
              <span><CalendarDays size={14} /> {formatTurkishDate(article.publication.updatedAt)}</span>
            </div>
            <span className="article-card__cta">Makaleyi görüntüle <ArrowRight size={15} /></span>
          </Link>
        ))}
      </div>

      <section className="articles-page__catalog-callout articles-page__catalog-callout--reference">
        <div><strong>Katalog ile teknik makale ayrımı</strong><p>Katalogdaki kısa konu notları gezinme ve konu haritalama içindir. Bu sayfadaki teknik makaleler ise kaynaklandırılmış, güncelleme tarihi bulunan ve makine-okunabilir referans kopyası üretilen yayınlardır.</p></div>
        <Link className="primary-button primary-button--small" to="/kesfet">Teknoloji kataloğu <ArrowRight size={15} /></Link>
      </section>
    </div>
  );
}
