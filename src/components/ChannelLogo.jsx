export default function ChannelLogo({ text }) {
  return (
    <div className="channel-logo">
      {text.split('\n').map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}
