import { ArrowRight, BookOpen, Hammer, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldMap, languageMap } from '../data/catalog';
import { fieldGuides, homeFieldIds } from '../data/fieldGuides';

export default function FieldExplorer() {
  const [fieldId, setFieldId] = useState('web-frontend');
  const [trackId, setTrackId] = useState(fieldGuides['web-frontend'].tracks[0].id);
  const field = fieldMap[fieldId];
  const guide = fieldGuides[fieldId];
  const activeTrack = guide.tracks.find((item) => item.id === trackId) || guide.tracks[0];

  useEffect(() => {
    setTrackId(fieldGuides[fieldId].tracks[0].id);
  }, [fieldId]);

  return (
    <section className="field-explorer" style={{ '--field-accent': field.color }}>
      <div className="field-explorer__tabs content-width" role="tablist" aria-label="Yazılım alanları">
        {homeFieldIds.map((id) => {
          const item = fieldGuides[id];
          return (
            <button
              type="button"
              role="tab"
              aria-selected={fieldId === id}
              aria-controls="field-explorer-panel"
              className={fieldId === id ? 'is-active' : ''}
              onClick={() => setFieldId(id)}
              key={id}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="field-explorer__panel" id="field-explorer-panel" role="tabpanel">
        <div className="content-width field-explorer__grid">
          <header>
            <p className="article-section-label">{field.name}</p>
            <h2>{guide.headline}</h2>
            <p>{guide.description}</p>
            <div className="field-explorer__languages" aria-label={`${field.name} dilleri`}>
              {field.languages.slice(0, 5).map((id) => {
                const language = languageMap[id];
                return language ? <Link to={`/dil/${id}`} key={id}><i style={{ background: language.color }} />{language.name}</Link> : null;
              })}
            </div>
            <Link className="field-explorer__all" to={`/alan/${field.id}`}>Alanı ayrıntılı incele <ArrowRight size={15} /></Link>
          </header>

          <nav className="field-explorer__tracks" role="tablist" aria-label={`${field.name} uzmanlıkları`}>
            {guide.tracks.map((item, index) => (
              <button
                type="button"
                role="tab"
                className={activeTrack.id === item.id ? 'is-active' : ''}
                onClick={() => setTrackId(item.id)}
                aria-selected={activeTrack.id === item.id}
                key={item.id}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item.title}</strong>
                <ArrowRight size={14} />
              </button>
            ))}
          </nav>

          <article className="field-explorer__detail" role="tabpanel" aria-live="polite">
            <small>SEÇİLİ UZMANLIK</small>
            <h3>{activeTrack.title}</h3>
            <p>{activeTrack.summary}</p>
            <dl>
              <div><dt><Hammer size={15} /> Üretilecek çıktı</dt><dd>{activeTrack.build}</dd></div>
              <div><dt><BookOpen size={15} /> Temel kavramlar</dt><dd>{activeTrack.concepts.join(' · ')}</dd></div>
              <div><dt><TriangleAlert size={15} /> Kritik hata</dt><dd>{activeTrack.debug}</dd></div>
            </dl>
            <div className="field-explorer__links">
              {activeTrack.links.map((item) => <Link to={item.to} key={item.to}>{item.label} <ArrowRight size={13} /></Link>)}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
