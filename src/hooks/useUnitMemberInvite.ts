import { useMutation } from '@tanstack/react-query'
import { InviteUnitMemberError } from '@/hooks/invite-unit-member-error'

export interface InviteUnitMemberPayload {
  email: string
  unitId: string
  linkRole: 'owner' | 'tenant'
}

export async function inviteUnitMember(
  payload: InviteUnitMemberPayload,
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch('/api/invite-unit-member', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json()) as {
    error?: string
    message?: string
    ok?: boolean
    hint?: string
  }
  if (!res.ok) {
    throw new InviteUnitMemberError(data.error ?? 'Invite failed', data.hint)
  }
  return { ok: Boolean(data.ok), message: data.message }
}

export function useUnitMemberInvite(onSuccess?: () => void) {
  return useMutation({
    mutationFn: inviteUnitMember,
    onSuccess: () => onSuccess?.(),
  })
}
