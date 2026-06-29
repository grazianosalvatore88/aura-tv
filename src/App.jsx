import { useState } from 'react';
import Home from './pages/Home.jsx';
import LiveTV from './pages/LiveTV.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('Home');

  if (activePage === 'Live TV') {
    return <LiveTV activePage={activePage} onNavigate={setActivePage} />;
  }

  if (activePage !== 'Home') {
    return <PlaceholderPage activePage={activePage} onNavigate={setActivePage} />;
  }

  return <Home activePage={activePage} onNavigate={setActivePage} />;
}
