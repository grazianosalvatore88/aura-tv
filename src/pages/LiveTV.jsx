import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import ChannelLogo from '../components/ChannelLogo.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { guideRows, liveCategories, liveChannels } from '../data/liveChannels.js';

export default function LiveTV({ activePage = 'Live TV', onNavigate = () => {} }) {
  const [activeCategory, setActiveCategory] = useState('Tutti');
  const [selectedChannel, setSelectedChannel] = useState(liveChannels[0]);

  const filteredChannels = useMemo(() => {
    if (activeCategory === 'Tutti') return liveChannels;
    if (activeCategory === 'Preferiti') return liveChannels.filter((item) => item.favorite);
    return liveChannels.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const visibleChannel = filteredChannels.find((item) => item.id === selectedChannel.id) || filteredChannels[0] || selectedChannel;

  function selectCategory(category) {
    setActiveCategory(category);
    const next = category === 'Tutti'
      ? liveChannels[0]
      : category === 'Preferiti'
        ? liveChannels.find((item) => item.favorite)
        : liveChannels.find((item) => item.category === category);
    if (next) setSelectedChannel(next);
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main live-page">
        <TopMenu />

        <div className="page-title-row">
          <div>
            <span className="eyebrow">Modalità decoder</span>
            <h1>Live TV</h1>
          </div>
          <div className="remote-hint glass-control">
            <span>CH+ / CH−</span>
            <strong>Cambia canale senza uscire dal player</strong>
          </div>
        </div>

        <div className="live-tabs" role="tablist" aria-label="Categorie Live TV">
          {liveCategories.map((category) => (
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

        <section className="live-workspace">
          <aside className="live-channel-panel glass-panel">
            <div className="live-panel-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4.2-4.2" />
              </svg>
              <span>Cerca canale...</span>
            </div>

            <div className="live-channel-list">
              {filteredChannels.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={visibleChannel.id === item.id ? 'live-channel-row active' : 'live-channel-row'}
                  onClick={() => setSelectedChannel(item)}
                  onMouseEnter={() => setSelectedChannel(item)}
                >
                  <span className="channel-number">{item.number}</span>
                  <ChannelLogo text={item.logo} />
                  <span className="channel-row-copy">
                    <strong>{item.channel}</strong>
                    <small>{item.title}</small>
                  </span>
                  <span className="heart">{item.favorite ? '♥' : '♡'}</span>
                </button>
              ))}
            </div>

            <div className="channel-count">1 - {filteredChannels.length} di {liveChannels.length} canali</div>
          </aside>

          <section className="live-preview glass-panel" style={{ '--live-bg': `url(${visibleChannel.background})` }}>
            <div className="live-preview-content">
              <div className="live-preview-top">
                <ChannelLogo text={visibleChannel.logo} />
                <span className="live-badge">LIVE</span>
              </div>

              <div className="live-now-copy">
                <span>Ora in onda · {visibleChannel.time}</span>
                <h2>{visibleChannel.title}</h2>
                <h3>{visibleChannel.subtitle}</h3>
                <p>{visibleChannel.description}</p>
                <ProgressBar value={visibleChannel.progress} />
              </div>

              <div className="live-actions">
                <button className="primary">▶ Guarda canale</button>
                <button className="round-action" aria-label="Dettagli">ⓘ</button>
                <button className="round-action" aria-label="Aggiungi ai preferiti">♡</button>
                <button className="round-action" aria-label="Guida TV">▤</button>
              </div>
            </div>
          </section>
        </section>

        <section className="tv-guide glass-panel">
          <div className="guide-heading">
            <div>
              <span className="eyebrow">EPG</span>
              <h2>Guida TV</h2>
            </div>
            <button type="button">Oggi ▾</button>
          </div>

          <div className="time-rail">
            <span>21:30</span>
            <span>22:00</span>
            <span>22:30</span>
            <span>23:00</span>
            <span>23:30</span>
            <span>00:00</span>
          </div>

          <div className="guide-grid">
            {guideRows.map((row) => (
              <div className="guide-row" key={row.channel}>
                <div className="guide-channel-name">
                  <ChannelLogo text={row.logo} />
                  <strong>{row.channel}</strong>
                </div>
                <div className="guide-programs">
                  {row.programs.map((program) => (
                    <button key={program.title} type="button" className={program.active ? 'active' : ''}>
                      <strong>{program.title}</strong>
                      <span>{program.time}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="remote-bar glass-panel">
          <span><b>OK</b> Guarda canale</span>
          <span><b>CH+/CH−</b> Cambia canale</span>
          <span><b>INFO</b> Programma</span>
          <span><b>BACK</b> Torna alla lista</span>
        </section>
      </main>
    </div>
  );
}
