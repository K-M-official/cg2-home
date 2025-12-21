-- Migration: Item Content System (Gallery, Timeline, Tributes)

-- ==================== Gallery Images ====================
-- 存储用户上传的纪念图片
CREATE TABLE IF NOT EXISTS item_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,                    -- 关联到 items 表
    user_id INTEGER,                              -- 上传者ID (可选，允许匿名)
    image_url TEXT NOT NULL,                      -- R2存储的图片URL
    caption TEXT,                                 -- 图片说明
    year INTEGER,                                 -- 图片年份（可选）
    status TEXT NOT NULL DEFAULT 'pending',       -- pending/approved/rejected (审核状态)
    created_at INTEGER NOT NULL,
    approved_at INTEGER,                          -- 审核通过时间
    approved_by INTEGER,                          -- 审核者ID
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_item_gallery_item_id ON item_gallery(item_id);
CREATE INDEX IF NOT EXISTS idx_item_gallery_user_id ON item_gallery(user_id);
CREATE INDEX IF NOT EXISTS idx_item_gallery_status ON item_gallery(status);
CREATE INDEX IF NOT EXISTS idx_item_gallery_created_at ON item_gallery(created_at);

-- ==================== Timeline Events ====================
-- 存储生平时间线事件
CREATE TABLE IF NOT EXISTS item_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,                    -- 关联到 items 表
    user_id INTEGER,                              -- 投稿者ID (可选)
    year INTEGER NOT NULL,                        -- 事件年份
    month INTEGER,                                -- 月份（可选）
    day INTEGER,                                  -- 日期（可选）
    title TEXT NOT NULL,                          -- 事件标题
    description TEXT NOT NULL,                    -- 事件描述
    image_url TEXT,                               -- 事件配图（可选）
    status TEXT NOT NULL DEFAULT 'pending',       -- pending/approved/rejected
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    approved_at INTEGER,
    approved_by INTEGER,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_item_timeline_item_id ON item_timeline(item_id);
CREATE INDEX IF NOT EXISTS idx_item_timeline_user_id ON item_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_item_timeline_status ON item_timeline(status);
CREATE INDEX IF NOT EXISTS idx_item_timeline_year ON item_timeline(year);

-- ==================== Tributes (Messages) ====================
-- 存储用户留言
CREATE TABLE IF NOT EXISTS item_tributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,                    -- 关联到 items 表
    user_id INTEGER,                              -- 留言者ID (可选，允许匿名)
    author_name TEXT,                             -- 显示名称（匿名时使用）
    content TEXT NOT NULL,                        -- 留言内容
    status TEXT NOT NULL DEFAULT 'pending',       -- pending/approved/rejected (防止垃圾信息)
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    approved_at INTEGER,
    approved_by INTEGER,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_item_tributes_item_id ON item_tributes(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tributes_user_id ON item_tributes(user_id);
CREATE INDEX IF NOT EXISTS idx_item_tributes_status ON item_tributes(status);
CREATE INDEX IF NOT EXISTS idx_item_tributes_created_at ON item_tributes(created_at);

-- ==================== Content Moderation Log ====================
-- 审核日志（可选，用于追踪审核历史）
CREATE TABLE IF NOT EXISTS item_moderation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type TEXT NOT NULL,                   -- 'gallery'/'timeline'/'tribute'
    content_id INTEGER NOT NULL,                  -- 对应内容的ID
    moderator_id INTEGER NOT NULL,                -- 审核者ID
    action TEXT NOT NULL,                         -- 'approve'/'reject'
    reason TEXT,                                  -- 拒绝原因
    created_at INTEGER NOT NULL,
    FOREIGN KEY (moderator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_item_moderation_content ON item_moderation_log(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_item_moderation_moderator ON item_moderation_log(moderator_id);

-- Migration: User Roles and Notifications System

-- ==================== User Roles ====================
-- 用户角色表：支持多角色系统
CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,                              -- 'moderator', 'admin', 'vip', etc.
    granted_by INTEGER,                              -- 授予者ID
    granted_at INTEGER NOT NULL,
    expires_at INTEGER,                              -- 过期时间（可选，null表示永久）
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (granted_by) REFERENCES users(id),
    UNIQUE(user_id, role)                            -- 防止重复授予同一角色
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);

-- ==================== Notifications ====================
-- 通知表：用于系统通知、审核结果等
CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,                              -- 'moderation_result', 'system', 'mention', etc.
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,                                       -- 相关链接（可选）
    metadata TEXT,                                   -- JSON格式的额外数据
    is_read INTEGER NOT NULL DEFAULT 0,              -- 0=未读, 1=已读
    created_at INTEGER NOT NULL,
    read_at INTEGER,                                 -- 阅读时间
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON user_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON user_notifications(type);

-- ==================== 预定义角色说明 ====================
-- 'moderator'  - 审核员：可以审核用户提交的内容
-- 'admin'      - 管理员：拥有所有权限，包括用户管理
-- 'vip'        - VIP用户：可能有特殊功能（预留）
-- 'creator'    - 创作者：可以创建纪念对象（预留）
