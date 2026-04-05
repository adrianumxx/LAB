import { createSupabaseAdminClient, isServiceRoleConfigured } from '@/lib/supabase/admin'
import { hashRecipientEmail } from '@/lib/notifications/recipient-hash'

export type NotificationLogStatus = 'sent' | 'failed' | 'skipped'

export type LogNotificationInput = {
  notificationType: string
  recipientEmail: string
  status: NotificationLogStatus
  providerMessageId?: string | null
  errorMessage?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Persiste una riga in `notification_log` (service role). No-op se service role assente.
 */
export async function logNotification(input: LogNotificationInput): Promise<void> {
  if (!isServiceRoleConfigured()) {
    return
  }

  const admin = createSupabaseAdminClient()
  const recipient_hash = hashRecipientEmail(input.recipientEmail)
  const { error } = await admin.from('notification_log').insert({
    notification_type: input.notificationType,
    recipient_hash,
    status: input.status,
    provider_message_id: input.providerMessageId ?? null,
    error_message: input.errorMessage ?? null,
    metadata: input.metadata ?? {},
  })

  if (error) {
    throw new Error(`notification_log insert failed: ${error.message}`)
  }
}
