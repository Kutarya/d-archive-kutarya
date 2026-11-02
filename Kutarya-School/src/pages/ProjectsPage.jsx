import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { systemGuides } from '../data/systemGuides';

export default function ProjectsPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [category, setCategory] = useState('Tümü');
  const categories = ['Tümü', ...new Set(systemGuides.map((guide) => guide.category))];

  useEffect(() => setQuery(params.get('q') || ''), [params]);

  const filtered = useMemo(() => {
    const search = query.toLocaleLowerCase('tr');
    return systemGuides.filter((guide) => (
      category === 'Tümü' || guide.category === category
    ) && `${guide.title} ${guide.summary} ${guide.stack.join(' ')} ${guide.debug.flat().join(' ')}`.toLocaleLowerCase('tr').includes(search));
  }, [category, query]);

  return (
    <div className="content-width systems-index">
      <Breadcrumbs items={[{ label: 'Sistemler' }]} />
      <header className="systems-index__intro">
        <p className="article-section-label">Sistem mimarisi</p>
        <h1>Uçtan uca sistem rehberleri</h1>
        <p>Dosya ağacı, kurulum, kaynak kod, çalışma kontrolleri ve arıza noktaları tek teknik belge içinde sunulur.</p>
      </header>

      <div className="systems-index__toolbar">
        <label><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sistem, dil veya hata ara" />{query && <button type="button" onClick={() => setQuery('')} title="Aramayı temizle"><X size={15} /></button>}</label>
        <div role="group" aria-label="Sistem alanı">{categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      </div>

      <div className="systems-index__list">
        {filtered.map((guide, index) => (
          <Link to={`/sistemler/${guide.id}`} key={guide.id}>
            <span className="systems-index__number">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <small>{guide.category} · {guide.level}</small>
              <h2>{guide.title}</h2>
              <p>{guide.summary}</p>
              <em>{guide.stack.join(' · ')}</em>
            </div>
            <ul>
              <li>{guide.files.length} kaynak dosyası</li>
              <li>{guide.runChecks.length} çalıştırma kontrolü</li>
              <li>{guide.debug.length} hata senaryosu</li>
            </ul>
            <ArrowRight size={19} />
          </Link>
        ))}
      </div>

      {!filtered.length && <div className="empty-state"><strong>Eşleşen sistem bulunamadı.</strong><p>Arama ifadesi kısaltılabilir veya kategori filtresi temizlenebilir.</p></div>}
    </div>
  );
}
