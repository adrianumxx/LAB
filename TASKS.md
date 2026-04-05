# TASKS.md — PROGRESS TRACKER
# Aggiornato 2026-04-05 — Sprint 10: preparazione lancio ufficiale (doc go-live)

## Roadmap per sprint (sviluppo incrementale)

Piano sprint **0–10** in **`ROADMAP-SPRINT.md`**: **Sprint 1–9** chiusi in codice (2026-04-05); **Sprint 10** = lancio ufficiale (operativo: DB, env, smoke, cutover) — guide **`docs/launch-official.md`** + **`docs/go-live-smoke.md`**.  
Epic trasversale **IA / pagine / collegamenti / menu mobile** distribuito su **Sprint 4–8** — vedi sezione sotto e tabelle in `ROADMAP-SPRINT.md`.  
Dettaglio prodotto in **`SPEC.md`** → *PERCORSO CLIENTE: RUOLO, BISOGNI, DASHBOARD, EMAIL*.  
Lavorare **un sprint alla volta**; aggiornare qui a fine sprint.

### [EPIC] IA, pagine interne, wire bottoni, menu hamburger (Sprint 4 → 8)
- [x] **Sprint 4 — Tenant:** route dedicate manutenzione (+ dettaglio se in SPEC); wire tutte le CTA dashboard tenant; drawer hamburger strutturale nel layout tenant
- [x] **Sprint 5 — Manager:** `/manager/units` e `/manager/cases` (indici) o equivalente SPEC; wire card/bottoni manager; hamburger manager
- [x] **Sprint 6 — Owner:** sotto-route owner + wire dashboard; hamburger owner
- [x] **Sprint 7 — Stripe:** `/account/billing`, Preferenze → Fatturazione, Billing in hamburger tenant/manager/owner; Checkout + Portal + webhook + env doc (`docs/stripe-setup.md`, `.env.example`)
- [x] **Sprint 8 — Chiusura IA:** `docs/ia-routes.md` + `docs/sprint8-quality.md`; drawer `MobileNavDrawer` + `useMobileDrawerA11y` (focus trap, Esc, `aria-haspopup`); `NetworkQueryError` / `userFacingNetworkError`; `(dashboard)/not-found.tsx`; root `not-found` ordinato
- **Status:** Epic IA Sprint 4–8 chiuso in codice; Sprint 9 (email) chiuso in codice

### [Deploy] GitHub + Netlify sincronizzati
- [x] `docs/github-netlify-sync.md` — primo push, collegamento Netlify a Git, variabili env
- [x] `netlify.toml` + `@netlify/plugin-nextjs` — build Next su Netlify
- [x] `.github/workflows/ci.yml` — lint + vitest + `next build` su push/PR verso `main`
- [x] `.vscode/settings.json` — `git.postCommitCommand: push` (dopo commit da UI Cursor/VS Code)
- [ ] **Da fare una tantum:** `git remote add origin …`, primo `git push`, import sito Netlify da GitHub

### [QA / stress] Matrice 100 percorsi + Playwright smoke
- [x] `docs/qa-100-journeys.md` — 10 squadre × 10 scenari (marketing, auth, billing, manager/owner/tenant, API, a11y, edge)
- [x] `docs/qa-feedback-template.md` — template segnalazioni (no segreti in chiaro)
- [x] `@playwright/test`, `playwright.config.ts`, `e2e/public-and-guards.spec.ts` — home, role-entry, login/signup, legal, sitemap/robots, redirect guard, 375px overflow
- [x] Script `npm run test:e2e` / `test:e2e:ui`; `.gitignore` per `playwright-report`, `test-results`
- [ ] **Auth E2E con utenti staging** (storageState): opzionale — richiede credenziali solo in CI secrets
- **Nota:** non sono 100 processi automatici; la matrice serve a **team umano** o a batch manuali ripetibili. `test:e2e` copre solo la superficie pubblica + redirect.

### [SPRINT 10] Lancio ufficiale (go-live operativo)
- [x] Documentazione: `docs/launch-official.md` (fasi, ordine migration, matrice env, cron, go/no-go)
- [x] Smoke test: `docs/go-live-smoke.md` (manager / tenant / owner / billing / cron)
- [x] `SPEC.md` — infrastruttura Resend/Stripe allineata a “in codice + attivo dopo env”
- [x] `ROADMAP-SPRINT.md` — sezione Sprint 10
- [ ] **Da fare in ambiente:** eseguire checklist lancio (staging → prod) — non automatizzabile dal solo repo
- **Status:** 📋 **DOC PRONTA** — completare Fasi A–D sui tuoi ambienti

