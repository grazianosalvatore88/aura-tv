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

export function normalizeXtreamStatus(data = {}) {
  const userInfo = data?.user_info || {};
  const rawStatus = String(userInfo.status || '').trim();
  const auth = String(userInfo.auth ?? '') === '1';
  const expSeconds = Number(userInfo.exp_date || 0);
  const expiresAt = expSeconds ? expSeconds * 1000 : null;
  const expiredByDate = Boolean(expiresAt && expiresAt < Date.now());
  const statusLower = rawStatus.toLowerCase();

  let status = rawStatus || (auth ? 'Active' : 'Sconosciuto');
  let code = 'unknown';

  if (!auth) {
    code = 'unauthorized';
    status = rawStatus || 'Non autorizzato';
  } else if (statusLower === 'expired' || expiredByDate) {
    code = 'expired';
    status = 'Expired';
  } else if (statusLower === 'disabled' || statusLower === 'banned') {
    code = 'disabled';
  } else if (statusLower === 'active' || auth) {
    code = 'active';
    status = rawStatus || 'Active';
  }

  const allowedFormats = Array.isArray(userInfo.allowed_output_formats)
    ? userInfo.allowed_output_formats.filter(Boolean)
    : [];

  const preferredOutput = allowedFormats.includes('m3u8')
    ? 'm3u8'
    : allowedFormats.includes('ts')
      ? 'ts'
      : allowedFormats[0] || 'm3u8';

  return {
    auth,
    code,
    ok: code === 'active',
    reached: Boolean(data?.server_info || data?.user_info),
    status,
    expiresAt,
    expiredByDate,
    activeConnections: userInfo.active_cons,
    maxConnections: userInfo.max_connections,
    allowedFormats,
    preferredOutput,
    serverInfo: data?.server_info || {},
    raw: data
  };
}

export function formatXtreamExpiry(expiresAt) {
  if (!expiresAt) return 'scadenza non indicata';
  return new Date(expiresAt).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function buildXtreamStatusMessage(status = {}) {
  if (status.code === 'expired') {
    return `Account riconosciuto ma scaduto il ${formatXtreamExpiry(status.expiresAt)}. Rinnova il servizio o contatta il fornitore.`;
  }

  if (status.code === 'unauthorized') {
    return 'Server raggiunto, ma username o password non sono autorizzati.';
  }

  if (status.code === 'disabled') {
    return `Account riconosciuto ma non attivo: ${status.status}.`;
  }

  if (status.code === 'active') {
    const expiry = status.expiresAt ? ` Scadenza: ${formatXtreamExpiry(status.expiresAt)}.` : '';
    const output = status.preferredOutput ? ` Formato preferito: ${status.preferredOutput}.` : '';
    return `Connessione Xtream riuscita. Stato account: ${status.status}.${expiry}${output}`;
  }

  return 'Server raggiunto, ma lo stato account non è chiaro.';
}

export function explainXtreamFetchError(error) {
  const message = String(error?.message || error || '');
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return 'Impossibile contattare il proxy Xtream. Se sei su HTTPS/Vercel e il server IPTV è HTTP, può essere mixed content o blocco rete.';
  }
  if (/403|forbidden/i.test(message)) {
    return 'Server raggiunto ma richiesta rifiutata: possibile IP non autorizzato o credenziali non valide.';
  }
  if (/timeout/i.test(message)) {
    return 'Timeout connessione: il server non risponde da questa rete.';
  }
  return message || 'Errore connessione Xtream.';
}

export function getXtreamConfig(settings = loadAuraSettings()) {
  if (!settings || !['Xtream', 'Lista con link'].includes(settings.sourceType)) return null;

  const config = {
    listName: String(settings.xtream?.listName || '').trim(),
    serverUrl: normalizeServerUrl(settings.xtream?.serverUrl || settings.xtream?.linkUrl),
    linkUrl: normalizeServerUrl(settings.xtream?.linkUrl || settings.xtream?.serverUrl),
    username: String(settings.xtream?.username || '').trim(),
    password: String(settings.xtream?.password || '').trim(),
    clientMode: 'Auto',
    outputFormat: settings.xtream?.outputFormat || 'm3u8'
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

  let response;

  try {
    response = await fetch('/api/xtream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverUrl: config.serverUrl,
        linkUrl: config.linkUrl,
        username: config.username,
        password: config.password,
        clientMode: 'Auto',
        action,
        ...extra
      })
    });
  } catch (error) {
    throw new Error(explainXtreamFetchError(error));
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore connessione Xtream');
  }

  return payload.data;
}

export async function testXtreamConnection(config = getXtreamConfig()) {
  const data = await xtreamRequest('', {}, config);
  const status = normalizeXtreamStatus(data);

  return {
    ...status,
    message: buildXtreamStatusMessage(status)
  };
}


export async function xtreamM3uRequest(output = 'mpegts', config = getXtreamConfig()) {
  if (!config) {
    throw new Error('Configura prima la sorgente Xtream nelle impostazioni.');
  }

  let response;

  try {
    response = await fetch('/api/xtream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverUrl: config.serverUrl,
        linkUrl: config.linkUrl,
        username: config.username,
        password: config.password,
        clientMode: 'Auto',
        mode: 'm3u',
        output
      })
    });
  } catch (error) {
    throw new Error(explainXtreamFetchError(error));
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore lettura M3U Xtream');
  }

  return payload.data;
}

export async function testXtreamM3u(config = getXtreamConfig()) {
  const data = await xtreamM3uRequest(config?.outputFormat === 'm3u8' ? 'm3u8' : 'mpegts', config);
  return typeof data === 'string' && data.includes('#EXTM3U');
}


export function buildXtreamStreamUrl(streamId, extension = '', config = getXtreamConfig()) {
  if (!config || !streamId) return '';
  const safeExtension = extension || config.outputFormat || 'm3u8';
  return `${config.serverUrl}/live/${encodeURIComponent(config.username)}/${encodeURIComponent(config.password)}/${streamId}.${safeExtension}`;
}
