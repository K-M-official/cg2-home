import type { UserRole } from "../types";

/**
 * 授予用户角色
 */
export async function grant_user_role(
    db: D1Database,
    user_id: number,
    role: string,
    granted_by: number | null = null,
    expires_at: number | null = null
): Promise<number> {
    const now = Date.now();

    // 检查是否已有该角色
    const existing = await db.prepare(`
        SELECT id FROM user_roles WHERE user_id = ? AND role = ?
    `).bind(user_id, role).first();

    if (existing) {
        // 更新过期时间
        await db.prepare(`
            UPDATE user_roles SET expires_at = ?, granted_at = ? WHERE id = ?
        `).bind(expires_at, now, existing.id).run();
        return existing.id as number;
    }

    const result = await db.prepare(`
        INSERT INTO user_roles (user_id, role, granted_by, granted_at, expires_at)
        VALUES (?, ?, ?, ?, ?)
    `).bind(user_id, role, granted_by, now, expires_at).run();

    return result.meta.last_row_id as number;
}

/**
 * 撤销用户角色
 */
export async function revoke_user_role(
    db: D1Database,
    user_id: number,
    role: string
): Promise<void> {
    await db.prepare(`
        DELETE FROM user_roles WHERE user_id = ? AND role = ?
    `).bind(user_id, role).run();
}

/**
 * 获取用户的所有角色
 */
export async function get_user_roles(
    db: D1Database,
    user_id: number
): Promise<string[]> {
    const now = Date.now();
    const result = await db.prepare(`
        SELECT role FROM user_roles
        WHERE user_id = ?
        AND (expires_at IS NULL OR expires_at > ?)
    `).bind(user_id, now).all<{ role: string }>();

    return (result.results || []).map(r => r.role);
}

/**
 * 检查用户是否有特定角色
 */
export async function user_has_role(
    db: D1Database,
    user_id: number,
    role: string
): Promise<boolean> {
    const now = Date.now();
    const result = await db.prepare(`
        SELECT id FROM user_roles
        WHERE user_id = ? AND role = ?
        AND (expires_at IS NULL OR expires_at > ?)
    `).bind(user_id, role, now).first();

    return !!result;
}

/**
 * 检查用户是否有任意一个角色
 */
export async function user_has_any_role(
    db: D1Database,
    user_id: number,
    roles: string[]
): Promise<boolean> {
    const now = Date.now();
    const placeholders = roles.map(() => '?').join(',');
    const result = await db.prepare(`
        SELECT id FROM user_roles
        WHERE user_id = ? AND role IN (${placeholders})
        AND (expires_at IS NULL OR expires_at > ?)
        LIMIT 1
    `).bind(user_id, ...roles, now).first();

    return !!result;
}
