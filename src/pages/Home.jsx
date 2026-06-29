import { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import Hero from '../components/Hero.jsx';
import RecentChannels from '../components/RecentChannels.jsx';
import Carousel from '../components/Carousel.jsx';
import ChannelCard from '../components/ChannelCard.jsx';
import MovieCard from '../components/MovieCard.jsx';
import ContinueCard from '../components/ContinueCard.jsx';
import SidebarIcon from '../components/SidebarIcon.jsx';
import PlayerScreen from '../components/PlayerScreen.jsx';
import useAuraLibrary from '../services/useAuraLibrary.js';
import { channels } from '../data/channels.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';
import { continueWatching } from '../data/continueWatching.js';

function toHomeMovie(item) {
  return {
    title: item.title,
    meta: item.meta || `${item.genres?.[0] || 'Film'} · ${item.quality || item.selectedQuality || 'HD'}`,
    image: item.image || item.poster || item.backdrop
  };
}

export default function Home({ activePage = 'Home', onNavigate = () => {} }) {
  const library = useAuraLibrary();
  const homeChannels = library.channels.length ? library.channels : channels;
  const homeMovies = library.movies.length ? library.movies.map(toHomeMovie) : movies;
  const homeSeries = library.series.length ? library.series.map(toHomeMovie) : series;
  const [selectedChannel, setSelectedChannel] = useState(homeChannels[0] || channels[0]);
  const [playerChannel, setPlayerChannel] = useState(null);

  const visibleSelectedChannel = useMemo(() => (
    homeChannels.find((item) => item.id === selectedChannel?.id) || homeChannels[0] || channels[0]
  ), [homeChannels, selectedChannel?.id]);

  const realSourceActive = library.ready && library.channels.length > 0;

  if (playerChannel) {
    return (
      <PlayerScreen
        mode="live"
        channel={playerChannel}
        onBack={() => setPlayerChannel(null)}
      />
    );
  }

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <main className="app-main">
        <TopMenu 
          onNavigate={onNavigate}
        />

        <div className="hero-grid">
          <Hero item={visibleSelectedChannel} onWatch={setPlayerChannel} onInfo={setSelectedChannel} />
          <RecentChannels
            channels={homeChannels.slice(0, 3)}
            selectedId={visibleSelectedChannel.id}
            onSelect={setSelectedChannel}
            onOpen={setPlayerChannel}
          />
        </div>

        <Carousel title={realSourceActive ? 'Canali dalla tua lista' : '❤ Canali preferiti'} action={null}>
          {homeChannels.slice(0, 12).map((item) => (
            <ChannelCard
              key={item.id}
              item={item}
              selected={visibleSelectedChannel.id === item.id}
              onSelect={setSelectedChannel}
              onOpen={setPlayerChannel}
            />
          ))}
        </Carousel>

        <Carousel title="▶ Continua a guardare" action={null} className="continue-carousel">
          {continueWatching.map((item) => (
            <ContinueCard key={item.id} item={item} />
          ))}
        </Carousel>

        <Carousel title={<span className="carousel-title-with-icon"><SidebarIcon name="film" size={24} /> {library.movies.length ? 'Film dalla tua lista' : 'Film più visti'}</span>} action={null} className="poster-carousel">
          {homeMovies.map((item) => <MovieCard key={item.id || item.title} item={item} />)}
        </Carousel>

        <Carousel title={<span className="carousel-title-with-icon"><SidebarIcon name="series" size={24} /> {library.series.length ? 'Serie TV dalla tua lista' : 'Serie TV più viste'}</span>} action={null} className="poster-carousel bottom-spacer">
          {homeSeries.map((item) => <MovieCard key={item.id || item.title} item={item} />)}
        </Carousel>
      </main>
    </div>
  );
}
