import { verifyJWT } from '../auth';
import { get_moderation_stats, get_moderation_content } from '../db/moderation';
import { moderate_gallery_image, moderate_timeline_event, moderate_tribute } from '../db/content';
import { grant_user_role, revoke_user_role, user_has_any_role } from '../db/roles';
import { notify_moderation_result } from '../db/notifications';

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
 * 管理员相关路由处理
 * /api/admin/*
 */
export async function handleAdminRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 获取审核统计
  if (path === '/api/admin/moderation-stats' && request.method === 'GET') {
    return handleGetModerationStats(request, env);
  }

  // 获取待审核内容
  if (path === '/api/admin/moderation' && request.method === 'GET') {
    return handleGetModerationContent(request, env);
  }

  // 审核内容
  if (path === '/api/admin/moderate' && request.method === 'POST') {
    return handleModerateContent(request, env);
  }

  // 授予角色（仅admin）
  if (path === '/api/admin/roles/grant' && request.method === 'POST') {
    return handleGrantRole(request, env);
  }

  // 撤销角色（仅admin）
  if (path === '/api/admin/roles/revoke' && request.method === 'POST') {
    return handleRevokeRole(request, env);
  }

  return null;
}

/**
 * 获取审核统计
 * GET /api/admin/moderation-stats
 */
async function handleGetModerationStats(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否有审核权限
    const isModerator = await user_has_any_role(env.DB, user.user_id, ['moderator', 'admin']);
    if (!isModerator) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Insufficient permissions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stats = await get_moderation_stats(env.DB);

    return new Response(
      JSON.stringify({ stats }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetModerationStats:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取待审核内容
 * GET /api/admin/moderation?type=gallery&filter=pending
 */
async function handleGetModerationContent(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否有审核权限
    const isModerator = await user_has_any_role(env.DB, user.user_id, ['moderator', 'admin']);
    if (!isModerator) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Insufficient permissions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') as 'gallery' | 'timeline' | 'tribute' || 'gallery';
    const filter = url.searchParams.get('filter') as 'all' | 'my_reviews' | 'pending' | 'approved' | 'rejected' | 'my_rejected' || 'pending';

    const items = await get_moderation_content(env.DB, type, filter, user.user_id);

    return new Response(
      JSON.stringify({ items }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetModerationContent:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 审核内容
 * POST /api/admin/moderate
 * Body: { type, id, action, reason? }
 */
async function handleModerateContent(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否有审核权限
    const isModerator = await user_has_any_role(env.DB, user.user_id, ['moderator', 'admin']);
    if (!isModerator) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Insufficient permissions' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      type: 'gallery' | 'timeline' | 'tribute';
      id: number;
      action: 'approve' | 'reject';
      reason?: string;
    }>();

    if (!body.type || !body.id || !body.action) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'type, id, and action are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取内容的user_id以发送通知
    let contentUserId: number | null = null;

    if (body.type === 'gallery') {
      const result = await env.DB.prepare('SELECT user_id FROM item_gallery WHERE id = ?').bind(body.id).first<{ user_id: number }>();
      contentUserId = result?.user_id || null;
      await moderate_gallery_image(env.DB, body.id, user.user_id, body.action, body.reason || null);
    } else if (body.type === 'timeline') {
      const result = await env.DB.prepare('SELECT user_id FROM item_timeline WHERE id = ?').bind(body.id).first<{ user_id: number }>();
      contentUserId = result?.user_id || null;
      await moderate_timeline_event(env.DB, body.id, user.user_id, body.action, body.reason || null);
    } else if (body.type === 'tribute') {
      const result = await env.DB.prepare('SELECT user_id FROM item_tributes WHERE id = ?').bind(body.id).first<{ user_id: number }>();
      contentUserId = result?.user_id || null;
      await moderate_tribute(env.DB, body.id, user.user_id, body.action, body.reason || null);
    }

    // 发送通知给内容提交者
    if (contentUserId) {
      await notify_moderation_result(env.DB, contentUserId, body.type, body.id, body.action, body.reason || null);
    }

    return new Response(
      JSON.stringify({ success: true, action: body.action }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleModerateContent:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 授予角色
 * POST /api/admin/roles/grant
 * Body: { user_id, role, expires_at? }
 */
async function handleGrantRole(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 只有admin可以授予角色
    const isAdmin = user.roles.includes('admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Only admins can grant roles' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      user_id: number;
      role: string;
      expires_at?: number;
    }>();

    if (!body.user_id || !body.role) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'user_id and role are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await grant_user_role(env.DB, body.user_id, body.role, user.user_id, body.expires_at || null);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGrantRole:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 撤销角色
 * POST /api/admin/roles/revoke
 * Body: { user_id, role }
 */
async function handleRevokeRole(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 只有admin可以撤销角色
    const isAdmin = user.roles.includes('admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Only admins can revoke roles' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      user_id: number;
      role: string;
    }>();

    if (!body.user_id || !body.role) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'user_id and role are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await revoke_user_role(env.DB, body.user_id, body.role);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleRevokeRole:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
