import { get_solana_mapping, create_solana_mapping, update_solana_mapping } from '../db/solana';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

/**
 * Solana NFT 映射相关路由处理
 * /api/solana/*
 */
export async function handleSolanaRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // GET /api/solana/mapping/:id
  if (path.startsWith('/api/solana/mapping/') && request.method === 'GET') {
    return handleGetSolanaMapping(request, env, path);
  }

  // POST /api/solana/assign-to-pool
  if (path === '/api/solana/assign-to-pool' && request.method === 'POST') {
    return handleAssignToPool(request, env);
  }
  
  // POST /api/solana/items-by-mints
  if (path === '/api/solana/items-by-mints' && request.method === 'POST') {
    return handleGetItemsByMints(request, env);
  }

  return null;
}

/**
 * 获取 Solana NFT 映射
 * GET /api/solana/mapping/:id
 */
async function handleGetSolanaMapping(request: Request, env: Env, path: string): Promise<Response> {
  try {
    const pathParts = path.split('/');
    const itemId = parseInt(pathParts[pathParts.length - 1], 10);

    if (!itemId || isNaN(itemId)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'Invalid item ID' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapping = await get_solana_mapping(env.DB, itemId);

    return new Response(
      JSON.stringify({
        success: true,
        mapping: mapping
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetSolanaMapping:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 分配 token 到 pool
 * POST /api/solana/assign-to-pool
 */
async function handleAssignToPool(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      item_id: string;
      pool_address: string;
      mint_address: string;
      transaction_signature: string;
    };

    const { item_id, pool_address, mint_address, transaction_signature } = body;

    // 验证参数
    if (!item_id || !pool_address || !mint_address || !transaction_signature) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const itemIdNum = parseInt(item_id, 10);
    if (isNaN(itemIdNum)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'Invalid item_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否已存在映射
    const existingMapping = await get_solana_mapping(env.DB, itemIdNum);

    if (existingMapping) {
      // 更新现有映射
      await update_solana_mapping(env.DB, itemIdNum, mint_address, pool_address);
    } else {
      // 创建新映射
      await create_solana_mapping(env.DB, itemIdNum, mint_address, pool_address);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token assigned to pool successfully',
        data: {
          item_id: itemIdNum,
          pool_address,
          mint_address,
          transaction_signature
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleAssignToPool:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 根据 mint addresses 获取对应的 items
 * POST /api/solana/items-by-mints
 */
async function handleGetItemsByMints(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      mint_addresses: string[];
    };

    const { mint_addresses } = body;

    if (!mint_addresses || !Array.isArray(mint_addresses) || mint_addresses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'mint_addresses is required and must be a non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 构建 SQL 查询
    const placeholders = mint_addresses.map(() => '?').join(',');
    const query = `
      SELECT s.item_id, s.mint_address, i.title
      FROM solana_nft_mapping s
      JOIN items i ON s.item_id = i.id
      WHERE s.mint_address IN (${placeholders})
    `;

    const result = await env.DB.prepare(query).bind(...mint_addresses).all();

    return new Response(
      JSON.stringify({
        success: true,
        tokens: result.results || []
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetItemsByMints:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}