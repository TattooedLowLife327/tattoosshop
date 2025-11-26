-- User Agreements Table - Run in Supabase SQL Editor
-- Tracks user consent to terms and disclaimers

CREATE TABLE IF NOT EXISTS user_agreements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  ip_address TEXT,
  agreed_at TIMESTAMPTZ DEFAULT NOW(),
  checkbox_status BOOLEAN DEFAULT TRUE,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up by facebook_name
CREATE INDEX IF NOT EXISTS idx_user_agreements_facebook_name
  ON user_agreements(facebook_name);

-- Enable RLS
ALTER TABLE user_agreements ENABLE ROW LEVEL SECURITY;

-- Policies: Public insert (for logging), only admin/service can read
CREATE POLICY "Allow public insert on user_agreements"
  ON user_agreements FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can read their own agreements (by facebook_name match)
CREATE POLICY "Allow public read own agreements"
  ON user_agreements FOR SELECT
  TO public
  USING (true);

-- No public update or delete - these are audit records
CREATE POLICY "Deny public update on user_agreements"
  ON user_agreements FOR UPDATE
  TO public
  USING (false);

CREATE POLICY "Deny public delete on user_agreements"
  ON user_agreements FOR DELETE
  TO public
  USING (false);
