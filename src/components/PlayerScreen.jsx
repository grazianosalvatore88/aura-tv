import { useEffect, useMemo, useState } from 'react';
import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';
import StreamVideo from './StreamVideo.jsx';

function SpeakerIcon({ muted = false }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      {muted ? (
        <>
          <path d="m18 9 3 3-3 3" />
          <path d="m21 9-3 3 3 3" />
        </>
      ) : (
        <>
          <path d="M17 9.5a4 4 0 0 1 0 5" />
          <path d="M19.5 7a8 8 0 0 1 0 10" />
        </>
      )}
    </svg>
  );
}

function CaptionsIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M8 12h3" />
      <path d="M13 12h3" />
      <path d="M8 15h5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.8v3" />
      <path d="M12 18.2v3" />
      <path d="M4.35 4.35 6.5 6.5" />
      <path d="m17.5 17.5 2.15 2.15" />
      <path d="M2.8 12h3" />
      <path d="M18.2 12h3" />
      <path d="M4.35 19.65 6.5 17.5" />
      <path d="m17.5 6.5 2.15-2.15" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <span className="pause-symbol" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function PlayIcon() {
  return <span className="play-symbol" aria-hidden="true" />;
}

function PlayerButton({ children, label, className = '', onClick, active = false }) {
  return (
    <button
      type="button"
      className={`player-icon-button ${className} ${active ? 'active' : ''}`}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ColorCommand({ color, label }) {
  return (
    <span className="player-color-command">
      <i className={color} />
      <em>{label}</em>
    </span>
  );
}

export default function PlayerScreen({
  mode = 'movie',
  type = 'film',
  item,
  channel,
  onBack = () => {},
  onCycleQuality = () => {},
  onToggleFavorite = () => {}
}) {
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioPanelOpen, setAudioPanelOpen] = useState(false);
  const [subPanelOpen, setSubPanelOpen] = useState(false);
  const [qualityPanelOpen, setQualityPanelOpen] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [hubVisible, setHubVisible] = useState(true);

  const isLive = mode === 'live';
  const media = item || channel || {};
  const background = media.backdrop || media.background || '';
  const title = isLive ? (media.channel || media.title || 'AURA Player') : (media.title || 'AURA Player');
  const quality = media.selectedQuality || media.selectedResolution || media.quality || media.qualityLabel || 'Auto';

  const topSubtitle = useMemo(() => {
    if (isLive) return `${media.title || 'In onda ora'}${media.time ? ` · ${media.time}` : ''}`;
    if (type === 'series') return `${media.currentEpisode || 'Stagione 1 · Episodio 1'}${media.selectedQuality ? ` · ${media.selectedQuality}` : ''}`;
    return `${media.year || ''}${media.duration ? ` · ${media.duration}` : ''}${media.selectedQuality ? ` · ${media.selectedQuality}` : ''}`;
  }, [isLive, media, type]);

  const nextLabel = media.nextProgram || 'Programma successivo non disponibile';
  const startLabel = media.time?.split(' - ')?.[0] || 'Ora';
  const stopLabel = media.time?.split(' - ')?.[1] || '';

  function revealHub() {
    setHubVisible(true);
  }

  useEffect(() => {
    revealHub();
  }, [media.id]);

  useEffect(() => {
    if (/non disponibile|errore|premi play/i.test(streamStatus || '')) {
      setHubVisible(true);
      return undefined;
    }

    if (paused || settingsOpen || audioPanelOpen || subPanelOpen || qualityPanelOpen) {
      setHubVisible(true);
      return undefined;
    }

    const timer = setTimeout(() => setHubVisible(false), 3800);
    return () => clearTimeout(timer);
  }, [paused, settingsOpen, audioPanelOpen, subPanelOpen, qualityPanelOpen, media.id, hubVisible, streamStatus]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        if (!hubVisible) {
          setHubVisible(true);
        } else {
          onBack();
        }
        return;
      }

      if (event.key === ' ' || event.key === 'Enter' || event.key === 'MediaPlayPause') {
        event.preventDefault();
        setPaused((value) => !value);
        setHubVisible(true);
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        setHubVisible(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hubVisible, onBack]);

  function toggleFullscreen() {
    const root = document.documentElement;
    if (!document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen().then(() => setFullscreenActive(true)).catch(() => setFullscreenActive((value) => !value));
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setFullscreenActive(false)).catch(() => setFullscreenActive((value) => !value));
      return;
    }

    setFullscreenActive((value) => !value);
  }

  function cycleQuality() {
    onCycleQuality();
    setQualityPanelOpen(true);
    revealHub();
  }

  function togglePause() {
    setPaused((value) => !value);
    revealHub();
  }

  return (
    <div
      className={`${isLive ? 'aura-player live-player' : 'aura-player vod-player'} ${hubVisible ? 'hub-visible' : 'hub-hidden'}`}
      onMouseMove={revealHub}
      onClick={revealHub}
      onTouchStart={revealHub}
    >
      <div className="player-video-layer" style={{ '--player-bg': `url(${background})` }}>
        <StreamVideo
          src={media.streamUrl}
          fallbackSrc={media.fallbackStreamUrl}
          poster={media.icon || media.poster || background}
          muted={muted}
          paused={paused}
          streamType={media.streamType}
          onStatusChange={setStreamStatus}
        />
      </div>

      <div className="player-vignette" />

      <button type="button" className="player-back-button" onClick={onBack}>← Indietro</button>

      <section className="player-top-title">
        <span>{isLive ? 'Live TV' : type === 'series' ? 'Serie TV' : 'Film'}</span>
        <h1>{title}</h1>
        <p>{topSubtitle}{streamStatus ? ` · ${streamStatus}` : ''}</p>
      </section>

      <div className="player-top-actions">
        <PlayerButton label="Impostazioni player" active={settingsOpen} onClick={() => {
          setSettingsOpen((value) => !value);
          revealHub();
        }}>
          <SettingsIcon />
        </PlayerButton>
        <PlayerButton label={muted ? 'Attiva audio' : 'Disattiva audio'} active={muted || audioPanelOpen} onClick={() => {
          setMuted((value) => !value);
          setAudioPanelOpen((value) => !value);
          revealHub();
        }}>
          <SpeakerIcon muted={muted} />
        </PlayerButton>
        <PlayerButton label="Sottotitoli" active={subtitles || subPanelOpen} onClick={() => {
          setSubtitles((value) => !value);
          setSubPanelOpen((value) => !value);
          revealHub();
        }}>
          <CaptionsIcon />
        </PlayerButton>
        <button type="button" className={qualityPanelOpen ? 'player-quality-pill active' : 'player-quality-pill'} onClick={cycleQuality}>{quality}</button>
      </div>

      {(settingsOpen || audioPanelOpen || subPanelOpen || qualityPanelOpen) ? (
        <div className="player-floating-panel">
          {settingsOpen ? (
            <>
              <strong>Impostazioni player</strong>
              <button type="button" onClick={toggleFullscreen}>Schermo intero: {fullscreenActive ? 'On' : 'Off'}</button>
              <button type="button" onClick={() => setHubVisible(false)}>Nascondi interfaccia</button>
            </>
          ) : null}

          {audioPanelOpen ? (
            <>
              <strong>Audio</strong>
              <button type="button" onClick={() => setMuted(false)}>Italiano · Stereo</button>
              <button type="button" onClick={() => setMuted(true)}>Muto</button>
            </>
          ) : null}

          {subPanelOpen ? (
            <>
              <strong>Sottotitoli</strong>
              <button type="button" onClick={() => setSubtitles(false)}>Disattivati</button>
              <button type="button" onClick={() => setSubtitles(true)}>Italiano</button>
            </>
          ) : null}

          {qualityPanelOpen ? (
            <>
              <strong>Qualità</strong>
              <button type="button" onClick={cycleQuality}>Auto</button>
              <button type="button" onClick={cycleQuality}>4K</button>
              <button type="button" onClick={cycleQuality}>FHD</button>
              <button type="button" onClick={cycleQuality}>HD</button>
            </>
          ) : null}
        </div>
      ) : null}

      {isLive ? (
        <section className="player-glass-panel live-control-panel">
          <div className="live-player-mainline">
            {media.icon ? <img src={media.icon} alt="" className="player-channel-image" /> : <ChannelLogo text={media.logo || 'TV'} />}
            <div className="live-player-info">
              <span>{media.number || ''}</span>
              <strong>{media.channel}</strong>
              <small>{media.title || 'In onda ora'}</small>
            </div>

            <div className="live-player-next">
              <span>NEXT</span>
              <strong>{nextLabel}</strong>
              <small>{media.epg ? 'EPG' : 'Guida non disponibile'}</small>
            </div>

            <div className="live-player-zap">
              <strong>{quality}</strong>
              <small>{media.category || 'Live TV'}</small>
            </div>
          </div>

          <div className="player-progress-row live">
            <span>{startLabel}</span>
            <ProgressBar value={media.progress || 0} />
            <span>{stopLabel}</span>
          </div>

          <div className="player-controls-row">
            <div className="player-volume">
              <SpeakerIcon muted={muted} />
              <ProgressBar value={muted ? 0 : 34} />
            </div>

            <div className="player-center-controls">
              <PlayerButton label={paused ? 'Riproduci' : 'Pausa'} className="main" onClick={togglePause}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </PlayerButton>
            </div>

            <div className="player-color-commands">
              <button type="button" onClick={onToggleFavorite}><ColorCommand color="red" label="Preferito" /></button>
              <button type="button" onClick={cycleQuality}><ColorCommand color="blue" label="Qualità" /></button>
              <ColorCommand color="green" label="Lista" />
              <button type="button" onClick={() => setAudioPanelOpen((value) => !value)}><ColorCommand color="yellow" label="Audio" /></button>
            </div>
          </div>
        </section>
      ) : (
        <section className="player-glass-panel movie-control-panel">
          <div className="player-progress-row">
            <span>{media.continueLabel?.replace('Riprendi da ', '') || '00:00'}</span>
            <ProgressBar value={media.progress || 0} />
            <span>{quality}</span>
          </div>

          <div className="player-controls-row">
            <div className="player-volume">
              <SpeakerIcon muted={muted} />
              <ProgressBar value={muted ? 0 : 34} />
            </div>

            <div className="player-center-controls">
              <PlayerButton label={paused ? 'Riproduci' : 'Pausa'} className="main" onClick={togglePause}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </PlayerButton>
            </div>

            <div className="player-side-actions">
              <PlayerButton label="Schermo intero" active={fullscreenActive} onClick={toggleFullscreen}>⛶</PlayerButton>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
