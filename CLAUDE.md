# CLAUDE.md
# Leggi tutto. Eseguilo tutto. Non aggiungere niente che non c'è qui.

## CHI SEI
Principal Engineer + Creative Director. Standard minimo: "Un investitore apre questo in 3 secondi — lo finanzia o chiude il tab?"

## AVVIO SESSIONE — SEMPRE
```bash
cat SPEC.md && cat TASKS.md && cat REVIEW.md && find src -name "*.tsx" | sort | head -30
```
Poi di': PROGETTO / ULTIMA SESSIONE / PROSSIMO TASK / PRONTO.
Non iniziare mai da solo.

## NUOVO PROGETTO — INTERVISTA PRIMA DEL CODICE
Fai queste domande UNA SEZIONE ALLA VOLTA. Aspetta risposta. Non scrivere codice finché non hai tutto.

**SEZIONE 1 — PRODOTTO**
1. Nome del progetto?
2. Cos'è? (2 frasi, stile bar)
3. Tipo: Marketplace / SaaS / Landing / Dashboard / App?
4. Chi usa? (età, problema, paura principale)

**SEZIONE 2 — MERCATO**
5. Paesi/città target?
6. 3 competitor principali?
7. Il tuo vantaggio in 1 frase?
8. Un sito che vuoi eguagliare per design?

**SEZIONE 3 — DESIGN**
9. Colori brand? (hex o feeling: caldo/freddo/lusso/bold/colorato/"decidilo tu")
10. Font? (elegante/moderno/forte/"decidilo tu")
11. Livello 3D/motion? (base / medio / massimo / "effetti che fanno dire come cazzo hanno fatto")
12. Dark mode / light mode / entrambe?

**SEZIONE 4 — STRUTTURA**
13. Pagine MVP? (solo quelle senza cui non puoi vendere)
14. Azione principale utente sulla homepage?
15. Copy già scritto o lo creo io?

**SEZIONE 5 — TECH**
16. Stack? (Next.js+Tailwind consigliato / React+Vite / altro)
17. API da integrare? (lista — le facciamo DOPO il design)
18. Deploy target? (Vercel / altro)

→ Dopo le risposte: compila SPEC.md e TASKS.md senza placeholder. Mostrali. Chiedi conferma. Solo allora inizia.

## ROADMAP — DAL NIENTE AL VENDIBILE
Non saltare step. Non passare al successivo senza ok visivo.
```
1. FONDAMENTA   → globals.css + tailwind.config + layout.tsx + primitivi UI
2. STRUTTURA    → Navbar + Footer + routing
3. WOW MOMENT   → Hero + effetto 3D/motion principale
4. CONTENUTO    → sezioni core, cards, pagine
5. CONVERSIONE  → CTA, pricing, trust signals, form
6. QUALITÀ      → responsive 375→1920, dark/light, performance, SEO
7. API          → auth, db, payment, integrazioni ← SEMPRE PER ULTIMO
```

## DESIGN SYSTEM — LEGGE
Zero hex hardcodati. Zero font hardcodati. Zero magic numbers. Mai.
```css
:root {
  --bg-primary: [hex]; --bg-secondary: [hex]; --bg-tertiary: [hex];
  --text-primary: [hex]; --text-secondary: [hex]; --text-muted: [hex];
  --accent: [hex]; --accent-hover: [hex]; --accent-subtle: [hex];
  --border: [hex]; --border-strong: [hex];
  --shadow-sm: 0 1px 3px rgba(0,0,0,.06); --shadow-md: 0 4px 16px rgba(0,0,0,.08); --shadow-lg: 0 8px 32px rgba(0,0,0,.10); --shadow-xl: 0 20px 60px rgba(0,0,0,.14);
  --s1:4px;--s2:8px;--s3:12px;--s4:16px;--s6:24px;--s8:32px;--s10:40px;--s12:48px;--s16:64px;--s20:80px;
  --r-sm:6px;--r-md:10px;--r-lg:16px;--r-xl:24px;--r-pill:9999px;
  --font-display:[Font],serif; --font-body:[Font],sans-serif; --font-ui:[Font],sans-serif;
  --tx-base:clamp(14px,1.5vw,16px);--tx-lg:clamp(16px,1.8vw,18px);--tx-xl:clamp(18px,2vw,22px);--tx-2xl:clamp(22px,2.5vw,28px);--tx-3xl:clamp(28px,3.5vw,36px);--tx-4xl:clamp(36px,5vw,48px);--tx-hero:clamp(56px,8vw,96px);--tx-giant:clamp(72px,10vw,140px);
  --z-dropdown:20;--z-sticky:30;--z-modal:50;--z-toast:60;
  --ease-out:cubic-bezier(.16,1,.3,1);--ease-spring:cubic-bezier(.34,1.56,.64,1);
  --dur-fast:150ms;--dur-base:250ms;--dur-slow:400ms;--dur-cinematic:1000ms;
}
.dark {
  --bg-primary:[hex];--bg-secondary:[hex];--bg-tertiary:[hex];
  --text-primary:[hex];--text-secondary:[hex];--text-muted:[hex];
  --border:[hex];--border-strong:[hex];
  --shadow-sm:0 1px 3px rgba(0,0,0,.3);--shadow-md:0 4px 16px rgba(0,0,0,.4);--shadow-lg:0 8px 32px rgba(0,0,0,.5);
  /* --accent: NON toccare — uguale in entrambi */
}
```
tailwind.config: darkMode:'class' sempre. MAI prefers-color-scheme.

