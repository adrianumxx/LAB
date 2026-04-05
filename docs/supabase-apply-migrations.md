# Applicare migration Sprint 12–13 su Supabase (produzione / staging)

Non servono credenziali nel repo: si esegue **una volta** dalla dashboard Supabase.

## Passi

1. Apri [Supabase Dashboard](https://supabase.com/dashboard) → il progetto TMP.
2. Menu **SQL Editor** → **New query**.
3. Apri nel repo il file **`docs/supabase-sql-editor-sprint-12-13.sql`**, copia **tutto** il contenuto, incolla nell’editor.
4. Clic **Run** (o `Ctrl+Enter`).

## Cosa fa

- Aggiunge `profiles.stripe_subscription_price_id` (mirror price Stripe, webhook).
- Crea/aggiorna funzioni `manager_owned_unit_count`, `effective_unit_cap_for_manager`, `manager_can_insert_unit`.
- Sostituisce la policy RLS `units_insert_manager` con il controllo sul cap piano.

## Dopo l’esecuzione

- Riavvia o ricarica l’app se avevi errori su `select` del profilo (colonna mancante).
- I file in `supabase/migrations/` restano la fonte “vera” per CLI/Git; questo bundle è solo comodo per SQL Editor.

## CLI (opzionale)

Se usi Supabase CLI collegato al progetto: `supabase db push` applica le migration dalla cartella `supabase/migrations/` invece di incollare lo script.
