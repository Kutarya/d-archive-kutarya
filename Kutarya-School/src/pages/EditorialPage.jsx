import { ArrowRight, CheckCircle2, FileCheck2, Link2, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { EDITORIAL_STANDARD, SITE, formatTurkishDate } from '../data/siteConfig';

export default function EditorialPage() {
  return (
    <div className="content-width page-view editorial-page">
      <Breadcrumbs items={[{ label: 'Yayın ilkeleri' }]} />
      <header className="page-intro editorial-hero">
        <p className="eyebrow">Yayın yöntemi</p>
        <h1>Kaynaklandırma ve editoryal standart</h1>
        <p>Kutarya, teknik içeriği yalnız okunabilir değil; doğrulanabilir, sürümü takip edilebilir ve başka araştırmalarda kaynak gösterilebilir biçimde yayımlamayı hedefler.</p>
        <div className="editorial-meta-line">
          <span>Yayıncı: <strong>{SITE.publisher}</strong></span>
          <span>Son politika incelemesi: <strong>{formatTurkishDate(SITE.lastEditorialReview)}</strong></span>
        </div>
      </header>

      <div className="editorial-grid">
        <section>
          <div className="editorial-icon"><Link2 size={21} /></div>
          <h2>Kaynak önceliği</h2>
          <p>Teknik davranışla ilgili iddialarda mümkün olduğunda birincil kaynak kullanılır. Makalenin sonundaki referans listesi, kullanılan resmî belgeleri açık URL ile gösterir.</p>
          <ol className="editorial-ranked-list">
            {EDITORIAL_STANDARD.sourcePriority.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </section>

        <section>
          <div className="editorial-icon"><FileCheck2 size={21} /></div>
          <h2>İçerik sınıfları</h2>
          <p><strong>Teknik makaleler</strong> özgün açıklama, kod, hata biçimleri ve birincil kaynak listesi içerir. <strong>Konu notları</strong> ise katalog içinde yön bulmayı sağlayan kısa başvuru sayfalarıdır ve arama motorlarında makale olarak indekslenmez.</p>
        </section>

        <section>
          <div className="editorial-icon"><RefreshCcw size={21} /></div>
          <h2>Güncelleme ve sürüm bilgisi</h2>
          <p>Ayrıntılı makalelerde yayın ve son güncelleme tarihi görünür tutulur. Sürüme bağlı API veya platform davranışında resmî kaynak bağlantısı esas alınır; tarihsel bilgi güncel davranış gibi sunulmaz.</p>
        </section>

        <section>
          <div className="editorial-icon"><ShieldCheck size={21} /></div>
          <h2>Doğrulama ilkesi</h2>
          <p>Bir örneğin çalışması tek başına teknik doğruluk kanıtı sayılmaz. Varsayımlar, hata sınırları, performans etkileri ve güvenlik sonuçları mümkün olduğunda metinde ayrıca belirtilir.</p>
        </section>
      </div>

      <section className="editorial-principles">
        <div>
          <p className="eyebrow">Yayın kontrolü</p>
          <h2>Her ayrıntılı içerikte aranan temel koşullar</h2>
        </div>
        <div className="editorial-checks">
          {EDITORIAL_STANDARD.principles.map((item) => <div key={item}><CheckCircle2 size={18} /><span>{item}</span></div>)}
        </div>
      </section>

      <section className="editorial-machine">
        <div>
          <p className="eyebrow">Makine tarafından okunabilir erişim</p>
          <h2>Araştırma araçları ve tarayıcılar için açık içerik dizini</h2>
          <p>İndekslenebilir içerikler sitemap, yapılandırılmış veri ve düz metin/Markdown referans kopyalarıyla yayınlanır. Bu dosyalar insan sayfalarının yerini almaz; aynı içeriğin makine tarafından daha kolay ayrıştırılabilen karşılığıdır.</p>
        </div>
        <div className="editorial-machine-links">
          <a href="/llms.txt">llms.txt <ArrowRight size={15} /></a>
          <a href="/content-index.json">content-index.json <ArrowRight size={15} /></a>
          <a href="/feed.xml">feed.xml <ArrowRight size={15} /></a>
          <Link to="/makaleler">Teknik makaleler <ArrowRight size={15} /></Link>
        </div>
      </section>
    </div>
  );
}
