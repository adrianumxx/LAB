# Roadmap sprint — readiness “Y Combinator style”

**Contesto:** dopo gli sprint **0–10** (prodotto MVP, deploy, QA matrix). Questo documento definisce **Sprint 11–19** orientati a ciò che partner, investitori e primi clienti B2B si aspettano da una startup **demo-ready** e **due diligence-light**: prodotto credibile, revenue path chiaro, rischio tecnico/legale contenuto, metriche di attivazione.

**Durata indicativa:** 2 settimane per sprint → **~18 settimane** se eseguiti in sequenza; alcuni sprint possono **parzialmente** sovrapporsi (es. 14 ∥ 15).

**Principi YC (tradotti in deliverable):**
- **Make something people want** → un flusso “killer” end-to-end misurabile.
- **Talk to users** → playbook pilot + feedback strutturato.
- **Default alive** → pricing + Stripe allineati al valore; unit economics documentati.
- **Do things that don’t scale** → enterprise motion manuale prima dell’automazione totale.

---

## Sprint 11 — Packaging commerciale & Pricing (public-facing)

**Obiettivo:** chiunque capisca **chi paga**, **per cosa**, **quanto** — senza call di vendita.

| # | Deliverable |
|---|-------------|
| 11.1 | Pagina **Pricing** (landing o `/pricing`): tabella piani FREE / SOLO / START / CORE / PRO / Enterprise (allineata al listino prodotto) |
| 11.2 | Definizione scritta **cos’è un’unità**, **cosa include il FREE** vs pagato (bullet chiari) |
| 11.3 | CTA: Prova / Sottoscrivi / Contatta vendite — link a signup + billing |
| 11.4 | Copy **ICP** in homepage: “per property manager che gestiscono X–Y unità” (una frase) |

**DoD:** un investitore apre il sito e capisce offerta e prezzo in **< 60 secondi**.

---

## Sprint 12 — Stripe multi-piano & mirror DB

**Obiettivo:** abbonamenti coerenti con i piani; niente più `billing_plan` generico.

| # | Deliverable |
|---|-------------|
| 12.1 | Prodotti + **Price** Stripe per SOLO, START, CORE, PRO (mensile; annuale opzionale) |
| 12.2 | Env: `STRIPE_PRICE_ID_SOLO`, `…_START`, `…_CORE`, `…_PRO` (+ doc `.env.example`) |
| 12.3 | Checkout API accetta `plan` validato; webhook mappa **price id → slug** `billing_plan` |
| 12.4 | Customer Portal + upgrade/downgrade path documentato (anche se upgrade = nuovo checkout) |
| 12.5 | Migration se serve: `billing_plan` enum-like o vincoli; eventuale `stripe_price_id` su profilo per debug |

**DoD:** 4 pagamenti test in Stripe Dashboard con **4 price diversi** e `profiles.billing_plan` corretto.

---

## Sprint 13 — Enforcement unità & piani (core SaaS)

**Obiettivo:** il prodotto **impone** i limiti commerciali — non solo la pagina Pricing.

| # | Deliverable |
|---|-------------|
| 13.1 | Tabella centralizzata **limiti unità** e overage (config codice o DB) per piano |
| 13.2 | Modello **billing**: 1 workspace principale per manager (o regola esplicita documentata) |
| 13.3 | Blocco **creazione unità** oltre soglia + messaggio UX + CTA upgrade |
| 13.4 | Policy **FREE**: feature gate (inviti, email, storage, ecc.) + check **API** oltre UI |
| 13.5 | (Opz.) Overage Stripe metered **o** blocco fino upgrade piano (scegliere e documentare) |

**DoD:** manager su START non può creare la 21ª unità senza percorso commerciale chiaro.

---

## Sprint 14 — Attivazione & metriche (founder dashboard)

**Obiettivo:** sapere **se il prodotto viene usato**, non solo se qualcuno si registra.

| # | Deliverable |
|---|-------------|
| 14.1 | Eventi **product analytics** (Posthog / Plausible / Vercel Analytics — scelta una): signup, prima unità, primo caso, primo ticket manutenzione |
| 14.2 | Definizione **“activated user”** (es. ≥1 unità + ≥1 azione core entro 7 gg) |
| 14.3 | Dashboard interna minima **o** export settimanale (anche spreadsheet da query) |
| 14.4 | Onboarding manager: ridurre step verso **prima unità creata** (time-to-value) |

**DoD:** in call investor puoi dire “X% signed up → activated” con definizione ripetibile.

---

## Sprint 15 — Affidabilità & osservabilità

**Obiettivo:** produzione **debuggabile**; meno “non so perché è rotto”.