### [SPRINT 9] Resend: template, eventi immediati, cron, notification_log
- [x] Dipendenza `resend`; `src/lib/resend/env.ts`, `send-transactional.ts`; `log-notification`, `recipient-hash` + test
- [x] Template HTML: manutenzione → manager, conferma invito → manager, digest settimanale, welcome (pronto non inviato)
- [x] `POST /api/notify/maintenance-created` + hook client dopo creazione richiesta tenant
- [x] `POST /api/invite-unit-member` → Resend conferma al manager (se configurato)
- [x] `GET|POST /api/cron/reminders` protetto da `CRON_SECRET` (digest open maintenance per manager)
- [x] Migration `20260405800000_notification_log.sql`; `docs/resend-setup.md`; `.env.example` aggiornato
- [ ] **Da applicare su Supabase:** migration `notification_log`
- [ ] **Da configurare in ambiente:** `RESEND_*`, `CRON_SECRET`, dominio/mittente verificato Resend
- **Status:** ✅ COMPLETATO in codice — verificare `npm test` / `npm run build`

### [SPRINT 8] Qualità: menu a11y, IA doc, rete, 404 dashboard
- [x] `useMobileDrawerA11y`, `MobileNavDrawer`, animazioni `mobile-nav-*` in `globals.css`; integrazione in `TenantMobileNav`, `ManagerMobileNav`, `OwnerMobileNav`
- [x] `docs/ia-routes.md` (tabella route × ruolo + nav hamburger); `docs/sprint8-quality.md` (Lighthouse/375px checklist)
- [x] `userFacingNetworkError`, `NetworkQueryError`, test `network-error-message.test.ts`; wiring su dashboard principali, billing, manager units/cases, case+unit detail; `error.tsx` dashboard usa messaggio rete
- [x] `src/app/(dashboard)/not-found.tsx` + `src/app/not-found.tsx` (import/metadata ordinati)
- [ ] **Manuale:** Lighthouse su route critiche; smoke 375px / iOS narrow (vedi `docs/sprint8-quality.md`)
- [ ] **Opzionale:** smoke E2E (non in repo)
- **Status:** ✅ COMPLETATO in codice (`npm test` / `npm run build` verdi 2026-04-05)

### [SPRINT 6] Owner: approvazioni (checklist), route, wire dashboard, hamburger
- [x] Mappa SPEC → implementazione: `docs/owner-approvals-ia.md` (approvazione = `case_checklist_items` con `assignee_role = owner`, es. repair case)
- [x] Migration `20260405600000_owner_checklist_approval_rls.sql`: policy `case_checklist_update_owner_assigned` + trigger `case_checklist_items_update_guard` (non-manager: solo toggle `completed` su righe owner)
- [x] `useOwnerDashboardData`: `pendingOwnerApprovalCount` (checklist owner incomplete su casi delle unità dell’owner)
- [x] `useOwnerApprovals`, `useCompleteOwnerApprovalItem`; `useOwnerCasePageData` (read-only case + azione su righe owner)
- [x] Pagine: `/owner/approvals`, `/owner/units`, `/owner/units/[unitId]`, `/owner/cases`, `/owner/cases/[caseId]`
- [x] `OwnerMobileNav` in `owner/layout.tsx` (Home, Approvals, Units, Cases, Preferences, Setup)
- [x] `OwnerDashboardView`: KPI link, banner se pending > 0, card unità/casi collegate; demo CTA verso route reali
- [ ] **Da applicare su Supabase:** migration owner checklist RLS
- **Status:** ✅ COMPLETATO in codice (`npm run build` / `npm test` verdi 2026-04-05)

### [SPRINT 7] Stripe: Checkout, Portal, webhook, gate opzionale, navigazione
- [x] Migration `20260405700000_profiles_stripe_billing.sql` (colonne Stripe su `profiles`)
- [x] API: `POST /api/stripe/checkout`, `POST /api/stripe/portal`, `POST /api/stripe/webhook` (Node runtime; metadata `supabase_user_id`)
- [x] Lib: `src/lib/stripe/*`, `src/lib/billing.ts`, `src/hooks/useBillingProfile.ts`, middleware gate opzionale `STRIPE_ENFORCE_SUBSCRIPTION`
- [x] UI: `/account/billing` + card Fatturazione in `DashboardPreferencesForm`; link **Billing** in `TenantMobileNav`, `ManagerMobileNav`, `OwnerMobileNav`
- [x] Doc env: `.env.example` blocco Stripe; guida `docs/stripe-setup.md`; test `src/lib/billing.test.ts`
- [ ] **Da fare in ambiente:** copiare chiavi in `.env.local` (mai in repo); creare Price + Portal + webhook in Dashboard; `stripe listen` in dev
- [ ] **Da applicare su Supabase:** migration billing colonne `profiles`
- **Status:** ✅ COMPLETATO in codice — verificare `npm run build` / `npm test` dopo pull

