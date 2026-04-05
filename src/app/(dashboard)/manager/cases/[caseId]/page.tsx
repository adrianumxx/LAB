'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { NetworkQueryError } from '@/components/ui/NetworkQueryError'
import { CaseLiveSection } from '@/components/manager/CaseLiveSection'
import { useManagerCasePageData } from '@/hooks/useManagerCasePageData'
import {
  caseStatusToBadgeVariant,
  humanizeCaseStatus,
} from '@/lib/case-status-badge'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import {
  caseTypeDescription,
  formatCaseTypeLabel,
  formatIsoDate,
} from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { isUuid } from '@/lib/validation/uuid'
import {
  CheckCircle2,
  Clock,
  FileText,
  Users,
  ArrowRight,
  Calendar,
  Zap,
} from 'lucide-react'
import { useParams } from 'next/navigation'

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params['caseId'] as string

  const useLive = isSupabaseConfigured() && isUuid(caseId)
  const caseQuery = useManagerCasePageData(caseId)
  const dbCase = caseQuery.data?.case ?? null
  const dbUnit = caseQuery.data?.unit ?? null
  const phases = caseQuery.data?.phases ?? []
  const checklist = caseQuery.data?.checklist ?? []
  const timeline = caseQuery.data?.timeline ?? []
  const showLiveBody = Boolean(useLive && dbCase)

  const phaseProgress =
    phases.length > 0
      ? Math.round(
          (phases.filter((p) => p.status === 'completed').length / phases.length) *
            100,
        )
      : null

  const livePhaseTitle =
    showLiveBody && dbCase && phases.length > 0
      ? (() => {
          const sorted = [...phases].sort((a, b) => a.position - b.position)
          const active = sorted.find((p) => p.status === 'in_progress')
          if (active) return active.title
          if (sorted.every((p) => p.status === 'completed')) {
            return 'All phases complete'
          }
          const next = sorted.find((p) => p.status === 'pending')
          return next?.title ?? humanizeCaseStatus(dbCase.status)
        })()
      : null

  const mockCaseData = {
    id: caseId,
    type: 'Move-in',
    unit: 'Apt 401',
    tenant: 'Jane Smith',
    status: 'in-progress',
    phase: 'Background Check',
    progress: 75,
    createdDate: '2026-03-25',
    dueDate: '2026-04-07',
    description: 'New tenant move-in and unit activation',
  }

  const header =
    showLiveBody && dbCase
      ? {
          typeLabel: formatCaseTypeLabel(dbCase.case_type),
          unit: dbUnit?.name ?? '—',
          tenant: '—',
          status: dbCase.status,
          createdLabel: formatIsoDate(dbCase.created_at),
          dueDisplay: formatIsoDate(dbCase.due_at),
          phase:
            livePhaseTitle ?? humanizeCaseStatus(dbCase.status),
          progress:
            phaseProgress !== null
              ? phaseProgress
              : dbCase.status.toLowerCase() === 'closed'
                ? 100
                : dbCase.status.toLowerCase() === 'blocked'
                  ? 25
                  : 50,
          description: caseTypeDescription(dbCase.case_type),
        }
      : {
        typeLabel: mockCaseData.type,
        unit: mockCaseData.unit,
        tenant: mockCaseData.tenant,
        status: mockCaseData.status,
        createdLabel: mockCaseData.createdDate,
        dueDisplay: mockCaseData.dueDate,
        phase: mockCaseData.phase,
        progress: mockCaseData.progress,
        description: mockCaseData.description,
      }

  const demoPhases = [
    { id: 1, name: 'Tenant Screening', status: 'completed', order: 1 },
    { id: 2, name: 'Background Check', status: 'in-progress', order: 2 },
    { id: 3, name: 'Move-in Inspection', status: 'pending', order: 3 },
    { id: 4, name: 'Key Handoff', status: 'pending', order: 4 },
    { id: 5, name: 'Lease Activation', status: 'pending', order: 5 },
  ]

  const caseChecklist = [
    { id: 1, item: 'Verify tenant application', completed: true, assignee: 'Manager', dueDate: '2026-04-03' },
    { id: 2, item: 'Conduct background check', completed: false, assignee: 'Manager', dueDate: '2026-04-05' },
    { id: 3, item: 'Review credit report', completed: false, assignee: 'Manager', dueDate: '2026-04-05' },
    { id: 4, item: 'Schedule move-in inspection', completed: false, assignee: 'Manager', dueDate: '2026-04-06' },
    { id: 5, item: 'Prepare unit access codes', completed: false, assignee: 'Manager', dueDate: '2026-04-06' },
    { id: 6, item: 'Confirm lease signatures', completed: true, assignee: 'Tenant', dueDate: '2026-04-04' },
  ]

  const responsibilities = [
    { role: 'Manager', tasks: ['Conduct background check', 'Schedule inspection', 'Prepare codes', 'Execute lease'] },
    { role: 'Owner', tasks: ['Approve tenant', 'Review lease terms'] },
    { role: 'Tenant', tasks: ['Sign lease', 'Prepare unit access', 'Attend move-in'] },
  ]

  const caseDocuments = [
    { name: 'Lease Agreement', type: 'lease', status: 'signed', uploadedDate: '2026-04-04' },
    { name: 'Background Check Report', type: 'report', status: 'completed', uploadedDate: '2026-04-05' },
    { name: 'Move-in Checklist Template', type: 'form', status: 'pending', uploadedDate: '—' },
    { name: 'Photo Documentation', type: 'media', status: 'pending', uploadedDate: '—' },
  ]

  const demoTimeline = [
    { date: '2026-03-25', action: 'Case created - Move-in initiated', status: 'completed' },
    { date: '2026-04-02', action: 'Tenant application approved', status: 'completed' },
    { date: '2026-04-04', action: 'Lease agreement signed by tenant', status: 'completed' },
    { date: '2026-04-05', action: 'Background check completed', status: 'in-progress' },
    { date: '2026-04-07', action: 'Move-in day and unit inspection', status: 'upcoming' },
    { date: '2026-04-08', action: 'Lease activation', status: 'upcoming' },
  ]

  const caseStatusColor = caseStatusToBadgeVariant(header.status)

  const phaseStatusColor = (status: string) => {
    if (status === 'completed') return 'success' as const
    if (status === 'in-progress') return 'accent' as const
    if (status === 'pending') return 'warning' as const
    return 'default' as const
  }

  return (
    <div className="space-y-8">
      <div>
        {useLive && caseQuery.isLoading && (
          <p className="text-sm text-secondary mb-2">Loading case…</p>
        )}
        {useLive && caseQuery.isError && (
          <NetworkQueryError
            className="mb-4"
            error={caseQuery.error}
            onRetry={() => void caseQuery.refetch()}
          />
        )}
        {useLive && !caseQuery.isLoading && !dbCase && (
          <FormError className="mb-4">
            Case not found or you don&apos;t have access.{' '}
            <Link href="/manager/cases" className="underline underline-offset-2">
              Browse all cases
            </Link>
            .
          </FormError>
        )}

        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge variant={caseStatusColor} className="text-lg px-4 py-2">
                {humanizeCaseStatus(header.status)}
              </Badge>
              <p className="text-sm text-secondary">
                {header.createdLabel} • Case {caseId}
              </p>
            </div>
            <h1 className="text-4xl font-bold">{header.typeLabel}</h1>
            <p className="text-secondary mt-2">
              {header.unit} • {header.tenant}
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-sm text-secondary">Due Date</p>
            <p
              className={
                header.dueDisplay === '—'
                  ? 'text-2xl font-bold text-secondary'
                  : 'text-2xl font-bold text-error-600'
              }
            >
              {header.dueDisplay}
            </p>
          </div>
        </div>
      </div>

      {showLiveBody && dbCase ? (
        <CaseLiveSection
          caseRow={dbCase}
          unit={dbUnit}
          caseId={caseId}
          phases={phases}
          checklist={checklist}
          timeline={timeline}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Case Progress</CardTitle>
              <CardDescription>
                {header.phase} - {header.progress}% complete
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                  <div
                    className="bg-primary-500 h-3 rounded-full transition-all"
                    style={{ width: `${header.progress}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-secondary">{header.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case Phases</CardTitle>
              <CardDescription>Lifecycle progression</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {demoPhases.map((phase) => (
                  <div key={phase.id} className="flex items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {phase.status === 'completed' && (
                        <CheckCircle2 className="text-success-600" size={20} />
                      )}
                      {phase.status === 'in-progress' && (
                        <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-primary-500" />
                        </div>
                      )}
                      {phase.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
                      )}
                      <span
                        className={`font-medium ${phase.status === 'pending' ? 'text-secondary' : ''}`}
                      >
                        {phase.name}
                      </span>
                    </div>
                    <Badge variant={phaseStatusColor(phase.status)}>
                      {phase.status === 'in-progress'
                        ? 'Active'
                        : phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Case Checklist</CardTitle>
                <CardDescription>Tasks to complete this phase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {caseChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                  >
                    <div
                      className={`mt-1 ${item.completed ? 'text-success-600' : 'text-neutral-400'}`}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-medium text-sm ${item.completed ? 'line-through text-secondary' : ''}`}
                      >
                        {item.item}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-secondary">
                        <Users size={14} />
                        <span>{item.assignee}</span>
                        <span>•</span>
                        <Calendar size={14} />
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                    {!item.completed && (
                      <Button size="sm" variant="secondary">
                        Start
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
                <CardDescription>Who does what</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {responsibilities.map((resp) => (
                  <div key={resp.role} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold text-sm mb-2">{resp.role}</p>
                    <ul className="space-y-1">
                      {resp.tasks.map((task, i) => (
                        <li key={i} className="text-xs text-secondary flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Case Documents</CardTitle>
              <CardDescription>Related files and evidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseDocuments.map((doc) => (
                  <div
                    key={doc.name}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="text-primary-500" size={20} />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-secondary">{doc.uploadedDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <Badge variant={doc.status === 'pending' ? 'warning' : 'success'}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </Badge>
                      {doc.status === 'pending' ? (
                        <Button size="sm" variant="secondary">
                          Upload
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case Timeline</CardTitle>
              <CardDescription>Event history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoTimeline.map((event, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div
                    className={`mt-1 ${event.status === 'completed' ? 'text-success-600' : 'text-primary-500'}`}
                  >
                    {event.status === 'completed' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.action}</p>
                    <p className="text-xs text-secondary mt-1">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3 sticky bottom-0 bg-app border-t border-border p-4 rounded-lg">
            <Link
              href="/manager/cases"
              className={cn(buttonVariants({ variant: 'primary' }), 'flex-1 justify-center')}
            >
              <Zap className="mr-2" size={16} aria-hidden />
              All cases
            </Link>
            <Link
              href="/manager/units"
              className={cn(buttonVariants({ variant: 'secondary' }), 'flex-1 justify-center')}
            >
              <ArrowRight className="mr-2" size={16} aria-hidden />
              All units
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
