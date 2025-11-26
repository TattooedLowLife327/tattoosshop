# Tattoo's Dart Shop

React + Vite app with Supabase backend for dart supplies inventory management.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create Supabase project
1. Go to https://supabase.com and create a free project
2. Run SQL files in order (sql/00 through sql/03)
3. Create storage bucket "dart-photos" with public access

### 3. Configure environment
1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and anon key from Project Settings > API
3. Set your admin pincode

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

## Features

- Browse inventory with filters (type, condition, status, price)
- Add items to cart and watchlist
- Checkout with Facebook name and shipping address
- Admin dashboard (pincode protected) to manage inventory and orders
- Photo upload (up to 3 photos per item)
- Realtime notifications
- PWA installable on mobile

## Routes

- `/` - Shop/browse inventory
- `/checkout` - Cart checkout
- `/admin` - Admin dashboard (pincode required)
