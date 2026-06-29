import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import Hero from '../components/Hero.jsx';
import RecentChannels from '../components/RecentChannels.jsx';
import Carousel from '../components/Carousel.jsx';
import ChannelCard from '../components/ChannelCard.jsx';
import MovieCard from '../components/MovieCard.jsx';
import ContinueCard from '../components/ContinueCard.jsx';
import { channels } from '../data/channels.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';
import { continueWatching } from '../data/continueWatching.js';

export default function Home({ activePage = 'Home', onNavigate = () => {} }) {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);

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
          <Hero item={selectedChannel} />
          <RecentChannels
            channels={channels.slice(0, 3)}
            selectedId={selectedChannel.id}
            onSelect={setSelectedChannel}
          />
        </div>

        <Carousel title="❤ Canali preferiti" action={null}>
          {channels.map((item) => (
            <ChannelCard
              key={item.id}
              item={item}
              selected={selectedChannel.id === item.id}
              onSelect={setSelectedChannel}
            />
          ))}
        </Carousel>

        <Carousel title="▶ Continua a guardare" action={null} className="continue-carousel">
          {continueWatching.map((item) => (
            <ContinueCard key={item.id} item={item} />
          ))}
        </Carousel>

        <Carousel title="🎬 Film più visti" action={null} className="poster-carousel">
          {movies.map((item) => <MovieCard key={item.title} item={item} />)}
        </Carousel>

        <Carousel title="📺 Serie TV più viste" action={null} className="poster-carousel bottom-spacer">
          {series.map((item) => <MovieCard key={item.title} item={item} />)}
        </Carousel>
      </main>
    </div>
  );
}
