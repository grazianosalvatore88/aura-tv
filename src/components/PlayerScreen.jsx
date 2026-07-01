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
  const [qualityPanelOpen, setQualityPanelOpen] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [hubVisible, setHubVisible] = useState(true);

  const isLive = mode === 'live';
  const media = item || channel || {};
  const background = media.backdrop || media.background || '';
  const title = isLive ? (media.channel || media.title || 'AURA Player') : (media.title || 'AURA Player');
  const quality = media.selectedQuality || media.selectedResolution || media.quality || media.qualityLabel || 'Auto';
  const currentProgram = isLive ? (media.title || 'Programmazione non disponibile') : title;
  const currentDescription = isLive ? (media.description || 'Descrizione non disponibile') : (media.description || media.subtitle || '');
  const nextLabel = media.nextProgram || 'Programma successivo non disponibile';
  const startLabel = media.time?.split(' - ')?.[0] || '';
  const stopLabel = media.time?.split(' - ')?.[1] || '';
  const hasRealProgress = Boolean(media.epg && media.time && media.progress > 0);

  const topSubtitle = useMemo(() => {
    if (isLive) return `${currentProgram}${media.time ? ` · ${media.time}` : ''}`;
    if (type === 'series') return `${media.currentEpisode || 'Stagione 1 · Episodio 1'}${quality ? ` · ${quality}` : ''}`;
    return `${media.year || ''}${media.duration ? ` · ${media.duration}` : ''}${quality ? ` · ${quality}` : ''}`;
  }, [currentProgram, isLive, media, quality, type]);

  function revealHub() {
    setHubVisible(true);
  }

  useEffect(() => {
    revealHub();
  }, [media.id]);

  useEffect(() => {
    function handleFullscreenChange() {
      setFullscreenActive(Boolean(document.fullscreenElement));
      if (document.fullscreenElement) {
        setHubVisible(false);
      } else {
        setHubVisible(true);
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (/non disponibile|errore|premi play/i.test(streamStatus || '')) {
      setHubVisible(true);
      return undefined;
    }

    if (paused || qualityPanelOpen) {
      setHubVisible(true);
      return undefined;
    }

    const timer = setTimeout(() => setHubVisible(false), 5200);
    return () => clearTimeout(timer);
  }, [paused, qualityPanelOpen, media.id, hubVisible, streamStatus]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' || event.key === 'Backspace') {
        event.preventDefault();
        if (!hubVisible) setHubVisible(true);
        else onBack();
        return;
      }

      if (event.key === ' ' || event.key === 'Enter' || event.key === 'MediaPlayPause') {
        event.preventDefault();
        setPaused((value) => !value);
        setHubVisible(true);
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        setHubVisible(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hubVisible, onBack]);

  function toggleFullscreen() {
    const root = document.documentElement;

    if (!document.fullscreenElement && root.requestFullscreen) {
      root.requestFullscreen()
        .then(() => {
          setFullscreenActive(true);
          setHubVisible(false);
        })
        .catch(() => {
          setFullscreenActive((value) => !value);
          setHubVisible(false);
        });
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen()
        .then(() => {
          setFullscreenActive(false);
          setHubVisible(true);
        })
        .catch(() => setFullscreenActive((value) => !value));
      return;
    }

    setFullscreenActive((value) => !value);
    setHubVisible(false);
  }

  function togglePause() {
    setPaused((value) => !value);
    revealHub();
  }

  function cycleQuality() {
    onCycleQuality();
    setQualityPanelOpen(true);
    revealHub();
  }

  return (
    <div
      className={`${isLive ? 'aura-player live-player aura-player-v326' : 'aura-player vod-player aura-player-v326'} ${hubVisible ? 'hub-visible' : 'hub-hidden'}`}
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

      <button type="button" className="player-back-button player-back-button-v326" onClick={onBack}>
        ← Indietro
      </button>

      <section className="player-top-title player-top-title-v326">
        <span>{isLive ? 'Live TV' : type === 'series' ? 'Serie TV' : 'Film'}</span>
        <h1>{title}</h1>
        <p>{topSubtitle}{streamStatus ? ` · ${streamStatus}` : ''}</p>
      </section>

      <div className="player-top-actions-v326">
        <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Attiva suono' : 'Disattiva suono'}>
          <SpeakerIcon muted={muted} />
          <span>{muted ? 'Muto' : 'Suono'}</span>
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label="Schermo intero">
          <FullscreenIcon />
          <span>{fullscreenActive ? 'Esci' : 'Schermo intero'}</span>
        </button>
      </div>

      <section className="player-bottom-hub-v326">
        <div className="player-bottom-content-v326">
          <div className="player-channel-block-v326">
            <div className="player-logo-box-v326">
              {media.icon ? <img src={media.icon} alt="" className="player-channel-image" /> : <ChannelLogo text={media.logo || 'TV'} />}
            </div>
            <div className="player-channel-text-v326">
              <span>{isLive ? media.channel : type === 'series' ? 'Serie TV' : 'Film'}</span>
              <strong>{currentProgram}</strong>
              <small>{currentDescription}</small>
            </div>
          </div>

          <div className={isLive ? 'player-progress-block-v326' : 'player-progress-block-v326 player-progress-block-vod-v331'}>
            {isLive ? (
              <div className="player-next-line-v326">
                <span>Prossimo</span>
                <strong>{nextLabel}</strong>
              </div>
            ) : null}

            {isLive && hasRealProgress ? (
              <div className="player-progress-row-v326">
                <span>{startLabel}</span>
                <ProgressBar value={media.progress || 0} />
                <span>{stopLabel}</span>
              </div>
            ) : isLive ? (
              <div className="player-progress-empty-v326">
                <span>Guida non disponibile</span>
              </div>
            ) : (
              <div className="player-vod-progress-v331">
                <div className="player-vod-progress-head-v331">
                  <strong>{media.progress ? `${media.progress}%` : '0%'}</strong>
                  <span>{media.duration || quality}</span>
                </div>
                <div className="player-progress-row-v326 player-progress-row-v331">
                  <span>{media.progress ? `${media.progress}%` : '0%'}</span>
                  <ProgressBar value={media.progress || 0} />
                  <span>{media.duration || quality}</span>
                </div>
              </div>
            )}
          </div>

          {isLive ? (
            <div className="player-play-block-v326">
              <button
                type="button"
                className="player-play-button-v326"
                aria-label={paused ? 'Riproduci' : 'Pausa'}
                onClick={togglePause}
              >
                {paused ? <PlayIcon /> : <PauseIcon />}
              </button>
            </div>
          ) : null}

          <div className="player-actions-v326">
            <button type="button" onClick={onToggleFavorite}><ColorCommand color="red" label="Preferito" /></button>
            <button type="button" onClick={cycleQuality}><ColorCommand color="blue" label={quality} /></button>
            <button type="button" onClick={() => setQualityPanelOpen((value) => !value)}><ColorCommand color="green" label="Opzioni" /></button>
            <button type="button" onClick={() => setSubtitles((value) => !value)}><ColorCommand color="yellow" label={subtitles ? 'Sub On' : 'Sottotitoli'} /></button>
          </div>
        </div>
      </section>

      {!isLive ? (
        <button
          type="button"
          className="player-center-play-v331"
          aria-label={paused ? 'Riproduci' : 'Pausa'}
          onClick={togglePause}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      ) : null}

      {qualityPanelOpen ? (
        <div className="player-floating-panel player-floating-panel-v326">
          <strong>Qualità</strong>
          <button type="button" onClick={cycleQuality}>Auto</button>
          <button type="button" onClick={cycleQuality}>4K</button>
          <button type="button" onClick={cycleQuality}>FHD</button>
          <button type="button" onClick={cycleQuality}>HD</button>
        </div>
      ) : null}
    </div>
  );
}
