# 用户角色与审核系统 - 完整实现文档

## 概述

已完成基于角色的权限系统（RBAC）和完整的用户中心，包括：
- ✅ 多角色系统（user_roles表）
- ✅ 通知系统（user_notifications表）
- ✅ JWT包含角色信息
- ✅ 用户中心页面（带左侧抽屉）
- ✅ 审核面板（带筛选功能）
- ✅ 导航栏用户菜单

## 数据库架构

### 1. user_roles 表
```sql
CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,                    -- 'moderator', 'admin', 'vip'
    granted_by INTEGER,                    -- 授予者ID
    granted_at INTEGER NOT NULL,
    expires_at INTEGER,                    -- 过期时间（可选）
    UNIQUE(user_id, role)
);
```

**特点：**
- 支持多角色：一个用户可以有多个角色
- 支持角色过期：可设置临时权限
- 记录授予者：可追溯权限来源

### 2. user_notifications 表
```sql
CREATE TABLE user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,                    -- 'moderation_result', 'system', etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    metadata TEXT,                         -- JSON格式
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    read_at INTEGER
);
```

## 用户中心架构

### 页面路由
```
/profile                    # 用户中心主页
  ├── Profile              # 基本信息（默认）
  ├── Notifications        # 通知中心
  └── Moderation          # 审核面板（仅管理员可见）
```

### 左侧抽屉菜单

```typescript
┌─────────────────────────┐
│  👤 username            │
│  user@example.com       │
├─────────────────────────┤
│  👤 Profile         >   │  // 所有用户
│  🔔 Notifications   >   │  // 所有用户
│  🛡️  Moderation      >   │  // 仅管理员/审核员
├─────────────────────────┤
│  🚪 Logout              │
└─────────────────────────┘
```

### 1. Profile Section（基本信息）
- 显示邮箱
- 显示注册时间
- 显示用户角色（标签形式）

### 2. Notifications Section（通知中心）

**功能：**
- 筛选：All / Unread
- 显示通知列表
- 标记为已读
- 显示未读数量

**通知类型：**
- `moderation_result` - 审核结果通知
- `system` - 系统通知
- `mention` - 提及通知

### 3. Moderation Section（审核面板）

**仅对有以下角色的用户可见：**
- `moderator`
- `admin`

#### 审核面板功能

**1. 统计卡片**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│    12    │  │    45    │  │     3    │
│ Pending  │  │ Approved │  │ Rejected │
└──────────┘  └──────────┘  └──────────┘
```

**2. 内容类型切换**
- Gallery（图片）
- Timeline（时间线）
- Tributes（留言）

**3. 筛选条件**
- **Pending** - 待审核的内容
- **My Reviews** - 我审核过的所有内容
- **Approved** - 所有已通过的内容
- **All Rejected** - 所有被拒绝的内容
- **My Rejected** - 我拒绝的内容

**4. 审核卡片**
```
┌─────────────────────────────────────┐
│ Albert Einstein          [pending]  │
│ Submitted by: user@example.com      │
├─────────────────────────────────────┤
│ [图片预览/内容显示]                  │
│ Caption: "At Princeton, 1950"       │
├─────────────────────────────────────┤
│ [Reason input (optional)]           │
│ [✅ Approve]  [❌ Reject]            │
└─────────────────────────────────────┘
```

## API 端点

### 用户相关

```typescript
// 获取用户通知
GET /api/user/notifications?unread_only=false
Headers: Authorization: Bearer <token>
Response: { notifications: UserNotification[] }

// 标记通知为已读
POST /api/user/notifications/:id/read
Headers: Authorization: Bearer <token>

// 标记所有通知为已读
POST /api/user/notifications/read-all
Headers: Authorization: Bearer <token>

// 获取未读通知数量
GET /api/user/notifications/unread-count
Headers: Authorization: Bearer <token>
Response: { count: number }
```

### 审核相关

```typescript
// 获取审核统计
GET /api/admin/moderation-stats
Headers: Authorization: Bearer <token>
Response: {
  stats: {
    pending: number,
    approved: number,
    rejected: number
  }
}

// 获取待审核内容
GET /api/admin/moderation?type=gallery&filter=pending
Headers: Authorization: Bearer <token>
Query:
  - type: 'gallery' | 'timeline' | 'tribute'
  - filter: 'all' | 'my_reviews' | 'pending' | 'approved' | 'rejected' | 'my_rejected'
Response: { items: ModerationItem[] }

// 审核内容
POST /api/admin/moderate
Headers: Authorization: Bearer <token>
Body: {
  type: 'gallery' | 'timeline' | 'tribute',
  id: number,
  action: 'approve' | 'reject',
  reason?: string
}
Response: { success: true, action: string }
```

### 角色管理

```typescript
// 授予角色（仅admin）
POST /api/admin/roles/grant
Body: {
  user_id: number,
  role: string,
  expires_at?: number
}

// 撤销角色（仅admin）
POST /api/admin/roles/revoke
Body: {
  user_id: number,
  role: string
}

// 获取用户角色
GET /api/admin/users/:id/roles
Response: { roles: string[] }
```

## JWT Token 结构

```typescript
{
  user_id: number,
  email: string,
  roles: string[],        // 新增：用户角色数组
  iat: number,
  exp: number
}
```

## 权限检查

### 后端中间件

```typescript
// worker/auth.ts

/**
 * 验证用户是否有特定角色
 */
