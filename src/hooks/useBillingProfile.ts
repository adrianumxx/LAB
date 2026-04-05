import { useQuery } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export const billingProfileQueryKey = ['billing-profile'] as const

export interface BillingProfileRow {
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_subscription_status: string | null
  billing_plan: string | null
}

async function fetchBillingProfile(): Promise<BillingProfileRow | null> {
  const supabase = createSupabaseBrowserClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error(userError?.message ?? 'Not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(
      'stripe_customer_id, stripe_subscription_id, stripe_subscription_status, billing_plan',
    )
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data as BillingProfileRow | null) ?? null
}

export function useBillingProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...billingProfileQueryKey, userId ?? 'none'],
    queryFn: fetchBillingProfile,
    enabled: Boolean(userId) && isSupabaseConfigured(),
  })
}
