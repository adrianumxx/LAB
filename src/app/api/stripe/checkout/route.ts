import { NextResponse } from 'next/server'
import { absoluteAppOrigin } from '@/lib/request-origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  type BillingPlanSlug,
  isBillingPlanSlug,
} from '@/lib/stripe/checkout-plans'
import {
  getStripePriceIdForPlan,
  isStripeCheckoutConfigured,
} from '@/lib/stripe/env'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'nodejs'

function defaultPlan(): BillingPlanSlug {
  return 'pro'
}

export async function POST(request: Request) {
  if (!isStripeCheckoutConfigured()) {
    return NextResponse.json(
      {
        error:
          'Stripe checkout is not configured. Set STRIPE_SECRET_KEY and at least one of STRIPE_PRICE_ID_SOLO, STRIPE_PRICE_ID_START, STRIPE_PRICE_ID_CORE, STRIPE_PRICE_ID_PRO (or legacy STRIPE_PRICE_ID for PRO only). See .env.example.',
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

  let plan: BillingPlanSlug = defaultPlan()
  const contentType = request.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as { plan?: unknown }
      if (typeof body?.plan === 'string' && isBillingPlanSlug(body.plan)) {
        plan = body.plan
      }
    } catch {
      /* body opzionale o non JSON */
    }
  }

  const priceId = getStripePriceIdForPlan(plan)
  if (!priceId) {
    return NextResponse.json(
      {
        error: `No Stripe price configured for plan "${plan}". Set the matching STRIPE_PRICE_ID_* env var.`,
      },
      { status: 400 },
    )
  }

  const origin = absoluteAppOrigin(request)
  const email = user.email ?? undefined

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  let customerId =
    profile && typeof profile === 'object' && 'stripe_customer_id' in profile
      ? (profile as { stripe_customer_id: string | null }).stripe_customer_id
      : null

  const stripe = getStripe()

  try {
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      const { error: upErr } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 400 })
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/account/billing?checkout=success`,
      cancel_url: `${origin}/account/billing?checkout=canceled`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, billing_plan: plan },
      subscription_data: {
        metadata: { supabase_user_id: user.id, billing_plan: plan },
      },
      allow_promotion_codes: true,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a session URL' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
