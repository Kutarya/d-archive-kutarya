import { ChevronDown, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const navItems = [
  { to: '/makaleler', label: 'Makaleler' },
  { to: '/hatalar', label: 'Hata kayıtları' },
  { to: '/sistemler', label: 'Sistem rehberleri' },
];

export default function Header({ menuOpen, onMenuToggle, onSearch, theme, onThemeToggle }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Logo />
        <nav className="primary-nav" aria-label="Ana menü">
          <button className={`nav-link nav-link--button ${menuOpen ? 'is-active' : ''}`} type="button" onClick={onMenuToggle} aria-expanded={menuOpen}>
            Katalog <ChevronDown size={15} aria-hidden="true" />
          </button>
          {navItems.map(({ to, label }) => (
            <NavLink key={to} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} to={to}>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <button className="search-trigger" type="button" onClick={onSearch}>
            <Search size={17} aria-hidden="true" />
            <span>Ara</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button className="icon-button" type="button" onClick={onThemeToggle} title={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="sr-only">Temayı değiştir</span>
          </button>
          <button className="icon-button mobile-menu-button" type="button" onClick={onMenuToggle} aria-expanded={menuOpen} title={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">Menüyü aç veya kapat</span>
          </button>
        </div>
      </div>
    </header>
  );
}
