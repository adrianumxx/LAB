import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { billingPlanSlugFromStripePriceId } from '@/lib/stripe/checkout-plans'
import { createSupabaseAdminClient, isServiceRoleConfigured } from '@/lib/supabase/admin'
import { getStripeWebhookSecret, isStripeWebhookConfigured } from '@/lib/stripe/env'
import { getStripe } from '@/lib/stripe/server'

export const runtime = 'nodejs'

function subscriptionPrimaryPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0]
  if (!item) return null
  const raw = item.price
  if (typeof raw === 'string') return raw
  if (raw && typeof raw === 'object' && 'id' in raw && typeof raw.id === 'string') {
    return raw.id
  }
  return null
}

async function patchProfile(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  patch: Record<string, string | null>,
) {
  const { error } = await admin
    .from('profiles')
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured() || !isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error:
          'Webhook misconfigured: need STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, Supabase URL + SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 503 },
    )
  }

  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      getStripeWebhookSecret() as string,
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid signature'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        const userId =
          session.metadata?.['supabase_user_id'] ?? session.client_reference_id ?? null
        const customer =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null
        const subRaw = session.subscription
        const subId = typeof subRaw === 'string' ? subRaw : subRaw?.id ?? null
        if (userId && customer) {
          await patchProfile(admin, userId, {
            stripe_customer_id: customer,
            stripe_subscription_id: subId,
          })
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.['supabase_user_id'] ?? null
        if (!userId) break
        const customer =
          typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const priceId = subscriptionPrimaryPriceId(sub)
        const slug = billingPlanSlugFromStripePriceId(priceId)
        const active = sub.status === 'active' || sub.status === 'trialing'
        const billingPlan = active && slug ? slug : null
        await patchProfile(admin, userId, {
          stripe_customer_id: customer,
          stripe_subscription_id: sub.id,
          stripe_subscription_status: sub.status,
          stripe_subscription_price_id: priceId,
          billing_plan: billingPlan,
        })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.['supabase_user_id'] ?? null
        if (!userId) break
        await patchProfile(admin, userId, {
          stripe_subscription_status: 'canceled',
          billing_plan: null,
          stripe_subscription_price_id: null,
        })
        break
      }
      default:
        break
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Webhook handler error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
