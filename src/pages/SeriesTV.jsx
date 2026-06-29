import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import MediaDetail from '../components/MediaDetail.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { ContinueRail, MediaRail } from '../components/MediaSections.jsx';
import { seriesFilters, series } from '../data/series.js';
import useAuraLibrary from '../services/useAuraLibrary.js';

const initialFavoriteIds = series.filter((item) => item.favorite).map((item) => item.id);

export default function SeriesTV({ activePage = 'Serie TV', onNavigate = () => {} }) {
  const library = useAuraLibrary();
  const sourceSeries = library.series.length ? library.series : series;
  const filters = library.series.length ? ['Tutte', ...Array.from(new Set(sourceSeries.flatMap((item) => item.genres || []))), '4K'] : seriesFilters;

  const [activeFilter, setActiveFilter] = useState('Tutte');
  const [selectedSeries, setSelectedSeries] = useState(series[0]);
  const [detailSeries, setDetailSeries] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuality, setSelectedQuality] = useState(() => Object.fromEntries(
    sourceSeries.map((item) => [item.id, item.quality])
  ));

  const enrichedSeries = useMemo(() => sourceSeries.map((item) => ({
    ...item,
    favorite: favoriteIds.has(item.id),
    selectedQuality: selectedQuality[item.id] || item.quality
  })), [favoriteIds, selectedQuality, sourceSeries]);

  const filteredSeries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return enrichedSeries.filter((item) => {
      const filterMatch = activeFilter === 'Tutte'
        ? true
        : activeFilter === 'Consigliate'
          ? ['Consigliata', 'Cult', 'Sci-fi', 'Star Wars'].includes(item.tag) || item.source === 'Consigliate'
          : activeFilter === 'Più viste'
            ? item.source === 'Più viste'
            : activeFilter === 'Nuovi episodi'
              ? item.source === 'Nuovi episodi' || item.tag === 'Nuovi episodi'
              : activeFilter === '4K'
                ? item.availableQualities.includes('4K')
                : item.genres.includes(activeFilter);

      const searchMatch = !query || [
        item.title,
        item.originalTitle,
        item.year,
        item.genres.join(' '),
        item.cast.join(' '),
        item.creators,
        item.quality
      ].join(' ').toLowerCase().includes(query);

      return filterMatch && searchMatch;
    });
  }, [activeFilter, enrichedSeries, searchQuery]);

  const visibleSeries = filteredSeries.find((item) => item.id === selectedSeries.id)
    || filteredSeries[0]
    || enrichedSeries[0]
    || selectedSeries;

  const liveDetailSeries = detailSeries
    ? enrichedSeries.find((item) => item.id === detailSeries.id) || detailSeries
    : null;

  const continueSeries = enrichedSeries.filter((item) => item.progress > 0).slice(0, 4);
  const newEpisodes = enrichedSeries.filter((item) => item.source === 'Nuovi episodi' || item.tag === 'Nuovi episodi');
  const fourKSeries = enrichedSeries.filter((item) => item.availableQualities.includes('4K'));
  const dramaSeries = enrichedSeries.filter((item) => item.genres.includes('Drammatico'));
  const sciFiSeries = enrichedSeries.filter((item) => item.genres.includes('Fantascienza'));

  function selectFilter(filter) {
    setActiveFilter(filter);
    const next = enrichedSeries.find((item) => {
      if (filter === 'Tutte') return true;
      if (filter === 'Consigliate') return ['Consigliata', 'Cult', 'Sci-fi', 'Star Wars'].includes(item.tag) || item.source === 'Consigliate';
      if (filter === 'Più viste') return item.source === 'Più viste';
      if (filter === 'Nuovi episodi') return item.source === 'Nuovi episodi' || item.tag === 'Nuovi episodi';
      if (filter === '4K') return item.availableQualities.includes('4K');
      return item.genres.includes(filter);
    });
    if (next) setSelectedSeries(next);
  }

  function toggleFavorite(seriesId) {
    setFavoriteIds((current) => {
      const updated = new Set(current);
      if (updated.has(seriesId)) {
        updated.delete(seriesId);
      } else {
        updated.add(seriesId);
      }
      return updated;
    });
  }

  function cycleQuality(seriesId) {
    setSelectedQuality((current) => {
      const item = sourceSeries.find((entry) => entry.id === seriesId);
      if (!item?.availableQualities?.length) return current;
      const options = item.availableQualities;
      const currentValue = current[seriesId] || item.quality || options[0];
      const nextIndex = (options.indexOf(currentValue) + 1) % options.length;
      return {
        ...current,
        [seriesId]: options[nextIndex]
      };
    });
  }

  function openDetail(item) {
    setSelectedSeries(item);
    setDetailSeries(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (liveDetailSeries) {
    const related = enrichedSeries.filter((item) => item.id !== liveDetailSeries.id && (
      item.genres.some((genre) => liveDetailSeries.genres.includes(genre))
      || item.availableQualities.includes(liveDetailSeries.selectedQuality)
    ));

    return (
      <MediaDetail
        activePage={activePage}
        onNavigate={onNavigate}
        item={liveDetailSeries}
        type="series"
        onBack={() => setDetailSeries(null)}
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

      <main className="app-main movies-page series-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Cerca serie TV, cast, stagioni, generi..."
          onNavigate={onNavigate}
        />

        <section className="movies-hero glass-panel" style={{ '--movie-bg': `url(${visibleSeries.backdrop})` }}>
          <div className="movie-hero-content clean">
            <button
              type="button"
              className="movie-poster-large poster-clickable"
              style={{ '--poster': `url(${visibleSeries.poster})` }}
              onClick={() => openDetail(visibleSeries)}
              aria-label={`Apri scheda di ${visibleSeries.title}`}
            />

            <div className="movie-hero-copy">
              <span className="eyebrow">Serie TV in evidenza</span>
              <h1>{visibleSeries.title}</h1>
              <div className="movie-meta-line">
                <span>{visibleSeries.year}</span>
                <span>{visibleSeries.seasons}</span>
                <span>{visibleSeries.episodes}</span>
                <span>{visibleSeries.genres.join(' · ')}</span>
                <span>{visibleSeries.selectedQuality}</span>
                <span>★ {visibleSeries.rating}</span>
              </div>
              <p>{visibleSeries.description}</p>
              <p className="hero-cast-line">
                <strong>Cast:</strong> {visibleSeries.cast.join(' · ')}
              </p>
              <p className="hero-cast-line">
                <strong>Creatori:</strong> {visibleSeries.creators}
              </p>

              {visibleSeries.progress > 0 ? (
                <div className="movie-progress">
                  <div className="movie-progress-head">
                    <span>{visibleSeries.continueLabel}</span>
                    <strong>{visibleSeries.progress}%</strong>
                  </div>
                  <ProgressBar value={visibleSeries.progress} />
                </div>
              ) : null}

              <div className="movie-actions">
                <button type="button" className="primary">▶ Guarda ora</button>
                <button type="button" className="secondary" onClick={() => openDetail(visibleSeries)}>
                  Apri scheda
                </button>
                <button
                  type="button"
                  className={visibleSeries.favorite ? 'round-action favorite-active' : 'round-action'}
                  onClick={() => toggleFavorite(visibleSeries.id)}
                  aria-label={visibleSeries.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                >
                  {visibleSeries.favorite ? '♥' : '♡'}
                </button>
                <button type="button" className="quality-action" onClick={() => cycleQuality(visibleSeries.id)}>
                  {visibleSeries.selectedQuality}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="movie-filter-tabs visible" role="tablist" aria-label="Filtri serie TV">
          {filters.map((filter) => (
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
          title={searchQuery || activeFilter !== 'Tutte' ? 'Risultati' : 'Consigliate per te'}
          items={filteredSeries}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Nessuna serie trovata con questi filtri."
        />

        <ContinueRail
          title="Continua a guardare"
          items={continueSeries}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Qui appariranno gli episodi iniziati."
          type="series"
        />

        <MediaRail
          title="Nuovi episodi"
          items={newEpisodes}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Nessun nuovo episodio disponibile."
        />

        <MediaRail
          title="Serie in 4K"
          items={fourKSeries}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Nessuna serie 4K disponibile."
        />

        <MediaRail
          title="Drammatiche"
          items={dramaSeries}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Nessuna serie drammatica disponibile."
        />

        <MediaRail
          title="Fantascienza"
          items={sciFiSeries}
          selectedItem={visibleSeries}
          onSelect={setSelectedSeries}
          onOpen={openDetail}
          emptyText="Nessuna serie di fantascienza disponibile."
        />

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Apri scheda' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Preferito' },
            { key: 'verde', color: 'green', label: 'Filtri' },
            { key: 'giallo', color: 'yellow', label: 'Stagioni' },
            { key: 'blu', color: 'blue', label: 'Qualità' }
          ]}
        />
      </main>
    </div>
  );
}
