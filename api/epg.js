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

async function epgProxy(req, res) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });

  try {
    const body = await readBody(req);
    const requestUrl = new URL(req.url, 'http://localhost');
    const epgUrl = String(body.url || requestUrl.searchParams.get('url') || '').trim();

    if (!isSafeHttpUrl(epgUrl)) {
      return send(res, 400, { ok: false, error: 'URL EPG non valido' });
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
      return send(res, response.status, { ok: false, error: `Errore sorgente EPG ${response.status}` });
    }

    if (!text.includes('<tv') && !text.includes('<programme')) {
      return send(res, 422, { ok: false, error: 'La sorgente non sembra un XMLTV valido' });
    }

    return send(res, 200, { ok: true, data: text });
  } catch (error) {
    return send(res, 500, {
      ok: false,
      error: error?.name === 'AbortError' ? 'Timeout lettura EPG' : error?.message || 'Errore lettura EPG'
    });
  }
}

export default epgProxy;
