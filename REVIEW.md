# REVIEW.md — SISTEMA DI AUTOCORREZIONE
# 15 esperti controllano ogni output prima che arrivi all'utente.
# Claude esegue questo review su SE STESSO dopo ogni task.
# Non si consegna MAI niente che non abbia passato tutti i check.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## COME FUNZIONA

Dopo aver scritto il codice, prima di rispondere all'utente:
1. Esegui tutti i check rilevanti per il task
2. Per ogni FAIL → fixa immediatamente → re-check
3. Solo quando tutti i check sono OK → consegna
4. Allega il report completo alla risposta

Non dire mai "ho finito" senza aver eseguito questo file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ESPERTO 1 — PRINCIPAL ENGINEER
*"Il codice funzionerà in produzione con 1 milione di utenti?"*

```
□ Zero any TypeScript — grep -r ": any" src/
□ Zero console.log — grep -r "console.log" src/
□ Zero TODO nel codice consegnato
□ Nessun import inutilizzato
□ Nessuna variabile dichiarata e mai usata
□ Ogni useEffect ha le dipendenze corrette
□ Ogni .map() ha key univoca
□ Nessuna fetch diretta nei componenti — solo in hooks
□ Error boundaries presenti su componenti critici
□ Loading e error state gestiti ovunque ci sia async
```

## ESPERTO 2 — CREATIVE DIRECTOR
*"Questo design fa venire voglia di comprare o di chiudere il tab?"*

```
□ Il wow moment è nel primo schermo — non bisogna scrollare per vederlo
□ La gerarchia visiva è chiara — l'occhio sa dove andare
□ Il CTA principale è impossibile da non vedere
□ Le animazioni aggiungono valore — non sono decorazione
□ I font scelti sono caratteriali, non generici (no Inter, no Roboto)
□ I colori hanno contrasto sufficiente — non pastello su pastello
□ Le immagini sono le protagoniste — la UI sparisce
□ C'è almeno UN elemento che nessun competitor ha
□ Il design funziona anche senza JavaScript
□ La prima impressione in 3 secondi è: "questo è serio"
```

## ESPERTO 3 — UX RESEARCHER
*"Un utente reale riesce a completare l'azione principale senza aiuto?"*

```
□ L'azione principale è raggiungibile in max 2 click dalla homepage
□ Nessun elemento interattivo è sotto i 44px (touch target)
□ I form hanno label visibili — non solo placeholder
□ Gli errori dei form sono chiari e dicono come correggerli
□ Il feedback di ogni azione è immediato (loading, success, error)
□ La navigazione è consistente su tutte le pagine
□ Non ci sono vicoli ciechi — c'è sempre un'azione successiva
□ Il back button del browser funziona sempre come atteso
□ Le pagine vuote (zero risultati) hanno una call to action
□ L'utente non si chiede mai "e adesso cosa faccio?"
```

## ESPERTO 4 — FRONTEND PERFORMANCE ENGINEER
*"Questo carica in meno di 2 secondi su mobile 3G?"*

```
□ Tutte le immagini usano next/image con width e height espliciti
□ I font hanno font-display: swap o optional
□ Nessun bundle > 200kb non splittato
□ Le animazioni usano transform e opacity — mai width/height/top/left
□ I componenti Three.js/Canvas hanno Suspense con fallback
□ Le liste lunghe usano virtualizzazione (react-virtual)
□ Le API calls hanno cache con TanStack Query
□ Nessuna libreria importata intera quando serve solo una funzione
□ Le immagini hero hanno priority={true}
□ Nessun layout shift visibile (CLS < 0.1)
```

## ESPERTO 5 — ACCESSIBILITY SPECIALIST
*"Una persona con disabilità visiva riesce a usare questo?"*

```
□ Contrasto testo/sfondo ≥ 4.5:1 per testo normale
□ Contrasto testo/sfondo ≥ 3:1 per testo grande (> 18px bold)
□ Tutti gli img hanno alt descrittivo — non "image" o vuoto
□ Tutti i bottoni icon-only hanno aria-label
□ Focus ring visibile su tutti gli elementi interattivi
□ Tab order logico — segue il flusso visivo
□ I modali intrappolano il focus correttamente
□ Screen reader legge i contenuti nell'ordine giusto
□ prefers-reduced-motion è rispettato su tutte le animazioni
□ I colori non sono l'unico modo per trasmettere informazione
```

## ESPERTO 6 — DARK/LIGHT MODE SPECIALIST
*"Ogni pixel è corretto in entrambi i temi?"*

```
□ grep -r "#[0-9a-fA-F]" src/ → zero risultati
□ grep -r "bg-white\|bg-black\|text-white\|text-black" src/ → zero (solo via var)
□ Tutti i colori usano var(--) dal globals.css
□ Le ombre sono più intense in dark mode
□ I bordi sono visibili in entrambi i temi
□ Le immagini con sfondo bianco hanno gestione in dark mode
□ I placeholder dei form sono leggibili in entrambi i temi
□ I toast/notification sono leggibili in entrambi i temi
□ Il ThemeToggle funziona e persiste in localStorage
□ Nessun flash di tema sbagliato al caricamento (FOUC)
```

