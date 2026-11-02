import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import Header from './components/Header';
import MegaMenu from './components/MegaMenu';
import Footer from './components/Footer';
import SeoManager from './components/SeoManager';
import HomePage from './pages/HomePage';

const SearchDialog = lazy(() => import('./components/SearchDialog'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const LanguagePage = lazy(() => import('./pages/LanguagePage'));
const FieldPage = lazy(() => import('./pages/FieldPage'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const ErrorsPage = lazy(() => import('./pages/ErrorsPage'));
const ErrorDetailPage = lazy(() => import('./pages/ErrorDetailPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const EditorialPage = lazy(() => import('./pages/EditorialPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('kutarya-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('kutarya-theme', theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <SeoManager />
      <ScrollToTop />
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((value) => !value)} onSearch={() => setSearchOpen(true)} theme={theme} onThemeToggle={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))} />
      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {searchOpen && <Suspense fallback={null}><SearchDialog open onClose={() => setSearchOpen(false)} /></Suspense>}
      <main id="main-content">
        <Suspense fallback={<div className="route-loading">Sayfa yükleniyor...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ara" element={<SearchPage />} />
            <Route path="/makaleler" element={<ArticlesPage />} />
            <Route path="/kesfet" element={<CatalogPage />} />
            <Route path="/yayin-ilkeleri" element={<EditorialPage />} />
            <Route path="/diller" element={<Navigate to="/kesfet?sekme=diller" replace />} />
            <Route path="/alanlar" element={<Navigate to="/kesfet?sekme=alanlar" replace />} />
            <Route path="/dil/:languageId" element={<LanguagePage />} />
            <Route path="/alan/:fieldId" element={<FieldPage />} />
            <Route path="/konu/:languageId/:topicId" element={<TopicPage />} />
            <Route path="/deneme" element={<Navigate to="/makaleler" replace />} />
            <Route path="/ornekler" element={<Navigate to="/makaleler" replace />} />
            <Route path="/hatalar" element={<ErrorsPage />} />
            <Route path="/hatalar/:errorId" element={<ErrorDetailPage />} />
            <Route path="/sistemler" element={<ProjectsPage />} />
            <Route path="/sistemler/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projeler" element={<Navigate to="/sistemler" replace />} />
            <Route path="/projeler/:projectId" element={<ProjectDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
