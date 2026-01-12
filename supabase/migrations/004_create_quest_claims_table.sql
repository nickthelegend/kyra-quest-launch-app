-- Migration: Create quest_claims table
CREATE TABLE IF NOT EXISTS quest_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    player_wallet TEXT NOT NULL,
    tx_hash TEXT,
    xp_earned INTEGER DEFAULT 100,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quest_claims_quest ON quest_claims(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_claims_player ON quest_claims(player_wallet);

-- RLS Policies
ALTER TABLE quest_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quest claims are viewable by everyone" ON quest_claims
    FOR SELECT USING (true);

CREATE POLICY "Claims can be created" ON quest_claims
    FOR INSERT WITH CHECK (true);
