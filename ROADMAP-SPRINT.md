# Roadmap per sprint — Tenant Management Platform

**Durata sprint (default):** 2 settimane.  
**Rilasci:** deploy su Netlify a fine sprint se il DoD è verde.  
**Stack:** Next.js 14, Supabase (DB + Auth + Storage), Netlify, **Resend** (email server-side).

**Allineamento prodotto:** vedi `SPEC.md` → sezione **“PERCORSO CLIENTE: RUOLO, BISOGNI, DASHBOARD, EMAIL”**.

---

## Come usare questo file

1. Lavora **uno sprint alla volta**; chiudi il DoD prima di aprire il successivo.
2. In fondo a ogni sprint, aggiorna `TASKS.md` (fatto / in corso / decisioni).
3. **Sprint 1** (ingresso + bisogni + dashboard) è prerequisito logico prima di spingere su email complesse: sennò i reminder non hanno eventi coerenti.

---

## Epic trasversale — IA, pagine interne, collegamenti, menu dashboard

**Obiettivo:** tutte le route previste dalla SPEC esistono (anche come shell); ogni CTA/bottone punta a una destinazione reale o a una pagina “Coming next” esplicita (no `href="#"` silenziosi); **menu hamburger** (drawer laterale) sulle tre dashboard — prima **struttura** (layout, voci, focus trap base), poi rifinitura a11y/animazioni in Sprint 8.

| Area | Sprint | Focus |
|------|--------|--------|
| Tenant | **4** | Route manutenzione + hamburger con voci strutturali (Home, Manutenzione, Preferenze, …); wire CTA “Report issue” / link da home |
| Manager | **5** | Index/liste dove mancano (`/manager/units`, `/manager/cases` se assenti); hamburger; wire KPI/card/button verso unit/case o pagine dedicate |
| Owner | **6** | Sotto-route oversight + hamburger; wire dashboard owner |
| Audit globale | **8** | Mappatura completa link, stati vuoti, menu mobile (375px), focus/aria |

Dettaglio nei singoli sprint sotto (righe aggiunte alle tabelle).

---

## Sprint 0 — Baseline produzione *(in gran parte fatto)*

**Obiettivo:** sito deployabile, env chiari, dev stabile.

| # | Deliverable |
|---|-------------|
| 0.1 | Deploy Netlify + variabili `NEXT_PUBLIC_*` e Supabase |
| 0.2 | `AVVIO.md` / `npm run dev:fresh` |
| 0.3 | Middleware: dev senza hang; prod con sessione + guard ruolo |

**DoD:** build verde; home e auth in prod; env documentate.

---

## Sprint 1 — Ingresso cliente: ruolo certo + bisogni + dashboard modulare

**Obiettivo:** dopo login non c’è ambiguità; ogni ruolo vede in home **solo ciò che gli serve** (moduli/widget condizionati).

| # | Deliverable |
|---|-------------|
| 1.1 | **Verifica ruolo:** schermata o flusso se `user_metadata.role` mancante / incoerente con invito o URL; niente accesso dashboard “anonima” |
| 1.2 | **Profilo bisogni (MVP):** salvataggio DB di 2–4 flag o scelte (es. tenant: fase move-in attiva; manager: ha già unità; owner: solo oversight) — tabella dedicata o JSON su profilo |
| 1.3 | **Dashboard per ruolo:** layout modulare — widget manager / owner / tenant da config + bisogni + stato dati (es. 0 unità → solo CTA onboarding manager) |
| 1.4 | **Empty states:** copy e CTA specifici per ruolo verso onboarding o azione successiva |

**DoD:** tre account di test (manager, owner, tenant) vedono home **diverse e pertinenti**; account senza ruolo risolto non resta bloccato in modo oscuro.

**Stato repo (2026-04-05):** DoD Sprint 1 soddisfatto in codice — `needsRoleSetup` + `/account/setup` (metadata JWT + `profiles.app_role`), `/account/preferences` + `profiles.dashboard_preferences`, dashboard modulari (`useDashboardPreferences`), middleware prod con `parseValidDashboardRoleFromMetadata` → setup se ruolo assente su route protette. Applicare migration `20260405120000_profiles_dashboard_preferences.sql` su Supabase.

