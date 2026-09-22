export const FAMOUS_COORDINATES = [
  // === APOLLO MISSIONS ===
  {
    id: 'apollo-11',
    name: 'Apollo 11 – Tranquility Base',
    subName: 'First human Moon landing, 1969',
    lat: 0.674,
    lng: 23.473,
    status: 'Claimed',
    owner: 'Neil Armstrong',
    pricePerAcre: 499,
    description: 'Where Neil Armstrong and Buzz Aldrin first walked on the Moon, July 20 1969.',
    category: 'Apollo'
  },
  {
    id: 'apollo-12',
    name: 'Apollo 12 – Oceanus Procellarum',
    subName: 'Precision landing near Surveyor 3, 1969',
    lat: -3.012,
    lng: -23.422,
    status: 'Available',
    pricePerAcre: 349,
    description: 'Landed within walking distance of robotic Surveyor 3 in the Ocean of Storms.',
    category: 'Apollo'
  },
  {
    id: 'apollo-14',
    name: 'Apollo 14 – Fra Mauro',
    subName: 'Alan Shepard plays golf on Moon, 1971',
    lat: -3.646,
    lng: -17.472,
    status: 'Available',
    pricePerAcre: 349,
    description: 'Originally the Apollo 13 target. Alan Shepard famously hit two golf balls here.',
    category: 'Apollo'
  },
  {
    id: 'apollo-15',
    name: 'Apollo 15 – Hadley Rille',
    subName: 'First Lunar Rover drive, 1971',
    lat: 26.132,
    lng: 3.633,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Explored the deep canyon Hadley Rille and the Apennine Mountains.',
    category: 'Apollo'
  },
  {
    id: 'apollo-16',
    name: 'Apollo 16 – Descartes Highlands',
    subName: 'Highland volcanic exploration, 1972',
    lat: -8.973,
    lng: 15.501,
    status: 'Available',
    pricePerAcre: 349,
    description: 'First and only mission to land in the lunar highlands region.',
    category: 'Apollo'
  },
  {
    id: 'apollo-17',
    name: 'Apollo 17 – Taurus-Littrow Valley',
    subName: 'Final crewed Moon landing, 1972',
    lat: 20.191,
    lng: 30.772,
    status: 'Available',
    pricePerAcre: 449,
    description: 'Gene Cernan and Harrison Schmitt spent 3 days on the lunar surface.',
    category: 'Apollo'
  },

  // === RECENT HISTORIC LUNAR LANDINGS ===
  {
    id: 'chandrayaan-3',
    name: 'Chandrayaan-3 – Shiv Shakti Point',
    subName: 'Historic South Pole Landing, India (ISRO) 2023',
    lat: -69.373,
    lng: 32.319,
    status: 'Available',
    pricePerAcre: 499,
    description: 'First space mission to successfully soft land near the lunar South Pole on August 23 2023.',
    category: 'Recent'
  },
  {
    id: 'change-4',
    name: 'Chang’e 4 – Von Kármán Crater',
    subName: 'First landing on Far Side of Moon, China (CNSA) 2019',
    lat: -45.457,
    lng: 177.588,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Historic first soft landing on the mysterious far side of the Moon inside the South Pole-Aitken Basin.',
    category: 'Recent'
  },
  {
    id: 'change-5',
    name: 'Chang’e 5 – Mons Rümker',
    subName: 'Lunar sample return mission, China 2020',
    lat: 43.058,
    lng: -51.916,
    status: 'Available',
    pricePerAcre: 349,
    description: 'Collected fresh volcanic moon rocks from Oceanus Procellarum and returned them to Earth.',
    category: 'Recent'
  },
  {
    id: 'change-6',
    name: 'Chang’e 6 – Apollo Basin (Far Side)',
    subName: 'First Far Side sample return, China 2024',
    lat: -41.638,
    lng: -153.985,
    status: 'Available',
    pricePerAcre: 449,
    description: 'Landed inside Apollo crater on June 2 2024, successfully bringing far side regolith to Earth.',
    category: 'Recent'
  },
  {
    id: 'slim-japan',
    name: 'SLIM – Shioli Crater (JAXA)',
    subName: 'Precision pin-point landing, Japan 2024',
    lat: -13.316,
    lng: 25.251,
    status: 'Available',
    pricePerAcre: 349,
    description: 'Japan’s Smart Lander for Investigating Moon achieved world-record 55-meter landing accuracy on Jan 19 2024.',
    category: 'Recent'
  },
  {
    id: 'odysseus-intuitive',
    name: 'Odysseus (IM-1) – Malapert A',
    subName: 'First commercial lander on Moon, USA 2024',
    lat: -80.13,
    lng: 1.44,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Intuitive Machines lander "Odie" became the first commercial US spacecraft to soft land on the Moon, Feb 22 2024.',
    category: 'Recent'
  },
  {
    id: 'luna-2',
    name: 'Luna 2 – Mare Imbrium',
    subName: 'First man-made object on Moon, USSR 1959',
    lat: 29.1,
    lng: 0.0,
    status: 'Available',
    pricePerAcre: 299,
    description: 'Soviet probe Luna 2 became the very first human artifact to reach another celestial body, Sept 14 1959.',
    category: 'Recent'
  },

  // === FAMOUS GEOGRAPHIC LANDMARKS & CRATERS ===
  {
    id: 'tycho-crater',
    name: 'Tycho Crater',
    subName: '85 km wide rayed crater with central peak',
    lat: -43.31,
    lng: -11.36,
    status: 'Available',
    pricePerAcre: 299,
    description: 'Prominent 108-million-year-old crater whose bright ejecta rays stretch across the entire lunar nearside.',
    category: 'Landmark'
  },
  {
    id: 'copernicus-crater',
    name: 'Copernicus Crater',
    subName: '"The Monarch of the Moon"',
    lat: 9.62,
    lng: -20.08,
    status: 'Available',
    pricePerAcre: 279,
    description: 'Massive 93 km crater in Oceanus Procellarum with terraced walls and multiple central peaks.',
    category: 'Landmark'
  },
  {
    id: 'shackleton-crater',
    name: 'Shackleton Crater',
    subName: 'Lunar South Pole – Permanent ice deposits',
    lat: -89.9,
    lng: 0.0,
    status: 'Available',
    pricePerAcre: 499,
    description: 'Permanently shadowed crater holding billions of tons of water ice for future human bases.',
    category: 'Landmark'
  },
  {
    id: 'aristarchus-crater',
    name: 'Aristarchus Crater',
    subName: 'Brightest feature on the Moon',
    lat: 23.7,
    lng: -47.4,
    status: 'Available',
    pricePerAcre: 329,
    description: 'Extremely reflective crater on the Aristarchus Plateau with frequent transient lunar phenomena sightings.',
    category: 'Landmark'
  },
  {
    id: 'sea-of-serenity',
    name: 'Mare Serenitatis (Sea of Serenity)',
    subName: '674 km circular basaltic mare basin',
    lat: 28.0,
    lng: 17.5,
    status: 'Available',
    pricePerAcre: 199,
    description: 'Vast dark lava plain east of Mare Imbrium filled with dark basaltic regolith.',
    category: 'Landmark'
  },
  {
    id: 'sinus-iridum',
    name: 'Sinus Iridum (Bay of Rainbows)',
    subName: 'Semicircular flooded impact crater',
    lat: 45.0,
    lng: -32.0,
    status: 'Available',
    pricePerAcre: 189,
    description: 'Half-crater bounded by the Jura Mountains on the northwestern mare.',
    category: 'Landmark'
  }
];

