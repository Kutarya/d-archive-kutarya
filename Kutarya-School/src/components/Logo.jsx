import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''}`} to="/" aria-label="Kutarya ana sayfa">
      <span className="brand__mark" aria-hidden="true">
        <img src="/brand/logo-mark.svg" alt="" />
      </span>
      <span className="brand__text">
        <strong>Kutarya</strong>
        {!compact && <small>Yazılım kütüphanesi</small>}
      </span>
    </Link>
  );
}
