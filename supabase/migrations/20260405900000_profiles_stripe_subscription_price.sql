-- Sprint 12: mirror Stripe subscription line item price id (debug / support).

alter table public.profiles
  add column if not exists stripe_subscription_price_id text;

comment on column public.profiles.stripe_subscription_price_id is
  'Active subscription recurring price id (price_...) from Stripe; set by webhook.';
