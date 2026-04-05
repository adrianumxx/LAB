/** Bucket privato — allineato a migration `case_documents_storage`. */
export const CASE_FILES_BUCKET = 'case-files' as const

const SAFE_NAME_RE = /[^a-zA-Z0-9._-]+/g

export function sanitizeStorageFileName(name: string, maxLength = 120): string {
  const base = name.trim().replace(SAFE_NAME_RE, '_').slice(0, maxLength)
  return base.length > 0 ? base : 'file'
}

export function buildCaseObjectPath(caseId: string, originalName: string): string {
  const safe = sanitizeStorageFileName(originalName)
  const unique =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${caseId}/${unique}-${safe}`
}
