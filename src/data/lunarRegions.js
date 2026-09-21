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
    lng: 3.630,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Dramatic sinuous lava channel winding past the Apennine Mountains.',
    category: 'Apollo'
  },
  {
    id: 'apollo-16',
    name: 'Apollo 16 – Descartes Highlands',
    subName: 'Lunar highland geology, 1972',
    lat: -8.973,
    lng: 15.498,
    status: 'Available',
    pricePerAcre: 329,
    description: 'Only Apollo mission to land in the lunar highlands, revealing ancient crustal rocks.',
    category: 'Apollo'
  },
  {
    id: 'apollo-17',
    name: 'Apollo 17 – Taurus-Littrow',
    subName: 'Last humans on the Moon, 1972',
    lat: 20.191,
    lng: 30.772,
    status: 'Available',
    pricePerAcre: 449,
    description: 'Deep valley flanked by massive mountains. Eugene Cernan and Harrison Schmitt set records.',
    category: 'Apollo'
  },

  // === RECENT MISSIONS (2019–2024) ===
  {
    id: 'chandrayaan-3',
    name: 'Chandrayaan-3 – Shiv Shakti Point',
    subName: 'India\'s historic south pole landing, 2023',
    lat: -69.37,
    lng: 32.35,
    status: 'Available',
    pricePerAcre: 549,
    description: 'ISRO made India the 4th nation to soft-land on the Moon, and first at the south polar region.',
    category: 'Recent'
  },
  {
    id: 'change-4',
    name: 'Chang\'e 4 – Von Kármán Crater',
    subName: 'First far-side landing ever, 2019',
    lat: -45.46,
    lng: 177.60,
    status: 'Available',
    pricePerAcre: 499,
    description: 'China achieved the first-ever soft landing on the far side of the Moon.',
    category: 'Recent'
  },
  {
    id: 'change-5',
    name: 'Chang\'e 5 – Mons Rümker',
    subName: 'Lunar sample return, 2020',
    lat: 43.06,
    lng: -51.92,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Returned 1.73 kg of lunar soil to Earth — first sample return since 1976.',
    category: 'Recent'
  },
  {
    id: 'change-6',
    name: 'Chang\'e 6 – Apollo Basin (far side)',
    subName: 'First far-side sample return, 2024',
    lat: -41.64,
    lng: -153.99,
    status: 'Available',
    pricePerAcre: 549,
    description: 'First mission to collect and return samples from the Moon\'s far side.',
    category: 'Recent'
  },
  {
    id: 'slim',
    name: 'SLIM "Moon Sniper" – Shioli Crater',
    subName: 'Japan\'s precision lander, 2024',
    lat: -13.32,
    lng: 25.25,
    status: 'Available',
    pricePerAcre: 399,
    description: 'JAXA achieved a 100-meter precision landing, making Japan the 5th nation on the Moon.',
    category: 'Recent'
  },
  {
    id: 'odysseus-im1',
    name: 'Odysseus (IM-1) – Malapert A',
    subName: 'First US commercial Moon lander, 2024',
    lat: -80.13,
    lng: 1.44,
    status: 'Available',
    pricePerAcre: 449,
    description: 'Intuitive Machines\' Odysseus became the first US spacecraft to land on the Moon since 1972.',
    category: 'Recent'
  },

  // === LANDMARKS ===
  {
    id: 'shackleton-crater',
    name: 'Shackleton Crater',
    subName: 'South pole water-ice reserve',
    lat: -89.9,
    lng: 0.0,
    status: 'Claimed',
    owner: 'Dr. Sarah Connor',
    pricePerAcre: 499,
    description: 'Permanently shadowed crater holding massive water ice deposits. Prime colony site.',
    category: 'Landmark'
  },
  {
    id: 'tycho-crater',
    name: 'Tycho Crater',
    subName: '85 km wide, visible from Earth',
    lat: -43.3,
    lng: -11.2,
    status: 'Available',
    pricePerAcre: 299,
    description: 'Prominent impact crater with spectacular ray system and 1.6 km central peak.',
    category: 'Landmark'
  },
  {
    id: 'copernicus-crater',
    name: 'Copernicus Crater',
    subName: 'The "Monarch of the Moon"',
    lat: 9.6,
    lng: -20.1,
    status: 'Available',
    pricePerAcre: 329,
    description: 'Terraced crater walls rising 3,800 m above the surrounding mare floor.',
    category: 'Landmark'
  },
  {
    id: 'aristarchus-plateau',
    name: 'Aristarchus Plateau',
    subName: 'Brightest crater on the Moon',
    lat: 23.7,
    lng: -47.4,
    status: 'Available',
    pricePerAcre: 349,
    description: 'Massive volcanic plateau with a sinuous rille — one of the most geologically diverse regions.',
    category: 'Landmark'
  },
  {
    id: 'marius-hills',
    name: 'Marius Hills Lava Tube',
    subName: 'Natural radiation shelter',
    lat: 14.0,
    lng: -56.0,
    status: 'Available',
    pricePerAcre: 399,
    description: 'Subterranean lava tube skylight providing natural radiation shielding for habitats.',
    category: 'Landmark'
  },
  {
    id: 'sinus-iridum',
    name: 'Sinus Iridum – Bay of Rainbows',
    subName: 'One of the most beautiful lunar features',
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
  { id: 'classic', name: 'Classic', color1: '#3b82f6', color2: '#1d4ed8', symbol: '🚀' },
  { id: 'pioneer', name: 'Pioneer', color1: '#f59e0b', color2: '#d97706', symbol: '⭐' },
  { id: 'colony', name: 'Colony', color1: '#22c55e', color2: '#15803d', symbol: '🌕' },
  { id: 'explorer', name: 'Explorer', color1: '#8b5cf6', color2: '#6d28d9', symbol: '🌌' },
  { id: 'crest', name: 'Crest', color1: '#e2e8f0', color2: '#94a3b8', symbol: '👑' }
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
    flagId: 'classic',
    flagColor1: '#3b82f6',
    flagColor2: '#1d4ed8',
    flagSymbol: '🚀',
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
    flagId: 'colony',
    flagColor1: '#22c55e',
    flagColor2: '#15803d',
    flagSymbol: '🌕',
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
