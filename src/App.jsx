import { useState } from 'react';
import Home from './pages/Home.jsx';
import LiveTV from './pages/LiveTV.jsx';
import Movies from './pages/Movies.jsx';
import SeriesTV from './pages/SeriesTV.jsx';
import Favorites from './pages/Favorites.jsx';
import Resume from './pages/Resume.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('Home');

  if (activePage === 'Live TV') {
    return <LiveTV activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage === 'Film') {
    return <Movies activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage === 'Serie TV') {
    return <SeriesTV activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage === 'Preferiti') {
    return <Favorites activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage === 'Riprendi') {
    return <Resume activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage !== 'Home') {
    return <PlaceholderPage activePage={activePage} onNavigate={setActivePage} />;
  }

  return <Home activePage={activePage} onNavigate={setActivePage} />;
}
