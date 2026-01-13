-- Add boosting, gating, and referral support
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS boost_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS nft_gate_address TEXT,
ADD COLUMN IF NOT EXISTS proof_type TEXT DEFAULT 'none', -- none, ai_photo, social_post
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add referrals to claims
ALTER TABLE quest_claims
ADD COLUMN IF NOT EXISTS referrer_wallet TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Create referrals table for analytics
CREATE TABLE IF NOT EXISTS referral_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_wallet TEXT NOT NULL,
    total_referrals INTEGER DEFAULT 0,
    total_rewards_earned DECIMAL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_referral_stats_wallet ON referral_stats(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_quest_claims_referrer ON quest_claims(referrer_wallet);
