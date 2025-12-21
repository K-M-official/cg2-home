import type { UserNotification } from "../types";

/**
 * 创建通知
 */
export async function create_notification(
    db: D1Database,
    user_id: number,
    type: string,
    title: string,
    content: string,
    link: string | null = null,
    metadata: any = null
): Promise<number> {
    const now = Date.now();
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    const result = await db.prepare(`
        INSERT INTO user_notifications (user_id, type, title, content, link, metadata, is_read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).bind(user_id, type, title, content, link, metadataStr, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 获取用户通知列表
 */
export async function get_user_notifications(
    db: D1Database,
    user_id: number,
    unread_only: boolean = false,
    limit: number = 50,
    offset: number = 0
): Promise<UserNotification[]> {
    let query = `
        SELECT * FROM user_notifications
        WHERE user_id = ?
    `;

    if (unread_only) {
        query += ` AND is_read = 0`;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const result = await db.prepare(query).bind(user_id, limit, offset).all<UserNotification>();
    return result.results || [];
}

/**
 * 获取未读通知数量
 */
export async function get_unread_count(
    db: D1Database,
    user_id: number
): Promise<number> {
    const result = await db.prepare(`
        SELECT COUNT(*) as count FROM user_notifications
        WHERE user_id = ? AND is_read = 0
    `).bind(user_id).first<{ count: number }>();

    return result?.count || 0;
}

/**
 * 标记通知为已读
 */
export async function mark_notification_read(
    db: D1Database,
    notification_id: number,
    user_id: number
): Promise<void> {
    const now = Date.now();
    await db.prepare(`
        UPDATE user_notifications
        SET is_read = 1, read_at = ?
        WHERE id = ? AND user_id = ?
    `).bind(now, notification_id, user_id).run();
}

/**
 * 标记所有通知为已读
 */
export async function mark_all_notifications_read(
    db: D1Database,
    user_id: number
): Promise<void> {
    const now = Date.now();
    await db.prepare(`
        UPDATE user_notifications
        SET is_read = 1, read_at = ?
        WHERE user_id = ? AND is_read = 0
    `).bind(now, user_id).run();
}

/**
 * 删除通知
 */
export async function delete_notification(
    db: D1Database,
    notification_id: number,
    user_id: number
): Promise<void> {
    await db.prepare(`
        DELETE FROM user_notifications
        WHERE id = ? AND user_id = ?
    `).bind(notification_id, user_id).run();
}

/**
 * 发送审核结果通知
 */
export async function notify_moderation_result(
    db: D1Database,
    user_id: number,
    content_type: 'gallery' | 'timeline' | 'tribute',
    content_id: number,
    action: 'approve' | 'reject',
    reason: string | null = null
): Promise<void> {
    const typeNames = {
        gallery: 'Gallery Image',
        timeline: 'Timeline Event',
        tribute: 'Tribute Message'
    };

    const title = action === 'approve'
        ? `Your ${typeNames[content_type]} was approved!`
        : `Your ${typeNames[content_type]} was rejected`;

    const content = action === 'approve'
        ? `Your submission has been reviewed and approved. It is now visible to everyone.`
        : `Your submission was rejected. ${reason ? `Reason: ${reason}` : ''}`;

    await create_notification(
        db,
        user_id,
        'moderation_result',
        title,
        content,
        null,
        { content_type, content_id, action, reason }
    );
}
