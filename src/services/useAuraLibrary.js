import { useEffect, useState } from 'react';
import { loadAuraSettings } from './xtreamService.js';
import { loadAuraFullLibrary } from './auraEngine.js';
import { enrichChannelsWithEpg, loadEpgCache } from './epgService.js';
import { getDeviceDate } from './timeService.js';

const initialState = {
  ready: false,
  loading: false,
  error: '',
  mode: 'demo',
  live: [],
  channels: [],
  movies: [],
  series: [],
  categories: [],
  stats: null,
  sourceType: 'Demo'
};

export default function useAuraLibrary() {
  const [library, setLibrary] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const settings = loadAuraSettings();
      const sourceReady = ['M3U', 'M3U locale'].includes(settings?.sourceType)
        ? Boolean(settings?.m3u?.localText?.includes('#EXTM3U'))
        : Boolean(settings?.xtream?.serverUrl || settings?.xtream?.linkUrl);

      if (!sourceReady) {
        setLibrary(initialState);
        return;
      }

      try {
        setLibrary((current) => ({ ...current, loading: true, error: '' }));
        const result = await loadAuraFullLibrary(settings);

        if (cancelled) return;

        const epg = loadEpgCache();
        const rawChannels = result?.channels || result?.live || [];
        const epgChannels = enrichChannelsWithEpg(rawChannels, epg, getDeviceDate());

        setLibrary({
          ready: Boolean(epgChannels?.length || result?.movies?.length || result?.series?.length),
          loading: false,
          error: '',
          mode: result?.mode || 'demo',
          live: epgChannels,
          channels: epgChannels,
          movies: result?.movies || [],
          series: result?.series || [],
          categories: result?.categories || [],
          stats: result?.stats || null,
          sourceType: settings?.sourceType || 'Demo',
          epg
        });
      } catch (error) {
        if (cancelled) return;
        setLibrary({
          ...initialState,
          error: error.message || 'Errore caricamento sorgente.'
        });
      }
    }

    load();

    function handleStorage(event) {
      if (!event || event.key === 'aura-tv-settings') load();
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener('aura-settings-updated', handleStorage);
    window.addEventListener('aura-epg-updated', handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('aura-settings-updated', handleStorage);
      window.removeEventListener('aura-epg-updated', handleStorage);
    };
  }, []);

  return library;
}
