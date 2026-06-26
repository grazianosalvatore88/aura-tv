export default function MovieCard({ item }) {
  return (
    <button className="media-card poster-card" style={{ '--poster': `url(${item.image})` }}>
      <div>
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </div>
    </button>
  );
}
