const menuItems = [
  { label: 'Home', icon: 'home' },
  { label: 'Preferiti', icon: 'star' },
  { label: 'Live TV', icon: 'tv' },
  { label: 'Continua a guardare', icon: 'play' },
  { label: 'Film', icon: 'film' },
  { label: 'Serie TV', icon: 'series' },
  { label: 'Sport', icon: 'sport' }
];

function Icon({ name }) {
  const common = {
    width: '22',
    height: '22',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true
  };

  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.8 12 3l9 7.8" /><path d="M5.5 10.2V21h13V10.2" /><path d="M9.5 21v-6h5v6" /></svg>;
    case 'star':
      return <svg {...common}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2 7.5 14 3 9.6l6.2-.9L12 3Z" /></svg>;
    case 'tv':
      return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2.4" /><path d="M8 21h8" /><path d="M12 18v3" /><path d="m9 3 3 3 3-3" /></svg>;
    case 'play':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" fill="currentColor" stroke="none" /></svg>;
    case 'film':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2.2" /><path d="M8 4v16" /><path d="M16 4v16" /><path d="M4 8h4" /><path d="M4 16h4" /><path d="M16 8h4" /><path d="M16 16h4" /></svg>;
    case 'series':
      return <svg {...common}><rect x="5" y="5" width="14" height="13" rx="2.2" /><path d="M9 21h6" /><path d="M12 18v3" /><path d="M9 9h6" /><path d="M9 13h4" /></svg>;
    case 'sport':
      return <svg {...common}><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M6 4H4v3a4 4 0 0 0 4 4" /><path d="M18 4h2v3a4 4 0 0 1-4 4" /><path d="M12 12v5" /><path d="M8 21h8" /><path d="M9 17h6" /></svg>;
    default:
      return null;
  }
}

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
            <span className="menu-icon"><Icon name={item.icon} /></span>
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
