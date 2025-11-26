-- Phase 2 Migration - Run in Supabase SQL Editor
-- Adds new columns to inventory and creates wishlists table

-- Add new columns to inventory table
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wishlist_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cart_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS counter_price NUMERIC,
  ADD COLUMN IF NOT EXISTS pending_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS listed_at TIMESTAMPTZ DEFAULT NOW();

-- Set listed_at for existing items to their created_at date
UPDATE inventory SET listed_at = created_at WHERE listed_at IS NULL;

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facebook_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notified_counter BOOLEAN DEFAULT FALSE,
  notified_sold BOOLEAN DEFAULT FALSE
);

-- Create unique constraint so same person can't wishlist same item twice
CREATE UNIQUE INDEX IF NOT EXISTS wishlists_unique_user_item
  ON wishlists(facebook_name, item_id);

-- Enable RLS on wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Wishlists policies: Public read/write (simple setup, no auth)
CREATE POLICY "Allow public read on wishlists"
  ON wishlists FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on wishlists"
  ON wishlists FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on wishlists"
  ON wishlists FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on wishlists"
  ON wishlists FOR DELETE
  TO public
  USING (true);

-- Function to update wishlist_count on inventory when wishlists change
CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE inventory SET wishlist_count = wishlist_count + 1 WHERE id = NEW.item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inventory SET wishlist_count = wishlist_count - 1 WHERE id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update wishlist_count
DROP TRIGGER IF EXISTS update_inventory_wishlist_count ON wishlists;
CREATE TRIGGER update_inventory_wishlist_count
  AFTER INSERT OR DELETE ON wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_count();

-- Enable realtime for inventory and wishlists
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE wishlists;
