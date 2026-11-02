import { useEffect, useRef, useState } from 'react';
import { audioEngine } from './audioEngine.js';
import Street from './Street.jsx';
import Gameplay from './Gameplay.jsx';
import { createGame, loadGame, saveGame, getRecord, DIFFICULTIES as GAME_DIFFICULTIES } from './game/engine.js';
import './illustrated.css';

const LOGO_PATH = './assets/logo-sube17.png';
const STREET_PATH = './assets/street-illustrated.png';
const STREET_HUB_PATH = STREET_PATH;
const SPLASH_DURATION = 3600;
const AUDIO_SETTINGS_KEY = 'sube17.audio-settings';
const TRANSITION_CLOSE_DURATION = 520;
const TRANSITION_OPEN_DURATION = 680;
const DEFAULT_AUDIO_SETTINGS = {
  musicEnabled: true,
  musicVolume: 0.28,
  effectsEnabled: true,
  effectsVolume: 0.62,
  ambienceEnabled: true,
  ambienceVolume: 0.42,
  source: 'default',
};
const DIFFICULTIES = GAME_DIFFICULTIES.map((option, i) => ({ ...option, number: String(i + 1).padStart(2, '0') }));


function loadAudioSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY));
    const loaded = { ...DEFAULT_AUDIO_SETTINGS };
    for (const key of ['musicEnabled', 'effectsEnabled', 'ambienceEnabled']) {
      if (typeof savedSettings?.[key] === 'boolean') loaded[key] = savedSettings[key];
    }
    for (const key of ['musicVolume', 'effectsVolume', 'ambienceVolume']) {
      if (typeof savedSettings?.[key] === 'number' && Number.isFinite(savedSettings[key])) loaded[key] = Math.max(0, Math.min(1, savedSettings[key]));
    }
    loaded.source = savedSettings?.source === 'custom' ? 'custom' : 'default';
    return loaded;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

function VolumeControl({ label, value, disabled, onChange }) {
  const percentage = Math.round(value * 100);

  return (
    <label className={'volume-control' + (disabled ? ' is-muted' : '')}>
      <span>{label}</span>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={percentage}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value) / 100)}
      />
      <output>{percentage}</output>
    </label>
  );
}

