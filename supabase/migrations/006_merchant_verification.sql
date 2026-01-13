-- Add is_verified to quests table (to flag quests from verified merchants)
ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_verified_merchant BOOLEAN DEFAULT false;

-- Create merchants table if it doesn't exist to store profile verification
CREATE TABLE IF NOT EXISTS merchant_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    business_name TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for wallet
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_wallet ON merchant_profiles(wallet_address);

-- RLS
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Merchant profiles are viewable by everyone" ON merchant_profiles FOR SELECT USING (true);
CREATE POLICY "Merchants can update own profile" ON merchant_profiles FOR UPDATE USING (true);
