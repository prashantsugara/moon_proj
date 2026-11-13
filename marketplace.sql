begin;

create table if not exists public.lunar_marketplace_settings (
  singleton boolean primary key default true check (singleton),
  enabled boolean not null default false
);
insert into public.lunar_marketplace_settings (singleton) values (true) on conflict do nothing;
alter table public.lunar_marketplace_settings enable row level security;
revoke all on public.lunar_marketplace_settings from public, anon, authenticated;

create table if not exists public.lunar_auctions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.lunar_claims(id),
  seller_id uuid not null references auth.users(id),
  winner_id uuid references auth.users(id),
  winner_name text,
  price integer not null check (price between 100 and 50000000),
  ends_at timestamptz not null,
  status text not null default 'open' check (status in
    ('open','cancelled','unsold','awaiting_buyer','awaiting_seller','awaiting_fee','completed','expired','disputed')),
  deadline timestamptz,
  fee integer not null default 4900,
  order_id text unique,
  payment_id text unique,
  dispute_reason text,
  seller_upi text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists lunar_one_active_auction on public.lunar_auctions (claim_id)
  where status in ('open','awaiting_buyer','awaiting_seller','awaiting_fee','disputed');

create table if not exists public.lunar_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.lunar_auctions(id),
  bidder_id uuid not null references auth.users(id),
  amount integer not null check (amount between 100 and 50000000),
  created_at timestamptz not null default now()
);

alter table public.lunar_auctions enable row level security;
alter table public.lunar_bids enable row level security;
revoke all on public.lunar_auctions, public.lunar_bids from public, anon, authenticated;
grant select (id, claim_id, seller_id, winner_id, price, ends_at, status, deadline, fee, created_at)
  on public.lunar_auctions to anon, authenticated;
grant select (auction_id, amount, created_at) on public.lunar_bids to anon, authenticated;
grant select, update on public.lunar_auctions to service_role;
drop policy if exists lunar_auctions_read on public.lunar_auctions;
create policy lunar_auctions_read on public.lunar_auctions for select using (true);
drop policy if exists lunar_bids_read on public.lunar_bids;
create policy lunar_bids_read on public.lunar_bids for select using (true);

