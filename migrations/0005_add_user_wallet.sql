-- Migration: 0005_add_user_wallet
-- Description: Add user wallet table for balance and Arweave integration
-- Created: 2025-12-21

-- 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    balance REAL NOT NULL DEFAULT 0.0,
    arweave_jwk TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Arweave 上链交易表
CREATE TABLE IF NOT EXISTS arweave_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    arweave_address TEXT NOT NULL,
    tx_id TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending_execution', 'cancelled', 'pending_balance', 'pending_confirmation', 'confirmed', 'error')) DEFAULT 'pending_execution',
    content_type TEXT NOT NULL,
    content_reference TEXT,
    metadata TEXT,
    data_size INTEGER,
    fee_amount REAL,
    error_message TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    confirmed_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_arweave_transactions_user_id ON arweave_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_arweave_transactions_tx_id ON arweave_transactions(tx_id);
CREATE INDEX IF NOT EXISTS idx_arweave_transactions_status ON arweave_transactions(status);
CREATE INDEX IF NOT EXISTS idx_arweave_transactions_created_at ON arweave_transactions(created_at DESC);



