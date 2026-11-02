import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="İçerik yolu">
      <Link to="/" title="Ana sayfa"><Home size={14} /><span className="sr-only">Ana sayfa</span></Link>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}><ChevronRight size={13} />{item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</span>
      ))}
    </nav>
  );
}
