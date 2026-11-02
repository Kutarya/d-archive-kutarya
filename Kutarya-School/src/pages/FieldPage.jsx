import { ArrowRight, BookOpen, CheckCircle2, Hammer, TriangleAlert, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { fieldMap, languageMap } from '../data/catalog';
import { getFieldGuide } from '../data/fieldGuides';
import { systemGuides } from '../data/systemGuides';
import NotFoundPage from './NotFoundPage';

const categoryByField = {
  'web-frontend': 'Web',
  backend: 'Backend',
  mobile: 'Mobil',
  game: 'Oyun',
  automation: 'Otomasyon',
  ai: 'Yapay zeka',
};

function FieldLibraryPage({ field }) {
  const guide = getFieldGuide(field);
  const [trackId, setTrackId] = useState(() => {
    const hash = window.location.hash.slice(1);
    return guide.tracks.some((item) => item.id === hash) ? hash : guide.tracks[0].id;
  });
  const activeTrack = guide.tracks.find((item) => item.id === trackId) || guide.tracks[0];
  const languages = field.languages.map((id) => languageMap[id]).filter(Boolean);
  const articles = languages.slice(0, 5).flatMap((language) => (
    language.groups.slice(0, 1).flatMap((group) => group.topics.slice(0, 2).map(([topicId, title]) => ({ language, topicId, title, group: group.title })))
  ));
  const relatedSystems = systemGuides.filter((system) => system.category === categoryByField[field.id]);
  const selectTrack = (id) => {
    setTrackId(id);
    window.history.replaceState(null, '', `${window.location.pathname}#${id}`);
  };

  return (
    <div className="content-width field-library" style={{ '--field-color': field.color }}>
      <Breadcrumbs items={[{ label: 'Alanlar', to: '/kesfet?sekme=alanlar' }, { label: field.name }]} />
      <header className="field-library__header">
        <p className="article-section-label">Uygulama alanı</p>
        <h1>{field.name}</h1>
        <p>{guide.description}</p>
        <dl className="field-library__stats">
          <div><dt>{guide.tracks.length}</dt><dd>uzmanlık yolu</dd></div>
          <div><dt>{languages.length}</dt><dd>programlama dili</dd></div>
          <div><dt>{relatedSystems.length}</dt><dd>sistem rehberi</dd></div>
        </dl>
        <div className="field-library__language-links">
          {languages.slice(0, 8).map((language) => <Link to={`/dil/${language.id}`} key={language.id}><i style={{ background: language.color }} />{language.name}</Link>)}
        </div>
      </header>

      <section className="field-paths">
        <header className="library-heading">
          <div><p className="article-section-label">Uzmanlık haritası</p><h2>{guide.headline}</h2></div>
          <span>{guide.tracks.length} ayrı çalışma alanı</span>
        </header>

        <div className="field-paths__tabs" role="tablist" aria-label={`${field.name} alt alanları`}>
          {guide.tracks.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTrack.id === item.id}
              aria-controls="field-track-panel"
              className={activeTrack.id === item.id ? 'is-active' : ''}
              onClick={() => selectTrack(item.id)}
              key={item.id}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.title}
            </button>
          ))}
        </div>

        <article className="field-track-panel" id="field-track-panel" role="tabpanel" aria-live="polite">
          <div className="field-track-panel__main">
            <p className="article-section-label">{activeTrack.title}</p>
            <h3>{activeTrack.goal}</h3>
            <p>{activeTrack.summary}</p>
            <div className="field-track-panel__concepts">
              {activeTrack.concepts.map((concept) => <span key={concept}><CheckCircle2 size={14} />{concept}</span>)}
            </div>
            <nav aria-label={`${activeTrack.title} kaynakları`}>
              {activeTrack.links.map((item) => <Link to={item.to} key={item.to}>{item.label} <ArrowRight size={14} /></Link>)}
            </nav>
          </div>
          <dl className="field-track-panel__facts">
            <div><dt><Wrench size={16} /> Araçlar</dt><dd>{activeTrack.tools.join(' · ')}</dd></div>
            <div><dt><Hammer size={16} /> Uygulama çıktısı</dt><dd>{activeTrack.build}</dd></div>
            <div><dt><TriangleAlert size={16} /> Hata ayıklama odağı</dt><dd>{activeTrack.debug}</dd></div>
          </dl>
        </article>

        <ol className="field-workflow" aria-label={`${field.name} üretim akışı`}>
          {guide.workflow.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}
        </ol>
      </section>

      <div className="field-library__layout">
        <main>
          <header className="library-heading"><h2>Bu alandaki konu rehberleri</h2></header>
          <div className="field-article-list">
            {articles.map(({ language, topicId, title, group }) => (
              <Link to={`/konu/${language.id}/${topicId}`} key={`${language.id}-${topicId}`}>
                <span>{language.name}</span>
                <div><small>{group}</small><h3>{title}</h3><p>{language.summary}</p></div>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </main>

        <aside>
          <header className="library-heading"><h2>Kullanılan diller</h2></header>
          <div className="field-language-list">
            {languages.map((language) => (
              <Link to={`/dil/${language.id}`} key={language.id}>
                <i style={{ background: language.color }} />
                <span><strong>{language.name}</strong><small>{language.family} · {language.level}</small></span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {relatedSystems.length > 0 && (
        <section className="field-systems">
          <header className="library-heading"><h2>İlgili sistem rehberleri</h2><Link to="/sistemler">Tüm sistemler <ArrowRight size={14} /></Link></header>
          {relatedSystems.map((system) => (
            <Link to={`/sistemler/${system.id}`} key={system.id}>
              <div><small>{system.stack.join(' · ')}</small><h3>{system.title}</h3><p>{system.summary}</p></div>
              <span>{system.files.length} dosya · {system.debug.length} hata senaryosu</span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </section>
      )}

      <section className="field-next-reading">
        <BookOpen size={19} />
        <div><strong>{field.name} kaynak dizini</strong><p>İlgili teknoloji başlıkları, hata kayıtları ve sistem rehberleri aynı arama dizininde bulunabilir.</p></div>
        <Link to={`/ara?q=${encodeURIComponent(field.name)}`}>Bütün sonuçlar <ArrowRight size={14} /></Link>
      </section>
    </div>
  );
}

export default function FieldPage() {
  const { fieldId } = useParams();
  const field = fieldMap[fieldId];
  if (!field) return <NotFoundPage />;
  return <FieldLibraryPage field={field} key={field.id} />;
}
