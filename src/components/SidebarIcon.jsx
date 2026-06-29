export default function SidebarIcon({ name, size = 22 }) {
  const common = {
    width: String(size),
    height: String(size),
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
