-- Fix duplicate index on watchlist table
DROP INDEX IF EXISTS public.wishlists_unique_user_item;
