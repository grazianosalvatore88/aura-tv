import { buildXtreamStreamUrl, getXtreamConfig, xtreamM3uRequest, xtreamRequest } from './xtreamService.js';

const qualityWeight = { '4K': 5, UHD: 5, FHD: 4, HD: 3, SD: 1, Auto: 0 };

const sportKeywords = [
  'dazn', 'sky sport', 'sky calcio', 'eurosport', 'supertennis', 'tennis',
  'formula 1', 'f1', 'motogp', 'nba', 'nfl', 'sportitalia', 'rai sport',
  'champions', 'serie a', 'calcio', 'motor', 'sport'
];

const movieKeywords = [
  'vod', 'film', 'movie', 'movies', 'cinema', 'peliculas', 'videoteca'
];

const seriesKeywords = [
  'serie tv', 'series', 'serie', 'stagione', 'season', 'episodio', 'episode',
  's01', 's02', 's03', 's04', 's05'
];

const POSTER_FALLBACKS = {
  live: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1600',
  movie: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200',
  series: 'https://images.unsplash.com/photo-1523207911345-32501502db22?q=80&w=1200'
};

export function detectQuality(value = '') {
  const text = String(value).toUpperCase();
  if (/\b(4K|UHD|2160P)\b/.test(text)) return '4K';
  if (/\b(FHD|FULL\s*HD|1080P)\b/.test(text)) return 'FHD';
  if (/\b(HD|720P)\b/.test(text)) return 'HD';
  if (/\b(SD|576P|480P)\b/.test(text)) return 'SD';
  return 'Auto';
}

