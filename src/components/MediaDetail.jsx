import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopMenu from './TopMenu.jsx';
import ProgressBar from './ProgressBar.jsx';
import PlayerScreen from './PlayerScreen.jsx';

function BackIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m12 2.8 2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.36l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93L12 2.8Z" />
    </svg>
  );
}


function parseSeasonCount(value) {
  const match = String(value || '').match(/\d+/);
  const count = match ? Number(match[0]) : 1;
  return Math.max(1, Math.min(20, count || 1));
}

function buildSeasonEpisodes(item, seasonNumber) {
  const totalEpisodes = Math.max(4, Math.min(12, Number(String(item.episodes || '').match(/\d+/)?.[0] || 6)));

  return Array.from({ length: Math.min(totalEpisodes, 8) }, (_, index) => {
    const ep = index + 1;
    return {
      episode: `S${String(seasonNumber).padStart(2, '0')}E${String(ep).padStart(2, '0')}`,
      title: ep === 1 ? `${item.title} · Inizio stagione` : `${item.title} · Episodio ${ep}`,
      time: item.episodeDuration || '45 min',
      progress: seasonNumber === 1 && ep <= 2 ? 100 : seasonNumber === 1 && ep === 3 ? item.progress || 0 : 0
    };
  });
}

function DetailMeta({ item, type }) {
  if (type === 'series') {
    return (
      <div className="detail-meta-line">
        <span>{item.year}</span>
        <span>{item.seasons}</span>
        <span>{item.episodes}</span>
        <span>{item.genres.join(' · ')}</span>
        <span>{item.selectedQuality}</span>
        <span>★ {item.rating}</span>
      </div>
    );
  }

  return (
    <div className="detail-meta-line">
      <span>{item.year}</span>
      <span>{item.duration}</span>
      <span>{item.genres.join(' · ')}</span>
      <span>{item.selectedQuality}</span>
      <span>★ {item.rating}</span>
    </div>
  );
}

export default function MediaDetail({
  activePage,
  onNavigate,
  item,
  type = 'film',
  onBack,
  onToggleFavorite,
  onCycleQuality,
  relatedItems = [],
  onOpenRelated
}) {
  const isSeries = type === 'series';
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const seasonCount = isSeries ? parseSeasonCount(item.seasons) : 1;
  const seasons = Array.from({ length: seasonCount }, (_, index) => index + 1);
  const visibleEpisodes = isSeries ? buildSeasonEpisodes(item, activeSeason) : [];

  if (showPlayer) {
    return (
      <PlayerScreen
        mode="vod"
        type={type}
        item={item}
        onBack={() => setShowPlayer(false)}
        onCycleQuality={() => onCycleQuality(item.id)}
        onToggleFavorite={() => onToggleFavorite(item.id)}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main media-detail-page">
        <TopMenu placeholder={isSeries ? 'Cerca serie TV, cast, stagioni, generi...' : 'Cerca film, attori, generi, qualità...'}
          onNavigate={onNavigate}
        />

        <button type="button" className="detail-back-button glass-control" onClick={onBack}>
          <BackIcon />
          <span>Torna alla libreria</span>
        </button>

        <section className="media-detail-hero glass-panel" style={{ '--detail-bg': `url(${item.backdrop})` }}>
          <div className="media-detail-content">
            <div className="detail-poster" style={{ '--poster': `url(${item.poster})` }} />

            <div className="detail-copy">
              <span className="eyebrow">{isSeries ? 'Scheda Serie TV' : 'Scheda Film'}</span>
              <h1>{item.title}</h1>

              <DetailMeta item={item} type={type} />

              <p>{item.description}</p>

              <div className="detail-cast">
                <span><strong>Cast:</strong> {item.cast.join(' · ')}</span>
                <span><strong>{isSeries ? 'Creatori' : 'Regia'}:</strong> {isSeries ? item.creators : item.director}</span>
              </div>

              {item.progress > 0 ? (
                <div className="movie-progress detail-progress">
                  <div className="movie-progress-head">
                    <span>{item.continueLabel || 'Continua la visione'}</span>
                    <strong>{item.progress}%</strong>
                  </div>
                  <ProgressBar value={item.progress} />
                </div>
              ) : null}

              <div className="detail-actions">
                <button type="button" className="primary" onClick={() => setShowPlayer(true)}>▶ Guarda ora</button>
                <button
                  type="button"
                  className={item.favorite ? 'round-action favorite-active' : 'round-action'}
                  onClick={() => onToggleFavorite(item.id)}
                  aria-label={item.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                >
                  {item.favorite ? '♥' : '♡'}
                </button>
                <button type="button" className="quality-action" onClick={() => onCycleQuality(item.id)}>
                  {item.selectedQuality}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="detail-info-grid">
          <article className="detail-info-card glass-panel">
            <span className="eyebrow">Informazioni</span>
            <div className="detail-info-list">
              <span><strong>Titolo originale</strong>{item.originalTitle}</span>
              <span><strong>Voto</strong><span className="inline-rating"><StarIcon /> {item.rating}</span></span>
              <span><strong>Qualità disponibili</strong>{item.availableQualities.join(' / ')}</span>
              <span><strong>Sorgente</strong>{item.source}</span>
            </div>
          </article>

          {isSeries ? (
            <article className="detail-info-card glass-panel">
              <span className="eyebrow">Stagioni</span>
              <div className="season-selector season-selector-functional">
                {seasons.map((season) => (
                  <button
                    key={season}
                    type="button"
                    className={activeSeason === season ? 'active' : ''}
                    onClick={() => setActiveSeason(season)}
                  >
                    S{String(season).padStart(2, '0')}
                  </button>
                ))}
              </div>
              <div className="episode-list">
                {visibleEpisodes.map((episode) => (
                  <button
                    type="button"
                    key={episode.episode}
                    className={episode.progress ? 'episode-row active' : 'episode-row'}
                    onClick={() => setShowPlayer(true)}
                  >
                    <span>{episode.episode}</span>
                    <div>
                      <strong>{episode.title}</strong>
                      <small>{episode.time}</small>
                      {episode.progress > 0 && episode.progress < 100 ? <ProgressBar value={episode.progress} /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </article>
          ) : (
            <article className="detail-info-card glass-panel">
              <span className="eyebrow">Cast principale</span>
              <div className="cast-chip-list">
                {item.cast.map((person) => (
                  <span key={person}>{person}</span>
                ))}
              </div>
              <p className="detail-card-copy">Quando collegheremo il motore metadata, qui potremo mostrare anche regista, attori completi e contenuti simili reali.</p>
            </article>
          )}
        </section>

        {relatedItems.length ? (
          <section className="detail-related">
            <div className="section-heading">
              <h2>{isSeries ? 'Serie simili' : 'Film simili'}</h2>
              <span className="section-static-label">Suggeriti da AURA</span>
            </div>
            <div className="film-rail-track">
              {relatedItems.slice(0, 8).map((related) => (
                <button
                  key={related.id}
                  type="button"
                  className="film-poster-card"
                  style={{ '--poster': `url(${related.poster})` }}
                  onClick={() => onOpenRelated?.(related)}
                >
                  <span className="film-quality-badge">{related.selectedQuality || related.quality}</span>
                  <span className="film-poster-gradient" />
                  <span className="film-poster-copy">
                    <strong>{related.title}</strong>
                    <small>{related.year} · {related.genres[0]} · ★ {related.rating}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
