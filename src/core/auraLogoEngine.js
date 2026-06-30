export function createTextLogo(name = '') {
  const words = String(name || 'TV').split(/\s+/).filter(Boolean);

  if (!words.length) return 'TV';
  if (words.length === 1) return words[0].slice(0, 5).toUpperCase();

  return words.slice(0, 2).map((word) => word.slice(0, 6).toUpperCase()).join('\n');
}

export function resolveAuraLogo({ m3uLogo = '', xtreamLogo = '', epgLogo = '', registryLogo = '', name = '' } = {}) {
  const image = m3uLogo || xtreamLogo || epgLogo || registryLogo || '';
  return {
    image,
    text: image ? '' : createTextLogo(name),
    source: m3uLogo ? 'm3u' : xtreamLogo ? 'xtream' : epgLogo ? 'epg' : registryLogo ? 'registry' : 'text'
  };
}
