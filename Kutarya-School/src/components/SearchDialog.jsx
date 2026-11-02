import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCatalog } from '../lib/search';

export default function SearchDialog({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const results = query.trim() ? searchCatalog(query) : [];

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  if (!open) return null;
  const go = (href) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="dialog-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Kutarya kaynaklarında ara">
        <div className="search-dialog__input">
          <Search size={20} aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Makale, dil, konu, hata mesajı veya sistem ara..." />
          <button className="icon-button" type="button" onClick={onClose} title="Aramayı kapat"><X size={18} /></button>
        </div>
        <div className="search-dialog__body">
          {!query && (
            <div className="search-empty">
              <strong>Her şeyi tek yerden ara</strong>
              <p>Örnek: “NullReference”, “Unity envanter”, “Python dosya” veya “REST API”.</p>
            </div>
          )}
          {query && !results.length && <div className="search-empty"><strong>Sonuç bulunamadı</strong><p>Daha kısa bir kavram veya hata mesajının ilk bölümünü deneyin.</p></div>}
          {results.map((result) => (
            <button key={result.id} className="search-result" type="button" onClick={() => go(result.href)}>
              <span className="search-result__type">{result.type}</span>
              <span><strong>{result.title}</strong><small>{result.description}</small></span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
        <footer className="search-dialog__footer"><span><kbd>Esc</kbd> kapat</span><span>{results.length ? `${results.length} sonuç` : 'Makale · dil · konu · hata · sistem'}</span></footer>
      </section>
    </div>
  );
}
