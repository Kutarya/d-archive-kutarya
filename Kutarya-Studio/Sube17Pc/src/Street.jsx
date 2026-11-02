import { useEffect, useState } from 'react';
import { formatTime } from './game/engine.js';
import { Hotspot } from './SceneInteraction.jsx';
import './street.css';

// Taban resim ve bütün etkileşim katmanları aynı koordinat uzayını kullanır.
// Kapılar resimden kesilmez; boş portalların içine ayrı menteşeli kanatlar çizilir.
export const BUILDINGS = [
  { id: 'home', name: 'Ev', subtitle: 'Seni bekleyen bir hayat.', key: '1', box: [5.8, 43.9, 8.2, 27.7], door: [6.4, 44.5, 7, 26.5], color: '#6c4931', light: '#efb85e' },
  { id: 'bar', name: 'Bar', subtitle: 'Biraz sessizlik satın al.', key: '2', box: [28.65, 50.73, 5.51, 18.31], door: [29.25, 51.33, 4.31, 17.11], color: '#753c32', light: '#d9a253' },
  { id: 'casino', name: 'Kazino', subtitle: 'Masanın her zaman bir payı var.', key: '3', box: [46.83, 50.41, 6.28, 14.48], door: [47.43, 51.01, 5.08, 13.28], color: '#7c3a30', light: '#e5b45b' },
  { id: 'pharmacy', name: 'Eczane', subtitle: 'İlaç, ihtiyacı olana.', key: '4', box: [67.34, 52.85, 5.09, 16.5], door: [67.94, 53.45, 3.89, 15.3], color: '#465e4c', light: '#b6c99d' },
  { id: 'bank', name: 'Banka', subtitle: 'Bankanın parası. Senin bedelin.', key: '5', box: [85.64, 43.93, 7.54, 25.43], door: [86.24, 44.53, 6.34, 24.23], color: '#6a573b', light: '#ecd199' },
];
export const MARKET_STALL = { id: 'market', name: 'Büfe', key: '6', subtitle: 'Bir somun ekmek, eve dönen bir umut.', box: [20, 74, 11, 13] };
const DESTINATIONS = [...BUILDINGS, MARKET_STALL];

// Kapı kanatlarıyla aynı mürekkepli çizim dili; arabanın kendisi erişim nesnesidir.
function MarketCart() {
  return <svg className="market-cart" viewBox="0 0 240 160" aria-hidden="true">
    <ellipse cx="122" cy="149" rx="108" ry="9" fill="#1d221b" opacity=".28" />
    <g stroke="#28271e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M199 89L228 82L234 87L200 100" fill="#8b6840" />
      <path d="M30 127L32 146M183 121L185 141" fill="none" strokeWidth="5" />
      <path d="M23 66L180 60L209 79L48 90Z" fill="#9b7950" />
      <path d="M48 87L207 77L202 124L47 138Z" fill="#765235" />
      <path d="M23 66L49 88L47 138L25 119Z" fill="#5a442e" />
      <path d="M26 86L46 104M26 106L46 124M51 105L205 94M50 122L203 111" fill="none" stroke="#3f3525" strokeWidth="1.8" />
      <path d="M54 91L201 81M55 108L201 98M55 126L197 114" fill="none" stroke="#ba925c" strokeWidth="1.2" />
      <path d="M26 66L49 87L208 77L206 85L48 96L25 74Z" fill="#af8854" />
      <path d="M57 128L61 96M180 118L183 88" stroke="#38362a" strokeWidth="4" />
      <g fill="#37362a"><circle cx="70" cy="139" r="15" /><circle cx="176" cy="131" r="14" /></g>
      <g fill="#aa8857"><circle cx="70" cy="139" r="11" /><circle cx="176" cy="131" r="10" /></g>
      <path d="M70 129V149M60 139H80M63 132L77 146M63 146L77 132M176 122V140M167 131H185M170 125L182 137M170 137L182 125" strokeWidth="1.6" />
      <g fill="#302e23"><circle cx="70" cy="139" r="3" /><circle cx="176" cy="131" r="3" /></g>
      <path d="M36 65C31 48 38 37 45 30L42 22L64 20L61 29C76 37 84 51 75 68Z" fill="#b4a27a" />
      <path d="M43 29L61 28M40 36C45 41 45 52 41 59M62 37L70 57M48 25L57 24" fill="none" stroke="#776c4e" strokeWidth="1.5" />
      <path d="M80 69C78 54 86 39 96 38L109 40C121 45 124 56 119 72Z" fill="#b78745" />
      <path d="M85 56L94 43M98 63L108 43M111 67L117 53" fill="none" stroke="#e5bf78" strokeWidth="4" />
      <path d="M105 74C106 64 127 46 138 46C151 44 156 49 151 58C147 66 129 78 117 80Z" fill="#bd8f4c" />
      <path d="M119 65L123 71M130 56L136 62M141 50L147 54" fill="none" stroke="#e6c184" strokeWidth="4" />
      <path d="M153 73L154 41L181 38L189 67Z" fill="#66744d" />
      <path d="M155 44L183 42M158 49L178 47M159 59L178 57" stroke="#939a69" strokeWidth="1.5" />
      <path d="M141 31L184 28L188 49L143 53Z" fill="#d3bd8b" />
      <path d="M145 31L185 29" stroke="#eddbb3" strokeWidth="1" />
    </g>
    <text x="164" y="44" textAnchor="middle" fill="#38352a" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" transform="rotate(-5 164 41)">BÜFE</text>
  </svg>;
}

