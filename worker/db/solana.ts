/**
 * Solana NFT 映射相关数据库操作
 */

export interface SolanaNftMapping {
    id: number;
    item_id: number;
    mint_address: string | null;
    pool_address: string | null;
    created_at: number;
    updated_at: number;
}

/**
 * 获取 item 的 Solana NFT 映射
 */
export async function get_solana_mapping(
    db: D1Database,
    item_id: number
): Promise<SolanaNftMapping | null> {
    const result = await db.prepare(`
        SELECT * FROM solana_nft_mapping WHERE item_id = ?
    `).bind(item_id).first<SolanaNftMapping>();

    return result || null;
}

/**
 * 创建 Solana NFT 映射
 */
export async function create_solana_mapping(
    db: D1Database,
    item_id: number,
    mint_address: string | null = null,
    pool_address: string | null = null
): Promise<number> {
    const now = Date.now();

    const result = await db.prepare(`
        INSERT INTO solana_nft_mapping (item_id, mint_address, pool_address, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    `).bind(item_id, mint_address, pool_address, now, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 更新 Solana NFT 映射
 */
export async function update_solana_mapping(
    db: D1Database,
    item_id: number,
    mint_address: string | null = null,
    pool_address: string | null = null
): Promise<void> {
    const now = Date.now();

    await db.prepare(`
        UPDATE solana_nft_mapping
        SET mint_address = ?, pool_address = ?, updated_at = ?
        WHERE item_id = ?
    `).bind(mint_address, pool_address, now, item_id).run();
}
