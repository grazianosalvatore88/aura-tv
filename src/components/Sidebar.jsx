import auraLogo from '../assets/logo/aura-logo.png';

const menuItems = ['Home', 'Live TV', 'Film', 'Serie TV', 'Sport', 'Preferiti'];

export default function Sidebar() {
  return (
    <aside className="sidebar glass-panel">
      <div className="brand-shell">
        <img src={auraLogo} alt="AURA" className="brand-logo" />
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <button key={item} className={index === 0 ? 'active' : ''}>{item}</button>
        ))}
      </nav>

      <div className="profile-card">
        <span>Profilo</span>
        <strong>Premium</strong>
      </div>
    </aside>
  );
}
