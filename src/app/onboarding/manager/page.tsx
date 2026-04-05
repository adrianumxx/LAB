'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField, FormLabel, FormError } from '@/components/ui/Form'
import { useOnboardingStore } from '@/lib/onboarding-store'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { managerDashboardQueryKey } from '@/hooks/useManagerDashboardData'
import { parseUnitState } from '@/lib/types/database'
import { CheckCircle2 } from 'lucide-react'

export default function ManagerOnboarding() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<'workspace' | 'unit' | 'completion'>(
    'workspace',
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const managerData = useOnboardingStore((state) => state.managerData)
  const setManagerData = useOnboardingStore((state) => state.setManagerData)

  const handleWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!managerData.workspaceName.trim()) {
      setError('Workspace name is required')
      return
    }

    setStep('unit')
  }

  const handleUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!managerData.firstUnitName.trim()) {
      setError('Unit name is required')
      return
    }

    setStep('completion')
  }

  const handleComplete = async () => {
    setError(null)

    if (!isSupabaseConfigured()) {
      router.push('/manager')
      return
    }

    setSaving(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be signed in to save your workspace.')
        return
      }

      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: managerData.workspaceName.trim(),
          created_by: user.id,
        })
        .select('id')
        .single()

      if (workspaceError) {
        setError(workspaceError.message)
        return
      }

      const { error: unitError } = await supabase.from('units').insert({
        workspace_id: workspace.id,
        name: managerData.firstUnitName.trim(),
        unit_state: parseUnitState(managerData.firstUnitState),
      })

      if (unitError) {
        const msg = unitError.message.toLowerCase()
        if (msg.includes('row-level security')) {
          setError(
            'You have reached the unit limit for your current plan. Subscribe in Billing to add more units.',
          )
          return
        }
        setError(unitError.message)
        return
      }

      await queryClient.invalidateQueries({ queryKey: [...managerDashboardQueryKey] })
      router.push('/manager')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workspace')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex items-center gap-2 justify-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'workspace' || step === 'unit' || step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}>
          1
        </div>
        <div className={`h-1 w-12 ${step === 'unit' || step === 'completion' ? 'bg-primary' : 'bg-neutral-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'unit' || step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}>
          2
        </div>
        <div className={`h-1 w-12 ${step === 'completion' ? 'bg-primary' : 'bg-neutral-200'}`} />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${step === 'completion'
            ? 'bg-primary text-white'
            : 'bg-neutral-200 text-neutral-600'}`}>
          3
        </div>
      </div>

      {/* Step 1: Workspace */}
      {step === 'workspace' && (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Workspace</CardTitle>
            <CardDescription>
              Give your property management workspace a name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWorkspaceSubmit} className="space-y-4">
              <FormField>
                <FormLabel htmlFor="workspace">Workspace Name</FormLabel>
                <Input
                  id="workspace"
                  placeholder="e.g., Brussels Properties, My Portfolio"
                  value={managerData.workspaceName}
                  onChange={(e) =>
                    setManagerData({ workspaceName: e.target.value })
                  }
                />
              </FormField>

              {error && <FormError>{error}</FormError>}

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: First Unit */}
      {step === 'unit' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Your First Unit</CardTitle>
            <CardDescription>
              Start managing your first apartment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUnitSubmit} className="space-y-4">
              <FormField>
                <FormLabel htmlFor="unit-name">Unit Address / Name</FormLabel>
                <Input
                  id="unit-name"
                  placeholder="e.g., 123 Rue de la Paix, Brussels"
                  value={managerData.firstUnitName}
                  onChange={(e) =>
                    setManagerData({ firstUnitName: e.target.value })
                  }
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="unit-state">Current State</FormLabel>
                <select
                  id="unit-state"
                  value={managerData.firstUnitState}
                  onChange={(e) =>
                    setManagerData({ firstUnitState: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md bg-surface text-primary"
                >
                  <option value="vacant">Vacant</option>
                  <option value="incoming">Incoming Tenant</option>
                  <option value="occupied">Occupied</option>
                  <option value="notice">Notice Given</option>
                  <option value="outgoing">Outgoing</option>
                  <option value="turnover">Turnover</option>
                </select>
              </FormField>

              {error && <FormError>{error}</FormError>}

              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Completion */}
      {step === 'completion' && (
        <Card>
          <CardContent className="pt-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
              <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
              <p className="text-secondary max-w-sm">
                Your workspace is ready. You can now start managing{' '}
                <strong>{managerData.firstUnitName}</strong>.
              </p>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg text-left space-y-2 my-6">
                <p className="text-sm">
                  <strong>Next Steps:</strong>
                </p>
                <ul className="text-sm text-secondary space-y-1">
                  <li>✓ Add tenant information</li>
                  <li>✓ Upload lease document</li>
                  <li>✓ Set up inspections and readiness checklist</li>
                </ul>
              </div>
              {error && <FormError>{error}</FormError>}
              <Button
                type="button"
                onClick={() => void handleComplete()}
                size="lg"
                className="w-full"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Go to Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
