alter table public.lunar_registration_orders
  add column if not exists deed_email_id text;
