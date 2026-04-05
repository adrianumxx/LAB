# Smoke test — pre-lancio (staging o produzione)

Esegui su **browser pulito** (o profilo dedicato) con **rete stabile**. Annota data, ambiente (URL) e esito.  
Obiettivo: nessun vicolo cieco critico per **manager**, **owner**, **tenant**.

**Prerequisiti:** migration complete, env configurate, app deployata all’URL sotto test.

---

## Account di test

Prepara **tre account** (email distinte) con ruoli:

| Ruolo | Email test | Password (solo note interne) |
|-------|------------|------------------------------|
| Manager | | |
| Owner | | |
| Tenant | | |

Collegamento dati: almeno **un workspace**, **un’unità**, **owner** e **tenant** collegati all’unità (come da flusso onboarding / inviti già documentato in repo).

---

## S1 — Pubblico e ingresso

- [ ] `/` — landing carica, CTA verso `/role-entry` o login funziona.
- [ ] `/role-entry` — scelta ruolo porta a `/login?role=…` coerente.
- [ ] `/login` — accesso con ogni account test.
- [ ] Utente **senza** `user_metadata.role` (se testabile) → `/account/setup` o flusso guida, non dashboard “vuota” ambigua.

---

## S2 — Manager

Accedi come **manager**.

- [ ] `/manager` — dashboard carica senza errore rete persistente (`NetworkQueryError` gestito se offline).
- [ ] Hamburger mobile (se viewport stretta): apre, **Esc** chiude, focus sensato.
- [ ] `/manager/units` — lista o empty state con CTA chiara.
- [ ] `/manager/units/[unitId]` — dettaglio unità (UUID reale): stato, persone, documenti tenant in lettura se presenti.
- [ ] Creazione **caso** (se disponibile dall’UI) o caso esistente → `/manager/cases/[caseId]` carica fasi/checklist/timeline.
- [ ] **Invito** membro unità (se usato): messaggio successo o errore comprensibile (utente già registrato).
- [ ] `/manager/maintenance` — elenco e cambio stato se c’è almeno una richiesta.
- [ ] `/account/preferences` — salva preferenze senza errore.
- [ ] `/account/billing` — Checkout o Portal si apre (Stripe configurato); con Stripe assente, messaggio gestito.

---

## S3 — Tenant

Accedi come **tenant** (collegato a un’unità).

- [ ] `/tenant` — dashboard con checklist/documenti/manutenzione coerenti con dati.
- [ ] `/tenant/maintenance` — crea richiesta **o** apri dettaglio esistente `/tenant/maintenance/[requestId]`.
- [ ] Dopo creazione manutenzione: manager riceve email **oppure** verifica `notification_log` / assenza errori server (se Resend non configurato, accetta `skipped` documentato).
- [ ] Upload documento (PDF) su pannello documenti se previsto — download firmato funziona.
- [ ] Checklist: toggle completamento persiste dopo refresh.

---

## S4 — Owner

Accedi come **owner** (unità con casi/checklist owner se possibile).

- [ ] `/owner` — dashboard e KPI link funzionanti.
- [ ] `/owner/approvals` — se ci sono voci pending, completamento azione owner funziona e si riflette su caso.
- [ ] `/owner/units` e `/owner/units/[unitId]` — lettura coerente.
- [ ] `/owner/cases` e `/owner/cases/[caseId]` — lettura / azioni permesse da RLS.

---

## S5 — Legale e SEO minimo

- [ ] `/privacy` e `/terms` — caricano (revisione legale esterna consigliata prima del lancio commerciale).
- [ ] `/sitemap.xml` e `/robots.txt` — rispondono sull’URL pubblico.

---

## S6 — Job schedulato (opzionale ma consigliato)

Da terminale (sostituisci URL e segreto):

```bash
curl -sS -H "Authorization: Bearer YOUR_CRON_SECRET" "https://TUO-DOMINIO/api/cron/reminders"
```

- [ ] Risposta JSON `ok` (o `skipped` con motivo documentato), mai 401 se segreto corretto.

---

## S7 — Stripe enforcement (solo se `STRIPE_ENFORCE_SUBSCRIPTION=1`)

- [ ] Utente senza abbonamento attivo/trialing → reindirizzamento a billing come previsto dal middleware.
- [ ] Dopo Checkout completato → accesso dashboard ripristinato.

---

**Firma smoke:** _________________ **Data:** __________ **Ambiente URL:** _______________________
