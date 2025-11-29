import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Memorial } from '../types';
import { MOCK_MEMORIALS } from '../constants';

// Group 类型定义
export interface Group {
  id: number;
  title: string;
  misc: string;
  description: string;
  created_at: string;
}

// Item 接口定义 (与 useItems 中一致)
interface ApiItem {
  id: number;
  group_id: number;
  title: string;
  misc: string;
  description: string;
  created_at: string;
}

interface GalleryContextType {
  groups: Group[];
  items: Memorial[];
  activeGroupId: number | 'All';
  setActiveGroupId: (id: number | 'All') => void;
  loadingGroups: boolean;
  loadingItems: boolean;
  error: string | null;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems] = useState<Memorial[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | 'All'>('All');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 缓存 items: groupId -> Memorial[]
  const [itemsCache, setItemsCache] = useState<Record<string, Memorial[]>>({});

  // 1. Fetch Groups (只执行一次)
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      console.log('Fetching groups...');
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        console.log('Groups data received:', data);
        setGroups(data.groups || []);
      } catch (err: any) {
        console.error('Fetch groups error:', err);
        setError(err.message);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // 2. Fetch Items 当 activeGroupId 改变时
  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      // 检查缓存
      const cacheKey = String(activeGroupId);
      if (itemsCache[cacheKey]) {
        setItems(itemsCache[cacheKey]);
        return;
      }

      setLoadingItems(true);
      setError(null);

      try {
        let fetchedItems: ApiItem[] = [];

        if (activeGroupId === 'All') {
            // 临时：获取 group 1 和 2 的数据合并，模拟 "All"
            const [res1, res2] = await Promise.all([
                fetch('/api/items?group_id=1'),
                fetch('/api/items?group_id=2')
            ]);
            
            if (!isMounted) return; // Check after async

            const d1 = res1.ok ? await res1.json() : { items: [] };
            const d2 = res2.ok ? await res2.json() : { items: [] };
            
            fetchedItems = [...d1.items, ...d2.items];
        } else {
            const response = await fetch(`/api/items?group_id=${activeGroupId}`);
            if (!isMounted) return; // Check after async
            
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            fetchedItems = data.items;
        }

        // Map to Memorial
        const mappedItems: Memorial[] = fetchedItems.map(item => {
            let parsedMisc: any = {};
            try {
                parsedMisc = item.misc ? JSON.parse(item.misc) : {};
            } catch { parsedMisc = {}; }

            const mockFallback = MOCK_MEMORIALS[0];

            return {
                id: String(item.id),
                name: item.title,
                type: parsedMisc.type || 'Person',
                dates: parsedMisc.dates || (parsedMisc.birthDate ? `${parsedMisc.birthDate} - ${parsedMisc.deathDate || ''}` : 'Unknown'),
                bio: item.description ? item.description.replace(/<[^>]+>/g, '') : 'No description',
                coverImage: parsedMisc.image || mockFallback.coverImage,
                images: parsedMisc.images || [],
                templateId: 'ethereal-garden',
                timeline: [],
                stats: { candles: 0, flowers: 0, tributes: 0, shares: 0 },
                messages: [],
                badgeId: `RWA-${item.id}`,
                pomScore: 0,
            };
        });

        if (!isMounted) return; // Check before setting state

        setItems(mappedItems);
        
        // 更新缓存
        setItemsCache(prev => ({ ...prev, [cacheKey]: mappedItems }));

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Fetch items error:', err);
        setError(err.message);
        setItems([]);
      } finally {
        if (isMounted) {
            setLoadingItems(false);
        }
      }
    };

    fetchItems();
    
    return () => {
        isMounted = false;
    };
  }, [activeGroupId]);

  return (
    <GalleryContext.Provider value={{ 
      groups, 
      items, 
      activeGroupId, 
      setActiveGroupId, 
      loadingGroups, 
      loadingItems,
      error 
    }}>
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

