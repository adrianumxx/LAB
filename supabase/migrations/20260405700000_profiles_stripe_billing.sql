-- Stripe billing mirror (Sprint 7). Updated by webhook (service role) + checkout (authenticated).

alter table public.profiles
  add column if not exists stripe_customer_id text;

alter table public.profiles
  add column if not exists stripe_subscription_id text;

alter table public.profiles
  add column if not exists stripe_subscription_status text;

alter table public.profiles
  add column if not exists billing_plan text;

comment on column public.profiles.stripe_customer_id is 'Stripe Customer id (cus_...)';
comment on column public.profiles.stripe_subscription_id is 'Stripe Subscription id (sub_...)';
comment on column public.profiles.stripe_subscription_status is 'Mirror of subscription.status (active, trialing, canceled, ...)';
comment on column public.profiles.billing_plan is 'Product-facing plan slug when subscribed (e.g. pro)';
