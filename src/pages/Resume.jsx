import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import MediaDetail from '../components/MediaDetail.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';

const resumeFilters = ['Tutto', 'Film', 'Serie TV'];

function ResumeCard({ item, type, selected, onSelect, onOpen, onRemove }) {
  return (
    <article
      className={selected ? 'resume-card-v23 glass-panel selected' : 'resume-card-v23 glass-panel'}
      style={{ '--resume-bg': `url(${item.backdrop})` }}
      onMouseEnter={() => onSelect(item)}
    >
      <button
        type="button"
        className="resume-card-main-v23"
        onClick={() => onOpen(item)}
      >
        <span className="resume-card-shade-v23" />
        <span className="resume-card-content-v23">
          <span className="continue-type">{type === 'series' ? item.currentEpisode : 'Film'}</span>
          <strong>{item.title}</strong>
          <small>{item.continueLabel}</small>
          <span className="resume-card-meta">
            <span>{type === 'series' ? item.seasons : item.duration}</span>
            <span>{item.selectedQuality}</span>
            <span>★ {item.rating}</span>
          </span>
          <ProgressBar value={item.progress} />
        </span>
      </button>

      <button
        type="button"
        className="resume-remove-v23"
        onClick={() => onRemove(item.id, type)}
      >
        Rimuovi
      </button>
    </article>
  );
}

export default function Resume({ activePage = 'Riprendi', onNavigate = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('Tutto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detail, setDetail] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [sortMode, setSortMode] = useState('recenti');
  const [movieQuality, setMovieQuality] = useState(() => Object.fromEntries(movies.map((item) => [item.id, item.quality])));
  const [seriesQuality, setSeriesQuality] = useState(() => Object.fromEntries(series.map((item) => [item.id, item.quality])));

  const resumeMovies = useMemo(() => movies
    .filter((item) => item.progress > 0 && !hiddenIds.has(`film:${item.id}`))
    .map((item) => ({
      ...item,
      type: 'film',
      favorite: item.favorite,
      selectedQuality: movieQuality[item.id] || item.quality
    })), [hiddenIds, movieQuality]);

  const resumeSeries = useMemo(() => series
    .filter((item) => item.progress > 0 && !hiddenIds.has(`series:${item.id}`))
    .map((item) => ({
      ...item,
      type: 'series',
      favorite: item.favorite,
      selectedQuality: seriesQuality[item.id] || item.quality
    })), [hiddenIds, seriesQuality]);

  const resumeItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let items = [
      ...(activeFilter === 'Tutto' || activeFilter === 'Film' ? resumeMovies : []),
      ...(activeFilter === 'Tutto' || activeFilter === 'Serie TV' ? resumeSeries : [])
    ];

    if (query) {
      items = items.filter((item) => [
        item.title,
        item.originalTitle,
        item.genres.join(' '),
        item.cast.join(' ')
      ].join(' ').toLowerCase().includes(query));
    }

    if (sortMode === 'avanzamento') {
      return [...items].sort((a, b) => b.progress - a.progress);
    }

    return items;
  }, [activeFilter, resumeMovies, resumeSeries, searchQuery, sortMode]);

  const selectedResumeItem = selectedItem || resumeItems[0] || resumeMovies[0] || resumeSeries[0];

  function removeFromResume(id, type) {
    setHiddenIds((current) => new Set(current).add(`${type}:${id}`));
    if (selectedItem?.id === id) setSelectedItem(null);
  }

  function cycleQuality(id, type) {
    if (type === 'film') {
      setMovieQuality((current) => {
        const item = movies.find((movie) => movie.id === id);
        if (!item?.availableQualities?.length) return current;
        const options = item.availableQualities;
        const currentValue = current[id] || item.quality || options[0];
        const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
        return { ...current, [id]: options[nextIndex] };
      });
    }

    if (type === 'series') {
      setSeriesQuality((current) => {
        const item = series.find((entry) => entry.id === id);
        if (!item?.availableQualities?.length) return current;
        const options = item.availableQualities;
        const currentValue = current[id] || item.quality || options[0];
        const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
        return { ...current, [id]: options[nextIndex] };
      });
    }
  }

  function openDetail(item) {
    setSelectedItem(item);
    setDetail({ type: item.type, item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleSort() {
    setSortMode((current) => current === 'recenti' ? 'avanzamento' : 'recenti');
  }

  if (detail?.type === 'film') {
    const liveItem = resumeMovies.find((item) => item.id === detail.item.id) || detail.item;
    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveItem}
        type="film"
        onBack={() => setDetail(null)}
        onToggleFavorite={() => {}}
        onCycleQuality={(id) => cycleQuality(id, 'film')}
        relatedItems={resumeMovies.filter((item) => item.id !== liveItem.id)}
        onOpenRelated={openDetail}
      />
    );
  }

  if (detail?.type === 'series') {
    const liveItem = resumeSeries.find((item) => item.id === detail.item.id) || detail.item;
    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveItem}
        type="series"
        onBack={() => setDetail(null)}
        onToggleFavorite={() => {}}
        onCycleQuality={(id) => cycleQuality(id, 'series')}
        relatedItems={resumeSeries.filter((item) => item.id !== liveItem.id)}
        onOpenRelated={openDetail}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main resume-page clean-library-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Cerca tra film e serie iniziati..."
          onNavigate={onNavigate}
        />

        <header className="clean-page-header">
          <div>
            <span className="eyebrow">Continua da dove eri rimasto</span>
            <h1>Riprendi</h1>
            <p>Solo film e serie TV iniziati, senza canali live o sport.</p>
          </div>
        </header>

        <div className="resume-toolbar-v23">
          <div className="movie-filter-tabs visible clean-filter-tabs" role="tablist" aria-label="Filtri Riprendi">
            {resumeFilters.map((filter) => (
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

          <button type="button" className="sort-pill glass-control" onClick={toggleSort}>
            Ordine: {sortMode === 'recenti' ? 'Recenti' : 'Avanzamento'}
          </button>
        </div>

        {resumeItems.length ? (
          <section className="resume-grid-v23">
            {resumeItems.map((item) => (
              <ResumeCard
                key={`${item.type}-${item.id}`}
                item={item}
                type={item.type}
                selected={selectedResumeItem?.id === item.id}
                onSelect={setSelectedItem}
                onOpen={openDetail}
                onRemove={removeFromResume}
              />
            ))}
          </section>
        ) : (
          <div className="resume-empty glass-panel">
            <strong>Nessun contenuto da riprendere</strong>
            <span>Quando inizi un film o un episodio, lo troverai qui.</span>
          </div>
        )}

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Riprendi' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Rimuovi' },
            { key: 'verde', color: 'green', label: 'Filtra' },
            { key: 'giallo', color: 'yellow', label: 'Ordina' },
            { key: 'blu', color: 'blue', label: 'Info' }
          ]}
        />
      </main>
    </div>
  );
}
