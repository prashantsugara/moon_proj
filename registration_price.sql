begin;
alter table public.lunar_registration_orders
  add column if not exists amount_cents integer not null default 500 check (amount_cents > 0);

create or replace function public.lunar_finalize_registration(p_order text,p_payment text,p_amount integer,p_currency text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  reservation public.lunar_registration_orders;
  claim uuid;
begin
  select * into reservation from public.lunar_registration_orders where order_id = p_order for update;
  if not found then return 'unknown_order'; end if;
  if p_amount is distinct from reservation.amount_cents or p_currency is distinct from 'USD' or nullif(p_payment,'') is null then
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

commit;
