import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const CLIENT_PROFILES = {
  Auto: [
    {
      label: 'compat-1',
      userAgent: 'IPTVSmartersPro',
      headers: {
        'X-Requested-With': 'com.nst.iptvsmarterstvbox'
      }
    },
    {
      label: 'compat-2',
      userAgent: 'NanomidPlayer/1.0',
      headers: {
        'X-Requested-With': 'com.nanomid.player'
      }
    },
    {
      label: 'compat-3',
      userAgent: 'VLC/3.0.20 LibVLC/3.0.20'
    },
    {
      label: 'web',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    },
    {
      label: 'standard',
      userAgent: 'AURA-TV/3.0.4'
    }
  ],
  Standard: [
    {
      label: 'standard',
      userAgent: 'AURA-TV/3.0.4'
    }
  ],
  Alta: [
    {
      label: 'compat-1',
      userAgent: 'IPTVSmartersPro',
      headers: {
        'X-Requested-With': 'com.nst.iptvsmarterstvbox'
      }
    },
    {
      label: 'compat-2',
      userAgent: 'NanomidPlayer/1.0',
      headers: {
        'X-Requested-With': 'com.nanomid.player'
      }
    }
  ],
  Diretta: [
    {
      label: 'compat-3',
      userAgent: 'VLC/3.0.20 LibVLC/3.0.20'
    }
  ],
  Web: [
    {
      label: 'web',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    }
  ]
};

const PORT_CANDIDATES = ['', '8080', '80', '25461', '2082', '2095'];

function send(res, statusCode, payload, contentType = 'application/json; charset=utf-8') {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(contentType.includes('json') ? JSON.stringify(payload) : payload);
}

function normalizeServerUrl(value) {
  const cleaned = String(value || '').trim().replace(/\/+$/, '');
  if (!cleaned) return '';
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `http://${cleaned}`;
}

function hasExplicitPort(serverUrl) {
  try {
    const parsed = new URL(serverUrl);
    return Boolean(parsed.port);
  } catch {
    return false;
  }
}

function withPort(serverUrl, port) {
  try {
    const parsed = new URL(serverUrl);
    if (!port) return parsed.toString().replace(/\/$/, '');
    parsed.port = port;
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return serverUrl;
  }
}

function buildServerCandidates(serverUrl) {
  const normalized = normalizeServerUrl(serverUrl);
  if (!normalized) return [];

  const variants = hasExplicitPort(normalized)
    ? [normalized]
    : PORT_CANDIDATES.map((port) => withPort(normalized, port));

  const protocolVariants = [];

  for (const variant of variants) {
    protocolVariants.push(variant);

    if (variant.startsWith('http://')) {
      protocolVariants.push(variant.replace('http://', 'https://'));
    } else if (variant.startsWith('https://')) {
      protocolVariants.push(variant.replace('https://', 'http://'));
    }
  }

  return Array.from(new Set(protocolVariants));
}

async function readBody(req) {
  if (req.method !== 'POST') return {};

  return await new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 30000) {
        req.destroy();
        resolve({});
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function buildTarget({ serverUrl, username, password, action, categoryId, mode, output }) {
  const isDirectList = /\/get\.php/i.test(serverUrl) || /[?&](type=m3u|type=m3u_plus)/i.test(serverUrl);

  if (mode === 'direct') {
    return new URL(serverUrl);
  }

  if (mode === 'm3u') {
    if (isDirectList) {
      const target = new URL(serverUrl);
      if (username && !target.searchParams.get('username')) target.searchParams.set('username', username);
      if (password && !target.searchParams.get('password')) target.searchParams.set('password', password);
      if (!target.searchParams.get('type')) target.searchParams.set('type', 'm3u_plus');
      if (!target.searchParams.get('output')) target.searchParams.set('output', output || 'mpegts');
      return target;
    }

    const target = new URL(`${serverUrl}/get.php`);
    target.searchParams.set('username', username);
    target.searchParams.set('password', password);
    target.searchParams.set('type', 'm3u_plus');
    target.searchParams.set('output', output || 'mpegts');
    return target;
  }

  const target = new URL(`${serverUrl}/player_api.php`);
  target.searchParams.set('username', username);
  target.searchParams.set('password', password);
  if (action) target.searchParams.set('action', action);
  if (categoryId) target.searchParams.set('category_id', categoryId);
  return target;
}

async function fetchTarget(target, responseType = 'json', profile) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 24000);

  const headers = {
    'Accept': responseType === 'text' ? 'application/x-mpegURL,text/plain,*/*' : 'application/json,text/plain,*/*',
    'User-Agent': profile.userAgent,
    ...(profile.headers || {})
  };

  const response = await fetch(target.toString(), {
    method: 'GET',
    signal: controller.signal,
    headers
  }).finally(() => clearTimeout(timeout));

  const raw = await response.text();

  if (!response.ok) {
    const error = new Error(`Errore sorgente ${response.status}`);
    error.status = response.status;
    error.raw = raw;
    throw error;
  }

  if (responseType === 'text') {
    if (!raw || !raw.includes('#EXTM3U')) {
      const error = new Error('Lista vuota o non valida');
      error.status = 204;
      error.raw = raw;
      throw error;
    }

    return raw;
  }

  try {
    return JSON.parse(raw);
  } catch {
    if (!raw) {
      const error = new Error('Risposta vuota dal server');
      error.status = 204;
      throw error;
    }

    return raw;
  }
}

