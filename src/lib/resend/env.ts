/** Resend — solo server. Mai NEXT_PUBLIC_. */

export function getResendApiKey(): string | undefined {
  return process.env['RESEND_API_KEY']?.trim() || undefined
}

export function getResendFromEmail(): string | undefined {
  return process.env['RESEND_FROM_EMAIL']?.trim() || undefined
}

export function isResendConfigured(): boolean {
  return Boolean(getResendApiKey() && getResendFromEmail())
}
