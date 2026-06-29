const SETTINGS_KEY = 'aura-tv-settings';

export function normalizeServerUrl(value) {
  const cleaned = String(value || '').trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `http://${cleaned}`;
}

export function loadAuraSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getXtreamConfig(settings = loadAuraSettings()) {
  if (!settings || !['Xtream', 'Lista con link'].includes(settings.sourceType)) return null;

  const config = {
    listName: String(settings.xtream?.listName || '').trim(),
    serverUrl: normalizeServerUrl(settings.xtream?.serverUrl || settings.xtream?.linkUrl),
    linkUrl: normalizeServerUrl(settings.xtream?.linkUrl || settings.xtream?.serverUrl),
    username: String(settings.xtream?.username || '').trim(),
    password: String(settings.xtream?.password || '').trim(),
    clientMode: settings.xtream?.clientMode || 'Auto'
  };

  if (!config.serverUrl || !config.username || !config.password) return null;
  return config;
}

export function hasXtreamConfig(settings = loadAuraSettings()) {
  return Boolean(getXtreamConfig(settings));
}

export async function xtreamRequest(action = '', extra = {}, config = getXtreamConfig()) {
  if (!config) {
    throw new Error('Configura prima la sorgente Xtream nelle impostazioni.');
  }

  const response = await fetch('/api/xtream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serverUrl: config.serverUrl,
      linkUrl: config.linkUrl,
      username: config.username,
      password: config.password,
      clientMode: config.clientMode || 'Auto',
      action,
      ...extra
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore connessione Xtream');
  }

  return payload.data;
}

export async function testXtreamConnection(config = getXtreamConfig()) {
  const data = await xtreamRequest('', {}, config);
  const userInfo = data?.user_info || {};
  const auth = String(userInfo.auth ?? '') === '1' || userInfo.status === 'Active';

  return {
    ok: auth || Boolean(data?.server_info),
    status: userInfo.status || (auth ? 'Active' : 'Sconosciuto'),
    expiresAt: userInfo.exp_date ? Number(userInfo.exp_date) * 1000 : null,
    activeConnections: userInfo.active_cons,
    maxConnections: userInfo.max_connections,
    raw: data
  };
}


export async function xtreamM3uRequest(output = 'mpegts', config = getXtreamConfig()) {
  if (!config) {
    throw new Error('Configura prima la sorgente Xtream nelle impostazioni.');
  }

  const response = await fetch('/api/xtream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      serverUrl: config.serverUrl,
      linkUrl: config.linkUrl,
      username: config.username,
      password: config.password,
      clientMode: config.clientMode || 'Auto',
      mode: 'm3u',
      output
    })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore lettura M3U Xtream');
  }

  return payload.data;
}

export async function testXtreamM3u(config = getXtreamConfig()) {
  const data = await xtreamM3uRequest('mpegts', config);
  return typeof data === 'string' && data.includes('#EXTM3U');
}


export function buildXtreamStreamUrl(streamId, extension = 'm3u8', config = getXtreamConfig()) {
  if (!config || !streamId) return '';
  const safeExtension = extension || 'm3u8';
  return `${config.serverUrl}/live/${encodeURIComponent(config.username)}/${encodeURIComponent(config.password)}/${streamId}.${safeExtension}`;
}
