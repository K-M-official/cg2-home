import { increment_item_window, get_item_with_stats, get_groups, get_items, get_item_algorithm_metrics, get_leaderboard, update_item_misc_gongpin, create_group, create_item, get_group_by_title } from '../db/items';
import { SHOP_ITEMS } from '../../lib/constants';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

/**
 * 纪念对象相关路由处理
 * /api/item/*, /api/items/*, /api/groups/*, /api/leaderboard/*
 */
export async function handleItemRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 增加 item 的滑动窗口计数
  if (path === '/api/item/increment' && request.method === 'POST') {
    return handleIncrement(request, env);
  }

  // 获取 item 的统计信息
  if (path === '/api/item/stats' && request.method === 'GET') {
    return handleItemStats(request, env);
  }

  // 获取所有 groups
  if (path === '/api/groups' && request.method === 'GET') {
    return handleGetGroups(request, env);
  }

  // 获取指定 group 的 items
  if (path === '/api/items' && request.method === 'GET') {
    return handleGetItems(request, env);
  }

  // 创建 item (包含自动创建 group 逻辑)
  if (path === '/api/items' && request.method === 'POST') {
    return handleCreateItem(request, env);
  }

  // 获取排行榜
  if (path === '/api/leaderboard' && request.method === 'GET') {
    return handleGetLeaderboard(request, env);
  }

  return null;
}

/**
 * 上传图片到 R2
 */
async function uploadImageToR2(env: Env, file: File): Promise<string> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `memorial/${timestamp}-${randomStr}.${ext}`;

  await env.R2.put(fileName, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  if (!env.DEV) {
    return `https://bucket.permane.world/${fileName}`;
  } else {
    return `http://localhost:5173/api/debug/r2/${fileName}`;
  }
}

/**
 * 处理滑动窗口增量 API
 * POST /api/item/increment
 */
async function handleIncrement(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ item_id?: number; delta?: number; tribute_id?: string }>();

    const item_id = body.item_id;
    let delta = body.delta ?? 0;
    const tribute_id = body.tribute_id;

    if (item_id === undefined || item_id === null || !Number.isInteger(item_id) || item_id <= 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id must be a positive integer' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tribute_id) {
      const tribute = SHOP_ITEMS.find(item => item.id === tribute_id);
      if (!tribute) {
        return new Response(JSON.stringify({ error: 'Invalid tribute_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      delta = tribute.delta || 1;
      await update_item_misc_gongpin(env.DB, item_id, tribute_id, 1);
    } else if (delta === 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'tribute_id or delta > 0 is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (typeof delta !== 'number' || !Number.isFinite(delta)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'delta must be a valid number' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await increment_item_window(env.DB, item_id, delta);
    const { M, P } = await get_item_algorithm_metrics(env.DB, item_id);

    return new Response(
      JSON.stringify({ success: true, delta, M, P }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleIncrement:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理获取 item 统计信息 API
 * GET /api/item/stats?item_id=123
 */
async function handleItemStats(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const item_id_str = url.searchParams.get('item_id');

    if (!item_id_str) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const item_id = parseInt(item_id_str, 10);

    if (!Number.isInteger(item_id) || item_id <= 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id must be a positive integer' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await get_item_with_stats(env.DB, item_id);

    if (!result.item) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Item not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { M, P } = await get_item_algorithm_metrics(env.DB, item_id);

    return new Response(
      JSON.stringify({
        item: result.item,
        stats: result.stats,
        algorithm: { M, P },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleItemStats:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理获取所有 groups API
 * GET /api/groups
 */
async function handleGetGroups(request: Request, env: Env): Promise<Response> {
  try {
    const groups = await get_groups(env.DB);

    return new Response(
      JSON.stringify({ groups }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetGroups:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理获取指定 group 的 items API
 * GET /api/items?group_id=123
 */
async function handleGetItems(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const group_id_str = url.searchParams.get('group_id');

    let group_id: number | null = null;

    if (group_id_str) {
      const parsed = parseInt(group_id_str, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return new Response(
          JSON.stringify({ error: 'INVALID_PARAMS', message: 'group_id must be a positive integer' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      group_id = parsed;
    }

    const items = await get_items(env.DB, group_id);

    const itemsWithStats = await Promise.all(items.map(async (item) => {
      try {
        const { M, P } = await get_item_algorithm_metrics(env.DB, item.id);
        return {
          ...item,
          pomScore: P,
          delta: M
        };
      } catch (e) {
        console.error(`Failed to get stats for item ${item.id}:`, e);
        return {
          ...item,
          pomScore: 0,
          delta: 0
        };
      }
    }));

    return new Response(
      JSON.stringify({ items: itemsWithStats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetItems:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理创建 item API
 * POST /api/items
 */
async function handleCreateItem(request: Request, env: Env): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';

    let group_name: string;
    let title: string;
    let description: string = '';
    let misc: any = {};
    let coverImageUrl: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      group_name = formData.get('group_name') as string;
      title = formData.get('title') as string;
      description = (formData.get('description') as string) || '';

      const miscStr = formData.get('misc') as string;
      if (miscStr) {
        try {
          misc = JSON.parse(miscStr);
        } catch (e) {
          console.error('Failed to parse misc:', e);
        }
      }

      const coverImageFile = formData.get('coverImage') as File | null;
      if (coverImageFile && coverImageFile.size > 0) {
        try {
          coverImageUrl = await uploadImageToR2(env, coverImageFile);
          console.log('Image uploaded to R2:', coverImageUrl);
        } catch (e) {
          console.error('Failed to upload image to R2:', e);
        }
      }
    } else {
      const body = await request.json<{
        group_name: string;
        title: string;
        description?: string;
        misc?: any
      }>();

      group_name = body.group_name;
      title = body.title;
      description = body.description || '';
      misc = body.misc || {};
    }

    if (!group_name || !title) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'group_name and title are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let group = await get_group_by_title(env.DB, group_name);
    let group_id: number;

    if (group) {
      group_id = group.id;
    } else {
      group_id = await create_group(env.DB, group_name, `Category for ${group_name}`, { auto_created: true });
    }

    if (coverImageUrl) {
      misc.coverImage = coverImageUrl;
    }

    const id = await create_item(env.DB, group_id, title, description, misc);
    await increment_item_window(env.DB, id, 1);

    return new Response(
      JSON.stringify({ success: true, id, group_id, coverImageUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('Error in handleCreateItem:', e);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(e) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理获取排行榜 API
 * GET /api/leaderboard?limit=10
 */
async function handleGetLeaderboard(request: Request, env: Env): Promise<Response> {
  try {
    console.log('[Leaderboard API] Request received');

    if (!env.DB) {
      console.error('[Leaderboard API] DB binding not found');
      return new Response(
        JSON.stringify({ error: 'INTERNAL_ERROR', message: 'Database binding not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const limit_str = url.searchParams.get('limit');
    const limit = limit_str ? parseInt(limit_str, 10) : 10;

    console.log('[Leaderboard API] Limit:', limit);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
      console.error('[Leaderboard API] Invalid limit:', limit);
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'limit must be between 1 and 100' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Leaderboard API] Calling get_leaderboard...');
    const leaderboard = await get_leaderboard(env.DB, limit);
    console.log('[Leaderboard API] Success, entries:', leaderboard.length);

    return new Response(
      JSON.stringify({ leaderboard }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Leaderboard API] Error:', error);
    console.error('[Leaderboard API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(
      JSON.stringify({
        error: 'INTERNAL_ERROR',
        message: String(error),
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
