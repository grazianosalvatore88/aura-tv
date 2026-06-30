import { loadAuraLiveLibrary } from '../services/auraEngine.js';
import { loadAuraSettings } from '../services/xtreamService.js';
import { loadAuraEpg, attachAuraEpg } from './auraEpgEngine.js';
import { identifyAuraChannel } from './auraMatcher.js';
import { resolveAuraLogo } from './auraLogoEngine.js';
import { detectAuraStream } from './auraStreamEngine.js';
import { buildAuraDiagnostics, saveAuraDiagnostics } from './auraDiagnostics.js';

function normalizeSourceLabel(value = '') {
  if (value === 'M3U locale' || value === 'M3U') return 'M3U';
  if (value === 'Lista con link') return 'M3U';
  if (value === 'Xtream') return 'Xtream';
  return value || 'Sorgente';
}

function upgradeChannel(rawChannel, index, settings = {}) {
  const identity = identifyAuraChannel({
    tvgId: rawChannel.epgChannelId || rawChannel.tvgId,
    tvgName: rawChannel.tvgName,
    name: rawChannel.rawName || rawChannel.channel,
    channel: rawChannel.channel,
    category: rawChannel.category,
    group: rawChannel.originalCategory
  });

  const stream = detectAuraStream(rawChannel.streamUrl, {
    httpUserAgent: rawChannel.httpUserAgent
  });

  const logo = resolveAuraLogo({
    m3uLogo: rawChannel.icon,
    xtreamLogo: rawChannel.stream_icon,
    registryLogo: identity.logo,
    name: identity.name || rawChannel.channel
  });

  const finalName = identity.recognized ? identity.name : rawChannel.channel;
  const finalCategory = identity.recognized ? identity.category : rawChannel.category;

  return {
    ...rawChannel,
    id: rawChannel.id || `${identity.auraId}-${index}`,
    auraId: identity.auraId,
    channel: finalName,
    name: finalName,
    rawName: rawChannel.rawName || rawChannel.channel || finalName,
    originalName: rawChannel.rawName || rawChannel.channel || finalName,
    category: finalCategory || 'Altri',
    originalCategory: rawChannel.originalCategory || rawChannel.category || 'Altri',
    group: identity.group || rawChannel.group || 'Lista',
    icon: logo.image,
    logo: logo.text || rawChannel.logo,
    logoSource: logo.source,
    registry: identity.registry,
    recognized: identity.recognized,
    recognitionScore: identity.score,
    streamType: stream.streamType,
    streamFamily: stream.streamFamily,
    compatibility: stream.compatibility,
    streamNote: stream.note,
    playableStatus: stream.playableStatus,
    sourceType: normalizeSourceLabel(settings.sourceType),
    subtitle: finalCategory || rawChannel.subtitle || 'Live TV',
    title: rawChannel.title === 'In onda ora' ? 'Programmazione non disponibile' : rawChannel.title,
    description: rawChannel.description || 'Programmazione non disponibile.'
  };
}

export async function loadAuraCoreLibrary(settings = loadAuraSettings()) {
  const baseLibrary = await loadAuraLiveLibrary(settings);
  const epg = loadAuraEpg();

  const upgradedChannels = (baseLibrary.channels || baseLibrary.live || [])
    .map((channel, index) => upgradeChannel(channel, index, settings));

  const epgChannels = attachAuraEpg(upgradedChannels, epg);

  const diagnostics = buildAuraDiagnostics(epgChannels, epg);
  saveAuraDiagnostics(diagnostics);

  const categories = Array.from(new Set(['Tutti', 'Preferiti', ...epgChannels.map((channel) => channel.category).filter(Boolean)]));

  return {
    ...baseLibrary,
    mode: 'aura-core',
    coreVersion: '3.2.0',
    channels: epgChannels,
    live: epgChannels,
    categories,
    movies: baseLibrary.movies || [],
    series: baseLibrary.series || [],
    epg,
    diagnostics,
    stats: {
      ...(baseLibrary.stats || {}),
      auraCore: diagnostics
    }
  };
}
