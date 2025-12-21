# Memorial Content System Architecture

## 概述

这是一个优雅的三模块内容管理系统，用于纪念页面的 Gallery（图片）、Timeline（生平）、Tributes（留言）功能。

## 核心设计理念

### 1. **统一的审核机制**
- 所有用户生成内容（UGC）都需要经过审核
- 三种状态：`pending`（待审核）、`approved`（已通过）、`rejected`（已拒绝）
- 防止垃圾信息和不当内容

### 2. **灵活的用户身份**
- 支持已登录用户投稿（记录 `user_id`）
- 支持匿名投稿（`user_id` 为 null，使用 `author_name`）
- 便于追踪和管理

### 3. **完整的审核日志**
- `content_moderation_log` 表记录所有审核操作
- 可追溯、可审计
- 支持后续数据分析

## 数据库架构

### 表结构

```
items (纪念对象)
  ├── memorial_gallery (图片库)
  ├── memorial_timeline (时间线)
  └── memorial_tributes (留言)

users (用户)
  ├── 作为投稿者
  └── 作为审核者

content_moderation_log (审核日志)
```

### 关键字段设计

#### memorial_gallery (图片库)
- `image_url`: R2存储的图片URL
- `caption`: 图片说明
- `year`: 图片年份（用于排序和筛选）
- `status`: 审核状态

#### memorial_timeline (时间线)
- `year/month/day`: 灵活的日期表示（支持只有年份的事件）
- `title`: 事件标题
- `description`: 详细描述
- `image_url`: 可选的事件配图

#### memorial_tributes (留言)
- `content`: 留言内容
- `author_name`: 显示名称（匿名用户使用）
- 支持编辑和删除

## API 端点设计

### Gallery API

```
POST   /api/memorial/:itemId/gallery          # 上传图片
GET    /api/memorial/:itemId/gallery          # 获取图片列表
DELETE /api/memorial/:itemId/gallery/:id      # 删除图片
POST   /api/admin/gallery/:id/moderate        # 审核图片
```

### Timeline API

```
POST   /api/memorial/:itemId/timeline         # 创建时间线事件
GET    /api/memorial/:itemId/timeline         # 获取时间线
PUT    /api/memorial/:itemId/timeline/:id     # 更新事件
DELETE /api/memorial/:itemId/timeline/:id     # 删除事件
POST   /api/admin/timeline/:id/moderate       # 审核事件
```

### Tributes API

```
POST   /api/memorial/:itemId/tributes         # 发表留言
GET    /api/memorial/:itemId/tributes         # 获取留言列表
PUT    /api/memorial/:itemId/tributes/:id     # 编辑留言
DELETE /api/memorial/:itemId/tributes/:id     # 删除留言
POST   /api/admin/tributes/:id/moderate       # 审核留言
```

### Admin API

```
GET    /api/admin/pending                     # 获取待审核内容统计
GET    /api/admin/moderation-log              # 获取审核日志
```

## 前端实现建议

### 1. Gallery 组件

```typescript
// 特性：
- 瀑布流布局（Masonry）
- 图片上传（拖拽 + 点击）
- 图片预览（Lightbox）
- 年份筛选
- 懒加载

// 用户体验：
- 上传后显示"审核中"状态
- 审核通过后自动显示
```

### 2. Timeline 组件

```typescript
// 特性：
- 垂直时间轴布局
- 年份分组
- 事件卡片（标题 + 描述 + 可选图片）
- 投稿表单（模态框）
- 编辑功能（仅限投稿者）

// 用户体验：
- 按年份排序
- 支持展开/折叠详情
- 投稿后显示"待审核"标签
```

### 3. Tributes 组件

```typescript
// 特性：
- 留言列表（分页）
- 留言表单
- 编辑/删除（仅限作者）
- 匿名/实名切换
- 字数限制

// 用户体验：
- 实时发布（审核后显示）
- 支持 Markdown 或富文本
- 显示发布时间
```

## 权限控制

### 用户权限
- **游客**：查看已审核内容
- **登录用户**：投稿 + 编辑自己的内容
- **管理员**：审核所有内容 + 删除任意内容

