import { handleAuthRoutes } from './handlers/auth';
import { handleUserRoutes } from './handlers/user';
import { handleAdminRoutes } from './handlers/admin';
import { handleItemRoutes } from './handlers/items';
import { handleContentRoutes } from './handlers/content';
import { handleWalletRoutes } from './handlers/wallet';
import { handleSolanaRoutes } from './handlers/solana';
import { process_pending_execution, process_pending_confirmation } from './cron';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
} as const;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // CORS 预检
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // API 路由处理
    if (pathname.startsWith('/api/')) {
      return await handleApi(request, env, pathname);
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  },

  /**
   * Cron Job: 每5分钟执行一次
   * 包含两个独立的任务：
   * 1. 处理待执行的 Arweave 交易
   * 2. 检查待确认的 Arweave 交易
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('🕐 Cron job started at:', new Date(controller.scheduledTime).toISOString());

    try {
      // 任务 1: 处理待执行的交易
      await process_pending_execution(env);

      // 任务 2: 检查待确认的交易
      await process_pending_confirmation(env);

      console.log('🎉 Cron job completed successfully');
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  }
} satisfies ExportedHandler<Env>;

/**
 * API 路由分发
 * 使用 path.startsWith() 进行层级过滤，然后分发到对应的 handler
 */
async function handleApi(request: Request, env: Env, path: string): Promise<Response> {
  // 认证相关路由: /api/auth/*
  if (path.startsWith('/api/auth/')) {
    const response = await handleAuthRoutes(request, env, path);
    if (response) return response;
  }

  // 用户相关路由: /api/user/*
  if (path.startsWith('/api/user/')) {
    const response = await handleUserRoutes(request, env, path);
    if (response) return response;
  }

  // 管理员相关路由: /api/admin/*
  if (path.startsWith('/api/admin/')) {
    const response = await handleAdminRoutes(request, env, path);
    if (response) return response;
  }

  // 内容提交相关路由: /api/content/*
  if (path.startsWith('/api/content/')) {
    const response = await handleContentRoutes(request, env, path);
    if (response) return response;
  }

  // 钱包相关路由: /api/wallet/*
  if (path.startsWith('/api/wallet')) {
    const response = await handleWalletRoutes(request, env, path);
    if (response) return response;
  }

  // Solana 相关路由: /api/solana/*
  if (path.startsWith('/api/solana/')) {
    const response = await handleSolanaRoutes(request, env, path);
    if (response) return response;
  }

  // 纪念对象相关路由: /api/item/*, /api/items/*, /api/groups/*, /api/leaderboard/*
  if (path.startsWith('/api/item/') ||
      path.startsWith('/api/items') ||
      path.startsWith('/api/groups') ||
      path.startsWith('/api/leaderboard')) {
    const response = await handleItemRoutes(request, env, path);
    if (response) return response;
  }

  // Debug 模式专属路由: /api/debug/*
  if (env.DEV && path.startsWith('/api/debug/')) {
    return await handleDebugRoutes(request, env, path);
  }

  // 未找到匹配的路由
  return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Debug 模式专属路由处理
 * /api/debug/*
 */
async function handleDebugRoutes(request: Request, env: Env, path: string): Promise<Response> {
  // 从R2获取图片 (仅在开发环境下可用)
  if (path.startsWith('/api/debug/r2/') && request.method === 'GET') {
    return handleDebugGetR2Image(request, env, path);
  }

  return new Response(JSON.stringify({ error: 'NOT_FOUND' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Debug模式专属：从R2获取图片
 * GET /api/debug/r2/{fileName}
 */
async function handleDebugGetR2Image(request: Request, env: Env, path: string): Promise<Response> {
  try {
    if (!env.DEV) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'This endpoint is only available in development mode' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fileName = path.replace('/api/debug/r2/', '');

    if (!fileName) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'File name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Debug: Fetching R2 object:', fileName);

    const object = await env.R2.get(fileName);

    if (!object) {
      console.log('❌ Debug: Object not found in R2:', fileName);
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Image not found in R2' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Debug: Object found in R2:', {
      key: object.key,
      size: object.size,
      uploaded: object.uploaded,
      httpMetadata: object.httpMetadata
    });

    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ Error in handleDebugGetR2Image:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
