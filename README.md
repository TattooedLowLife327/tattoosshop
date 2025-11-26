# Tattoo's Dart Shop

React + Vite app with Supabase backend for dart supplies inventory management.

## Setup

### 1. Install dependencies
```bash
cd C:\Users\maehe\tattoos-shop
npm install
```

### 2. Create Supabase project
1. Go to https://supabase.com and create a free project
2. Go to SQL Editor and run the contents of `supabase-setup.sql`
3. Go to Storage and create a bucket called `dart-photos` with public access enabled

### 3. Configure environment
1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and anon key from Project Settings > API
3. Set your admin pincode (default: 1234)

```
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_PINCODE=1234
```

### 4. Update payment handles
Edit `src/components/OrderCheckout.jsx` and replace:
- @YOUR_VENMO
- paypal.me/YOUR_PAYPAL
- $YOUR_CHIME

### 5. Run development server
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```

## Features

- Browse inventory with filters (type, brand, condition, status)
- Add items to cart
- Checkout with Facebook name, shipping address, payment selection
- Admin dashboard (pincode protected) to manage inventory and orders
- Photo upload (up to 3 photos per item)
- PWA installable on mobile

## Routes

- `/` - Shop/browse inventory
- `/checkout` - Cart checkout
- `/admin` - Admin dashboard (pincode required)