### 实现方式
```typescript
// JWT Token 中包含用户角色
{
  user_id: 123,
  email: "user@example.com",
  role: "user" | "admin"
}

// API 中间件验证
async function requireAuth(request: Request, env: Env) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('Unauthorized');

  const payload = await verifyJWT(token, env.JWT_SECRET);
  return payload;
}

async function requireAdmin(request: Request, env: Env) {
  const user = await requireAuth(request, env);
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
}
```

## 审核工作流

### 自动审核（可选）
```typescript
// 基于规则的自动审核
- 内容长度检查
- 敏感词过滤
- 图片内容检测（使用 Cloudflare AI）
- 用户信誉度评分
```

### 人工审核
```typescript
// 管理后台功能
- 待审核队列
- 批量审核
- 审核历史
- 统计报表
```

## 性能优化

### 1. 数据库索引
- 已在 migration 中创建所有必要索引
- `item_id` + `status` 复合索引（最常用查询）

### 2. 缓存策略
```typescript
// R2 图片缓存
Cache-Control: public, max-age=31536000

// API 响应缓存（Cloudflare Cache API）
- 已审核内容：缓存 5 分钟
- 待审核内容：不缓存
```

### 3. 分页加载
```typescript
// Tributes 分页
GET /api/memorial/:itemId/tributes?limit=20&offset=0

// 无限滚动实现
const [tributes, setTributes] = useState([]);
const [offset, setOffset] = useState(0);

const loadMore = async () => {
  const newTributes = await fetchTributes(itemId, 20, offset);
  setTributes([...tributes, ...newTributes]);
  setOffset(offset + 20);
};
```

## 扩展功能

### 1. 点赞/反应系统
```sql
CREATE TABLE memorial_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,  -- 'gallery'/'timeline'/'tribute'
    content_id INTEGER NOT NULL,
    user_id INTEGER,
    reaction_type TEXT NOT NULL,  -- 'like'/'heart'/'pray'
    created_at INTEGER NOT NULL
);
```

### 2. 举报系统
```sql
CREATE TABLE content_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    reporter_id INTEGER,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
);
```

### 3. 通知系统
```typescript
// 当内容被审核时通知投稿者
- 审核通过：发送邮件通知
- 审核拒绝：发送邮件 + 拒绝原因
```

## 安全考虑

### 1. 输入验证
```typescript
// 所有用户输入都需要验证
- 内容长度限制
- HTML/Script 标签过滤
- SQL 注入防护（使用参数化查询）
```

### 2. 速率限制
```typescript
// Cloudflare Workers Rate Limiting
- 投稿：每用户每小时 10 次
- 留言：每用户每小时 20 次
- 图片上传：每用户每天 50 张
```

### 3. 图片安全
```typescript
// 图片上传验证
- 文件类型检查（MIME type）
- 文件大小限制（5MB）
- 图片尺寸限制（最大 4096x4096）
- 病毒扫描（可选）
```

## 部署清单

### 1. 数据库迁移
```bash
# 运行迁移
wrangler d1 migrations apply YOUR_DATABASE --remote

# 验证表结构
wrangler d1 execute YOUR_DATABASE --command "SELECT name FROM sqlite_master WHERE type='table'"
```

### 2. 环境变量
```toml
# wrangler.toml
[env.production]
vars = { DEV = false, ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "your-database"
database_id = "your-database-id"

[[env.production.r2_buckets]]
binding = "R2"
bucket_name = "your-bucket"
```

### 3. API 测试
```bash
# 测试图片上传
curl -X POST http://localhost:8787/api/memorial/1/gallery \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg" \
  -F "caption=Test image"

# 测试时间线创建
curl -X POST http://localhost:8787/api/memorial/1/timeline \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"title":"Born","description":"Birth event"}'

# 测试留言
curl -X POST http://localhost:8787/api/memorial/1/tributes \
  -H "Content-Type: application/json" \
  -d '{"content":"Rest in peace","author_name":"Anonymous"}'
```

## 总结

这个架构的优势：

✅ **模块化**：三个功能独立但统一管理
✅ **可扩展**：易于添加新功能（点赞、举报等）
✅ **安全性**：完整的审核机制和权限控制
✅ **性能**：合理的索引和缓存策略
✅ **用户友好**：支持匿名和实名投稿
✅ **可追溯**：完整的审核日志
✅ **灵活性**：支持各种日期格式和可选字段

下一步：实现 API 端点和前端组件！
