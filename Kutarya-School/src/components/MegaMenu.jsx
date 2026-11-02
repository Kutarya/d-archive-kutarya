import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fields, languages } from '../data/catalog';

export default function MegaMenu({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="mega-menu-wrap">
      <button className="mega-menu-backdrop" type="button" onClick={onClose} aria-label="Menüyü kapat" />
      <section className="mega-menu mega-menu--library" aria-label="Teknoloji kataloğu">
        <div className="mega-menu__column">
          <div className="menu-heading"><strong>Programlama dilleri ve teknolojiler</strong><Link to="/kesfet?sekme=diller" onClick={onClose}>Tümünü görüntüle <ArrowRight size={13} /></Link></div>
          <div className="menu-link-grid menu-link-grid--languages">
            {languages.slice(0, 24).map((language) => (
              <Link key={language.id} to={`/dil/${language.id}`} onClick={onClose}>
                <i style={{ background: language.color }} />
                <span>{language.name}</span>
              </Link>
            ))}
          </div>
          <nav className="mega-menu__shortcuts" aria-label="Kaynak türleri">
            <Link to="/makaleler" onClick={onClose}>Teknik makaleler <ArrowRight size={13} /></Link>
            <Link to="/sistemler" onClick={onClose}>Sistem rehberleri <ArrowRight size={13} /></Link>
            <Link to="/hatalar" onClick={onClose}>Hata kayıtları <ArrowRight size={13} /></Link>
            <Link to="/yayin-ilkeleri" onClick={onClose}>Yayın ilkeleri <ArrowRight size={13} /></Link>
          </nav>
        </div>
        <div className="mega-menu__column">
          <div className="menu-heading"><strong>Yazılım alanları</strong><Link to="/kesfet?sekme=alanlar" onClick={onClose}>Tümünü görüntüle <ArrowRight size={13} /></Link></div>
          <div className="menu-field-list">
            {fields.map((field) => (
              <Link key={field.id} to={`/alan/${field.id}`} onClick={onClose}>
                <strong>{field.name}</strong>
                <small>{field.summary}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
