import { AURA_CHANNEL_REGISTRY, registryAliases } from './auraChannelRegistry.js';

export function normalizeAuraKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\[[0-9]+\]/g, '')
    .replace(/\b(backup|plus|hd|fhd|sd|uhd|4k|hevc|h265|h\.265|1080p|720p|576p|480p)\b/g, '')
    .replace(/\b(tv|live|italia|italy|it|ita|stream|channel|canale|lista|iptv)\b/g, '')
    .replace(/\b(rai\s*uno)\b/g, 'rai1')
    .replace(/\b(rai\s*due)\b/g, 'rai2')
    .replace(/\b(rai\s*tre)\b/g, 'rai3')
    .replace(/\b(rete\s*quattro)\b/g, 'rete4')
    .replace(/\b(canale\s*cinque)\b/g, 'canale5')
    .replace(/\b(la\s*sette)\b/g, 'la7')
    .replace(/[^a-z0-9]+/g, '');
}

function scoreCandidate(inputKeys, registryChannel) {
  const aliases = registryAliases(registryChannel).map(normalizeAuraKey).filter(Boolean);
  let best = 0;

  for (const inputKey of inputKeys) {
    if (!inputKey) continue;

    for (const alias of aliases) {
      if (!alias) continue;

      if (inputKey === alias) best = Math.max(best, 100);
      else if (inputKey.includes(alias) || alias.includes(inputKey)) {
        const ratio = Math.min(inputKey.length, alias.length) / Math.max(inputKey.length, alias.length);
        best = Math.max(best, Math.round(72 + ratio * 22));
      }
    }
  }

  return best;
}

export function cleanAuraName(value = '') {
  return String(value || '')
    .replace(/\[[0-9]+\]/g, ' ')
    .replace(/\b(IT|ITALIA|ITALY)\s*[:|.-]\s*/gi, ' ')
    .replace(/\b(4K|UHD|FHD|FULL\s*HD|HD|SD|HEVC|H265|H\.265|1080P|720P|576P|480P)\b/gi, ' ')
    .replace(/\s*[-–—|:]\s*$/g, ' ')
    .replace(/[_]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function identifyAuraChannel(raw = {}) {
  const candidates = [
    raw.tvgId,
    raw.tvgName,
    raw.name,
    raw.channel,
    raw.rawName
  ].filter(Boolean);

  const inputKeys = candidates.map(normalizeAuraKey).filter(Boolean);
  let best = null;

  for (const registryChannel of AURA_CHANNEL_REGISTRY) {
    const score = scoreCandidate(inputKeys, registryChannel);
    if (!best || score > best.score) best = { registryChannel, score };
  }

  if (best?.score >= 78) {
    return {
      auraId: best.registryChannel.id,
      name: best.registryChannel.name,
      category: best.registryChannel.category,
      group: best.registryChannel.group,
      logo: best.registryChannel.logo || '',
      registry: best.registryChannel,
      score: best.score,
      recognized: true
    };
  }

  const fallbackName = cleanAuraName(raw.tvgName || raw.name || raw.channel || raw.rawName || 'Canale');
  return {
    auraId: `custom-${normalizeAuraKey(fallbackName) || Math.random().toString(36).slice(2)}`,
    name: fallbackName,
    category: raw.category || raw.group || 'Altri',
    group: raw.group || 'Lista',
    logo: '',
    registry: null,
    score: best?.score || 0,
    recognized: false
  };
}

export function buildAuraEpgKeys(channel = {}) {
  const base = [
    channel.auraId,
    channel.channel,
    channel.name,
    channel.rawName,
    channel.tvgId,
    channel.tvgName,
    ...(channel.registry?.aliases || []),
    ...(channel.registry?.epgAliases || [])
  ].filter(Boolean);

  return Array.from(new Set(base.map(normalizeAuraKey).filter(Boolean)));
}
