import { buildXtreamStreamUrl, getXtreamConfig, xtreamM3uRequest, xtreamRequest } from './xtreamService.js';

const qualityWeight = {
  '4K': 5,
  'UHD': 5,
  'FHD': 4,
  'HD': 3,
  'SD': 1
};

const sportKeywords = [
  'dazn',
  'sky sport',
  'sky calcio',
  'eurosport',
  'supertennis',
  'tennis',
  'formula 1',
  'f1',
  'motogp',
  'nba',
  'nfl',
  'sportitalia',
  'rai sport',
  'champions',
  'serie a',
  'calcio'
];

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

export function normalizeChannelKey(value = '') {
  return cleanChannelName(value)
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
  const words = cleanChannelName(name).split(' ').filter(Boolean);
  if (!words.length) return 'TV';
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words.slice(0, 2).map((word) => word.slice(0, 4).toUpperCase()).join('\n');
}

function buildLiveChannel(stream, categoryMap, index, config, organizationMode) {
  const rawName = stream.name || stream.stream_display_name || `Canale ${stream.stream_id}`;
  const cleanedName = cleanChannelName(rawName);
  const rawCategory = categoryMap.get(String(stream.category_id)) || stream.category_name || 'Altri';
  const quality = detectQuality(rawName);
  const auraCategory = organizationMode === 'Originale lista'
    ? cleanCategoryName(rawCategory)
    : detectAuraCategory(rawName, rawCategory);

  const directSource = String(stream.direct_source || '').trim();

  return {
    id: `xtream-${stream.stream_id}`,
    streamId: stream.stream_id,
    number: String(index + 1).padStart(3, '0'),
    channel: cleanedName || rawName,
    rawName,
    title: 'In onda ora',
    subtitle: auraCategory,
    category: auraCategory,
    originalCategory: cleanCategoryName(rawCategory),
    logo: firstLogoText(cleanedName || rawName),
    icon: stream.stream_icon || '',
    background: stream.stream_icon || 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1600',
    qualityLabel: quality === 'Auto' ? 'HD' : quality,
    selectedResolution: quality === 'Auto' ? 'HD' : quality,
    resolutions: [quality === 'Auto' ? 'HD' : quality],
    time: 'Ora',
    description: 'Canale caricato dalla sorgente Xtream.',
    progress: 38,
    favorite: false,
    source: 'Xtream',
    streamUrl: directSource || buildXtreamStreamUrl(stream.stream_id, 'm3u8', config),
    fallbackStreamUrl: buildXtreamStreamUrl(stream.stream_id, 'ts', config),
    epgChannelId: stream.epg_channel_id || '',
    normalizedKey: normalizeChannelKey(rawName),
    auraEngine: {
      cleaned: cleanedName !== rawName,
      originalName: rawName,
      quality,
      category: auraCategory
    }
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

    const better = (qualityWeight[channel.qualityLabel] || 0) > (qualityWeight[existing.qualityLabel] || 0)
      ? channel
      : existing;

    map.set(key, {
      ...better,
      number: existing.number,
      resolutions: mergedResolutions.length ? mergedResolutions : [better.qualityLabel],
      selectedResolution: mergedResolutions[0] || better.qualityLabel,
      duplicateCount: (existing.duplicateCount || 1) + 1,
      qualityVariants: mergedResolutions
    });
  }

  return Array.from(map.values()).map((channel, index) => ({
    ...channel,
    number: String(index + 1).padStart(3, '0')
  }));
}