export const LUNAR_REGIONS = FAMOUS_COORDINATES;

export const FLAG_TEMPLATES = [
  { id: 'india', name: 'India 🇮🇳', code: 'IN', symbol: '🇮🇳', color1: '#ff9933', color2: '#138808' },
  { id: 'usa', name: 'United States 🇺🇸', code: 'US', symbol: '🇺🇸', color1: '#b22234', color2: '#3c3b6e' },
  { id: 'uk', name: 'United Kingdom 🇬🇧', code: 'GB', symbol: '🇬🇧', color1: '#012169', color2: '#c8102e' },
  { id: 'canada', name: 'Canada 🇨🇦', code: 'CA', symbol: '🇨🇦', color1: '#ff0000', color2: '#ffffff' },
  { id: 'australia', name: 'Australia 🇦🇺', code: 'AU', symbol: '🇦🇺', color1: '#00008b', color2: '#ff0000' },
  { id: 'germany', name: 'Germany 🇩🇪', code: 'DE', symbol: '🇩🇪', color1: '#000000', color2: '#dd0000' },
  { id: 'france', name: 'France 🇫🇷', code: 'FR', symbol: '🇫🇷', color1: '#0055a5', color2: '#ef4135' },
  { id: 'japan', name: 'Japan 🇯🇵', code: 'JP', symbol: '🇯🇵', color1: '#ffffff', color2: '#bc002d' },
  { id: 'south_korea', name: 'South Korea 🇰🇷', code: 'KR', symbol: '🇰🇷', color1: '#ffffff', color2: '#cd2e3a' },
  { id: 'brazil', name: 'Brazil 🇧🇷', code: 'BR', symbol: '🇧🇷', color1: '#009c3b', color2: '#ffdf00' },
  { id: 'uae', name: 'United Arab Emirates 🇦🇪', code: 'AE', symbol: '🇦🇪', color1: '#ff0000', color2: '#00732f' },
  { id: 'singapore', name: 'Singapore 🇸🇬', code: 'SG', symbol: '🇸🇬', color1: '#ed2939', color2: '#ffffff' },
  { id: 'china', name: 'China 🇨🇳', code: 'CN', symbol: '🇨🇳', color1: '#ee1c25', color2: '#ffde00' },
  { id: 'eu', name: 'European Union 🇪🇺', code: 'EU', symbol: '🇪🇺', color1: '#003399', color2: '#ffcc00' },
  { id: 'un', name: 'United Nations 🌐', code: 'UN', symbol: '🌐', color1: '#5b92e5', color2: '#ffffff' },
  { id: 'apollo', name: 'Pioneer 🚀', code: 'AP', symbol: '🚀', color1: '#1e3a8a', color2: '#d97706' }
];

