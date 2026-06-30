import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function Hero({ item, onWatch = () => {}, onInfo = () => {} }) {
  return (
    <section
      className="hero glass-panel"
      style={{ '--hero-bg': `url(${item.background})` }}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (!event.target.closest('button')) onWatch(item);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onWatch(item);
      }}
    >
      <div className="hero-logo-wrap hero-logo-wrap-v324">
        {item.icon ? <img src={item.icon} alt="" className="hero-channel-image" /> : <ChannelLogo text={item.logo} />}
      </div>

      <div className="hero-content hero-content-v324">
        <div className="hero-meta clean-hero-meta">
          <strong>{item.channel}</strong>
          <span>{item.time}</span>
        </div>

        <h1>{item.title}</h1>
        <h2>{item.subtitle}</h2>
        <p>{item.description}</p>
        <ProgressBar value={item.progress} />

        <div className="hero-buttons">
          <button className="primary" type="button" onClick={() => onWatch(item)}>▶ Guarda ora</button>
          <button className="secondary" type="button" onClick={() => onInfo(item)}>Info</button>
        </div>
      </div>
    </section>
  );
}
