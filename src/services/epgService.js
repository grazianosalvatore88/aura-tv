import { formatDeviceTime, getDeviceDate, getProgressBetween } from './timeService.js';

const EPG_KEY = 'aura-epg-cache';
const EPG_REPORT_KEY = 'aura-epg-report';

const FALLBACK_LOGOS = {
  rai1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Rai_1_-_Logo_2016.svg/512px-Rai_1_-_Logo_2016.svg.png',
  rai2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Rai_2_-_Logo_2016.svg/512px-Rai_2_-_Logo_2016.svg.png',
  rai3: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Rai_3_-_Logo_2016.svg/512px-Rai_3_-_Logo_2016.svg.png',
  rai4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Rai_4_-_Logo_2016.svg/512px-Rai_4_-_Logo_2016.svg.png',
  rainews24: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rai_News_24_-_Logo_2013.svg/512px-Rai_News_24_-_Logo_2013.svg.png',
  canale5: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Canale_5_-_2018_logo.svg/512px-Canale_5_-_2018_logo.svg.png',
  italia1: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Italia_1_2018.svg/512px-Italia_1_2018.svg.png',
  rete4: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Rete_4_2018.svg/512px-Rete_4_2018.svg.png',
  la7: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/LA7_-_Logo_2011.svg/512px-LA7_-_Logo_2011.svg.png',
  tv8: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/TV8_logo_2016.svg/512px-TV8_logo_2016.svg.png',
  nove: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/NOVE_logo.svg/512px-NOVE_logo.svg.png'
};

function decodeXml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export function extractEpgUrlFromM3u(m3uText = '') {
  const header = String(m3uText || '').split(/\r?\n/).find((line) => line.startsWith('#EXTM3U')) || '';
  const match = header.match(/x-tvg-url="([^"]+)"/i) || header.match(/url-tvg="([^"]+)"/i);
  return match ? decodeXml(match[1]).trim() : '';
}

export async function fetchEpgFromUrl(url) {
  const epgUrl = String(url || '').trim();
  if (!epgUrl) throw new Error('Inserisci un URL EPG valido.');

  const response = await fetch('/api/epg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: epgUrl })
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'Errore lettura EPG');
  }

  return payload.data;
}

export function parseXmlTvDate(value = '') {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
  if (!match) return null;

  const [, y, mo, d, h, mi, s, tz] = match;

  if (tz) {
    const sign = tz.startsWith('-') ? -1 : 1;
    const offsetHours = Number(tz.slice(1, 3));
    const offsetMinutes = Number(tz.slice(3, 5));
    const offsetMs = sign * ((offsetHours * 60 + offsetMinutes) * 60000);
    const utcMs = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)) - offsetMs;
    return new Date(utcMs);
  }

  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
}

function stripCommon(value = '') {
  return String(value || '')
    .replace(/\[[0-9]+\]/g, '')
    .replace(/\b(backup|plus|hd|fhd|sd|uhd|4k|hevc|h265|h\.265|tv|live|italia|italy|it|ita|stream|channel|canale)\b/gi, '')
    .replace(/\b(rai\s*uno)\b/gi, 'rai 1')
    .replace(/\b(rai\s*due)\b/gi, 'rai 2')
    .replace(/\b(rai\s*tre)\b/gi, 'rai 3')
    .replace(/\b(rete\s*quattro)\b/gi, 'rete 4')
    .replace(/\b(la\s*sette)\b/gi, 'la7');
}

