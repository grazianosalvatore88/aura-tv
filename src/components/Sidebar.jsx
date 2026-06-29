import SidebarIcon from './SidebarIcon.jsx';

const menuItems = [
  { label: 'Home', icon: 'home' },
  { label: 'Preferiti', icon: 'star' },
  { label: 'Live TV', icon: 'tv' },
  { label: 'Film', icon: 'film' },
  { label: 'Serie TV', icon: 'series' },
  { label: 'Sport', icon: 'sport' },
  { label: 'Riprendi', icon: 'play' }
];

export default function Sidebar({ activePage = 'Home', onNavigate = () => {} }) {
  return (
    <aside className="sidebar glass-panel">
      <div className="brand-shell">
        <img src="/src/assets/logo/aura-logo.png" alt="AURA" className="brand-logo" />
      </div>

      <nav className="sidebar-menu" aria-label="Navigazione principale">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={activePage === item.label ? 'active' : ''}
            onClick={() => onNavigate(item.label)}
            type="button"
          >
            <span className="menu-icon"><SidebarIcon name={item.icon} /></span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="profile-card">
        <div className="profile-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.8" />
            <path d="M4.8 20c1.4-3.8 4-5.6 7.2-5.6s5.8 1.8 7.2 5.6" />
          </svg>
        </div>
        <div className="profile-copy">
          <span>Periodo di prova</span>
          <strong>3 giorni rimasti</strong>
        </div>
      </div>
    </aside>
  );
}
