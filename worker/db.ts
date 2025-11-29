import type { Item, ItemGroup, ItemHeatRecordWindow } from "./types";
import { computeWeightedWindowSum, computeScoreFromM } from "./algorithm";

/**
 * 获取所有 item groups
 */
export async function get_groups(db: D1Database): Promise<ItemGroup[]> {
    const groups = await db.prepare(`
        SELECT * FROM item_groups
        ORDER BY created_at DESC
    `).all<ItemGroup>();
    return groups.results;
}

/**
 * 获取 items
 * 如果 group_id 为 null，则获取所有 items
 * 否则获取指定 group 的 items
 */
export async function get_items(db: D1Database, group_id: number | null = null): Promise<Item[]> {
    let query = `SELECT * FROM items`;
    const params: any[] = [];
    
    if (group_id !== null) {
        query += ` WHERE group_id = ?`;
        params.push(group_id);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const stmt = db.prepare(query).bind(...params);
    const items = await stmt.all<Item>();
    
    return items.results;
}

/**
 * 增加某个 item 的滑动窗口计数
 * 如果没有有效窗口，则创建一个新窗口（1分钟）
 */
export async function increment_item_window(
    db: D1Database, 
    item_id: number, 
    delta: number = 1
): Promise<void> {
    const now = Date.now();
    const windowDuration = 60 * 1000; // 1分钟
    
    // 查找当前有效的窗口（expired_at > now）
    const activeWindow = await db.prepare(`
        SELECT * FROM item_heat_record_windows
        WHERE item_id = ? AND expired_at > ?
        ORDER BY expired_at DESC
        LIMIT 1
    `).bind(item_id, now).first<ItemHeatRecordWindow>();
    
    if (activeWindow) {
        // 更新现有窗口
        await db.prepare(`
            UPDATE item_heat_record_windows
            SET delta = delta + ?
            WHERE id = ?
        `).bind(delta, activeWindow.id).run();
    } else {
        // 创建新窗口
        const created_at = now;
        const expired_at = now + windowDuration;
        
        await db.prepare(`
            INSERT INTO item_heat_record_windows (item_id, delta, created_at, expired_at)
            VALUES (?, ?, ?, ?)
        `).bind(item_id, delta, created_at, expired_at).run();
    }
}

/**
 * 更新 item 的 misc 字段中的 gongpin 数据
 * misc: { gongpin: { "candle": 10, "flower": 5 } }
 */
export async function update_item_misc_gongpin(
    db: D1Database, 
    itemId: number, 
    tributeId: string, 
    count: number = 1
): Promise<void> {
    // 1. Get current misc
    const item = await db.prepare('SELECT misc FROM items WHERE id = ?').bind(itemId).first<{ misc: string }>();
    if (!item) return; // Item not found

    let misc: any = {};
    try {
        misc = item.misc ? JSON.parse(item.misc) : {};
    } catch (e) {
        misc = {};
    }

    // 2. Update gongpin map
    if (!misc.gongpin) {
        misc.gongpin = {};
    }
    
    // Initialize if not exists
    if (!misc.gongpin[tributeId]) {
        misc.gongpin[tributeId] = 0;
    }

    misc.gongpin[tributeId] += count;

    // 3. Save back
    await db.prepare('UPDATE items SET misc = ? WHERE id = ?').bind(JSON.stringify(misc), itemId).run();
}

/**
 * 获取指定时间范围内的窗口统计
 */
export async function get_window_stats(
    db: D1Database,
    item_id: number,
    duration_ms: number
): Promise<number> {
    const now = Date.now();
    const since = now - duration_ms;
    
    // 统计在时间范围内创建的窗口的总和
    const result = await db.prepare(`
        SELECT COALESCE(SUM(delta), 0) as total
        FROM item_heat_record_windows
        WHERE item_id = ? AND created_at >= ?
    `).bind(item_id, since).first<{ total: number }>();
    
    return result?.total ?? 0;
}

/**
 * 获取 item 的完整信息及各时间维度的统计
 */
export async function get_item_with_stats(
    db: D1Database,
    item_id: number
): Promise<{
    item: Item | null;
    stats: {
        '1min': number;
        '15min': number;
        '1hour': number;
        '24hour': number;
    }
}> {
    // 获取 item 信息
    const item = await db.prepare(`
        SELECT * FROM items WHERE id = ?
    `).bind(item_id).first<Item>();
    
    // 获取各时间维度的统计
    const stats = {
        '1min': await get_window_stats(db, item_id, 1 * 60 * 1000),      // 1分钟
        '15min': await get_window_stats(db, item_id, 15 * 60 * 1000),    // 15分钟
        '1hour': await get_window_stats(db, item_id, 60 * 60 * 1000),    // 1小时
        '24hour': await get_window_stats(db, item_id, 24 * 60 * 60 * 1000) // 24小时
    };
    
    return { item, stats };
}

/**
 * 获取某个 item 在以「当前时间减去整一天」为中点时的加权窗口和 M 以及对应的 P
 *
 * 定义：
 * - now: 当前时间
 * - t = now - 24h
 * - span = 24h
 * - M = computeWeightedWindowSum(t, span, windows)
 * - P = computeScoreFromM(M)
 *
 * 为了避免扫描过多历史数据，这里只查询最近 48 小时的窗口。
 * 如果没有任何窗口数据，会自动初始化一个窗口。
 */
export async function get_item_algorithm_metrics(
    db: D1Database,
    item_id: number,
): Promise<{ M: number; P: number }> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const span = oneDayMs;
    const t = now - oneDayMs;
    const since = now - 2 * oneDayMs; // 只取最近 48 小时的窗口

    let rows = await db.prepare(`
        SELECT id, item_id, delta, created_at, expired_at
        FROM item_heat_record_windows
        WHERE item_id = ? AND created_at >= ?
        ORDER BY created_at ASC
    `).bind(item_id, since).all<ItemHeatRecordWindow>();

    let windows = rows.results ?? [];

    // 如果没有任何窗口数据，创建一个初始窗口
    if (windows.length === 0) {
        // 暂时注释掉写操作来调试 500 错误
        await increment_item_window(db, item_id, 1);
        
        // 重新查询
        rows = await db.prepare(`
            SELECT id, item_id, delta, created_at, expired_at
            FROM item_heat_record_windows
            WHERE item_id = ? AND created_at >= ?
            ORDER BY created_at ASC
        `).bind(item_id, since).all<ItemHeatRecordWindow>();
        
        windows = rows.results ?? [];
    }

    const M = computeWeightedWindowSum(t, span, windows, now);
    const P = computeScoreFromM(M);

    return { M, P };
}

