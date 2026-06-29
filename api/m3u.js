function send(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function readBody(req) {
  if (req.method !== 'POST') return {};

  return await new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 20000) {
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

async function m3uProxy(req, res) {
  if (req.method === 'OPTIONS') {
    return send(res, 200, { ok: true });
  }

  try {
    const body = await readBody(req);
    const requestUrl = new URL(req.url, 'http://localhost');
    const playlistUrl = String(body.url || requestUrl.searchParams.get('url') || '').trim();

    if (!isSafeHttpUrl(playlistUrl)) {
      return send(res, 400, {
        ok: false,
        error: 'URL M3U non valido'
      });
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
      return send(res, response.status, {
        ok: false,
        error: `Errore sorgente M3U ${response.status}`
      });
    }

    if (!text.includes('#EXTM3U')) {
      return send(res, 422, {
        ok: false,
        error: 'La sorgente non sembra una lista M3U valida'
      });
    }

    return send(res, 200, {
      ok: true,
      data: text
    });
  } catch (error) {
    return send(res, 500, {
      ok: false,
      error: error?.name === 'AbortError'
        ? 'Timeout lettura M3U'
        : error?.message || 'Errore lettura M3U'
    });
  }
}

export default m3uProxy;
