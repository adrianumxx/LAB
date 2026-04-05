import { sanitizeStorageFileName } from '@/lib/storage/case-files'

/** Bucket privato — migration `tenant_documents_storage`. */
export const TENANT_FILES_BUCKET = 'tenant-files' as const

export function buildTenantObjectPath(
  unitId: string,
  tenantUserId: string,
  originalName: string,
): string {
  const safe = sanitizeStorageFileName(originalName)
  const unique =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${unitId}/${tenantUserId}/${unique}-${safe}`
}
