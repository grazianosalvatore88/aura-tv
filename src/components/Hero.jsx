import ChannelLogo from './ChannelLogo.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function Hero({ item }) {
  return (
    <section className="hero glass-panel" style={{ '--hero-bg': `url(${item.background})` }}>
      <div className="hero-logo-wrap">
        <ChannelLogo text={item.logo} />
      </div>

      <div className="hero-content">
        <div className="hero-meta">
          <span className="live-badge">LIVE</span>
          <strong>{item.channel}</strong>
          <span>{item.time}</span>
        </div>

        <h1>{item.title}</h1>
        <h2>{item.subtitle}</h2>
        <p>{item.description}</p>
        <ProgressBar value={item.progress} />

        <div className="hero-buttons">
          <button className="primary">▶ Guarda ora</button>
          <button className="secondary">ⓘ Dettagli</button>
        </div>
      </div>
    </section>
  );
}
