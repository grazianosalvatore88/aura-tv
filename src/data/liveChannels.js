export const liveCategories = [
  'Tutti',
  'Preferiti',
  'Generalisti',
  'Cinema',
  'Sport',
  'News',
  'Bambini',
  'Documentari',
  'Musica',
  'Regionali'
];

export const liveChannels = [
  {
    id: 'rai-1-live',
    number: 1,
    logo: 'RAI 1\nHD',
    channel: 'Rai 1 HD',
    title: 'Il Commissario Montalbano',
    subtitle: 'Stagione 14 · Episodio 2',
    time: '21:20 - 23:40',
    category: 'Generalisti',
    favorite: true,
    progress: 48,
    description: 'Montalbano indaga su un misterioso omicidio in una villa di campagna. Tra segreti e bugie, la verità è più vicina di quanto sembri.',
    background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1800'
  },
  {
    id: 'rai-2-live',
    number: 2,
    logo: 'RAI 2\nHD',
    channel: 'Rai 2 HD',
    title: 'Stasera tutto è possibile',
    subtitle: 'Intrattenimento',
    time: '21:20 - 23:35',
    category: 'Generalisti',
    favorite: false,
    progress: 42,
    description: 'Una serata di giochi, ospiti e improvvisazione con una formula leggera e adatta a tutta la famiglia.',
    background: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1800'
  },
  {
    id: 'rai-3-live',
    number: 3,
    logo: 'RAI 3\nHD',
    channel: 'Rai 3 HD',
    title: 'Report',
    subtitle: 'Approfondimento',
    time: '21:20 - 23:20',
    category: 'News',
    favorite: false,
    progress: 40,
    description: 'Inchieste, reportage e approfondimenti sui principali temi di attualità nazionale e internazionale.',
    background: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1800'
  },
  {
    id: 'canale-5-live',
    number: 4,
    logo: '5\nHD',
    channel: 'Canale 5 HD',
    title: 'Striscia la notizia',
    subtitle: 'La voce dell’influenza',
    time: '21:20 - 22:30',
    category: 'Generalisti',
    favorite: true,
    progress: 38,
    description: 'Satira, attualità e servizi dal territorio nel programma storico dell’access prime time italiano.',
    background: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1800'
  },
  {
    id: 'italia-1-live',
    number: 5,
    logo: 'ITA\n1',
    channel: 'Italia 1',
    title: 'NCIS - Unità anticrimine',
    subtitle: 'Serie TV',
    time: '21:15 - 22:10',
    category: 'Generalisti',
    favorite: false,
    progress: 61,
    description: 'Una nuova indagine porta la squadra a seguire tracce difficili tra tecnologia, prove nascoste e colpi di scena.',
    background: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1800'
  },
  {
    id: 'sky-sport-uno-live',
    number: 6,
    logo: 'SKY\nSPORT UNO',
    channel: 'Sky Sport Uno',
    title: 'Champions League',
    subtitle: 'Manchester City - Real Madrid',
    time: '21:00 - 23:00',
    category: 'Sport',
    favorite: true,
    progress: 67,
    description: 'Grande calcio europeo in diretta con una serata da non perdere e una sfida di altissimo livello.',
    background: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1800'
  },
  {
    id: 'sky-cinema-live',
    number: 7,
    logo: 'SKY\nCINEMA',
    channel: 'Sky Cinema Uno',
    title: 'Oppenheimer',
    subtitle: 'Film · Drammatico',
    time: '21:15 - 00:05',
    category: 'Cinema',
    favorite: false,
    progress: 28,
    description: 'Un grande film d’autore per una serata cinema premium, con atmosfere intense e immagini spettacolari.',
    background: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1800'
  },
  {
    id: 'la7-live',
    number: 8,
    logo: 'LA7\nHD',
    channel: 'La7 HD',
    title: 'DiMartedì',
    subtitle: 'Attualità',
    time: '21:15 - 23:15',
    category: 'News',
    favorite: false,
    progress: 52,
    description: 'Politica, attualità e approfondimenti con ospiti in studio e collegamenti dai luoghi della notizia.',
    background: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1800'
  },
  {
    id: 'eurosport-live',
    number: 9,
    logo: 'EURO\nSPORT',
    channel: 'Eurosport 1',
    title: 'Tennis ATP Roma',
    subtitle: 'Sport live',
    time: '20:30 - 23:00',
    category: 'Sport',
    favorite: true,
    progress: 72,
    description: 'Il grande tennis internazionale in diretta con i migliori match del torneo.',
    background: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1800'
  },
  {
    id: 'discovery-live',
    number: 10,
    logo: 'DISC\nHD',
    channel: 'Discovery Channel',
    title: 'Mega costruzioni',
    subtitle: 'Documentario',
    time: '21:00 - 22:00',
    category: 'Documentari',
    favorite: false,
    progress: 58,
    description: 'Viaggio dentro grandi opere di ingegneria, cantieri complessi e tecnologie estreme.',
    background: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1800'
  }
];

export const guideRows = [
  {
    channel: 'Rai 1 HD',
    logo: 'RAI 1\nHD',
    programs: [
      { title: 'Il Commissario Montalbano', time: '21:20 - 23:40', active: true },
      { title: 'Porta a Porta', time: '23:40 - 00:55' },
      { title: 'TG1 Notte', time: '00:55 - 01:20' }
    ]
  },
  {
    channel: 'Rai 2 HD',
    logo: 'RAI 2\nHD',
    programs: [
      { title: 'Stasera tutto è possibile', time: '21:20 - 23:35', active: true },
      { title: 'TG2 Post', time: '23:35 - 00:00' },
      { title: 'TG2 Notte', time: '00:00 - 00:30' }
    ]
  },
  {
    channel: 'Canale 5 HD',
    logo: '5\nHD',
    programs: [
      { title: 'Striscia la notizia', time: '21:20 - 22:30', active: true },
      { title: 'Grande Fratello', time: '22:30 - 01:10' },
      { title: '5 News', time: '01:10 - 01:45' }
    ]
  },
  {
    channel: 'Sky Sport Uno',
    logo: 'SKY\nSPORT UNO',
    programs: [
      { title: 'Champions League', time: '21:00 - 23:00', active: true },
      { title: 'Post partita', time: '23:00 - 00:30' },
      { title: 'Highlights', time: '00:30 - 01:00' }
    ]
  }
];
