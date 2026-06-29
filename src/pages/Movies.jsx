import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import MediaDetail from '../components/MediaDetail.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { ContinueRail, MediaRail } from '../components/MediaSections.jsx';
import { movieFilters, movies } from '../data/movies.js';

const initialFavoriteIds = movies.filter((movie) => movie.favorite).map((movie) => movie.id);

export default function Movies({ activePage = 'Film', onNavigate = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('Tutti');
  const [selectedMovie, setSelectedMovie] = useState(movies[0]);
  const [detailMovie, setDetailMovie] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuality, setSelectedQuality] = useState(() => Object.fromEntries(
    movies.map((movie) => [movie.id, movie.quality])
  ));

  const enrichedMovies = useMemo(() => movies.map((movie) => ({
    ...movie,
    favorite: favoriteIds.has(movie.id),
    selectedQuality: selectedQuality[movie.id] || movie.quality
  })), [favoriteIds, selectedQuality]);

  const filteredMovies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return enrichedMovies.filter((movie) => {
      const filterMatch = activeFilter === 'Tutti'
        ? true
        : activeFilter === 'Consigliati'
          ? ['Consigliato', 'Cult', 'Sci-fi'].includes(movie.tag) || movie.source === 'Consigliati'
          : activeFilter === 'Più visti'
            ? movie.source === 'Più visti'
            : activeFilter === 'Nuovi arrivi'
              ? movie.source === 'Nuovi arrivi' || movie.tag === 'Nuovo'
              : activeFilter === '4K'
                ? movie.availableQualities.includes('4K')
                : movie.genres.includes(activeFilter);

      const searchMatch = !query || [
        movie.title,
        movie.originalTitle,
        movie.year,
        movie.genres.join(' '),
        movie.cast.join(' '),
        movie.director,
        movie.quality
      ].join(' ').toLowerCase().includes(query);

      return filterMatch && searchMatch;
    });
  }, [activeFilter, enrichedMovies, searchQuery]);

  const visibleMovie = filteredMovies.find((movie) => movie.id === selectedMovie.id)
    || filteredMovies[0]
    || enrichedMovies[0]
    || selectedMovie;

  const liveDetailMovie = detailMovie
    ? enrichedMovies.find((movie) => movie.id === detailMovie.id) || detailMovie
    : null;

  const continueMovies = enrichedMovies.filter((movie) => movie.progress > 0).slice(0, 4);
  const newMovies = enrichedMovies.filter((movie) => movie.source === 'Nuovi arrivi' || movie.year === '2024');
  const fourKMovies = enrichedMovies.filter((movie) => movie.availableQualities.includes('4K'));
  const actionMovies = enrichedMovies.filter((movie) => movie.genres.includes('Azione'));
  const sciFiMovies = enrichedMovies.filter((movie) => movie.genres.includes('Fantascienza'));

  function selectFilter(filter) {
    setActiveFilter(filter);
    const next = enrichedMovies.find((movie) => {
      if (filter === 'Tutti') return true;
      if (filter === 'Consigliati') return ['Consigliato', 'Cult', 'Sci-fi'].includes(movie.tag) || movie.source === 'Consigliati';
      if (filter === 'Più visti') return movie.source === 'Più visti';
      if (filter === 'Nuovi arrivi') return movie.source === 'Nuovi arrivi' || movie.tag === 'Nuovo';
      if (filter === '4K') return movie.availableQualities.includes('4K');
      return movie.genres.includes(filter);
    });
    if (next) setSelectedMovie(next);
  }

  function toggleFavorite(movieId) {
    setFavoriteIds((current) => {
      const updated = new Set(current);
      if (updated.has(movieId)) {
        updated.delete(movieId);
      } else {
        updated.add(movieId);
      }
      return updated;
    });
  }

  function cycleQuality(movieId) {
    setSelectedQuality((current) => {
      const movie = movies.find((item) => item.id === movieId);
      if (!movie?.availableQualities?.length) return current;
      const options = movie.availableQualities;
      const currentValue = current[movieId] || movie.quality || options[0];
      const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
      return {
        ...current,
        [movieId]: options[nextIndex]
      };
    });
  }

  function openDetail(movie) {
    setSelectedMovie(movie);
    setDetailMovie(movie);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (liveDetailMovie) {
    const related = enrichedMovies.filter((movie) => movie.id !== liveDetailMovie.id && (
      movie.genres.some((genre) => liveDetailMovie.genres.includes(genre))
      || movie.availableQualities.includes(liveDetailMovie.selectedQuality)
    ));

    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveDetailMovie}
        type="film"
        onBack={() => setDetailMovie(null)}
        onToggleFavorite={toggleFavorite}
        onCycleQuality={cycleQuality}
        relatedItems={related}
        onOpenRelated={openDetail}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main movies-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Cerca film, attori, generi, qualità..."
          onNavigate={onNavigate}
        />

        <section className="movies-hero glass-panel" style={{ '--movie-bg': `url(${visibleMovie.backdrop})` }}>
          <div className="movie-hero-content clean">
            <button
              type="button"
              className="movie-poster-large poster-clickable"
              style={{ '--poster': `url(${visibleMovie.poster})` }}
              onClick={() => openDetail(visibleMovie)}
              aria-label={`Apri scheda di ${visibleMovie.title}`}
            />

            <div className="movie-hero-copy">
              <span className="eyebrow">Film in evidenza</span>
              <h1>{visibleMovie.title}</h1>
              <div className="movie-meta-line">
                <span>{visibleMovie.year}</span>
                <span>{visibleMovie.duration}</span>
                <span>{visibleMovie.genres.join(' · ')}</span>
                <span>{visibleMovie.selectedQuality}</span>
                <span>★ {visibleMovie.rating}</span>
              </div>
              <p>{visibleMovie.description}</p>
              <p className="hero-cast-line">
                <strong>Cast:</strong> {visibleMovie.cast.join(' · ')}
              </p>
              <p className="hero-cast-line">
                <strong>Regia:</strong> {visibleMovie.director}
              </p>

              {visibleMovie.progress > 0 ? (
                <div className="movie-progress">
                  <div className="movie-progress-head">
                    <span>{visibleMovie.continueLabel}</span>
                    <strong>{visibleMovie.progress}%</strong>
                  </div>
                  <ProgressBar value={visibleMovie.progress} />
                </div>
              ) : null}

              <div className="movie-actions">
                <button type="button" className="primary">▶ Guarda ora</button>
                <button type="button" className="secondary" onClick={() => openDetail(visibleMovie)}>
                  Apri scheda
                </button>
                <button
                  type="button"
                  className={visibleMovie.favorite ? 'round-action favorite-active' : 'round-action'}
                  onClick={() => toggleFavorite(visibleMovie.id)}
                  aria-label={visibleMovie.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                >
                  {visibleMovie.favorite ? '♥' : '♡'}
                </button>
                <button type="button" className="quality-action" onClick={() => cycleQuality(visibleMovie.id)}>
                  {visibleMovie.selectedQuality}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="movie-filter-tabs visible" role="tablist" aria-label="Filtri film">
          {movieFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? 'active' : ''}
              onClick={() => selectFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <MediaRail
          title={searchQuery || activeFilter !== 'Tutti' ? 'Risultati' : 'Consigliati per te'}
          items={filteredMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Nessun film trovato con questi filtri."
        />

        <ContinueRail
          title="Continua a guardare"
          items={continueMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Qui appariranno i film che inizi a guardare."
          type="film"
        />

        <MediaRail
          title="Nuovi arrivi"
          items={newMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Nessun nuovo arrivo disponibile."
        />

        <MediaRail
          title="Film in 4K"
          items={fourKMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Nessun film 4K disponibile."
        />

        <MediaRail
          title="Azione"
          items={actionMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Nessun film d’azione disponibile."
        />

        <MediaRail
          title="Fantascienza"
          items={sciFiMovies}
          selectedItem={visibleMovie}
          onSelect={setSelectedMovie}
          onOpen={openDetail}
          emptyText="Nessun film di fantascienza disponibile."
        />

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Apri scheda' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Preferito' },
            { key: 'verde', color: 'green', label: 'Filtri' },
            { key: 'giallo', color: 'yellow', label: 'Ordina' },
            { key: 'blu', color: 'blue', label: 'Qualità' }
          ]}
        />
      </main>
    </div>
  );
}
