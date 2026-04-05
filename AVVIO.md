# Come far partire il progetto (Windows)

## Fai solo questo

1. Apri **PowerShell** o **Prompt** nella cartella del progetto  
   (`TENANT MANAGEMENT PLAT`).

2. **Una volta** (se non l’hai mai fatto):
   ```bash
   npm install
   ```

3. Avvio pulito (libera la porta 3000 e avvia Next):
   ```bash
   npm run dev:fresh
   ```

4. Apri il browser **Chrome o Edge** (non solo l’anteprima di Cursor) e vai a:
   ```
   http://127.0.0.1:3000
   ```

Dovresti vedere la **landing** (hero scuro, testo chiaro).

---

## Se ancora non va

- **Non** usare un `.env.local` con URL Supabase sbagliati o a metà.  
  Per solo vedere il sito: **nessun** `.env.local` oppure variabili commentate (vedi `.env.example`).

- Se il terminale mostra errori **rossi**, copiali e incollali (sono la risposta vera).

- `npm run dev:kill` da solo = chiude chi è in ascolto sulla porta **3000**.

---

## Comandi utili

| Comando | Cosa fa |
|--------|---------|
| `npm run dev:fresh` | Libera 3000 + `next dev` |
| `npm run dev` | Solo `next dev` (se la porta è libera) |
| `npm run build` | Build di produzione |
| `npm run dev:lan` | Dev raggiungibile da altri PC sulla rete |

In **sviluppo** il middleware Supabase è **spento** di proposito: la home non resta appesa per colpa della rete. In **produzione** (`npm run start`) il middleware torna attivo.

---

## Lancio ufficiale (staging / produzione)

Checklist operativa e ordine migration: **`docs/launch-official.md`**.  
Smoke test prima del go-live: **`docs/go-live-smoke.md`**.

## GitHub → Netlify (deploy automatico)

Collegare repo GitHub a Netlify e, in Cursor, **commit + push** (push opzionale automatico dopo commit): **`docs/github-netlify-sync.md`**.
