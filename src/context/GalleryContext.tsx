import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Memorial } from '../types';
import { MOCK_MEMORIALS } from '../constants';
import { SHOP_ITEMS } from '../../lib/constants';

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
  pomScore?: number;
  delta?: number;
}

interface GalleryContextType {
  groups: Group[];
  items: Memorial[];
  activeGroupId: number | 'All';
  setActiveGroupId: (id: number | 'All') => void;
  loadingGroups: boolean;
  loadingItems: boolean;
  error: string | null;

  // Detail Page Logic
  currentMemorial: Memorial | null;
  loadingMemorial: boolean;
  fetchMemorial: (id: string) => Promise<void>;
  offerTribute: (memorialId: string, tributeId: string) => Promise<{success: boolean, error?: string}>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export const GalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems] = useState<Memorial[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | 'All'>('All');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detail Page State
  const [currentMemorial, setCurrentMemorial] = useState<Memorial | null>(null);
  const [loadingMemorial, setLoadingMemorial] = useState(false);

  // 缓存 items: groupId -> Memorial[]
  const [itemsCache, setItemsCache] = useState<Record<string, Memorial[]>>({});

  useEffect(() => {
      return () => {
          setItemsCache({});
      };
  }, []);

  // 1. Fetch Groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
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

  // 2. Fetch Items
  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      setLoadingItems(true);
      setError(null);

      try {
        let fetchedItems: ApiItem[] = [];

        if (activeGroupId === 'All') {
            // 动态获取所有 groups 的 items
            if (groups.length === 0) {
                // 如果还没有加载 groups，直接获取所有 items（不带 group_id 参数）
                const response = await fetch('/api/items', { cache: 'no-store' });
                if (!isMounted) return;
                
                if (response.ok) {
                    const data = await response.json();
                    fetchedItems = data.items || [];
                }
            } else {
                // 并行请求所有 groups 的 items
                const requests = groups.map(group => 
                    fetch(`/api/items?group_id=${group.id}`, { cache: 'no-store' })
                );
                
                const responses = await Promise.all(requests);
                if (!isMounted) return;

                const allData = await Promise.all(
                    responses.map(res => res.ok ? res.json() : { items: [] })
                );
                
                fetchedItems = allData.flatMap(d => d.items || []);
            }
        } else {
            const response = await fetch(`/api/items?group_id=${activeGroupId}`, { cache: 'no-store' });
            if (!isMounted) return;
            
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
            const gongpinStats = parsedMisc.gongpin || {};
            const stats = { candles: 0, flowers: 0, tributes: 0, shares: 0 };

            Object.entries(gongpinStats).forEach(([tributeId, count]) => {
                const shopItem = SHOP_ITEMS.find(i => i.id === tributeId);
                if (shopItem && typeof count === 'number') {
                    if (shopItem.type === 'candle') stats.candles += count;
                    else if (shopItem.type === 'flower') stats.flowers += count;
                    else stats.tributes += count;
                }
            });

            return {
                id: String(item.id),
                name: item.title,
                type: parsedMisc.type || 'Person',
                dates: parsedMisc.dates || (parsedMisc.birthDate ? `${parsedMisc.birthDate} - ${parsedMisc.deathDate || ''}` : 'Unknown'),
                bio: item.description ? item.description.replace(/<[^>]+>/g, '') : 'No description',
                coverImage: parsedMisc.coverImage || parsedMisc.image || mockFallback.coverImage,
                images: parsedMisc.images || [],
                templateId: 'ethereal-garden',
                timeline: [],
                stats: stats,
                messages: [],
                badgeId: `RWA-${item.id}`,
                pomScore: item.pomScore || 0,
                delta: item.delta || 0,
            };
        });

        if (!isMounted) return;
        setItems(mappedItems);

      } catch (err: any) {
        if (!isMounted) return;
        console.error('Fetch items error:', err);
        setError(err.message);
        setItems([]);
      } finally {
        if (isMounted) setLoadingItems(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [activeGroupId]);

  // 3. Fetch Single Memorial Detail
  const fetchMemorial = async (id: string) => {
      setLoadingMemorial(true);
      try {
          // 并行获取 item 信息、gallery、timeline 和 tributes
          const [itemResponse, galleryResponse, timelineResponse, tributesResponse] = await Promise.all([
              fetch(`/api/item/stats?item_id=${id}`),
              fetch(`/api/content/gallery?item_id=${id}`),
              fetch(`/api/content/timeline?item_id=${id}`),
              fetch(`/api/content/tribute?item_id=${id}`)
          ]);

          if (itemResponse.ok) {
              const data = await itemResponse.json();
              const item = data.item;

              let parsedMisc: any = {};
              try { parsedMisc = item.misc ? JSON.parse(item.misc) : {}; } catch { parsedMisc = {}; }

              const gongpinStats = parsedMisc.gongpin || {};
              const mockFallback = MOCK_MEMORIALS[0];

              // 获取 gallery 图片
              let images: any[] = [];
              if (galleryResponse.ok) {
                  const galleryData = await galleryResponse.json();
                  images = (galleryData.images || []).map((img: any) => ({
                      id: img.id,
                      image_url: img.image_url,
                      caption: img.caption,
                      year: img.year,
                      user_email: img.user_email
                  }));
              }

              // 获取 timeline 事件
              let timeline: any[] = [];
              if (timelineResponse.ok) {
                  const timelineData = await timelineResponse.json();
                  timeline = (timelineData.events || []).map((event: any) => ({
                      id: event.id,
                      year: event.year,
                      month: event.month,
                      day: event.day,
                      title: event.title,
                      description: event.description,
                      image_url: event.image_url
                  }));
              }

              // 获取 tributes 留言
              let messages: any[] = [];
              if (tributesResponse.ok) {
                  const tributesData = await tributesResponse.json();
                  messages = (tributesData.tributes || []).map((tribute: any) => ({
                      id: tribute.id,
                      content: tribute.content,
                      author: tribute.user_email || tribute.author_name || 'Anonymous User',
                      date: new Date(tribute.created_at).toLocaleDateString(),
                      user_id: tribute.user_id
                  }));
              }

              // Re-calculate stats for detail view
              const stats = { candles: Math.floor(data.stats['1hour'] / 1), flowers: 0, tributes: messages.length, shares: 0 };

              const mappedMemorial: Memorial = {
                  id: String(item.id),
                  name: item.title,
                  type: parsedMisc.type || 'Person',
                  dates: parsedMisc.dates || (parsedMisc.birthDate ? `${parsedMisc.birthDate} - ${parsedMisc.deathDate || ''}` : 'Unknown'),
                  bio: item.description ? item.description.replace(/<[^>]+>/g, '') : 'No description',
                  coverImage: parsedMisc.coverImage || parsedMisc.image || mockFallback.coverImage,
                  images: images,
                  templateId: parsedMisc.templateId || 'ethereal-garden',
                  timeline: timeline,
                  stats: stats,
                  messages: messages,
                  badgeId: `RWA-${item.id}`,
                  pomScore: data.algorithm?.P || 0,
                  delta: data.algorithm?.M || 0,
                  gongpinStats: gongpinStats,
                  onChainHash: parsedMisc.onChainHash
              };

              setCurrentMemorial(mappedMemorial);
          } else {
              // Fallback
              const found = MOCK_MEMORIALS.find(m => m.id === id);
              if (found) setCurrentMemorial(found);
              else throw new Error("Memorial not found");
          }
      } catch (error: any) {
          console.error("Fetch memorial error:", error);
          // Don't set global error to avoid breaking list view, just log
      } finally {
          setLoadingMemorial(false);
      }
  };

  // 4. Offer Tribute Action
  const offerTribute = async (memorialId: string, tributeId: string) => {
      try {
          const response = await fetch('/api/item/increment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ item_id: parseInt(memorialId), tribute_id: tributeId })
          });
          
          const data = await response.json();
          if (data.success) {
              // Update Current Memorial State
              setCurrentMemorial(prev => {
                  if (!prev || prev.id !== memorialId) return prev;
                  
                  const newGongpinStats = { ...prev.gongpinStats };
                  newGongpinStats[tributeId] = (newGongpinStats[tributeId] || 0) + 1;

                  return {
                      ...prev,
                      pomScore: (typeof data.P === 'number') ? data.P : prev.pomScore,
                      delta: (typeof data.M === 'number') ? data.M : prev.delta,
                      gongpinStats: newGongpinStats
                  };
              });

              // Optimistically update items list if present
              setItems(prevItems => prevItems.map(item => {
                  if (item.id === memorialId) {
                      return {
                          ...item,
                          pomScore: (typeof data.P === 'number') ? data.P : item.pomScore,
                          delta: (typeof data.M === 'number') ? data.M : item.delta
                      };
                  }
                  return item;
              }));

              return { success: true };
          }
          return { success: false, error: 'API returned fail' };
      } catch (err: any) {
          console.error('Offer tribute error:', err);
          return { success: false, error: err.message };
      }
  };

  return (
    <GalleryContext.Provider value={{ 
      groups, 
      items, 
      activeGroupId, 
      setActiveGroupId, 
      loadingGroups, 
      loadingItems,
      error,
      currentMemorial,
      loadingMemorial,
      fetchMemorial,
      offerTribute
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
