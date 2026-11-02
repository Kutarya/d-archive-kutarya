import { ArrowRight, Blocks, BookOpenText, Bug, Compass, FileCheck2, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fields, languageMap } from '../data/catalog';
import { errors } from '../data/errors';
import { systemGuideSummaries } from '../data/systemGuideSummaries';
import { lessons } from '../data/lessons';
import { articlePublicationMeta, formatTurkishDate } from '../data/siteConfig';

const languageIds = ['c', 'cpp', 'csharp', 'python', 'javascript', 'typescript', 'html', 'css', 'java', 'sql', 'go', 'rust'];
const featuredArticleKeys = ['javascript:event-loop', 'typescript:veri-tipleri', 'python:context-manager', 'sql:index', 'csharp:oop', 'html:formlar'];

const sourceTypes = [
  { to: '/makaleler', icon: BookOpenText, title: 'Teknik makaleler', text: 'Çalışma modeli, kod, hata biçimleri ve birincil kaynaklarla hazırlanmış uzun teknik içerikler.', cta: 'Makaleleri görüntüle' },
  { to: '/hatalar', icon: Bug, title: 'Hata kayıtları', text: 'Belirti, olası kök neden, teşhis sırası ve düzeltme adımlarını ayrı ayrı ele alan kayıtlar.', cta: 'Hata dizinini görüntüle' },
  { to: '/sistemler', icon: Blocks, title: 'Sistem rehberleri', text: 'Dosya yapısı, bileşenler, çalışma kontrolü ve arıza noktalarıyla uçtan uca sistem açıklamaları.', cta: 'Sistem rehberlerini görüntüle' },
  { to: '/kesfet', icon: Compass, title: 'Teknoloji kataloğu', text: 'Programlama dilleri ve yazılım alanları arasında konu bazlı gezinme ve ilişkilendirme dizini.', cta: 'Kataloğu görüntüle' },
];

const articles = featuredArticleKeys.map((key) => {
  const [languageId, topicId] = key.split(':');
  const lesson = lessons[key];
  const language = languageMap[languageId];
  const publication = articlePublicationMeta(lesson);
  return {
    key,
    category: language.name,
    title: lesson.title,
    excerpt: lesson.description,
    meta: `${lesson.readingTime || lesson.duration} · ${lesson.sources?.length || 0} birincil kaynak`,
    updated: formatTurkishDate(publication.updatedAt),
    to: `/konu/${languageId}/${topicId}`,
    color: language.color,
  };
});

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/ara?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <header className="library-intro library-intro--serious content-width">
        <div>
          <p className="eyebrow">Kutarya Teknik Kaynak</p>
          <h1>Türkçe yazılım ve bilgisayar bilimi başvuru kaynağı</h1>
          <p>Programlama dilleri, web teknolojileri, veri tabanları, yazılım mimarisi ve hata ayıklama üzerine kaynaklandırılmış teknik içerik.</p>
          <div className="home-trust-line">
            <Link to="/yayin-ilkeleri"><ShieldCheck size={16} /> Kaynaklandırma ve yayın ilkeleri</Link>
            <a href="/content-index.json"><FileCheck2 size={16} /> Makine-okunabilir içerik dizini</a>
          </div>
        </div>
        <form onSubmit={submit} className="home-search-form">
          <Search size={19} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Kavram, hata mesajı, teknoloji veya sistem ara" aria-label="Kutarya kaynaklarında ara" />
          <button type="submit">Ara</button>
        </form>
      </header>

      <section className="home-source-types content-width" aria-labelledby="kaynak-turleri">
        <header className="library-heading"><div><p className="eyebrow">İçerik dizini</p><h2 id="kaynak-turleri">Kaynak türleri</h2></div></header>
        <div className="home-entry-grid home-entry-grid--reference">
          {sourceTypes.map(({ to, icon: Icon, title, text, cta }) => (
            <Link className="home-entry-card" to={to} key={to}>
              <div className="home-entry-card__icon"><Icon size={22} /></div>
              <div><h3>{title}</h3><p>{text}</p></div>
              <span>{cta} <ArrowRight size={15} /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="language-ribbon content-width" aria-label="Teknoloji kısayolları">
        {languageIds.map((id) => {
          const language = languageMap[id];
          return <Link to={`/dil/${id}`} key={id}><i style={{ background: language.color }} />{language.name}</Link>;
        })}
        <Link className="language-ribbon__all" to="/kesfet?sekme=diller">Tüm teknolojiler <ArrowRight size={14} /></Link>
      </section>

      <div className="library-layout content-width">
        <main className="article-feed">
          <header className="library-heading"><div><p className="eyebrow">Editoryal seçki</p><h2>Teknik makaleler</h2></div><Link to="/makaleler">Tüm makaleler <ArrowRight size={14} /></Link></header>
          {articles.map((article) => (
            <article className="home-article-row home-article-row--reference" key={article.key} style={{ '--article-accent': article.color }}>
              <Link className="home-article-row__text" to={article.to}>
                <span>{article.category}</span>
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
                <div className="home-article-row__meta"><small>{article.meta}</small><small>Güncellendi: {article.updated}</small></div>
                <span className="home-article-row__cta">Makaleyi görüntüle <ArrowRight size={14} /></span>
              </Link>
            </article>
          ))}
        </main>

        <aside className="library-sidebar">
          <section>
            <header><h2>Sistem mimarisi</h2><Link to="/sistemler">Tümü</Link></header>
            <div className="sidebar-system-list">
              {systemGuideSummaries.slice(0, 5).map((guide, index) => (
                <Link to={`/sistemler/${guide.id}`} key={guide.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><small>{guide.category} · {guide.stack[0]}</small><strong>{guide.title}</strong><em>{guide.readTime}</em></div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <header><h2>Hata kayıtları</h2><Link to="/hatalar">Tümü</Link></header>
            <div className="sidebar-error-list">
              {errors.slice(0, 6).map((error) => (
                <Link to={`/hatalar/${error.id}`} key={error.id}>
                  <code>{error.message}</code>
                  <span>{error.title}</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="home-field-index home-field-index--reference">
        <div className="content-width">
          <header className="library-heading"><div><p className="eyebrow">Kapsam</p><h2>Yazılım alanları</h2></div><Link to="/kesfet?sekme=alanlar">Tüm alanlar <ArrowRight size={14} /></Link></header>
          <div>
            {fields.map((field) => (
              <Link to={`/alan/${field.id}`} key={field.id}>
                <strong>{field.name}</strong>
                <span>{field.summary}</span>
                <small>{field.languages.slice(0, 4).map((id) => languageMap[id]?.name).filter(Boolean).join(' · ')}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
