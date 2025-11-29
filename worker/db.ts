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
 * 获取指定 group 的所有 items
 */
export async function get_items(db: D1Database, group_id: number): Promise<Item[]> {
    const items = await db.prepare(`
        SELECT * FROM items
        WHERE group_id = ?
        ORDER BY created_at DESC
    `).bind(group_id).all<Item>();
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

    const rows = await db.prepare(`
        SELECT id, item_id, delta, created_at, expired_at
        FROM item_heat_record_windows
        WHERE item_id = ? AND created_at >= ?
        ORDER BY created_at ASC
    `).bind(item_id, since).all<ItemHeatRecordWindow>();

    const windows = rows.results ?? [];

    const M = computeWeightedWindowSum(t, span, windows, now);
    const P = computeScoreFromM(M);

    return { M, P };
}
