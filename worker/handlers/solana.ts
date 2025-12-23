import { get_solana_mapping } from '../db/solana';

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
