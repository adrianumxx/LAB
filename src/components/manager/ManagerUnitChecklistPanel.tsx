'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FormError } from '@/components/ui/Form'
import { useTenantChecklistItemsForUnit } from '@/hooks/useTenantChecklistItems'
import {
  formatIsoDateTime,
  type TenantChecklistItemRow,
} from '@/lib/types/database'
import { CheckCircle2, Circle } from 'lucide-react'

interface ManagerUnitChecklistPanelProps {
  unitId: string
}

function groupByTenant(items: TenantChecklistItemRow[]): Map<string, TenantChecklistItemRow[]> {
  const m = new Map<string, TenantChecklistItemRow[]>()
  for (const row of items) {
    const list = m.get(row.tenant_id) ?? []
    list.push(row)
    m.set(row.tenant_id, list)
  }
  for (const list of m.values()) {
    list.sort((a, b) => a.sort_order - b.sort_order)
  }
  return m
}

export function ManagerUnitChecklistPanel({ unitId }: ManagerUnitChecklistPanelProps) {
  const { data: items, isLoading, isError, error } = useTenantChecklistItemsForUnit(
    unitId,
    true,
  )

  const groups = useMemo(() => groupByTenant(items ?? []), [items])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant move-in checklist</CardTitle>
        <CardDescription>
          Read-only — tenants update tasks from their dashboard. Same data survives logout/login.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && (
          <p className="text-sm text-secondary" role="status">
            Loading checklist…
          </p>
        )}
        {isError && (
          <FormError>
            {error instanceof Error ? error.message : 'Failed to load checklist'}
          </FormError>
        )}
        {!isLoading && !isError && groups.size === 0 && (
          <p className="text-sm text-secondary">
            No checklist rows yet. Items are created when a tenant is linked to this unit.
          </p>
        )}
        {!isLoading &&
          !isError &&
          [...groups.entries()].map(([tenantId, rows]) => {
            const done = rows.filter((r) => r.completed).length
            return (
              <div key={tenantId} className="space-y-2">
                <p className="text-xs font-mono text-secondary">
                  Tenant ···{tenantId.slice(-8)} · {done}/{rows.length} done
                </p>
                <ul className="space-y-2 list-none p-0 m-0 border border-soft rounded-lg p-3">
                  {rows.map((row) => (
                    <li key={row.id} className="flex items-start gap-2 text-sm">
                      {row.completed ? (
                        <CheckCircle2
                          className="text-success-600 shrink-0 mt-0.5"
                          size={18}
                          aria-hidden
                        />
                      ) : (
                        <Circle className="text-neutral-400 shrink-0 mt-0.5" size={18} aria-hidden />
                      )}
                      <span
                        className={
                          row.completed ? 'text-secondary line-through' : 'text-primary'
                        }
                      >
                        {row.title}
                      </span>
                      {row.completed_at ? (
                        <span className="text-xs text-muted ml-auto shrink-0">
                          {formatIsoDateTime(row.completed_at)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
