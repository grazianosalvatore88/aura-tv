export default function TopMenu() {
  return (
    <header className="topbar">
      <div className="main-tabs glass-control">
        <button className="active">Live</button>
        <button>Film</button>
        <button>Serie TV</button>
      </div>

      <div className="top-actions">
        <button className="clock glass-control">21:45</button>
        <button className="settings glass-control">⚙</button>
      </div>
    </header>
  );
}
