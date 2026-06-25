import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function ChannelCard({ item, selected, onSelect }) {
  return (
    <button
      className={`channel-card ${selected ? 'selected' : ''}`}
      onMouseEnter={() => onSelect(item)}
      onFocus={() => onSelect(item)}
    >
      <ChannelLogo text={item.logo} />
      <div className="channel-card-content">
        <strong>{item.channel}</strong>
        <p>{item.title}</p>
        <span>{item.time}</span>
        <ProgressBar value={item.progress} />
      </div>
    </button>
  );
}
