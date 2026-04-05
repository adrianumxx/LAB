# Resend — Sprint 9

Email transazionali solo **server-side** (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`). Nessuna chiave nel client.

## Variabili

| Variabile | Descrizione |
|-----------|-------------|
| `RESEND_API_KEY` | API key dashboard Resend (`re_...`). |
| `RESEND_FROM_EMAIL` | Mittente verificato (es. `onboarding@resend.dev` in test, o dominio verificato). |
| `CRON_SECRET` | Segreto per `/api/cron/reminders` (Bearer o `?secret=`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Necessario per log su `notification_log` e per risolvere email manager nei job. |
| `NEXT_PUBLIC_SITE_URL` | Consigliato in produzione per link nelle email (fallback: header richiesta). |

Copia in **`.env.local`** — non committare.

## Database

Applica la migration:

`supabase/migrations/20260405800000_notification_log.sql`

## Template (libreria)

| File | Uso |
|------|-----|
| `src/emails/templates/maintenance-new-for-manager.ts` | Nuova richiesta manutenzione → manager del workspace |
| `src/emails/templates/invite-sent-confirmation.ts` | Dopo invito unità → conferma al manager che ha inviato |
| `src/emails/templates/weekly-manager-digest.ts` | Cron: conteggio richieste aperte per manager |
| `src/emails/templates/welcome-role.ts` | Pronto per benvenuto ruolo (non ancora inviato da evento) |

## Eventi immediati

1. **Invito** — `POST /api/invite-unit-member` (dopo Supabase `inviteUserByEmail` ok): mail Resend al manager con riepilogo (se Resend configurato).
2. **Manutenzione** — dopo insert lato tenant, il client chiama `POST /api/notify/maintenance-created` con `{ "requestId": "<uuid>" }` (sessione tenant richiesta).

## Reminder schedulato

`GET` o `POST` `/api/cron/reminders` con:

```http
Authorization: Bearer <CRON_SECRET>
```

oppure `?secret=<CRON_SECRET>` (meno consigliato).

Esempi:

```bash
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://tuo-dominio/api/cron/reminders"
```

Collegare a **Netlify Scheduled Functions**, **Supabase pg_cron** → HTTP, o cron esterno.

## Audit

Tabella `notification_log`: `notification_type`, `recipient_hash` (SHA-256 email), `status` (`sent` | `failed` | `skipped`), `provider_message_id`, `error_message`, `metadata`.

## Sicurezza

- Ruota la chiave se esposta (dashboard Resend → API Keys).
- Non loggare mai l’email in chiaro in `metadata`; usare solo hash in tabella per destinatario.
