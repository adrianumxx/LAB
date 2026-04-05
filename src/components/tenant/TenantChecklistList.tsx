'use client'

import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import { formatIsoDate, type TenantChecklistItemRow } from '@/lib/types/database'
import { CheckCircle2 } from 'lucide-react'

interface TenantChecklistListProps {
  items: TenantChecklistItemRow[]
  disabled?: boolean
  emptyMessage?: string
  errorMessage?: string | null
  onToggle: (id: string, nextCompleted: boolean) => void
}

export function TenantChecklistList({
  items,
  disabled,
  emptyMessage = 'No checklist items yet. They are created when your manager links you to a unit.',
  errorMessage,
  onToggle,
}: TenantChecklistListProps) {
  if (errorMessage) {
    return <FormError>{errorMessage}</FormError>
  }

  if (items.length === 0) {
    return <p className="text-sm text-secondary">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-start gap-3 pb-3 border-b border-soft last:border-0"
        >
          <div
            className={`mt-1 shrink-0 ${item.completed ? 'text-success-600' : 'text-neutral-400'}`}
            aria-hidden
          >
            <CheckCircle2 size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium ${item.completed ? 'line-through text-secondary' : ''}`}
            >
              {item.title}
            </p>
            {item.due_at ? (
              <p className="text-xs text-secondary mt-1">
                Due: {formatIsoDate(item.due_at)}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled}
            aria-pressed={item.completed}
            onClick={() => onToggle(item.id, !item.completed)}
          >
            {item.completed ? 'Undo' : 'Done'}
          </Button>
        </li>
      ))}
    </ul>
  )
}
