export default function Carousel({ title, action = null, children, className = '' }) {
  return (
    <section className={`carousel-section ${className}`}>
      <div className="section-heading">
        <h2>{title}</h2>
        {action ? <span className="section-static-label">{action}</span> : null}
      </div>
      <div className="carousel-track">{children}</div>
    </section>
  );
}
