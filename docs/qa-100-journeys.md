# QA — 100 “agenti” (matrice percorsi utente)

Non sono processi automatici: sono **100 scenari** organizzati come **10 squadre da 10 ruoli** (Agent QA-01 … QA-100).  
Ogni riga = un caso da eseguire in **staging/prod** (o locale con Supabase), con esito **OK / FAIL / N/A** e nota in `docs/qa-feedback-template.md`.

**Automazione parziale:** `npm run test:e2e` copre solo smoke pubblici + redirect non autenticati (vedi `e2e/`).

---

## Squad A — Marketing & fiducia (QA-01–10)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-01 | `/` anonimo: hero, CTA principale, nessun overflow 375px | Contenuto leggibile, CTA cliccabili |
| QA-02 | Da `/`, vai a `/role-entry` e ritorno a presentazione | Link coerenti, nessun 404 |
| QA-03 | `/privacy` e `/terms` da footer landing | Pagine caricano, link leggibili light/dark |
| QA-04 | Meta title/description percepiti (tab browser) su `/`, `/login` | Titoli unici, sensati |
| QA-05 | `/sitemap.xml` e `/robots.txt` | Risposta 200, URL plausibili |
| QA-06 | Theme toggle (se presente su pagina) o `html.dark` da preferenze | Contrasto accettabile |
| QA-07 | Keyboard: Tab su landing — focus visibile su nav e CTA | Nessun focus “perso” |
| QA-08 | Screen reader spot-check: un H1 su landing | Struttura heading sensata |
| QA-09 | Link esterni (se presenti): `rel` appropriato | Nessun open redirect interno |
| QA-10 | Performance percepita: LCP hero < soglia accettabile su 4G simulato | Non bloccante per MVP ma annotare |

---

## Squad B — Ingresso ruolo & auth (QA-11–20)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-11 | `/role-entry`: tre schede ruolo + link “Accedi” | Destinazioni corrette |
| QA-12 | `/signup?role=manager` form visibile e validazione | Errori chiari |
| QA-13 | `/signup?role=owner` idem | |
| QA-14 | `/login?role=tenant` idem | |
| QA-15 | `/login` senza query | Accesso generico OK |
| QA-16 | Credenziali errate | Messaggio umano, no stack trace |
| QA-17 | Signup nuovo utente (staging) | Email conferma se richiesta; redirect coerente |
| QA-18 | Logout da dashboard | Sessione chiusa, accesso a `/manager` impossibile senza re-login |
| QA-19 | Sessione scaduta / cookie rimosso | Redirect a ingresso, non schermata bianca |
| QA-20 | Password dimenticata (se abilitato in Supabase) | Flusso documentato o N/A |

---

## Squad C — Profilo, preferenze, billing (QA-21–30)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-21 | `/account/setup` con ruolo mancante | Completamento salva metadata + profile |
| QA-22 | `/account/setup` utente già completo | Redirect sensato |
| QA-23 | `/account/preferences` salva preferenze dashboard | Persistenza dopo refresh |
| QA-24 | `/account/billing` senza Stripe env | Messaggio/degradazione controllata |
| QA-25 | `/account/billing` con Stripe test | Checkout apre; ritorno app OK |
| QA-26 | Customer Portal da billing | Ritorno URL corretto |
| QA-27 | `STRIPE_ENFORCE_SUBSCRIPTION=1` (staging): senza sub | Blocco a billing |
| QA-28 | Con sub active/trialing | Dashboard accessibile |
| QA-29 | Preferenze da ogni ruolo (nav hamburger + desktop) | Stesso esito |
| QA-30 | Billing link da hamburger tutti i ruoli | Raggiungibile |

---

## Squad D — Manager (QA-31–40)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-31 | `/manager` KPI e sezioni coerenti con DB | Numeri plausibili o empty state |
| QA-32 | `/manager/units` lista / filtri | Link a `[unitId]` UUID validi |
| QA-33 | `/manager/units/[unitId]` stato unità, persone, documenti | RLS: solo workspace propri |
| QA-34 | Invito membro unità: email nuova | Pending + mail manager se Resend OK |
| QA-35 | Invito membro: email già registrata | Messaggio dedicato, no crash |
| QA-36 | `/manager/cases` e dettaglio caso | Fasi, checklist, timeline |
| QA-37 | Upload documento caso | Storage policy OK |
| QA-38 | `/manager/maintenance` aggiornamento stato | Tenant vede update |
| QA-39 | Mobile nav manager: tutte le voci | Esc, focus trap |
| QA-40 | Manager prova ad aprire `/tenant` URL diretto | Blocco o redirect home |

---

