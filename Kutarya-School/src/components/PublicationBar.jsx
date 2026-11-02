import { CalendarDays, FileText, ShieldCheck, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTurkishDate } from '../data/siteConfig';

export default function PublicationBar({ contentClass, updatedAt, markdownPath }) {
  return (
    <div className="resource-publication-bar" aria-label="Yayın bilgisi">
      <span><Tags size={15} /><small>İçerik sınıfı</small><strong>{contentClass}</strong></span>
      <span><CalendarDays size={15} /><small>Son güncelleme</small><strong>{formatTurkishDate(updatedAt)}</strong></span>
      <a href={markdownPath}><FileText size={15} /><small>Makine-okunabilir</small><strong>Markdown</strong></a>
      <Link to="/yayin-ilkeleri"><ShieldCheck size={15} /><small>Metodoloji</small><strong>Yayın ilkeleri</strong></Link>
    </div>
  );
}
