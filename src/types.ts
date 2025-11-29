export enum MemorialType {
  PERSON = 'Person', // General
  HERO = 'Hero', // Firefighters, etc.
  SCIENTIST = 'Scientist',
  CIVILIAN = 'Civilian Hero',
  PET = 'Pet',
  EVENT = 'Event',
}

export type TemplateId = 'ethereal-garden' | 'cosmic-voyage' | 'serene-sanctuary';

export interface InteractionStats {
  candles: number;
  flowers: number;
  tributes: number; // Toys, letters, etc.
  shares: number;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
}

export interface Memorial {
  id: string;
  name: string;
  type: MemorialType;
  dates: string; 
  bio: string;
  coverImage: string;
  images: string[];
  templateId: TemplateId; // New: Selected Template
  timeline: TimelineEvent[];
  stats: InteractionStats; // New: Granular stats for POM
  messages: Message[];
  badgeId: string; // RWA Badge ID
  pomScore?: number; // For leaderboard
  onChainHash?: string; // New: Blockchain storage hash
}

export interface Message {
  id: string;
  author: string;
  content: string;
  date: string;
  isPremium?: boolean; // Highlighted message
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  relatedMemorialId?: string; // Links news to a person on the leaderboard
  date: string;
  category: 'Breaking' | 'Tribute' | 'World';
}

export interface LeaderboardEntry {
  rank: number;
  memorial: Memorial;
  pomScore: number;
  raw?: number;
  change: 'up' | 'down' | 'same';
}

export interface ShopItem {
  id: string;
  name: string;
  icon: string; // Emoji or Icon name
  price: number; // In Tokens
  type: 'flower' | 'candle' | 'food' | 'toy';
  description: string;
}