import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function ChannelCard({ item, selected, onSelect, onOpen = () => {} }) {
  return (
    <button
      type="button"
      className={`channel-card ${selected ? 'selected' : ''}`}
      onClick={() => onOpen(item)}
      onMouseEnter={() => onSelect(item)}
      onFocus={() => onSelect(item)}
    >
      {item.icon ? <img src={item.icon} alt="" className="channel-card-image" /> : <ChannelLogo text={item.logo} />}
      <div className="channel-card-content">
        <strong>{item.channel}</strong>
        <p>{item.title}</p>
        <span>{item.time}</span>
        <ProgressBar value={item.progress} />
      </div>
    </button>
  );
}
