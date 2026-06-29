import { useMemo, useState } from 'react';
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

function PipIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <rect x="13" y="12" width="5" height="4" rx="1" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3H4v4" />
      <path d="M16 3h4v4" />
      <path d="M8 21H4v-4" />
      <path d="M16 21h4v-4" />
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
  const [pipActive, setPipActive] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');

  const isLive = mode === 'live';
  const media = item || channel || {};
  const background = media.backdrop || media.background || '';
  const title = media.title || media.channel || 'AURA Player';
  const quality = media.selectedQuality || media.selectedResolution || media.quality || media.qualityLabel || 'Auto';

  const topSubtitle = useMemo(() => {
    if (isLive) return `${media.channel || ''}${media.time ? ` · ${media.time}` : ''}`;
    if (type === 'series') return `${media.currentEpisode || 'Stagione 1 · Episodio 1'}${media.selectedQuality ? ` · ${media.selectedQuality}` : ''}`;
    return `${media.year || ''}${media.duration ? ` · ${media.duration}` : ''}${media.selectedQuality ? ` · ${media.selectedQuality}` : ''}`;
  }, [isLive, media, type]);

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
  }

  return (
    <div className={isLive ? 'aura-player live-player' : 'aura-player vod-player'}>
      <div className="player-video-layer" style={{ '--player-bg': `url(${background})` }}>
        <StreamVideo
          src={media.streamUrl}
          fallbackSrc={media.fallbackStreamUrl}
          poster={media.icon || media.poster || background}
          muted={muted}
          paused={paused}
          onStatusChange={setStreamStatus}
        />
      </div>
      <div className="player-vignette" />

      <section className="player-top-title">
        <span>{isLive ? 'Live TV' : type === 'series' ? 'Serie TV' : 'Film'}</span>
        <h1>{title}</h1>
        <p>{topSubtitle}{streamStatus ? ` · ${streamStatus}` : ''}</p>
      </section>

      <div className="player-top-actions">
        <PlayerButton label="Impostazioni player" active={settingsOpen} onClick={() => setSettingsOpen((value) => !value)}>
          <SettingsIcon />
        </PlayerButton>
        <PlayerButton label={muted ? 'Attiva audio' : 'Disattiva audio'} active={muted || audioPanelOpen} onClick={() => {
          setMuted((value) => !value);
          setAudioPanelOpen((value) => !value);
        }}>
          <SpeakerIcon muted={muted} />
        </PlayerButton>
        <PlayerButton label="Sottotitoli" active={subtitles || subPanelOpen} onClick={() => {
          setSubtitles((value) => !value);
          setSubPanelOpen((value) => !value);
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
              <button type="button" onClick={() => setPipActive((value) => !value)}>Picture in picture: {pipActive ? 'On' : 'Off'}</button>
              <button type="button" onClick={toggleFullscreen}>Schermo intero: {fullscreenActive ? 'On' : 'Off'}</button>
            </>
          ) : null}

          {audioPanelOpen ? (
            <>
              <strong>Audio</strong>
              <button type="button" onClick={() => setMuted(false)}>Italiano · Stereo</button>
              <button type="button" onClick={() => setMuted(false)}>Italiano · 5.1</button>
              <button type="button" onClick={() => setMuted(true)}>Muto</button>
            </>
          ) : null}

          {subPanelOpen ? (
            <>
              <strong>Sottotitoli</strong>
              <button type="button" onClick={() => setSubtitles(false)}>Disattivati</button>
              <button type="button" onClick={() => setSubtitles(true)}>Italiano</button>
              <button type="button" onClick={() => setSubtitles(true)}>Italiano non udenti</button>
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
            <ChannelLogo text={media.logo} />
            <div className="live-player-info">
              <span>{media.number || '101'}</span>
              <strong>{media.channel}</strong>
              <small>{media.title}</small>
            </div>

            <div className="live-player-next">
              <span>NEXT</span>
              <strong>22:30</strong>
              <small>Prossimo programma</small>
            </div>

            <div className="live-player-zap">
              <strong>CH+ / CH-</strong>
              <small>Cambia canale</small>
            </div>
          </div>

          <div className="player-progress-row live">
            <span>{media.time?.split(' - ')?.[0] || '20:00'}</span>
            <ProgressBar value={media.progress || 42} />
            <span>{media.time?.split(' - ')?.[1] || '22:30'}</span>
          </div>

          <div className="player-controls-row">
            <div className="player-volume">
              <SpeakerIcon muted={muted} />
              <ProgressBar value={muted ? 0 : 34} />
            </div>

            <div className="player-center-controls">
              <PlayerButton label="Canale precedente">◀</PlayerButton>
              <PlayerButton label={paused ? 'Riproduci' : 'Pausa'} className="main" onClick={() => setPaused((value) => !value)}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </PlayerButton>
              <PlayerButton label="Canale successivo">▶</PlayerButton>
              <PlayerButton label="Ricarica stream">↻</PlayerButton>
            </div>

            <div className="player-color-commands">
              <button type="button" onClick={onToggleFavorite}><ColorCommand color="red" label="Preferito" /></button>
              <button type="button" onClick={cycleQuality}><ColorCommand color="blue" label="Qualità" /></button>
              <ColorCommand color="green" label="Lista canali" />
              <button type="button" onClick={() => setAudioPanelOpen((value) => !value)}><ColorCommand color="yellow" label="Audio" /></button>
            </div>
          </div>
        </section>
      ) : (
        <section className="player-glass-panel movie-control-panel">
          <div className="player-progress-row">
            <span>{media.continueLabel?.replace('Riprendi da ', '') || '58:42'}</span>
            <ProgressBar value={media.progress || 48} />
            <span>-1:19:36</span>
          </div>

          <div className="player-controls-row">
            <div className="player-volume">
              <SpeakerIcon muted={muted} />
              <ProgressBar value={muted ? 0 : 34} />
            </div>

            <div className="player-center-controls">
              <PlayerButton label="Indietro 10 secondi">↶<small>10</small></PlayerButton>
              <PlayerButton label={paused ? 'Riproduci' : 'Pausa'} className="main" onClick={() => setPaused((value) => !value)}>
                {paused ? <PlayIcon /> : <PauseIcon />}
              </PlayerButton>
              <PlayerButton label="Avanti 10 secondi">↷<small>10</small></PlayerButton>
            </div>

            <div className="player-side-actions">
              <PlayerButton label="Picture in picture" active={pipActive} onClick={() => setPipActive((value) => !value)}><PipIcon /></PlayerButton>
              <PlayerButton label="Schermo intero" active={fullscreenActive} onClick={toggleFullscreen}><FullscreenIcon /></PlayerButton>
            </div>
          </div>

          <div className="player-color-commands movie">
            <button type="button" onClick={onToggleFavorite}><ColorCommand color="red" label="Preferito" /></button>
            <ColorCommand color="green" label={type === 'series' ? 'Episodi' : 'Scheda'} />
            <button type="button" onClick={() => setAudioPanelOpen((value) => !value)}><ColorCommand color="yellow" label="Audio/Sub" /></button>
            <button type="button" onClick={cycleQuality}><ColorCommand color="blue" label="Qualità" /></button>
          </div>
        </section>
      )}

      <button type="button" className="player-back-hotspot" onClick={onBack}>
        BACK
      </button>
    </div>
  );
}
