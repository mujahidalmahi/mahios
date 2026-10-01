-- =========================================================
-- MahiOS Database Migration
-- Date: 2026-10-01
-- Description: Add updated_at column to terminal_commands table so the trigger does not error
-- =========================================================

ALTER TABLE IF EXISTS terminal_commands 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
