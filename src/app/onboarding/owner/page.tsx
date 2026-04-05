'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormField, FormLabel } from '@/components/ui/Form'
import { CheckCircle2 } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export default function OwnerOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState<'properties' | 'completion'>('properties')

  const handlePropertiesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('completion')
  }

  const handleComplete = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.updateUser({
        data: { owner_onboarding_completed: true },
      })
    }
    router.push('/owner')
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-2 justify-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'properties' || step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}
        >
          1
        </div>
        <div
          className={`h-1 w-12 ${step === 'completion' ? 'bg-primary' : 'bg-neutral-200'}`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}
        >
          2
        </div>
      </div>

      {/* Step 1: Properties */}
      {step === 'properties' && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Properties</CardTitle>
            <CardDescription>
              Link the apartments you own to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePropertiesSubmit} className="space-y-6">
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <p className="text-sm text-secondary mb-4">
                  Your property manager will add your properties to the system.
                  You&apos;ll be able to see them here once they&apos;re added.
                </p>
              </div>

              <FormField>
                <FormLabel>Invitation Link</FormLabel>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://tmp.app/invite/owner/abc123"
                    readOnly
                    className="flex-1 px-4 py-2 border border-border rounded-md bg-neutral-50 dark:bg-neutral-800 text-sm"
                  />
                  <Button type="button" variant="secondary" size="md">
                    Copy
                  </Button>
                </div>
              </FormField>

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Completion */}
      {step === 'completion' && (
        <Card>
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
              <h2 className="text-2xl font-bold">Welcome!</h2>
              <p className="text-secondary max-w-sm">
                Your account is ready. Once your property manager adds your
                properties, you&apos;ll see them on your dashboard.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-left space-y-2 my-6">
                <p className="text-sm">
                  <strong>What&apos;s Next:</strong>
                </p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>✓ Wait for property manager to add your units</li>
                  <li>✓ View property status and documents</li>
                  <li>✓ Approve repairs and maintenance</li>
                </ul>
              </div>
              <Button onClick={() => void handleComplete()} size="lg" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
