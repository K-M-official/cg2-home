import { increment_item_window, get_item_with_stats, get_groups, get_items, get_item_algorithm_metrics, get_leaderboard } from './db';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // API 路由处理
    if (pathname.startsWith('/api/')) {
      return await handleApi(request, env);
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: corsHeaders });
  },
} satisfies ExportedHandler<Env>;

// ---- API ----
async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

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

  // 获取排行榜
  if (path === '/api/leaderboard' && request.method === 'GET') {
    return handleGetLeaderboard(request, env);
  }

  return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers: corsHeaders });
}

// ---- Utils ----
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const;

/**
 * 处理滑动窗口增量 API
 * POST /api/item/increment
 * Body: { item_id: number, delta?: number }
 */
async function handleIncrement(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<{ item_id?: number; delta?: number }>();
    
    const item_id = body.item_id;
    const delta = body.delta ?? 1;
    
    // 参数验证
    if (item_id === undefined || item_id === null || !Number.isInteger(item_id) || item_id <= 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id must be a positive integer' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (typeof delta !== 'number' || !Number.isFinite(delta)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'delta must be a valid number' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 执行增量操作
    await increment_item_window(env.DB, item_id, delta);
    
    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleIncrement:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const item_id = parseInt(item_id_str, 10);
    
    if (!Number.isInteger(item_id) || item_id <= 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id must be a positive integer' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 获取 item 信息和基础统计数据
    const result = await get_item_with_stats(env.DB, item_id);
    
    if (!result.item) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Item not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 计算算法相关的 M 和 P
    const { M, P } = await get_item_algorithm_metrics(env.DB, item_id);
    
    return new Response(
      JSON.stringify({
        item: result.item,
        stats: result.stats,
        algorithm: {
          M,
          P,
        },
      }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleItemStats:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    if (!group_id_str) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'group_id is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const group_id = parseInt(group_id_str, 10);
    
    if (!Number.isInteger(group_id) || group_id <= 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'group_id must be a positive integer' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const items = await get_items(env.DB, group_id);
    
    return new Response(
      JSON.stringify({ items }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetItems:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}