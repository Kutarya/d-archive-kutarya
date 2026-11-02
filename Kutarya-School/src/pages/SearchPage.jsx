import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { searchCatalog } from '../lib/search';

const typeOrder = ['Makale', 'Dil', 'Alan', 'Uzmanlık', 'Hata', 'Sistem', 'Konu'];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const urlQuery = params.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const [type, setType] = useState('Tümü');

  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const allResults = useMemo(() => (urlQuery.trim() ? searchCatalog(urlQuery, 120) : []), [urlQuery]);
  const availableTypes = useMemo(() => typeOrder.filter((item) => allResults.some((result) => result.type === item)), [allResults]);
  const results = type === 'Tümü' ? allResults : allResults.filter((result) => result.type === type);

  useEffect(() => {
    if (type !== 'Tümü' && !availableTypes.includes(type)) setType('Tümü');
  }, [availableTypes, type]);

  const submit = (event) => {
    event.preventDefault();
    const next = query.trim();
    const nextParams = new URLSearchParams(params);
    if (next) nextParams.set('q', next);
    else nextParams.delete('q');
    setParams(nextParams);
  };

  const clear = () => {
    setQuery('');
    setType('Tümü');
    setParams({});
  };

  return (
    <div className="content-width page-view search-page">
      <Breadcrumbs items={[{ label: 'Arama' }]} />
      <header className="page-intro search-page__intro">
        <p className="eyebrow">İçerik arama</p>
        <h1>Teknik kaynaklarda arama</h1>
        <p>Teknik makale, hata kaydı, sistem rehberi, teknoloji ve katalog başlıkları tek arama dizininde taranır.</p>
      </header>

      <form className="search-page__form" onSubmit={submit}>
        <Search size={20} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Örn. NullReference, Python dosya, REST API, kapsülleme..." autoFocus aria-label="Kutarya genel arama" />
        {query && <button className="search-page__clear" type="button" onClick={clear} title="Aramayı temizle"><X size={17} /></button>}
        <button className="primary-button primary-button--small" type="submit">Ara</button>
      </form>

      {urlQuery && (
        <>
          <div className="search-page__filters" aria-label="Sonuç türü filtresi">
            <button type="button" className={type === 'Tümü' ? 'is-active' : ''} onClick={() => setType('Tümü')}>Tümü <span>{allResults.length}</span></button>
            {availableTypes.map((item) => {
              const count = allResults.filter((result) => result.type === item).length;
              return <button type="button" key={item} className={type === item ? 'is-active' : ''} onClick={() => setType(item)}>{item} <span>{count}</span></button>;
            })}
          </div>

          <div className="search-page__summary">
            <strong>“{urlQuery}”</strong> için {results.length} sonuç
          </div>

          {results.length ? (
            <div className="search-page__results">
              {results.map((result) => (
                <Link to={result.href} key={result.id} className="search-page__result">
                  <span className="search-page__type">{result.type}</span>
                  <div>
                    <strong>{result.title}</strong>
                    <p>{result.description}</p>
                    {result.detailed && <small>Kaynaklandırılmış teknik makale</small>}
                  </div>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="search-page__empty"><strong>Sonuç bulunamadı.</strong><p>Daha kısa bir kavram, teknoloji adı veya hata mesajının sabit bölümü kullanılabilir.</p></div>
          )}
        </>
      )}

      {!urlQuery && (
        <div className="search-page__empty search-page__empty--initial">
          <strong>Arama dizini hazır.</strong>
          <p>Örnek sorgular: “C# OOP”, “CUDA bellek”, “SQL JOIN”, “Unity”, “dosya işlemleri”.</p>
        </div>
      )}
    </div>
  );
}
