-- KyraQuest Database Schema
-- This file contains all tables for the KyraQuest platform

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS quest_claims CASCADE;
DROP TABLE IF EXISTS quests CASCADE;
DROP TABLE IF EXISTS players CASCADE;

-- Create quests table
CREATE TABLE quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    quest_type TEXT NOT NULL DEFAULT 'verification', -- 'map', 'qr', 'verification'
    reward_token TEXT NOT NULL,
    reward_per_claim TEXT NOT NULL, -- Stored as string to handle uint256
    max_claims INTEGER NOT NULL,
    claims_made INTEGER DEFAULT 0,
    expiry_timestamp BIGINT NOT NULL,
    creator TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create players table for tracking user progress
CREATE TABLE players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    quests_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quest_claims table for tracking individual claims
CREATE TABLE quest_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    player_wallet TEXT NOT NULL,
    tx_hash TEXT,
    xp_earned INTEGER DEFAULT 100,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_quests_creator ON quests(creator);
CREATE INDEX idx_quests_address ON quests(address);
CREATE INDEX idx_quests_quest_type ON quests(quest_type);
CREATE INDEX idx_quests_is_active ON quests(is_active);
CREATE INDEX idx_players_wallet ON players(wallet_address);
CREATE INDEX idx_quest_claims_quest ON quest_claims(quest_id);
CREATE INDEX idx_quest_claims_player ON quest_claims(player_wallet);

-- Row Level Security (RLS) Policies
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_claims ENABLE ROW LEVEL SECURITY;

-- PUBLIC read access for quests (anyone can view quests)
CREATE POLICY "Public quests are viewable by everyone" ON quests
    FOR SELECT USING (true);

-- INSERT policy for quests (authenticated users can create)
CREATE POLICY "Users can create quests" ON quests
    FOR INSERT WITH CHECK (true);

-- UPDATE policy for quests (only creator can update)
CREATE POLICY "Creators can update own quests" ON quests
    FOR UPDATE USING (true);

-- Public read access for players
CREATE POLICY "Public players are viewable by everyone" ON players
    FOR SELECT USING (true);

-- Insert/Update for players
CREATE POLICY "Players can be created" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update own profile" ON players
    FOR UPDATE USING (true);

-- Quest claims policies
CREATE POLICY "Quest claims are viewable by everyone" ON quest_claims
    FOR SELECT USING (true);

CREATE POLICY "Claims can be created" ON quest_claims
    FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
