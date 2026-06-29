import ProgressBar from './ProgressBar.jsx';

export function MediaPoster({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      className={selected ? 'film-poster-card selected' : 'film-poster-card'}
      style={{ '--poster': `url(${item.poster})` }}
      onClick={() => onSelect(item)}
      onMouseEnter={() => onSelect(item)}
    >
      <span className="film-quality-badge">{item.selectedQuality || item.quality}</span>
      <span className="film-rating-badge">★ {item.rating}</span>
      <span className="film-poster-gradient" />
      <span className="film-poster-copy">
        <strong>{item.title}</strong>
        <small>{item.year} · {item.selectedQuality || item.quality} · ★ {item.rating}</small>
      </span>
    </button>
  );
}

export function MediaRail({ title, items, selectedItem, onSelect, emptyText }) {
  return (
    <section className="film-rail">
      <div className="section-heading">
        <h2>{title}</h2>
        <button type="button">Vedi tutti</button>
      </div>

      {items.length ? (
        <div className="film-rail-track">
          {items.map((item) => (
            <MediaPoster
              key={item.id}
              item={item}
              selected={selectedItem.id === item.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="film-empty-row glass-panel">{emptyText}</div>
      )}
    </section>
  );
}

export function ContinueRail({ title, items, selectedItem, onSelect, emptyText, type = 'film' }) {
  return (
    <section className="film-rail">
      <div className="section-heading">
        <h2>{title}</h2>
        <button type="button">Vedi tutti</button>
      </div>

      {items.length ? (
        <div className="media-continue-track">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={selectedItem.id === item.id ? 'media-continue-card selected' : 'media-continue-card'}
              style={{ '--continue-bg': `url(${item.backdrop})` }}
              onClick={() => onSelect(item)}
            >
              <span className="continue-card-overlay" />
              <span className="continue-card-content-wide">
                <span className="continue-type">{type === 'series' ? item.currentEpisode : 'Film'}</span>
                <strong>{item.title}</strong>
                <small>{item.continueLabel || 'Riprendi la visione'}</small>
                <ProgressBar value={item.progress} />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="film-empty-row glass-panel">{emptyText}</div>
      )}
    </section>
  );
}
