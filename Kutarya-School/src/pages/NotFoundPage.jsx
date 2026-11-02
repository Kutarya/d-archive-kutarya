import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found content-width"><Compass size={42} /><p className="eyebrow">404</p><h1>Bu kaynak henüz burada değil.</h1><p>Bağlantı değişmiş olabilir veya içerik kataloğa henüz eklenmemiş olabilir.</p><Link className="primary-button" to="/"><ArrowLeft size={17} /> Ana sayfaya dön</Link></div>
  );
}
