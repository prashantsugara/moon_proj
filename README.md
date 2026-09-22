# P2P Registry & Marketplace

Peer-to-peer registry & marketplace app with Next.js, Tailwind CSS, Supabase (Postgres, Auth, Realtime), and Razorpay off-platform P2P transfer fee.

## Features
- Supabase Auth & Realtime Bidding
- Off-Platform P2P Handshake & Transfer Fee via Razorpay
- Automated 24h Transfer Expiration Timeout
- RLS Database Policies & Dispute Resolution

## Environment Variables
Configured in Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
