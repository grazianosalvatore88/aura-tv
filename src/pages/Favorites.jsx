import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ChannelLogo from '../components/ChannelLogo.jsx';
import MediaDetail from '../components/MediaDetail.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { MediaRail } from '../components/MediaSections.jsx';
import { liveChannels } from '../data/liveChannels.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';

const favoriteFilters = ['Tutti', 'Canali', 'Film', 'Serie TV'];
const initialMovieFavorites = movies.filter((item) => item.favorite).map((item) => item.id);
const initialSeriesFavorites = series.filter((item) => item.favorite).map((item) => item.id);
const initialChannelFavorites = liveChannels.filter((item) => item.favorite).map((item) => item.id);

export default function Favorites({ activePage = 'Preferiti', onNavigate = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detail, setDetail] = useState(null);
  const [movieFavoriteIds, setMovieFavoriteIds] = useState(() => new Set(initialMovieFavorites));
  const [seriesFavoriteIds, setSeriesFavoriteIds] = useState(() => new Set(initialSeriesFavorites));
  const [channelFavoriteIds, setChannelFavoriteIds] = useState(() => new Set(initialChannelFavorites));
  const [movieQuality, setMovieQuality] = useState(() => Object.fromEntries(movies.map((item) => [item.id, item.quality])));
  const [seriesQuality, setSeriesQuality] = useState(() => Object.fromEntries(series.map((item) => [item.id, item.quality])));

  const favoriteMovies = useMemo(() => movies
    .filter((item) => movieFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: movieQuality[item.id] || item.quality
    })), [movieFavoriteIds, movieQuality]);

  const favoriteSeries = useMemo(() => series
    .filter((item) => seriesFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: seriesQuality[item.id] || item.quality
    })), [seriesFavoriteIds, seriesQuality]);

  const favoriteChannels = useMemo(() => liveChannels
    .filter((item) => channelFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: item.qualityLabel || 'HD'
    })), [channelFavoriteIds]);

  const query = searchQuery.trim().toLowerCase();

  const filteredMovies = favoriteMovies.filter((item) => !query || [
    item.title,
    item.originalTitle,
    item.genres.join(' '),
    item.cast.join(' ')
  ].join(' ').toLowerCase().includes(query));

  const filteredSeries = favoriteSeries.filter((item) => !query || [
    item.title,
    item.originalTitle,
    item.genres.join(' '),
    item.cast.join(' ')
  ].join(' ').toLowerCase().includes(query));

  const filteredChannels = favoriteChannels.filter((item) => !query || [
    item.channel,
    item.title,
    item.category
  ].join(' ').toLowerCase().includes(query));

  const showChannels = activeFilter === 'Tutti' || activeFilter === 'Canali';
  const showMovies = activeFilter === 'Tutti' || activeFilter === 'Film';
  const showSeries = activeFilter === 'Tutti' || activeFilter === 'Serie TV';

  const heroItem = selectedItem
    || filteredMovies[0]
    || filteredSeries[0]
    || filteredChannels[0]
    || favoriteMovies[0]
    || favoriteSeries[0]
    || favoriteChannels[0];

  function removeFavorite(item, type) {
    if (type === 'movie') {
      setMovieFavoriteIds((current) => {
        const updated = new Set(current);
        updated.delete(item.id);
        return updated;
      });
    }

    if (type === 'series') {
      setSeriesFavoriteIds((current) => {
        const updated = new Set(current);
        updated.delete(item.id);
        return updated;
      });
    }

    if (type === 'channel') {
      setChannelFavoriteIds((current) => {
        const updated = new Set(current);
        updated.delete(item.id);
        return updated;
      });
    }

    if (selectedItem?.id === item.id) setSelectedItem(null);
  }

  function cycleQuality(itemId, type) {
    if (type === 'film') {
      setMovieQuality((current) => {
        const item = movies.find((movie) => movie.id === itemId);
        if (!item?.availableQualities?.length) return current;
        const options = item.availableQualities;
        const currentValue = current[itemId] || item.quality || options[0];
        const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
        return { ...current, [itemId]: options[nextIndex] };
      });
    }

    if (type === 'series') {
      setSeriesQuality((current) => {
        const item = series.find((entry) => entry.id === itemId);
        if (!item?.availableQualities?.length) return current;
        const options = item.availableQualities;
        const currentValue = current[itemId] || item.quality || options[0];
        const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
        return { ...current, [itemId]: options[nextIndex] };
      });
    }
  }

  function openMovie(item) {
    setSelectedItem(item);
    setDetail({ type: 'film', item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openSeries(item) {
    setSelectedItem(item);
    setDetail({ type: 'series', item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (detail?.type === 'film') {
    const liveItem = favoriteMovies.find((item) => item.id === detail.item.id) || detail.item;
    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveItem}
        type="film"
        onBack={() => setDetail(null)}
        onToggleFavorite={(id) => removeFavorite({ id }, 'movie')}
        onCycleQuality={(id) => cycleQuality(id, 'film')}
        relatedItems={favoriteMovies.filter((item) => item.id !== liveItem.id)}
        onOpenRelated={openMovie}
      />
    );
  }

  if (detail?.type === 'series') {
    const liveItem = favoriteSeries.find((item) => item.id === detail.item.id) || detail.item;
    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveItem}
        type="series"
        onBack={() => setDetail(null)}
        onToggleFavorite={(id) => removeFavorite({ id }, 'series')}
        onCycleQuality={(id) => cycleQuality(id, 'series')}
        relatedItems={favoriteSeries.filter((item) => item.id !== liveItem.id)}
        onOpenRelated={openSeries}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main favorites-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Cerca nei preferiti..."
        />

        <section className="library-hero glass-panel" style={{ '--library-bg': `url(${heroItem?.backdrop || heroItem?.background || ''})` }}>
          <div className="library-hero-content">
            <span className="eyebrow">La tua raccolta</span>
            <h1>Preferiti</h1>
            <p>Canali, film e serie TV salvati in un unico posto, pronti da aprire con il telecomando.</p>

            {heroItem ? (
              <div className="library-feature-card">
                {'poster' in heroItem ? (
                  <span className="library-mini-poster" style={{ '--poster': `url(${heroItem.poster})` }} />
                ) : (
                  <ChannelLogo text={heroItem.logo} />
                )}
                <div>
                  <strong>{heroItem.title || heroItem.channel}</strong>
                  <span>{heroItem.genres?.join(' · ') || heroItem.category} · {heroItem.selectedQuality}</span>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <div className="movie-filter-tabs visible" role="tablist" aria-label="Filtri preferiti">
          {favoriteFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? 'active' : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {showChannels ? (
          <section className="favorite-section">
            <div className="section-heading">
              <h2>Canali preferiti</h2>
              <button type="button">Vedi tutti</button>
            </div>

            {filteredChannels.length ? (
              <div className="favorite-channel-grid">
                {filteredChannels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    className="favorite-channel-card glass-panel"
                    onClick={() => setSelectedItem(channel)}
                  >
                    <ChannelLogo text={channel.logo} />
                    <div>
                      <strong>{channel.channel}</strong>
                      <span>{channel.title}</span>
                      <small>{channel.category} · {channel.selectedQuality}</small>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      className="mini-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeFavorite(channel, 'channel');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          event.stopPropagation();
                          removeFavorite(channel, 'channel');
                        }
                      }}
                    >
                      ♥
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="film-empty-row glass-panel">Nessun canale preferito trovato.</div>
            )}
          </section>
        ) : null}

        {showMovies ? (
          <MediaRail
            title="Film preferiti"
            items={filteredMovies}
            selectedItem={heroItem || filteredMovies[0] || {}}
            onSelect={setSelectedItem}
            onOpen={openMovie}
            emptyText="Nessun film preferito trovato."
          />
        ) : null}

        {showSeries ? (
          <MediaRail
            title="Serie TV preferite"
            items={filteredSeries}
            selectedItem={heroItem || filteredSeries[0] || {}}
            onSelect={setSelectedItem}
            onOpen={openSeries}
            emptyText="Nessuna serie preferita trovata."
          />
        ) : null}

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Apri' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Rimuovi preferito' },
            { key: 'verde', color: 'green', label: 'Filtra tipo' },
            { key: 'giallo', color: 'yellow', label: 'Ordina' },
            { key: 'blu', color: 'blue', label: 'Dettagli' }
          ]}
        />
      </main>
    </div>
  );
}
