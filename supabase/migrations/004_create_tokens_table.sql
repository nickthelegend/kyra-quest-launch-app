-- Create tokens table for custom tokens created by merchants
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    decimals INTEGER DEFAULT 18,
    total_supply TEXT NOT NULL,
    image TEXT,
    creator TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS tokens_creator_idx ON tokens(creator);
CREATE INDEX IF NOT EXISTS tokens_address_idx ON tokens(address);

-- Enable RLS
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

-- Anyone can read tokens
CREATE POLICY "Tokens are publicly readable"
    ON tokens FOR SELECT
    USING (true);

-- Only the creator can insert (enforced by app logic since we don't have auth)
CREATE POLICY "Anyone can create tokens"
    ON tokens FOR INSERT
    WITH CHECK (true);
