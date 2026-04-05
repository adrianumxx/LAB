-- Sprint 1: preferenze dashboard (bisogni operativi) per ruolo — JSON flessibile
alter table public.profiles
  add column if not exists dashboard_preferences jsonb not null default '{}'::jsonb;

comment on column public.profiles.dashboard_preferences is
  'Preferenze UI/bisogni: tenantPhase, flags KPI, ordine moduli. Merge lato app.';
