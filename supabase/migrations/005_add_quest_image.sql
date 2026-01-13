-- Add image_url to quests table
ALTER TABLE quests ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update RLS if needed (usually columns don't need separate RLS unless restricted)