## ESPERTO 7 — RESPONSIVE DESIGN ENGINEER
*"Funziona perfettamente da 320px a 2560px?"*

```
□ Testato a 375px (iPhone SE) — zero overflow, zero testo troncato
□ Testato a 768px (tablet) — layout intermedio sensato
□ Testato a 1280px (laptop) — layout principale corretto
□ Testato a 1920px (desktop) — max-width rispettato, non si espande all'infinito
□ Nessun elemento con width fissa che rompe su mobile
□ I font usano clamp() — mai px fissi per i titoli
□ Le griglie collassano in modo logico (non spariscono elementi)
□ Le immagini non si stirano o distorcono
□ I touch target sono usabili su mobile (min 44px)
□ L'orientamento landscape su mobile è gestito
```

## ESPERTO 8 — MOTION DESIGNER
*"Le animazioni sono cinema o fastidio?"*

```
□ Ogni animazione ha un purpose — non è solo decorazione
□ Le entrance usano opacity + transform — mai solo opacity
□ Le spring hanno stiffness e damping calibrati (non default)
□ Lo stagger delle liste è max 0.08s — oltre stanca
□ Le animazioni cinematografiche (hero) durano 0.8-1.2s
□ Le micro-interazioni (hover, click) durano max 0.2s
□ Nessuna animazione si ripete all'infinito senza pausa
□ Il 3D usa perspective e transformStyle:'preserve-3d' correttamente
□ Le animazioni di scroll sono fluide — nessun jank
□ prefers-reduced-motion: tutte le animazioni hanno fallback statico
```

## ESPERTO 9 — COPYWRITER / CONVERSION SPECIALIST
*"Il testo convince o informa solo?"*

```
□ Il titolo hero dice il beneficio — non descrive il prodotto
□ Il sottotitolo risponde a "perché dovrei scegliere voi?"
□ Il CTA principale usa un verbo d'azione — non "Scopri di più"
□ I trust signal sono specifici (numeri reali, non "migliaia di clienti")
□ Le feature sono descritte come benefici per l'utente
□ Il tono è coerente su tutte le pagine
□ Nessun lorem ipsum nel codice consegnato
□ Le error message sono umane — non codici tecnici
□ I placeholder dei form sono esempi reali — non "inserisci qui"
□ La CTA finale è diversa dalla prima — crea urgenza o rimuove rischio
```

## ESPERTO 10 — SEO ENGINEER
*"Google capisce cosa è questo sito e lo mostra a chi cerca?"*

```
□ Ogni pagina ha <title> unico e descrittivo (50-60 char)
□ Ogni pagina ha <meta name="description"> (150-160 char)
□ La struttura heading è corretta: un solo H1, poi H2, H3
□ Le immagini hanno alt text con keyword rilevanti
□ I link interni hanno testo descrittivo — non "clicca qui"
□ L'URL structure è leggibile (/listings/golden-retriever non /l/a3f9)
□ Il sito ha sitemap.xml generata
□ Il sito ha robots.txt
□ I dati strutturati (JSON-LD) sono presenti dove rilevante
□ Il canonical tag è corretto su pagine con contenuto simile
```

## ESPERTO 11 — SECURITY ENGINEER
*"Un attaccante può rubare dati o bucare il sistema?"*

```
□ Zero API keys nel codice client — solo in .env.local
□ .env.local è in .gitignore
□ Le variabili pubbliche usano NEXT_PUBLIC_ solo se devono essere pubbliche
□ I form hanno protezione CSRF dove necessario
□ I redirect hanno validazione — nessun open redirect
□ Le API routes validano l'input con Zod prima di usarlo
□ I dati sensibili non appaiono nei console.log
□ L'autenticazione è verificata server-side — mai solo client
□ Le immagini uploadate sono validate per tipo e dimensione
□ Nessuna dependency con vulnerabilità note (npm audit)
```

## ESPERTO 12 — TYPESCRIPT ARCHITECT
*"Il codice è tipo-safe e manutenibile tra 1 anno?"*

```
□ Tutti i tipi sono definiti in src/lib/types.ts
□ Nessun type assertion (as Type) senza commento che spiega perché
□ Le API response hanno tipi espliciti — non any o unknown non gestito
□ I props di ogni componente hanno interface dedicata
□ I return type delle funzioni pure sono dichiarati
□ Gli enum sono usati per valori fissi — non stringhe magiche
□ I generics sono usati dove riducono la duplicazione
□ tsconfig.json ha strict: true
□ Nessun @ts-ignore senza commento che spiega il motivo
□ I path alias (@/components) sono configurati e usati consistentemente
```

## ESPERTO 13 — DESIGN SYSTEM GUARDIAN
*"Il sistema di design è consistente o ogni componente fa da solo?"*

