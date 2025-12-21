import { verifyJWT } from '../auth';
import { get_user_notifications, mark_notification_read, mark_all_notifications_read, get_unread_count } from '../db/notifications';

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
 * 用户相关路由处理
 * /api/user/*
 */
export async function handleUserRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 获取用户通知列表
  if (path === '/api/user/notifications' && request.method === 'GET') {
    return handleGetUserNotifications(request, env);
  }

  // 标记通知为已读
  if (path.match(/^\/api\/user\/notifications\/\d+\/read$/) && request.method === 'POST') {
    return handleMarkNotificationRead(request, env, path);
  }

  // 标记所有通知为已读
  if (path === '/api/user/notifications/read-all' && request.method === 'POST') {
    return handleMarkAllNotificationsRead(request, env);
  }

  // 获取未读通知数量
  if (path === '/api/user/notifications/unread-count' && request.method === 'GET') {
    return handleGetUnreadCount(request, env);
  }

  return null;
}

/**
 * 获取用户通知列表
 * GET /api/user/notifications?unread_only=false
 */
async function handleGetUserNotifications(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(request.url);
    const unread_only = url.searchParams.get('unread_only') === 'true';

    const notifications = await get_user_notifications(env.DB, user.user_id, unread_only);

    return new Response(
      JSON.stringify({ notifications }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetUserNotifications:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 标记通知为已读
 * POST /api/user/notifications/:id/read
 */
async function handleMarkNotificationRead(request: Request, env: Env, path: string): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pathParts = path.split('/');
    const notificationId = parseInt(pathParts[pathParts.length - 2], 10);

    if (!notificationId || isNaN(notificationId)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'Invalid notification ID' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await mark_notification_read(env.DB, notificationId, user.user_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleMarkNotificationRead:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 标记所有通知为已读
 * POST /api/user/notifications/read-all
 */
async function handleMarkAllNotificationsRead(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await mark_all_notifications_read(env.DB, user.user_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleMarkAllNotificationsRead:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取未读通知数量
 * GET /api/user/notifications/unread-count
 */
async function handleGetUnreadCount(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const count = await get_unread_count(env.DB, user.user_id);

    return new Response(
      JSON.stringify({ count }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetUnreadCount:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
