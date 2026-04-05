'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import {
  createCaseFileSignedUrl,
  useCaseDocuments,
  useDeleteCaseDocument,
  useUploadCaseDocument,
} from '@/hooks/useCaseDocuments'
import { formatIsoDate, type CaseDocumentRow } from '@/lib/types/database'
import { Download, FileText, Trash2, Upload } from 'lucide-react'

function formatBytes(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

interface CaseDocumentsPanelProps {
  caseId: string
}

export function CaseDocumentsPanel({ caseId }: CaseDocumentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: docs, isLoading, isError, error } = useCaseDocuments(caseId)
  const upload = useUploadCaseDocument(caseId)
  const del = useDeleteCaseDocument(caseId)

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setActionError(null)
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      await upload.mutateAsync(file)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function onDownload(doc: CaseDocumentRow) {
    setActionError(null)
    try {
      const url = await createCaseFileSignedUrl(doc.storage_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  async function onDelete(doc: CaseDocumentRow) {
    setActionError(null)
    try {
      await del.mutateAsync(doc)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const busy = upload.isPending || del.isPending

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle>Case files</CardTitle>
            <CardDescription>
              Private storage (bucket <code className="text-xs">case-files</code>). Run the
              latest SQL migration if uploads fail.
            </CardDescription>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept="*/*"
              onChange={onPickFile}
              disabled={busy}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-2" size={16} />
              {upload.isPending ? 'Uploading…' : 'Upload file'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isError && (
          <FormError>
            {error instanceof Error ? error.message : 'Could not load documents'}
          </FormError>
        )}
        {actionError && <FormError>{actionError}</FormError>}
        {isLoading && <p className="text-sm text-secondary">Loading files…</p>}
        {!isLoading && !isError && (!docs || docs.length === 0) && (
          <p className="text-sm text-secondary">No files yet.</p>
        )}
        {!isLoading && docs && docs.length > 0 && (
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <FileText className="text-primary shrink-0 mt-0.5" size={18} />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {doc.original_name ?? doc.storage_path}
                    </p>
                    <p className="text-xs text-secondary">
                      {formatBytes(doc.size_bytes)} • {formatIsoDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => void onDownload(doc)}
                  >
                    <Download className="mr-1" size={14} />
                    Download
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => void onDelete(doc)}
                    aria-label={`Delete ${doc.original_name ?? 'file'}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