### [SPRINT 5] Manager: indici, dashboard dati reali, inviti, hamburger
- [x] Query dashboard manager: oltre a workspaces/units/cases — `unit_tenants` (lease_start/end), conteggio `tenant_checklist_items` con `completed = false` (fallback silenzioso se tabella assente)
- [x] `manager-dashboard-aggregates.ts`: unità in attenzione, casi aperti, milestone lease 30g, casi aperti con `due_at` nei prossimi 30g
- [x] Pagine `/manager/units`, `/manager/cases` + client (`?filter=attention`, `?status=open`)
- [x] `ManagerMobileNav` (desktop + drawer): Home, Units, Cases, Maintenance, Preferences, Setup wizard — in `manager/layout.tsx`
- [x] `ManagerDashboardView`: KPI cliccabili, testi live da DB (checklist aperte, transizioni lease, blockers da scadenze caso), link di sezione
- [x] Inviti: API messaggio dedicato se email già registrata; `InviteUnitMemberError` + hint in `UnitPeoplePanel`; copy nuovo vs esistente
- [x] Wire CTA: dashboard mock blockers, unit detail (demo nascosto in live), case detail demo footer + errore “browse cases”
- **Status:** ✅ COMPLETATO in codice (`npm run build` / `npm test` verdi 2026-04-05)

### [SPRINT 4] Manutenzione / guasti + IA tenant (route, CTA, hamburger)
- [x] Migration `20260405400000_maintenance_requests.sql`: tabella `maintenance_requests`, stati `open|in_progress|resolved|cancelled`, RLS (tenant proprie + manager unità + owner; insert via `unit_tenants`; update stato solo manager), trigger `updated_at`
- [x] Tipi `MaintenanceRequestStatus` / `MaintenanceRequestRow`, helper `maintenance-status.ts`, hook `useMaintenanceRequests` (lista tenant/manager, conteggio aperti, create, update status)
- [x] Pagine tenant: `/tenant/maintenance` (form + lista), `/tenant/maintenance/[requestId]` (dettaglio)
- [x] Pagina manager: `/manager/maintenance` (lista, select stato, link unità)
- [x] Dashboard: `TenantDashboardView` anteprima manutenzione + CTA verso `/tenant/maintenance`; `ManagerDashboardView` KPI “Open maintenance” + link `/manager/maintenance`
- [x] `TenantMobileNav`: drawer mobile + link strutturali (Home, Manutenzione, Preferenze); integrato in `tenant/layout.tsx`
- [ ] **Da applicare su Supabase:** migration `20260405400000_maintenance_requests.sql`
- **Status:** ✅ COMPLETATO in codice (`npm run build` verde 2026-04-05)

### [SPRINT 1] Ingresso cliente: ruolo certo + bisogni + dashboard modulare
- [x] `AppUser.needsRoleSetup` + `appUserFromSupabase` solo da JWT metadata (`auth-store`)
- [x] Login / signup / `AuthSync`: redirect `/account/setup` se ruolo mancante; mock con `needsRoleSetup: false`
- [x] `RoleGuard` + `HomeClient`: redirect setup se `needsRoleSetup`
- [x] Middleware (prod): `parseValidDashboardRoleFromMetadata`; assenza ruolo su `/manager|/owner|/tenant|/onboarding/*` → `/account/setup`; `/account/*` escluso da guard ruolo
- [x] Pagine `/account/setup` (scelta ruolo → `auth.updateUser` + `profiles.app_role`) e `/account/preferences` (JSON `dashboard_preferences` + wizard flag)
- [x] Migration `20260405120000_profiles_dashboard_preferences.sql` — **da applicare** su progetto Supabase (`db push` o SQL Editor)
- [x] `useDashboardPreferences` + moduli condizionati: `ManagerDashboardView`, `TenantDashboardView` (ordine sezioni da fase), `OwnerDashboardView` (approvazioni in evidenza, feed opzionale)
- [x] Link **Preferenze** in nav dashboard → `/account/preferences`; empty tenant con CTA preferenze
- **Status:** ✅ COMPLETATO (verificare migration su DB remoto)

### [SPRINT 2] Documenti tenant (Storage)
- [x] Migration `20260405200000_tenant_documents_storage.sql`: tabella `tenant_documents`, bucket `tenant-files`, RLS Postgres + Storage (path `unit_id/tenant_id/…`)
- [x] Isolamento: inquilino vede solo i propri file (`tenant_id = auth.uid()`); manager/owner vedono tutti i file dell’unità; upload solo se riga in `unit_tenants`
- [x] `src/lib/storage/tenant-files.ts`, tipo `TenantDocumentRow`, hook `useTenantDocuments` / upload / delete / signed URL
- [x] `TenantDocumentsPanel`: variante `tenant` (PDF upload + download + delete) e `manager_view` (lista + download) su `/manager/units/[unitId]`
- [x] Dashboard tenant: sezione documenti reale per ogni unità collegata
- [ ] **Da applicare su Supabase:** `db push` o SQL Editor (file migration sopra)
- **Status:** ✅ COMPLETATO in codice (migration da eseguire su DB remoto)

