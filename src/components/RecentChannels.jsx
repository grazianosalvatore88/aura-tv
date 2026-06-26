import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function RecentChannels({ channels, selectedId, onSelect }) {
  return (
    <aside className="recent-panel glass-panel">
      <h3>Ultimi canali visti</h3>
      <div className="recent-list">
        {channels.map((item) => (
          <button
            key={item.id}
            className={`recent-card ${selectedId === item.id ? 'active' : ''}`}
            onMouseEnter={() => onSelect(item)}
            onFocus={() => onSelect(item)}
          >
            <ChannelLogo text={item.logo} />
            <div className="recent-info">
              <div className="recent-line">
                <strong>{item.channel}</strong>
                <span>{item.time}</span>
              </div>
              <p>{item.title}</p>
              <ProgressBar value={item.progress} />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
