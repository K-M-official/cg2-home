-- Migration: initial schema for heat records
-- Create table
CREATE TABLE IF NOT EXISTS heat_records (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	target_id TEXT NOT NULL,
	delta INTEGER NOT NULL,         -- 增量，正数表示增加，负数表示减少 
	created_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_heat_records_target ON heat_records(target_id);
CREATE INDEX IF NOT EXISTS idx_heat_records_created_at ON heat_records(created_at);


  