function StreetSettingsLayer({
  audioSettings,
  customMusic,
  musicError,
  onClose,
  onUpdate,
  onSelectMusic,
  onUseDefaultMusic,
}) {
  return (
    <section className="settings-layer" aria-label="Sokak ayarları">
      <button
        className="settings-backdrop"
        type="button"
        aria-label="Ayarları kapat"
        onClick={onClose}
      />

      <div
        className="settings-panel settings-panel--street"
        role="dialog"
        aria-modal="true"
        aria-labelledby="street-settings-title"
      >
        <header className="settings-header">
          <div>
            <span>SOKAK / SES VE GÖRÜNTÜ</span>
            <h2 id="street-settings-title">AYARLAR</h2>
          </div>
          <button type="button" aria-label="Ayarları kapat" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="settings-content">
          <div className="setting-toggle">
            <div>
              <strong>ARKA PLAN MÜZİĞİ</strong>
              <small>Seçili müzik kesintisiz devam eder</small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                aria-label="Arka plan müziğini aç veya kapat"
                checked={audioSettings.musicEnabled}
                onChange={(event) =>
                  onUpdate('musicEnabled', event.target.checked)
                }
              />
              <span aria-hidden="true" />
            </label>
          </div>

          <VolumeControl
            label="MÜZİK SEVİYESİ"
            value={audioSettings.musicVolume}
            disabled={!audioSettings.musicEnabled}
            onChange={(value) => onUpdate('musicVolume', value)}
          />

          <div className="setting-toggle setting-toggle--effects">
            <div>
              <strong>ARAYÜZ SES EFEKTLERİ</strong>
              <small>Menü, bina ve kontrol hover sesleri</small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                aria-label="Arayüz ses efektlerini aç veya kapat"
                checked={audioSettings.effectsEnabled}
                onChange={(event) =>
                  onUpdate('effectsEnabled', event.target.checked)
                }
              />
              <span aria-hidden="true" />
            </label>
          </div>

          <VolumeControl
            label="EFEKT SEVİYESİ"
            value={audioSettings.effectsVolume}
            disabled={!audioSettings.effectsEnabled}
            onChange={(value) => onUpdate('effectsVolume', value)}
          />

          <div className="setting-toggle setting-toggle--ambience">
            <div>
              <strong>SOKAK ORTAM SESLERİ</strong>
              <small>Rüzgâr, uzak trafik ve şehir uğultusu</small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                aria-label="Sokak ortam seslerini aç veya kapat"
                checked={audioSettings.ambienceEnabled}
                onChange={(event) =>
                  onUpdate('ambienceEnabled', event.target.checked)
                }
              />
              <span aria-hidden="true" />
            </label>
          </div>

          <VolumeControl
            label="ORTAM SEVİYESİ"
            value={audioSettings.ambienceVolume}
            disabled={!audioSettings.ambienceEnabled}
            onChange={(value) => onUpdate('ambienceVolume', value)}
          />

          <div className="street-music-source">
            <span>AKTİF MÜZİK</span>
            <strong>
              {audioSettings.source === 'custom' && customMusic
                ? customMusic.name
                : 'ŞUBE 17 — VARSAYILAN'}
            </strong>
            <div>
              <button type="button" onClick={onUseDefaultMusic}>
                VARSAYILAN
              </button>
              <button type="button" onClick={onSelectMusic}>
                BİLGİSAYARDAN SEÇ
              </button>
            </div>
            {musicError && <p className="music-error">{musicError}</p>}
          </div>
        </div>

        <footer className="settings-footer">
          <span>DEĞİŞİKLİKLER OTOMATİK KAYDEDİLİR</span>
          <button type="button" onClick={onClose}>OYUNA DÖN</button>
        </footer>
      </div>
    </section>
  );
}

