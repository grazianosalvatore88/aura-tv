export const sportFilters = [
  'Tutto',
  'Live ora',
  'Calcio',
  'Motori',
  'Tennis',
  'Basket',
  'Altri sport'
];

export const sportProviderKeywords = [
  'dazn',
  'zona dazn',
  'sky sport',
  'sky calcio',
  'sky serie a',
  'eurosport',
  'sportitalia',
  'rai sport',
  'supertennis',
  'tennis channel',
  'f1',
  'formula 1',
  'motogp',
  'nba',
  'nfl',
  'eleven',
  'bein',
  'espn',
  'premier',
  'laliga',
  'serie a',
  'champions',
  'europa league',
  'conference league'
];

export function detectSportContent(source = {}) {
  const text = [
    source.channel,
    source.name,
    source.group,
    source.category,
    source.title,
    source.subtitle,
    source.provider,
    source.competition
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const matchedKeyword = sportProviderKeywords.find((keyword) => text.includes(keyword));

  return {
    isSport: Boolean(matchedKeyword),
    confidence: matchedKeyword ? 96 : 0,
    reason: matchedKeyword ? matchedKeyword : ''
  };
}

export const sportEvents = [
  {
    id: 'inter-real-live',
    title: 'Inter - Real Madrid',
    competition: 'Champions League',
    sport: 'Calcio',
    status: 'Live ora',
    time: '21:00',
    channel: 'Sky Sport Uno 4K',
    provider: 'Sky Sport',
    quality: '4K',
    favorite: true,
    progress: 57,
    score: '1 - 1',
    description: 'Grande serata europea con diretta pre-partita, telecronaca principale e qualità massima disponibile.',
    backdrop: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1800',
    logo: `SKY
SPORT`
  },
  {
    id: 'motogp',
    title: 'MotoGP - Gara Sprint',
    competition: 'MotoGP',
    sport: 'Motori',
    status: 'Live ora',
    time: 'Ora in onda',
    channel: 'Sky Sport MotoGP',
    provider: 'Sky Sport',
    quality: 'FHD',
    favorite: false,
    progress: 38,
    score: '',
    description: 'Gara sprint in diretta con copertura dedicata MotoGP.',
    backdrop: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1800',
    logo: `MOTO
GP`
  },
  {
    id: 'eurosport-cycling',
    title: 'Tour de France - Tappa 12',
    competition: 'Ciclismo',
    sport: 'Altri sport',
    status: 'Live ora',
    time: 'Ora in onda',
    channel: 'Eurosport 1 HD',
    provider: 'Eurosport',
    quality: 'HD',
    favorite: false,
    progress: 66,
    score: '',
    description: 'Diretta Eurosport con aggiornamenti live e copertura della tappa.',
    backdrop: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1800',
    logo: `EURO
SPORT`
  },
  {
    id: 'serie-a-dazn-live',
    title: 'Milan - Napoli',
    competition: 'Serie A',
    sport: 'Calcio',
    status: 'Live ora',
    time: 'Ora in onda',
    channel: 'Zona DAZN 1',
    provider: 'DAZN',
    quality: 'FHD',
    favorite: true,
    progress: 44,
    score: '0 - 0',
    description: 'Match di Serie A con diretta live e aggiornamenti in tempo reale.',
    backdrop: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1800',
    logo: `DAZN
1`
  },
  {
    id: 'tennis-live',
    title: 'Sinner - Alcaraz',
    competition: 'ATP Finals',
    sport: 'Tennis',
    status: 'Live ora',
    time: 'Ora in onda',
    channel: 'SuperTennis HD',
    provider: 'SuperTennis',
    quality: 'HD',
    favorite: true,
    progress: 29,
    score: '6 - 4',
    description: 'Grande match di tennis con diretta live e copertura dedicata.',
    backdrop: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1800',
    logo: `TENNIS
HD`
  },
  {
    id: 'nba-live',
    title: 'Lakers - Celtics',
    competition: 'NBA',
    sport: 'Basket',
    status: 'Live ora',
    time: 'Ora in onda',
    channel: 'NBA TV',
    provider: 'NBA',
    quality: 'FHD',
    favorite: false,
    progress: 51,
    score: '72 - 68',
    description: 'Evento NBA in diretta con copertura live.',
    backdrop: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1800',
    logo: `NBA
TV`
  }
];

export const sportChannels = [
  {
    id: 'dazn-1',
    channel: 'Zona DAZN 1',
    group: 'Intrattenimento',
    provider: 'DAZN',
    category: 'Calcio',
    quality: 'FHD',
    logo: `DAZN
1`,
    title: 'Serie A · Big match',
    favorite: true
  },
  {
    id: 'dazn-2',
    channel: 'Zona DAZN 2',
    group: 'Canali Premium',
    provider: 'DAZN',
    category: 'Calcio',
    quality: 'FHD',
    logo: `DAZN
2`,
    title: 'Serie A · Diretta Goal',
    favorite: false
  },
  {
    id: 'sky-sport-uno',
    channel: 'Sky Sport Uno 4K',
    group: 'Sky',
    provider: 'Sky Sport',
    category: 'Calcio',
    quality: '4K',
    logo: `SKY
SPORT`,
    title: 'Eventi principali',
    favorite: true
  },
  {
    id: 'sky-f1',
    channel: 'Sky Sport F1',
    group: 'Motori',
    provider: 'Sky Sport',
    category: 'Motori',
    quality: '4K',
    logo: `F1
4K`,
    title: 'Formula 1',
    favorite: false
  },
  {
    id: 'supertennis',
    channel: 'SuperTennis HD',
    group: 'Nazionali',
    provider: 'SuperTennis',
    category: 'Tennis',
    quality: 'HD',
    logo: `TENNIS
HD`,
    title: 'Tennis live',
    favorite: true
  },
  {
    id: 'eurosport1',
    channel: 'Eurosport 1 HD',
    group: 'Documentari',
    provider: 'Eurosport',
    category: 'Altri sport',
    quality: 'HD',
    logo: `EURO
1`,
    title: 'Ciclismo e grandi eventi',
    favorite: false
  }
].map((channel) => ({
  ...channel,
  detection: detectSportContent(channel)
}));
