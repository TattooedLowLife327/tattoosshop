-- Linter Fixes - Run in Supabase SQL Editor
-- Fixes security and performance warnings from Supabase linter

-- ============================================================
-- FIX 1: Function search_path security
-- Prevents search_path injection attacks
-- ============================================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_wishlist_count function
CREATE OR REPLACE FUNCTION update_wishlist_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inventory SET wishlist_count = wishlist_count + 1 WHERE id = NEW.item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.inventory SET wishlist_count = wishlist_count - 1 WHERE id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- ============================================================
-- FIX 2: Add indexes for foreign keys (performance)
-- ============================================================

-- Index on inventory.claimed_by
CREATE INDEX IF NOT EXISTS idx_inventory_claimed_by
  ON inventory(claimed_by);

-- Index on wishlists.item_id
CREATE INDEX IF NOT EXISTS idx_wishlists_item_id
  ON wishlists(item_id);

-- ============================================================
-- NOTE: The unused_index warning for idx_user_agreements_facebook_name
-- is expected - it will be used once you have user agreement data
-- and start querying by facebook_name. No action needed.
-- ============================================================
