# Lancio ufficiale — Tenant Management Platform

Guida operativa per **staging → produzione** senza saltare passi critici.  
Riferimenti: `docs/stripe-setup.md`, `docs/resend-setup.md`, `docs/sprint8-quality.md`, `docs/go-live-smoke.md`, **`docs/qa-100-journeys.md`** (100 scenari manuali), **`docs/qa-feedback-template.md`**.  
Smoke automatici: `npm run test:e2e` (Playwright, percorsi pubblici + guard senza sessione).

---

## 1. Principi

1. **Mai** committare `.env.local` o chiavi.
2. **Prima** staging completo (DB + env + smoke), **poi** produzione.
3. `NEXT_PUBLIC_SITE_URL` in produzione deve essere l’URL **pubblico canonico** (https, no slash finale incoerente nei redirect).

---

## 2. Database Supabase — ordine migration

Applicare **nell’ordine** (timestamp nel nome file) sul progetto **staging**, verificare, poi ripetere su **produzione**.

| # | File |
|---|------|
| 1 | `20260404210000_initial_schema_rls.sql` |
| 2 | `20260404230000_case_documents_storage.sql` |
| 3 | `20260404240000_pending_unit_invites.sql` |
| 4 | `20260404250000_case_phases_checklist.sql` |
| 5 | `20260404260000_case_timeline_events.sql` |
| 6 | `20260405120000_profiles_dashboard_preferences.sql` |
| 7 | `20260405200000_tenant_documents_storage.sql` |
| 8 | `20260405300000_tenant_checklist_items.sql` |
| 9 | `20260405400000_maintenance_requests.sql` |
| 10 | `20260405600000_owner_checklist_approval_rls.sql` |
| 11 | `20260405700000_profiles_stripe_billing.sql` |
| 12 | `20260405800000_notification_log.sql` |

**Metodo consigliato:** Supabase CLI `supabase db push` sul progetto collegato, oppure SQL Editor incollando **un file alla volta** e controllando errori.

**Dopo il push:** in Dashboard → Authentication → URL configuration, imposta **Site URL** e **Redirect URLs** con il dominio reale dell’app (staging e prod separati).

---

## 3. Variabili ambiente — matrice

### Obbligatorie per un lancio “reale”

| Variabile | Staging | Produzione |
|-----------|---------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Progetto staging | Progetto prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon staging | Anon prod |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role staging | Service role prod |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.…` | `https://www.…` |

### Pagamenti (Stripe)

| Variabile | Staging | Produzione |
|-----------|---------|------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | `pk_live_…` |
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook **test** endpoint staging | Secret webhook **live** endpoint prod |
| `STRIPE_PRICE_ID` | Price test | Price live |

**Cutover live:** creare in Stripe Dashboard prodotti/prezzi live, nuovo webhook su `https://<dominio-prod>/api/stripe/webhook`, aggiornare env su **solo** l’ambiente produzione. Non mischiare `sk_live` con DB staging.

### Email (Resend) e cron

| Variabile | Note |
|-----------|------|
| `RESEND_API_KEY` | Stesso account può avere invii test; in prod usare dominio mittente **verificato**. |
| `RESEND_FROM_EMAIL` | In prod: es. `noreply@tuodominio.com` (verificato su Resend). |
| `CRON_SECRET` | Stringa lunga casuale; **diversa** tra staging e prod consigliato. |

### Opzionale

| Variabile | Uso |
|-----------|-----|
| `STRIPE_ENFORCE_SUBSCRIPTION` | `1` solo quando vuoi bloccare dashboard senza abbonamento attivo/trialing. Attivalo **dopo** aver verificato Checkout + webhook su staging. |

---

## 4. Scheduler reminder (`/api/cron/reminders`)

L’endpoint richiede `Authorization: Bearer <CRON_SECRET>` (vedi `src/app/api/cron/reminders/route.ts`).

**Opzioni hosting:**

- **Netlify:** Scheduled Function che esegue `fetch` verso l’URL completo con header Bearer.
- **Supabase:** `pg_cron` + `net.http_post` (o Edge Function) verso l’URL pubblico.
- **Esterno:** cron su server con `curl` e Bearer.

Frequenza suggerita per il digest attuale: **settimanale** (es. lunedì mattina). Regola la frequenza in base al prodotto e al carico.

---

## 5. Fasi prima del “go live”

### Fase A — Staging verde

- [ ] Tutte le migration applicate su progetto Supabase staging.
- [ ] Env staging complete (tabella sezione 3).
- [ ] Build deploy staging verde (`npm run build` in CI o equivalente).
- [ ] Smoke test: `docs/go-live-smoke.md` **tutto spuntato**.
- [ ] Lighthouse / 375px: checklist `docs/sprint8-quality.md` su URL staging.

### Fase B — Pagamenti e email su staging

- [ ] Checkout test → webhook aggiorna `profiles` (verifica in tabella o UI billing).
- [ ] Customer Portal apre e torna all’app.
- [ ] Invito unità → mail manager (se Resend configurato) o log `notification_log`.
- [ ] Manutenzione creata da tenant → notifica manager (evento immediato).
- [ ] Chiamata manuale a `/api/cron/reminders` → risposta 200 e log coerente (o `skipped` se nessun dato).

### Fase C — Produzione

- [ ] Progetto Supabase **produzione** (o stesso progetto solo se accetti un solo ambiente — sconsigliato per il primo lancio).
- [ ] Migration stesso ordine sezione 2.
- [ ] Env produzione (chiavi **live** Stripe, dominio Resend, `NEXT_PUBLIC_SITE_URL` prod).
- [ ] Webhook Stripe **live** puntato all’URL prod.
- [ ] DNS + HTTPS attivi; nessun mixed content.
- [ ] Ripetere smoke critici su prod (almeno: login 3 ruoli, billing, 1 flusso manutenzione, 1 lettura dashboard).

### Fase D — Go / no-go

**Go** solo se: auth + RLS sensati, pagamento (se in scope) non rompe l’accesso, email o fallback documentato, backup Supabase abilitato (piano progetto), contatto per incidenti definito.

**No-go** se: migration mancanti, webhook non verificato, `NEXT_PUBLIC_SITE_URL` errato (redirect OAuth/email rotti).

---

## 6. Dopo il lancio (prime 48 ore)

- Monitorare log deploy, errori 5xx, fallimenti webhook Stripe (Dashboard Stripe → Developers).
- Controllare `notification_log` per picchi di `failed`.
- Avere piano rollback: deploy precedente noto + env backup (senza segreti in chiaro in ticket pubblici).

---

## 7. Allineamento documentazione prodotto

Aggiornare `SPEC.md` sezione infrastruttura (Resend / Stripe) quando il lancio è **live**, così materiali per investitori/clienti riflettono lo stato reale.
