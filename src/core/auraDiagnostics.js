export function buildAuraDiagnostics(channels = [], epg = null) {
  const total = channels.length;
  const recognized = channels.filter((channel) => channel.recognized).length;
  const withLogo = channels.filter((channel) => channel.icon).length;
  const withEpg = channels.filter((channel) => channel.epg).length;

  const streamCounts = channels.reduce((acc, channel) => {
    const key = channel.streamFamily || channel.streamType || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const compatibility = channels.reduce((acc, channel) => {
    const key = channel.compatibility || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalChannels: total,
    recognizedChannels: recognized,
    unrecognizedChannels: total - recognized,
    channelsWithLogo: withLogo,
    channelsWithEpg: withEpg,
    channelsWithoutEpg: total - withEpg,
    streamCounts,
    compatibility,
    epgPrograms: epg?.count || 0,
    epgChannels: epg?.channelCount || 0,
    healthScore: total ? Math.round(((recognized * 0.35) + (withLogo * 0.20) + (withEpg * 0.30) + ((compatibility.alta || 0) * 0.15)) / total * 100) : 0
  };
}

export function saveAuraDiagnostics(report) {
  try {
    localStorage.setItem('aura-core-diagnostics', JSON.stringify({ ...report, savedAt: Date.now() }));
  } catch {
    // ignore
  }
}

export function loadAuraDiagnostics() {
  try {
    const stored = localStorage.getItem('aura-core-diagnostics');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
