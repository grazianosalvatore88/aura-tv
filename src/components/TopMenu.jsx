import { useEffect, useState } from 'react';
import { formatDeviceTime, getDeviceDate } from '../services/timeService.js';

export default function TopMenu({
  searchValue,
  onSearchChange,
  onNavigate = () => {},
  placeholder = 'Cerca film, serie, canali, eventi sportivi...'
}) {
  const [clock, setClock] = useState(() => formatDeviceTime(getDeviceDate()));

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(formatDeviceTime(getDeviceDate()));
    }, 1000 * 15);

    return () => clearInterval(timer);
  }, []);

  const controlledProps = typeof searchValue === 'string'
    ? {
        value: searchValue,
        onChange: (event) => onSearchChange?.(event.target.value)
      }
    : {};

  return (
    <header className="topbar">
      <div className="search-shell glass-control" role="search">
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4.2-4.2" />
        </svg>
        <input
          type="search"
          placeholder={placeholder}
          aria-label="Cerca"
          {...controlledProps}
        />
      </div>

      <div className="top-actions">
        <button type="button" className="clock glass-control">{clock}</button>
        <button
          type="button"
          className="settings glass-control"
          aria-label="Impostazioni"
          onClick={() => onNavigate('Impostazioni')}
        >
          ⚙
        </button>
      </div>
    </header>
  );
}
