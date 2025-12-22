/**
 * Cron Job 任务处理
 * 包含两个独立的任务函数：
 * 1. process_pending_execution - 处理待执行的交易
 * 2. process_pending_confirmation - 检查待确认的交易
 */

import {
  get_pending_execution_transactions,
  get_pending_confirmation_transactions,
  ar_execute_transaction,
  check_arweave_transaction_status,
  get_arweave_gateway_url,
  update_arweave_transaction_status
} from './db/wallet';
import { update_gallery_image_url } from './db/content';
import { update_item_cover_image_url } from './db/items';
import type { ArweaveTransaction } from './db/wallet';

/**
 * 任务 1: 处理待执行的 Arweave 交易
 *
 * 功能：
 * - 获取所有 pending_execution 状态的交易
 * - 验证内容和钱包
 * - 检查余额
 * - 提交到 Arweave 网络
 * - 更新交易状态
 */
export async function process_pending_execution(env: Env): Promise<void> {
  console.log('📋 [Task 1] Processing pending execution transactions...');

  try {
    const pendingTransactions = await get_pending_execution_transactions(env.DB, 100);
    console.log(`📋 Found ${pendingTransactions.length} pending execution transactions`);

    if (pendingTransactions.length === 0) {
      console.log('✅ No pending execution transactions to process');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const tx of pendingTransactions) {
      try {
        console.log(`🔄 Processing transaction ${tx.id} (user: ${tx.user_id}, type: ${tx.content_type})`);

        await ar_execute_transaction(env.DB, tx.id, env.R2);

        successCount++;
        console.log(`✅ Transaction ${tx.id} processed successfully`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to process transaction ${tx.id}:`, error);
      }
    }

    console.log(`📊 [Task 1] Execution phase completed: Success: ${successCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('❌ [Task 1] Failed to process pending execution transactions:', error);
    throw error;
  }
}

/**
 * 任务 2: 检查待确认的 Arweave 交易
 *
 * 功能：
 * - 获取所有 pending_confirmation 状态的交易
 * - 查询 Arweave 链上确认状态
 * - 如果已确认，更新交易状态为 confirmed
 * - 如果是图片类型，更新数据库中的 URL 为 Arweave 永久链接
 */
export async function process_pending_confirmation(env: Env): Promise<void> {
  console.log('📋 [Task 2] Checking pending confirmation transactions...');

  try {
    const confirmationTransactions = await get_pending_confirmation_transactions(env.DB, 100);
    console.log(`📋 Found ${confirmationTransactions.length} pending confirmation transactions`);

    if (confirmationTransactions.length === 0) {
      console.log('✅ No pending confirmation transactions to check');
      return;
    }

    let confirmedCount = 0;
    let stillPendingCount = 0;
    let errorCount = 0;

    for (const tx of confirmationTransactions) {
      try {
        if (!tx.tx_id) {
          console.warn(`⚠️ Transaction ${tx.id} has no tx_id, skipping`);
          errorCount++;
          continue;
        }

        console.log(`🔍 Checking confirmation for transaction ${tx.id} (tx_id: ${tx.tx_id})`);

        // 检查链上状态
        const isConfirmed = await check_arweave_transaction_status(tx.tx_id);

        if (isConfirmed) {
          console.log(`✅ Transaction ${tx.id} is confirmed on Arweave`);

          // 更新交易状态为 confirmed
          await update_arweave_transaction_status(env.DB, tx.id, 'confirmed', tx.tx_id, null);

          // 如果是图片类型，更新数据库中的 URL
          if (tx.content_type.startsWith('image/')) {
            await update_image_urls(env.DB, tx);
          }

          confirmedCount++;
        } else {
          console.log(`⏳ Transaction ${tx.id} is still pending confirmation on Arweave`);
          stillPendingCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to check confirmation for transaction ${tx.id}:`, error);
      }
    }

    console.log(`📊 [Task 2] Confirmation phase completed: Confirmed: ${confirmedCount}, Still pending: ${stillPendingCount}, Errors: ${errorCount}`);
  } catch (error) {
    console.error('❌ [Task 2] Failed to check pending confirmation transactions:', error);
    throw error;
  }
}

/**
 * 辅助函数：更新图片 URL
 * 根据交易类型更新对应的数据库记录
 */
async function update_image_urls(db: D1Database, tx: ArweaveTransaction): Promise<void> {
  const arweaveUrl = get_arweave_gateway_url(tx.tx_id as string);

  // 解析 metadata 获取类型信息
  let metadata: any = {};
  if (tx.metadata) {
    try {
      metadata = JSON.parse(tx.metadata);
    } catch (e) {
      console.error(`Failed to parse metadata for tx ${tx.id}:`, e);
      return;
    }
  }

  // 根据类型更新对应的数据库记录
  if (metadata.type === 'gallery_image' && tx.content_reference) {
    // 更新 gallery 图片 URL
    const oldUrl = tx.content_reference.startsWith('http')
      ? tx.content_reference
      : `https://bucket.permane.world/gallery/${tx.content_reference}`;

    await update_gallery_image_url(db, oldUrl, arweaveUrl);
    console.log(`🖼️ Updated gallery image URL: ${oldUrl} -> ${arweaveUrl}`);
  } else if (metadata.type === 'item' && tx.content_reference) {
    // 如果 item 创建时上传了封面图，更新封面图 URL
    try {
      const itemData = JSON.parse(tx.content_reference);
      if (itemData.coverImageUrl) {
        await update_item_cover_image_url(db, itemData.coverImageUrl, arweaveUrl);
        console.log(`🎨 Updated item cover image URL: ${itemData.coverImageUrl} -> ${arweaveUrl}`);
      }
    } catch (e) {
      console.error(`Failed to parse item data for tx ${tx.id}:`, e);
    }
  }
}
