import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, BookOpenCheck, Building2, CalendarDays, Check, CheckCircle2, Clock3, ExternalLink, FileText, ListChecks, ShieldCheck, Wrench } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CodeBlock from '../components/CodeBlock';
import { languageMap } from '../data/catalog';
import { errors } from '../data/errors';
import { getLesson, lessons } from '../data/lessons';
import { articlePublicationMeta, formatTurkishDate } from '../data/siteConfig';
import NotFoundPage from './NotFoundPage';

export default function TopicPage() {
  const { languageId, topicId } = useParams();
  const language = languageMap[languageId];
  const lesson = getLesson(languageId, topicId);
  if (!language || !lesson) return <NotFoundPage />;

  const articleKey = `${languageId}:${topicId}`;
  const isDetailed = Boolean(lessons[articleKey]);
  const publication = articlePublicationMeta(lesson);
  const relatedErrors = errors.filter((item) => item.technology.toLocaleLowerCase('tr').includes(language.name.toLocaleLowerCase('tr'))).slice(0, 3);
  const topicList = language.groups.flatMap((group) => group.topics);
  const currentIndex = topicList.findIndex(([id]) => id === topicId);
  const previous = currentIndex > 0 ? topicList[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < topicList.length - 1 ? topicList[currentIndex + 1] : null;
  const sourceCount = lesson.sources?.length || 0;
  const referencePath = `/reference/articles/${languageId}/${topicId}.md`;

  return (
    <div className="content-width page-view article-page">
      <Breadcrumbs items={[{ label: 'Katalog', to: '/kesfet?sekme=diller' }, { label: language.name, to: `/dil/${language.id}` }, { label: lesson.title }]} />

      <header className="article-header article-header--publication" style={{ '--language-color': language.color }}>
        <p className="eyebrow">{isDetailed ? 'Teknik makale' : 'Katalog / Konu notu'} · {language.name}</p>
        <h1>{lesson.title}</h1>
        <p className="article-deck">{lesson.description}</p>
        <div className="meta-row">
          <span><BookOpen size={15} /> {lesson.level}</span>
          <span><Clock3 size={15} /> {lesson.readingTime || lesson.duration}</span>
          {isDetailed ? <span><BookOpenCheck size={15} /> Kaynaklandırılmış içerik</span> : <span><ListChecks size={15} /> Kısa başvuru notu</span>}
        </div>
        {isDetailed && (
          <div className="publication-strip" aria-label="Yayın bilgisi">
            <span><Building2 size={15} /><small>Yayıncı</small><strong>{publication.publisher}</strong></span>
            <span><CalendarDays size={15} /><small>Son güncelleme</small><strong>{formatTurkishDate(publication.updatedAt)}</strong></span>
            <span><FileText size={15} /><small>Birincil kaynak</small><strong>{sourceCount}</strong></span>
            <a href={referencePath}><ShieldCheck size={15} /><small>Makine-okunabilir</small><strong>Markdown</strong></a>
          </div>
        )}
      </header>

      {!isDetailed && (
        <div className="catalog-note-notice">
          <FileText size={18} />
          <p>Bu sayfa katalog içi kısa bir konu notudur. Ayrıntılı teknik makalelerden ayrı tutulur ve arama motorlarına makale olarak sunulmaz.</p>
          <Link to="/makaleler">Ayrıntılı makaleler <ArrowRight size={14} /></Link>
        </div>
      )}

      <nav className="article-jumpbar" aria-label="Sayfa bölümleri">
        <span>İçindekiler</span>
        <a href="#kapsam">Kapsam</a>
        {lesson.chapters?.length ? <a href="#teknik-aciklama">Teknik açıklama</a> : null}
        {lesson.evidenceNotes?.length ? <a href="#kaynak-notlari">Kaynak notları</a> : null}
        {lesson.caseStudy ? <a href="#uygulama-vakasi">Uygulama vakası</a> : null}
        <a href="#uygulama">Kod</a>
        <a href="#ariza-bicimleri">Hata biçimleri</a>
        {lesson.sources?.length ? <a href="#referanslar">Referanslar</a> : null}
      </nav>

      <div className="article-layout">
        <aside className="article-nav">
          <div className="article-nav-inner">
            <strong className="nav-title">{language.name} dizini</strong>
            {language.groups.map(group => (
              <div key={group.id} className="nav-group">
                <span className="nav-group-title">{group.title}</span>
                {group.topics.map(topic => (
                  <Link key={topic[0]} to={`/konu/${language.id}/${topic[0]}`} className={topic[0] === topicId ? 'is-active' : ''}>
                    {topic[1]}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </aside>

        <article className="article-content">
          <section id="kapsam" className="article-section">
            <p className="section-kicker">Kapsam</p>
            <h2>Bu sayfanın ele aldığı teknik alan</h2>
            <div className="prose-lead">{lesson.overview}</div>
            {!!lesson.referenceContext?.length && <div className="reference-context">{lesson.referenceContext.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
            {lesson.versionScope && <div className="version-scope"><strong>Referans kapsamı</strong><span>{lesson.versionScope}</span></div>}
            <div className="goal-list goal-list--reference">{lesson.goals.map((goal) => <div key={goal}><CheckCircle2 size={18} /><span>{goal}</span></div>)}</div>
          </section>

          <section id="kavramlar" className="article-section">
            <p className="section-kicker">Kavramsal çerçeve</p><h2>Temel kavramlar ve sınırlar</h2>
            <div className="concept-grid">{lesson.concepts.map((concept, index) => <div key={concept.title}><span>{String(index + 1).padStart(2, '0')}</span><strong>{concept.title}</strong><p>{concept.body}</p></div>)}</div>
          </section>

          {!!lesson.chapters?.length && (
            <section id="teknik-aciklama" className="article-section article-longform">
              <p className="section-kicker">Teknik açıklama</p>
              <h2>Davranış, kararlar ve üretim etkileri</h2>
              <p className="section-description">Aşağıdaki bölümler sözdiziminden çok çalışma modelini, tasarım kararlarını, sınır koşullarını ve üretim ortamındaki etkileri ele alır.</p>
              <div className="article-chapters">
                {lesson.chapters.map((chapter, chapterIndex) => (
                  <section className="article-chapter" key={chapter.title}>
                    <div className="article-chapter__number">{String(chapterIndex + 1).padStart(2, '0')}</div>
                    <div>
                      <h3>{chapter.title}</h3>
                      {chapter.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                      {!!chapter.bullets?.length && <ul>{chapter.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          )}

          {!!lesson.evidenceNotes?.length && (
            <section id="kaynak-notlari" className="article-section evidence-section">
              <p className="section-kicker">Kanıt zinciri</p>
              <h2>Teknik iddialar ve birincil kaynak notları</h2>
              <p className="section-description">Aşağıdaki notlar, makalenin temel teknik iddialarını son bölümdeki numaralı birincil referanslarla ilişkilendirir. Kaynak numarası doğrudan ilgili resmî belgeye gider.</p>
              <div className="evidence-note-list">
                {lesson.evidenceNotes.map((note) => (
                  <article key={note.title}>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                    <div className="evidence-note-list__sources" aria-label={`${note.title} kaynakları`}>
                      {(note.sourceIndexes || []).map((sourceIndex) => (
                        <a key={sourceIndex} href={`#reference-source-${sourceIndex}`}>Kaynak [{sourceIndex}]</a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {!!lesson.boundaryCases?.length && (
            <section id="sinir-durumlari" className="article-section">
              <p className="section-kicker">Sınır durumları</p>
              <h2>Genellemenin bozulabildiği noktalar</h2>
              <p className="section-description">Bu maddeler, temel kuralın tek başına yeterli olmadığı veya davranışın çalışma ortamına göre değişebildiği durumları işaretler.</p>
              <div className="boundary-case-list">{lesson.boundaryCases.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></div>)}</div>
            </section>
          )}

          {lesson.caseStudy && (
            <section id="uygulama-vakasi" className="article-section case-study-section">
              <p className="section-kicker">Uygulama vakası</p>
              <h2>{lesson.caseStudy.title}</h2>
              <div className="case-study-grid">
                <div><span>Bağlam</span><p>{lesson.caseStudy.context}</p></div>
                <div><span>Teknik analiz</span><p>{lesson.caseStudy.analysis}</p></div>
                <div><span>Beklenen sonuç</span><p>{lesson.caseStudy.outcome}</p></div>
              </div>
              {!!lesson.observability?.length && (
                <div className="observability-panel">
                  <strong>İzlenecek sinyaller</strong>
                  <ul>{lesson.observability.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </section>
          )}

          {!!lesson.relatedTopics?.length && (
            <section id="alt-basliklar" className="article-section">
              <p className="section-kicker">İlişkili alt başlıklar</p><h2>Konunun ayrıntılı bileşenleri</h2>
              <p className="section-description">Bu dizindeki her kayıt ayrı teknik kapsam, kod örneği, hata biçimleri ve üretim kontrolü içerir.</p>
              <div className="reference-index">
                {lesson.relatedTopics.map(([id, title, description], index) => (
                  <Link key={id} to={`/konu/${language.id}/${id}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{title}</strong><p>{description}</p></div>
                    <ArrowRight size={17} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="uygulama" className="article-section">
            <p className="section-kicker">Uygulama</p><h2>Kod ve çalışma akışı</h2>
            {(lesson.examples || [{ title: lesson.codeTitle, code: lesson.code, language: language.id, steps: lesson.walkthrough }]).map((example, exampleIndex) => (
              <div className="article-example" key={`${example.title}-${exampleIndex}`}>
                <div className="article-example__heading"><span>{String(exampleIndex + 1).padStart(2, '0')}</span><div><h3>{example.title}</h3>{example.explanation && <p>{example.explanation}</p>}</div></div>
                <CodeBlock code={example.code} language={example.language || language.id} title={`${language.id}-${topicId}-${exampleIndex + 1}`} />
                {!!example.steps?.length && <ol className="walkthrough-list">{example.steps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>}
              </div>
            ))}
            <div className="tip-callout tip-callout--verification"><ShieldCheck size={20} /><div><strong>Doğrulama protokolü</strong><p>Beklenen davranışı önce sabitleyin; ardından tek bir varsayımı değiştirerek sonucu, hata mesajını ve yan etkileri karşılaştırın. Üretim kararı yalnız “kod çalıştı” gözlemine dayandırılmamalıdır.</p></div></div>
          </section>

          {!!lesson.referenceTable?.length && (
            <section className="article-section" id="hizli-basvuru">
              <p className="section-kicker">Referans tablosu</p><h2>Anahtar sözcükler ve görevleri</h2>
              <div className="reference-table" role="table" aria-label="Anahtar sözcük referans tablosu">
                {lesson.referenceTable.map(([term, meaning]) => <div role="row" key={term}><code role="cell">{term}</code><span role="cell">{meaning}</span></div>)}
              </div>
            </section>
          )}

          <section id="alternatifler" className="article-section">
            <p className="section-kicker">Tasarım seçenekleri</p><h2>Alternatif yaklaşımlar ve kullanım koşulları</h2>
            <div className="decision-list">{lesson.alternatives.map((item) => <div key={item.title}><Wrench size={18} /><span><strong>{item.title}</strong><p>{item.body}</p></span></div>)}</div>
          </section>

          <section id="ariza-bicimleri" className="article-section">
            <p className="section-kicker">Arıza biçimleri</p><h2>Belirti, olası neden ve teşhis</h2>
            <p className="section-description">Aynı belirti birden fazla kök nedenden kaynaklanabilir. Hata metni, çalışma bağlamı ve en küçük yeniden üretim örneği birlikte değerlendirilmelidir.</p>
            <div className="likely-error-list">
              {lesson.likelyErrors.map((item) => <details key={item.message}><summary><AlertTriangle size={17} /><code>{item.message}</code><span>Ayrıntı</span></summary><div><p><strong>Olası neden:</strong> {item.cause}</p><p><strong>Teşhis / düzeltme:</strong> {item.fix}</p></div></details>)}
            </div>
            {!!relatedErrors.length && <div className="related-errors"><h3>{language.name} hata kayıtları</h3>{relatedErrors.map((item) => <Link to={`/hatalar/${item.id}`} key={item.id}><span>{item.severity}</span><strong>{item.title}</strong><ArrowRight size={16} /></Link>)}</div>}
          </section>

          {!!lesson.sources?.length && (
            <section id="referanslar" className="article-section article-sources">
              <p className="section-kicker">Birincil referanslar</p>
              <h2>Resmî dokümantasyon ve spesifikasyonlar</h2>
              <p className="section-description">Bu kaynaklar makaledeki teknik çerçevenin birincil referanslarıdır. Sürüme bağlı API ayrıntıları ve platform davranışı için bağlantılı resmî belge esas alınmalıdır.</p>
              <ol className="article-source-list article-source-list--numbered">
                {lesson.sources.map((source, index) => (
                  <li id={`reference-source-${index + 1}`} key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      <span><strong>[{index + 1}] {source.label}</strong><ExternalLink size={16} /></span>
                      <small>{new URL(source.url).hostname}</small>
                    </a>
                  </li>
                ))}
              </ol>
              <div className="reference-machine-row">
                <a href={referencePath}><FileText size={16} /> Bu makalenin Markdown referans kopyası</a>
                <Link to="/yayin-ilkeleri"><ShieldCheck size={16} /> Kaynaklandırma ve editoryal standart</Link>
              </div>
              <p className="article-reviewed">Yayın: <strong>{formatTurkishDate(publication.publishedAt)}</strong> · Son güncelleme: <strong>{formatTurkishDate(publication.updatedAt)}</strong> · Yayıncı: <strong>{publication.publisher}</strong></p>
            </section>
          )}

          {!!lesson.productionNotes?.length && (
            <section id="uretim-notlari" className="article-section">
              <p className="section-kicker">Üretim etkisi</p>
              <h2>Tasarım ve işletim kararları</h2>
              <div className="production-note-list">{lesson.productionNotes.map((item) => <div key={item}><CheckCircle2 size={18} /><p>{item}</p></div>)}</div>
            </section>
          )}

          <section id="dogrulama-senaryolari" className="article-section">
            <p className="section-kicker">Doğrulama senaryoları</p><h2>Davranışı sınayan kontroller</h2>
            <div className="practice-list">{lesson.practice.map((item, index) => <div key={item}><span>{index + 1}</span><p>{item}</p></div>)}</div>
          </section>

          <section id="uretim-kontrolu" className="article-section completion-section">
            <p className="section-kicker">Üretim kontrolü</p><h2>Yayın veya entegrasyon öncesi kontrol listesi</h2>
            <div className="completion-checklist">{lesson.checklist.map((item) => <label key={item}><input type="checkbox" /><span className="custom-check"><Check size={14} /></span><span>{item}</span></label>)}</div>
          </section>

          <nav className="article-pagination" aria-label="Önceki ve sonraki konu">
            {previous ? <Link to={`/konu/${language.id}/${previous[0]}`}><ArrowLeft size={17} /><span><small>Önceki kayıt</small><strong>{previous[1]}</strong></span></Link> : <span />}
            {next && <Link to={`/konu/${language.id}/${next[0]}`}><span><small>Sonraki kayıt</small><strong>{next[1]}</strong></span><ArrowRight size={17} /></Link>}
          </nav>
        </article>

        <aside className="article-toc">
          <div className="article-toc-inner">
            <strong>İçindekiler</strong>
            <a href="#kapsam">Kapsam</a>
            <a href="#kavramlar">Kavramsal çerçeve</a>
            {lesson.chapters?.length ? <a href="#teknik-aciklama">Teknik açıklama</a> : null}
            {lesson.evidenceNotes?.length ? <a href="#kaynak-notlari">Kaynak notları</a> : null}
            {lesson.boundaryCases?.length ? <a href="#sinir-durumlari">Sınır durumları</a> : null}
            {lesson.caseStudy ? <a href="#uygulama-vakasi">Uygulama vakası</a> : null}
            {lesson.relatedTopics?.length ? <a href="#alt-basliklar">Alt başlıklar</a> : null}
            <a href="#uygulama">Kod ve çalışma akışı</a>
            {lesson.referenceTable?.length ? <a href="#hizli-basvuru">Referans tablosu</a> : null}
            <a href="#alternatifler">Tasarım seçenekleri</a>
            <a href="#ariza-bicimleri">Arıza biçimleri</a>
            {lesson.sources?.length ? <a href="#referanslar">Birincil referanslar</a> : null}
            {lesson.productionNotes?.length ? <a href="#uretim-notlari">Üretim notları</a> : null}
            <a href="#dogrulama-senaryolari">Doğrulama senaryoları</a>
            <a href="#uretim-kontrolu">Üretim kontrolü</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