---

## Sprint 2 — Documenti tenant (Storage)

**Obiettivo:** upload / lista / download con RLS.

| # | Deliverable |
|---|-------------|
| 2.1 | Bucket Storage + policy RLS |
| 2.2 | Metadati `documents` in DB |
| 2.3 | UI tenant + lettura manager dove serve |

**DoD:** upload PDF persistente; isolamento tra tenant.

**Stato repo (2026-04-05):** DoD soddisfatto — migration `20260405200000_tenant_documents_storage.sql`, hook + `TenantDocumentsPanel` (tenant dashboard + manager unit page read-only). Eseguire migration su Supabase.

---

## Sprint 3 — Checklist onboarding persistente

| # | Deliverable |
|---|-------------|
| 3.1 | Modello DB + RLS |
| 3.2 | Hook React Query + UI tenant / wizard allineato |
| 3.3 | (Opz.) badge / preparazione eventi per reminder (Sprint 9) |

**DoD:** stato checklist sopravvive a logout/login.

**Stato repo (2026-04-05):** DoD soddisfatto — tabella `tenant_checklist_items`, seed su `unit_tenants` + backfill, RLS, hook + UI tenant dashboard + onboarding step 2 + lettura manager su unit detail. Eseguire migration `20260405300000_tenant_checklist_items.sql` su Supabase.

---

## Sprint 4 — Segnalazione guasti / manutenzione

| # | Deliverable |
|---|-------------|
| 4.1 | Tabella `maintenance_requests` + RLS |
| 4.2 | Form tenant + lista |
| 4.3 | Vista manager + stati + contatore in home |
| 4.4 | **Pagine tenant:** route dedicate (es. `/tenant/maintenance`, dettaglio richiesta se previsto da SPEC) — shell complete con layout dashboard |
| 4.5 | **Wire tenant:** tutti i bottoni/CTA sulla dashboard tenant (es. “Report a New Issue”, link correlati) collegati alle route reali o a pagina “Prossimamente” con copy chiaro |
| 4.6 | **Menu hamburger tenant (strutturale):** componente drawer + voci navigazione (Home `/tenant`, Manutenzione, Preferenze `/account/preferences`, eventuale link documenti se centralizzato); integrato nel layout dashboard tenant |

**DoD:** ciclo creazione → aggiornamento stato → tenant vede update; navigazione tenant non ha CTA morti verso flussi di questo sprint; menu hamburger visibile e funzionante su viewport mobile (struttura, senza richiedere animazioni finali).

**Stato repo (2026-04-05):** DoD soddisfatto in codice — migration `20260405400000_maintenance_requests.sql` (tabella + RLS), hook `useMaintenanceRequests`, UI tenant (`/tenant/maintenance`, dettaglio `[requestId]`), manager (`/manager/maintenance`), anteprime e KPI su `TenantDashboardView` / `ManagerDashboardView`, `TenantMobileNav` (drawer) nel layout tenant. Eseguire migration su Supabase. `npm run build` verde.

---

## Sprint 5 — Manager: action center reale + inviti solidi

| # | Deliverable |
|---|-------------|
| 5.1 | Query aggregate centralizzate |
| 5.2 | Dashboard senza placeholder dove il DB ha dati |
| 5.3 | Inviti: utente esistente vs nuovo — UX e messaggi chiari |
| 5.4 | **Pagine manager mancanti:** indice `/manager/units` (lista/grid link a `[unitId]`), indice `/manager/cases` (lista link a `[caseId]`) o equivalente in SPEC — nessun “buco” IA |
| 5.5 | **Wire manager:** ogni bottone/card sulla dashboard manager e sulle pagine unità/caso punta a route esistenti (filtri, dettaglio, creazione caso, ecc.) |
| 5.6 | **Menu hamburger manager (strutturale):** drawer con voci (Home, Unità, Casi, Preferenze, eventuale onboarding); stesso pattern layout del tenant |

**DoD:** numeri coerenti con DB di test; inviti testati; da qualsiasi schermata manager si raggiungono unità e casi senza URL inventati; menu mobile operativo.

