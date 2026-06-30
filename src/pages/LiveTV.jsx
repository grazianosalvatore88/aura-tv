import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ChannelLogo from '../components/ChannelLogo.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import PlayerScreen from '../components/PlayerScreen.jsx';
import { guideRows, liveCategories, liveChannels } from '../data/liveChannels.js';
import { loadAuraSettings } from '../services/xtreamService.js';
import { loadAuraCoreLibrary } from '../core/auraCore.js';

const FAVORITES_KEY = 'aura-live-favorites';

function loadFavoriteIds() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // fallback below
  }

  return new Set(liveChannels.filter((item) => item.favorite).map((item) => item.id));
}

function saveFavoriteIds(favoriteIds) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteIds)));
  } catch {
    // localStorage may be unavailable in some embedded browsers
  }
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="6" height="6" rx="1.4" />
      <rect x="14" y="5" width="6" height="6" rx="1.4" />
      <rect x="4" y="13" width="6" height="6" rx="1.4" />
      <rect x="14" y="13" width="6" height="6" rx="1.4" />
    </svg>
  );
}

function QualityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2.3" />
      <path d="M7 10h2l1 4 2-8 1 4h4" />
    </svg>
  );
}

export default function LiveTV({ activePage = 'Live TV', onNavigate = () => {} }) {
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [selectedChannel, setSelectedChannel] = useState(liveChannels[0]);
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [playerChannel, setPlayerChannel] = useState(null);
  const [resolutionMap, setResolutionMap] = useState({});
  const [library, setLibrary] = useState({
    mode: 'demo',
    channels: liveChannels,
    categories: liveCategories,
    stats: null
  });
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadLibrary() {
      const settings = loadAuraSettings();

      const sourceReady = ['M3U locale', 'M3U'].includes(settings?.sourceType)
        ? Boolean(settings?.m3u?.localText?.includes('#EXTM3U'))
        : Boolean(settings?.xtream?.serverUrl || settings?.xtream?.linkUrl);

      if (!sourceReady) {
        setLibrary({
          mode: 'demo',
          channels: liveChannels,
          categories: liveCategories,
          stats: null
        });
        setLibraryError('');
        setSelectedChannel(liveChannels[0]);
        return;
      }

      try {
        setLoadingLibrary(true);
        setLibraryError('');

        const result = await loadAuraCoreLibrary(settings);

        if (cancelled) return;

        if (result.channels.length) {
          setLibrary(result);
          setSelectedChannel(result.channels[0]);
          setActiveCategory('Tutti');
          setResolutionMap(Object.fromEntries(
            result.channels.map((item) => [item.id, item.selectedResolution || item.qualityLabel || 'HD'])
          ));
        } else {
          setLibrary({
            mode: 'demo',
            channels: liveChannels,
            categories: liveCategories,
            stats: null
          });
          setSelectedChannel(liveChannels[0]);
          setLibraryError('Lista letta ma nessun canale Live TV trovato.');
        }
      } catch (error) {
        if (cancelled) return;

        setLibrary({
          mode: 'demo',
          channels: liveChannels,
          categories: liveCategories,
          stats: null
        });
        setSelectedChannel(liveChannels[0]);
        setLibraryError(error.message || 'Errore caricamento lista. Sto mostrando i dati demo.');
      } finally {
        if (!cancelled) setLoadingLibrary(false);
      }
    }

    loadLibrary();

    function reloadLibrary() {
      loadLibrary();
    }

    window.addEventListener('aura-settings-updated', reloadLibrary);
    window.addEventListener('aura-epg-updated', reloadLibrary);

    return () => {
      cancelled = true;
      window.removeEventListener('aura-settings-updated', reloadLibrary);
      window.removeEventListener('aura-epg-updated', reloadLibrary);
    };
  }, []);

  const allChannels = library.channels?.length ? library.channels : liveChannels;
  const allCategories = library.categories?.length ? library.categories : liveCategories;

  const channelsWithFavorites = useMemo(() => (
    allChannels.map((item) => ({
      ...item,
      favorite: favoriteIds.has(item.id),
      selectedResolution: resolutionMap[item.id] || item.selectedResolution || item.qualityLabel || item.resolutions?.[0] || 'HD'
    }))
  ), [allChannels, favoriteIds, resolutionMap]);

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return channelsWithFavorites.filter((item) => {
      const categoryMatch = activeCategory === 'Tutti'
        ? true
        : activeCategory === 'Preferiti'
          ? item.favorite
          : item.category === activeCategory;

      const searchMatch = !query || [
        item.channel,
        item.rawName,
        item.title,
        item.subtitle,
        item.category,
        item.originalCategory,
        item.qualityLabel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, channelsWithFavorites, searchQuery]);

  useEffect(() => {
    if (!filteredChannels.length) return;

    const stillVisible = filteredChannels.find((item) => item.id === selectedChannel?.id);

    if (!stillVisible) {
      setSelectedChannel(filteredChannels[0]);
    }
  }, [filteredChannels, selectedChannel?.id]);

  const visibleChannel = filteredChannels.find((item) => item.id === selectedChannel?.id)
    || filteredChannels[0]
    || channelsWithFavorites[0]
    || liveChannels[0];

  const isFavorite = favoriteIds.has(visibleChannel.id);

  function selectCategory(category) {
    setActiveCategory(category);
    setShowCategories(true);

    const query = searchQuery.trim().toLowerCase();
    const next = channelsWithFavorites.find((item) => {
      const categoryMatch = category === 'Tutti'
        ? true
        : category === 'Preferiti'
          ? item.favorite
          : item.category === category;

      const searchMatch = !query || [item.channel, item.rawName, item.title, item.subtitle, item.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);

      return categoryMatch && searchMatch;
    });

    if (next) setSelectedChannel(next);
  }

  function toggleFavorite(channelId) {
    setFavoriteIds((current) => {
      const updated = new Set(current);

      if (updated.has(channelId)) {
        updated.delete(channelId);
      } else {
        updated.add(channelId);
      }

      saveFavoriteIds(updated);
      return updated;
    });
  }

  function cycleResolution(channelId) {
    setResolutionMap((current) => {
      const channel = allChannels.find((item) => item.id === channelId);
      if (!channel?.resolutions?.length) return current;

      const options = channel.resolutions;
      const currentValue = current[channelId] || channel.selectedResolution || channel.qualityLabel || options[0];
      const currentIndex = Math.max(0, options.indexOf(currentValue));
      const nextValue = options[(currentIndex + 1) % options.length];

      return {
        ...current,
        [channelId]: nextValue
      };
    });
  }

  function channelDirection(step) {
    if (!filteredChannels.length) return;

    const currentIndex = filteredChannels.findIndex((item) => item.id === visibleChannel.id);
    const safeIndex = currentIndex === -1 ? 0 : currentIndex;
    const nextIndex = (safeIndex + step + filteredChannels.length) % filteredChannels.length;

    setSelectedChannel(filteredChannels[nextIndex]);
  }

  function openPlayer(channel) {
    setPlayerChannel({
      ...channel,
      favorite: favoriteIds.has(channel.id)
    });
  }

  if (playerChannel) {
    const playerLiveChannel = channelsWithFavorites.find((item) => item.id === playerChannel.id) || visibleChannel || playerChannel;

    return (
      <PlayerScreen
        mode="live"
        channel={playerLiveChannel}
        onBack={() => setPlayerChannel(null)}
        onCycleQuality={() => cycleResolution(playerLiveChannel.id)}
        onToggleFavorite={() => toggleFavorite(playerLiveChannel.id)}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main live-page">
        <TopMenu
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onNavigate={onNavigate}
          placeholder="Cerca canali live, programmi, categorie..."
        />

        {showCategories ? (
          <div className="live-tabs" role="tablist" aria-label="Categorie Live TV">
            {allCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? 'active' : ''}
                onClick={() => selectCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        ) : (
          <div className="live-toolbar-row">
            <button type="button" className="toolbar-pill active" onClick={() => setShowCategories(true)}>
              Mostra categorie
            </button>
            <span>{activeCategory}</span>
          </div>
        )}

        <section className="live-workspace">
          <aside className="live-channel-panel glass-panel">
            <label className="live-panel-search" htmlFor="search-channel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4.2-4.2" />
              </svg>
              <input
                id="search-channel"
                type="search"
                placeholder="Cerca canale..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Cerca canale"
              />
            </label>

            <div className="live-channel-list">
              {filteredChannels.length ? filteredChannels.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={visibleChannel.id === item.id ? 'live-channel-row active' : 'live-channel-row'}
                  onClick={() => {
                    setSelectedChannel(item);
                    setShowInfoPanel(false);
                  }}
                  onMouseEnter={() => setSelectedChannel(item)}
                >
                  <span className="channel-number">{item.number}</span>
                  {item.icon ? <img src={item.icon} alt="" className="channel-logo-image" /> : <ChannelLogo text={item.logo} />}
                  <span className="channel-row-copy">
                    <strong>{item.channel}</strong>
                    <small>{item.title}</small>
                  </span>
                  <span className="channel-row-right">
                    <span className="row-quality">{item.selectedResolution}</span>
                    <span className="heart">{item.favorite ? '♥' : '♡'}</span>
                  </span>
                </button>
              )) : (
                <div className="empty-channel-state">
                  <strong>Nessun canale trovato</strong>
                  <span>Prova a cambiare categoria o modifica la ricerca.</span>
                </div>
              )}
            </div>

            <div className="channel-count">1 - {filteredChannels.length} di {channelsWithFavorites.length} canali</div>
          </aside>

          <section className="live-preview glass-panel" style={{ '--live-bg': `url(${visibleChannel.background})` }}>
            <div className="live-preview-content">
              <div className="live-preview-top">
                <div className="preview-brand-row">
                  {visibleChannel.icon ? <img src={visibleChannel.icon} alt="" className="preview-channel-image" /> : <ChannelLogo text={visibleChannel.logo} />}
                  <div className="preview-channel-meta">
                    <strong>{visibleChannel.channel}</strong>
                    <small>{visibleChannel.selectedResolution}</small>
                  </div>
                </div>
                <div className="preview-inline-actions">
                  <button type="button" className="pill-icon" onClick={() => setShowGuide((current) => !current)}>
                    <GridIcon />
                    <span>{showGuide ? 'Nascondi guida' : 'Guida TV'}</span>
                  </button>
                  <button type="button" className="pill-icon" onClick={() => cycleResolution(visibleChannel.id)}>
                    <QualityIcon />
                    <span>{visibleChannel.selectedResolution}</span>
                  </button>
                </div>
              </div>

              <div className="live-now-copy">
                <span>{visibleChannel.category} · {visibleChannel.time}</span>
                <h2>{visibleChannel.title}</h2>
                <h3>{visibleChannel.subtitle}</h3>
                <p>{visibleChannel.description}</p>
                <ProgressBar value={visibleChannel.progress} />
              </div>

              {showInfoPanel ? (
                <div className="info-panel glass-control">
                  <div>
                    <span className="eyebrow">Info canale</span>
                    <strong>{visibleChannel.channel}</strong>
                    <p>{visibleChannel.auraEngine?.originalName || visibleChannel.description}</p>
                  </div>
                  <div className="info-panel-meta">
                    <span>{visibleChannel.category}</span>
                    <span>{visibleChannel.selectedResolution}</span>
                    <span>{visibleChannel.source || 'Demo'}</span>
                  </div>
                </div>
              ) : null}

              <div className="live-actions">
                <button type="button" className="primary" onClick={() => openPlayer(visibleChannel)}>▶ Guarda canale</button>
                <button className="round-action text-action" aria-label="Informazioni programma" onClick={() => setShowInfoPanel((current) => !current)}>
                  Info
                </button>
                <button
                  type="button"
                  className={isFavorite ? 'round-action favorite-active' : 'round-action'}
                  aria-label={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                  onClick={() => toggleFavorite(visibleChannel.id)}
                >
                  {isFavorite ? '♥' : '♡'}
                </button>
                <button type="button" className="round-action" aria-label="Guida TV" onClick={() => setShowGuide((current) => !current)}>
                  <GridIcon />
                </button>
                <button type="button" className="round-action" aria-label="Cambia risoluzione" onClick={() => cycleResolution(visibleChannel.id)}>
                  <QualityIcon />
                </button>
              </div>
            </div>
          </section>
        </section>

        {showGuide ? (
          library.epg && filteredChannels.some((channel) => channel.epg) ? (
            <section className="tv-guide glass-panel">
              <div className="guide-heading">
                <div>
                  <h2>Guida TV</h2>
                </div>
                <button type="button">Oggi ▾</button>
              </div>

              <div className="guide-grid">
                {filteredChannels.filter((channel) => channel.epg).slice(0, 8).map((channel) => (
                  <div className="guide-row" key={channel.id}>
                    <div className="guide-channel-name">
                      {channel.icon ? <img src={channel.icon} alt="" className="channel-logo-image" /> : <ChannelLogo text={channel.logo} />}
                      <strong>{channel.channel}</strong>
                    </div>
                    <div className="guide-programs">
                      <button type="button" className="active">
                        <strong>{channel.title}</strong>
                        <span>{channel.time}</span>
                      </button>
                      {channel.nextProgram ? (
                        <button type="button">
                          <strong>{channel.nextProgram}</strong>
                          <span>Next</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null
        ) : null}

        <section className="remote-bar glass-panel" aria-label="Comandi telecomando">
          <button type="button" className="remote-command remote-button" onClick={() => channelDirection(-1)}>
            <span className="remote-key neutral">CH−</span>
            <span>Canale precedente</span>
          </button>
          <button type="button" className="remote-command remote-button" onClick={() => channelDirection(1)}>
            <span className="remote-key neutral">CH+</span>
            <span>Canale successivo</span>
          </button>
          <button
            type="button"
            className="remote-command remote-button"
            onClick={() => toggleFavorite(visibleChannel.id)}
            aria-label={isFavorite ? 'Rimuovi canale dai preferiti' : 'Aggiungi canale ai preferiti'}
          >
            <span className="remote-key color red" aria-hidden="true" />
            <span>{isFavorite ? 'Rimuovi preferito' : 'Aggiungi preferito'}</span>
          </button>
          <button type="button" className="remote-command remote-button" onClick={() => setShowGuide((current) => !current)}>
            <span className="remote-key color green" aria-hidden="true" />
            <span>{showGuide ? 'Nascondi guida' : 'Guida TV'}</span>
          </button>
          <button type="button" className="remote-command remote-button" onClick={() => setShowCategories((current) => !current)}>
            <span className="remote-key color yellow" aria-hidden="true" />
            <span>{showCategories ? 'Nascondi categorie' : 'Mostra categorie'}</span>
          </button>
          <button type="button" className="remote-command remote-button" onClick={() => cycleResolution(visibleChannel.id)}>
            <span className="remote-key color blue" aria-hidden="true" />
            <span>Risoluzione {visibleChannel.selectedResolution}</span>
          </button>
          <button type="button" className="remote-command remote-button" onClick={() => setShowInfoPanel((current) => !current)}>
            <span className="remote-key neutral">INFO</span>
            <span>{showInfoPanel ? 'Chiudi info' : 'Info programma'}</span>
          </button>
          <div className="remote-command">
            <span className="remote-key neutral">BACK</span>
            <span>Indietro</span>
          </div>
        </section>
      </main>
    </div>
  );
}