| # | Deliverable |
|---|-------------|
| 15.1 | **Error tracking** (Sentry o simile) su Next.js + API routes |
| 15.2 | Alert su **5xx** e webhook Stripe falliti |
| 15.3 | Runbook 1 pagina: deploy, rollback, rotazione segreti (`docs/runbook-ops.md`) |
| 15.4 | Health check route o monitoring uptime esterno (Better Uptime / Netlify) |

**DoD:** ultimo errore produzione ha **stack trace** e owner notificato.

---

## Sprint 16 — Sicurezza & fiducia B2B (due diligence light)

**Obiettivo:** superare conversazioni con **primo cliente istituzionale** senza imbarazzo.

| # | Deliverable |
|---|-------------|
| 16.1 | Review **RLS** Supabase: matrice ruolo × tabella; fix gap |
| 16.2 | Rate limit API sensibili (inviti, cron, webhook) |
| 16.3 | Documento **Security practices** 1–2 pagine (auth, dati a riposo, backup Supabase) |
| 16.4 | Elenco **subprocessor** (Supabase, Netlify, Stripe, Resend) in privacy |

**DoD:** security FAQ pronta da mandare in PDF dopo NDA leggero.

---

## Sprint 17 — Legal EU & B2B (minimo vendibile)

**Obiettivo:** vendere in **UE** senza placeholder imbarazzanti.

| # | Deliverable |
|---|-------------|
| 17.1 | Privacy & Terms **revisionati** da legale (non template generico) |
| 17.2 | **DPA** modello (o link a standard SCC) per clienti business |
| 17.3 | Policy **retention** dati e cancellazione account |
| 17.4 | Indirizzo contatto / impressum se vendi come società |

**DoD:** procurement di un piccolo studio non blocca per “manca la privacy”.

---

## Sprint 18 — Pilot & traction (motion YC)

**Obiettivo:** **numeri veri** e storie, non solo codice.

| # | Deliverable |
|---|-------------|
| 18.1 | **5 conversazioni** con property manager (log in `docs/pilot-log.md`: dolore, decisione, prezzo percepito) |
| 18.2 | **2–3 pilot** a pagamento o sconto con **accordo scritto** (anche email) su cosa misurano |
| 18.3 | **Case study** 1 pagina (anche anonimo) prima → dopo |
| 18.4 | **Demo script** 5 min + recording Loom interno |

**DoD:** slide “traction” ha almeno **loghi o quote** (anche anonime) + MRR o impegno scritto.

---

## Sprint 19 — Narrativa investitore & “one-liner”

**Obiettivo:** pacchetto **pitch** allineato al prodotto.

| # | Deliverable |
|---|-------------|
| 19.1 | **One-liner** + **pitch 30 sec** + problema/soluzione/TAM snello (doc `docs/pitch-onepager.md`) |
| 19.2 | **Deck** 10 slide (problema, soluzione, demo screenshot, business model, team, ask) |
| 19.3 | **Unit economics** foglio: ARPA per piano, costo infra stimato, gross margin teorico |
| 19.4 | Roadmap **12 mesi** post-YC (3 bullet engineering + 3 bullet GTM) |

**DoD:** mock partner meeting 20 min senza contraddire il sito né Stripe.

---

## Mappa sprint → “check YC”

| Aspetto | Sprint principali |
|---------|-------------------|
| Revenue path | 11, 12, 13 |
| Product quality | 13, 14 |
| Engineering maturity | 15, 16 |
| EU / enterprise readiness | 17, 16 |
| Traction story | 18 |
| Fundraising narrative | 19 |

---

## Dipendenze consigliate

```
11 (Pricing) ─┬─► 12 (Stripe multi) ─► 13 (limits)
              │
14 (metrics)  ├─► può partire dopo 11
15 (obs)      ├─► dopo deploy stabile (10)
16 (security) ├─► dopo 13 se API surface cresce
17 (legal)    ├─► in parallelo a 12–13
18 (pilots)   ├─► dopo 13 minimo (prodotto coerente con prezzo)
19 (pitch)    └─► dopo 18 ideale (numeri veri)
```

---

## Cosa **non** è in questa roadmap (fuori scope sprint)

- Certificazione **SOC2** completa (spesso post-seed).
- **Team hiring** (processo HR).
- **Multi-region** active-active.
- **Mobile native** (se non ICP-critical).

---

## Riferimenti interni

- Lancio ops: `docs/launch-official.md`, `docs/go-live-smoke.md`
- QA: `docs/qa-100-journeys.md`
- Git/Netlify: `docs/github-netlify-sync.md`
- Stripe oggi: `docs/stripe-setup.md`

---

*Documento creato per allineare ingegneria e GTM a uno standard “demo + due diligence light” compatibile con acceleratori tipo YC; non sostituisce consulenza legale o fiscale.*
