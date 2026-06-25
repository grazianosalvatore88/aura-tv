export default function Carousel({ title, action = 'Vedi tutti', children, className = '' }) {
  return (
    <section className={`carousel-section ${className}`}>
      <div className="section-heading">
        <h2>{title}</h2>
        {action && <button>{action}</button>}
      </div>
      <div className="carousel-track">{children}</div>
    </section>
  );
}
