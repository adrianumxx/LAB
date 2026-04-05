# SPEC.md — TENANT MANAGEMENT PLATFORM
# Compilato 2026-04-04 — Zero placeholder.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## IDENTITÀ

Nome:        Tenant Management Platform (TMP)
Tipo:        [x] SaaS
Tagline:     Unit-first tenancy operations system
Status:      [x] Da zero

In una frase per mia nonna:
> Una piattaforma che gestisce tutto quello che succede in ogni appartamento in affitto — dall'entrata dell'inquilino all'uscita — tutto organizzato e in un unico posto.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PROBLEMA + SOLUZIONE

Il problema reale che risolvo:
Manager, proprietari e inquilini gestiscono ogni appartamento in affitto tramite email, fogli Excel, documenti sparsi, messaggi fra piattaforme diverse, con storico incompleto, processi di entrata/uscita disordinati, responsabilità ambigue e passaggi persi. Il sistema è caotico.

Come lo risolvo:
Un sistema operativo dell'unità abitativa dove ogni appartamento ha uno storico chiaro, uno stato visibile, documenti in contesto, processi di ingresso/uscita ordinati, problemi tracciati, interventi gestiti e visibilità diversa per chi gestisce, chi possiede e chi abita. Tutto in un posto, zero frammentazione.

Perché nessun altro lo fa così:
Il sistema operativo completo della vita di ogni appartamento: dall'ingresso dell'inquilino all'uscita, tutto in un unico posto, senza frammentazione.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## UTENTI TARGET (3 PROFILI DISTINTI)

### PROFILO 1: PROPERTY MANAGER
Chi è:          35–55 anni, manager immobiliare professionista, gestisce 5–50 unità
Cosa vuole:     Controllo operativo, priorità chiare, ordine, nessun passaggio perso
Cosa teme:      Caos operativo, blocchi non visibili, dimenticanze critiche
Come decide:    Affidabilità, completezza, riduzione lavoro manuale
Dove si trova:  Bruxelles (prima), poi Europa

UX promise: "So sempre quali unità richiedono azione, cosa manca e qual è il prossimo passo."

### PROFILO 2: OWNER / PROPRIETARIO
Chi è:          40–65 anni, proprietario immobiliare, possiede 1–10 unità
Cosa vuole:     Visibilità, fiducia, nessuna micro-gestione, chiarezza
Cosa teme:      Sorprese negative, perdita di controllo, mancanza di informazioni
Come decide:    Serietà, trasparenza, visibilità senza complessità
Dove si trova:  Bruxelles (prima), poi Europa

UX promise: "Capisco cosa sta succedendo senza dover inseguire nessuno."

### PROFILO 3: TENANT / INQUILINO
Chi è:          25–50 anni, inquilino residenziale, usa il servizio poche volte
Cosa vuole:     Chiarezza, pochi step, documenti giusti, capacità di segnalare
Cosa teme:      Confusione, procedimenti lenti, burocrazie invisibili
Come decide:    Semplicità, rapidità, istruzioni chiare
Dove si trova:  Bruxelles (prima), poi Europa

UX promise: "Capisco subito cosa devo fare e dove trovare ciò che mi serve."

### Cosa DEVONO SENTIRE
[x] "Questo è serio, mi posso fidare" (tutti)
[x] "Finalmente qualcuno che capisce il mio problema" (tutti)
[x] "È facile, trovo subito quello che cerco" (soprattutto tenant)

