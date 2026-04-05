# Stripe — setup (Sprint 7 + 12)

Flusso in app: **`/account/billing`** (Checkout per nuovo abbonamento, più piani; Customer Portal per gestione). Webhook aggiorna `profiles` (service role) incluso slug piano e price id.

## 1. Variabili ambiente

Copia da `.env.example` in **`.env.local`** (mai in git):

| Variabile | Uso |
|-----------|-----|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chiave pubblicabile `pk_test_…` / `pk_live_…` (solo client-safe). |
| `STRIPE_SECRET_KEY` | `sk_test_…` — solo server (checkout, portal, webhook). |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` dalla Dashboard webhook o da `stripe listen`. |
| `STRIPE_PRICE_ID_SOLO` | Prezzo ricorrente mensile piano **SOLO** (`price_…`). |
| `STRIPE_PRICE_ID_START` | Prezzo ricorrente mensile piano **START**. |
| `STRIPE_PRICE_ID_CORE` | Prezzo ricorrente mensile piano **CORE**. |
| `STRIPE_PRICE_ID_PRO` | Prezzo ricorrente mensile piano **PRO**. |
| `STRIPE_PRICE_ID` | *Legacy:* usato solo come fallback per **PRO** se `STRIPE_PRICE_ID_PRO` è assente. |
| `STRIPE_ENFORCE_SUBSCRIPTION` | Opzionale: `1` / `true` / `yes` per reindirizzare al billing se l’abbonamento non è `active` o `trialing` (middleware). |
| `SUPABASE_SERVICE_ROLE_KEY` | Obbligatorio per il webhook: aggiorna `profiles` lato server. |

**Checkout è considerato configurato** se esiste `STRIPE_SECRET_KEY` e **almeno uno** dei quattro price id (o il fallback legacy per PRO). In `/account/billing` compaiono solo i pulsanti per i piani il cui price id è valorizzato.

`NEXT_PUBLIC_SITE_URL` o l’header della richiesta definiscono l’origine per `success_url` / `cancel_url` e il `return_url` del Portal (vedi `absoluteAppOrigin`).

## 2. Database

Applica le migration:

- `supabase/migrations/20260405700000_profiles_stripe_billing.sql` — `stripe_customer_id`, `stripe_subscription_id`, `stripe_subscription_status`, `billing_plan`
- `supabase/migrations/20260405900000_profiles_stripe_subscription_price.sql` — `stripe_subscription_price_id` (mirror del price attivo; debug/supporto)

## 3. Stripe Dashboard

1. **Prodotti + prezzi** — crea **quattro** prezzi ricorrenti (mensili), uno per SOLO / START / CORE / PRO (allineati al listino su `/pricing`). Copia ogni `price_…` nella variabile env corrispondente.
2. **Customer portal** — Settings → Billing → Customer portal: attivalo. Per **cambio piano** (upgrade/downgrade self-serve), aggiungi nel portale i prodotti/prezzi che vuoi rendere selezionabili; altrimenti gli utenti possono gestire solo pagamento e cancellazione, e per cambiare piano usare un nuovo Checkout (stesso account dopo eventuale cancel) come da nota in app.
3. **Webhook** — endpoint `POST` verso:
   - produzione/staging: `https://<tuo-dominio>/api/stripe/webhook`
   - locale: usa Stripe CLI (sotto).

Eventi da selezionare (allineati a `src/app/api/stripe/webhook/route.ts`):

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copia il **signing secret** in `STRIPE_WEBHOOK_SECRET`.

Il webhook imposta `profiles.billing_plan` con slug `solo` | `start` | `core` | `pro` in base al **price id** della subscription (confronto con le variabili env). Se il price non è mappato, con subscription attiva `billing_plan` resta vuoto finché non allinei env e Stripe.

## 4. API Checkout

`POST /api/stripe/checkout` con corpo JSON opzionale:

```json
{ "plan": "start" }
```

Valori ammessi: `solo`, `start`, `core`, `pro`. Se il body manca o non è JSON valido, il default è `pro` (compatibilità comportamenti precedenti).

## 5. Sviluppo locale

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Usa il `whsec_…` stampato da `stripe listen` in `STRIPE_WEBHOOK_SECRET` per le richieste inoltrate.

## 6. Test end-to-end

1. Utente loggato → `/account/billing` → scegli piano → Checkout (carta test Stripe).
2. Dopo pagamento, il webhook aggiorna stato, `billing_plan` e `stripe_subscription_price_id`; oppure invalida la query al ritorno con `?checkout=success`.
3. “Gestisci fatturazione” apre il Customer Portal.
4. **DoD Sprint 12:** quattro pagamenti test in Dashboard con **quattro price diversi** e `profiles.billing_plan` coerente con il piano scelto.

## 7. Sicurezza

- Non committare chiavi segrete né `whsec_`.
- La chiave pubblicabile può stare nel client; **`sk_` e `SUPABASE_SERVICE_ROLE_KEY` solo server**.