export function cleanChannelName(value = '') {
  return String(value)
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\([^)]*(?:HD|FHD|SD|4K|UHD|HEVC|H265|H\.265|1080|720)[^)]*\)/gi, ' ')
    .replace(/\b(IT|ITALY|ITALIA|I)\s*[:|.-]\s*/gi, ' ')
    .replace(/\b(4K|UHD|FHD|FULL\s*HD|HD|SD|HEVC|H265|H\.265|1080P|720P|576P|480P)\b/gi, ' ')
    .replace(/\b(LIVE|TV)\b$/gi, ' ')
    .replace(/[_]+/g, ' ')
    .replace(/\s*[-–—|:]\s*$/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanMediaTitle(value = '') {
  return String(value)
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/\b(4K|UHD|FHD|FULL\s*HD|HD|SD|HEVC|H265|H\.265|1080P|720P|576P|480P)\b/gi, ' ')
    .replace(/\b(ITA|IT|SUB|MULTI|VOD|MOVIE|FILM)\b\s*[:|.-]?\s*/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function normalizeChannelKey(value = '') {
  return cleanChannelName(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function normalizeMediaKey(value = '') {
  return cleanMediaTitle(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function cleanCategoryName(value = '') {
  const cleaned = String(value || '')
    .replace(/\b(IT|ITALY|ITALIA)\s*[:|.-]\s*/gi, '')
    .replace(/\b(LIVE|TV|CHANNELS|CANALE|CANALI)\b/gi, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || 'Altri';
}

export function detectAuraCategory(channelName = '', categoryName = '') {
  const text = `${channelName} ${categoryName}`.toLowerCase();
  if (sportKeywords.some((keyword) => text.includes(keyword))) return 'Sport';
  if (/\b(news|tg|24|rainews|sky tg|cnn|bbc|notizie)\b/i.test(text)) return 'News';
  if (/\b(kids|bambini|cartoon|junior|boing|k2|rai gulp|rai yoyo)\b/i.test(text)) return 'Bambini';
  if (/\b(documentari|documentary|discovery|history|nat geo|natura)\b/i.test(text)) return 'Documentari';
  if (/\b(cinema|movie|film|sky cinema|premium cinema)\b/i.test(text)) return 'Cinema';
  if (/\b(musica|music|radio|mtv)\b/i.test(text)) return 'Musica';
  return cleanCategoryName(categoryName);
}

function firstLogoText(name = '') {
  const cleaned = cleanChannelName(name);
  const words = cleaned.split(' ').filter(Boolean);

  if (/^rai\s*\d+/i.test(cleaned)) return cleaned.toUpperCase().replace(/\s+/, '\n');
  if (/canale\s*5/i.test(cleaned)) return 'CANALE\n5';
  if (/italia\s*1/i.test(cleaned)) return 'ITALIA\n1';
  if (/rete\s*4/i.test(cleaned)) return 'RETE\n4';
  if (/la7d?/i.test(cleaned)) return cleaned.toUpperCase();
  if (/tv8/i.test(cleaned)) return 'TV8';
  if (/nove/i.test(cleaned)) return 'NOVE';

  if (!words.length) return 'TV';
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.slice(0, 2).map((word) => word.slice(0, 6).toUpperCase()).join('\n');
}

function buildChannelDescription(name = '', category = '') {
  const text = `${name} ${category}`.toLowerCase();

  if (text.includes('rai')) return 'Canale nazionale Rai dalla lista caricata.';
  if (text.includes('mediaset') || text.includes('canale 5') || text.includes('italia 1') || text.includes('rete 4')) return 'Canale nazionale Mediaset dalla lista caricata.';
  if (text.includes('sport')) return 'Canale sportivo dalla lista caricata.';
  if (text.includes('news') || text.includes('tg')) return 'Canale news dalla lista caricata.';
  if (text.includes('kids') || text.includes('bambini') || text.includes('cartoon')) return 'Canale per bambini dalla lista caricata.';
  if (text.includes('cinema') || text.includes('movie') || text.includes('film')) return 'Canale cinema dalla lista caricata.';
  if (text.includes('musica') || text.includes('radio')) return 'Canale musicale dalla lista caricata.';

  return 'Canale live dalla lista caricata.';
}

function parseExtinfAttributes(value = '') {
  const attrs = {};
  const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(value)) !== null) attrs[match[1]] = match[2];
  return attrs;
}

function detectM3uKind(url = '', name = '', group = '') {
  const text = `${url} ${name} ${group}`.toLowerCase();
  if (text.includes('/series/') || seriesKeywords.some((keyword) => text.includes(keyword))) return 'series';
  if (text.includes('/movie/') || movieKeywords.some((keyword) => text.includes(keyword))) return 'movie';
  return 'live';
}

function streamMeta(url = '') {
  const value = String(url || '');
  const isRaiRelinker = /relinkerServlet/i.test(value);
  const isDash = /\.mpd($|\?)/i.test(value) || /\.isml\/manifest/i.test(value);
  const isHls = /\.m3u8($|\?)/i.test(value) || isRaiRelinker;
  return { streamType: isDash && !isHls ? 'dash' : isHls ? 'hls' : 'direct' };
}

function parseM3uEntries(m3uText = '') {
  const normalized = String(m3uText || '')
    .replace(/\s+(#EXTINF)/g, '\n$1')
    .replace(/\s+(#EXTVLCOPT)/g, '\n$1')
    .replace(/\s+(https?:\/\/)/g, '\n$1')
    .replace(/\r/g, '');

  const lines = normalized
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const attrs = parseExtinfAttributes(line);
      const commaIndex = line.lastIndexOf(',');
      const fallbackName = commaIndex !== -1 ? line.slice(commaIndex + 1).trim() : '';
      current = {
        name: attrs['tvg-name'] || fallbackName || 'Canale',
        group: attrs['group-title'] || 'Altri',
        logo: attrs['tvg-logo'] || '',
        epgChannelId: attrs['tvg-id'] || '',
        httpUserAgent: ''
      };
      continue;
    }

    if (line.startsWith('#EXTVLCOPT') && current) {
      const userAgentMatch = line.match(/http-user-agent=(.*)$/i);
      if (userAgentMatch) current.httpUserAgent = userAgentMatch[1].trim();
      continue;
    }

    if (/^https?:\/\//i.test(line) && current) {
      entries.push({ ...current, streamUrl: line, kind: detectM3uKind(line, current.name, current.group) });
      current = null;
    }
  }

  return entries;
}

function toLiveChannel(entry, index, organizationMode, sourceLabel = 'M3U') {
  const rawName = entry.name;
  const cleanedName = cleanChannelName(rawName);
  const quality = detectQuality(`${rawName} ${entry.group}`);
  const auraCategory = organizationMode === 'Originale lista'
    ? cleanCategoryName(entry.group)
    : detectAuraCategory(rawName, entry.group);
  const meta = streamMeta(entry.streamUrl);

  return {
    id: `${sourceLabel.toLowerCase().replace(/\s+/g, '-')}-live-${normalizeChannelKey(rawName)}-${index}`,
    streamId: entry.streamId || '',
    number: String(index + 1).padStart(3, '0'),
    channel: cleanedName || rawName,
    rawName,
    title: 'In onda ora',
    subtitle: auraCategory,
    category: auraCategory,
    originalCategory: cleanCategoryName(entry.group),
    logo: firstLogoText(cleanedName || rawName),
    icon: entry.logo || '',
    background: entry.logo || '',
    qualityLabel: quality === 'Auto' ? (meta.streamType === 'direct' ? 'Auto' : 'HD') : quality,
    selectedResolution: quality === 'Auto' ? (meta.streamType === 'direct' ? 'Auto' : 'HD') : quality,
    resolutions: [quality === 'Auto' ? (meta.streamType === 'direct' ? 'Auto' : 'HD') : quality],
    time: 'Ora',
    description: entry.httpUserAgent
      ? 'Canale caricato da lista con profilo di riproduzione dedicato.'
      : 'Canale caricato dalla sorgente.',
    progress: 38,
    favorite: false,
    source: sourceLabel,
    streamUrl: entry.streamUrl,
    fallbackStreamUrl: entry.streamUrl.replace(/\.m3u8($|\?)/i, '.ts$1'),
    streamType: meta.streamType,
    httpUserAgent: entry.httpUserAgent || '',
    epgChannelId: entry.epgChannelId || '',
    normalizedKey: normalizeChannelKey(rawName),
    auraEngine: { cleaned: cleanedName !== rawName, originalName: rawName, quality, category: auraCategory }
  };
}

function toMovie(entry, index, organizationMode, sourceLabel = 'M3U') {
  const title = cleanMediaTitle(entry.name) || entry.name;
  const quality = detectQuality(`${entry.name} ${entry.group}`);
  const category = organizationMode === 'Originale lista' ? cleanCategoryName(entry.group) : cleanCategoryName(entry.group).replace(/^VOD\s*/i, '') || 'Film';
  const meta = streamMeta(entry.streamUrl);

  return {
    id: `${sourceLabel.toLowerCase().replace(/\s+/g, '-')}-movie-${normalizeMediaKey(title)}-${index}`,
    title,
    originalTitle: title,
    year: '',
    duration: 'Film',
    genres: [category || 'Film'],
    quality: quality === 'Auto' ? 'HD' : quality,
    selectedQuality: quality === 'Auto' ? 'HD' : quality,
    availableQualities: [quality === 'Auto' ? 'HD' : quality],
    rating: '—',
    director: '',
    source: sourceLabel,
    tag: category || 'Film',
    favorite: false,
    progress: 0,
    continueLabel: '',
    description: 'Film caricato dalla sorgente.',
    cast: [],
    poster: entry.logo || POSTER_FALLBACKS.movie,
    backdrop: entry.logo || POSTER_FALLBACKS.movie,
    streamUrl: entry.streamUrl,
    fallbackStreamUrl: entry.streamUrl,
    streamType: meta.streamType,
    image: entry.logo || POSTER_FALLBACKS.movie,
    meta: `${category || 'Film'} · ${quality === 'Auto' ? 'HD' : quality}`
  };
}

function toSeries(entry, index, organizationMode, sourceLabel = 'M3U') {
  const title = cleanMediaTitle(entry.name) || entry.name;
  const quality = detectQuality(`${entry.name} ${entry.group}`);
  const category = organizationMode === 'Originale lista' ? cleanCategoryName(entry.group) : cleanCategoryName(entry.group).replace(/^SERIE\s*/i, '') || 'Serie TV';
  const meta = streamMeta(entry.streamUrl);

  return {
    id: `${sourceLabel.toLowerCase().replace(/\s+/g, '-')}-series-${normalizeMediaKey(title)}-${index}`,
    title,
    originalTitle: title,
    year: '',
    seasons: 'Serie TV',
    episodes: 'Episodi dalla lista',
    currentEpisode: 'Episodio',
    nextEpisode: '',
    genres: [category || 'Serie TV'],
    quality: quality === 'Auto' ? 'HD' : quality,
    selectedQuality: quality === 'Auto' ? 'HD' : quality,
    availableQualities: [quality === 'Auto' ? 'HD' : quality],
    rating: '—',
    creators: '',
    source: sourceLabel,
    tag: category || 'Serie TV',
    favorite: false,
    progress: 0,
    continueLabel: '',
    description: 'Serie TV caricata dalla sorgente.',
    cast: [],
    poster: entry.logo || POSTER_FALLBACKS.series,
    backdrop: entry.logo || POSTER_FALLBACKS.series,
    streamUrl: entry.streamUrl,
    fallbackStreamUrl: entry.streamUrl,
    streamType: meta.streamType,
    image: entry.logo || POSTER_FALLBACKS.series,
    meta: `${category || 'Serie TV'} · ${quality === 'Auto' ? 'HD' : quality}`
  };
}

function mergeDuplicateChannels(channels) {
  const map = new Map();
  for (const channel of channels) {
    const key = channel.normalizedKey || channel.channel.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, channel);
      continue;
    }

    const mergedResolutions = Array.from(new Set([
      ...(existing.resolutions || []),
      ...(channel.resolutions || [])
    ])).sort((a, b) => (qualityWeight[b] || 0) - (qualityWeight[a] || 0));

    const better = (qualityWeight[channel.qualityLabel] || 0) > (qualityWeight[existing.qualityLabel] || 0) ? channel : existing;
    map.set(key, {
      ...better,
      number: existing.number,
      resolutions: mergedResolutions.length ? mergedResolutions : [better.qualityLabel],
      selectedResolution: mergedResolutions[0] || better.qualityLabel,
      duplicateCount: (existing.duplicateCount || 1) + 1,
      qualityVariants: mergedResolutions
    });
  }

  return Array.from(map.values()).map((channel, index) => ({ ...channel, number: String(index + 1).padStart(3, '0') }));
}

function mergeDuplicateMedia(items) {
  const map = new Map();
  for (const item of items) {
    const key = normalizeMediaKey(item.title);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
      continue;
    }

    const qualities = Array.from(new Set([...(existing.availableQualities || []), ...(item.availableQualities || [])]))
      .sort((a, b) => (qualityWeight[b] || 0) - (qualityWeight[a] || 0));
    const better = (qualityWeight[item.quality] || 0) > (qualityWeight[existing.quality] || 0) ? item : existing;
    map.set(key, {
      ...better,
      availableQualities: qualities,
      quality: qualities[0] || better.quality,
      selectedQuality: qualities[0] || better.selectedQuality
    });
  }
  return Array.from(map.values());
}

function splitM3uLibrary(m3uText = '', settings = {}, sourceLabel = 'M3U') {
  const organizationMode = settings?.organizationMode || 'AURA consigliata';
  const entries = parseM3uEntries(m3uText);
  const liveEntries = entries.filter((entry) => entry.kind === 'live');
  const movieEntries = entries.filter((entry) => entry.kind === 'movie');
  const seriesEntries = entries.filter((entry) => entry.kind === 'series');

  const live = mergeDuplicateChannels(liveEntries.map((entry, index) => toLiveChannel(entry, index, organizationMode, sourceLabel)));
  const movies = mergeDuplicateMedia(movieEntries.map((entry, index) => toMovie(entry, index, organizationMode, sourceLabel)));
  const series = mergeDuplicateMedia(seriesEntries.map((entry, index) => toSeries(entry, index, organizationMode, sourceLabel)));

  return { live, movies, series, originalCount: entries.length };
}

function buildLiveChannel(stream, categoryMap, index, config, organizationMode) {
  const rawName = stream.name || stream.stream_display_name || `Canale ${stream.stream_id}`;
  const rawCategory = categoryMap.get(String(stream.category_id)) || stream.category_name || 'Altri';
  const entry = {
    name: rawName,
    group: rawCategory,
    logo: stream.stream_icon || '',
    epgChannelId: stream.epg_channel_id || '',
    streamId: stream.stream_id,
    streamUrl: String(stream.direct_source || '').trim() || buildXtreamStreamUrl(stream.stream_id, config.outputFormat || 'm3u8', config),
    httpUserAgent: ''
  };
  const channel = toLiveChannel(entry, index, organizationMode, 'Sorgente');
  return {
    ...channel,
    id: `xtream-${stream.stream_id}`,
    fallbackStreamUrl: buildXtreamStreamUrl(stream.stream_id, config.outputFormat === 'ts' ? 'm3u8' : 'ts', config),
    source: 'Sorgente'
  };
}

async function loadXtreamViaApi(settings, config) {
  const organizationMode = settings?.organizationMode || 'AURA consigliata';
  const [categoriesData, streamsData] = await Promise.all([
    xtreamRequest('get_live_categories', {}, config),
    xtreamRequest('get_live_streams', {}, config)
  ]);

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const streams = Array.isArray(streamsData) ? streamsData : [];
  const categoryMap = new Map(categories.map((category) => [String(category.category_id), category.category_name]));

  return streams.map((stream, index) => buildLiveChannel(stream, categoryMap, index, config, organizationMode));
}

async function loadXtreamViaM3u(settings, config) {
  try {
    const m3uText = await xtreamM3uRequest(config.outputFormat === 'm3u8' ? 'm3u8' : 'mpegts', config);
    const library = splitM3uLibrary(m3uText, settings, 'Lista generata');
    if (library.live.length || library.movies.length || library.series.length) return { ...library, mode: 'xtream-m3u' };
  } catch {
    // try HLS output below
  }

  const hlsText = await xtreamM3uRequest('m3u8', config);
  return { ...splitM3uLibrary(hlsText, settings, 'Lista generata'), mode: 'xtream-m3u' };
}

function buildStats(live = [], movies = [], series = [], originalCount = 0, apiError = null) {
  const liveCategoryNames = Array.from(new Set(live.map((channel) => channel.category))).sort((a, b) => a.localeCompare(b, 'it'));
  return {
    live: {
      originalCount: originalCount || live.length,
      visibleCount: live.length,
      duplicateCount: Math.max(0, (originalCount || live.length) - live.length),
      categories: liveCategoryNames.length,
      fallbackUsed: Boolean(apiError),
      fallbackReason: apiError?.message || ''
    },
    movies: { visibleCount: movies.length },
    series: { visibleCount: series.length },
    total: live.length + movies.length + series.length
  };
}

function buildLibraryResult({ live = [], movies = [], series = [], mode = 'm3u-local', originalCount = 0, apiError = null }) {
  const liveCategoryNames = Array.from(new Set(live.map((channel) => channel.category))).sort((a, b) => a.localeCompare(b, 'it'));
  return {
    mode,
    live,
    channels: live,
    movies,
    series,
    categories: ['Tutti', 'Preferiti', ...liveCategoryNames],
    stats: buildStats(live, movies, series, originalCount, apiError)
  };
}

export function loadM3uTextLibrary(m3uText = '', settings = {}) {
  return buildLibraryResult({ ...splitM3uLibrary(m3uText, settings, 'M3U locale'), mode: 'm3u-local' });
}

export async function loadXtreamLiveLibrary(settings) {
  const config = getXtreamConfig(settings);

  if (!config) {
    return { mode: 'demo', channels: [], categories: [], stats: null };
  }

  let live = [];
  let movies = [];
  let series = [];
  let loadMode = 'xtream-api';
  let apiError = null;
  let originalCount = 0;

  try {
    live = mergeDuplicateChannels(await loadXtreamViaApi(settings, config));
    originalCount = live.length;
  } catch (error) {
    apiError = error;
    const m3uResult = await loadXtreamViaM3u(settings, config);
    live = m3uResult.live;
    movies = m3uResult.movies;
    series = m3uResult.series;
    originalCount = m3uResult.originalCount;
    loadMode = m3uResult.mode;
  }

  return buildLibraryResult({ live, movies, series, mode: loadMode, originalCount, apiError });
}

export async function loadAuraLiveLibrary(settings) {
  if (settings?.sourceType === 'M3U locale' || settings?.sourceType === 'M3U') {
    return loadM3uTextLibrary(settings?.m3u?.localText || '', settings);
  }
  return loadXtreamLiveLibrary(settings);
}

export async function loadAuraFullLibrary(settings) {
  return loadAuraLiveLibrary(settings);
}