```
□ Tutti i colori vengono da var(--) in globals.css
□ Tutti i font vengono da var(--font-*) in globals.css
□ Tutti gli spacing usano var(--s*) o multipli di 4px
□ Tutti i border-radius usano var(--r-*)
□ Tutte le shadow usano var(--shadow-*)
□ Tutti i z-index usano var(--z-*)
□ Le transizioni usano var(--ease-*) e var(--dur-*)
□ I componenti usano cn() per classi condizionali — mai template string
□ Nessun componente duplicato — grep prima di creare
□ Le varianti usano prop variant — mai due componenti separati
```

## ESPERTO 14 — PRODUCT MANAGER
*"Questo MVP è davvero il minimo per vendere, o ha feature inutili?"*

```
□ Ogni feature presente risponde alla domanda "senza questa non posso vendere?"
□ Nessuna feature "sarebbe bello avere" nel codice
□ Il flusso principale (dalla landing all'azione) è completo e funziona
□ Le API sono integrate solo se il design è già approvato (step 7)
□ I componenti Locked non sono stati modificati senza permesso
□ TASKS.md è aggiornato con lo stato reale
□ Il prossimo task è chiaro e scritto in TASKS.md
□ Non ci sono lavori a metà nel codebase
□ Ogni pagina ha un purpose chiaro — nessuna pagina orfana
□ Il prodotto può essere mostrato a un investitore oggi
```

## ESPERTO 15 — SENIOR CODE REVIEWER
*"Un developer senior che vede questo codice per la prima volta — lo capisce e lo rispetta?"*

```
□ I nomi di variabili e funzioni descrivono cosa fanno — no a, b, x, data2
□ Le funzioni fanno una cosa sola — nessuna funzione > 40 righe
□ I commenti spiegano il PERCHÉ — non il COSA (il cosa si legge dal codice)
□ La struttura delle cartelle rispetta CLAUDE.md
□ Gli import seguono l'ordine definito in CLAUDE.md
□ Nessun file > 200 righe senza motivo — se è lungo, splittalo
□ I componenti sono riutilizzabili — nessuna logica hardcodata per una sola pagina
□ Il codice è idempotente — eseguirlo due volte dà lo stesso risultato
□ Le edge case sono gestite (array vuoto, null, undefined, errore rete)
□ Il codice sembra scritto da una sola persona con un unico stile
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## REPORT DI CONSEGNA — FORMATO OBBLIGATORIO

Allega sempre questo alla fine di ogni risposta:

```
## REVIEW REPORT ✓

ESPERTO 1  Principal Engineer      ✅ / ⚠️ [nota se warn]
ESPERTO 2  Creative Director       ✅ / ⚠️
ESPERTO 3  UX Researcher           ✅ / ⚠️
ESPERTO 4  Performance Engineer    ✅ / ⚠️
ESPERTO 5  Accessibility           ✅ / ⚠️
ESPERTO 6  Dark/Light Mode         ✅ / ⚠️
ESPERTO 7  Responsive              ✅ / ⚠️
ESPERTO 8  Motion Designer         ✅ / ⚠️
ESPERTO 9  Copywriter              ✅ / ⚠️
ESPERTO 10 SEO                     ✅ / ⚠️
ESPERTO 11 Security                ✅ / ⚠️
ESPERTO 12 TypeScript              ✅ / ⚠️
ESPERTO 13 Design System           ✅ / ⚠️
ESPERTO 14 Product Manager         ✅ / ⚠️
ESPERTO 15 Code Reviewer           ✅ / ⚠️

PROBLEMI TROVATI E FIXATI:
→ [problema] — [fix applicato]

PROBLEMI NOTI NON FIXATI (con motivo):
→ [problema] — [perché non fixato ora] — aggiunto a TASKS.md
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## QUANDO USARE QUALI ESPERTI

Non tutti i 15 esperti servono per ogni task.
Scegli in base a cosa hai fatto:

```
Nuovo componente UI    → 1,2,3,5,6,7,8,13,15
Fix bug                → 1,12,15
Nuova pagina           → 1,2,3,4,6,7,9,10,14,15
Hero/Landing           → 2,3,8,9,10,14
Form/Input             → 1,3,5,9,11,12
Animazioni             → 4,8
API integration        → 1,11,12
Design system update   → 6,13,15
Copy/testi             → 9,14
Performance fix        → 4,7
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SCALA DI SEVERITÀ

```
🔴 BLOCCANTE  → non si consegna finché non è fixato
               (sicurezza, crash, dark mode rotto, testo illeggibile)

🟡 WARNING    → si consegna ma si aggiunge a TASKS.md con priorità alta
               (performance non ottimale, copy da migliorare)

🔵 NOTA       → si consegna, si documenta per dopo
               (nice to have, ottimizzazione futura)
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ogni riga di codice che supera questi 15 check
è una riga che potrebbe stare in un prodotto da miliardi.
Nessuna eccezione. Nessuna scorciatoia. Mai.
