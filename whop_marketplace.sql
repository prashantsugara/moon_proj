begin;
create table if not exists public.lunar_whop_sellers (
  user_id uuid primary key references auth.users(id),
  whop_account_id text not null unique check (whop_account_id ~ '^biz_[a-zA-Z0-9]+$')
);
alter table public.lunar_whop_sellers enable row level security;
revoke all on public.lunar_whop_sellers from public, anon, authenticated;
grant select, insert on public.lunar_whop_sellers to service_role;
alter table public.lunar_auctions add column if not exists whop_seller_id text;
alter table public.lunar_auctions alter column seller_upi drop not null;
create or replace function public.lunar_auction_action(
  p_action text, p_id uuid, p_price integer default null,
  p_hours integer default null, p_text text default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  auction public.lunar_auctions;
  owner uuid;
  seller_account text;
  display_name text;
begin
  if actor is null then raise exception 'Sign in to continue'; end if;
  if p_action in ('list','bid') and not exists (
    select 1 from public.lunar_marketplace_settings where enabled
  ) then raise exception 'The marketplace is closed to new listings and bids'; end if;
  if p_action = 'list' then
    select account_id into owner from public.lunar_claims where id = p_id for update;
    if owner is distinct from actor then raise exception 'Only the registrant can list this plot'; end if;
    select whop_account_id into seller_account from public.lunar_whop_sellers where user_id = actor;
    if seller_account is null then raise exception 'Set up Whop seller payouts before listing'; end if;
    if p_hours is null or p_hours not between 1 and 168 or
       p_price is null or p_price not between 5000 and 50000000 then
      raise exception 'Enter a valid opening price and auction duration';
    end if;
    insert into public.lunar_auctions (claim_id, seller_id, price, ends_at, whop_seller_id)
      values (p_id, actor, p_price, clock_timestamp() + make_interval(hours => p_hours), seller_account)
      returning id into p_id;
    return p_id;
  end if;

  select * into auction from public.lunar_auctions where id = p_id for update;
  if not found then raise exception 'Auction unavailable'; end if;

  if p_action = 'bid' and auction.whop_seller_id is not null and auction.status = 'open' and auction.ends_at > clock_timestamp()
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
  elsif auction.deadline > clock_timestamp() and auction.whop_seller_id is null and p_action = 'buyer_paid'
     and auction.status = 'awaiting_buyer' and actor = auction.winner_id then
    update public.lunar_auctions set status = 'awaiting_seller',
      deadline = clock_timestamp() + interval '24 hours' where id = p_id;
  elsif auction.deadline > clock_timestamp() and auction.whop_seller_id is null and p_action = 'seller_confirmed'
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

create or replace function public.lunar_finalize_whop_sale(p_order text, p_payment text, p_amount integer, p_currency text, p_seller text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  auction public.lunar_auctions;
begin
  select * into auction from public.lunar_auctions where order_id = p_order for update;
  if not found then return 'unknown_order'; end if;
  if nullif(p_payment, '') is null or auction.whop_seller_id is null or p_seller is distinct from auction.whop_seller_id or p_amount is distinct from auction.price or p_currency is distinct from 'USD' then
    return 'invalid_payment';
  end if;
  if auction.payment_id = p_payment then return auction.status; end if;
  if auction.status not in ('awaiting_buyer','disputed') or auction.payment_id is not null then
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

revoke execute on function public.lunar_finalize_whop_sale(text,text,integer,text,text) from public, anon, authenticated;
grant execute on function public.lunar_finalize_whop_sale(text,text,integer,text,text) to service_role;

commit;
