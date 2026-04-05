import { Resend } from 'resend'
import { logNotification } from '@/lib/notifications/log-notification'
import { getResendApiKey, getResendFromEmail, isResendConfigured } from '@/lib/resend/env'

let client: Resend | null = null

function getClient(): Resend {
  const key = getResendApiKey()
  if (!key) {
    throw new Error('RESEND_API_KEY missing')
  }
  if (!client) {
    client = new Resend(key)
  }
  return client
}

export type SendTransactionalInput = {
  notificationType: string
  to: string
  subject: string
  html: string
  /** Opzionale: evita doppio log su retry */
  skipLog?: boolean
  metadata?: Record<string, unknown>
}

export type SendTransactionalResult =
  | { ok: true; messageId: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string }

/**
 * Invia una mail via Resend e scrive su `notification_log` (se service role ok).
 */
export async function sendTransactionalEmail(
  input: SendTransactionalInput,
): Promise<SendTransactionalResult> {
  if (!isResendConfigured()) {
    if (!input.skipLog) {
      try {
        await logNotification({
          notificationType: input.notificationType,
          recipientEmail: input.to,
          status: 'skipped',
          errorMessage: 'Resend not configured (RESEND_API_KEY / RESEND_FROM_EMAIL)',
          metadata: input.metadata,
        })
      } catch {
        /* evita di far fallire il chiamante se il log fallisce */
      }
    }
    return { ok: false, skipped: true, reason: 'Resend not configured' }
  }

  const from = getResendFromEmail() as string

  try {
    const res = await getClient().emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    })

    const messageId = res.data?.id
    if (!messageId) {
      const errText = JSON.stringify(res.error ?? 'unknown')
      if (!input.skipLog) {
        try {
          await logNotification({
            notificationType: input.notificationType,
            recipientEmail: input.to,
            status: 'failed',
            errorMessage: errText,
            metadata: input.metadata,
          })
        } catch {
          /* ignore */
        }
      }
      return { ok: false, error: errText }
    }

    if (!input.skipLog) {
      try {
        await logNotification({
          notificationType: input.notificationType,
          recipientEmail: input.to,
          status: 'sent',
          providerMessageId: messageId,
          metadata: input.metadata,
        })
      } catch {
        /* ignore */
      }
    }

    return { ok: true, messageId }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (!input.skipLog) {
      try {
        await logNotification({
          notificationType: input.notificationType,
          recipientEmail: input.to,
          status: 'failed',
          errorMessage: msg,
          metadata: input.metadata,
        })
      } catch {
        /* ignore */
      }
    }
    return { ok: false, error: msg }
  }
}
