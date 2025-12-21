# 审核员系统设计文档

## 概述

审核员系统用于管理用户生成的内容（Gallery图片、Timeline事件、Tributes留言），确保内容质量和平台安全。

## 审核员权限设计

### 1. 用户角色扩展

首先需要在 `users` 表中添加 `role` 字段：

```sql
-- Migration: 添加用户角色字段
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
-- 可能的值: 'user', 'moderator', 'admin'
```

### 2. 角色权限

| 角色 | 权限 |
|------|------|
| **user** | 查看已审核内容、投稿内容 |
| **moderator** | user权限 + 审核所有内容 |
| **admin** | moderator权限 + 用户管理、系统设置 |

## 审核面板位置

### 方案一：独立的管理后台路由（推荐）

```
/admin                          # 管理后台首页
  ├── /admin/dashboard          # 仪表盘（待审核统计）
  ├── /admin/moderation         # 审核中心
  │   ├── /admin/moderation/gallery    # 图片审核
  │   ├── /admin/moderation/timeline   # 时间线审核
  │   └── /admin/moderation/tributes   # 留言审核
  ├── /admin/users              # 用户管理
  └── /admin/logs               # 审核日志
```

### 方案二：集成在主导航栏（简化版）

在顶部导航栏添加"Admin"按钮（仅管理员可见）：

```typescript
// Layout.tsx
{isAuthenticated && user?.role === 'moderator' && (
  <button onClick={() => navigate('/admin')}>
    Admin
    {pendingCount > 0 && (
      <span className="badge">{pendingCount}</span>
    )}
  </button>
)}
```

## 审核面板UI设计

### 1. 仪表盘 (Dashboard)

```typescript
// src/pages/admin/Dashboard.tsx

interface DashboardStats {
  pending: {
    gallery: number;
    timeline: number;
    tribute: number;
    total: number;
  };
  today: {
    approved: number;
    rejected: number;
  };
  moderators: {
    name: string;
    count: number;
  }[];
}

// UI布局：
┌─────────────────────────────────────────┐
│  Admin Dashboard                         │
├─────────────────────────────────────────┤
│  Pending Review                          │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 12   │  │  8   │  │ 25   │          │
│  │Gallery│  │Timeline│ │Tributes│       │
│  └──────┘  └──────┘  └──────┘          │
│                                          │
│  Today's Activity                        │
│  ✅ Approved: 45    ❌ Rejected: 3      │
│                                          │
│  Top Moderators                          │
│  1. admin@example.com - 23 reviews      │
│  2. mod@example.com - 18 reviews        │
└─────────────────────────────────────────┘
```

### 2. 审核队列 (Moderation Queue)

```typescript
// src/pages/admin/ModerationQueue.tsx

// 三个Tab切换：Gallery | Timeline | Tributes

┌─────────────────────────────────────────┐
│  [Gallery] [Timeline] [Tributes]        │
├─────────────────────────────────────────┤
│  Pending Gallery Images (12)            │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📷 Image #1                        │ │
│  │ Item: Albert Einstein              │ │
│  │ Submitted by: user@example.com     │ │
│  │ Caption: "At Princeton, 1950"      │ │
│  │ Year: 1950                         │ │
│  │ [View Full Image]                  │ │
│  │                                    │ │
│  │ Reason (optional):                 │ │
│  │ [________________]                 │ │
│  │                                    │ │
│  │ [✅ Approve]  [❌ Reject]          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📷 Image #2                        │ │
│  │ ...                                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 3. 审核卡片组件设计

#### Gallery审核卡片
```typescript
interface GalleryReviewCard {
  id: number;
  image_url: string;
  caption: string | null;
  year: number | null;
  item_title: string;
  user_email: string | null;
  created_at: number;
}

// 显示内容：
- 图片预览（可点击放大）
- 所属纪念对象
- 投稿者信息
- 图片说明和年份
- 审核按钮（通过/拒绝）
- 拒绝原因输入框
```

#### Timeline审核卡片
```typescript
interface TimelineReviewCard {
  id: number;
  year: number;
  month: number | null;
  day: number | null;
  title: string;
  description: string;
  image_url: string | null;
  item_title: string;
  user_email: string | null;
  created_at: number;
}

// 显示内容：
- 事件日期（年/月/日）
- 事件标题
- 事件描述
- 配图（如果有）
- 所属纪念对象
- 投稿者信息
- 审核按钮
```

#### Tribute审核卡片
```typescript
interface TributeReviewCard {
  id: number;
  content: string;
  author_name: string | null;
  item_title: string;
  user_email: string | null;
  created_at: number;
}

