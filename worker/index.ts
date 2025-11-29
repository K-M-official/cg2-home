import { increment_item_window, get_item_with_stats, get_groups, get_items, get_item_algorithm_metrics } from './db';

export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response("ASSETS binding not configured", { status: 500 });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // API 路由处理
    if (pathname.startsWith('/memorial/api/')) {
      return handleApi(request, env);
    }

    // 处理 /memorial 路径下的请求
    if (pathname.startsWith('/memorial')) {
      // 将 /memorial 或 /memorial/xxx 转换为相应的路径
      let assetPath = pathname.replace('/memorial', '') || '/index.html';
      // 如果转换后是空字符串或只有斜杠，返回 index.html
      if (assetPath === '' || assetPath === '/') {
        assetPath = '/index.html';
      }

      const assetUrl = new URL(assetPath, url.origin);
      assetUrl.search = url.search;

      const modifiedRequest = new Request(assetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return env.ASSETS.fetch(modifiedRequest);
    }

    // 其他请求直接转发给 ASSETS binding
    return env.ASSETS.fetch(request);
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
  if (path === '/memorial/api/item/increment' && request.method === 'POST') {
    return handleIncrement(request, env);
  }

  // 获取 item 的统计信息
  if (path === '/memorial/api/item/stats' && request.method === 'GET') {
    return handleItemStats(request, env);
  }

  // 获取所有 groups
  if (path === '/memorial/api/groups' && request.method === 'GET') {
    return handleGetGroups(request, env);
  }

  // 获取指定 group 的 items
  if (path === '/memorial/api/items' && request.method === 'GET') {
    return handleGetItems(request, env);
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
 * POST /memorial/api/item/increment
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
 * GET /memorial/api/item/stats?item_id=123
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
 * GET /memorial/api/groups
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
 * GET /memorial/api/items?group_id=123
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