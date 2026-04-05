import { NextResponse } from 'next/server'
import { absoluteAppOrigin } from '@/lib/request-origin'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getStripePriceId, isStripeCheckoutConfigured } from '@/lib/stripe/env'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isStripeCheckoutConfigured()) {
    return NextResponse.json(
      {
        error:
          'Stripe checkout is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in .env.local.',
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

  const priceId = getStripePriceId() as string
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
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
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
