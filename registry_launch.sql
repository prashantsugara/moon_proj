begin;

create table if not exists public.lunar_claims (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null check (char_length(btrim(owner_name)) between 1 and 100),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  lat numeric(5,2) not null check (lat between -90 and 90),
  lng numeric(5,2) not null check (lng >= -180 and lng < 180),
  sqft integer not null check (sqft in (1, 100, 1000, 43560)),
  motto text not null check (char_length(motto) <= 200),
  flag_id text not null check (char_length(flag_id) between 1 and 50),
  created_at timestamptz not null default now(),
  unique (lat, lng)
);

alter table public.lunar_claims enable row level security;
revoke all on public.lunar_claims from public, anon, authenticated;
grant select on public.lunar_claims to anon, authenticated;
grant insert (account_id, owner_name, title, lat, lng, sqft, motto, flag_id)
  on public.lunar_claims to authenticated;

drop policy if exists lunar_claims_read on public.lunar_claims;
create policy lunar_claims_read on public.lunar_claims for select using (true);
drop policy if exists lunar_claims_insert on public.lunar_claims;
create policy lunar_claims_insert on public.lunar_claims for insert to authenticated
  with check ((select auth.uid()) = account_id);

-- Retire direct mutations on the legacy paid marketplace.
revoke insert, update, delete on public.items, public.bids, public.transfers, public.disputes
  from public, anon, authenticated;
revoke execute on function public.place_bid(uuid, numeric) from public, anon, authenticated;
revoke execute on function public.expire_stale_transfers() from public, anon, authenticated;
drop policy if exists "Public profiles" on public.profiles;
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

commit;
