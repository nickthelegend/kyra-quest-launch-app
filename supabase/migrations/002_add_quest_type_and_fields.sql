-- Migration: Add quest_type and additional fields to quests table
-- Run this if you already have the basic quests table

-- Add new columns if they don't exist
ALTER TABLE quests ADD COLUMN IF NOT EXISTS quest_type TEXT DEFAULT 'verification';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS claims_made INTEGER DEFAULT 0;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE quests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create index for quest_type
CREATE INDEX IF NOT EXISTS idx_quests_quest_type ON quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_quests_is_active ON quests(is_active);