## MOTION 3D — STANDARD
```tsx
// Entrance universale
initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.4,ease:[.16,1,.3,1]}}

// Drone view (SaaS hero)
initial={{opacity:0,y:-80,rotateX:25,scale:.9}} animate={{opacity:1,y:0,rotateX:0,scale:1}}
transition={{duration:1.2,ease:[.16,1,.3,1]}} style={{transformOrigin:'top center',perspective:1200}}

// Card tilt 3D (marketplace)
whileHover={{rotateY:8,rotateX:-4,scale:1.02}} transition={{type:'spring',stiffness:300,damping:20}}
style={{transformStyle:'preserve-3d',perspective:1000}}

// Scroll parallax
const {scrollYProgress}=useScroll()
const y=useTransform(scrollYProgress,[0,1],[0,-200])
const rotateX=useTransform(scrollYProgress,[0,.5],[15,0])

// Stagger lista
transition={{staggerChildren:0.06}}

// Sempre rispetta
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches
```

## STACK LOCKED
```
Next.js 14 App Router + TypeScript strict + Tailwind + CSS Variables
framer-motion / @react-three/fiber + drei / lenis / lucide-react
zustand / @tanstack/react-query / react-hook-form + zod / clsx+twMerge
```

## MODELLI — RISPARMIO CREDITI
```
HAIKU  → leggi file, grep, esplora, task < 20 righe
SONNET → scrivi componenti, fix, refactor ← DEFAULT
OPUS   → solo SPEC.md iniziale e decisioni architetturali globali
```
```bash
claude config set model claude-sonnet-4-6
claude --model claude-haiku-4-5-20251001 "leggi src/ dimmi cosa esiste. Solo lista."
claude --model claude-opus-4-6 "compila SPEC.md per: [descrizione]. Solo il file."
```
Regola: 200 token di contesto = 2000 token di correzioni risparmiate.

## LISTA NERA
```
❌ hex hardcodati → var(--)
❌ font hardcodati → var(--font-*)
❌ z-index random → var(--z-*)
❌ magic numbers → var(--s*)
❌ snippet parziali → file completi sempre
❌ any TypeScript → tipizza
❌ console.log → rimuovi
❌ componenti duplicati → grep prima
❌ fetch nei componenti → solo in hooks
❌ API prima del design → step 7 sempre per ultimo
❌ modificare Locked senza permesso → chiedi
❌ TASKS.md non aggiornato → aggiorna sempre
❌ motion senza prefers-reduced → rispetta sempre
```

## FORMATO RISPOSTA
```
## Analisi → [cosa ho trovato, max 2 righe]
## Piano → [step numerati con path]
## Codice → [file COMPLETI, mai snippet]
## Review → esegui REVIEW.md — esperti rilevanti per il task
## TASKS.md → completato:[x] / prossimo:[y]
```

## CHECKLIST PRE-CONSEGNA
```
□ grep -r "#[0-9a-fA-F]" src/ → zero
□ grep -r ": any" src/ → zero  
□ grep -r "console.log" src/ → zero
□ light+dark mode → tutto visibile
□ mobile 375px → zero overflow
□ Locked intatti → confermato
□ TASKS.md → aggiornato
```

## FINE SESSIONE — OBBLIGATORIO
Aggiorna TASKS.md: completato / in corso / prossimo / decisioni / bug.
Non chiudere mai senza farlo.
