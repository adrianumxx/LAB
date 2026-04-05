import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { billingEnforcementEnabled, subscriptionStatusGrantsAccess } from './lib/billing'
import {
  getRequiredDashboardRole,
  isApiRoute,
  parseValidDashboardRoleFromMetadata,
} from './lib/route-guard'

/** Se Supabase non risponde (rete bloccata, DNS), getUser() può appendere all’infinito → browser “non risponde”. */
const SUPABASE_AUTH_TIMEOUT_MS = 2500

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error('supabase-auth-timeout')), ms)
    promise.then(
      (v) => {
        clearTimeout(id)
        resolve(v)
      },
      (e) => {
        clearTimeout(id)
        reject(e)
      },
    )
  })
}

export async function middleware(request: NextRequest) {
  /**
   * In `next dev` niente Supabase qui: evita richieste che non rispondono, 500 e porta 3000 “morta”.
   * Le dashboard restano protette da RoleGuard (client). In produzione (`next start`) il middleware
   * aggiorna la sessione e reindirizza come prima.
   * Per forzare il middleware anche in dev: SUPABASE_MIDDLEWARE_IN_DEV=1 in .env.local
   */
  const isDev = process.env.NODE_ENV === 'development'
  const middlewareInDev =
    process.env['SUPABASE_MIDDLEWARE_IN_DEV'] === '1' ||
    process.env['SUPABASE_MIDDLEWARE_IN_DEV'] === 'true'
  if (isDev && !middlewareInDev) {
    return NextResponse.next()
  }

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']?.trim()
  const anonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']?.trim()

  if (!url || !anonKey) {
    return NextResponse.next()
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  try {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    })

    const {
      data: { user },
    } = await withTimeout(
      supabase.auth.getUser(),
      SUPABASE_AUTH_TIMEOUT_MS,
    )

    if (isApiRoute(pathname)) {
      return supabaseResponse
    }

    const required = getRequiredDashboardRole(pathname)
    if (required === null) {
      return supabaseResponse
    }

    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/role-entry'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }

    const actual = parseValidDashboardRoleFromMetadata(user.user_metadata)
    if (actual === null) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/account/setup'
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }

    if (actual !== required) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${actual}`
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }

    if (required !== null && billingEnforcementEnabled() && user) {
      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('stripe_subscription_status')
        .eq('id', user.id)
        .maybeSingle()

      const status =
        !profErr && prof && typeof prof === 'object' && 'stripe_subscription_status' in prof
          ? (prof as { stripe_subscription_status: string | null }).stripe_subscription_status
          : null

      if (
        !profErr &&
        !subscriptionStatusGrantsAccess(status)
      ) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/account/billing'
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }
    }

    return supabaseResponse
  } catch {
    /* URL/key errati, rete, Supabase down → senza catch tutta l'app risponde 500 */
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
