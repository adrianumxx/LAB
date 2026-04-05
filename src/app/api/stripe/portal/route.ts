import { NextResponse } from 'next/server'
import { absoluteAppOrigin } from '@/lib/request-origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { isStripePortalConfigured } from '@/lib/stripe/env'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isStripePortalConfigured()) {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local and configure the Customer Portal in Stripe Dashboard.',
      },
      { status: 503 },
    )
  }

  const supabase = createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  const customerId =
    profile && typeof profile === 'object' && 'stripe_customer_id' in profile
      ? (profile as { stripe_customer_id: string | null }).stripe_customer_id
      : null

  if (!customerId) {
    return NextResponse.json(
      { error: 'No Stripe customer on file. Start a subscription from checkout first.' },
      { status: 400 },
    )
  }

  const origin = absoluteAppOrigin(request)

  try {
    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/account/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Portal session failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
