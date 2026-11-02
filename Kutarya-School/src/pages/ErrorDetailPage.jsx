import { AlertCircle, ArrowLeft, CheckCircle2, ClipboardCheck, Search, ShieldAlert, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CodeBlock from '../components/CodeBlock';
import PublicationBar from '../components/PublicationBar';
import { errorMap } from '../data/errors';
import { SITE } from '../data/siteConfig';
import NotFoundPage from './NotFoundPage';

export default function ErrorDetailPage() {
  const { errorId } = useParams();
  const item = errorMap[errorId];
  if (!item) return <NotFoundPage />;

  return (
    <div className="content-width page-view error-detail">
      <Breadcrumbs items={[{ label: 'Hatalar', to: '/hatalar' }, { label: item.title }]} />
      <header className="error-detail__header">
        <div className="error-detail__badges"><span>{item.technology}</span><span>{item.severity}</span></div>
        <h1>{item.title}</h1><code>{item.message}</code><p>{item.summary}</p>
      </header>
      <PublicationBar contentClass="Teşhis kaydı" updatedAt={SITE.lastEditorialReview} markdownPath={`/reference/errors/${item.id}.md`} />
      <div className="error-detail__layout">
        <aside className="error-detail__summary"><ShieldAlert size={24} /><strong>Teşhis ilkesi</strong><p>Düzeltme uygulanmadan önce olası nedenlerden hangisinin mevcut çalışma bağlamında gerçekten bulunduğu kanıtlanmalıdır.</p><Link to="/hatalar"><ArrowLeft size={15} /> Hata dizinine dön</Link></aside>
        <article>
          <section className="article-section"><p className="section-kicker">Kök neden adayları</p><h2>Bu hata neden oluşur?</h2><div className="cause-list">{item.causes.map((cause, index) => <div key={cause}><span>{index + 1}</span><p>{cause}</p></div>)}</div></section>
          <section className="article-section"><p className="section-kicker">Kanıt toplama</p><h2>Teşhis sırası</h2><ol className="diagnosis-steps">{item.diagnosis.map((step, index) => <li key={step}><span><Search size={17} /></span><div><small>Adım {index + 1}</small><p>{step}</p></div></li>)}</ol></section>
          <section className="article-section"><p className="section-kicker">Düzeltme</p><h2>Güvenilir çözüm yolları</h2><div className="fix-list">{item.fixes.map((fix) => <div key={fix}><CheckCircle2 size={18} /><p>{fix}</p></div>)}</div></section>
          {(item.badCode || item.goodCode) && <section className="article-section"><p className="section-kicker">Karşılaştır</p><h2>Hatalı ve düzeltilmiş yaklaşım</h2><div className="code-comparison">{item.badCode && <CodeBlock code={item.badCode} language={item.technology} title="Sorunlu yaklaşım" compact />}{item.goodCode && <CodeBlock code={item.goodCode} language={item.technology} title="Düzeltilmiş yaklaşım" compact />}</div></section>}
          <section className="verification-box"><ClipboardCheck size={23} /><div><strong>Düzeltme doğrulaması</strong><p>Aynı girdi yeniden çalıştırılmalı, beklenen sonuç açıkça karşılaştırılmalı ve hatayı üreten koşul mümkünse otomatik regresyon testine dönüştürülmelidir.</p></div></section>
          <section className="warning-box"><AlertCircle size={21} /><div><strong>Kaçınılması gereken yaklaşım</strong><p>Boş catch bloğu, tür denetimini kapatma veya güvenlik kontrolünü devre dışı bırakma kök nedeni ortadan kaldırmaz; yalnız belirtinin görünürlüğünü azaltır.</p></div></section>
        </article>
      </div>
    </div>
  );
}
