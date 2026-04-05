'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TenantChecklistList } from '@/components/tenant/TenantChecklistList'
import {
  itemsForUnit,
  useTenantChecklistItems,
  useToggleTenantChecklistItem,
} from '@/hooks/useTenantChecklistItems'
import { useTenantDashboardData } from '@/hooks/useTenantDashboardData'
import { useAuthStore } from '@/lib/auth-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CheckCircle2, FileText, Home } from 'lucide-react'

export default function TenantOnboarding() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const tenantLive =
    isSupabaseConfigured() &&
    user?.role === 'tenant' &&
    Boolean(user?.id) &&
    !user.needsRoleSetup

  const dash = useTenantDashboardData(tenantLive ? user.id : null)
  const checklist = useTenantChecklistItems(tenantLive ? user.id : null)
  const toggleChecklist = useToggleTenantChecklistItem()

  const firstUnit = dash.data?.units[0]
  const checklistForUnit = firstUnit
    ? itemsForUnit(checklist.data, firstUnit.id)
    : []

  const [step, setStep] = useState<'welcome' | 'documents' | 'completion'>(
    'welcome',
  )

  const handleContinue = () => {
    if (step === 'welcome') {
      setStep('documents')
    } else if (step === 'documents') {
      setStep('completion')
    }
  }

  const handleComplete = async () => {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.updateUser({
        data: { tenant_onboarding_completed: true },
      })
    }
    router.push('/tenant')
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-2 justify-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'welcome' || step === 'documents' || step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}
        >
          1
        </div>
        <div
          className={`h-1 w-12 ${step === 'documents' || step === 'completion' ? 'bg-primary' : 'bg-neutral-200'}`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'documents' || step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}
        >
          2
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
          3
        </div>
      </div>

      {/* Step 1: Welcome */}
      {step === 'welcome' && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Your Rental</CardTitle>
            <CardDescription>
              Let&apos;s get your tenancy set up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Home className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Your Apartment</h3>
                  <p className="text-sm text-secondary">
                    123 Rue de la Paix, Apt 4B, Brussels
                  </p>
                </div>
              </div>

              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Move-in Date:</strong> April 15, 2026
                </p>
                <p className="text-sm">
                  <strong>Lease Duration:</strong> 12 months
                </p>
              </div>

              <p className="text-sm text-secondary">
                We need a few documents from you to complete your move-in.
                This should only take a few minutes.
              </p>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Documents */}
      {step === 'documents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents & checklist</CardTitle>
              <CardDescription>
                Upload PDFs from your tenant dashboard (Documents section). Your move-in checklist
                is saved to your account and matches what you see on /tenant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'ID Verification', icon: '🪪' },
                    { name: 'Proof of Income', icon: '📊' },
                    { name: 'References', icon: '📋' },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg bg-surface/50"
                    >
                      <FileText className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-secondary">
                          Use Dashboard → Documents to upload PDFs when your unit is linked.
                        </p>
                      </div>
                      <span className="text-lg shrink-0" aria-hidden>
                        {doc.icon}
                      </span>
                    </div>
                  ))}
                </div>

                <Button onClick={handleContinue} className="w-full" size="lg">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>

          {tenantLive && firstUnit && (
            <Card>
              <CardHeader>
                <CardTitle>Your checklist · {firstUnit.name}</CardTitle>
                <CardDescription>
                  Progress is stored in the database — it persists after you sign out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TenantChecklistList
                  items={checklistForUnit}
                  disabled={toggleChecklist.isPending || checklist.isLoading}
                  errorMessage={
                    checklist.isError
                      ? checklist.error instanceof Error
                        ? checklist.error.message
                        : 'Failed to load checklist'
                      : null
                  }
                  emptyMessage="No checklist items yet. They appear when your manager links you to this unit."
                  onToggle={(id, next) => {
                    void toggleChecklist.mutateAsync({ id, completed: next })
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 3: Completion */}
      {step === 'completion' && (
        <Card>
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
              <h2 className="text-2xl font-bold">You&apos;re Ready!</h2>
              <p className="text-secondary max-w-sm">
                Your move-in documents are submitted. You can now access your
                apartment information and communicate with your landlord.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-left space-y-2 my-6">
                <p className="text-sm">
                  <strong>Next Steps:</strong>
                </p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>✓ Review your lease document</li>
                  <li>✓ Report any move-in issues</li>
                  <li>✓ Schedule move-in inspection</li>
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
