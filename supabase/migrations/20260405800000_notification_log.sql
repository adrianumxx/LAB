-- Log invii email (Resend): audit, debug, niente PII in chiaro (solo hash destinatario)

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null,
  recipient_hash text not null,
  status text not null
    check (status in ('sent', 'failed', 'skipped')),
  provider_message_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_type_created_idx
  on public.notification_log (notification_type, created_at desc);

create index if not exists notification_log_recipient_hash_idx
  on public.notification_log (recipient_hash, created_at desc);

comment on table public.notification_log is 'Server-side email audit (Resend). Inserts only via service role.';

alter table public.notification_log enable row level security;

-- Nessuna policy: anon/authenticated non leggono; service role (Supabase) bypassa RLS per insert/select.
