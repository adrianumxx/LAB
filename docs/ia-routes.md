# IA — Route × ruolo (Sprint 8)

Mappa delle route App Router e ruoli previsti. **R** = area protetta da `RoleGuard` / middleware per quel ruolo. Gli utenti possono aprire altre route solo se policy/middleware lo consentono (es. account condiviso).

| Route | Manager | Owner | Tenant | Note |
|-------|:-------:|:-----:|:------:|------|
| `/` | — | — | — | Redirect in base a sessione/ruolo |
| `/role-entry` | ✓ | ✓ | ✓ | Scelta ruolo / ingresso |
| `/login`, `/signup` | ✓ | ✓ | ✓ | Auth |
| `/account/setup` | ✓ | ✓ | ✓ | Completamento ruolo profilo |
| `/account/preferences` | ✓ | ✓ | ✓ | Preferenze dashboard |
| `/account/billing` | ✓ | ✓ | ✓ | Stripe checkout / portal |
| `/onboarding/manager` | **R** | — | — | Wizard manager |
| `/onboarding/owner` | — | **R** | — | Wizard owner |
| `/onboarding/tenant` | — | — | **R** | Wizard tenant |
| `/manager` | **R** | — | — | Action Center |
| `/manager/units` | **R** | — | — | Indice unità |
| `/manager/units/[unitId]` | **R** | — | — | Cockpit unità |
| `/manager/cases` | **R** | — | — | Indice casi |
| `/manager/cases/[caseId]` | **R** | — | — | Dettaglio caso |
| `/manager/maintenance` | **R** | — | — | Richieste manutenzione |
| `/owner` | — | **R** | — | Overview proprietà |
| `/owner/approvals` | — | **R** | — | Approve checklist owner |
| `/owner/units` | — | **R** | — | Unità collegate |
| `/owner/units/[unitId]` | — | **R** | — | Dettaglio unità read-only |
| `/owner/cases` | — | **R** | — | Casi |
| `/owner/cases/[caseId]` | — | **R** | — | Dettaglio caso owner |
| `/tenant` | — | — | **R** | Home inquilino |
| `/tenant/maintenance` | — | — | **R** | Lista + nuova richiesta |
| `/tenant/maintenance/[requestId]` | — | — | **R** | Dettaglio richiesta |
| `/privacy`, `/terms` | ✓ | ✓ | ✓ | Legali |
| `/api/invite-unit-member` | server | — | — | POST invito (sessione manager) |
| `/api/stripe/checkout` | sessione | sessione | sessione | POST Checkout |
| `/api/stripe/portal` | sessione | sessione | sessione | POST Portal |
| `/api/stripe/webhook` | — | — | — | Stripe → server |
| `/api/notify/maintenance-created` | — | — | sessione tenant | Dopo insert manutenzione → email manager (Resend) |
| `/api/cron/reminders` | — | — | — | Cron con `CRON_SECRET` → digest manager |

## Nav mobile (hamburger)

| Ruolo | Voci drawer |
|-------|-------------|
| Tenant | Home, Maintenance, Billing, Preferences |
| Manager | Home, Units, Cases, Maintenance, Billing, Preferences, Setup wizard |
| Owner | Home, Approvals, Units, Cases, Billing, Preferences, Setup |

## Verifica CTA principali (dashboard)

- **Manager:** KPI e card puntano a `/manager/units`, `/manager/cases`, `/manager/maintenance`, onboarding, preferenze.
- **Owner:** KPI a `/owner/approvals`, `/owner/units`, `/owner/cases`.
- **Tenant:** Manutenzione → `/tenant/maintenance`; documenti/checklist da moduli; preferenze → `/account/preferences`.

Aggiornare questa tabella quando si aggiungono route o si cambia il guard.
