import { ArrowRight, CheckCircle2, Clock3, Code2, FolderKanban, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CodeBlock from '../components/CodeBlock';
import { fieldMap, languageMap } from '../data/catalog';
import { createFallbackProfile, languageProfiles } from '../data/languageProfiles';
import NotFoundPage from './NotFoundPage';

export default function LanguagePage() {
  const { languageId } = useParams();
  const location = useLocation();
  const language = languageMap[languageId];

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    if (target) window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, [location.hash, languageId]);

  if (!language) return <NotFoundPage />;

  const profile = languageProfiles[languageId] || createFallbackProfile(language, fieldMap);
  const topicCount = language.groups.reduce((sum, group) => sum + group.topics.length, 0);

  return (
    <article className="language-article" style={{ '--article-color': language.color }}>
      <div className="content-width language-article__crumbs">
        <Breadcrumbs items={[{ label: 'Diller', to: '/kesfet?sekme=diller' }, { label: language.name }]} />
      </div>

      <header className="language-article__header content-width">
        <div className="language-article__identity">
          <span>{language.name === 'JavaScript' ? 'JS' : language.name.slice(0, 3)}</span>
          <div><p>{profile.eyebrow}</p><small>Teknoloji başvuru dizini</small></div>
        </div>
        <h1>{profile.title}</h1>
        <p className="language-article__lead">{profile.lead}</p>
        <div className="language-article__meta">
          <span><Clock3 size={15} /> {languageProfiles[languageId] ? '12-16 dk okuma' : '6-8 dk okuma'}</span>
          <span><Code2 size={15} /> {profile.useCases.length} açıklamalı örnek</span>
          <span><TriangleAlert size={15} /> {profile.errors.length} yaygın hata</span>
        </div>
      </header>

      <div className="language-facts">
        <div className="content-width">
          {profile.facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </div>
      </div>

      <div className="language-article__layout content-width">
        <aside className="language-article__toc">
          <strong>İçindekiler</strong>
          <a href="#genel-bakis">Genel bakış</a>
          <a href="#kullanim-alanlari">Kullanım alanları</a>
          {profile.useCases.map((useCase) => <a href={`#${useCase.id}`} key={useCase.id}>{useCase.title}</a>)}
          <a href="#hatalar">Olası hatalar</a>
          <a href="#projeler">İlgili sistemler</a>
          <a href="#konular">Konu dizini</a>
        </aside>

        <div className="language-article__body">
          <section id="genel-bakis" className="article-prose-section">
            <p className="article-section-label">01 · Genel bakış</p>
            <h2>{language.name} nedir?</h2>
            {profile.history.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <blockquote>Bir teknolojinin değerlendirilmesinde yalnız sözdizimi değil; çalışma zamanı, bağımlılık modeli, performans maliyeti ve hedef platform birlikte ele alınmalıdır.</blockquote>
          </section>

          <section id="kullanim-alanlari" className="article-prose-section">
            <p className="article-section-label">02 · Kullanım alanları</p>
            <h2>{language.name} nerelerde kullanılır?</h2>
            <p>Kullanım alanı, aynı dilin farklı çalışma zamanı ve ekosistem koşullarında nasıl konumlandığını gösterir. Aşağıdaki bölümler başlıca uygulama sınıflarını ve ilgili kaynak bağlantılarını özetler.</p>
            <div className="article-area-links">
              {language.areas.map((fieldId) => {
                const field = fieldMap[fieldId];
                return <Link to={`/alan/${field.id}`} key={field.id}><strong>{field.name}</strong><span>{field.summary}</span><ArrowRight size={16} /></Link>;
              })}
            </div>
          </section>

          {profile.useCases.map((useCase, index) => (
            <section id={useCase.id} className="article-example-section" key={useCase.id}>
              <header>
                <p className="article-section-label">{String(index + 3).padStart(2, '0')} · Teknik örnek</p>
                <h2>{useCase.title}</h2>
                <p>{useCase.summary}</p>
              </header>
              <p className="article-example-section__detail">{useCase.detail}</p>
              <CodeBlock code={useCase.code} language={language.id} title={useCase.codeTitle} />
              <div className="code-reading-notes">
                <div><span>Beklenen sonuç</span><p>{useCase.output}</p></div>
                <div><span>Hata ihtimali</span><p>{useCase.pitfall}</p></div>
              </div>
              <div className="article-example-section__actions">
                <Link to={`/ara?q=${encodeURIComponent(useCase.projectQuery)}`}>İlgili kaynakları bul <ArrowRight size={15} /></Link>
              </div>
            </section>
          ))}

          <section id="hatalar" className="article-prose-section article-errors">
            <p className="article-section-label">{String(profile.useCases.length + 3).padStart(2, '0')} · Sorun giderme</p>
            <h2>Yaygın arıza biçimleri</h2>
            <p>Derleme, bağımlılık ve çalışma zamanı hataları farklı teşhis zincirleri gerektirir. Hata metni, kaynak konumu ve çalışma bağlamı birlikte değerlendirilmelidir.</p>
            <div className="article-error-table">
              <div className="article-error-table__head"><span>Mesaj</span><span>Muhtemel neden</span><span>İlk kontrol</span></div>
              {profile.errors.map(([message, cause, check]) => (
                <div key={message}><code>{message}</code><p>{cause}</p><p>{check}</p></div>
              ))}
            </div>
            <div className="resource-inline">
              <TriangleAlert size={24} />
              <div><strong>Geniş hata dizini</strong><p>Tam hata metni veya sabit mesaj bölümü üzerinden teknolojiye özgü belirti, olası neden ve teşhis kayıtları aranabilir.</p></div>
              <Link to="/hatalar">Hata merkezini aç <ArrowRight size={15} /></Link>
            </div>
          </section>

          <section id="projeler" className="article-prose-section">
            <p className="article-section-label">{String(profile.useCases.length + 4).padStart(2, '0')} · Sistem bağlantıları</p>
            <h2>İlgili sistem uygulamaları</h2>
            <div className="article-project-list">
              {profile.projects.map(([title, level, description], index) => (
                <Link to={`/sistemler?q=${encodeURIComponent(`${language.name} ${title}`)}`} key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><small>{level}</small><strong>{title}</strong><p>{description}</p></div>
                  <FolderKanban size={19} />
                </Link>
              ))}
            </div>
          </section>

          <section id="konular" className="article-prose-section">
            <p className="article-section-label">{String(profile.useCases.length + 5).padStart(2, '0')} · Başvuru dizini</p>
            <h2>{topicCount} başlıktan oluşan konu dizini</h2>
            <p>Konu dizini bağımsız başvuru için düzenlenmiştir. Her kayıt kavram açıklaması, temel kod örneği ve hata notlarına doğrudan erişim sağlar.</p>
            <div className="article-topic-groups">
              {language.groups.map((group) => (
                <section key={group.id}>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                  {group.topics.map(([topicId, title]) => <Link to={`/konu/${language.id}/${topicId}`} key={topicId}><CheckCircle2 size={15} />{title}<ArrowRight size={14} /></Link>)}
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
