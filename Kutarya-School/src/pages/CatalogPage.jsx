import { ArrowRight, BookOpen, Filter, Layers3, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CatalogIcon from '../components/CatalogIcon';
import { fields, languages } from '../data/catalog';

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const initialTab = params.get('sekme') === 'alanlar' ? 'alanlar' : 'diller';
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState(params.get('q') || '');
  const [family, setFamily] = useState('Tümü');
  const [level, setLevel] = useState('Tümü');
  const families = ['Tümü', ...new Set(languages.map((item) => item.family))];
  const levels = ['Tümü', 'Başlangıç', 'Orta', 'İleri'];

  const normalized = query.toLocaleLowerCase('tr');
  const filteredLanguages = useMemo(() => languages.filter((item) => {
    const text = `${item.name} ${item.summary} ${item.family} ${item.areas.join(' ')}`.toLocaleLowerCase('tr');
    const levelMatch = level === 'Tümü' || item.level.includes(level);
    return text.includes(normalized) && (family === 'Tümü' || item.family === family) && levelMatch;
  }), [query, family, level]);

  const filteredFields = useMemo(() => fields.filter((item) => `${item.name} ${item.summary} ${item.stages.join(' ')}`.toLocaleLowerCase('tr').includes(normalized)), [query]);

  const switchTab = (next) => {
    setTab(next);
    const nextParams = new URLSearchParams(params);
    nextParams.set('sekme', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <div className="content-width page-view">
      <Breadcrumbs items={[{ label: 'Katalog' }]} />
      <header className="page-intro">
        <p className="eyebrow">Teknoloji dizini</p>
        <h1>Diller ve kullanım alanları</h1>
        <p>Programlama dilleri ve yazılım alanları; konu başlıkları, ilişkili hata kayıtları ve sistem rehberleriyle birlikte sınıflandırılır.</p>
      </header>
      <div className="catalog-toolbar">
        <div className="segmented-control" aria-label="Katalog görünümü">
          <button className={tab === 'diller' ? 'is-active' : ''} onClick={() => switchTab('diller')} type="button"><BookOpen size={17} /> Diller <span>{languages.length}</span></button>
          <button className={tab === 'alanlar' ? 'is-active' : ''} onClick={() => switchTab('alanlar')} type="button"><Layers3 size={17} /> Kullanım alanları <span>{fields.length}</span></button>
        </div>
        <label className="catalog-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Katalogda filtrele..." />{query && <button type="button" onClick={() => setQuery('')} title="Aramayı temizle"><X size={15} /></button>}</label>
      </div>

      {tab === 'diller' && (
        <>
          <div className="filter-row">
            <span><Filter size={15} /> Filtreler</span>
            <label>Aile<select value={family} onChange={(event) => setFamily(event.target.value)}>{families.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Seviye<select value={level} onChange={(event) => setLevel(event.target.value)}>{levels.map((item) => <option key={item}>{item}</option>)}</select></label>
            <small>{filteredLanguages.length} sonuç</small>
          </div>
          <div className="catalog-language-grid">
            {filteredLanguages.map((language) => (
              <Link className="language-card" to={`/dil/${language.id}`} key={language.id}>
                <div className="language-card__top"><span className="language-emblem" style={{ '--language-color': language.color }}>{language.name.slice(0, 2)}</span><div><strong>{language.name}</strong><small>{language.family} · {language.level}</small></div><ArrowRight size={17} /></div>
                <p>{language.summary}</p>
                <div className="tag-row">{language.areas.slice(0, 3).map((areaId) => <span key={areaId}>{fields.find((item) => item.id === areaId)?.name}</span>)}{language.areas.length > 3 && <span>+{language.areas.length - 3}</span>}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {tab === 'alanlar' && (
        <div className="catalog-field-list">
          {filteredFields.map((field, index) => (
            <Link to={`/alan/${field.id}`} key={field.id} style={{ '--item-color': field.color }}>
              <span className="field-list__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="field-list__icon"><CatalogIcon name={field.icon} size={23} /></span>
              <span className="field-list__copy"><strong>{field.name}</strong><small>{field.summary}</small></span>
              <span className="field-list__meta">{field.languages.length} dil<small>{field.stages.length} aşamalı yol</small></span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
