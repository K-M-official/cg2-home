
export interface ShopItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  type: 'candle' | 'flower' | 'toy' | 'food';
  description: string;
  delta?: number; 
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'candle', name: 'Eternal Flame', icon: '🕯️', price: 1, type: 'candle', description: 'Light a path for them.', delta: 1 },
  { id: 'flower', name: 'White Rose', icon: '🌹', price: 5, type: 'flower', description: 'A symbol of pure love.', delta: 2 },
  { id: 'wreath', name: 'Hero Wreath', icon: '🌿', price: 20, type: 'flower', description: 'Honoring great sacrifice.', delta: 5 },
  { id: 'toy', name: 'Squeaky Toy', icon: '🎾', price: 3, type: 'toy', description: 'For the goodest boy/girl.', delta: 5 },
  { id: 'treat', name: 'Heavenly Treat', icon: '🦴', price: 2, type: 'food', description: 'A favorite snack.', delta: 5 },
];

