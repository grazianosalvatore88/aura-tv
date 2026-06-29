export default function RemoteLegend({ commands = [] }) {
  return (
    <section className="remote-bar page-remote-legend glass-panel" aria-label="Comandi telecomando">
      {commands.map((command) => (
        <div className="remote-command" key={`${command.key}-${command.label}`}>
          <span className={command.color ? `remote-key color ${command.color}` : 'remote-key neutral'}>
            {command.color ? '' : command.key}
          </span>
          <span>{command.label}</span>
        </div>
      ))}
    </section>
  );
}
