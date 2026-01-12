-- Migration: Create players table
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    xp BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    quests_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for wallet address
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);

-- RLS Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public players are viewable by everyone" ON players
    FOR SELECT USING (true);

CREATE POLICY "Players can be created" ON players
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can update own profile" ON players
    FOR UPDATE USING (true);