### [SPRINT 3] Checklist onboarding persistente
- [x] Migration `20260405300000_tenant_checklist_items.sql`: tabella `tenant_checklist_items`, trigger seed su insert `unit_tenants`, backfill, RLS (tenant update solo proprie righe; manager/owner lettura)
- [x] Trigger `tenant_checklist_items_guard`: solo campi completamento aggiornabili
- [x] Hook `useTenantChecklistItems`, `useTenantChecklistItemsForUnit`, `useToggleTenantChecklistItem`, helper `itemsForUnit` / `checklistOpenCount`
- [x] `TenantChecklistList` + dashboard tenant (progress %, badge task aperti, card per unità)
- [x] Onboarding tenant step 2 allineato (checklist live + copy documenti → dashboard)
- [x] `ManagerUnitChecklistPanel` su `/manager/units/[unitId]` (read-only, raggruppato per tenant)
- [ ] **Da applicare su Supabase:** migration checklist
- **Status:** ✅ COMPLETATO in codice

## ROADMAP MVP

### [FONDAMENTA] globals.css + tailwind.config + layout.tsx + theme system + primitivi UI
- [x] Creare src/app/globals.css con design system completo
- [x] Configurare tailwind.config.ts con colori brand e spacing da SPEC
- [x] Creare src/app/layout.tsx root layout con theme provider
- [x] Creare src/lib/theme-store.ts (Zustand + localStorage)
- [x] Creare src/components/providers/ThemeProvider.tsx
- [x] Creare src/components/ui/ primitivi: Button, Card, Input, Badge
- [x] Dark mode funzionante (system + localStorage + toggle via store)
- [x] Configurare package.json con scripts (dev, build, start)
- [x] Creare tsconfig.json, next.config.js, postcss.config.js
- **Status:** ✅ COMPLETATO

### [AUTH] Role entry + auth pages + role detection + protected routes
- [x] Creare src/app/(auth)/layout.tsx (gradient background)
- [x] Creare src/app/(auth)/role-entry page (scelta ruolo con card)
- [x] Creare src/app/(auth)/login page (form email+password)
- [x] Creare src/app/(auth)/signup page (form completo con validazione)
- [x] Creare src/lib/auth-store.ts (Zustand auth state)
- [x] Creare src/lib/supabase.ts (placeholder per integrazione)
- [x] Implementare RoleGuard.tsx (protezione route)
- [x] Montare RoleGuard su manager/owner/tenant via layout.tsx dedicati (allowedRoles stabile)
- [x] RoleGuard: utenti non autenticati → /role-entry (non più solo /)
- [x] URL reali App Router: /role-entry, /login, /signup, /manager, /owner, /tenant (gruppi (auth)/(dashboard) invisibili nell’URL)
- [x] LoginForm + Suspense; ?role= manager|owner|tenant; redirect post-login a /${role}
- [x] parseUserRole() in auth-store per query signup/login sicure
- [x] Creare src/components/ui/Form.tsx (FormField, FormLabel, FormError)
- [x] Creare root page redirect (smista per ruolo)
- [x] Creare dashboard layout placeholder
- [x] Creare manager/owner/tenant dashboard pages
- **Status:** ✅ COMPLETATO

### [ONBOARDING] Flussi manager / owner / tenant
- [x] Creare src/app/onboarding/manager/ 3-step wizard (workspace → unit → completion)
- [x] Creare src/app/onboarding/owner/ 2-step wizard (properties → completion)
- [x] Creare src/app/onboarding/tenant/ 3-step wizard (welcome → documents → completion)
- [x] Workspace creation form (manager)
- [x] Unit add (manager)
- [x] Connect to units form (owner)
- [x] Integration with onboarding-store (Zustand)
- [x] Fixed Tailwind config TypeScript module loading (converted to CommonJS)
- [x] Fixed Suspense boundary issue in signup page
- **Status:** ✅ COMPLETATO

### [MANAGER HOME] Action center operativo
- [x] Aggiornare src/app/(dashboard)/manager/page.tsx con componenti completi
- [x] Componente "Units Requiring Action" (con urgency badge)
- [x] Componente "Missing Records" (con priority levels)
- [x] Componente "Upcoming Transitions" (next 30 days)
- [x] Componente "Open Cases" (active lifecycle cases)
- [x] Componente "Blockers & Priorities" (issue severity & deadline)
- [x] KPI cards (summary counts at top)
- **Status:** ✅ COMPLETATO

