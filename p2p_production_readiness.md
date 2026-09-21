# P2P Registry & Marketplace — Production Readiness Guide

## 1. Complete Supabase Database Schema (SQL)

Run in Supabase SQL Editor:

```sql
BEGIN;

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE item_status AS ENUM (
    'listed',
    'pending_payment',
    'seller_confirming',
    'transferred',
    'disputed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  upi_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_price NUMERIC(10,2) NOT NULL CHECK (start_price >= 0),
  current_bid NUMERIC(10,2) DEFAULT 0,
  winning_bidder_id UUID REFERENCES public.profiles(id),
  auction_end_at TIMESTAMPTZ NOT NULL,
  status item_status DEFAULT 'listed',
  payment_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BIDS TABLE
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  bidder_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRANSFERS TABLE
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE UNIQUE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  final_price NUMERIC(10,2) NOT NULL,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 49.00,
  buyer_paid_p2p BOOLEAN DEFAULT FALSE,
  seller_confirmed_p2p BOOLEAN DEFAULT FALSE,
  fee_paid_razorpay BOOLEAN DEFAULT FALSE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ATOMIC BID FUNCTION
CREATE OR REPLACE FUNCTION public.place_bid(p_item_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
DECLARE
  v_item RECORD;
BEGIN
  SELECT * INTO v_item FROM public.items WHERE id = p_item_id FOR UPDATE;

  IF v_item.status != 'listed' THEN
    RAISE EXCEPTION 'Item not open for bidding';
  END IF;

  IF NOW() >= v_item.auction_end_at THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;

  IF p_amount <= COALESCE(v_item.current_bid, v_item.start_price) THEN
    RAISE EXCEPTION 'Bid must exceed current highest bid';
  END IF;

  INSERT INTO public.bids (item_id, bidder_id, amount)
  VALUES (p_item_id, auth.uid(), p_amount);

  UPDATE public.items
  SET current_bid = p_amount,
      winning_bidder_id = auth.uid()
  WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TIMEOUT EXPIRATION CLEANUP FUNCTION
CREATE OR REPLACE FUNCTION public.expire_stale_transfers()
RETURNS VOID AS $$
BEGIN
  UPDATE public.items
  SET status = 'listed',
      winning_bidder_id = NULL,
      payment_deadline = NULL
  WHERE status = 'pending_payment'
    AND payment_deadline < NOW();

  UPDATE public.transfers
  SET completed_at = NOW()
  WHERE buyer_paid_p2p = FALSE
    AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. REALTIME BROADCAST SETUP
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.items, public.bids, public.transfers;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN undefined_object THEN null;
END $$;

-- 10. ROW LEVEL SECURITY & POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public items read" ON public.items;
CREATE POLICY "Public items read" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Seller create item" ON public.items;
CREATE POLICY "Seller create item" ON public.items FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Seller/Buyer update item" ON public.items;
CREATE POLICY "Seller/Buyer update item" ON public.items FOR UPDATE USING (
  auth.uid() = seller_id OR auth.uid() = winning_bidder_id OR auth.uid() = owner_id
);

DROP POLICY IF EXISTS "Public bids read" ON public.bids;
CREATE POLICY "Public bids read" ON public.bids FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated bid" ON public.bids;
CREATE POLICY "Authenticated bid" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

DROP POLICY IF EXISTS "Transfer participants read" ON public.transfers;
CREATE POLICY "Transfer participants read" ON public.transfers FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

DROP POLICY IF EXISTS "Transfer participants update" ON public.transfers;
CREATE POLICY "Transfer participants update" ON public.transfers FOR UPDATE USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

DROP POLICY IF EXISTS "Disputes participant read" ON public.disputes;
CREATE POLICY "Disputes participant read" ON public.disputes FOR SELECT USING (
  auth.uid() = reporter_id
);

DROP POLICY IF EXISTS "Disputes participant insert" ON public.disputes;
CREATE POLICY "Disputes participant insert" ON public.disputes FOR INSERT WITH CHECK (
  auth.uid() = reporter_id
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bids_item_id_amount ON public.bids (item_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_items_status_end ON public.items (status, auction_end_at);
CREATE INDEX IF NOT EXISTS idx_transfers_item_id ON public.transfers (item_id);

COMMIT;
```

---

## 2. Production Razorpay Webhook Endpoint (`app/api/webhooks/razorpay/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(bodyText)
    .digest('hex');

  if (expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const event = JSON.parse(bodyText);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const transferId = payment.notes.transfer_id;

    // 1. Mark platform fee paid
    const { data: transfer } = await supabaseAdmin
      .from('transfers')
      .update({ fee_paid_razorpay: true, razorpay_payment_id: payment.id })
      .eq('id', transferId)
      .select()
      .single();

    // 2. Finalize transfer if seller confirmed
    if (transfer && transfer.seller_confirmed_p2p) {
      await supabaseAdmin
        .from('items')
        .update({ owner_id: transfer.buyer_id, status: 'transferred' })
        .eq('id', transfer.item_id);
    }
  }

  return NextResponse.json({ received: true });
}
```

---

## 3. Production Tasks & Checklist

- [ ] **Razorpay Webhooks**: Configure webhook endpoint `https://yourdomain.com/api/webhooks/razorpay` in Razorpay Dashboard for `payment.captured`.
- [ ] **Cron Expiration Setup**: Run `cron.schedule('expire-transfers-job', '*/15 * * * *', 'SELECT expire_stale_transfers()')` in Supabase.
- [ ] **Rate Limiting**: Protect bid RPC with Upstash Redis rate limiter (5 bids / 10s per user).
- [ ] **Admin Dashboard**: Build internal route `/admin/disputes` to review flagged transfers and manually resolve payment conflicts.
- [ ] **Environment Variables**:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

  NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
  RAZORPAY_KEY_SECRET=...
  RAZORPAY_WEBHOOK_SECRET=...
  ```
