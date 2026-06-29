import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ChannelLogo from '../components/ChannelLogo.jsx';
import MediaDetail from '../components/MediaDetail.jsx';
import PlayerScreen from '../components/PlayerScreen.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { MediaRail } from '../components/MediaSections.jsx';
import { liveChannels } from '../data/liveChannels.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';
import useAuraLibrary from '../services/useAuraLibrary.js';

const favoriteFilters = ['Tutti', 'Canali', 'Film', 'Serie TV'];
const initialMovieFavorites = movies.filter((item) => item.favorite).map((item) => item.id);
const initialSeriesFavorites = series.filter((item) => item.favorite).map((item) => item.id);
const initialChannelFavorites = liveChannels.filter((item) => item.favorite).map((item) => item.id);

function loadLiveFavoriteIds() {
  try {
    const stored = localStorage.getItem('aura-live-favorites');
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback below
  }
  return initialChannelFavorites;
}

function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.2-4.35-9.6-8.65C.58 9.08 2.2 5.2 5.85 4.45 8 4.02 10.04 5.04 12 7.12c1.96-2.08 4-3.1 6.15-2.67 3.65.75 5.27 4.63 3.45 7.9C19.2 16.65 12 21 12 21Z" />
    </svg>
  );
}

export default function Favorites({ activePage = 'Preferiti', onNavigate = () => {} }) {
  const library = useAuraLibrary();
  const sourceChannels = library.channels.length ? library.channels : liveChannels;
  const sourceMovies = library.movies.length ? library.movies : movies;
  const sourceSeries = library.series.length ? library.series : series;

  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detail, setDetail] = useState(null);
  const [playerChannel, setPlayerChannel] = useState(null);
  const [movieFavoriteIds, setMovieFavoriteIds] = useState(() => new Set(initialMovieFavorites));
  const [seriesFavoriteIds, setSeriesFavoriteIds] = useState(() => new Set(initialSeriesFavorites));
  const [channelFavoriteIds, setChannelFavoriteIds] = useState(() => new Set(loadLiveFavoriteIds()));
  const [movieQuality, setMovieQuality] = useState(() => Object.fromEntries(movies.map((item) => [item.id, item.quality])));
  const [seriesQuality, setSeriesQuality] = useState(() => Object.fromEntries(series.map((item) => [item.id, item.quality])));

  const favoriteMovies = useMemo(() => sourceMovies
    .filter((item) => movieFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: movieQuality[item.id] || item.quality
    })), [movieFavoriteIds, movieQuality, sourceMovies]);

  const favoriteSeries = useMemo(() => sourceSeries
    .filter((item) => seriesFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: seriesQuality[item.id] || item.quality
    })), [seriesFavoriteIds, seriesQuality, sourceSeries]);

  const favoriteChannels = useMemo(() => sourceChannels
    .filter((item) => channelFavoriteIds.has(item.id))
    .map((item) => ({
      ...item,
      favorite: true,
      selectedQuality: item.qualityLabel || 'HD'
    })), [channelFavoriteIds, sourceChannels]);

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
    item.category,
    item.qualityLabel
  ].join(' ').toLowerCase().includes(query));

  const showChannels = activeFilter === 'Tutti' || activeFilter === 'Canali';
  const showMovies = activeFilter === 'Tutti' || activeFilter === 'Film';
  const showSeries = activeFilter === 'Tutti' || activeFilter === 'Serie TV';
  const selectedForRail = selectedItem || filteredMovies[0] || filteredSeries[0] || {};

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
        const item = sourceMovies.find((movie) => movie.id === itemId);
        if (!item?.availableQualities?.length) return current;
        const options = item.availableQualities;
        const currentValue = current[itemId] || item.quality || options[0];
        const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
        return { ...current, [itemId]: options[nextIndex] };
      });
    }

    if (type === 'series') {
      setSeriesQuality((current) => {
        const item = sourceSeries.find((entry) => entry.id === itemId);
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

  if (playerChannel) {
    return (
      <PlayerScreen
        mode="live"
        channel={playerChannel}
        onBack={() => setPlayerChannel(null)}
      />
    );
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

      <main className="app-main favorites-page clean-library-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Cerca nei preferiti..."
          onNavigate={onNavigate}
        />

        <header className="clean-page-header">
          <div>
            <span className="eyebrow">La tua raccolta</span>
            <h1>Preferiti</h1>
            <p>Canali, film e serie TV salvati in un unico posto.</p>
          </div>
        </header>

        <div className="movie-filter-tabs visible clean-filter-tabs" role="tablist" aria-label="Filtri preferiti">
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
          <section className="favorite-section compact-favorite-section">
            <div className="section-heading">
              <h2>Canali preferiti</h2>
              <button type="button">Vedi tutti</button>
            </div>

            {filteredChannels.length ? (
              <div className="favorite-channel-grid-v23">
                {filteredChannels.map((channel) => (
                  <article
                    key={channel.id}
                    className="favorite-channel-card-v23 glass-panel"
                    onMouseEnter={() => setSelectedItem(channel)}
                  >
                    <button
                      type="button"
                      className="favorite-channel-main-v23"
                      onClick={() => setPlayerChannel(channel)}
                    >
                      <ChannelLogo text={channel.logo} />
                      <div>
                        <strong>{channel.channel}</strong>
                        <span>{channel.title}</span>
                        <small>{channel.category} · {channel.selectedQuality}</small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="favorite-heart-v23"
                      aria-label={`Rimuovi ${channel.channel} dai preferiti`}
                      onClick={() => removeFavorite(channel, 'channel')}
                    >
                      <HeartIcon />
                    </button>
                  </article>
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
            selectedItem={selectedForRail}
            onSelect={setSelectedItem}
            onOpen={openMovie}
            emptyText="Nessun film preferito trovato."
          />
        ) : null}

        {showSeries ? (
          <MediaRail
            title="Serie TV preferite"
            items={filteredSeries}
            selectedItem={selectedForRail}
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
            { key: 'blu', color: 'blue', label: 'Info' }
          ]}
        />
      </main>
    </div>
  );
}