export const INITIAL_CLAIMED_PLOTS = [
  {
    id: 'LUNA-1969-001',
    ownerName: 'Neil Armstrong',
    title: 'Tranquility Base Alpha',
    lat: 0.674,
    lng: 23.473,
    sqft: 4356000,
    acres: 100,
    totalPaid: 24900,
    regionName: 'Apollo 11 – Tranquility Base',
    motto: 'One small step for man, one giant leap for mankind.',
    flagId: 'usa',
    flagColor1: '#b22234',
    flagColor2: '#3c3b6e',
    flagSymbol: '🇺🇸',
    claimedAt: '1969-07-20T20:17:00Z',
    txHash: 'REG-1969-APOLLO11',
    forSale: true,
    listPrice: 45000,
    bids: [
      { id: 'bid-1', bidderName: 'AeroSpace Global Corp', bidAmount: 42000, createdAt: '2026-08-10T12:00:00Z' }
    ],
    history: [
      { event: 'REGISTERED', from: 'LUNA LAND AUTHORITY', to: 'Neil Armstrong', price: 24900, date: '1969-07-20T20:17:00Z', txHash: 'REG-1969-APOLLO11' }
    ]
  },
  {
    id: 'LUNA-2026-882',
    ownerName: 'Dr. Sarah Connor',
    title: 'South Pole Ice Station',
    lat: -89.4,
    lng: 4.2,
    sqft: 217800,
    acres: 5,
    totalPaid: 2495,
    regionName: 'Shackleton Crater',
    motto: 'Securing water for the multiplanetary future.',
    flagId: 'un',
    flagColor1: '#5b92e5',
    flagColor2: '#ffffff',
    flagSymbol: '🌐',
    claimedAt: '2026-04-12T14:22:00Z',
    txHash: 'REG-2026-SHACKLETON',
    forSale: false,
    listPrice: 0,
    bids: [],
    history: [
      { event: 'REGISTERED', from: 'LUNA LAND AUTHORITY', to: 'Dr. Sarah Connor', price: 2495, date: '2026-04-12T14:22:00Z', txHash: 'REG-2026-SHACKLETON' }
    ]
  }
];