**Stato repo (2026-04-05):** DoD soddisfatto in codice — `useManagerDashboardData` arricchito (`unit_tenants` per lease, conteggio checklist aperte), `manager-dashboard-aggregates.ts`, indici `/manager/units` e `/manager/cases` (filtri `?filter=attention`, `?status=open`), `ManagerMobileNav` nel layout manager, `ManagerDashboardView` con KPI/link reali e sezioni live (transizioni lease, priorità da `due_at`), inviti con messaggi distinti nuovo vs account esistente (`InviteUnitMemberError` + API), wire CTA demo su unit/case detail. `npm run build` + `npm test` verdi.

---

## Sprint 6 — Owner: approvazioni

| # | Deliverable |
|---|-------------|
| 6.1 | Mappatura approvazioni vs SPEC |
| 6.2 | Lista pending + azione + storico minimo |
| 6.3 | (Opz.) notifica in-app |
| 6.4 | **Pagine owner:** route interne previste da SPEC (es. elenco unità/proprietà, dettaglio unità read-only, approvazioni dedicate) — shell + dati dove già esistono in DB |
| 6.5 | **Wire owner:** CTA e card della dashboard owner collegate alle nuove route; nessun placeholder senza destinazione |
| 6.6 | **Menu hamburger owner (strutturale):** drawer allineato a tenant/manager (Home, Approvazioni, Unità, Preferenze) |

**DoD:** un tipo di approvazione end-to-end in staging/prod; navigazione owner coerente con mappa IA.

**Stato repo (2026-04-05):** DoD soddisfatto in codice — migration `20260405600000_owner_checklist_approval_rls.sql` (RLS update owner + trigger guard colonne); mappa SPEC in `docs/owner-approvals-ia.md`; hook `useOwnerApprovals` / `useCompleteOwnerApprovalItem`, `useOwnerCasePageData`; route `/owner/approvals`, `/owner/units`, `/owner/units/[unitId]`, `/owner/cases`, `/owner/cases/[caseId]`; `OwnerMobileNav`; `OwnerDashboardView` + KPI/link + banner pending; `useOwnerDashboardData.pendingOwnerApprovalCount`. `npm run build` + `npm test` verdi. **Applicare migration su Supabase** per approvare da UI.

---

## Sprint 7 — Stripe

| # | Deliverable |
|---|-------------|
| 7.1 | Checkout / Customer Portal |
| 7.2 | Webhook + stato in DB |
| 7.3 | Gate piano + env documentate |
| 7.4 | **Wire billing:** voci menu / Preferenze / account che aprono Portal o checkout — nessun bottone “Abbonamento” senza destinazione |

**DoD:** pagamento test; nessun secret in client; flusso pagamento raggiungibile dalla navigazione già introdotta negli sprint 4–6.

**Stato repo (2026-04-05):** DoD in codice — migration billing su `profiles`; route API checkout/portal/webhook; pagina `/account/billing`; Preferenze + hamburger con link Billing; `docs/stripe-setup.md` + `.env.example`. Applicare migration su Supabase e configurare env/webhook in staging.

---

## Sprint 8 — Qualità e hardening

| # | Deliverable |
|---|-------------|
| 8.1 | Lighthouse / a11y su route critiche |
| 8.2 | Mobile 375px |
| 8.3 | Errori di rete UX + (opz.) smoke E2E |
| 8.4 | **Audit mappatura completa:** tabella route × ruolo (spreadsheet o `docs/ia-routes.md`) — ogni pagina dashboard referenziata, ogni bottone con target verificato |
| 8.5 | **Menu hamburger — rifinitura:** focus trap, chiusura ESC, `aria-*`, transizioni, allineamento visivo al design system; test su iOS/Android narrow |
| 8.6 | **404 / empty:** `not-found` e messaggi per route non ancora implementate sotto dominio dashboard (coerenza copy) |

**DoD:** P0 chiusi o ticket prioritizzati; IA documentata e menu mobile production-grade.