## Squad E — Owner (QA-41–50)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-41 | `/owner` dashboard | KPI e link funzionanti |
| QA-42 | `/owner/approvals` con item pending | Completamento checklist owner |
| QA-43 | `/owner/units` e dettaglio | Read-only coerente |
| QA-44 | `/owner/cases` e dettaglio | Azioni permesse solo dove previsto |
| QA-45 | Owner non vede dati unità non collegate | RLS |
| QA-46 | Mobile nav owner | Coerente con `docs/ia-routes.md` |
| QA-47 | Approvazione da mobile | Touch target OK |
| QA-48 | Owner apre `/manager/...` | Negato |
| QA-49 | Documenti unità visibili owner | Download firmato |
| QA-50 | Empty state approvazioni | Copy + CTA |

---

## Squad F — Tenant (QA-51–60)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-51 | `/tenant` checklist e documenti | Dati solo propri lease |
| QA-52 | Checklist toggle | Persistenza |
| QA-53 | Upload documento tenant | Solo propri path |
| QA-54 | `/tenant/maintenance` crea richiesta | Compare in lista |
| QA-55 | Dettaglio richiesta `[requestId]` | Stato leggibile |
| QA-56 | Notifica manager (evento) | API o mail secondo env |
| QA-57 | Mobile nav tenant | Manutenzione + preferenze |
| QA-58 | Tenant apre `/manager/units/...` | Negato |
| QA-59 | Rete offline: `NetworkQueryError` | Retry / messaggio |
| QA-60 | Onboarding tenant wizard | Flag completamento + redirect |

---

## Squad G — Onboarding manager/owner (QA-61–70)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-61 | Wizard manager step 1–3 | Workspace + unit persistiti |
| QA-62 | Wizard owner | Collegamento unità |
| QA-63 | Refresh a metà wizard | Ripresa o messaggio chiaro |
| QA-64 | Back browser durante wizard | Nessun dato incoerente visibile |
| QA-65 | Completamento → dashboard ruolo | Una sola “source of truth” |
| QA-66 | Utente con ruolo errato per URL | Guard attivo |
| QA-67 | Deep link `/onboarding/manager` da loggato owner | Comportamento definito |
| QA-68 | Deep link onboarding senza login | Redirect login/role-entry |
| QA-69 | Testi onboarding senza entità HTML rotte | lint copy |
| QA-70 | Lighthouse accessibilità pagina onboarding | ≥ target interno |

---

## Squad H — API & integrazioni (QA-71–80)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-71 | `POST /api/invite-unit-member` senza sessione | 401/403 |
| QA-72 | Cron `/api/cron/reminders` senza secret | 401 |
| QA-73 | Cron con Bearer corretto | 200 o skipped documentato |
| QA-74 | Stripe webhook firma errata | 400, no update DB |
| QA-75 | Webhook evento valido (test) | `profiles` aggiornato |
| QA-76 | `POST /api/notify/maintenance-created` tenant non owner | Rifiuto |
| QA-77 | Nessuna chiave segreta in response JSON client | Audit rete |
| QA-78 | Rate limit manuale (burst inviti) | Annotare debolezze |
| QA-79 | CORS / OPTIONS su API | Solo origini attese |
| QA-80 | Log `notification_log` popolato su invii | Stati sent/failed |

---

## Squad I — Responsive, dark, stress UI (QA-81–90)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-81 | 375×667 dashboard tre ruoli | No scroll orizzontale |
| QA-82 | 768×1024 layout intermedio | Usabile |
| QA-83 | 1920×1080 max-width container | Non “sfondo infinito” brutto |
| QA-84 | Dark mode: form input placeholder | Leggibili |
| QA-85 | Dark: tabelle/card bordi | Visibili |
| QA-86 | Zoom browser 200% | Contenuto ancora usabile |
| QA-87 | Long unit address / long case title | Wrap, no overflow |
| QA-88 | 50 righe checklist | Scroll e performance accettabili |
| QA-89 | Rapid nav: dashboard ↔ dettaglio | Nessuna race UI critica |
| QA-90 | Due tab stesso utente | Stato coerente al refresh |

---

## Squad J — Dati limite & regressione (QA-91–100)

| ID | Percorso | Atteso |
|----|----------|--------|
| QA-91 | UUID malformato in `/manager/units/foo` | 404 o messaggio controllato |
| QA-92 | Caso eliminato / unit rimossa | Errore gestito |
| QA-93 | Tenant senza unità collegate | Empty state chiaro |
| QA-94 | Manager senza workspace | CTA onboarding |
| QA-95 | File upload troppo grande (se limite) | Errore chiaro |
| QA-96 | Tipo file non PDF dove richiesto | Blocco lato UI |
| QA-97 | Simultanea modifica checklist due utenti | Ultimo write wins o messaggio |
| QA-98 | Lingua UI: solo IT dove dichiarato | Coerenza |
| QA-99 | `npm test` + `npm run build` CI | Verdi |
| QA-100 | `npm run test:e2e` | Verdi su Chromium |

---

## Come usarla

1. Assegnare **10 casi per persona** (1 giornata) o **1 squadra per sprint**.  
2. Registrare FAIL in `docs/qa-feedback-template.md` con **passi**, **screenshot**, **browser**.  
3. Priorità fix: **P0** sicurezza/dati, **P1** blocco percorso pagante, **P2** polish.
