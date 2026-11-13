begin;
revoke insert (account_id, owner_name, title, lat, lng, sqft, motto, flag_id)
  on public.lunar_claims from authenticated;
drop policy if exists lunar_claims_insert on public.lunar_claims;
grant insert on public.lunar_claims to service_role;

create table if not exists public.lunar_registration_orders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id),
  lat numeric(5,2) not null check (lat between -90 and 90),
  lng numeric(5,2) not null check (lng >= -180 and lng < 180 and (abs(lat) <> 90 or lng = 0)),
  owner_name text not null check (length(trim(owner_name)) between 1 and 100),
  title text not null check (length(trim(title)) between 1 and 120),
  sqft integer not null check (sqft in (1,100,1000,43560)),
  motto text not null check (length(motto) <= 200),
  flag_id text not null check (length(flag_id) between 1 and 50),
  order_id text unique,
  payment_id text unique,
  claim_id uuid references public.lunar_claims(id),
  unique (lat,lng)
);
alter table public.lunar_registration_orders enable row level security;
revoke all on public.lunar_registration_orders from public, anon, authenticated;
grant select, insert, update on public.lunar_registration_orders to service_role;

create or replace function public.lunar_finalize_registration(p_order text,p_payment text,p_amount integer,p_currency text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  reservation public.lunar_registration_orders;
  claim uuid;
begin
  select * into reservation from public.lunar_registration_orders where order_id = p_order for update;
  if not found then return 'unknown_order'; end if;
  if p_amount is distinct from 500 or p_currency is distinct from 'USD' or nullif(p_payment,'') is null then
    return 'invalid_payment';
  end if;
  if reservation.payment_id = p_payment then return 'completed'; end if;
  if reservation.payment_id is not null then return 'invalid_state'; end if;
  insert into public.lunar_claims(account_id,lat,lng,owner_name,title,sqft,motto,flag_id)
  values(reservation.account_id,reservation.lat,reservation.lng,reservation.owner_name,reservation.title,
         reservation.sqft,reservation.motto,reservation.flag_id) returning id into claim;
  update public.lunar_registration_orders set payment_id = p_payment, claim_id = claim where id = reservation.id;
  return 'completed';
end;
$$;
revoke all on function public.lunar_finalize_registration(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.lunar_finalize_registration(text,text,integer,text) to service_role;

-- Freeze fees once a gateway order exists so existing orders remain payable at their quoted amount.
create or replace function public.lunar_set_percentage_fee()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' and new.price < 5000 then
    raise exception 'Opening bids must be at least INR 50';
  end if;
  if new.order_id is null then
    new.fee := round(new.price::numeric * 0.02)::integer;
  end if;
  return new;
end;
$$;
drop trigger if exists lunar_percentage_fee on public.lunar_auctions;
create trigger lunar_percentage_fee before insert or update of price on public.lunar_auctions
  for each row execute function public.lunar_set_percentage_fee();
update public.lunar_auctions set price = price where order_id is null and status not in ('completed','expired','cancelled');
commit;