### Cosa NON devono MAI sentire
[x] Confusione
[x] Sfiducia
[x] Complessità tecnica (tenant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COMPETITOR

| Nome | Punto di forza | Punto debole | Come li battiamo |
|------|---------------|--------------|-----------------|
| AppFolio | Accounting completo, operations mature | ERP pesante, UX vecchia, non unit-first | Semplicità unit-first + lifecycle chiaro |
| Buildium | Accessible, buona base rent/maintenance | Modulare/frammentato, lifecycle debole | Esperienza coesa attorno all'unità |
| Hemlane | UX moderna, comunicazione fluida | Troppo superficiale, lifecycle inesistente | Deep + semplice + unit-first simultaneamente |

**Il vuoto nel mercato:**
Nessuno è contemporaneamente **deep + semplice + unit-first + lifecycle-driven**.

Sito che voglio eguagliare per design: Notion (struttura + calma)
Sito che voglio eguagliare per affidabilità: Stripe (serietà + precisione)
Sito che voglio eguagliare per UX: Intercom (azione-first, flussi chiari)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## DESIGN LANGUAGE

Feeling visivo (scegli 1):
[x] Minimal e pulito — Trust / credibilità / operativo / premium sobrio

PALETTE CORE:
--primary:           #2563EB  (fiducia, tech, CTA, link, focus)
--primary-dark:      #1E3A8A  (autorevolezza, heading forti)
--accent:            #0F766E  (success evoluto, accenti premium)
--text-primary:      #0F172A
--text-secondary:    #475569
--bg-primary:        #F8FAFC  (light) | #020617 (dark)
--surface:           #FFFFFF  (light) | #0F172A (dark)
--border:            #E2E8F0  (light) | #1E293B (dark)

SEMANTIC:
--success:           #059669  (completato, pronto, verified)
--warning:           #D97706  (attenzione, scadenza, record incompleto)
--error:             #DC2626  (blocchi, problemi seri, mancanze critiche)
--info:              #0284C7  (info contestuali, onboarding, status neutri)

Font display (titoli):   [x] Inter SemiBold / Bold
Font body (testo):       [x] Inter Regular / Medium

Effetto 3D/motion principale:
[x] Motion medio — fluidità professionale, NON spettacolo
    - Hover morbidi su card e CTA
    - Transizioni smooth 200–280ms
    - Micro-animazioni premium
    - Modal / drawer motion elegante
    - Progress animation soft

Cosa NON fare:
[ ] 3D spettacolare  [ ] Parallax eccessivo  [ ] Effetti wow inutili  [ ] Bounce/elastic

Dark mode: [x] Supportata, light-first

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## MVP — 7 SCHERMATE CRITICHE PER LANCIARE

### 1. Auth / Role Entry
Pagina di ingresso dove l'utente sceglie:
- Sono un property manager
- Sono un proprietario
- Sono un tenant (oppure "Accedi via invito")

### 2. Onboarding by Role
Tre flussi di onboarding diversi:
- Manager: crea workspace → aggiungi unità → vedi piano d'azione
- Owner: collegati alle tue unità → vedi stato
- Tenant: accedi da invito → vedi il tuo percorso

### 3. Manager Home / Action Center
Vista operativa con:
- Unità che richiedono azione
- Record mancanti
- Move-in/out imminenti
- Incidenti da decidere
- Turnover da chiudere

### 4. Owner Home / Oversight View
Vista di supervisione con:
- Stato delle unità
- Occupancy e transizioni
- Problemi rilevanti
- Riparazioni importanti
- Approvazioni richieste

### 5. Tenant Home / Guided Self-Service
Vista semplice e guidata con:
- Checklist entrata/uscita
- Documenti da caricare o consultare
- Segnalazioni aperte
- Stato del percorso

### 6. Unit Detail / Operational Cockpit
La pagina centrale del prodotto:
- Stato unità (vacant/incoming/occupied/notice/outgoing/turnover)
- Tenancy corrente o in transizione
- Caso attivo
- Blocchi e record mancanti
- Documenti principali
- Timeline eventi recenti
- CTA di avanzamento

### 7. Case Page / Lifecycle Execution
Pagina dinamica per:
- Move-in (con checklist, responsabilità, scadenze)
- Move-out (con checkout, damages, deposit)
- Incident (con tracking, responsabilità)
- Repair (con tracciamento intervento)
- Turnover (con preparazione unità)

**Principio MVP:** Zero pagine di configurazione, zero setup amministrativo. Solo quelle che risolvono il lavoro reale.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PERCORSO CLIENTE: RUOLO, BISOGNI, DASHBOARD, EMAIL

### Verità sul ruolo (tenant / owner / property manager)

Dopo l’accesso il sistema deve sapere **con certezza** chi è l’utente:

- **Fonte di verità:** `user_metadata.role` su Supabase Auth (impostato a signup / invito), allineato a role-entry e inviti.
- **UI di conferma:** se ruolo assente o incoerente con il percorso (es. link invito tenant ma account senza ruolo), **blocco guidato** fino a risoluzione (completa profilo, accetta invito, contatta manager) — niente dashboard “generica” ambigua.
- **Middleware (produzione):** già reindirizza per sezione; va tenuto allineato a questa regola così URL e permessi coincidono sempre.

### Bisogni operativi per ruolo (cosa deve avere in dashboard)

Ogni ruolo ha **job-to-be-done** distinti; la dashboard non è un clone con colori diversi:

| Ruolo | Bisogni primari in home |
|-------|-------------------------|
| **Property manager** | Unità che richiedono azione, case aperti, scadenze, inviti pendenti, manutenzioni, record mancanti |
| **Proprietario** | Stato unità, occupancy, interventi rilevanti, **approvazioni pending**, documenti chiave, zero rumore operativo fine |
| **Tenant** | Percorso chiaro (move-in / vita / move-out), checklist, documenti, segnalazioni, contatti / prossimi passi |

**Estensione prodotto (da implementare):** breve **wizard “cosa ti serve ora”** post-onboarding (2–4 scelte o profilo salvato in DB, es. `user_operating_profile` o flags su workspace) per **mostrare/nascondere moduli** (widget) sulla dashboard: es. tenant in fase move-in vede in cima checklist + documenti; owner senza approvazioni aperte vede stato sintetico; manager con 0 unità vede solo CTA “aggiungi prima unità”.

### Collegamento tra flussi

- Ogni flusso (documenti, checklist, guasti, case, inviti) deve **esporre eventi** che alimentano: badge dashboard, **email transazionali**, e in seguito automazioni (reminder).
- Stesso modello dati: notifiche in-app (fase 1) e email (fase 2) leggono dagli stessi stati (es. `due_at`, `status`, `assigned_to`).

### Email transazionali e automazioni (Resend)

- **Provider:** Resend API (server-side only): inviti, conferme account, reset, digest leggeri, **reminder** (checklist in scadenza, richiesta manutenzione aggiornata, approvazione richiesta).
- **Template:** HTML/React Email coerenti col brand (aspetto curato, non testo grezzo); variabili per nome, link magic, scadenza, riepilogo.
- **Trigger:** (1) immediati su evento (webhook interno / insert DB), (2) **schedulati** (cron Netlify Scheduled Functions o Supabase `pg_cron` + Edge Function che chiama route sicura) per reminder ricorrenti.
- **Osservabilità:** log invii (tabella `notification_log` o equivalente) per debug e conformità; mai esporre API key al client.

Questa sezione è **vincolante** per le prossime iterazioni: prima si chiude **ingresso + bisogni + moduli dashboard**, poi si spinge su Storage/checklist/guasti già collegati a eventi email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TECH STACK

**Runtime:** Next.js 14 App Router
**Language:** TypeScript (strict mode)
**Styling:** Tailwind CSS + CSS Variables (zero hex hardcodati)
**UI Libraries:** Framer Motion, Lucide React
**State:** Zustand
**Data Fetching:** @tanstack/react-query
**Forms:** React Hook Form + Zod validation
**Utils:** clsx + twMerge

**Backend / Database:**
Auth provider:    [x] Supabase Auth
Database:         [x] Supabase (PostgreSQL + RLS)
Storage:          [x] Supabase Storage (documenti)

**Infrastructure:**
Deploy:           [x] Netlify (produzione attuale); SPEC originale menzionava Vercel
Email transaz.:   [x] Resend (in codice: template, eventi, cron digest; **attivo in prod** dopo env + dominio — vedi `docs/resend-setup.md`, `docs/launch-official.md`)
Payment:          [x] Stripe (in codice: Checkout, Portal, webhook; **live** dopo chiavi + webhook prod — vedi `docs/stripe-setup.md`, `docs/launch-official.md`)

**IMPORTANTE:** API e integrazioni si fanno SOLO dopo che il design è approvato visivamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ROADMAP (SEQUENZA RIGOROSA)

1. [FONDAMENTA] globals.css + tailwind.config + layout.tsx + theme system + primitivi UI
2. [AUTH] Role entry + auth pages + role detection + protected routes
3. [ONBOARDING] Flussi manager / owner / tenant
4. [MANAGER HOME] Action center operativo
5. [OWNER HOME] Oversight view
6. [TENANT HOME] Guided self-service
7. [UNIT DETAIL] Operational cockpit (centro del prodotto)
8. [CASE PAGE] Lifecycle execution (move-in/out/incident/repair/turnover)
9. [RESPONSIVE] Mobile first, zero overflow a 375px
10. [DARK MODE] Supporto completo light + dark
11. [SUPABASE] Auth, database, RLS policies, storage
12. [POLISH] Performance, SEO, accessibility, edge cases
13. [CLIENT JOURNEY] Ingresso ruolo verificato + profilo bisogni + dashboard modulare per ruolo
14. [COMMS] Resend: template mail + eventi + reminder schedulati

**MAI cambiare l'ordine salvo decisione consapevole. Fondamenta → Design → API → comunicazioni.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COMPONENTI LOCKED
# Aggiorna questa lista man mano che approvi i componenti

| Componente | Path | Approvato il |
|------------|------|-------------|
| Navbar | src/components/layout/Navbar.tsx | [data] |
| Footer | src/components/layout/Footer.tsx | [data] |
| SearchBar | src/components/ui/SearchBar.tsx | [data] |
| ThemeToggle | src/components/ui/ThemeToggle.tsx | [data] |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## METRICHE DI SUCCESSO

Il prodotto ha funzionato se:
- [ ] L'utente trova quello che cerca in < 30 secondi
- [ ] Il primo investitore/cliente dice "lo voglio" nei primi 10 secondi
- [ ] Il sito è indistinguibile dai leader del settore
- [ ] Funziona perfettamente su mobile e desktop
- [ ] Dark e light mode senza eccezioni

Il codice ha funzionato se:
- [ ] Zero colori hardcodati nel codebase
- [ ] Zero errori TypeScript in strict mode
- [ ] Build passa senza warning critici
- [ ] Lighthouse score > 90 su tutto

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questo file si scrive una volta.
Si legge all'inizio di ogni sessione.
Non si cambia senza una decisione consapevole.