// 显示内容：
- 留言内容
- 作者名称（匿名或实名）
- 所属纪念对象
- 投稿时间
- 审核按钮
```

## API端点实现

### 1. 获取待审核统计

```typescript
// GET /api/admin/pending-stats
// 需要 moderator 权限

export async function handleGetPendingStats(request: Request, env: Env): Promise<Response> {
  // 验证用户是否为管理员
  const user = await requireModerator(request, env);

  const counts = await get_pending_count(env.DB);

  return new Response(
    JSON.stringify({
      pending: {
        gallery: counts.gallery,
        timeline: counts.timeline,
        tribute: counts.tribute,
        total: counts.gallery + counts.timeline + counts.tribute
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 2. 获取待审核内容列表

```typescript
// GET /api/admin/pending?type=gallery&limit=20&offset=0
// 需要 moderator 权限

export async function handleGetPendingContent(request: Request, env: Env): Promise<Response> {
  const user = await requireModerator(request, env);

  const url = new URL(request.url);
  const type = url.searchParams.get('type') as 'gallery' | 'timeline' | 'tribute';
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  if (!type || !['gallery', 'timeline', 'tribute'].includes(type)) {
    return new Response(
      JSON.stringify({ error: 'Invalid type parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const content = await get_pending_content(env.DB, type, limit, offset);

  return new Response(
    JSON.stringify({ content }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 3. 审核内容

```typescript
// POST /api/admin/moderate
// Body: { type: 'gallery', id: 123, action: 'approve', reason?: 'spam' }
// 需要 moderator 权限

export async function handleModerateContent(request: Request, env: Env): Promise<Response> {
  const user = await requireModerator(request, env);

  const body = await request.json<{
    type: 'gallery' | 'timeline' | 'tribute';
    id: number;
    action: 'approve' | 'reject';
    reason?: string;
  }>();

  const { type, id, action, reason } = body;

  // 参数验证
  if (!type || !id || !action) {
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 执行审核
  switch (type) {
    case 'gallery':
      await moderate_gallery_image(env.DB, id, user.id, action, reason || null);
      break;
    case 'timeline':
      await moderate_timeline_event(env.DB, id, user.id, action, reason || null);
      break;
    case 'tribute':
      await moderate_tribute(env.DB, id, user.id, action, reason || null);
      break;
  }

  return new Response(
    JSON.stringify({ success: true, action }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

### 4. 批量审核

```typescript
// POST /api/admin/moderate-batch
// Body: { items: [{ type, id, action, reason }] }
// 需要 moderator 权限

export async function handleModerateBatch(request: Request, env: Env): Promise<Response> {
  const user = await requireModerator(request, env);

  const body = await request.json<{
    items: Array<{
      type: 'gallery' | 'timeline' | 'tribute';
      id: number;
      action: 'approve' | 'reject';
      reason?: string;
    }>;
  }>();

  const results = [];

  for (const item of body.items) {
    try {
      switch (item.type) {
        case 'gallery':
          await moderate_gallery_image(env.DB, item.id, user.id, item.action, item.reason || null);
          break;
        case 'timeline':
          await moderate_timeline_event(env.DB, item.id, user.id, item.action, item.reason || null);
          break;
        case 'tribute':
          await moderate_tribute(env.DB, item.id, user.id, item.action, item.reason || null);
          break;
      }
      results.push({ id: item.id, success: true });
    } catch (error) {
      results.push({ id: item.id, success: false, error: String(error) });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

## 权限中间件

```typescript
// worker/auth.ts

/**
 * 验证用户是否为管理员或审核员
 */
export async function requireModerator(request: Request, env: Env): Promise<{ id: number; email: string; role: string }> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  const payload = await verifyJWT(token, env.JWT_SECRET);

  // 从数据库获取用户信息（包括role）
  const user = await get_user_by_id(env.DB, payload.user_id);

  if (!user) {
    throw new Error('Unauthorized: User not found');
  }

  if (user.role !== 'moderator' && user.role !== 'admin') {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role
  };
}
```

## 前端实现示例

### 1. 审核队列页面

```typescript
// src/pages/admin/ModerationQueue.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type ContentType = 'gallery' | 'timeline' | 'tribute';

export const ModerationQueue: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<ContentType>('gallery');
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/pending?type=${activeTab}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setContent(data.content);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: number, action: 'approve' | 'reject', reason?: string) => {
    try {
      await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: activeTab,
          id,
          action,
          reason
        })
      });

      // 刷新列表
      loadContent();
    } catch (error) {
      console.error('Moderation failed:', error);
    }
  };

  return (
    <div className="moderation-queue">
      <div className="tabs">
        <button onClick={() => setActiveTab('gallery')} className={activeTab === 'gallery' ? 'active' : ''}>
          Gallery
        </button>
        <button onClick={() => setActiveTab('timeline')} className={activeTab === 'timeline' ? 'active' : ''}>
          Timeline
        </button>
        <button onClick={() => setActiveTab('tribute')} className={activeTab === 'tribute' ? 'active' : ''}>
          Tributes
        </button>
      </div>

      <div className="content-list">
        {loading ? (
          <div>Loading...</div>
        ) : content.length === 0 ? (
          <div>No pending items</div>
        ) : (
          content.map(item => (
            <ReviewCard
              key={item.id}
              item={item}
              type={activeTab}
              onModerate={handleModerate}
            />
          ))
        )}
      </div>
    </div>
  );
};
```

### 2. 审核卡片组件

```typescript
// src/components/admin/ReviewCard.tsx

interface ReviewCardProps {
  item: any;
  type: ContentType;
  onModerate: (id: number, action: 'approve' | 'reject', reason?: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ item, type, onModerate }) => {
  const [reason, setReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = () => {
    onModerate(item.id, 'approve');
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    onModerate(item.id, 'reject', reason);
    setShowRejectInput(false);
    setReason('');
  };

  return (
    <div className="review-card">
      <div className="card-header">
        <span className="item-title">{item.item_title}</span>
        <span className="user-email">{item.user_email || 'Anonymous'}</span>
      </div>

      <div className="card-body">
        {type === 'gallery' && (
          <>
            <img src={item.image_url} alt="Preview" className="preview-image" />
            <p>{item.caption}</p>
            <span>Year: {item.year}</span>
          </>
        )}

        {type === 'timeline' && (
          <>
            <h3>{item.title}</h3>
            <p className="date">{item.year}/{item.month}/{item.day}</p>
            <p>{item.description}</p>
            {item.image_url && <img src={item.image_url} alt="Event" />}
          </>
        )}

        {type === 'tribute' && (
          <>
            <p className="content">{item.content}</p>
            <span className="author">{item.author_name || 'Anonymous'}</span>
          </>
        )}
      </div>

      <div className="card-actions">
        {showRejectInput && (
          <input
            type="text"
            placeholder="Reason for rejection (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}

        <button onClick={handleApprove} className="btn-approve">
          ✅ Approve
        </button>
        <button onClick={handleReject} className="btn-reject">
          ❌ {showRejectInput ? 'Confirm Reject' : 'Reject'}
        </button>
      </div>
    </div>
  );
};
```

## 审核工作流程

### 审核员日常工作流程

1. **登录系统**
   - 使用管理员账号登录
   - 系统验证 `role` 字段

2. **查看待审核统计**
   - 进入 `/admin/dashboard`
   - 查看各类型待审核数量

3. **进入审核队列**
   - 点击对应类型进入审核页面
   - 按时间顺序显示待审核内容（先进先出）

4. **审核单个内容**
   - 查看内容详情
   - 判断是否符合规范
   - 点击"通过"或"拒绝"
   - 如果拒绝，可选填写原因

5. **批量审核（可选）**
   - 勾选多个内容
   - 批量通过或拒绝

6. **查看审核日志**
   - 进入 `/admin/logs`
   - 查看历史审核记录

## 部署步骤

### 1. 数据库迁移

```bash
# 添加role字段到users表
wrangler d1 execute YOUR_DATABASE --command "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'"

# 运行内容系统迁移
wrangler d1 migrations apply YOUR_DATABASE --remote
```

### 2. 设置第一个管理员

```bash
# 手动设置管理员
wrangler d1 execute YOUR_DATABASE --command "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'"
```

### 3. 添加路由

在 `worker/index.ts` 中添加管理员API路由。

### 4. 部署前端

创建 `/admin` 相关页面并部署。

## 总结

审核员系统的核心要点：

✅ **位置**：独立的 `/admin` 路由，通过顶部导航栏访问
✅ **权限**：基于 `role` 字段的权限控制
✅ **界面**：仪表盘 + 审核队列 + 审核日志
✅ **功能**：单个审核、批量审核、拒绝原因
✅ **工作流**：先进先出、实时统计、完整日志

审核员只需要登录后点击导航栏的"Admin"按钮，就能进入审核面板进行内容审核！
