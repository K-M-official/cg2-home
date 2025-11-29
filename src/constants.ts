import type { Memorial, NewsItem, LeaderboardEntry } from './types';
import { MemorialType } from './types';
import { SHOP_ITEMS } from '../lib/constants';

export { SHOP_ITEMS };

export const MEMORIAL_TEMPLATES = [
  {
    id: 'ethereal-garden',
    name: 'Ethereal Garden',
    description: 'Soft greens and floral whispers. Perfect for nature lovers.',
    previewColor: 'bg-emerald-100',
    bgImage: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2500&auto=format&fit=crop'
  },
  {
    id: 'cosmic-voyage',
    name: 'Cosmic Voyage',
    description: 'Deep space and stardust. Returning to the universe.',
    previewColor: 'bg-slate-900',
    bgImage: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2500&auto=format&fit=crop'
  },
  {
    id: 'serene-sanctuary',
    name: 'Serene Sanctuary',
    description: 'Warm light, minimalism, and gold accents. Pure peace.',
    previewColor: 'bg-orange-50',
    bgImage: 'https://images.unsplash.com/photo-1507643179173-39db459fae81?q=80&w=2500&auto=format&fit=crop'
  }
];

export const MOCK_MEMORIALS: Memorial[] = [
  {
    id: '1',
    name: 'Capt. Leo Vance',
    type: MemorialType.HERO,
    dates: '1980 - 2024',
    bio: 'A firefighter who gave everything to protect his city. His courage in the Great Northern Wildfires saved hundreds of homes.',
    coverImage: 'https://picsum.photos/1200/800?random=10',
    images: ['https://picsum.photos/400/400?random=11'],
    templateId: 'cosmic-voyage',
    stats: { candles: 8942, flowers: 1205, tributes: 50, shares: 300 },
    badgeId: 'HERO-2024-X99',
    pomScore: 98.5,
    onChainHash: '0x71C...9A2',
    timeline: [
      { id: 't1', year: '2010', title: 'Joined Force', description: 'Started his service at Station 42.' },
      { id: 't2', year: '2024', title: 'Final Call', description: 'Sacrificed during the Northern Wildfires rescue.' },
    ],
    messages: []
  },
  {
    id: '2',
    name: 'Dr. Evelyn Chai',
    type: MemorialType.SCIENTIST,
    dates: '1945 - 2023',
    bio: 'Her research on marine biology helped restore the coral reefs of the Pacific. A quiet guardian of the ocean.',
    coverImage: 'https://picsum.photos/1200/800?random=12',
    images: ['https://picsum.photos/400/400?random=13'],
    templateId: 'ethereal-garden',
    stats: { candles: 3201, flowers: 800, tributes: 120, shares: 150 },
    badgeId: 'SCI-BIO-22',
    pomScore: 94.2,
    onChainHash: '0x82B...1B3',
    timeline: [],
    messages: []
  },
  {
    id: '3',
    name: 'Luna',
    type: MemorialType.PET,
    dates: '2010 - 2024',
    bio: 'The most loyal companion. Chase the stars, sweet girl.',
    coverImage: 'https://picsum.photos/1200/800?random=5',
    images: ['https://picsum.photos/400/400?random=6', 'https://picsum.photos/400/400?random=7'],
    templateId: 'serene-sanctuary',
    stats: { candles: 450, flowers: 12, tributes: 850, shares: 45 },
    badgeId: 'RWA-PET-99',
    pomScore: 88.0,
    onChainHash: '0x33A...9C1',
    timeline: [
      { id: 't1', year: '2010', title: 'Gotcha Day', description: 'Best day of our lives.' },
    ],
    messages: []
  },
  {
    id: '4',
    name: 'Sarah Jenkins',
    type: MemorialType.CIVILIAN,
    dates: '1990 - 2023',
    bio: 'A teacher who stayed behind to ensure every student was safe during the storm.',
    coverImage: 'https://picsum.photos/1200/800?random=14',
    images: [],
    templateId: 'serene-sanctuary',
    stats: { candles: 1240, flowers: 400, tributes: 20, shares: 90 },
    badgeId: 'CIV-TCH-01',
    pomScore: 91.5,
    onChainHash: '0x99D...2F4',
    timeline: [],
    messages: []
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Northern Wildfires Contained, But Heroes Lost',
    summary: 'As the fires subside, the city gathers to honor the brave souls like Capt. Leo Vance who stood at the frontlines.',
    relatedMemorialId: '1',
    date: '2 hours ago',
    category: 'Breaking'
  },
  {
    id: 'n2',
    title: 'Global Ocean Summit Dedicates Award to Dr. Chai',
    summary: 'The annual restoration prize has been renamed in honor of Dr. Evelyn Chai’s lifetime contribution.',
    relatedMemorialId: '2',
    date: '1 day ago',
    category: 'World'
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, memorial: MOCK_MEMORIALS[0], pomScore: 98.5, change: 'up' },
  { rank: 2, memorial: MOCK_MEMORIALS[1], pomScore: 94.2, change: 'up' },
  { rank: 3, memorial: MOCK_MEMORIALS[3], pomScore: 91.5, change: 'same' },
  { rank: 4, memorial: MOCK_MEMORIALS[2], pomScore: 88.0, change: 'down' },
];

