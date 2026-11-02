import { CheckCircle2, Clock3, Code2, TerminalSquare } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CodeBlock from '../components/CodeBlock';
import PublicationBar from '../components/PublicationBar';
import { systemGuideMap } from '../data/systemGuides';
import { SITE } from '../data/siteConfig';
import NotFoundPage from './NotFoundPage';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const guide = systemGuideMap[projectId];
  if (!guide) return <NotFoundPage />;

  return (
    <article className="system-guide">
      <div className="content-width system-guide__crumbs"><Breadcrumbs items={[{ label: 'Sistemler', to: '/sistemler' }, { label: guide.title }]} /></div>
      <header className="content-width system-guide__header">
        <p className="article-section-label">{guide.category} · Sistem mimarisi rehberi</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <div><span><Clock3 size={15} /> {guide.readTime}</span><span><Code2 size={15} /> {guide.files.length} kaynak dosyası</span><span><TerminalSquare size={15} /> Kurulum ve test komutları</span></div>
      </header>
      <div className="content-width"><PublicationBar contentClass="Uygulama rehberi" updatedAt={SITE.lastEditorialReview} markdownPath={`/reference/systems/${guide.id}.md`} /></div>

      <div className="system-guide__stack"><div className="content-width">{guide.stack.map((item) => <span key={item}>{item}</span>)}<strong>{guide.level}</strong></div></div>

      <div className="content-width system-guide__layout">
        <aside>
          <strong>İçindekiler</strong>
          <a href="#sonuc">Sistem kapsamı</a>
          <a href="#hazirlik">Gerekenler</a>
          <a href="#dosyalar">Dosya ağacı</a>
          <a href="#kurulum">Kurulum</a>
          {guide.files.map((file) => <a href={`#file-${file.path.replace(/[^a-z0-9]/gi, '-')}`} key={file.path}>{file.path}</a>)}
          <a href="#dogrulama">Çalıştırma kontrolü</a>
          <a href="#hata-ayiklama">Hata ayıklama</a>
          <a href="#gelistirme">Genişletme noktaları</a>
        </aside>

        <div className="system-guide__body">
          <section id="sonuc">
            <p className="article-section-label">01 · Hedef</p>
            <h2>Sistem kapsamı</h2>
            <p>{guide.result}</p>
          </section>

          <section id="hazirlik">
            <p className="article-section-label">02 · Ön koşullar</p>
            <h2>Teknik ön koşullar</h2>
            <ul className="system-check-list">{guide.prerequisites.map((item) => <li key={item}><CheckCircle2 size={17} />{item}</li>)}</ul>
          </section>

          <section id="dosyalar">
            <p className="article-section-label">03 · Mimari</p>
            <h2>Dosya ağacı</h2>
            <p>Dosya ağacı veri modeli, kalıcılık, servis ve arayüz sorumluluklarını ayrı sınırlar altında tutacak şekilde düzenlenir.</p>
            <CodeBlock code={guide.tree} language="text" title="proje-ağacı" />
          </section>

          <section id="kurulum">
            <p className="article-section-label">04 · Kurulum</p>
            <h2>Kurulum ve bağımlılıklar</h2>
            <CodeBlock code={guide.setup} language="powershell" title="terminal" />
          </section>

          {guide.files.map((file, index) => (
            <section id={`file-${file.path.replace(/[^a-z0-9]/gi, '-')}`} key={file.path}>
              <p className="article-section-label">{String(index + 5).padStart(2, '0')} · Kaynak kodu</p>
              <h2>{file.path}</h2>
              <p>{file.explanation}</p>
              <CodeBlock code={file.code} language={file.language} title={file.path} />
            </section>
          ))}

          <section id="dogrulama">
            <p className="article-section-label">Doğrulama</p>
            <h2>Çalışma doğrulaması</h2>
            <p>Başarılı başlatma tek başına yeterli doğrulama değildir. Aşağıdaki davranışların her biri bağımsız olarak kontrol edilmelidir.</p>
            <ol className="system-run-checks">{guide.runChecks.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}</ol>
          </section>

          <section id="hata-ayiklama">
            <p className="article-section-label">Sorun giderme</p>
            <h2>Hata ayıklama tablosu</h2>
            <div className="system-debug-table">
              <div className="system-debug-table__head"><span>Belirti</span><span>Olası neden</span><span>Doğrulama</span><span>Düzeltme</span></div>
              {guide.debug.map(([symptom, cause, proof, fix]) => <div key={symptom}><code>{symptom}</code><p>{cause}</p><p>{proof}</p><p>{fix}</p></div>)}
            </div>
          </section>

          <section id="gelistirme">
            <p className="article-section-label">Devam</p>
            <h2>Genişletme noktaları</h2>
            <div className="system-extension-list">{guide.extensions.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><p>{item}</p></div>)}</div>
          </section>
        </div>
      </div>
    </article>
  );
}
