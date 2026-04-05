# Template feedback QA (da copiare per ogni segnalazione)

```text
## ID caso: QA-__
## Squadra: A–J
## Data:
## Tester:
## Ambiente: staging | prod | locale   URL:
## Browser / OS:

### Esito: OK | FAIL | N/A

### Passi per riprodurre
1.
2.
3.

### Comportamento atteso


### Comportamento osservato


### Screenshot / video (link)


### Network / console (solo messaggi rilevanti, NO segreti)


### Priorità suggerita: P0 | P1 | P2

### Nota implementazione (per dev, dopo fix)
- PR / commit:
- Regressione coperta da: test e2e # / vitest / manuale
```

### Regole

- **Mai** incollare `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `CRON_SECRET`.
- Per problemi RLS: indicare **ruolo** e **id risorsa** (UUID mascherato se pubblico: primi 8 char…).
