'use client'

import { useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FormError } from '@/components/ui/Form'
import {
  createTenantFileSignedUrl,
  useDeleteTenantDocument,
  useTenantDocuments,
  useUploadTenantDocument,
} from '@/hooks/useTenantDocuments'
import { formatIsoDate, type TenantDocumentRow } from '@/lib/types/database'
import { Download, FileText, Trash2, Upload } from 'lucide-react'

function formatBytes(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export type TenantDocumentsPanelVariant = 'tenant' | 'manager_view'

interface TenantDocumentsPanelProps {
  unitId: string
  unitLabel?: string
  variant: TenantDocumentsPanelVariant
}

export function TenantDocumentsPanel({
  unitId,
  unitLabel,
  variant,
}: TenantDocumentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: docs, isLoading, isError, error } = useTenantDocuments(unitId)
  const upload = useUploadTenantDocument(unitId)
  const del = useDeleteTenantDocument(unitId)

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

  async function onDownload(doc: TenantDocumentRow) {
    setActionError(null)
    try {
      const url = await createTenantFileSignedUrl(doc.storage_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Download failed')
    }
  }

  async function onDelete(doc: TenantDocumentRow) {
    setActionError(null)
    try {
      await del.mutateAsync(doc)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const busy = upload.isPending || del.isPending
  const showUpload = variant === 'tenant'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              {unitLabel ? `${unitLabel} · ` : null}
              {variant === 'tenant'
                ? 'Upload PDFs shared with your property manager (private bucket tenant-files).'
                : 'Files uploaded by tenants for this unit (read-only).'}
            </CardDescription>
          </div>
          {showUpload && (
            <div>
              <input
                ref={inputRef}
                type="file"
                className="sr-only"
                accept="application/pdf,.pdf"
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
                <Upload className="mr-2" size={16} aria-hidden />
                Upload PDF
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <p className="text-sm text-secondary" role="status">
            Loading documents…
          </p>
        )}
        {isError && (
          <FormError>
            {error instanceof Error ? error.message : 'Failed to load documents'}
          </FormError>
        )}
        {!isLoading && !isError && docs?.length === 0 && (
          <p className="text-sm text-secondary">
            {showUpload
              ? 'No files yet. Upload a PDF (e.g. ID, income proof, signed lease).'
              : 'No tenant uploads for this unit yet.'}
          </p>
        )}
        {docs?.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-soft last:border-0"
          >
            <div className="flex items-start gap-3 min-w-0">
              <FileText className="text-primary-500 shrink-0 mt-0.5" size={20} />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {doc.original_name ?? 'Document'}
                </p>
                <p className="text-xs text-secondary">
                  {formatIsoDate(doc.created_at)} · {formatBytes(doc.size_bytes)}
                  {variant === 'manager_view' && (
                    <span className="block font-mono text-xs mt-0.5">
                      Tenant ···{doc.tenant_id.slice(-6)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void onDownload(doc)}
                disabled={busy}
              >
                <Download className="mr-1" size={14} aria-hidden />
                Download
              </Button>
              {showUpload && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void onDelete(doc)}
                  disabled={busy}
                  aria-label={`Delete ${doc.original_name ?? 'document'}`}
                >
                  <Trash2 size={14} aria-hidden />
                </Button>
              )}
            </div>
          </div>
        ))}
        {actionError && <FormError>{actionError}</FormError>}
      </CardContent>
    </Card>
  )
}