function ExitDecisionLayer({ onCancel, onMainMenu, onDesktop }) {
  return (
    <section className="exit-layer" aria-label="Çıkış seçenekleri">
      <button
        className="exit-backdrop"
        type="button"
        aria-label="Çıkış ekranını kapat"
        onClick={onCancel}
      />
      <div
        className="exit-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
      >
        <span className="exit-panel__index">ŞUBE 17 / OTURUM</span>
        <h2 id="exit-title">AYRILMAK MI İSTİYORSUN?</h2>
        <p>İlerlemen bu cihazda otomatik kaydedilir. Ana menüde vardiya duraklatılır.</p>
        <div className="exit-actions">
          <button type="button" onClick={onCancel}>OYUNA DÖN</button>
          <button type="button" onClick={onMainMenu}>ANA MENÜ</button>
          <button className="is-danger" type="button" onClick={onDesktop}>
            MASAÜSTÜNE ÇIK
          </button>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [transitionState, setTransitionState] = useState('idle');
  const [notice, setNotice] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [audioSettings, setAudioSettings] = useState(loadAudioSettings);
  const [customMusic, setCustomMusic] = useState(null);
  const [musicError, setMusicError] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('normal');
  const [setupError, setSetupError] = useState('');
  const [restored] = useState(() => loadGame());
  const [gameProfile, setGameProfile] = useState(restored.game);
  const [saveError, setSaveError] = useState(restored.error || '');
  const [location, setLocation] = useState(restored.game?.location || 'home');
  const noticeTimer = useRef(null);
  const transitionTimers = useRef([]);
  const transitionBusy = useRef(false);
  const customAudio = useRef(null);

  useEffect(() => {
    const street = new Image();
    street.src = STREET_PATH;
    const streetHub = new Image();
    streetHub.src = STREET_HUB_PATH;

    const splashTimer = window.setTimeout(() => {
      setScreen((current) => current === 'splash' ? 'menu' : current);
    }, SPLASH_DURATION);

    return () => window.clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    customAudio.current = new Audio();
    customAudio.current.loop = true;
    customAudio.current.preload = 'metadata';

    const restoreCustomMusic = async () => {
      const selection = await window.sube17?.getSelectedMusic?.();

      if (selection) {
        setCustomMusic(selection);
      } else {
        setAudioSettings((current) => ({ ...current, source: 'default' }));
      }
    };

    void restoreCustomMusic();

    return () => {
      customAudio.current?.pause();
      customAudio.current = null;
      audioEngine.stopDefaultMusic();
      audioEngine.stopStreetAmbience();
      window.clearTimeout(noticeTimer.current);
      transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings)); } catch { setMusicError('Ses ayarları bu cihazda kaydedilemedi.'); }
    audioEngine.setMusicVolume(audioSettings.musicVolume);
    audioEngine.setEffectsVolume(
      audioSettings.effectsEnabled ? audioSettings.effectsVolume : 0,
    );
    audioEngine.setAmbienceVolume(
      audioSettings.ambienceEnabled ? audioSettings.ambienceVolume : 0,
    );

    if (customAudio.current) {
      customAudio.current.volume = audioSettings.musicVolume;
    }
  }, [audioSettings]);

  useEffect(() => {
    const selectedAudio = customAudio.current;

    if (!audioSettings.musicEnabled) {
      audioEngine.stopDefaultMusic();
      selectedAudio?.pause();
      return;
    }

    if (audioSettings.source === 'custom' && customMusic?.source && selectedAudio) {
      audioEngine.stopDefaultMusic();

      if (selectedAudio.src !== customMusic.source) {
        selectedAudio.src = customMusic.source;
      }

      selectedAudio.volume = audioSettings.musicVolume;
      void selectedAudio.play().catch(() => {
        setMusicError('Müzik başlatılamadı. Dosyanın hâlâ bilgisayarda olduğunu kontrol et.');
      });
      return;
    }

    selectedAudio?.pause();
    audioEngine.startDefaultMusic();
  }, [
    audioSettings.musicEnabled,
    audioSettings.musicVolume,
    audioSettings.source,
    customMusic,
  ]);

  useEffect(() => {
    if (screen === 'street' && audioSettings.ambienceEnabled) {
      audioEngine.startStreetAmbience();
      return;
    }

    audioEngine.stopStreetAmbience();
  }, [
    screen,
    audioSettings.ambienceEnabled,
    audioSettings.ambienceVolume,
  ]);

  useEffect(() => {
    if (!gameProfile) return;
    const result = saveGame(gameProfile);
    setSaveError(result?.error || (result === false ? 'Kayıt yazılamadı. Depolama alanını kontrol et.' : ''));
  }, [gameProfile]);

  useEffect(() => {
    const modal = document.querySelector('[role="dialog"]');
    const previous = document.activeElement;
    const focusables = () => modal ? [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), [tabindex="0"]')].filter((el) => el.getClientRects().length) : [];
    focusables()[0]?.focus();
    const keydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (settingsOpen) setSettingsOpen(false);
        else if (exitOpen) setExitOpen(false);
        else if (screen === 'street' || screen === 'play') setExitOpen(true);
        else if (screen === 'setup') transitionTo('menu');
      }
      if (event.key === 'Tab' && modal) {
        const items = focusables();
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); if (modal && previous?.isConnected) previous.focus(); };
  }, [settingsOpen, exitOpen, screen]);

  const navigate = (nextLocation) => {
    if (transitionBusy.current) return;
    if (gameProfile?.phase === 'working' && nextLocation !== 'bank') return;
    transitionTo(nextLocation === 'street' ? 'street' : 'play', () => {
      setLocation(nextLocation);
      setGameProfile((game) => ({ ...game, location: nextLocation }));
    });
  };

  const continueGame = () => {
    if (!gameProfile) { showNoSaveNotice(); return; }
    playConfirm();
    const target = ['working', 'report'].includes(gameProfile.phase) ? 'bank' : gameProfile.location || 'home';
    setLocation(target);
    transitionTo(target === 'street' && gameProfile.phase !== 'gameover' ? 'street' : 'play');
  };

  const updateAudioSetting = (key, value) => {
    setAudioSettings((current) => ({ ...current, [key]: value }));
  };

  const showNotice = (message) => {
    setNotice(message);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 2600);
  };

  const playHover = () => {
    if (audioSettings.effectsEnabled) {
      audioEngine.playHover();
    }
  };

  const playLocationHover = (index) => {
    if (audioSettings.effectsEnabled) {
      audioEngine.playLocationHover(index);
    }
  };

  const playConfirm = () => {
    if (audioSettings.effectsEnabled) {
      audioEngine.playConfirm();
    }
  };

  const transitionTo = (nextScreen, onSwitch) => {
    if (transitionBusy.current) {
      return;
    }

    transitionBusy.current = true;
    setTransitionState('closing');

    const closeTimer = window.setTimeout(() => {
      onSwitch?.();
      setScreen(nextScreen);
      setTransitionState('opening');

      const openTimer = window.setTimeout(() => {
        setTransitionState('idle');
        transitionBusy.current = false;
      }, TRANSITION_OPEN_DURATION);

      transitionTimers.current.push(openTimer);
    }, TRANSITION_CLOSE_DURATION);

    transitionTimers.current.push(closeTimer);
  };

  const startNewGame = () => {
    playConfirm();
    setSettingsOpen(false);
    setSetupError('');
    transitionTo('setup');
  };

  const showNoSaveNotice = () => {
    if (audioSettings.effectsEnabled) {
      audioEngine.playDenied();
    }

    showNotice('Devam edilecek kayıt bulunamadı.');
  };

  const openSettings = () => {
    playConfirm();
    setExitOpen(false);
    setMusicError('');
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
    setMusicError('');
  };

  const openExitScreen = () => {
    playConfirm();
    setSettingsOpen(false);
    setExitOpen(true);
  };

  const returnToMainMenu = () => {
    playConfirm();
    setExitOpen(false);
    setSettingsOpen(false);
    transitionTo('menu');
  };

  const selectCustomMusic = async () => {
    setMusicError('');

    if (!window.sube17?.selectMusic) {
      setMusicError('Yerel müzik seçimi yalnızca Electron uygulamasında kullanılabilir.');
      return;
    }

    const result = await window.sube17.selectMusic();

    if (result?.error) {
      setMusicError(result.error === 'settings-write-failed' ? 'Müzik seçimi kaydedilemedi. Disk erişimini kontrol et.' : result.error === 'dialog-failed' ? 'Dosya seçici açılamadı.' : 'Bu ses dosyası desteklenmiyor.');
      return;
    }

    if (!result?.canceled && result?.selection) {
      setCustomMusic(result.selection);
      setAudioSettings((current) => ({
        ...current,
        musicEnabled: true,
        source: 'custom',
      }));
    }
  };

  const useDefaultMusic = () => {
    setMusicError('');
    setAudioSettings((current) => ({
      ...current,
      musicEnabled: true,
      source: 'default',
    }));
  };

  const useCustomMusic = () => {
    if (!customMusic) {
      void selectCustomMusic();
      return;
    }

    setMusicError('');
    setAudioSettings((current) => ({
      ...current,
      musicEnabled: true,
      source: 'custom',
    }));
  };

  const forgetCustomMusic = async () => {
    const result = await window.sube17?.clearSelectedMusic?.();
    if (result?.cleared === false) { setMusicError('Müzik seçimi kaldırılamadı. Disk erişimini kontrol et.'); return; }
    setCustomMusic(null);
    useDefaultMusic();
  };

  const quitGame = () => {
    playConfirm();

    if (window.sube17?.quit) {
      window.setTimeout(() => window.sube17.quit(), 120);
      return;
    }

    showNotice('Çıkış yalnızca Electron uygulamasında çalışır.');
  };

  const submitNewGame = (event) => {
    event.preventDefault();
    const normalizedName = playerName.trim();

    if (normalizedName.length < 2) {
      setSetupError('Personel adı en az 2 karakter olmalı.');
      return;
    }

    const selectedDifficulty = DIFFICULTIES.find(
      (option) => option.id === difficulty,
    );
    setSetupError('');
    setGameProfile({ ...createGame({ name: normalizedName, difficulty: selectedDifficulty.id }), location: 'home' });
    setLocation('home');
    transitionTo('play');
  };

  let screenContent;

  if (screen === 'splash') {
    screenContent = (
      <main className="splash-screen">
        <div className="paper-noise" aria-hidden="true" />
        <div className="splash-rule splash-rule--top" aria-hidden="true" />
        <div className="splash-rule splash-rule--bottom" aria-hidden="true" />

        <section className="splash-content" aria-label="Şube 17 açılış ekranı">
          <p className="studio-mark">KUTARYA STUDIO SUNAR</p>
          <img className="splash-logo" src={LOGO_PATH} alt="Şube 17" />
          <span className="splash-stamp">PERSONEL GİRİŞİ</span>
        </section>

        <button
          className="splash-skip"
          type="button"
          onClick={() => setScreen('menu')}
        >
          ATLAMAK İÇİN TIKLA
        </button>
      </main>
    );
  } else if (screen === 'setup') {
    screenContent = (
      <main className="new-game-screen">
        <div className="street-world" aria-hidden="true">
          <img className="street-world__base" src={STREET_PATH} alt="" />
          <div className="street-world__atmosphere" />
        </div>
        <div className="new-game-shade" aria-hidden="true" />
        <div className="paper-noise" aria-hidden="true" />

        <form className="new-game-dossier" onSubmit={submitNewGame}>
          <header className="dossier-header">
            <div>
              <span>PERSONEL KAYIT DOSYASI / 17</span>
              <h1>YENİ GÖREV</h1>
            </div>
            <div className="dossier-seal" aria-hidden="true">17</div>
          </header>

          <label className="name-field">
            <span>PERSONEL ADI</span>
            <input
              type="text"
              value={playerName}
              maxLength="24"
              autoFocus
              autoComplete="off"
              aria-label="Personel adı"
              placeholder="ADINIZI YAZIN"
              onChange={(event) => {
                setPlayerName(event.target.value);
                setSetupError('');
              }}
            />
            <small>2–24 karakter · Oyun içindeki kimliğiniz{gameProfile ? " · Yeni görev mevcut kaydın yerini alır." : ""}</small>
          </label>

          <fieldset className="difficulty-field">
            <legend>ZORLUK SEVİYESİ</legend>
            <div className="difficulty-options">
              {DIFFICULTIES.map((option) => (
                <label
                  className={
                    'difficulty-card' +
                    (difficulty === option.id ? ' is-selected' : '')
                  }
                  key={option.id}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={option.id}
                    checked={difficulty === option.id}
                    onChange={() => setDifficulty(option.id)}
                  />
                  <span className="difficulty-card__number">{option.number}</span>
                  <strong>{option.label}</strong>
                  <small>{option.note}</small>
                  <span className="difficulty-card__money">
                    {option.money.toLocaleString('tr-TR')} KT
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="dossier-footer">
            <button
              className="secondary-action"
              type="button"
              onClick={() => transitionTo('menu')}
            >
              GERİ
            </button>
            <p className={'setup-error' + (setupError ? ' is-visible' : '')}>
              {setupError || 'Personel adı gerekli'}
            </p>
            <button className="primary-action" type="submit">
              DEVAM
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </main>
    );
  } else if ((screen === 'street' || screen === 'play') && gameProfile) {
    screenContent = <>
      <div inert={settingsOpen || exitOpen ? true : undefined}>
        {screen === 'street' && gameProfile.phase !== 'gameover'
          ? <Street game={gameProfile} onNavigate={navigate} onSettings={openSettings} onExit={openExitScreen} onHover={playLocationHover} onConfirm={playConfirm} />
          : <Gameplay game={gameProfile} location={location} onChange={setGameProfile} onNavigate={navigate} onExit={returnToMainMenu} onSettings={openSettings} />}
      </div>
      {settingsOpen && <StreetSettingsLayer audioSettings={audioSettings} customMusic={customMusic} musicError={musicError} onClose={closeSettings} onUpdate={updateAudioSetting} onSelectMusic={() => void selectCustomMusic()} onUseDefaultMusic={useDefaultMusic} />}
      {exitOpen && <ExitDecisionLayer onCancel={() => setExitOpen(false)} onMainMenu={returnToMainMenu} onDesktop={quitGame} />}
    </>;
  } else {
    screenContent = (
      <main className="main-menu">
        <img className="street-background" src={STREET_PATH} alt="" />
        <div className="scene-shade" aria-hidden="true" />
        <div className="paper-noise paper-noise--menu" aria-hidden="true" />

        <header className="menu-brand illustrated-brand">
          <span>KUTARYA STUDIO SUNAR</span>
          <h1>ŞUBE <b>17</b></h1>
          <div className="brand-rule" />
          <p>Her damga akşam eve döner.</p>
          <small>Bir imparatorluk değişir. Hayat devam etmek zorunda.</small>
        </header>

        <nav className="menu-actions" aria-label="Ana menü">
          <button type="button" onMouseEnter={playHover} onClick={startNewGame}>
            <span className="button-number">01</span>
            <span>YENİ OYUN</span>
          </button>

          <button
            className={gameProfile ? '' : 'is-disabled'}
            type="button"
            aria-disabled={!gameProfile}
            onMouseEnter={playHover}
            onClick={continueGame}
          >
            <span className="button-number">02</span>
            <span>DEVAM ET</span>
            <small>{gameProfile ? `${gameProfile.day}. GÜN` : 'KAYIT YOK'}</small>
          </button>

          <button type="button" onMouseEnter={playHover} onClick={openSettings}>
            <span className="button-number">03</span>
            <span>AYARLAR</span>
          </button>

          <button type="button" onMouseEnter={playHover} onClick={quitGame}>
            <span className="button-number">04</span>
            <span>ÇIKIŞ</span>
          </button>
        </nav>

        <div
          className={'menu-notice' + (notice ? ' is-visible' : '')}
          aria-live="polite"
        >
          {notice}
        </div>

        {settingsOpen && (
          <section className="settings-layer" aria-label="Ses ayarları">
            <button
              className="settings-backdrop"
              type="button"
              aria-label="Ayarları kapat"
              onClick={closeSettings}
            />

            <div
              className="settings-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
            >
              <header className="settings-header">
                <div>
                  <span>03 / SES SİSTEMİ</span>
                  <h2 id="settings-title">AYARLAR</h2>
                </div>
                <button
                  type="button"
                  aria-label="Ayarları kapat"
                  onClick={closeSettings}
                >
                  ×
                </button>
              </header>

              <div className="settings-content">
                <div className="setting-toggle">
                  <div>
                    <strong>ARKA PLAN MÜZİĞİ</strong>
                    <small>Menü boyunca kesintisiz çalar</small>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      aria-label="Arka plan müziğini aç veya kapat"
                      checked={audioSettings.musicEnabled}
                      onChange={(event) =>
                        updateAudioSetting('musicEnabled', event.target.checked)
                      }
                    />
                    <span aria-hidden="true" />
                  </label>
                </div>

                <VolumeControl
                  label="MÜZİK SEVİYESİ"
                  value={audioSettings.musicVolume}
                  disabled={!audioSettings.musicEnabled}
                  onChange={(value) => updateAudioSetting('musicVolume', value)}
                />

                <div className="setting-toggle setting-toggle--effects">
                  <div>
                    <strong>ARAYÜZ SES EFEKTLERİ</strong>
                    <small>Menü, bina ve kontrol hover sesleri</small>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      aria-label="Arayüz ses efektlerini aç veya kapat"
                      checked={audioSettings.effectsEnabled}
                      onChange={(event) =>
                        updateAudioSetting('effectsEnabled', event.target.checked)
                      }
                    />
                    <span aria-hidden="true" />
                  </label>
                </div>

                <VolumeControl
                  label="EFEKT SEVİYESİ"
                  value={audioSettings.effectsVolume}
                  disabled={!audioSettings.effectsEnabled}
                  onChange={(value) => updateAudioSetting('effectsVolume', value)}
                />

                <div className="setting-toggle setting-toggle--ambience">
                  <div>
                    <strong>SOKAK ORTAM SESLERİ</strong>
                    <small>Rüzgâr, uzak trafik ve şehir uğultusu</small>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      aria-label="Sokak ortam seslerini aç veya kapat"
                      checked={audioSettings.ambienceEnabled}
                      onChange={(event) =>
                        updateAudioSetting('ambienceEnabled', event.target.checked)
                      }
                    />
                    <span aria-hidden="true" />
                  </label>
                </div>

                <VolumeControl
                  label="ORTAM SEVİYESİ"
                  value={audioSettings.ambienceVolume}
                  disabled={!audioSettings.ambienceEnabled}
                  onChange={(value) => updateAudioSetting('ambienceVolume', value)}
                />

                <div className="music-source">
                  <div className="music-source__heading">
                    <span>MÜZİK KAYNAĞI</span>
                    <small>MP3 · WAV · OGG · M4A · AAC · FLAC</small>
                  </div>

                  <button
                    className={audioSettings.source === 'default' ? 'is-selected' : ''}
                    type="button"
                    onClick={useDefaultMusic}
                  >
                    <span className="source-mark">17</span>
                    <span>
                      <strong>ŞUBE 17 — VARSAYILAN</strong>
                      <small>Sözsüz bürokratik noir</small>
                    </span>
                    <span className="source-state">
                      {audioSettings.source === 'default' ? 'SEÇİLİ' : 'SEÇ'}
                    </span>
                  </button>

                  <button
                    className={audioSettings.source === 'custom' ? 'is-selected' : ''}
                    type="button"
                    onClick={useCustomMusic}
                  >
                    <span className="source-mark">♪</span>
                    <span>
                      <strong>{customMusic?.name || 'BİLGİSAYARDAN MÜZİK SEÇ'}</strong>
                      <small>
                        {customMusic ? 'Yerel ses dosyası' : 'Dosya seçiciyi açar'}
                      </small>
                    </span>
                    <span className="source-state">
                      {audioSettings.source === 'custom' ? 'SEÇİLİ' : 'SEÇ'}
                    </span>
                  </button>

                  <div className="music-source__actions">
                    <button type="button" onClick={() => void selectCustomMusic()}>
                      {customMusic ? 'BAŞKA DOSYA SEÇ' : 'DOSYA SEÇ'}
                    </button>
                    {customMusic && (
                      <button type="button" onClick={() => void forgetCustomMusic()}>
                        YEREL SEÇİMİ KALDIR
                      </button>
                    )}
                  </div>

                  {musicError && <p className="music-error">{musicError}</p>}
                </div>
              </div>

              <footer className="settings-footer">
                <span>DEĞİŞİKLİKLER OTOMATİK KAYDEDİLİR</span>
                <button type="button" onClick={closeSettings}>GERİ DÖN</button>
              </footer>
            </div>
          </section>
        )}

        <footer className="menu-footer">
          <span>KUTARYA STUDIO</span>
          <span>YEREL OYNANABİLİR SÜRÜM · REKOR {getRecord()} GÜN</span>
        </footer>
      </main>
    );
  }

  return (
    <>
      {screenContent}
      {saveError && <div className="save-warning" role="alert">{saveError}</div>}
      {restored.recovered && screen === 'menu' && <div className="recovery-notice" role="status">Son sağlam yedekten devam edebilirsin.</div>}
      <div
        className={`screen-transition screen-transition--${transitionState}`}
        aria-hidden="true"
      >
        <span />
      </div>
    </>
  );
}
