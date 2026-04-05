import type { Metadata } from 'next'
import { Suspense } from 'react'
import SignUpForm from './SignUpForm'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your Tenant Management Platform account.',
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={<div className="text-center text-landing-muted text-sm">Caricamento…</div>}
    >
      <SignUpForm />
    </Suspense>
  )
}
