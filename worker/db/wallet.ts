/**
 * 用户钱包相关数据库操作
 */

import Arweave from "arweave";
import type { JWKInterface } from "arweave/web/lib/wallet";

const arweave = new Arweave({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
});

export interface UserWallet {
    id: number;
    user_id: number;
    balance: number;
    arweave_jwk: string | null;
    created_at: number;
    updated_at: number;
}

export interface ArweaveTransaction {
    id: number;
    user_id: number;
    arweave_address: string;
    tx_id: string | null;
    status: 'pending_execution' | 'cancelled' | 'pending_balance' | 'pending_confirmation' | 'confirmed' | 'error';
    content_type: string;
    content_reference: string | null;
    metadata: string | null;
    data_size: number | null;
    fee_amount: number | null;
    error_message: string | null;
    created_at: number;
    updated_at: number;
    confirmed_at: number | null;
}

/**
 * 生成 Arweave JWK (JSON Web Key)
 */
async function generateArweaveJWK(): Promise<JWKInterface> {
    const jwk = await arweave.wallets.generate();
    return jwk;
}

/**
 * 从 JWK 计算 Arweave 公钥地址
 */
async function getArweaveAddress(jwk: JWKInterface): Promise<string> {
    const address = await arweave.wallets.jwkToAddress(jwk);
    return address;
}

/**
 * 获取用户钱包
 */
export async function get_user_wallet(
    db: D1Database,
    user_id: number
): Promise<UserWallet | null> {
    const result = await db.prepare(`
        SELECT * FROM user_wallets WHERE user_id = ?
    `).bind(user_id).first<UserWallet>();

    return result || null;
}

/**
 * 创建用户钱包
 */
export async function create_user_wallet(
    db: D1Database,
    user_id: number
): Promise<UserWallet> {
    const now = Date.now();

    // 生成 Arweave JWK
    const arweave_jwk = await generateArweaveJWK();

    await db.prepare(`
        INSERT INTO user_wallets (user_id, balance, arweave_jwk, created_at, updated_at)
        VALUES (?, 0.0, ?, ?, ?)
    `).bind(user_id, JSON.stringify(arweave_jwk), now, now).run();

    const wallet = await get_user_wallet(db, user_id);
    if (!wallet) {
        throw new Error('Failed to create wallet');
    }

    return wallet;
}

/**
 * 获取或创建用户钱包
 */
export async function get_or_create_wallet(
    db: D1Database,
    user_id: number
): Promise<UserWallet> {
    let wallet = await get_user_wallet(db, user_id);

    if (!wallet) {
        wallet = await create_user_wallet(db, user_id);
    }

    return wallet;
}

/**
 * 更新钱包余额
 */
export async function update_wallet_balance(
    db: D1Database,
    user_id: number,
    new_balance: number
): Promise<void> {
    const now = Date.now();

    await db.prepare(`
        UPDATE user_wallets
        SET balance = ?, updated_at = ?
        WHERE user_id = ?
    `).bind(new_balance, now, user_id).run();
}

/**
 * 获取 Arweave 钱包余额（从链上查询）
 */
export async function get_arweave_balance(
    jwk: JWKInterface
): Promise<number> {
    const address = await arweave.wallets.jwkToAddress(jwk);
    const winstonBalance = await arweave.wallets.getBalance(address);
    // 将 Winston 转换为 AR (1 AR = 1e12 Winston)
    const arBalance = parseFloat(arweave.ar.winstonToAr(winstonBalance));
    return arBalance;
}

/**
 * 获取 Arweave 公钥地址
 */
export async function get_arweave_address_from_wallet(
    wallet: UserWallet
): Promise<string> {
    if (!wallet.arweave_jwk) {
        return '';
    }
    return await getArweaveAddress(JSON.parse(wallet.arweave_jwk) as JWKInterface);
}

// ==================== Arweave 交易表操作 ====================

/**
 * 创建 Arweave 交易记录
 */
