import { useState, useEffect } from 'react';
import type { LeaderboardEntry } from '../types';
import { MOCK_MEMORIALS, API_BASE_URL } from '../constants';

interface LeaderboardApiItem {
  rank: number;
  item: {
    id: number;
    group_id: number;
    title: string;
    misc: string;
    description: string;
    created_at: string;
  };
  pomScore: number;
  raw?: number;
  change: 'up' | 'down' | 'same';
}

interface LeaderboardApiResponse {
  leaderboard: LeaderboardApiItem[];
}

/**
 * 从 API 返回的 item 数据转换为 Memorial 格式
 * 由于后端 item 结构比较简单，我们需要映射到前端的 Memorial 类型
 */
function mapItemToMemorial(item: LeaderboardApiItem): LeaderboardEntry {
  // 尝试解析 misc 字段（假设它是 JSON 格式存储的额外信息）
  let parsedMisc: any = {};
  try {
    parsedMisc = item.item.misc ? JSON.parse(item.item.misc) : {};
  } catch {
    parsedMisc = {};
  }

  // 使用 MOCK_MEMORIALS 中的数据作为默认值，或者根据 item.id 匹配
  const mockMemorial = MOCK_MEMORIALS[item.item.id - 1] || MOCK_MEMORIALS[0];

  return {
    rank: item.rank,
    memorial: {
      id: String(item.item.id),
      name: item.item.title || mockMemorial.name,
      type: parsedMisc.type || mockMemorial.type,
      dates: parsedMisc.dates || mockMemorial.dates,
      bio: item.item.description || mockMemorial.bio,
      coverImage: parsedMisc.coverImage || mockMemorial.coverImage,
      images: parsedMisc.images || mockMemorial.images,
      templateId: parsedMisc.templateId || mockMemorial.templateId,
      timeline: parsedMisc.timeline || mockMemorial.timeline,
      stats: parsedMisc.stats || mockMemorial.stats,
      messages: parsedMisc.messages || mockMemorial.messages,
      badgeId: parsedMisc.badgeId || mockMemorial.badgeId,
      pomScore: item.pomScore,
      onChainHash: parsedMisc.onChainHash,
    },
    pomScore: item.pomScore,
    raw: item.raw,
    change: item.change,
  };
}

export const useLeaderboard = (limit: number = 10) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    // 只有在首次加载或手动刷新时才设置 loading 为 true，
    // 自动轮询时不应该让页面闪烁 loading 状态，这里为了简单暂时保持，
    // 如果需要优化体验，可以加一个 isRefetching 状态。
    // 这里我们只在 leaderboard 为空时设置 loading，避免每次刷新都显示加载动画
    if (leaderboard.length === 0) {
        setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/leaderboard?limit=${limit}`);
      
      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          throw new Error(errorData.details || errorData.message || `HTTP ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data: LeaderboardApiResponse = await response.json();
      
      console.log('Leaderboard API response:', data);
      
      // 将 API 数据映射为前端需要的格式
      const mappedLeaderboard = data.leaderboard.map(mapItemToMemorial);
      
      setLeaderboard(mappedLeaderboard);
    } catch (err: any) {
      console.error('获取排行榜失败:', err);
      setError(err.message || '获取排行榜失败');
      // 发生错误时使用空数组
      if (leaderboard.length === 0) {
          setLeaderboard([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // 每30秒刷新一次
    const interval = setInterval(fetchLeaderboard, 30000);

    return () => clearInterval(interval);
  }, [limit]);

  return { leaderboard, loading, error, refetch: fetchLeaderboard };
};

