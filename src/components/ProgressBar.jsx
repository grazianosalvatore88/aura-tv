export default function ProgressBar({ value = 50 }) {
  return (
    <div className="progress">
      <i style={{ width: `${value}%` }} />
    </div>
  );
}
