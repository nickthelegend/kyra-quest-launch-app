ALTER TABLE quests ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE quests ADD COLUMN IF NOT EXISTS recurring_interval INTEGER DEFAULT 86400; -- Daily by default (seconds)

-- Add SocialFi Feed and Merchant Shop support
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_wallet TEXT NOT NULL,
    video_url TEXT NOT NULL,
    caption TEXT,
    quest_address TEXT,
    nft_token_id TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS merchant_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_wallet TEXT NOT NULL,
    merchant_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL NOT NULL,
    price_token TEXT NOT NULL, -- KYRA or custom token address
    image_url TEXT,
    stock_count INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_coupons ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies
CREATE POLICY "Public Read Feed" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Users Create Posts" ON feed_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Coupons" ON merchant_coupons FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS merchant_coupon_claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id UUID REFERENCES merchant_coupons(id),
    buyer_wallet TEXT NOT NULL,
    purchase_price DECIMAL NOT NULL,
    purchase_token TEXT NOT NULL,
    redeem_code TEXT NOT NULL,
    is_redeemed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE merchant_coupon_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users Read Own Claims" ON merchant_coupon_claims FOR SELECT USING (true);
CREATE POLICY "Users Create Claims" ON merchant_coupon_claims FOR INSERT WITH CHECK (true);

