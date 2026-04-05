import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Access your manager, owner, or tenant dashboard.',
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="text-center text-landing-muted text-sm">Caricamento…</div>}
    >
      <LoginForm />
    </Suspense>
  )
}