create or replace function public.lunar_auction_action(
  p_action text, p_id uuid, p_price integer default null,
  p_hours integer default null, p_text text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  auction public.lunar_auctions;
  owner uuid;
  display_name text;
begin
  if actor is null then raise exception 'Sign in to continue'; end if;
  if p_action in ('list','bid') and not exists (
    select 1 from public.lunar_marketplace_settings where enabled
  ) then raise exception 'The marketplace is closed to new listings and bids'; end if;
  if p_action = 'list' then
    select account_id into owner from public.lunar_claims where id = p_id for update;
    if owner is distinct from actor then raise exception 'Only the registrant can list this plot'; end if;
    if p_hours is null or p_hours not between 1 and 168 or
       p_price is null or p_price not between 100 and 50000000 or p_text is null or
       p_text !~ '^[A-Za-z0-9._-]{1,80}@[A-Za-z0-9.-]{1,19}
      raise exception 'Enter a valid opening price and auction duration';
    end if;
    insert into public.lunar_auctions (claim_id, seller_id, price, ends_at, seller_upi)
      values (p_id, actor, p_price, clock_timestamp() + make_interval(hours => p_hours), p_text)
      returning id into p_id;
    return p_id;
  end if;

  select * into auction from public.lunar_auctions where id = p_id for update;
  if not found then raise exception 'Auction unavailable'; end if;

  if p_action = 'bid' and auction.status = 'open' and auction.ends_at > clock_timestamp()
     and actor <> auction.seller_id then
    if p_price is null or p_price > 50000000 or p_price < auction.price or
       (auction.winner_id is not null and p_price <= auction.price) then
      raise exception 'Enter a bid above the current bid or at least the opening price';
    end if;
    select left(nullif(btrim(full_name), ''), 100) into display_name
      from public.profiles where id = actor;
    insert into public.lunar_bids (auction_id, bidder_id, amount) values (p_id, actor, p_price);
    update public.lunar_auctions set price = p_price, winner_id = actor,
      winner_name = coalesce(display_name, 'Lunar Citizen') where id = p_id;
  elsif p_action = 'cancel' and auction.status = 'open' and auction.winner_id is null
     and actor = auction.seller_id then
    update public.lunar_auctions set status = 'cancelled' where id = p_id;
  elsif p_action = 'close' and auction.status = 'open' and auction.ends_at <= clock_timestamp() then
    update public.lunar_auctions set
      status = case when winner_id is null then 'unsold' else 'awaiting_buyer' end,
      deadline = case when winner_id is not null then ends_at + interval '24 hours' end
      where id = p_id;
  elsif p_action = 'expire' and auction.deadline <= clock_timestamp()
     and auction.status = 'awaiting_buyer' then
    update public.lunar_auctions set status = 'disputed',
      dispute_reason = 'Buyer confirmation timed out. Verify whether payment was sent.' where id = p_id;
  elsif auction.deadline > clock_timestamp() and p_action = 'buyer_paid'
     and auction.status = 'awaiting_buyer' and actor = auction.winner_id then
    update public.lunar_auctions set status = 'awaiting_seller',
      deadline = clock_timestamp() + interval '24 hours' where id = p_id;
  elsif auction.deadline > clock_timestamp() and p_action = 'seller_confirmed'
     and auction.status = 'awaiting_seller' and actor = auction.seller_id then
    update public.lunar_auctions set status = 'awaiting_fee',
      deadline = clock_timestamp() + interval '24 hours' where id = p_id;
  elsif p_action = 'dispute' and auction.status in ('awaiting_seller','awaiting_fee')
     and actor in (auction.seller_id, auction.winner_id)
     and char_length(btrim(p_text)) between 1 and 500 then
    update public.lunar_auctions set status = 'disputed', dispute_reason = btrim(p_text) where id = p_id;
  else
    raise exception 'That action is unavailable for this auction';
  end if;
  return p_id;
end;
$$;

revoke execute on function public.lunar_auction_action(text,uuid,integer,integer,text) from public, anon;
grant execute on function public.lunar_auction_action(text,uuid,integer,integer,text) to authenticated;

create or replace function public.lunar_finalize_fee(p_order text, p_payment text, p_amount integer, p_currency text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  auction public.lunar_auctions;
begin
  select * into auction from public.lunar_auctions where order_id = p_order for update;
  if not found then return 'unknown_order'; end if;
  if p_payment is null or p_amount is distinct from auction.fee or p_currency is distinct from 'INR' then
    return 'invalid_payment';
  end if;
  if auction.payment_id = p_payment then return auction.status; end if;
  if auction.status not in ('awaiting_fee','disputed') or auction.payment_id is not null then
    return 'invalid_state';
  end if;
  if auction.status = 'disputed' or auction.deadline <= clock_timestamp() then
    update public.lunar_auctions set status = 'disputed', payment_id = p_payment,
      dispute_reason = coalesce(dispute_reason, 'Captured payment requires manual review')
      where id = auction.id;
    return 'disputed';
  end if;
  update public.lunar_claims set account_id = auction.winner_id, owner_name = auction.winner_name
    where id = auction.claim_id and account_id = auction.seller_id;
  if not found then raise exception 'Claim ownership changed'; end if;
  update public.lunar_auctions set status = 'completed', payment_id = p_payment where id = auction.id;
  return 'completed';
end;
$$;

revoke execute on function public.lunar_finalize_fee(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.lunar_finalize_fee(text,text,integer,text) to service_role;

create or replace function public.lunar_advance_auctions()
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.lunar_auctions set
    status = case when winner_id is null then 'unsold' else 'awaiting_buyer' end,
    deadline = case when winner_id is not null then clock_timestamp() + interval '24 hours' end
    where status = 'open' and ends_at <= clock_timestamp();
  update public.lunar_auctions set
    status = 'disputed',
    dispute_reason = 'Payment deadline passed. Reconcile before resolving.'
    where deadline <= clock_timestamp() and status in ('awaiting_buyer','awaiting_seller','awaiting_fee');
end;
$$;

revoke execute on function public.lunar_advance_auctions() from public, anon, authenticated;
grant execute on function public.lunar_advance_auctions() to service_role;

create or replace function public.lunar_payment_instructions(p_id uuid)
returns text language sql security definer set search_path = '' as $
  select seller_upi from public.lunar_auctions
  where id = p_id and winner_id = auth.uid()
    and status in ('awaiting_buyer','awaiting_seller','awaiting_fee') and deadline > clock_timestamp();
$;

revoke execute on function public.lunar_payment_instructions(uuid) from public, anon;
grant execute on function public.lunar_payment_instructions(uuid) to authenticated;

-- Operators reconcile direct payments and any gateway capture/refund before resolving.
create or replace function public.lunar_resolve_dispute(p_id uuid, p_transfer boolean)
returns void language plpgsql security definer set search_path = '' as $
declare auction public.lunar_auctions;
begin
  select * into auction from public.lunar_auctions where id = p_id for update;
  if not found or auction.status <> 'disputed' or p_transfer is null then
    raise exception 'No unresolved dispute';
  end if;
  if p_transfer then
    if auction.payment_id is null then raise exception 'No captured platform fee'; end if;
    update public.lunar_claims set account_id = auction.winner_id, owner_name = auction.winner_name
      where id = auction.claim_id and account_id = auction.seller_id;
    if not found then raise exception 'Claim ownership changed'; end if;
  end if;
  update public.lunar_auctions set status = case when p_transfer then 'completed' else 'expired' end
    where id = p_id;
end;
$;
revoke execute on function public.lunar_resolve_dispute(uuid,boolean) from public, anon, authenticated;
grant execute on function public.lunar_resolve_dispute(uuid,boolean) to service_role;
commit;
 then
      raise exception 'Enter a valid opening price and auction duration';
    end if;
    insert into public.lunar_auctions (claim_id, seller_id, price, ends_at)
      values (p_id, actor, p_price, clock_timestamp() + make_interval(hours => p_hours))
      returning id into p_id;
    return p_id;
  end if;

  select * into auction from public.lunar_auctions where id = p_id for update;
  if not found then raise exception 'Auction unavailable'; end if;

  if p_action = 'bid' and auction.status = 'open' and auction.ends_at > clock_timestamp()
     and actor <> auction.seller_id then
    if p_price is null or p_price > 50000000 or p_price < auction.price or
       (auction.winner_id is not null and p_price <= auction.price) then
      raise exception 'Enter a bid above the current bid or at least the opening price';
    end if;
    select left(nullif(btrim(full_name), ''), 100) into display_name
      from public.profiles where id = actor;
    insert into public.lunar_bids (auction_id, bidder_id, amount) values (p_id, actor, p_price);
    update public.lunar_auctions set price = p_price, winner_id = actor,
      winner_name = coalesce(display_name, 'Lunar Citizen') where id = p_id;
  elsif p_action = 'cancel' and auction.status = 'open' and auction.winner_id is null
     and actor = auction.seller_id then
    update public.lunar_auctions set status = 'cancelled' where id = p_id;
  elsif p_action = 'close' and auction.status = 'open' and auction.ends_at <= clock_timestamp() then
    update public.lunar_auctions set
      status = case when winner_id is null then 'unsold' else 'awaiting_buyer' end,
      deadline = case when winner_id is not null then clock_timestamp() + interval '24 hours' end
      where id = p_id;
  elsif p_action = 'expire' and auction.deadline <= clock_timestamp()
     and (auction.status in ('awaiting_buyer','awaiting_seller')
       or (auction.status = 'awaiting_fee' and auction.order_id is null)) then
    update public.lunar_auctions set status = 'expired' where id = p_id;
  elsif auction.deadline > clock_timestamp() and p_action = 'buyer_paid'
     and auction.status = 'awaiting_buyer' and actor = auction.winner_id then
    update public.lunar_auctions set status = 'awaiting_seller',
      deadline = clock_timestamp() + interval '24 hours' where id = p_id;
  elsif auction.deadline > clock_timestamp() and p_action = 'seller_confirmed'
     and auction.status = 'awaiting_seller' and actor = auction.seller_id then
    update public.lunar_auctions set status = 'awaiting_fee',
      deadline = clock_timestamp() + interval '24 hours' where id = p_id;
  elsif p_action = 'dispute' and auction.status in ('awaiting_seller','awaiting_fee')
     and actor in (auction.seller_id, auction.winner_id)
     and char_length(btrim(p_text)) between 1 and 500 then
    update public.lunar_auctions set status = 'disputed', dispute_reason = btrim(p_text) where id = p_id;
  else
    raise exception 'That action is unavailable for this auction';
  end if;
  return p_id;
end;
$$;

revoke execute on function public.lunar_auction_action(text,uuid,integer,integer,text) from public, anon;
grant execute on function public.lunar_auction_action(text,uuid,integer,integer,text) to authenticated;

create or replace function public.lunar_finalize_fee(p_order text, p_payment text, p_amount integer, p_currency text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  auction public.lunar_auctions;
begin
  select * into auction from public.lunar_auctions where order_id = p_order for update;
  if not found then return 'unknown_order'; end if;
  if p_payment is null or p_amount is distinct from auction.fee or p_currency is distinct from 'INR' then
    return 'invalid_payment';
  end if;
  if auction.payment_id = p_payment then return auction.status; end if;
  if auction.status not in ('awaiting_fee','disputed') or auction.payment_id is not null then
    return 'invalid_state';
  end if;
  if auction.status = 'disputed' or auction.deadline <= clock_timestamp() then
    update public.lunar_auctions set status = 'disputed', payment_id = p_payment,
      dispute_reason = coalesce(dispute_reason, 'Captured payment requires manual review')
      where id = auction.id;
    return 'disputed';
  end if;
  update public.lunar_claims set account_id = auction.winner_id, owner_name = auction.winner_name
    where id = auction.claim_id and account_id = auction.seller_id;
  if not found then raise exception 'Claim ownership changed'; end if;
  update public.lunar_auctions set status = 'completed', payment_id = p_payment where id = auction.id;
  return 'completed';
end;
$$;

revoke execute on function public.lunar_finalize_fee(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.lunar_finalize_fee(text,text,integer,text) to service_role;

create or replace function public.lunar_advance_auctions()
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.lunar_auctions set
    status = case when winner_id is null then 'unsold' else 'awaiting_buyer' end,
    deadline = case when winner_id is not null then clock_timestamp() + interval '24 hours' end
    where status = 'open' and ends_at <= clock_timestamp();
  update public.lunar_auctions set
    status = case when status = 'awaiting_fee' and order_id is not null then 'disputed' else 'expired' end,
    dispute_reason = case when status = 'awaiting_fee' and order_id is not null
      then 'Checkout expired and requires reconciliation' end
    where deadline <= clock_timestamp() and status in ('awaiting_buyer','awaiting_seller','awaiting_fee');
end;
$$;

revoke execute on function public.lunar_advance_auctions() from public, anon, authenticated;
grant execute on function public.lunar_advance_auctions() to service_role;
commit;