### [OWNER HOME] Oversight view
- [x] Aggiornare src/app/(dashboard)/owner/page.tsx con componenti completi
- [x] Componente "Unit Status Cards" (occupied/vacant/pending with details)
- [x] Componente "Active Tenancies" (current leases and renewal dates)
- [x] Componente "Open Issues" (property issues with severity)
- [x] Componente "Approvals Required" (pending owner decisions with quick actions)
- [x] Componente "Recent Activity" (timeline of key events)
- [x] Componente "Shared Documents" (insurance, records, tax docs)
- [x] KPI cards (total units, occupied count, issues, pending approvals)
- **Status:** ✅ COMPLETATO

### [TENANT HOME] Guided self-service
- [x] Aggiornare src/app/(dashboard)/tenant/page.tsx con componenti completi
- [x] Componente "My Status" (unit, lease dates, rent info, next payment)
- [x] Componente "Checklist" — persistenza DB `tenant_checklist_items` (Sprint 3), demo solo senza Supabase
- [x] Componente "Documents" (lease, inspection, house rules)
- [x] Componente "Report Issues" (maintenance requests form)
- [x] Progress indicator (visual setup completion percentage)
- [x] KPI card (status badge with lease state)
- **Status:** ✅ COMPLETATO

### [UNIT DETAIL] Operational cockpit (centro del prodotto)
- [x] Creare src/app/(dashboard)/manager/units/[unitId]/page (dynamic route)
- [x] Componente "Unit State" (6-state selector: vacant/incoming/occupied/notice/outgoing/turnover)
- [x] Componente "Current Tenancy" (tenant info, lease dates, contact)
- [x] Componente "Active Case" (lifecycle case progress bar and phase)
- [x] Componente "Blockers & Missing Records" (issue severity tracking)
- [x] Componente "Key Documents" (lease, checks, inspection forms)
- [x] Componente "Timeline / Events" (chronological case events)
- [x] CTA di avanzamento (advance to next phase button)
- [x] Header con unit details (address, rent, size, beds/baths)
- **Status:** ✅ COMPLETATO

### [CASE PAGE] Lifecycle execution (move-in/out/incident/repair/turnover)
- [x] Creare src/app/(dashboard)/manager/cases/[caseId]/page (dynamic route)
- [x] Componente "Case Header" (type, status, created/due dates)
- [x] Componente "Case Progress" (progress bar with phase description)
- [x] Componente "Phase Tracker" (5-phase progression with completion states)
- [x] Componente "Checklist" dinamica (tasks with assignees and due dates)
- [x] Componente "Responsibilities" (role-based task assignment)
- [x] Componente "Documents" (case files with upload/view actions)
- [x] Componente "Timeline" (chronological case events)
- [x] CTA di progresso (complete phase, advance to next phase)
- **Status:** ✅ COMPLETATO

