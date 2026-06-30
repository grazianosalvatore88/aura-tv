export function detectAuraStream(streamUrl = '', options = {}) {
  const url = String(streamUrl || '');
  const lower = url.toLowerCase();
  const userAgent = String(options.httpUserAgent || '');

  const isRaiRelinker = /relinkerservlet/i.test(url);
  const isDash = lower.includes('.mpd') || lower.includes('.isml/manifest');
  const isHls = lower.includes('.m3u8') || isRaiRelinker;
  const isDirect = /\.(mp4|ts|avi|mkv)(\?|$)/i.test(lower);

  let streamType = 'direct';
  let streamFamily = 'direct';
  let compatibility = 'media';
  let note = 'Stream diretto o sconosciuto.';

  if (isRaiRelinker) {
    streamType = 'hls';
    streamFamily = 'rai-relinker';
    compatibility = 'alta';
    note = 'Relinker Rai trattato come sorgente HLS.';
  } else if (isHls) {
    streamType = 'hls';
    streamFamily = 'hls';
    compatibility = 'alta';
    note = 'Stream HLS compatibile con browser moderni.';
  } else if (isDash) {
    streamType = 'dash';
    streamFamily = 'dash';
    compatibility = 'media';
    note = 'Stream DASH: può non funzionare se richiede DRM o policy esterne.';
  } else if (isDirect) {
    streamType = 'direct';
    streamFamily = 'direct';
    compatibility = 'media';
    note = 'Stream diretto: compatibilità dipende dal formato.';
  }

  if (/hbbtv/i.test(userAgent)) {
    note += ' Richiede user-agent HbbTV: alcuni browser possono bloccarlo.';
    compatibility = compatibility === 'alta' ? 'media' : compatibility;
  }

  return {
    streamType,
    streamFamily,
    compatibility,
    note,
    requiresUserAgent: Boolean(userAgent),
    playableStatus: 'unknown'
  };
}