export async function create_arweave_transaction(
    db: D1Database,
    user_id: number,
    arweave_address: string,
    content_type: string,
    content_reference: string | null = null,
    metadata: any = null,
    data_size: number | null = null,
    fee_amount: number | null = null
): Promise<number> {
    const now = Date.now();

    const result = await db.prepare(`
        INSERT INTO arweave_transactions
        (user_id, arweave_address, status, content_type, content_reference, metadata, data_size, fee_amount, created_at, updated_at)
        VALUES (?, ?, 'pending_execution', ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        user_id,
        arweave_address,
        content_type,
        content_reference,
        metadata ? JSON.stringify(metadata) : null,
        data_size,
        fee_amount,
        now,
        now
    ).run();

    return result.meta.last_row_id as number;
}

/**
 * 更新 Arweave 交易状态
 */
export async function update_arweave_transaction_status(
    db: D1Database,
    transaction_id: number,
    status: 'pending_execution' | 'cancelled' | 'pending_balance' | 'pending_confirmation' | 'confirmed' | 'error',
    tx_id: string | null = null,
    error_message: string | null = null
): Promise<void> {
    const now = Date.now();
    const confirmed_at = status === 'confirmed' ? now : null;

    await db.prepare(`
        UPDATE arweave_transactions
        SET status = ?, tx_id = ?, error_message = ?, updated_at = ?, confirmed_at = ?
        WHERE id = ?
    `).bind(status, tx_id, error_message, now, confirmed_at, transaction_id).run();
}

/**
 * 获取用户的 Arweave 交易记录
 */
export async function get_user_arweave_transactions(
    db: D1Database,
    user_id: number,
    status: string | null = null,
    limit: number = 50,
    offset: number = 0
): Promise<ArweaveTransaction[]> {
    let query = `
        SELECT * FROM arweave_transactions
        WHERE user_id = ?
    `;

    const bindings: any[] = [user_id];

    if (status) {
        query += ` AND status = ?`;
        bindings.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    bindings.push(limit, offset);

    const result = await db.prepare(query).bind(...bindings).all<ArweaveTransaction>();

    return result.results || [];
}

/**
 * 根据 ID 获取 Arweave 交易
 */
export async function get_arweave_transaction_by_id(
    db: D1Database,
    transaction_id: number
): Promise<ArweaveTransaction | null> {
    const result = await db.prepare(`
        SELECT * FROM arweave_transactions WHERE id = ?
    `).bind(transaction_id).first<ArweaveTransaction>();

    return result || null;
}

/**
 * 根据 tx_id 获取 Arweave 交易
 */
export async function get_arweave_transaction_by_txid(
    db: D1Database,
    tx_id: string
): Promise<ArweaveTransaction | null> {
    const result = await db.prepare(`
        SELECT * FROM arweave_transactions WHERE tx_id = ?
    `).bind(tx_id).first<ArweaveTransaction>();

    return result || null;
}

/**
 * 获取待处理的 Arweave 交易（需要余额的）
 */
export async function get_pending_balance_transactions(
    db: D1Database,
    limit: number = 100
): Promise<ArweaveTransaction[]> {
    const result = await db.prepare(`
        SELECT * FROM arweave_transactions
        WHERE status = 'pending_balance'
        ORDER BY created_at ASC
        LIMIT ?
    `).bind(limit).all<ArweaveTransaction>();

    return result.results || [];
}

/**
 * 获取待执行的 Arweave 交易（Cron Job 使用）
 */
export async function get_pending_execution_transactions(
    db: D1Database,
    limit: number = 100
): Promise<ArweaveTransaction[]> {
    const result = await db.prepare(`
        SELECT * FROM arweave_transactions
        WHERE status = 'pending_execution'
        ORDER BY created_at ASC
        LIMIT ?
    `).bind(limit).all<ArweaveTransaction>();

    return result.results || [];
}

/**
 * 获取待确认的 Arweave 交易
 */
export async function get_pending_confirmation_transactions(
    db: D1Database,
    limit: number = 100
): Promise<ArweaveTransaction[]> {
    const result = await db.prepare(`
        SELECT * FROM arweave_transactions
        WHERE status = 'pending_confirmation'
        ORDER BY created_at ASC
        LIMIT ?
    `).bind(limit).all<ArweaveTransaction>();

    return result.results || [];
}

/**
 * 删除 Arweave 交易记录
 */
export async function delete_arweave_transaction(
    db: D1Database,
    transaction_id: number
): Promise<void> {
    await db.prepare(`
        DELETE FROM arweave_transactions WHERE id = ?
    `).bind(transaction_id).run();
}

// ==================== Arweave 交易执行 ====================

/**
 * 执行 Arweave 交易
 * 1. 验证交易状态和内容
 * 2. 检查钱包余额是否足够
 * 3. 如果余额不足，创建转账交易并设置为 pending_balance
 * 4. 如果余额足够，提交到 Arweave 并设置为 pending_confirmation
 * 5. 如果执行错误，设置为 error 状态并记录错误信息
 */
export async function ar_execute_transaction(
    db: D1Database,
    transaction_id: number,
    r2Bucket?: R2Bucket
): Promise<void> {
    try {
        // 1. 获取交易记录
        const transaction = await get_arweave_transaction_by_id(db, transaction_id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // 验证交易状态
        if (transaction.status !== 'pending_execution') {
            throw new Error(`Transaction is not pending execution, current status: ${transaction.status}`);
        }

        // 2. 获取用户钱包
        const wallet = await get_user_wallet(db, transaction.user_id);
        if (!wallet || !wallet.arweave_jwk) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                null,
                'User wallet not found or JWK missing'
            );
            return;
        }

        const jwk = JSON.parse(wallet.arweave_jwk) as JWKInterface;

        // 3. 验证上传内容
        let contentData: string | Uint8Array;
        let contentType: string = transaction.content_type;

        if (!transaction.content_reference) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                null,
                'Content reference is missing'
            );
            return;
        }

        // 根据 content_type 获取内容
        if (r2Bucket && (contentType.startsWith('image/') || contentType.startsWith('video/') || contentType === 'application/octet-stream')) {
            // 从 R2 获取二进制内容
            try {
                const r2Object = await r2Bucket.get(transaction.content_reference);
                if (!r2Object) {
                    await update_arweave_transaction_status(
                        db,
                        transaction_id,
                        'error',
                        null,
                        `Content not found in R2: ${transaction.content_reference}`
                    );
                    return;
                }
                contentData = new Uint8Array(await r2Object.arrayBuffer());
            } catch (error) {
                await update_arweave_transaction_status(
                    db,
                    transaction_id,
                    'error',
                    null,
                    `Failed to fetch content from R2: ${String(error)}`
                );
                return;
            }
        } else {
            // 文本内容直接使用 content_reference
            contentData = transaction.content_reference;
        }

        // 4. 创建 Arweave 交易
        let arTx;
        try {
            arTx = await arweave.createTransaction({
                data: contentData
            }, jwk);

            // 添加标签
            arTx.addTag('Content-Type', contentType);
            if (transaction.metadata) {
                try {
                    const metadata = JSON.parse(transaction.metadata);
                    for (const [key, value] of Object.entries(metadata)) {
                        arTx.addTag(key, String(value));
                    }
                } catch (e) {
                    console.warn('Failed to parse metadata:', e);
                }
            }

            // 签名交易
            await arweave.transactions.sign(arTx, jwk);
        } catch (error) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                null,
                `Failed to create Arweave transaction: ${String(error)}`
            );
            return;
        }

        // 5. 检查钱包余额
        const requiredAR = parseFloat(arweave.ar.winstonToAr(arTx.reward));
        let currentBalance: number;

        try {
            currentBalance = await get_arweave_balance(jwk);
        } catch (error) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                null,
                `Failed to check wallet balance: ${String(error)}`
            );
            return;
        }

        // 6. 余额不足，设置为 pending_balance
        if (currentBalance < requiredAR) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'pending_balance',
                arTx.id,
                `Insufficient balance. Required: ${requiredAR.toFixed(6)} AR, Current: ${currentBalance.toFixed(6)} AR`
            );
            return;
        }

        // 7. 余额足够，提交交易到 Arweave
        try {
            const response = await arweave.transactions.post(arTx);

            if (response.status === 200) {
                // 提交成功，设置为 pending_confirmation
                await update_arweave_transaction_status(
                    db,
                    transaction_id,
                    'pending_confirmation',
                    arTx.id,
                    null
                );
            } else {
                // 提交失败
                await update_arweave_transaction_status(
                    db,
                    transaction_id,
                    'error',
                    arTx.id,
                    `Failed to post transaction to Arweave: HTTP ${response.status} - ${response.statusText}`
                );
            }
        } catch (error) {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                arTx.id,
                `Failed to post transaction to Arweave: ${String(error)}`
            );
        }
    } catch (error) {
        // 捕获所有未处理的错误
        try {
            await update_arweave_transaction_status(
                db,
                transaction_id,
                'error',
                null,
                `Unexpected error: ${String(error)}`
            );
        } catch (updateError) {
            console.error('Failed to update transaction status:', updateError);
        }
        throw error;
    }
}

// ==================== Arweave 交易确认检查 ====================

/**
 * 检查 Arweave 交易是否已确认
 * 通过 Arweave 网关查询交易状态
 */
export async function check_arweave_transaction_status(
    tx_id: string
): Promise<boolean> {
    try {
        const response = await arweave.transactions.getStatus(tx_id);

        // 如果交易已确认（有区块确认数）
        if (response.confirmed && response.confirmed.number_of_confirmations > 0) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Failed to check transaction status for ${tx_id}:`, error);
        return false;
    }
}

/**
 * 获取 Arweave 网关 URL
 */
export function get_arweave_gateway_url(tx_id: string): string {
    return `https://arweave.net/${tx_id}`;
}
