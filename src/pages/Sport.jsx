import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ChannelLogo from '../components/ChannelLogo.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import RemoteLegend from '../components/RemoteLegend.jsx';
import { detectSportContent, sportChannels, sportEvents, sportFilters } from '../data/sports.js';

const initialFavoriteEvents = sportEvents.filter((item) => item.favorite).map((item) => item.id);
const initialFavoriteChannels = sportChannels.filter((item) => item.favorite).map((item) => item.id);

function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.2-4.35-9.6-8.65C.58 9.08 2.2 5.2 5.85 4.45 8 4.02 10.04 5.04 12 7.12c1.96-2.08 4-3.1 6.15-2.67 3.65.75 5.27 4.63 3.45 7.9C19.2 16.65 12 21 12 21Z" />
    </svg>
  );
}

function EventCard({ event, selected, onSelect, onToggleFavorite }) {
  return (
    <article
      className={selected ? 'sport-event-card glass-panel selected' : 'sport-event-card glass-panel'}
      style={{ '--sport-bg': `url(${event.backdrop})` }}
      onMouseEnter={() => onSelect(event)}
    >
      <button type="button" className="sport-event-main" onClick={() => onSelect(event)}>
        <span className="sport-event-bg" />
        <span className="sport-event-copy">
          <span className="sport-status live">Live ora</span>
          <strong>{event.title}</strong>
          <small>{event.competition} · {event.time}</small>
          <span className="sport-event-meta">
            <span>{event.sport}</span>
            <span>{event.channel}</span>
            <span>{event.quality}</span>
          </span>
          <ProgressBar value={event.progress} />
        </span>
      </button>

      <button
        type="button"
        className={event.favorite ? 'sport-favorite active' : 'sport-favorite'}
        aria-label={event.favorite ? 'Rimuovi preferito' : 'Aggiungi preferito'}
        onClick={() => onToggleFavorite(event.id)}
      >
        <HeartIcon />
      </button>
    </article>
  );
}

function LiveNowCard({ event, selected, onSelect }) {
  return (
    <button
      type="button"
      key={event.id}
      className={selected ? 'sport-live-now-card glass-panel selected' : 'sport-live-now-card glass-panel'}
      onClick={() => onSelect(event)}
    >
      <ChannelLogo text={event.logo} />
      <div>
        <span>{event.sport}</span>
        <strong>{event.title}</strong>
        <small>{event.competition} · {event.quality}</small>
      </div>
    </button>
  );
}

function ChannelSportCard({ channel, selected, onSelect, onToggleFavorite }) {
  return (
    <article className={selected ? 'sport-channel-card glass-panel selected' : 'sport-channel-card glass-panel'}>
      <button type="button" className="sport-channel-main" onClick={() => onSelect(channel)}>
        <ChannelLogo text={channel.logo} />
        <div>
          <strong>{channel.channel}</strong>
          <span>{channel.title}</span>
          <small>{channel.provider} · {channel.quality}</small>
        </div>
      </button>

      <button
        type="button"
        className={channel.favorite ? 'sport-favorite small active' : 'sport-favorite small'}
        aria-label={channel.favorite ? 'Rimuovi canale preferito' : 'Aggiungi canale preferito'}
        onClick={() => onToggleFavorite(channel.id)}
      >
        <HeartIcon />
      </button>
    </article>
  );
}