async function tryAllTargets({ serverUrl, username, password, action, categoryId, mode, output, clientMode }) {
  const servers = buildServerCandidates(serverUrl);
  const profiles = CLIENT_PROFILES[clientMode] || CLIENT_PROFILES.Auto;
  const errors = [];

  for (const candidate of servers) {
    for (const profile of profiles) {
      try {
        const target = buildTarget({
          serverUrl: candidate,
          username,
          password,
          action,
          categoryId,
          mode,
          output
        });

        const data = await fetchTarget(target, mode === 'm3u' || mode === 'direct' ? 'text' : 'json', profile);

        return {
          data,
          resolvedServerUrl: candidate,
          profile: profile.label
        };
      } catch (error) {
        errors.push({
          server: candidate,
          profile: profile.label,
          status: error.status || 'ERR',
          message: error.message
        });
      }
    }
  }

  const finalError = new Error(errors[0]?.message || 'Nessuna modalità compatibile trovata');
  finalError.status = errors[0]?.status;
  finalError.attempts = errors;
  throw finalError;
}

async function xtreamProxy(req, res) {
  if (req.method === 'OPTIONS') {
    return send(res, 200, { ok: true });
  }

  try {
    const body = await readBody(req);
    const url = new URL(req.url, 'http://localhost');

    const serverUrl = normalizeServerUrl(body.serverUrl || body.linkUrl || url.searchParams.get('serverUrl') || url.searchParams.get('linkUrl'));
    const username = String(body.username || url.searchParams.get('username') || '').trim();
    const password = String(body.password || url.searchParams.get('password') || '').trim();
    const action = String(body.action || url.searchParams.get('action') || '').trim();
    const categoryId = String(body.categoryId || url.searchParams.get('categoryId') || '').trim();
    const mode = String(body.mode || url.searchParams.get('mode') || 'api').trim();
    const output = String(body.output || url.searchParams.get('output') || 'mpegts').trim();
    const clientMode = String(body.clientMode || url.searchParams.get('clientMode') || 'Auto').trim();

    if (!serverUrl || !username || !password) {
      return send(res, 400, {
        ok: false,
        error: 'Campi sorgente mancanti'
      });
    }

    const result = await tryAllTargets({
      serverUrl,
      username,
      password,
      action,
      categoryId,
      mode,
      output,
      clientMode
    });

    return send(res, 200, {
      ok: true,
      mode,
      action: action || (mode === 'm3u' || mode === 'direct' ? 'playlist' : 'user_info'),
      output,
      resolvedServerUrl: result.resolvedServerUrl,
      profile: result.profile,
      data: result.data
    });
  } catch (error) {
    return send(res, error.status || 500, {
      ok: false,
      error: error?.name === 'AbortError'
        ? 'Timeout connessione'
        : error?.message || 'Errore connessione',
      attempts: error.attempts || []
    });
  }
}



function sourceDevProxy() {
  return {
    name: 'aura-source-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/xtream', async (req, res) => {
        return xtreamProxy(req, res);
      });
    }
  };
}


function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function readM3uJsonBody(req) {
  return await new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function m3uDevProxy() {
  return {
    name: 'aura-m3u-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/m3u', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        try {
          const body = req.method === 'POST' ? await readM3uJsonBody(req) : {};
          const requestUrl = new URL(req.url || '', 'http://localhost');
          const playlistUrl = String(body.url || requestUrl.searchParams.get('url') || '').trim();

          if (!isSafeHttpUrl(playlistUrl)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'URL M3U non valido' }));
            return;
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 24000);

          const response = await fetch(playlistUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/x-mpegURL,text/plain,*/*',
              'User-Agent': 'AURA-TV/3.0.6'
            }
          }).finally(() => clearTimeout(timeout));

          const text = await response.text();

          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ ok: false, error: `Errore sorgente M3U ${response.status}` }));
            return;
          }

          if (!text.includes('#EXTM3U')) {
            res.statusCode = 422;
            res.end(JSON.stringify({ ok: false, error: 'La sorgente non sembra una lista M3U valida' }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, data: text }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            error: error?.name === 'AbortError'
              ? 'Timeout lettura M3U'
              : error?.message || 'Errore lettura M3U'
          }));
        }
      });
    }
  };
}


async function readEpgJsonBody(req) {
  return await new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function epgDevProxy() {
  return {
    name: 'aura-epg-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/epg', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
          return;
        }

        try {
          const body = req.method === 'POST' ? await readEpgJsonBody(req) : {};
          const requestUrl = new URL(req.url || '', 'http://localhost');
          const epgUrl = String(body.url || requestUrl.searchParams.get('url') || '').trim();

          if (!isSafeHttpUrl(epgUrl)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: 'URL EPG non valido' }));
            return;
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 28000);

          const response = await fetch(epgUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/xml,text/xml,text/plain,*/*',
              'User-Agent': 'AURA-TV/3.0.9'
            }
          }).finally(() => clearTimeout(timeout));

          const text = await response.text();

          if (!response.ok) {
            res.statusCode = response.status;
            res.end(JSON.stringify({ ok: false, error: `Errore sorgente EPG ${response.status}` }));
            return;
          }

          if (!text.includes('<tv') && !text.includes('<programme')) {
            res.statusCode = 422;
            res.end(JSON.stringify({ ok: false, error: 'La sorgente non sembra un XMLTV valido' }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, data: text }));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({
            ok: false,
            error: error?.name === 'AbortError' ? 'Timeout lettura EPG' : error?.message || 'Errore lettura EPG'
          }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), sourceDevProxy(), m3uDevProxy(), epgDevProxy()],
  server: {
    host: '0.0.0.0'
  }
});
