export default function TopMenu() {
  return (
    <header className="topbar">
      <div className="search-shell glass-control" role="search">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input type="search" placeholder="Cerca film, serie, canali, eventi sportivi..." aria-label="Cerca" />
      </div>

      <div className="top-actions">
        <button className="clock glass-control">21:45</button>
        <button className="settings glass-control" aria-label="Impostazioni">⚙</button>
      </div>
    </header>
  );
}