/**
 * 获取每周排行榜（Top Remembered）
 * 返回 items 及其热度分数
 */
export async function get_leaderboard(
    db: D1Database,
    limit: number = 10
): Promise<Array<{
    rank: number;
    item: Item;
    pomScore: number;
    raw: number;
    change: 'up' | 'down' | 'same';
}>> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const since = now - oneDayMs; // 过去 24 小时

    /**
     * SQL 逻辑：
     * 1. 左连接 items 和 windows
     * 2. 仅关联最近 24 小时的 windows 数据
     * 3. 求和 delta 作为原始分数 (raw)
     */
    const query = `
        SELECT 
            i.*,
            COALESCE(SUM(w.delta), 0) as rawScore
        FROM items i
        LEFT JOIN item_heat_record_windows w 
            ON i.id = w.item_id 
            AND w.created_at >= ?
        GROUP BY i.id
        ORDER BY rawScore DESC
        LIMIT ?
    `;

    try {
        const results = await db.prepare(query)
            .bind(since, limit)
            .all<Item & { rawScore: number }>();
            
        if (!results.results) return [];

        return results.results.map((row, index) => {
            const { rawScore, ...item } = row;
            
            // 在应用层计算 POM 分数
            // 目前逻辑简单：POM = RAW
            // 未来可以在这里添加更复杂的应用层计算逻辑，例如：
            // const pomScore = Math.log(rawScore + 1) * 10; 
            const pomScore = rawScore;

            return {
                rank: index + 1,
                item: item as Item,
                pomScore: pomScore,
                raw: rawScore,
                change: 'same' as const,
            };
        });

    } catch (error) {
        console.error('[get_leaderboard] SQL execution error:', error);
        throw error;
    }
}