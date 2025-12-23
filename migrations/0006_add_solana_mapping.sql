-- Migration: 0006_add_solana_mapping
-- Description: Add Solana NFT mapping table for items
-- Created: 2025-12-23

-- Solana NFT 映射表
-- 每个 item 可以关联一个 Solana NFT mint 地址和 pool 地址
CREATE TABLE IF NOT EXISTS solana_nft_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL UNIQUE,
    mint_address TEXT,
    pool_address TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_solana_nft_mapping_item_id ON solana_nft_mapping(item_id);
CREATE INDEX IF NOT EXISTS idx_solana_nft_mapping_mint_address ON solana_nft_mapping(mint_address);
