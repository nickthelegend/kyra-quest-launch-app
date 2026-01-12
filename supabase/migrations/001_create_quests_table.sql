-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    reward_token TEXT NOT NULL,
    reward_per_claim TEXT NOT NULL,
    max_claims INTEGER NOT NULL,
    expiry_timestamp BIGINT NOT NULL,
    creator TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quests_creator ON quests(creator);
CREATE INDEX IF NOT EXISTS idx_quests_address ON quests(address);
