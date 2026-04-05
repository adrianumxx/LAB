# Stripe — setup Sprint 7

Flusso in app: **`/account/billing`** (Checkout per nuovo abbonamento, Customer Portal per gestione). Webhook aggiorna `profiles` (service role).

## 1. Variabili ambiente

Copia da `.env.example` in **`.env.local`** (mai in git):

| Variabile | Uso |
|-----------|-----|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave pubblicabile `pk_test_…` / `pk_live_…` (solo client-safe). |
| `STRIPE_SECRET_KEY` | `sk_test_…` — solo server (checkout, portal, webhook). |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` dalla Dashboard webhook o da `stripe listen`. |
| `STRIPE_PRICE_ID` | ID prezzo ricorrente (`price_…`) usato in Checkout. |
| `STRIPE_ENFORCE_SUBSCRIPTION` | Opzionale: `1` / `true` / `yes` per reindirizzare al billing se l’abbonamento non è `active` o `trialing` (middleware). |
| `SUPABASE_SERVICE_ROLE_KEY` | Obbligatorio per il webhook: aggiorna `profiles` lato server. |

`NEXT_PUBLIC_SITE_URL` o l’header della richiesta definiscono l’origine per `success_url` / `cancel_url` e il `return_url` del Portal (vedi `absoluteAppOrigin`).

## 2. Database

Applica la migration:

- `supabase/migrations/20260405700000_profiles_stripe_billing.sql`

(colonne `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status`, `billing_plan` su `profiles`.)

## 3. Stripe Dashboard

1. **Product + Price** — crea un prodotto in abbonamento (ricorrente), copia **`STRIPE_PRICE_ID`**.
2. **Customer portal** — Settings → Billing → Customer portal: attivalo e configura cosa possono fare i clienti (cancella, aggiorna metodo di pagamento, ecc.).
3. **Webhook** — endpoint `POST` verso:
   - produzione/staging: `https://<tuo-dominio>/api/stripe/webhook`
   - locale: usa Stripe CLI (sotto).

Eventi da selezionare (allineati al codice in `src/app/api/stripe/webhook/route.ts`):

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copia il **signing secret** in `STRIPE_WEBHOOK_SECRET`.

## 4. Sviluppo locale

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Usa il `whsec_…` stampato da `stripe listen` in `STRIPE_WEBHOOK_SECRET` per le richieste inoltrate.

## 5. Test end-to-end

1. Utente loggato → `/account/billing` → avvia Checkout (carta test Stripe).
2. Dopo pagamento, il webhook aggiorna lo stato; oppure invalida la query al ritorno con `?checkout=success`.
3. “Gestisci fatturazione” apre il Customer Portal.

## 6. Sicurezza

- Non committare chiavi segrete né `whsec_`.
- La chiave pubblicabile può stare nel client; **`sk_` e `SUPABASE_SERVICE_ROLE_KEY` solo server**.