export async function requireRole(
  request: Request,
  env: Env,
  requiredRole: string
): Promise<{ id: number; email: string; roles: string[] }> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Unauthorized');
  }

  const payload = await verifyJWT(token, env.JWT_SECRET);
  const user = await get_user_by_id(env.DB, payload.user_id);

  if (!user) {
    throw new Error('User not found');
  }

  const roles = await get_user_roles(env.DB, user.id);

  if (!roles.includes(requiredRole) && !roles.includes('admin')) {
    throw new Error('Insufficient permissions');
  }

  return { id: user.id, email: user.email, roles };
}
```

### 前端权限检查

```typescript
// 在组件中检查角色
const { user } = useAuth();
const isModerator = user?.roles?.includes('moderator') || user?.roles?.includes('admin');

{isModerator && (
  <button onClick={() => navigate('/profile?tab=moderation')}>
    Moderation Panel
  </button>
)}
```

## 导航栏更新

### 桌面端
```typescript
// 已登录状态
[username] [Logout]
  ↓ 点击username
  → 跳转到 /profile

// 未登录状态
[Login / Register]
  ↓ 点击
  → 跳转到 /auth
```

### 移动端
```typescript
// 汉堡菜单中
- Home
- Gallery
- Heritage & Tokens
- Create
- [username]  ← 点击跳转到 /profile
- [Logout]
```

## 审核工作流程

### 1. 用户提交内容
```
用户上传图片/创建时间线/发表留言
  ↓
内容状态设为 'pending'
  ↓
审核员收到待审核通知（可选）
```

### 2. 审核员审核
```
审核员登录 → 点击用户名 → 进入Profile
  ↓
点击左侧 "Moderation"
  ↓
选择内容类型（Gallery/Timeline/Tributes）
  ↓
选择筛选条件（Pending）
  ↓
查看内容详情
  ↓
点击 Approve 或 Reject（可选填写原因）
  ↓
内容状态更新 + 记录审核日志
  ↓
发送通知给投稿者
```

### 3. 投稿者收到通知
```
投稿者登录 → 点击用户名 → 进入Profile
  ↓
点击左侧 "Notifications"
  ↓
查看审核结果通知
  ↓
如果通过：内容已公开显示
如果拒绝：查看拒绝原因
```

## 部署步骤

### 1. 运行数据库迁移

```bash
# 运行迁移
wrangler d1 migrations apply YOUR_DATABASE --remote

# 验证表结构
wrangler d1 execute YOUR_DATABASE --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 2. 设置第一个管理员

```bash
# 创建用户后授予admin角色
wrangler d1 execute YOUR_DATABASE --command "
INSERT INTO user_roles (user_id, role, granted_at)
VALUES (1, 'admin', $(date +%s)000)
"

# 或授予moderator角色
wrangler d1 execute YOUR_DATABASE --command "
INSERT INTO user_roles (user_id, role, granted_at)
VALUES (1, 'moderator', $(date +%s)000)
"
```

### 3. 测试权限系统

```bash
# 测试登录（应返回roles数组）
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# 测试审核API（需要moderator角色）
curl http://localhost:8787/api/admin/moderation-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 文件清单

### 数据库
- ✅ `migrations/0005.sql` - 用户角色和通知表

### 后端
- ✅ `worker/types.ts` - 添加UserRole和UserNotification类型
- ✅ `worker/user-system.ts` - 角色和通知管理函数
- ✅ `worker/auth.ts` - 更新JWT包含roles

### 前端
- ✅ `src/pages/UserProfile.tsx` - 用户中心主页
- ✅ `src/components/admin/ModerationPanel.tsx` - 审核面板
- ✅ `src/Layout.tsx` - 更新导航栏
- ✅ `src/App.tsx` - 添加/profile路由
- ✅ `src/context/AuthContext.tsx` - User接口添加roles

## 预定义角色

| 角色 | 权限 | 用途 |
|------|------|------|
| `user` | 默认 | 普通用户，可以查看和投稿 |
| `moderator` | 审核 | 可以审核用户提交的内容 |
| `admin` | 全部 | 可以管理用户、授予角色、审核内容 |
| `vip` | 特殊 | VIP用户（预留，可自定义权限） |
| `creator` | 创建 | 可以创建纪念对象（预留） |

## 扩展建议

### 1. 批量审核
```typescript
// 选中多个内容一次性审核
POST /api/admin/moderate-batch
Body: {
  items: [
    { type: 'gallery', id: 1, action: 'approve' },
    { type: 'gallery', id: 2, action: 'reject', reason: 'spam' }
  ]
}
```

### 2. 审核统计
```typescript
// 审核员个人统计
GET /api/admin/my-stats
Response: {
  total_reviews: number,
  approved: number,
  rejected: number,
  today: number
}
```

### 3. 自动审核规则
```typescript
// 基于规则的自动审核
- 用户信誉度 > 90 → 自动通过
- 内容包含敏感词 → 自动拒绝
- 图片尺寸不符 → 自动拒绝
```

## 总结

✅ **完整的RBAC系统**：支持多角色、角色过期、权限追溯
✅ **用户中心**：Profile + Notifications + Moderation
✅ **审核面板**：6种筛选条件，支持3种内容类型
✅ **通知系统**：自动通知审核结果
✅ **JWT集成**：Token包含角色信息
✅ **导航栏更新**：用户菜单按钮，点击进入Profile

系统已完全实现，可以开始使用！
