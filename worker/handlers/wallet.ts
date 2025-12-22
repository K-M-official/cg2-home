import { verifyJWT } from '../auth';
import { get_or_create_wallet, get_arweave_address_from_wallet, get_user_arweave_transactions, create_arweave_transaction, update_arweave_transaction_status, get_arweave_balance } from '../db/wallet';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

/**
 * 获取当前用户信息（从JWT）
 */
async function getCurrentUser(request: Request, env: Env): Promise<{ user_id: number; email: string; roles: string[] } | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyJWT(token, env.JWT_SECRET);

    return {
      user_id: payload.user_id,
      email: payload.email,
      roles: payload.roles || []
    };
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null;
  }
}

/**
 * 钱包相关路由处理
 * /api/wallet/*
 */
export async function handleWalletRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 获取钱包信息
  if (path === '/api/wallet' && request.method === 'GET') {
    return handleGetWallet(request, env);
  }

  // 获取 Arweave 交易记录
  if (path === '/api/wallet/arweave-transactions' && request.method === 'GET') {
    return handleGetArweaveTransactions(request, env);
  }

  // 创建 Arweave 交易
  if (path === '/api/wallet/arweave-transactions' && request.method === 'POST') {
    return handleCreateArweaveTransaction(request, env);
  }

  // 更新 Arweave 交易状态
  if (path.startsWith('/api/wallet/arweave-transactions/') && request.method === 'PATCH') {
    return handleUpdateArweaveTransaction(request, env, path);
  }

  return null;
}

/**
 * 获取钱包信息
 * GET /api/wallet
 */
async function handleGetWallet(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取或创建钱包
    const wallet = await get_or_create_wallet(env.DB, user.user_id);

    // 获取 Arweave 地址
    const arweave_address = await get_arweave_address_from_wallet(wallet);

    // 获取 Arweave 链上余额（AR）
    let arweave_balance = 0;
    if (wallet.arweave_jwk) {
      try {
        const jwk = JSON.parse(wallet.arweave_jwk);
        arweave_balance = await get_arweave_balance(jwk);
      } catch (error) {
        console.error('Failed to get Arweave balance:', error);
        // 不阻止返回，继续返回 0
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        wallet: {
          balance_usd: wallet.balance,        // USD 余额（数据库）
          balance_ar: arweave_balance,        // AR 余额（链上查询）
          arweave_address: arweave_address,
          created_at: wallet.created_at,
          updated_at: wallet.updated_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetWallet:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取 Arweave 交易记录
 * GET /api/wallet/arweave-transactions?status=pending_balance&limit=50&offset=0
 */
async function handleGetArweaveTransactions(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const transactions = await get_user_arweave_transactions(env.DB, user.user_id, status, limit, offset);

    return new Response(
      JSON.stringify({
        success: true,
        transactions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetArweaveTransactions:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 创建 Arweave 交易
 * POST /api/wallet/arweave-transactions
 * Body: { content_type, content_reference, metadata, data_size, fee_amount }
 */
async function handleCreateArweaveTransaction(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      content_type: string;
      content_reference?: string;
      metadata?: any;
      data_size?: number;
      fee_amount?: number;
    }>();

    if (!body.content_type) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'content_type is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取钱包和地址
    const wallet = await get_or_create_wallet(env.DB, user.user_id);
    const arweave_address = await get_arweave_address_from_wallet(wallet);

    // 创建交易记录
    const transaction_id = await create_arweave_transaction(
      env.DB,
      user.user_id,
      arweave_address,
      body.content_type,
      body.content_reference || null,
      body.metadata || null,
      body.data_size || null,
      body.fee_amount || null
    );

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleCreateArweaveTransaction:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 更新 Arweave 交易状态
 * PATCH /api/wallet/arweave-transactions/:id
 * Body: { status, tx_id?, error_message? }
 */
async function handleUpdateArweaveTransaction(request: Request, env: Env, path: string): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pathParts = path.split('/');
    const transaction_id = parseInt(pathParts[pathParts.length - 1], 10);

    if (!transaction_id || isNaN(transaction_id)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'Invalid transaction ID' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      status: 'cancelled' | 'pending_balance' | 'pending_confirmation' | 'confirmed' | 'error';
      tx_id?: string;
      error_message?: string;
    }>();

    if (!body.status) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'status is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取交易记录以验证权限和状态
    const { get_arweave_transaction_by_id } = await import('../db/wallet');
    const transaction = await get_arweave_transaction_by_id(env.DB, transaction_id);

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Transaction not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 验证用户权限：只能操作自己的交易
    if (transaction.user_id !== user.user_id) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'You can only modify your own transactions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 如果是取消操作，验证交易状态
    if (body.status === 'cancelled') {
      // 不能取消已确认或正在确认的交易
      if (transaction.status === 'confirmed' || transaction.status === 'pending_confirmation') {
        return new Response(
          JSON.stringify({
            error: 'INVALID_STATUS',
            message: 'Cannot cancel transactions that are confirmed or pending confirmation'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    await update_arweave_transaction_status(
      env.DB,
      transaction_id,
      body.status,
      body.tx_id || null,
      body.error_message || null
    );

    return new Response(
      JSON.stringify({
        success: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleUpdateArweaveTransaction:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
