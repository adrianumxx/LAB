# GitHub + Netlify — sincronizzazione continua

## Come funziona (importante)

**Git non invia ogni modifica al salvataggio del file.** Il flusso corretto è:

1. Modifichi il codice in Cursor.
2. **Commit** (messaggio che descrive il cambiamento).
3. **Push** su GitHub → Netlify (se collegato al repo) **ricostruisce e pubblica** il sito.

Così non devi caricare nulla a mano su Netlify: basta che il deploy sia **“collegato a Git”**.

---

## Una tantum: collegare il repository GitHub

### 1. Crea il repo su GitHub

- GitHub → **New repository** (vuoto, senza README se già hai il progetto in locale).

### 2. Collega la cartella locale e fai il primo push

Da PowerShell nella cartella del progetto:

```powershell
git remote add origin https://github.com/TUO_UTENTE/TUO_REPO.git
git branch -M main
git add -A
git status
git commit -m "chore: initial commit — TMP platform"
git push -u origin main
```

*(Se `git remote` esiste già, usa `git remote set-url origin …`.)*

**Non committare mai** `.env.local` o segreti: sono già in `.gitignore`.

---

## Netlify: deploy automatico da GitHub

1. Netlify → **Add new site** → **Import an existing project** → **GitHub**.
2. Autorizza Netlify e scegli il **repository**.
3. Branch di produzione: di solito **`main`**.
4. **Build command:** `npm run build` (allineato a `netlify.toml`).
5. Il plugin **`@netlify/plugin-nextjs`** (in `package.json` / `netlify.toml`) gestisce l’output Next.js.

### Variabili ambiente su Netlify

In **Site settings → Environment variables** copia le stesse chiavi che usi in produzione (Supabase, Stripe, Resend, `NEXT_PUBLIC_SITE_URL`, ecc.) — vedi `.env.example` e `docs/launch-official.md`.

Dopo il primo collegamento: **ogni `git push` su `main`** → nuovo deploy.

---

## “Dopo ogni commit voglio che vada su GitHub da solo”

Nel repo c’è **`.vscode/settings.json`** con:

- `"git.postCommitCommand": "push"`

In **Cursor / VS Code**, quando fai commit dal pannello **Source Control** (icona ramo), dopo il commit viene eseguito automaticamente il **push** verso `origin` (se il remote è configurato e hai permessi).

**Limiti:**

- Devi comunque fare **commit** (non basta salvare il file).
- Serve **connessione** e autenticazione GitHub (HTTPS + credential manager, oppure SSH).
- Se il push fallisce (conflitto, rete), risolvi e ripeti `git push`.

Per disattivare il push automatico: rimuovi la riga `git.postCommitCommand` da `.vscode/settings.json` o impostala su `none` nelle impostazioni utente.

---

## CI su GitHub (`.github/workflows/ci.yml`)

Su ogni push/PR verso `main` vengono eseguiti **lint**, **test** (Vitest) e **build**. Se falliscono, conviene non mergiare: Netlify potrebbe comunque tentare il deploy del branch collegato — meglio tenere `main` verde.

*(Gli E2E Playwright non sono in CI di default: richiedono browser e tempo; puoi aggiungerli in un job separato.)*

---

## Riepilogo operativo quotidiano

1. Lavori in locale → **Salva**.
2. **Source Control** → messaggio commit → **Commit** (con push automatico se abilitato).
3. Aspetti il deploy Netlify (dashboard Netlify mostra lo stato).

Se usi un **branch di sviluppo**, fai merge su `main` (o imposta su Netlify un **branch preview** diverso) secondo il tuo flusso.
