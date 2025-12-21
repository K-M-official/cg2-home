import type { ItemGalleryImage, ItemTimelineEvent, ItemTribute } from "../types";

// ==================== Gallery Functions ====================

/**
 * 创建图片记录
 */
export async function create_gallery_image(
    db: D1Database,
    item_id: number,
    image_url: string,
    user_id: number | null = null,
    caption: string | null = null,
    year: number | null = null
): Promise<number> {
    const now = Date.now();
    const result = await db.prepare(`
        INSERT INTO item_gallery (item_id, user_id, image_url, caption, year, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `).bind(item_id, user_id, image_url, caption, year, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 获取指定纪念对象的图片（仅已审核通过的）
 */
export async function get_gallery_images(
    db: D1Database,
    item_id: number,
    include_pending: boolean = false
): Promise<ItemGalleryImage[]> {
    let query = `
        SELECT g.*, u.email as user_email
        FROM item_gallery g
        LEFT JOIN users u ON g.user_id = u.id
        WHERE g.item_id = ?
    `;

    if (!include_pending) {
        query += ` AND g.status = 'approved'`;
    }

    query += ` ORDER BY g.year DESC, g.created_at DESC`;

    const result = await db.prepare(query).bind(item_id).all<ItemGalleryImage>();
    return result.results || [];
}

/**
 * 审核图片
 */
export async function moderate_gallery_image(
    db: D1Database,
    image_id: number,
    moderator_id: number,
    action: 'approve' | 'reject',
    reason: string | null = null
): Promise<void> {
    const now = Date.now();

    // 更新图片状态
    await db.prepare(`
        UPDATE item_gallery
        SET status = ?, approved_at = ?, approved_by = ?
        WHERE id = ?
    `).bind(action === 'approve' ? 'approved' : 'rejected', now, moderator_id, image_id).run();

    // 记录审核日志
    await db.prepare(`
        INSERT INTO item_moderation_log (content_type, content_id, moderator_id, action, reason, created_at)
        VALUES ('gallery', ?, ?, ?, ?, ?)
    `).bind(image_id, moderator_id, action, reason, now).run();
}

// ==================== Timeline Functions ====================

/**
 * 创建时间线事件
 */
export async function create_timeline_event(
    db: D1Database,
    item_id: number,
    year: number,
    title: string,
    description: string,
    user_id: number | null = null,
    month: number | null = null,
    day: number | null = null,
    image_url: string | null = null
): Promise<number> {
    const now = Date.now();
    const result = await db.prepare(`
        INSERT INTO item_timeline
        (item_id, user_id, year, month, day, title, description, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `).bind(item_id, user_id, year, month, day, title, description, image_url, now, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 获取时间线事件
 */
export async function get_timeline_events(
    db: D1Database,
    item_id: number,
    include_pending: boolean = false
): Promise<ItemTimelineEvent[]> {
    let query = `
        SELECT t.*, u.email as user_email
        FROM item_timeline t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.item_id = ?
    `;

    if (!include_pending) {
        query += ` AND t.status = 'approved'`;
    }

    query += ` ORDER BY t.year ASC, t.month ASC, t.day ASC`;

    const result = await db.prepare(query).bind(item_id).all<ItemTimelineEvent>();
    return result.results || [];
}

/**
 * 更新时间线事件
 */
export async function update_timeline_event(
    db: D1Database,
    event_id: number,
    updates: {
        year?: number;
        month?: number | null;
        day?: number | null;
        title?: string;
        description?: string;
        image_url?: string | null;
    }
): Promise<void> {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.year !== undefined) {
        fields.push('year = ?');
        values.push(updates.year);
    }
    if (updates.month !== undefined) {
        fields.push('month = ?');
        values.push(updates.month);
    }
    if (updates.day !== undefined) {
        fields.push('day = ?');
        values.push(updates.day);
    }
    if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.image_url !== undefined) {
        fields.push('image_url = ?');
        values.push(updates.image_url);
    }

    if (fields.length === 0) return;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(event_id);

    await db.prepare(`
        UPDATE item_timeline
        SET ${fields.join(', ')}
        WHERE id = ?
    `).bind(...values).run();
}

/**
 * 审核时间线事件
 */
export async function moderate_timeline_event(
    db: D1Database,
    event_id: number,
    moderator_id: number,
    action: 'approve' | 'reject',
    reason: string | null = null
): Promise<void> {
    const now = Date.now();

    await db.prepare(`
        UPDATE item_timeline
        SET status = ?, approved_at = ?, approved_by = ?
        WHERE id = ?
    `).bind(action === 'approve' ? 'approved' : 'rejected', now, moderator_id, event_id).run();

    await db.prepare(`
        INSERT INTO item_moderation_log (content_type, content_id, moderator_id, action, reason, created_at)
        VALUES ('timeline', ?, ?, ?, ?, ?)
    `).bind(event_id, moderator_id, action, reason, now).run();
}

// ==================== Tribute Functions ====================

/**
 * 创建留言
 */
export async function create_tribute(
    db: D1Database,
    item_id: number,
    content: string,
    user_id: number | null = null,
    author_name: string | null = null
): Promise<number> {
    const now = Date.now();
    const result = await db.prepare(`
        INSERT INTO item_tributes
        (item_id, user_id, author_name, content, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', ?, ?)
    `).bind(item_id, user_id, author_name, content, now, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 获取留言
 */
export async function get_tributes(
    db: D1Database,
    item_id: number,
    include_pending: boolean = false,
    limit: number = 50,
    offset: number = 0
): Promise<ItemTribute[]> {
    let query = `
        SELECT tr.*, u.email as user_email
        FROM item_tributes tr
        LEFT JOIN users u ON tr.user_id = u.id
        WHERE tr.item_id = ?
    `;

    if (!include_pending) {
        query += ` AND tr.status = 'approved'`;
    }

    query += ` ORDER BY tr.created_at DESC LIMIT ? OFFSET ?`;

    const result = await db.prepare(query).bind(item_id, limit, offset).all<ItemTribute>();
    return result.results || [];
}

/**
 * 更新留言
 */
export async function update_tribute(
    db: D1Database,
    tribute_id: number,
    content: string
): Promise<void> {
    const now = Date.now();
    await db.prepare(`
        UPDATE item_tributes
        SET content = ?, updated_at = ?
        WHERE id = ?
    `).bind(content, now, tribute_id).run();
}

/**
 * 删除留言
 */
export async function delete_tribute(
    db: D1Database,
    tribute_id: number
): Promise<void> {
    await db.prepare(`
        DELETE FROM item_tributes WHERE id = ?
    `).bind(tribute_id).run();
}

/**
 * 审核留言
 */
export async function moderate_tribute(
    db: D1Database,
    tribute_id: number,
    moderator_id: number,
    action: 'approve' | 'reject',
    reason: string | null = null
): Promise<void> {
    const now = Date.now();

    await db.prepare(`
        UPDATE item_tributes
        SET status = ?, approved_at = ?, approved_by = ?
        WHERE id = ?
    `).bind(action === 'approve' ? 'approved' : 'rejected', now, moderator_id, tribute_id).run();

    await db.prepare(`
        INSERT INTO item_moderation_log (content_type, content_id, moderator_id, action, reason, created_at)
        VALUES ('tribute', ?, ?, ?, ?, ?)
    `).bind(tribute_id, moderator_id, action, reason, now).run();
}