function parseExtinfAttributes(value = '') {
  const attrs = {};
  const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let match;

  while ((match = regex.exec(value)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

function isLikelyLiveStream(url = '', name = '', group = '') {
  const text = `${url} ${name} ${group}`.toLowerCase();

  if (text.includes('/series/') || text.includes('/movie/')) return false;
  if (/\b(vod|film|movie|movies|serie tv|series|stagione|season|s0[0-9]|e0[0-9])\b/i.test(text)) return false;

  return true;
}

function parseM3uLiveChannels(m3uText = '', config, organizationMode) {
  const lines = String(m3uText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const channels = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      const attrs = parseExtinfAttributes(line);
      const commaIndex = line.lastIndexOf(',');
      const fallbackName = commaIndex !== -1 ? line.slice(commaIndex + 1).trim() : '';
      const name = attrs['tvg-name'] || fallbackName || 'Canale';
      const group = attrs['group-title'] || 'Altri';

      current = {
        name,
        group,
        logo: attrs['tvg-logo'] || '',
        epgChannelId: attrs['tvg-id'] || ''
      };
      continue;
    }

    if (!line.startsWith('#') && current) {
      if (isLikelyLiveStream(line, current.name, current.group)) {
        channels.push({
          ...current,
          streamUrl: line
        });
      }

      current = null;
    }
  }

  return channels.map((entry, index) => {
    const rawName = entry.name;
    const cleanedName = cleanChannelName(rawName);
    const quality = detectQuality(`${rawName} ${entry.group}`);
    const auraCategory = organizationMode === 'Originale lista'
      ? cleanCategoryName(entry.group)
      : detectAuraCategory(rawName, entry.group);

    return {
      id: `m3u-${normalizeChannelKey(rawName)}-${index}`,
      streamId: '',
      number: String(index + 1).padStart(3, '0'),
      channel: cleanedName || rawName,
      rawName,
      title: 'In onda ora',
      subtitle: auraCategory,
      category: auraCategory,
      originalCategory: cleanCategoryName(entry.group),
      logo: firstLogoText(cleanedName || rawName),
      icon: entry.logo,
      background: entry.logo || 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1600',
      qualityLabel: quality === 'Auto' ? 'HD' : quality,
      selectedResolution: quality === 'Auto' ? 'HD' : quality,
      resolutions: [quality === 'Auto' ? 'HD' : quality],
      time: 'Ora',
      description: 'Canale caricato dalla lista M3U Xtream.',
      progress: 38,
      favorite: false,
      source: 'Xtream M3U',
      streamUrl: entry.streamUrl,
      fallbackStreamUrl: entry.streamUrl.replace(/\.m3u8($|\?)/i, '.ts$1'),
      epgChannelId: entry.epgChannelId || '',
      normalizedKey: normalizeChannelKey(rawName),
      auraEngine: {
        cleaned: cleanedName !== rawName,
        originalName: rawName,
        quality,
        category: auraCategory
      }
    };
  });
}

async function loadXtreamViaApi(settings, config) {
  const [categoriesData, streamsData] = await Promise.all([
    xtreamRequest('get_live_categories', {}, config),
    xtreamRequest('get_live_streams', {}, config)
  ]);

  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const streams = Array.isArray(streamsData) ? streamsData : [];
  const categoryMap = new Map(categories.map((category) => [
    String(category.category_id),
    category.category_name
  ]));

  const organizationMode = settings?.organizationMode || 'AURA consigliata';

  return streams.map((stream, index) => buildLiveChannel(
    stream,
    categoryMap,
    index,
    config,
    organizationMode
  ));
}

async function loadXtreamViaM3u(settings, config) {
  const organizationMode = settings?.organizationMode || 'AURA consigliata';

  try {
    const m3uText = await xtreamM3uRequest('mpegts', config);
    const channels = parseM3uLiveChannels(m3uText, config, organizationMode);

    if (channels.length) {
      return {
        channels,
        mode: 'xtream-m3u'
      };
    }
  } catch {
    // try HLS output below
  }

  const hlsText = await xtreamM3uRequest('m3u8', config);
  return {
    channels: parseM3uLiveChannels(hlsText, config, organizationMode),
    mode: 'xtream-m3u'
  };
}


export async function loadXtreamLiveLibrary(settings) {
  const config = getXtreamConfig(settings);

  if (!config) {
    return {
      mode: 'demo',
      channels: [],
      categories: [],
      stats: null
    };
  }

  let mapped = [];
  let loadMode = 'xtream-api';
  let apiError = null;

  try {
    mapped = await loadXtreamViaApi(settings, config);
  } catch (error) {
    apiError = error;
    const m3uResult = await loadXtreamViaM3u(settings, config);
    mapped = m3uResult.channels;
    loadMode = m3uResult.mode;
  }

  const channels = mergeDuplicateChannels(mapped);
  const categoryNames = Array.from(new Set(channels.map((channel) => channel.category))).sort((a, b) => a.localeCompare(b, 'it'));
  const duplicateCount = mapped.length - channels.length;

  return {
    mode: loadMode,
    channels,
    categories: ['Tutti', 'Preferiti', ...categoryNames],
    stats: {
      originalCount: mapped.length,
      visibleCount: channels.length,
      duplicateCount,
      categories: categoryNames.length,
      fallbackUsed: Boolean(apiError),
      fallbackReason: apiError?.message || ''
    }
  };
}

