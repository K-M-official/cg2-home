/**
 * 获取待审核内容数量
 */
export async function get_pending_count(
    db: D1Database,
    content_type?: 'gallery' | 'timeline' | 'tribute'
): Promise<{ gallery: number; timeline: number; tribute: number }> {
    const counts = {
        gallery: 0,
        timeline: 0,
        tribute: 0
    };

    if (!content_type || content_type === 'gallery') {
        const galleryResult = await db.prepare(`
            SELECT COUNT(*) as count FROM item_gallery WHERE status = 'pending'
        `).first<{ count: number }>();
        counts.gallery = galleryResult?.count || 0;
    }

    if (!content_type || content_type === 'timeline') {
        const timelineResult = await db.prepare(`
            SELECT COUNT(*) as count FROM item_timeline WHERE status = 'pending'
        `).first<{ count: number }>();
        counts.timeline = timelineResult?.count || 0;
    }

    if (!content_type || content_type === 'tribute') {
        const tributeResult = await db.prepare(`
            SELECT COUNT(*) as count FROM item_tributes WHERE status = 'pending'
        `).first<{ count: number }>();
        counts.tribute = tributeResult?.count || 0;
    }

    return counts;
}

/**
 * 获取审核统计（包括已通过和已拒绝的数量）
 */
export async function get_moderation_stats(
    db: D1Database
): Promise<{ pending: number; approved: number; rejected: number }> {
    const stats = {
        pending: 0,
        approved: 0,
        rejected: 0
    };

    // 统计所有类型的内容
    const tables = ['item_gallery', 'item_timeline', 'item_tributes'];

    for (const table of tables) {
        const result = await db.prepare(`
            SELECT
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM ${table}
        `).first<{ pending: number; approved: number; rejected: number }>();

        if (result) {
            stats.pending += result.pending || 0;
            stats.approved += result.approved || 0;
            stats.rejected += result.rejected || 0;
        }
    }

    return stats;
}

/**
 * 获取待审核内容列表（用于审核面板）
 */
export async function get_moderation_content(
    db: D1Database,
    content_type: 'gallery' | 'timeline' | 'tribute',
    filter: 'all' | 'my_reviews' | 'pending' | 'approved' | 'rejected' | 'my_rejected',
    moderator_id?: number,
    limit: number = 20,
    offset: number = 0
): Promise<any[]> {
    let query = '';
    const bindings: any[] = [];

    switch (content_type) {
        case 'gallery':
            query = `
                SELECT g.*, i.title as item_title, u.email as user_email
                FROM item_gallery g
                LEFT JOIN items i ON g.item_id = i.id
                LEFT JOIN users u ON g.user_id = u.id
            `;
            break;
        case 'timeline':
            query = `
                SELECT t.*, i.title as item_title, u.email as user_email
                FROM item_timeline t
                LEFT JOIN items i ON t.item_id = i.id
                LEFT JOIN users u ON t.user_id = u.id
            `;
            break;
        case 'tribute':
            query = `
                SELECT tr.*, i.title as item_title, u.email as user_email
                FROM item_tributes tr
                LEFT JOIN items i ON tr.item_id = i.id
                LEFT JOIN users u ON tr.user_id = u.id
            `;
            break;
    }

    // 添加筛选条件
    const conditions: string[] = [];

    switch (filter) {
        case 'pending':
            conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.status = 'pending'`);
            break;
        case 'approved':
            conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.status = 'approved'`);
            break;
        case 'rejected':
            conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.status = 'rejected'`);
            break;
        case 'my_reviews':
            if (moderator_id) {
                conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.approved_by = ?`);
                bindings.push(moderator_id);
            }
            break;
        case 'my_rejected':
            if (moderator_id) {
                conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.status = 'rejected'`);
                conditions.push(`${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.approved_by = ?`);
                bindings.push(moderator_id);
            }
            break;
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY ${content_type === 'gallery' ? 'g' : content_type === 'timeline' ? 't' : 'tr'}.created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const result = await db.prepare(query).bind(...bindings).all();
    return result.results || [];
}
