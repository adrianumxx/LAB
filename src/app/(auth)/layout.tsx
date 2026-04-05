import type { Metadata } from 'next'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SkipLink } from '@/components/layout/SkipLink'

export const metadata: Metadata = {
  description:
    'Sign in or sign up for the Tenant Management Platform.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="shell-auth">
      <SkipLink href="#auth-main">Vai al modulo di accesso</SkipLink>
      <div className="shell-auth-main flex-1 flex items-center justify-center p-4 sm:p-6">
        <main id="auth-main" className="w-full max-w-md outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
      <div className="shell-auth-main relative z-[2]">
        <SiteFooter tone="inverse" className="border-white/10 bg-black/10" />
      </div>
    </div>
  )
}
