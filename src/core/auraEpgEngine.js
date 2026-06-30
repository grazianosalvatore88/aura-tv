import {
  enrichChannelsWithEpg,
  extractM3uEpgKeys,
  loadEpgCache
} from '../services/epgService.js';
import { getDeviceDate } from '../services/timeService.js';
import { buildAuraEpgKeys } from './auraMatcher.js';

export function loadAuraEpg() {
  return loadEpgCache();
}

export function extractAuraWantedEpgKeys(rawM3uText = '', channels = []) {
  const fromM3u = extractM3uEpgKeys(rawM3uText || '');
  const fromChannels = channels.flatMap((channel) => buildAuraEpgKeys(channel));
  return Array.from(new Set([...fromM3u, ...fromChannels].filter(Boolean)));
}

export function attachAuraEpg(channels = [], epg = loadAuraEpg()) {
  return enrichChannelsWithEpg(channels, epg, getDeviceDate());
}
