import ProgressBar from './ProgressBar.jsx';

export default function ContinueCard({ item }) {
  return (
    <button className="continue-card" style={{ '--continue-bg': `url(${item.image})` }}>
      <div className="continue-content">
        <span className="continue-type">{item.type}</span>
        <strong>{item.title}</strong>
        <p>{item.meta}</p>
        <ProgressBar value={item.progress} />
      </div>
    </button>
  );
}
