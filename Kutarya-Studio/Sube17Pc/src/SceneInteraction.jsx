import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { evaluateInteraction } from './sceneInteractionRules.js';
import './scene-interaction.css';

const SceneContext = createContext({ image: null });
const assetUrl = image => image?.startsWith('.') || image?.startsWith('/') ? image : `./assets/${image}`;

export function SceneStage({ image, label, children, className = '' }) {
  return <SceneContext.Provider value={{ image }}><section className={`scene-viewport ${className}`} aria-label={label}>
    <div className="scene-stage"><img className="scene-art" src={assetUrl(image)} alt={label} draggable="false" />{children}</div>
  </section></SceneContext.Provider>;
}

// Şekil yalnız nesne görselini keser; görünmez tıklama alanı hiçbir zaman çizilmez.
export function Hotspot({ id, type = 'Item', target, label, tooltip, box, game, enabled, visible, npcId, phases, minDay, maxDay, minMinute, maxMinute, once = false, onActivate, image, sprite, shape, className = '', children, style, onFocus, onBlur, onPointerEnter, onPointerLeave }) {
  const scene = useContext(SceneContext);
  const [consumed, setConsumed] = useState(new Set());
  const state = evaluateInteraction({ id, enabled, visible, npcId, phases, minDay, maxDay, minMinute, maxMinute, once }, game || {}, consumed);
  const [x, y, w, h] = box;
  const background = image || scene.image;
  if (!state.visible) return null;
  const clip = shape || 'inset(1% round 2%)';
  const cropStyle = background ? { backgroundImage: `url("${assetUrl(background)}")`, backgroundSize: `${10000 / w}% ${10000 / h}%`, backgroundPosition: `${w === 100 ? 0 : x / (100 - w) * 100}% ${h === 100 ? 0 : y / (100 - h) * 100}%`, clipPath: clip } : {};
  return <button type="button" className={`world-hotspot ${className}`} data-interaction-id={id} data-interaction-type={type} data-target={target || npcId || id} aria-label={label} aria-disabled={!state.enabled}
    style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, ...style }}
    onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onFocus={onFocus} onBlur={onBlur}
    onClick={() => { if (!state.enabled) return; const result = onActivate?.(target); if (once && result !== false) setConsumed(prev => new Set(prev).add(id)); }}>
    {!children && !sprite && background && <span className="world-hotspot__crop" style={cropStyle} aria-hidden="true" />}
    {sprite && <img className="world-hotspot__sprite" src={assetUrl(sprite)} alt="" draggable="false" />}
    {children && <span className="world-hotspot__content">{children}</span>}
    <span className="world-hotspot__tip" aria-hidden="true">{tooltip || label}<span>{state.enabled ? type === 'Door' ? ' ↗' : ' · tıkla' : ' · şu an kapalı'}</span></span>
  </button>;
}

export function SceneDialog({ title, onClose, children, size = 'normal' }) {
  const ref = useRef(null); const titleId = useId(); const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const world = document.querySelector('.gameplay');
    const wasInert = world?.inert;
    if (world) world.inert = true;
    ref.current?.querySelector('button')?.focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeRef.current(); }
      if (event.key === 'Tab') {
        const controls = [...ref.current.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]')].filter(el => !el.hidden && el.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', keydown, true);
    return () => { window.removeEventListener('keydown', keydown, true); if (world) world.inert = wasInert; if (previous?.isConnected) previous.focus(); };
  }, []);
  return createPortal(<div className="scene-dialog-shade" onPointerDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} data-scene-dialog className={`scene-dialog scene-dialog--${size}`}>
      <header className="scene-dialog-heading"><div><small>ŞUBE 17</small><h2 id={titleId}>{title}</h2></div><button onClick={onClose} aria-label="Kapat ve sahneye dön">Kapat <span>×</span></button></header>
      <div className="scene-dialog-content">{children}</div>
    </section>
  </div>, document.body);
}
