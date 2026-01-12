-- Create quests table
CREATE TABLE quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    reward_token TEXT NOT NULL,
    reward_per_claim TEXT NOT NULL, -- Stored as string to handle uint256
    max_claims INTEGER NOT NULL,
    expiry_timestamp BIGINT NOT NULL,
    creator TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for creator address
CREATE INDEX idx_quests_creator ON quests(creator);

-- Index for contract address
CREATE INDEX idx_quests_address ON quests(address);