**Stato repo (2026-04-05):** DoD in codice — `docs/ia-routes.md`, `docs/sprint8-quality.md`; drawer con focus trap + Esc + transizioni token; `NetworkQueryError` + copy offline/rete; `(dashboard)/not-found` + root `not-found`. Restano verifiche manuali Lighthouse / 375px (checklist in doc).

---

## Sprint 9 — Resend: mail transazionali + automazioni / reminder

**Obiettivo:** email belle e coerenti col brand; invii su evento + promemoria schedulati (collegati a checklist, scadenze, manutenzione, inviti).

| # | Deliverable |
|---|-------------|
| 9.1 | Account Resend, dominio (o sandbox), `RESEND_API_KEY` solo server (Netlify env) |
| 9.2 | Libreria template (React Email o HTML partials): invito, benvenuto ruolo, reset/digest leggeri |
| 9.3 | **Eventi immediati:** hook dopo insert/update (Route Handler o Edge) — es. invito spedito, richiesta manutenzione creata, approvazione richiesta |
| 9.4 | **Reminder:** job schedulato (Netlify Scheduled Function o Supabase cron → endpoint con secret) — es. checklist in scadenza tra N giorni, riepilogo settimanale manager (opt-in) |
| 9.5 | Tabella `notification_log` (o equivalente): tipo, destinatario hash, stato, errore Resend |

**DoD:** almeno 3 template live in staging; un evento immediato + un reminder di prova documentato; zero key in client.

**Stato repo (2026-04-05):** DoD in codice — SDK `resend`; template HTML in `src/emails/` (manutenzione, invito conferma, digest settimanale, welcome pronto); `POST /api/notify/maintenance-created`; invito → Resend al manager; `GET|POST /api/cron/reminders` + `CRON_SECRET`; `notification_log` migration; `docs/resend-setup.md`. Applicare migration e impostare env in staging.

---

## Ordine sintetico

| Sprint | Focus |
|--------|--------|
| 0 | Baseline deploy + env + middleware |
| 1 | **Ingresso ruolo + bisogni + dashboard modulare** |
| 2 | Documenti + Storage |
| 3 | Checklist tenant |
| 4 | Guasti / manutenzione + **IA tenant (pagine, wire, hamburger strutturale)** |
| 5 | Manager action + inviti + **IA manager (index, wire, hamburger)** |
| 6 | Owner approvazioni + **IA owner (pagine, wire, hamburger)** |
| 7 | Stripe + **wire billing da navigazione** |
| 8 | Qualità / Lighthouse + **audit mappatura + menu mobile rifinito** |
| 9 | **Resend + automazioni / reminder** |
| 10 | **Lancio ufficiale** — migration, env, smoke, Stripe/Resend prod (`docs/launch-official.md`) |

---

## Sprint 10 — Lancio ufficiale (go-live)

**Obiettivo:** staging e produzione allineati a DB + env; smoke e checklist qualità su URL reali; Stripe/Resend pronti per traffico reale.

| # | Deliverable |
|---|-------------|
| 10.1 | Applicare **tutte** le migration Supabase su staging, poi produzione (ordine in `docs/launch-official.md`) |
| 10.2 | Matrice env staging/prod: Supabase, Stripe (test vs live), Resend, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` |
| 10.3 | Webhook Stripe e scheduler verso `/api/cron/reminders` verificati sull’URL pubblico |
| 10.4 | Smoke test `docs/go-live-smoke.md` + Lighthouse/375px `docs/sprint8-quality.md` su staging |
| 10.5 | Cutover produzione: redirect Auth Supabase, dominio mittente Resend, chiavi Stripe **live** solo su prod |

**DoD:** checklist Fase C–D in `docs/launch-official.md` completata; almeno un percorso end-to-end per ruolo su **produzione** documentato.

**Stato:** documentazione lancio in `docs/launch-official.md` + `docs/go-live-smoke.md` (2026-04-05).

---

## Prossimo passo operativo

Eseguire **Sprint 10** (`docs/launch-official.md` → Fase A → B → C).  
Per email subito senza Sprint 1: possibile solo per **inviti transazionali** isolati; reminder completi hanno senso dopo **Sprint 3–4** (eventi reali da agganciare) — già soddisfatto in roadmap 1–9.
