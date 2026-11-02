import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Shuffle, Users, Clock3, Gamepad2 } from 'lucide-react';
import { useApp } from '../state';
import { Art } from '../components/Art';
import { nightEntries, nightMoods } from '../game-night.mjs';

function NightCards() {
  return <div className="night-art" aria-hidden="true"><div className="night-orbit"/><div className="night-playing-card back"><b>K<span>♠</span></b><strong>♠</strong></div><div className="night-playing-card front"><b>A<span>♥</span></b><strong>♥</strong><b className="inverted">A<span>♥</span></b></div><div className="night-chip">k.</div><span className="night-art-caption">BİR TUR DAHA.</span></div>;
}
export function GameNightBanner() {
  const { catalog } = useApp();
  if (!nightEntries(catalog.games).length) return null;
  return <section className="night-banner" aria-label="Kutarya Oyun Gecesi"><div className="night-banner-copy"><span className="night-kicker">KUTARYA / OYUN GECESİ</span><h2>Akşamın bir planı olsun.</h2><p>Arkadaşlarla bir masa, kısa bir mola, keşfedilecek bir dünya.<br/>Bir oyun seç. Gerisi akşamın işi.</p><Link to="/oyun-gecesi" className="night-button">Bu akşam ne oynasak? <ArrowUpRight size={18}/></Link></div><NightCards/></section>;
}
export default function GameNight() {
  const { catalog } = useApp();
  const [params, setParams] = useSearchParams(), [picked, setPicked] = useState('');
  const selected = nightMoods.some(m => m.id === params.get('hava')) ? params.get('hava') || '' : '';
  const entries = nightEntries(catalog.games, selected), all = nightEntries(catalog.games);
  const blackjack = all.find(e => e.game.id === 'blackjack');
  const chosen = entries.find(e => e.game.slug === picked);
  function pick() {
    const options = entries.filter(e => e.game.slug !== picked);
    const next = (options.length ? options : entries)[Math.floor(Math.random() * (options.length || entries.length))];
    if (next) setPicked(next.game.slug);
  }
  return <div className="game-night-page">
    <section className="night-hero"><div className="night-hero-copy"><span className="night-kicker"><span/> KUTARYA / OYUN GECESİ</span><h1>Ekranlar ayrı.<br/><em>Akşam ortak.</em></h1><p>Bazen bir kart yeter. Bazen bütün bir dünya.<br/>Küçük bir mola ver, arkadaşını çağır, kendi oyununu bul.</p><div className="night-hero-actions"><a href="#aksamin-oyunu" className="night-button">Bir oyun seç <ArrowRight size={18}/></a>{all.some(e => e.online) && <button className="night-quiet" onClick={() => { setParams({ hava: 'arkadaslarla' }); setPicked(''); document.getElementById('aksamin-oyunu')?.scrollIntoView({ behavior: 'smooth' }); }}>Arkadaşlarla oyna <Users size={16}/></button>}</div><div className="night-hero-foot"><span>HESAP AÇMADAN</span><span>TARAYICIDA</span><span>KENDİ RİTMİNDE</span></div></div><NightCards/></section>
    {blackjack && <section className="night-feature"><div className="night-feature-label"><span>MASADAN BİR DAVET</span><b>01 / BLACKJACK</b></div><div><h2>Royal Night’a hoş geldin.</h2><p>{blackjack.online ? 'Tek başına alıştırma yap, günün beş turunu tamamla veya arkadaşlarınla aynı dağıtıcıya karşı oyna.' : 'Yeşil masada 21’e yaklaş. Kısa bir kart molasına otur, kendi kararını ver.'}</p></div><Link to={`/oyna/${blackjack.game.slug}`} className="button outline">Masaya otur <ArrowUpRight size={18}/></Link></section>}
    <section id="aksamin-oyunu" className="night-selection"><div className="section-heading"><div><span className="eyebrow">AKŞAMIN MENÜSÜ</span><h2>Bugün ne havasındasın?</h2><p>Kurulumla uğraşmadan, katalogdaki gerçek oyunlarla başla.</p></div><button className="button outline" onClick={pick} disabled={!entries.length}><Shuffle size={17}/> Bana bir oyun seç</button></div><div className="night-filters" aria-label="Oyun tarzı">{nightMoods.map(mood => <button key={mood.id} className={mood.id === selected ? 'selected' : ''} aria-pressed={mood.id === selected} onClick={() => { setParams(mood.id ? { hava: mood.id } : {}, { preventScrollReset: true }); setPicked(''); }}>{mood.title}</button>)}</div><div className="night-pick" role="status" aria-live="polite">{chosen ? <><Shuffle size={16}/><span>Bu akşamın seçimi: <b>{chosen.game.title}</b></span><Link to={`/oyna/${chosen.game.slug}`}>Hemen oyna <ArrowUpRight size={15}/></Link></> : <span>{nightMoods.find(m => m.id === selected)?.note} {entries.length} oyun.</span>}</div><div className="night-game-grid">{entries.map(entry => <article key={entry.game.id} className={`night-game ${picked === entry.game.slug ? 'picked' : ''}`}><Link to={`/oyna/${entry.game.slug}`} className="night-game-image" aria-label={`${entry.game.title} oyna`}><Art kind={entry.game.cover}/><span className="night-number">{entry.number}</span><span className="night-play"><ArrowUpRight size={22}/></span></Link><div className="night-game-body"><div className="night-game-meta"><span>{entry.online ? <Users size={13}/> : <Gamepad2 size={13}/>} {entry.modes}</span><span><Clock3 size={13}/>{entry.minutes}</span></div><h3><Link to={`/oyna/${entry.game.slug}`}>{entry.line}</Link></h3><p>{entry.description}</p><div className="night-game-footer"><span>{entry.game.title}</span><Link to={`/proje/${entry.game.slug}`}>İncele <ArrowRight size={14}/></Link></div></div></article>)}</div>{!entries.length && <div className="panel night-empty"><Gamepad2/><h3>Bu tarza uygun yayınlı oyun yok.</h3><button className="button outline" onClick={() => setParams({})}>Tüm oyunları göster</button></div>}</section>
    <section className="night-how"><span className="eyebrow">AKŞAMIN KÜÇÜK RİTÜELİ</span><div><article><span>01</span><h3>Bir oyun bul.</h3><p>Kısa bir tur mu, rekabet mi, keşif mi? Akşamın ritmini sen seç.</p></article><article><span>02</span><h3>Birini çağır.</h3><p>Online oyunlarda bir oda kur, oyunun içindeki davet kodunu arkadaşına gönder.</p></article><article><span>03</span><h3>Bir tur daha.</h3><p>Sanal puan, gerçek bir mola. Dilersen tek başına oyna; hesap açmak gerekmez.</p></article></div><Link to="/projeler">Oyun dışında bir şeyler mi arıyorsun? Tüm projeler <ArrowUpRight size={16}/></Link></section>
  </div>;
}
