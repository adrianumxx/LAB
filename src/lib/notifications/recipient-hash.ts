import { createHash } from 'crypto'

/** SHA-256 hex del destinatario (email normalizzata) per audit senza PII in chiaro. */
export function hashRecipientEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  return createHash('sha256').update(normalized, 'utf8').digest('hex')
}