function DoorLeaf({ side, type }) {
  return <span className={`ink-door__leaf ink-door__leaf--${side}`}>
    <svg viewBox="0 0 60 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M1 1H59V259H1Z" fill="var(--door-color)" stroke="#201d18" strokeWidth="2.6" />
      <path d="M7 9H53V133H7Z" fill={type === 'pharmacy' ? '#acb69a' : '#a29268'} stroke="#28251e" strokeWidth="2.2" />
      <path d="M11 13H49V128H11Z" fill="#3b4035" opacity=".8" />
      <path d="M13 19L29 15L29 120L13 124Z" fill="#c5b07a" opacity=".16" />
      <path d="M30 11V132M8 72H52" fill="none" stroke="#24221c" strokeWidth="2.2" />
      <path d="M7 163H53V248H7Z M12 169H48V241H12Z" fill="none" stroke="#2d291f" strokeWidth="2.3" />
      <path d="M8 163H53V248" fill="none" stroke="#cfac67" strokeWidth="1" opacity=".6" />
      <path d={side === 'left' ? 'M50 140v18' : 'M10 140v18'} stroke="#201c16" strokeWidth="6" />
      <path d={side === 'left' ? 'M50 141v14' : 'M10 141v14'} stroke="#cbaa62" strokeWidth="3" />
      <path d="M3 4V255M58 4V254" stroke="#b29561" opacity=".35" />
    </svg>
  </span>;
}

function Meter({ label, value, tone }) {
  return <div className={`ink-meter ink-meter--${tone}`} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <span>{label}</span><strong>{Math.round(value)}<small>%</small></strong>
    <div className="ink-meter__track"><i style={{ width: `${value}%` }} /></div>
  </div>;
}

