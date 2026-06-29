export async function fetchM3uFromUrl(url) {
  const playlistUrl = String(url || '').trim();

  if (!playlistUrl) {
    throw new Error('Inserisci un URL M3U valido.');
  }

  const response = await fetch('/api/m3u', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: playlistUrl })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore lettura M3U');
  }

  return payload.data;
}

export function getSavedM3uText(settings) {
  return settings?.m3u?.localText || '';
}

export function isValidM3uText(value = '') {
  return String(value || '').includes('#EXTM3U') && String(value || '').includes('#EXTINF');
}

export function countM3uItems(value = '') {
  return Math.max(0, String(value || '').split('#EXTINF').length - 1);
}
