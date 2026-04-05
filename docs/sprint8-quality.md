# Sprint 8 — Qualità (Lighthouse, 375px, checklist)

## 8.1 Lighthouse / accessibilità (manuale)

Esegui Chrome DevTools → **Lighthouse** (Desktop + Mobile) sulle route:

- `/role-entry`, `/login`
- `/manager`, `/tenant`, `/owner` (con sessione di test per ruolo)
- `/account/preferences`, `/account/billing`

**Target indicativi:** Performance / Best practices / SEO ≥ 80 dove applicabile; **Accessibilità** ≥ 90 sulle pagine sopra.

Verifiche rapide aggiuntive:

- Contrasto testo su `bg-surface` / `bg-app` (light e dark).
- Focus visibile su bottoni e link (Tab dopo apertura menu hamburger).
- Menu mobile: **Esc** chiude il drawer e riporta il focus sul pulsante hamburger.

## 8.2 Mobile 375px

In DevTools responsive **375×667** (o 390×844):

- Nessuna scroll orizzontale su dashboard manager/owner/tenant e pagine account.
- Touch target minimo ~44px su hamburger e CTA principali (già allineato a `--s10` sul toggle).

## 8.3 Errori di rete

- Messaggi user-facing centralizzati in `userFacingNetworkError` + `NetworkQueryError` (retry).
- Per nuove query: preferire `NetworkQueryError` al posto di `FormError` + bottone retry duplicato.

## Riferimenti codice

- Drawer mobile: `MobileNavDrawer`, `useMobileDrawerA11y`, animazioni `mobile-nav-*` in `globals.css`.
- 404 dashboard: `src/app/(dashboard)/not-found.tsx`.
