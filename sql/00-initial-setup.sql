-- Run this SQL in your Supabase SQL Editor
-- STEP 1: Create tables (orders first since inventory references it)

-- Create orders table FIRST
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  items UUID[] NOT NULL DEFAULT '{}',
  facebook_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('venmo', 'paypal', 'chime')),
  payment_handle TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table (references orders)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('barrel', 'flight', 'shaft', 'tip')),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  weight NUMERIC DEFAULT 0,
  condition TEXT DEFAULT 'new' CHECK (condition IN ('new', 'like new', 'good', 'fair', 'poor')),
  price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold')),
  claimed_by UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to inventory
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 3: Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- STEP 4: RLS Policies for inventory
CREATE POLICY "Allow public read access on inventory"
  ON inventory FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on inventory"
  ON inventory FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on inventory"
  ON inventory FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on inventory"
  ON inventory FOR DELETE
  TO public
  USING (true);

-- STEP 5: RLS Policies for orders
CREATE POLICY "Allow public read access on orders"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on orders"
  ON orders FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete on orders"
  ON orders FOR DELETE
  TO public
  USING (true);

-- ============================================================
-- STORAGE BUCKET: Do this manually in Supabase Dashboard
-- ============================================================
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name it: dart-photos
-- 4. Check "Public bucket"
-- 5. Click Create
-- ============================================================