export default function Street({ game, onNavigate, onSettings, onExit, onHover, onConfirm }) {
  const [active, setActive] = useState(null);
  const [departing, setDeparting] = useState(null);
  const evening = game.phase === 'evening';
  const chosen = DESTINATIONS.find((b) => b.id === active);
  const go = (id) => {
    if (departing || (id === 'bank' && evening)) return;
    onConfirm?.();
    setDeparting(id);
    onNavigate(id);
  };
  const hover = (id) => {
    setActive(id);
    if (id) onHover?.(DESTINATIONS.findIndex((b) => b.id === id));
  };
  useEffect(() => {
    const keydown = (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey || event.target.closest('input, textarea, [role="dialog"]')) return;
      const target = BUILDINGS[Number(event.key) - 1];
      if (target) go(target.id);
      if (event.key === '6') go('market');
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });

  return <main className={`illustrated-street ${evening ? 'is-evening' : ''}`} aria-label="İmparatorluk Meydanı">
    <div className="illustrated-stage">
      <img className="illustrated-stage__art" src="./assets/street-illustrated.png" alt="Solda ev ve bar, karşıda kazino, sağda eczane ve Şube 17 bankasının bulunduğu çizimli imparatorluk meydanı." draggable="false" />
      <div className="street-time-light" aria-hidden="true" />
      <div className="street-lamppulse" aria-hidden="true" />
      <div className="autumn-leaves" aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>

      <section className="ink-destinations" aria-label="Mekân girişleri">
        {BUILDINGS.map((b) => {
          const [x, y, w, h] = b.box;
          const [dx, dy, dw, dh] = b.door;
          const locked = b.id === 'bank' && evening;
          return <Hotspot key={b.id} id={`street-door-${b.id}`} type="Door" target={b.id} game={game} box={b.box}
            label={`${b.name}${locked ? ' — mesai bitti' : ' — içeri gir'}`} tooltip={locked ? 'Banka · mesai bitti' : b.name} enabled={!locked && !departing}
            className={`ink-destination ink-destination--${b.id} ${active === b.id || departing === b.id ? 'is-active' : ''} ${locked ? 'is-closed' : ''}`}
            style={{ '--door-color': b.color, '--door-light': b.light }}
            onPointerEnter={() => hover(b.id)} onPointerLeave={() => setActive(null)} onFocus={() => hover(b.id)} onBlur={() => setActive(null)} onActivate={go}>
            <span className="ink-door" style={{ left: `${(dx - x) / w * 100}%`, top: `${(dy - y) / h * 100}%`, width: `${dw / w * 100}%`, height: `${dh / h * 100}%` }} aria-hidden="true">
              <span className="ink-door__room"><i /><i /><i /></span>
              <DoorLeaf side="left" type={b.id} /><DoorLeaf side="right" type={b.id} />
              <span className="ink-door__threshold" />
            </span>
          </Hotspot>;
        })}
        <Hotspot id="street-market-cart" type="TravelPoint" target="market" game={game} box={MARKET_STALL.box}
          label="Büfe — erzak arabasına yaklaş" tooltip="Mahalle büfesi" enabled={!departing}
          className={`street-market-cart ${active === 'market' ? 'is-active' : ''}`}
          onPointerEnter={() => hover('market')} onPointerLeave={() => setActive(null)} onFocus={() => hover('market')} onBlur={() => setActive(null)} onActivate={go}>
          <MarketCart />
        </Hotspot>
      </section>

      <header className="square-header">
        <div className="square-chapter"><span className="square-day">{String(game.day).padStart(2, '0')}<small>GÜN</small></span><div><span>KUTARYA EMPIRE</span><h1>İmparatorluk Meydanı</h1><p>{evening ? 'Mesai bitti. Şimdi eve ne götüreceksin?' : 'Şehir uyanıyor. Bir başka gün, bir başka karar.'}</p></div></div>
        <nav className="ink-utilities" aria-label="Oyun menüsü"><button onClick={onSettings} aria-label="Ayarlar" title="Ayarlar">⚙</button><button onClick={onExit} aria-label="Oyun menüsü" title="Oyun menüsü · Esc">☰</button></nav>
      </header>

      <aside className="square-ledger" aria-label="Günlük durum">
        <div className="square-ledger__head"><span>PERSONEL CÜZDANI</span><small>№ 17</small></div>
        <strong className="square-money">{game.money.toLocaleString('tr-TR')} <small>KT</small></strong>
        <div className="square-clock"><span>{formatTime(game.minute)}</span><small>{evening ? 'AKŞAM · SERBEST ZAMAN' : 'SABAH · MESAİYİ BEKLİYOR'}</small></div>
        <Meter label="STRES" value={game.stress} tone="stress" />
        <Meter label="AKIL SAĞLIĞI" value={game.health} tone="health" />
      </aside>

      <div className="square-caption" aria-live="polite"><span>{chosen ? chosen.name.toLocaleUpperCase('tr-TR') : 'BUGÜNÜN NOTU'}</span><p>{chosen ? chosen.subtitle : evening ? 'Ailene uğra. Yeni gün, yatağına döndüğünde başlar.' : 'Bankaya gidip vardiyanı başlat. Saat o zamana kadar 09.00.'}</p></div>
      <footer className="square-bottom">
        <div className="square-personnel"><span>ŞUBE <b>17</b></span><small>{game.profile?.name}</small></div>
        <nav className="square-map" aria-label="Hızlı mekân seçimi">
          {DESTINATIONS.map((b) => <button key={b.id} className={active === b.id ? 'is-active' : ''} aria-disabled={b.id === 'bank' && evening} onMouseEnter={() => hover(b.id)} onMouseLeave={() => setActive(null)} onFocus={() => hover(b.id)} onBlur={() => setActive(null)} onClick={() => go(b.id)}><kbd>{b.key}</kbd>{b.name}<span>↗</span></button>)}
        </nav>
        <span className="square-save">● YEREL KAYIT</span>
      </footer>
    </div>
  </main>;
}