### [RESPONSIVE] Mobile first, zero overflow a 375px
- [x] Grid layouts use responsive cols (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- [x] Typography uses clamp() for fluid sizing (--tx-base through --tx-giant)
- [x] Spacing uses CSS variables (--s1 through --s20)
- [x] Buttons and inputs are full-width on mobile
- [x] All Cards, Forms, and Lists tested at 375px viewport
- [x] Touch targets minimum 44px (buttons use size props)
- **Status:** ✅ COMPLETATO (MVP tested, further optimization in PHASE 12)

### [DARK MODE] Supporto completo light + dark
- [x] CSS variables in globals.css con .dark override
- [x] Tailwind configured darkMode: 'class' with system detection
- [x] Theme store manages light/dark/system preference with localStorage
- [x] All semantic colors (success, warning, error, info) have dark variants
- [x] Badge, Button, Card components support dark mode via var(--)
- [x] Zero hex colors in components (all use var(--*) or Tailwind classes)
- **Status:** ✅ COMPLETATO (MVP dark mode working, contrast audit deferred to PHASE 12)

### [SUPABASE] Auth, database, RLS policies, storage
- [x] Progetto Supabase creato (utente) — copiare URL + anon key in `.env.local` (vedi `.env.example`)
- [x] Pacchetti `@supabase/supabase-js` + `@supabase/ssr`
- [x] Client browser + server (`src/lib/supabase/`), `middleware.ts` refresh sessione
- [x] Login / signup con email+password quando env è configurato; fallback mock se env assente
- [x] `user_metadata.role` (manager|owner|tenant) su sign-up; `AuthSync` + `appUserFromSupabase`
- [x] Sign out dashboard (`DashboardSignOut`) + `signOut` Supabase
- [x] Migration SQL: `supabase/migrations/20260404210000_initial_schema_rls.sql` — eseguire nel SQL Editor Supabase (o CLI)
- [x] Tabelle: `profiles`, `workspaces`, `units`, `unit_owners`, `unit_tenants`, `cases` + trigger profilo su `auth.users`
- [x] RLS: manager (workspace creatore), owner/tenant (solo unità collegate via junction)
- [x] Onboarding manager: insert reale `workspaces` + `units` se Supabase configurato
- [x] UI manager: pannello «Owners & tenants» su `/manager/units/[unitId]` — link/rimozione per UUID Auth (Supabase → Users)
- [x] `useManagerUnitPageData` + header unità da DB quando `unitId` è UUID e Supabase attivo
- [x] `useManagerCasePageData` + `/manager/cases/[caseId]`: header da DB, fasi/checklist/timeline da DB, `CaseLiveSection` + `CaseWorkflowPanel` + `CaseTimelinePanel`; demo UI se non UUID / senza Supabase
- [x] `QueryProvider` + `useManagerDashboardData` — dashboard manager legge workspaces / units / cases da Supabase; anche `unit_tenants` (lease) e conteggio checklist aperti (`tenant_checklist_items`)
- [x] KPI e liste (unità in attenzione, casi aperti, link a `/manager/units/[id]` e `/manager/cases/[id]`); mock se env assente
- [x] Storage: migration `20260404230000_case_documents_storage.sql` — bucket `case-files`, tabella `case_documents`, RLS Storage + Postgres
- [x] Storage tenant: migration `20260405200000_tenant_documents_storage.sql` — bucket `tenant-files`, tabella `tenant_documents`, RLS (inquilino solo propri file; manager/owner lettura per unità)
- [x] Checklist tenant: migration `20260405300000_tenant_checklist_items.sql` — `tenant_checklist_items`, seed + RLS, sync con onboarding/dashboard
- [x] Manutenzione: migration `20260405400000_maintenance_requests.sql` — `maintenance_requests`, RLS tenant/manager/owner; UI `/tenant/maintenance`, `/manager/maintenance` (da applicare su progetto remoto)
- [x] UI `CaseDocumentsPanel` su case live: upload, lista, signed download, delete (manager)
- [x] Migration `20260404240000_pending_unit_invites.sql` — `pending_unit_invites` + `consume_pending_unit_invites()` in `handle_new_user`
- [x] API `POST /api/invite-unit-member` (service role `inviteUserByEmail`, rollback pending su errore)
- [x] Env: `SUPABASE_SERVICE_ROLE_KEY` (solo server), `NEXT_PUBLIC_SITE_URL` per `redirectTo` inviti
- [x] UI `UnitPeoplePanel`: blocco «Invite by email» + `useUnitMemberInvite`
- [x] Migration `20260404250000_case_phases_checklist.sql` — `case_phases`, `case_checklist_items`, RLS, seed + trigger su `cases` insert, backfill casi esistenti
- [x] `useManagerCasePageData` carica phases + checklist; `CaseWorkflowPanel` (toggle checklist, advance phase); `CaseLiveSection` + header case con progress da fasi
- [x] Migration `20260404260000_case_timeline_events.sql` — `case_timeline_events`, RLS, trigger «Case opened» su insert, trigger su cambio `status`, backfill; log client su checklist/fasi
- [x] `CaseTimelinePanel` — lista eventi, note manager, rimozione righe `user`; workflow scrive activity su timeline
- **Status:** ✅ Case timeline in DB; polish MVP in repo completato (vedi sezione POLISH)

### [POLISH] Performance, SEO, accessibility, edge cases
- [ ] Lighthouse score > 90 (solo dopo deploy: Chrome DevTools → Lighthouse su URL produzione con `NEXT_PUBLIC_SITE_URL` impostato)
- [x] Bundle: `npm run analyze` → `@next/bundle-analyzer` + `cross-env` (grafico dopo build con `ANALYZE=true`)
- [x] `experimental.optimizePackageImports: ['lucide-react']` in `next.config.js`
- [x] Immagini social: `opengraph-image.tsx` + `twitter-image.tsx` (Edge, `next/og`, `src/lib/og-brand-image.tsx`) — nessun `<img>` in app al momento; `next/image` quando aggiungi asset in `public/`
- [x] SEO: `metadataBase` + Open Graph + Twitter in root layout; `sitemap.ts` + `robots.ts`; metadata su login/signup, onboarding, owner/tenant, case/unit layout
- [x] `src/lib/site-config.ts` — `NEXT_PUBLIC_SITE_URL` per canonical URL (già in `.env.example`)
- [x] `viewport` (theme-color light/dark) in root layout
- [x] `app/loading.tsx` — stato globale navigazione
- [x] Accessibility: `SkipLink` → dashboard / auth / onboarding; `aria-label` nav; skeleton loading con `role="status"` / `aria-busy`
- [x] `(dashboard)/error.tsx` boundary + `not-found.tsx` globale
- [x] `(dashboard)/loading.tsx` skeleton
- [x] Keyboard: skip links; focus trap modali → quando esistono dialog (MVP senza modali)
- **Status:** ✅ MVP polish completato in repo; Lighthouse numerico = passo manuale post-deploy

---

## DECISIONI E BLOCCHI

**Decisioni prese:**
- Variabili env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (chiave anon/public dalla dashboard API).
- Route groups `(auth)` e `(dashboard)` non aggiungono segmenti URL: tutti i Link/redirect usano path senza `/auth/` e `/dashboard/`.
- Stack: Next.js 14 + TS + Tailwind + Zustand + React Query
- Database: Supabase (PostgreSQL + RLS)
- Deploy: Vercel
- Payment: Stripe (dopo MVP)
- Design system: Inter font, Blue primary, dark mode supportato

**Blocchi aperti:**
- Nessuno (brief completo)

**Note per sessioni future:**
- ✅ Design validato e MVP structure completa (FASE 1-10 done)
- RLS policies cruciali per la security (manager/owner/tenant separation)
- Unit detail è la pagina più importante — ora costruita e funzionante
- Dark mode platform-supported via system preference + localStorage
- **PROSSIMO (lancio ufficiale):** seguire **`docs/launch-official.md`** (Fasi A→D) + **`docs/go-live-smoke.md`**; poi Sprint 11+ come da note sotto
- **Inviti:** utente già registrato → Supabase può restituire errore; pending row viene rimossa; utenti esistenti si collegano ancora con UUID da Dashboard
- **Audit automatico 2026-04-05:** `npm test` 20/20 ✓; `npm run build` ✓; `npm run lint` ✓; `npm audit` segnala advisory **high** su `next` (fix spesso richiede major — pianificare upgrade controllato)

**Sprint successivi (proposta post–lancio, oltre Sprint 10 in `ROADMAP-SPRINT.md`):**
- **Sprint 11 — Sicurezza / hardening:** rate limit route API sensibili; revisione advisory `npm audit`; CSP/headers dove applicabile; backup/restore Supabase documentato
- **Sprint 12 — Vendita / marketing:** pricing + CTA landing allineati a Stripe; JSON-LD (Organization); Lighthouse remediation mirata; opz. E2E Playwright su auth + 1 flusso per ruolo
- **Sprint 13 — Compliance:** export/cancellazione dati utente (GDPR); revisione legale privacy/terms; retention `notification_log`

**COMPLETATO IN QUESTA SESSIONE:**
- **Sprint 6:** owner approvals su checklist DB, migration RLS+trigger, route owner + `OwnerMobileNav`, `docs/owner-approvals-ia.md`, dashboard wire + banner pending
- **Sprint 5:** indici `/manager/units` e `/manager/cases`, `ManagerMobileNav`, aggregati dashboard + fetch lease/checklist, `ManagerDashboardView` allineato al DB, inviti (API + UI hint), wire unit/case pages
- **Sprint 4:** `maintenance_requests` + RLS, hook e pagine tenant/manager manutenzione, wiring dashboard, `TenantMobileNav`; fix TS `effectiveUnitId` in `TenantMaintenancePageClient`
- **Sprint 3:** `tenant_checklist_items` persistente, seed su link tenant–unità, UI tenant + onboarding + manager unit
- **Sprint 2:** `tenant_documents` + bucket `tenant-files`, UI tenant e lettura manager su unit detail, PDF upload con RLS
- **Sprint 1:** flusso `/account/setup` e `/account/preferences`, preferenze in DB, dashboard modulare per ruolo, middleware allineato a metadata ruolo valido
- Fix schermata vuota / variabili CSS: `@media` annidato dentro `:root` (CSS nesting) spostato in `@media … { :root { … } }` — senza nesting support l’intero `:root` veniva scartato
- Tailwind: `borderColor.border` = `var(--border)` così `border-border` / `divide-border` generano classi (prima assenti dal bundle)
- Rimossi debug agent (`ClientDebugBootstrap`, `agent-debug-log`, API `debug-log`, scritture file su `/`); home statica di nuovo prerenderabile
- Landing pubblica `/`: presentazione piattaforma (IT), CTA verso `/role-entry`, login, signup per ruolo; utenti loggati → redirect dashboard (`HomeClient`)
- Link role-entry → home presentazione
- Middleware Supabase: guard ruolo su `/manager|/owner|/tenant` e onboarding; import relativo `route-guard` per Edge
- Owner dashboard: dati live (`useOwnerDashboardData` + `pendingOwnerApprovalCount`) + `OwnerDashboardView`; route `/owner/*` (approvals, units, cases); migration `20260405600000_owner_checklist_approval_rls.sql` per approvare checklist da owner
- Tenant dashboard: `TenantDashboardView` + pagina server metadata; dati live (`useTenantDashboardData`) quando Supabase + ruolo tenant
- Unit detail manager: lista `cases` da DB, `CreateCasePanel` (insert + invalidate query)
- Onboarding owner/tenant: `auth.updateUser` con flag `owner_onboarding_completed` / `tenant_onboarding_completed`
- Legal: `/privacy`, `/terms`; `SiteFooter` in dashboard, auth (tone inverse), onboarding
- Tooling: `vitest` + `npm test`, test `route-guard` + `isUuid`; `eslint` + `eslint-config-next`; fix `react/no-unescaped-entities` onboarding
- POLISH (completo in repo): OG/Twitter image (`next/og`), viewport, `app/loading`, `SkipLink`, lucide tree-shake, `npm run analyze`, bundle analyzer in `next.config.js`
- POLISH (primo giro): site-config, sitemap/robots, metadata root + pagine, `RoleGuardShell` + layout manager/owner/tenant server, error/loading/not-found, nav `aria-label`
- Timeline case: migration, hook, `CaseTimelinePanel`, log automatici (DB) + activity checklist/fasi
- Fasi + checklist case persistenti (migration, hook, `CaseWorkflowPanel`, progress header)
- Inviti email: migration pending invites, route API, hook, UI su unit detail; fix ordine `invalidate` / `onSuccess` invite
- Pannello owner/tenant su unit detail + `useManagerUnitPageData`; fix `as any` su Badge stato unità
- Migration DB + RLS (`supabase/migrations/…`); tipi `UnitState` in `src/lib/types/database.ts`; persist onboarding manager su Supabase
- Integrazione Supabase Auth (client SSR, middleware, login/signup, AuthSync, sign out)
- Fix critico: allineamento URL e redirect a route effettive; tenant da role-entry → /login?role=tenant
- Protezione dashboard: layout per ruolo con RoleGuard; redirect non auth → /role-entry
- Fase 1: Fondamenta (design system, theme, UI primitives) ✅
- Fase 2: Auth (role-entry, login, signup, RoleGuard) ✅
- Fase 3: Onboarding (3 role-specific wizards with progress) ✅
- Fase 4: Manager Home (action center with KPIs, blockers, transitions) ✅
- Fase 5: Owner Home (property oversight with unit status, approvals, activity) ✅
- Fase 6: Tenant Home (guided self-service with checklist, status, documents) ✅
- Fase 7: Unit Detail (operational cockpit, unit state, tenancy, case, timeline) ✅
- Fase 8: Case Page (lifecycle execution, checklist, responsibilities, timeline) ✅
- Fase 9: Responsive (mobile-first grid layouts, fluid typography) ✅
- Fase 10: Dark Mode (system preference, CSS variables, all colors supported) ✅

**BLOCCHI RISOLTI:**
- ✅ `AVVIO.md` + `npm run dev:fresh` (= `dev:kill` + `dev`) per avvio guidato; script porta 3000 termina con `exit 0`
- ✅ `next dev` che non risponde / timeout: middleware Supabase disattivato in development (nessuna chiamata `getUser` su ogni richiesta). Produzione (`next start`) invariata. Opt-in dev: `SUPABASE_MIDDLEWARE_IN_DEV=1`. `.env.example` aggiornato (variabili opzionali)
- ✅ App “morta” / nero totale: `useThemeEffect` con deps `[theme, setTheme]` → effect ripetuto dopo ogni `setTheme` (init da localStorage) → possibile storm di aggiornamenti. Fix: effect solo al mount `[]`, lettura tema con `getState()` nel listener prefers-color-scheme; `ThemeProvider` semplificato
- ✅ Resilienza: `<style>` critico in `layout` (html/body leggibili prima del bundle CSS); `app/global-error.tsx`; `AuthSync` try/catch su `createSupabaseBrowserClient`; `npm run dev` su `0.0.0.0:3000` per anteprima / rete locale
- ✅ `Internal Server Error` su ogni pagina: middleware Supabase `getUser()` senza try/catch (URL errato, rete, Supabase irraggiungibile) → 500. Fix: validazione `new URL(url)` + try/catch → `NextResponse.next()` di fallback
- ✅ Schermo scuro “vuoto”: regole `h1`/`p`/`a` **fuori da @layer** dopo Tailwind → in Chrome/Edge le unlayered battono `@layer utilities` → titolo hero restava `--text-primary` scuro su `--landing-ink` (invisibile). Fix: `@tailwind` in cima + tutto il design system in `@layer base`; `corePlugins.container: false`; header con `text-landing-fg`
- ✅ Pagina bianca: `:root` invalido su browser senza CSS nesting (media annidato)
- ✅ Classi `border-border` assenti → token `border` in `tailwind.config.js`
- ✅ Tailwind config TypeScript module loading → converted to CommonJS
- ✅ useSearchParams Suspense boundary → created SignUpForm client component
- ✅ TypeScript strict mode (bracket notation, ignoreDeprecations) → fixed all violations
