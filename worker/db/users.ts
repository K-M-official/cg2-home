import type { User, EmailVerificationCode } from "../types";

/**
 * 根据邮箱获取用户
 */
export async function get_user_by_email(db: D1Database, email: string): Promise<User | null> {
    return await db.prepare(`
        SELECT * FROM users WHERE email = ?
    `).bind(email).first<User>();
}

/**
 * 根据ID获取用户
 */
export async function get_user_by_id(db: D1Database, id: number): Promise<User | null> {
    return await db.prepare(`
        SELECT * FROM users WHERE id = ?
    `).bind(id).first<User>();
}

/**
 * 创建新用户
 */
export async function create_user(
    db: D1Database,
    email: string,
    password_hash: string
): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.prepare(`
        INSERT INTO users (email, password_hash, created_at, updated_at)
        VALUES (?, ?, ?, ?)
    `).bind(email, password_hash, now, now).run();

    return result.meta.last_row_id as number;
}

/**
 * 更新用户密码
 */
export async function update_user_password(
    db: D1Database,
    user_id: number,
    password_hash: string
): Promise<void> {
    const now = new Date().toISOString();
    await db.prepare(`
        UPDATE users
        SET password_hash = ?, updated_at = ?
        WHERE id = ?
    `).bind(password_hash, now, user_id).run();
}

/**
 * 创建邮箱验证码
 */
export async function create_email_verification_code(
    db: D1Database,
    email: string,
    code: string,
    expires_at: number
): Promise<void> {
    const now = Date.now();
    await db.prepare(`
        INSERT INTO email_verification_codes (email, code, expires_at, created_at)
        VALUES (?, ?, ?, ?)
    `).bind(email, code, expires_at, now).run();
}

/**
 * 验证邮箱验证码
 */
export async function verify_email_code(
    db: D1Database,
    email: string,
    code: string
): Promise<boolean> {
    const now = Date.now();
    const record = await db.prepare(`
        SELECT * FROM email_verification_codes
        WHERE email = ? AND code = ? AND expires_at > ?
        ORDER BY created_at DESC
        LIMIT 1
    `).bind(email, code, now).first<EmailVerificationCode>();

    return !!record;
}

/**
 * 删除邮箱的验证码
 */
export async function delete_email_verification_codes(
    db: D1Database,
    email: string
): Promise<void> {
    await db.prepare(`
        DELETE FROM email_verification_codes WHERE email = ?
    `).bind(email).run();
}