export default function Sport({ activePage = 'Sport', onNavigate = () => {} }) {
  const [activeFilter, setActiveFilter] = useState('Tutto');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(sportEvents[0]);
  const [favoriteEventIds, setFavoriteEventIds] = useState(() => new Set(initialFavoriteEvents));
  const [favoriteChannelIds, setFavoriteChannelIds] = useState(() => new Set(initialFavoriteChannels));

  const enrichedEvents = useMemo(() => sportEvents.map((event) => ({
    ...event,
    favorite: favoriteEventIds.has(event.id),
    detection: detectSportContent(event)
  })), [favoriteEventIds]);

  const enrichedChannels = useMemo(() => sportChannels.map((channel) => ({
    ...channel,
    favorite: favoriteChannelIds.has(channel.id)
  })), [favoriteChannelIds]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return enrichedEvents.filter((event) => {
      const filterMatch = activeFilter === 'Tutto'
        ? true
        : activeFilter === 'Live ora'
          ? event.status === 'Live ora'
          : event.sport === activeFilter;

      const searchMatch = !query || [
        event.title,
        event.competition,
        event.sport,
        event.channel,
        event.provider,
        event.status
      ].join(' ').toLowerCase().includes(query);

      return filterMatch && searchMatch;
    });
  }, [activeFilter, enrichedEvents, searchQuery]);

  const visibleEvent = filteredEvents.find((event) => event.id === selectedEvent?.id)
    || filteredEvents[0]
    || enrichedEvents[0];

  const liveEvents = enrichedEvents.filter((event) => event.status === 'Live ora');

  const filteredChannels = enrichedChannels.filter((channel) => {
    const query = searchQuery.trim().toLowerCase();
    const filterMatch = activeFilter === 'Tutto' || activeFilter === 'Live ora'
      ? true
      : channel.category === activeFilter;

    const searchMatch = !query || [
      channel.channel,
      channel.provider,
      channel.category,
      channel.title,
      channel.group
    ].join(' ').toLowerCase().includes(query);

    return filterMatch && searchMatch;
  });

  function toggleEventFavorite(id) {
    setFavoriteEventIds((current) => {
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  }

  function toggleChannelFavorite(id) {
    setFavoriteChannelIds((current) => {
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main sport-page clean-library-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={onNavigate}
          placeholder="Cerca sport, competizioni, DAZN, Sky, canali..."
        />

        <header className="clean-page-header sport-header">
          <div>
            <span className="eyebrow">Eventi, dirette e canali</span>
            <h1>Sport</h1>
            <p>Tutti gli eventi sportivi live in un’unica sezione.</p>
          </div>
        </header>

        <div className="movie-filter-tabs visible clean-filter-tabs" role="tablist" aria-label="Filtri sport">
          {sportFilters.map((filter) => (
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

        {visibleEvent ? (
          <section className="sport-focus glass-panel" style={{ '--sport-focus-bg': `url(${visibleEvent.backdrop})` }}>
            <div className="sport-focus-copy">
              <span className="sport-status live">Live ora</span>
              <h2>{visibleEvent.title}</h2>
              <div className="sport-focus-meta">
                <span>{visibleEvent.competition}</span>
                <span>{visibleEvent.sport}</span>
                <span>{visibleEvent.time}</span>
                <span>{visibleEvent.channel}</span>
                <span>{visibleEvent.quality}</span>
              </div>
              <p>{visibleEvent.description}</p>
              {visibleEvent.score ? <strong className="sport-score">{visibleEvent.score}</strong> : null}
              <div className="sport-focus-progress">
                <ProgressBar value={visibleEvent.progress} />
              </div>
              <div className="sport-actions">
                <button type="button" className="primary">▶ Guarda evento</button>
                <button type="button" className="secondary">Info</button>
                <button
                  type="button"
                  className={visibleEvent.favorite ? 'round-action favorite-active' : 'round-action'}
                  onClick={() => toggleEventFavorite(visibleEvent.id)}
                >
                  {visibleEvent.favorite ? '♥' : '♡'}
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <section className="sport-section">
          <div className="section-heading">
            <h2>{activeFilter === 'Tutto' ? 'Eventi in evidenza' : `Eventi ${activeFilter}`}</h2>
            <button type="button">Vedi tutti</button>
          </div>

          {filteredEvents.length ? (
            <div className="sport-events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selected={visibleEvent?.id === event.id}
                  onSelect={setSelectedEvent}
                  onToggleFavorite={toggleEventFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="film-empty-row glass-panel">Nessun evento sportivo trovato.</div>
          )}
        </section>

        <section className="sport-section">
          <div className="section-heading">
            <h2>Live ora</h2>
            <button type="button">Vedi tutti</button>
          </div>

          <div className="sport-live-now-grid">
            {liveEvents.map((event) => (
              <LiveNowCard
                key={event.id}
                event={event}
                selected={visibleEvent?.id === event.id}
                onSelect={setSelectedEvent}
              />
            ))}
          </div>
        </section>

        <section className="sport-section">
          <div className="section-heading">
            <h2>Canali sportivi</h2>
            <button type="button">Aggiorna</button>
          </div>

          {filteredChannels.length ? (
            <div className="sport-channels-grid">
              {filteredChannels.map((channel) => (
                <ChannelSportCard
                  key={channel.id}
                  channel={channel}
                  selected={selectedEvent?.channel === channel.channel}
                  onSelect={() => setSelectedEvent(enrichedEvents.find((event) => event.channel === channel.channel) || visibleEvent)}
                  onToggleFavorite={toggleChannelFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="film-empty-row glass-panel">Nessun canale sportivo trovato con questi filtri.</div>
          )}
        </section>

        <RemoteLegend
          commands={[
            { key: 'OK', label: 'Apri evento' },
            { key: 'BACK', label: 'Indietro' },
            { key: 'rosso', color: 'red', label: 'Preferito' },
            { key: 'verde', color: 'green', label: 'Filtra sport' },
            { key: 'giallo', color: 'yellow', label: 'Vedi tutti' },
            { key: 'blu', color: 'blue', label: 'Info' }
          ]}
        />
      </main>
    </div>
  );
}
