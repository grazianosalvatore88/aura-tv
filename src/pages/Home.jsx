import { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import TopMenu from '../components/TopMenu.jsx';
import Hero from '../components/Hero.jsx';
import RecentChannels from '../components/RecentChannels.jsx';
import Carousel from '../components/Carousel.jsx';
import ChannelCard from '../components/ChannelCard.jsx';
import MovieCard from '../components/MovieCard.jsx';
import { channels } from '../data/channels.js';
import { movies } from '../data/movies.js';
import { series } from '../data/series.js';

export default function Home() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);

  return (
    <div className="aura-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <Sidebar />

      <main className="app-main">
        <TopMenu />

        <div className="hero-grid">
          <Hero item={selectedChannel} />
          <RecentChannels
            channels={channels}
            selectedId={selectedChannel.id}
            onSelect={setSelectedChannel}
          />
        </div>

        <Carousel title="❤ Canali preferiti">
          {channels.map((item) => (
            <ChannelCard
              key={item.id}
              item={item}
              selected={selectedChannel.id === item.id}
              onSelect={setSelectedChannel}
            />
          ))}
        </Carousel>

        <div className="media-grid">
          <Carousel title="Film più visti" className="media-carousel">
            {movies.map((item) => <MovieCard key={item.title} item={item} />)}
          </Carousel>

          <Carousel title="Serie TV più viste" className="media-carousel">
            {series.map((item) => <MovieCard key={item.title} item={item} />)}
          </Carousel>
        </div>
      </main>
    </div>
  );
}
