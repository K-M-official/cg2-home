import { verifyJWT } from '../auth';
import { create_gallery_image, create_timeline_event, create_tribute, get_gallery_images, get_timeline_events, get_tributes } from '../db/content';

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
 * 上传图片到 R2
 */
async function uploadImageToR2(env: Env, file: File): Promise<string> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `gallery/${timestamp}-${randomStr}.${ext}`;

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
 * 内容相关路由处理
 * /api/content/*
 */
export async function handleContentRoutes(request: Request, env: Env, path: string): Promise<Response | null> {
  // 获取 Gallery 图片列表
  if (path === '/api/content/gallery' && request.method === 'GET') {
    return handleGetGalleryImages(request, env);
  }

  // 上传 Gallery 图片
  if (path === '/api/content/gallery' && request.method === 'POST') {
    return handleGalleryUpload(request, env);
  }

  // 获取 Timeline 事件列表
  if (path === '/api/content/timeline' && request.method === 'GET') {
    return handleGetTimelineEvents(request, env);
  }

  // 创建 Timeline 事件
  if (path === '/api/content/timeline' && request.method === 'POST') {
    return handleTimelineCreate(request, env);
  }

  // 获取 Tribute 留言列表
  if (path === '/api/content/tribute' && request.method === 'GET') {
    return handleGetTributes(request, env);
  }

  // 提交 Tribute 留言
  if (path === '/api/content/tribute' && request.method === 'POST') {
    return handleTributeCreate(request, env);
  }

  return null;
}

/**
 * 处理 Gallery 图片上传
 * POST /api/content/gallery
 */
async function handleGalleryUpload(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const item_id = formData.get('item_id') as string;
    const caption = formData.get('caption') as string | null;
    const year = formData.get('year') as string | null;

    if (!imageFile || !item_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'image and item_id are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 上传图片到 R2
    const imageUrl = await uploadImageToR2(env, imageFile);

    // 创建 gallery 记录
    await create_gallery_image(
      env.DB,
      parseInt(item_id),
      imageUrl,
      user.user_id,
      caption,
      year ? parseInt(year) : null
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Image uploaded successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGalleryUpload:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理 Timeline 事件创建
 * POST /api/content/timeline
 */
async function handleTimelineCreate(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      item_id: number;
      year: number;
      month?: number | null;
      day?: number | null;
      title: string;
      description?: string;
    }>();

    if (!body.item_id || !body.year || !body.title) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id, year, and title are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建 timeline 事件
    await create_timeline_event(
      env.DB,
      body.item_id,
      body.year,
      body.title,
      body.description || '',
      user.user_id,
      body.month || null,
      body.day || null,
      null // image_url
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Timeline event created successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleTimelineCreate:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 处理 Tribute 留言创建
 * POST /api/content/tribute
 */
async function handleTributeCreate(request: Request, env: Env): Promise<Response> {
  try {
    const user = await getCurrentUser(request, env);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Authentication required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json<{
      item_id: number;
      content: string;
    }>();

    if (!body.item_id || !body.content) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id and content are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建 tribute 留言
    await create_tribute(
      env.DB,
      body.item_id,
      body.content,
      user.user_id,
      null // author_name (使用 user_id 而不是匿名名字)
    );

    return new Response(
      JSON.stringify({ success: true, message: 'Tribute posted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleTributeCreate:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取 Gallery 图片列表
 * GET /api/content/gallery?item_id=123
 */
async function handleGetGalleryImages(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const item_id = url.searchParams.get('item_id');

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const images = await get_gallery_images(env.DB, parseInt(item_id), false);

    return new Response(
      JSON.stringify({ images }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetGalleryImages:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取 Timeline 事件列表
 * GET /api/content/timeline?item_id=123
 */
async function handleGetTimelineEvents(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const item_id = url.searchParams.get('item_id');

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const events = await get_timeline_events(env.DB, parseInt(item_id), false);

    return new Response(
      JSON.stringify({ events }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetTimelineEvents:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * 获取 Tribute 留言列表
 * GET /api/content/tribute?item_id=123
 */
async function handleGetTributes(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const item_id = url.searchParams.get('item_id');

    if (!item_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PARAMS', message: 'item_id is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tributes = await get_tributes(env.DB, parseInt(item_id), false);

    return new Response(
      JSON.stringify({ tributes }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in handleGetTributes:', error);
    return new Response(
      JSON.stringify({ error: 'INTERNAL_ERROR', message: String(error) }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
