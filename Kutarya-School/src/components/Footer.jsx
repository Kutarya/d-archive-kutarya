import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner site-footer__inner--simple">
        <div><Logo /><p>Türkçe yazılım ve bilgisayar bilimi başvuru kaynağı. Teknik içerik, hata kayıtları ve sistem mimarisi rehberleri.</p></div>
        <div className="footer-links"><strong>Kaynaklar</strong><Link to="/makaleler">Teknik makaleler</Link><Link to="/hatalar">Hata kayıtları</Link><Link to="/sistemler">Sistem rehberleri</Link><Link to="/kesfet">Teknoloji kataloğu</Link></div>
        <div className="footer-links"><strong>Yayın</strong><Link to="/yayin-ilkeleri">Yayın ilkeleri</Link><Link to="/ara">Arama</Link><a href="/content-index.json">İçerik dizini</a><a href="/llms.txt">llms.txt</a></div>
      </div>
      <div className="site-footer__bottom"><span>© {new Date().getFullYear()} Kutarya</span><span>Herkese açık teknik kaynak.</span></div>
    </footer>
  );
}
