import { AlertTriangle, ArrowRight, Bug, Filter, Search, Stethoscope, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { errors, errorTechnologies } from '../data/errors';

export default function ErrorsPage() {
  const [query, setQuery] = useState('');
  const [technology, setTechnology] = useState('Tümü');
  const filtered = useMemo(() => {
    const search = query.toLocaleLowerCase('tr');
    return errors.filter((item) => (technology === 'Tümü' || item.technology === technology) && `${item.title} ${item.message} ${item.summary} ${item.causes.join(' ')}`.toLocaleLowerCase('tr').includes(search));
  }, [query, technology]);

  return (
    <div className="content-width page-view">
      <Breadcrumbs items={[{ label: 'Hata kayıtları' }]} />
      <header className="page-intro page-intro--with-icon"><span><Bug size={28} /></span><div><p className="eyebrow">Teknik teşhis dizini</p><h1>Hata kayıtları</h1><p>Yaygın hata mesajları; belirti, olası kök neden, teşhis sırası ve düzeltme yaklaşımlarıyla ayrı kayıtlar halinde tutulur.</p></div></header>

      <section className="error-search-panel">
        <label><Search size={21} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hata mesajını veya belirtinin bir bölümünü yaz..." />{query && <button type="button" onClick={() => setQuery('')} title="Temizle"><X size={16} /></button>}</label>
        <div className="technology-filter"><Filter size={16} /><span>Teknoloji:</span><select value={technology} onChange={(event) => setTechnology(event.target.value)}><option>Tümü</option>{errorTechnologies.map((item) => <option key={item}>{item}</option>)}</select><small>{filtered.length} kayıt</small></div>
      </section>

      <div className="diagnosis-principles">
        <div><Stethoscope size={20} /><span><strong>1. Belirtiyi kaydet</strong><small>Tam mesaj, ilk uygulama satırı ve girdiyi koru.</small></span></div>
        <div><AlertTriangle size={20} /><span><strong>2. Tek varsayımı sınayın</strong><small>Birden fazla düzeltmenin aynı anda uygulanması kök nedenin görünürlüğünü azaltır.</small></span></div>
        <div><Bug size={20} /><span><strong>3. En küçük örnekte doğrulayın</strong><small>Düzeltmenin yalnız belirtiyi değil kök nedeni giderdiği test edilmelidir.</small></span></div>
      </div>

      <div className="error-catalog">
        {filtered.map((item) => (
          <Link to={`/hatalar/${item.id}`} key={item.id}>
            <div className="error-catalog__meta"><span>{item.technology}</span><small>{item.severity}</small></div>
            <strong>{item.title}</strong><code>{item.message}</code><p>{item.summary}</p>
            <div><span>{item.causes.length} olası neden</span><span>{item.diagnosis.length} teşhis adımı</span></div>
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
      {!filtered.length && <div className="empty-state"><Search size={25} /><strong>Eşleşen hata bulunamadı.</strong><p>Değişken değerler çıkarılarak hata mesajının sabit bölümü veya teknoloji adıyla arama yapılabilir.</p></div>}
    </div>
  );
}
