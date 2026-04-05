'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { FormError, FormField, FormLabel } from '@/components/ui/Form'
import { managerCaseQueryKey } from '@/hooks/useManagerCasePageData'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { CaseTimelineEventRow } from '@/lib/types/database'
import { formatIsoDateTime } from '@/lib/types/database'
import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Trash2 } from 'lucide-react'

interface CaseTimelinePanelProps {
  caseId: string
  events: CaseTimelineEventRow[]
}

export function CaseTimelinePanel({ caseId, events }: CaseTimelinePanelProps) {
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: managerCaseQueryKey(caseId) })

  const addNote = useMutation({
    mutationFn: async (body: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.from('case_timeline_events').insert({
        case_id: caseId,
        body,
        event_source: 'user',
      })
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      setLocalError(null)
      setNote('')
      invalidate()
    },
    onError: (e: Error) => setLocalError(e.message),
  })

  const removeEvent = useMutation({
    mutationFn: async (eventId: string) => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('case_timeline_events')
        .delete()
        .eq('id', eventId)
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      setLocalError(null)
      invalidate()
    },
    onError: (e: Error) => setLocalError(e.message),
  })

  const submitNote = () => {
    const trimmed = note.trim()
    if (!trimmed) {
      setLocalError('Write a note before adding it to the timeline.')
      return
    }
    addNote.mutate(trimmed)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case timeline</CardTitle>
        <CardDescription>System events, workflow activity, and your notes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {localError && <FormError>{localError}</FormError>}

        <div className="space-y-3">
          <FormField>
            <FormLabel htmlFor="case-timeline-note">Add note</FormLabel>
            <textarea
              id="case-timeline-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Called tenant — inspection moved to Monday"
              className={cn(
                'mt-1 flex w-full rounded-md border border-border bg-surface px-4 py-2 text-sm',
                'placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors duration-base',
                'dark:border-border dark:bg-neutral-800',
                'resize-y min-h-[var(--s20)]',
              )}
            />
          </FormField>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={addNote.isPending}
            onClick={submitNote}
          >
            Add to timeline
          </Button>
        </div>

        {events.length === 0 ? (
          <p className="text-sm text-secondary">
            No events yet. Run the timeline migration or add a note above.
          </p>
        ) : (
          <ul className="space-y-4" aria-label="Timeline entries">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div
                  className={
                    event.event_source === 'system'
                      ? 'mt-1 text-success-600 shrink-0'
                      : 'mt-1 text-primary-500 shrink-0'
                  }
                >
                  {event.event_source === 'system' ? (
                    <CheckCircle2 size={20} aria-hidden />
                  ) : (
                    <Clock size={20} aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 gap-y-1">
                    <Badge
                      variant={event.event_source === 'system' ? 'success' : 'accent'}
                    >
                      {event.event_source === 'system' ? 'System' : 'Note / activity'}
                    </Badge>
                    <time
                      className="text-xs text-secondary"
                      dateTime={event.sort_at}
                    >
                      {formatIsoDateTime(event.sort_at)}
                    </time>
                  </div>
                  <p className="text-sm font-medium whitespace-pre-wrap break-words">
                    {event.body}
                  </p>
                </div>
                {event.event_source === 'user' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-secondary hover:text-error-600"
                    disabled={removeEvent.isPending}
                    onClick={() => removeEvent.mutate(event.id)}
                    aria-label="Remove timeline entry"
                  >
                    <Trash2 size={16} aria-hidden />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