export function normalizeEpgKey(value = '') {
  return stripCommon(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

export function epgAliases(value = '') {
  const key = normalizeEpgKey(value);
  const aliases = new Set([key]);

  const canonical = {
    rai1: ['raiuno', 'rai1hd', 'rai1it', 'rai1'],
    rai2: ['raidue', 'rai2hd', 'rai2it', 'rai2'],
    rai3: ['raitre', 'rai3hd', 'rai3it', 'rai3'],
    rai4: ['rai4hd', 'rai4'],
    rai5: ['rai5hd', 'rai5'],
    raimovie: ['raimoviehd', 'raimovies'],
    raipremium: ['raipremiumhd'],
    rainews24: ['rainews', 'rainews24hd', 'rai24'],
    raisport: ['raisporthd', 'raisportpiu', 'raisportpiuhd'],
    raiyoyo: ['raiyoyohd'],
    raigulp: ['raigulphd'],
    raihistory: ['raistoria', 'raistoriahd'],
    canale5: ['c5', 'canale5hd', 'canale5it'],
    italia1: ['i1', 'italia1hd', 'italia1it'],
    rete4: ['r4', 'retequattro', 'rete4hd', 'rete4it'],
    mediaset20: ['20', '20mediaset', '20hd'],
    iris: ['irishd'],
    la5: ['la5hd'],
    cine34: ['cine34hd'],
    focus: ['focushd'],
    topcrime: ['topcrimehd'],
    la7: ['la7hd'],
    la7d: ['la7dhd'],
    tv8: ['tv8hd'],
    cielo: ['cielohd'],
    nove: ['novehd', '9'],
    realtime: ['realtimehd'],
    dmax: ['dmaxhd'],
    giallo: ['giallohd'],
    foodnetwork: ['foodnetworkhd'],
    motortrend: ['motortrendhd'],
    k2: ['k2hd'],
    frisbee: ['frisbeehd'],
    sportitalia: ['sportitaliahd'],
    supertennis: ['supertennishd'],
    tgcom24: ['tgcom', 'tgcom24hd']
  };

  Object.entries(canonical).forEach(([main, list]) => {
    if (key === main || list.includes(key)) {
      aliases.add(main);
      list.forEach((item) => aliases.add(item));
    }
  });

  return Array.from(aliases).filter(Boolean);
}

export function extractM3uEpgKeys(m3uText = '') {
  const text = String(m3uText || '')
    .replace(/\s+(#EXTINF)/g, '\n$1')
    .replace(/\s+(#EXTVLCOPT)/g, '\n$1')
    .replace(/\s+(https?:\/\/)/g, '\n$1');

  const keys = new Set();
  const lines = text.split(/\r?\n/);

  lines.forEach((line) => {
    if (!line.startsWith('#EXTINF')) return;

    const attrs = {};
    const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
    let match;
    while ((match = regex.exec(line)) !== null) attrs[match[1]] = match[2];

    const commaIndex = line.lastIndexOf(',');
    const fallbackName = commaIndex !== -1 ? line.slice(commaIndex + 1).trim() : '';

    [attrs['tvg-id'], attrs['tvg-name'], fallbackName].filter(Boolean).forEach((value) => {
      epgAliases(value).forEach((alias) => keys.add(alias));
    });
  });

  return Array.from(keys);
}

export function extractM3uChannelProfiles(m3uText = '') {
  const text = String(m3uText || '')
    .replace(/\s+(#EXTINF)/g, '\n$1')
    .replace(/\s+(#EXTVLCOPT)/g, '\n$1')
    .replace(/\s+(https?:\/\/)/g, '\n$1');

  return text.split(/\r?\n/)
    .filter((line) => line.startsWith('#EXTINF'))
    .map((line) => {
      const attrs = {};
      const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
      let match;
      while ((match = regex.exec(line)) !== null) attrs[match[1]] = match[2];

      const commaIndex = line.lastIndexOf(',');
      const fallbackName = commaIndex !== -1 ? line.slice(commaIndex + 1).trim() : '';

      const names = [attrs['tvg-id'], attrs['tvg-name'], fallbackName].filter(Boolean);
      const keys = Array.from(new Set(names.flatMap((name) => epgAliases(name))));

      return {
        name: attrs['tvg-name'] || fallbackName || attrs['tvg-id'] || '',
        keys,
        logo: attrs['tvg-logo'] || ''
      };
    })
    .filter((profile) => profile.keys.length);
}

function shouldKeepProgram(programKeys, wantedKeys) {
  if (!wantedKeys?.length) return true;
  return programKeys.some((key) => wantedKeys.includes(key));
}

function findBestFallbackLogo(keys = []) {
  for (const key of keys) {
    if (FALLBACK_LOGOS[key]) return FALLBACK_LOGOS[key];
  }
  return '';
}

export function parseXmlTv(xmlText = '', wantedKeys = []) {
  const programmes = [];
  const channelNames = new Map();
  const channelIcons = new Map();
  const channelKeyMap = new Map();
  const text = String(xmlText || '');
  const wanted = Array.from(new Set((wantedKeys || []).filter(Boolean)));
  const now = getDeviceDate().getTime();
  const minMs = now - (6 * 60 * 60 * 1000);
  const maxMs = now + (48 * 60 * 60 * 1000);

  const channelRegex = /<channel\s+id="([^"]+)"[\s\S]*?<\/channel>/gi;
  let channelMatch;
  let totalEpgChannels = 0;

  while ((channelMatch = channelRegex.exec(text)) !== null) {
    totalEpgChannels += 1;
    const block = channelMatch[0];
    const id = decodeXml(channelMatch[1]);
    const displayNames = Array.from(block.matchAll(/<display-name[^>]*>([\s\S]*?)<\/display-name>/gi))
      .map((item) => decodeXml(item[1].replace(/<[^>]+>/g, '').trim()))
      .filter(Boolean);
    const display = displayNames[0] || id;
    const iconMatch = block.match(/<icon[^>]*src="([^"]+)"/i);
    const icon = iconMatch ? decodeXml(iconMatch[1]).trim() : '';

    channelNames.set(id, display);
    if (icon) channelIcons.set(id, icon);

    const keys = new Set();
    [id, display, ...displayNames].forEach((value) => epgAliases(value).forEach((alias) => keys.add(alias)));
    channelKeyMap.set(id, Array.from(keys));
  }

  const programRegex = /<programme\s+([^>]+)>([\s\S]*?)<\/programme>/gi;
  let match;
  let totalProgrammes = 0;

  while ((match = programRegex.exec(text)) !== null) {
    totalProgrammes += 1;
    const attrs = match[1];
    const body = match[2];
    const channel = decodeXml((attrs.match(/channel="([^"]+)"/i) || [])[1] || '');
    const startRaw = (attrs.match(/start="([^"]+)"/i) || [])[1] || '';
    const stopRaw = (attrs.match(/stop="([^"]+)"/i) || [])[1] || '';

    const start = parseXmlTvDate(startRaw);
    const stop = parseXmlTvDate(stopRaw);

    if (!channel || !start || !stop) continue;
    if (stop.getTime() < minMs || start.getTime() > maxMs) continue;

    const programKeys = channelKeyMap.get(channel) || epgAliases(channel);
    if (!shouldKeepProgram(programKeys, wanted)) continue;

    const title = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || 'Programma';
    const desc = (body.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i) || [])[1] || '';
    const category = (body.match(/<category[^>]*>([\s\S]*?)<\/category>/i) || [])[1] || '';
    const iconMatch = body.match(/<icon[^>]*src="([^"]+)"/i);
    const programIcon = iconMatch ? decodeXml(iconMatch[1]).trim() : '';

    programmes.push({
      channel,
      channelName: channelNames.get(channel) || channel,
      channelKey: normalizeEpgKey(channel),
      channelNameKey: normalizeEpgKey(channelNames.get(channel) || channel),
      matchKeys: programKeys,
      channelIcon: programIcon || channelIcons.get(channel) || findBestFallbackLogo(programKeys),
      title: decodeXml(title.replace(/<[^>]+>/g, '').trim()),
      description: decodeXml(desc.replace(/<[^>]+>/g, '').trim()),
      category: decodeXml(category.replace(/<[^>]+>/g, '').trim()),
      start,
      stop,
      startMs: start.getTime(),
      stopMs: stop.getTime(),
      timeLabel: `${formatDeviceTime(start)} - ${formatDeviceTime(stop)}`
    });
  }

  programmes.sort((a, b) => a.startMs - b.startMs);

  const matchedChannels = new Set(programmes.map((item) => item.channel)).size;
  const report = {
    totalEpgChannels,
    totalProgrammes,
    wantedKeys: wanted.length,
    matchedChannels,
    savedProgrammes: programmes.length,
    window: 'oggi + domani'
  };

  return {
    programmes,
    count: programmes.length,
    channelCount: matchedChannels,
    report,
    loadedAt: Date.now()
  };
}

export function buildEpgReportFromM3u(m3uText = '', epg = null) {
  const profiles = extractM3uChannelProfiles(m3uText);
  const matched = [];
  const missing = [];

  profiles.forEach((profile) => {
    const hasMatch = Boolean(epg?.programmes?.some((program) => (
      (program.matchKeys || []).some((key) => profile.keys.includes(key))
    )));

    if (hasMatch) matched.push(profile.name);
    else missing.push(profile.name);
  });

  return {
    m3uChannels: profiles.length,
    matchedChannels: matched.length,
    missingChannels: missing.length,
    savedProgrammes: epg?.count || 0,
    epgChannels: epg?.report?.totalEpgChannels || 0,
    totalProgrammes: epg?.report?.totalProgrammes || 0,
    matched: matched.slice(0, 30),
    missing: missing.slice(0, 30),
    loadedAt: Date.now()
  };
}

export function saveEpgReport(report) {
  try {
    localStorage.setItem(EPG_REPORT_KEY, JSON.stringify(report));
  } catch {
    // ignore
  }
}

export function loadEpgReport() {
  try {
    const stored = localStorage.getItem(EPG_REPORT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveEpgCache(epg) {
  try {
    const compact = {
      count: epg.count,
      channelCount: epg.channelCount || 0,
      loadedAt: epg.loadedAt || Date.now(),
      report: epg.report || null,
      programmes: epg.programmes.map((item) => ({
        channel: item.channel,
        channelName: item.channelName,
        channelKey: item.channelKey,
        channelNameKey: item.channelNameKey,
        matchKeys: item.matchKeys || [],
        channelIcon: item.channelIcon || '',
        title: item.title,
        description: item.description,
        category: item.category,
        start: item.start.toISOString(),
        stop: item.stop.toISOString(),
        startMs: item.startMs,
        stopMs: item.stopMs,
        timeLabel: item.timeLabel
      }))
    };

    localStorage.setItem(EPG_KEY, JSON.stringify(compact));
    return true;
  } catch {
    return false;
  }
}

export function loadEpgCache() {
  try {
    const stored = localStorage.getItem(EPG_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      programmes: (parsed.programmes || []).map((item) => ({
        ...item,
        start: new Date(item.start),
        stop: new Date(item.stop)
      }))
    };
  } catch {
    return null;
  }
}

function channelKeys(channel = {}) {
  return [
    channel.epgChannelId,
    channel.rawName,
    channel.channel,
    channel.logo
  ]
    .filter(Boolean)
    .flatMap((value) => epgAliases(value));
}

export function findCurrentProgram(channel, epg, now = getDeviceDate()) {
  if (!epg?.programmes?.length || !channel) return null;

  const keys = channelKeys(channel);
  const nowMs = now.getTime();

  const matches = epg.programmes.filter((program) => (
    (program.matchKeys || []).some((key) => keys.includes(key))
    || keys.includes(program.channelKey)
    || keys.includes(program.channelNameKey)
  ));

  const current = matches.find((program) => program.startMs <= nowMs && program.stopMs > nowMs);
  const next = matches.find((program) => program.startMs > nowMs);

  if (!current && !next) return null;

  return {
    current,
    next,
    progress: current ? getProgressBetween(current.start, current.stop, now) : 0,
    title: current?.title || 'Programmazione non disponibile',
    subtitle: current?.category || channel.category || 'Live TV',
    description: current?.description || channel.description || 'Descrizione programma non disponibile.',
    time: current?.timeLabel || 'Ora',
    nextLabel: next ? `${formatDeviceTime(next.start)} · ${next.title}` : '',
    icon: current?.channelIcon || next?.channelIcon || ''
  };
}

export function enrichChannelsWithEpg(channels = [], epg, now = getDeviceDate()) {
  return channels.map((channel) => {
    const program = findCurrentProgram(channel, epg, now);
    const fallbackLogo = findBestFallbackLogo(channelKeys(channel));

    if (!program?.current) {
      return {
        ...channel,
        icon: channel.icon || fallbackLogo || '',
        title: channel.title || 'In onda ora',
        subtitle: channel.subtitle || channel.category || 'Live TV',
        description: channel.description || 'Programmazione non disponibile.',
        time: channel.time || 'Ora',
        progress: channel.progress || 0,
        epg: null
      };
    }

    return {
      ...channel,
      icon: channel.icon || program.icon || fallbackLogo || '',
      title: program.title,
      subtitle: program.subtitle,
      description: program.description,
      time: program.time,
      progress: program.progress,
      nextProgram: program.nextLabel,
      epg: program
    };
  });
}
