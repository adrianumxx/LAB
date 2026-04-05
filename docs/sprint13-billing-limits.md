# Sprint 13 — Limiti unità e feature gate

## Modello workspace

- Un **manager** è il creatore del workspace (`workspaces.created_by`).
- Il **limite unità** si applica alla **somma** delle righe in `units` collegate a **tutti** i workspace di cui l’utente è creatore (non solo al “primo” workspace).
- Piano **Enterprise** (cap molto alto): impostare manualmente `profiles.billing_plan = 'enterprise'` con abbonamento `active`/`trialing` (o processo interno allineato a vendite).

## Cap per piano (TS + SQL)

Fonte unica in **`src/lib/billing-plan-policy.ts`**; la migration **`20260406000000_unit_cap_rls.sql`** deve restare allineata (stessi numeri).

| Piano effettivo | Max unità |
|-----------------|-----------|
| free (nessun abbonamento attivo/trialing) | 3 |
| solo | 3 |
| start | 20 |
| core | 50 |
| pro | 100 |
| enterprise | 999999 |

Abbonamento **attivo** con `billing_plan` sconosciuto o null (es. webhook in ritardo): trattato come **PRO** (cap 100) per i limiti.

## Overage (13.5)

**Scelta prodotto:** niente fatturazione metered automatica in questa fase. Oltre il cap incluso: **blocco** alla creazione unità fino a upgrade piano o accordo Enterprise. La copy su `/pricing` (overage €) resta commerciale; l’enforcement tecnico segue questo documento fino a integrazione Stripe usage-based.

## Applicare RLS e colonna DB

Esegui **`docs/supabase-sql-editor-sprint-12-13.sql`** nel SQL Editor (include anche Sprint 12). Istruzioni: **`docs/supabase-apply-migrations.md`**.

## Enforcement

1. **RLS** su `units` INSERT: `manager_can_insert_unit(auth.uid())`.
2. **API** `POST /api/manager/units` — messaggi JSON espliciti (`UNIT_CAP_REACHED`) + insert con sessione utente.
3. **UI** — `/manager/units` form “Add unit”; onboarding manager messaggio se RLS blocca.

## FREE tier (nessun abbonamento attivo)

- **Inviti email** (`POST /api/invite-unit-member`): 403; UUID linking resta disponibile.
- **Email**: digest settimanale e notifica manutenzione al manager non inviate se il manager è in free tier.
- **Storage documenti**: upload case (manager) e tenant PDF bloccati lato client; tenant verifica `GET /api/tenant/unit-manager-tier`.

I controlli client non sostituiscono RLS; riducono confusione UX e allineano i percorsi API.
