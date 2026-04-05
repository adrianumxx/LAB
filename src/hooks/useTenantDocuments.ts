import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { buildTenantObjectPath, TENANT_FILES_BUCKET } from '@/lib/storage/tenant-files'
import type { TenantDocumentRow } from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const tenantDocumentsQueryKey = (unitId: string) =>
  ['tenant-documents', unitId] as const

async function fetchTenantDocumentsForUnit(
  unitId: string,
): Promise<TenantDocumentRow[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('tenant_documents')
    .select(
      'id, unit_id, tenant_id, storage_path, original_name, content_type, size_bytes, uploaded_by, created_at',
    )
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as TenantDocumentRow[]
}

export function useTenantDocuments(unitId: string | undefined) {
  const id = unitId?.trim() ?? ''
  const enabled = Boolean(id) && isUuid(id) && isSupabaseConfigured()

  return useQuery({
    queryKey: tenantDocumentsQueryKey(id || 'none'),
    queryFn: () => fetchTenantDocumentsForUnit(id),
    enabled,
  })
}

export function useUploadTenantDocument(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const supabase = createSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be signed in to upload')
      }

      const isPdf =
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        throw new Error('Only PDF files are allowed')
      }

      const path = buildTenantObjectPath(unitId, user.id, file.name)

      const { error: upError } = await supabase.storage
        .from(TENANT_FILES_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/pdf',
        })

      if (upError) {
        throw new Error(upError.message)
      }

      const { error: rowError } = await supabase.from('tenant_documents').insert({
        unit_id: unitId,
        tenant_id: user.id,
        storage_path: path,
        original_name: file.name,
        content_type: file.type || 'application/pdf',
        size_bytes: file.size,
        uploaded_by: user.id,
      })

      if (rowError) {
        await supabase.storage.from(TENANT_FILES_BUCKET).remove([path])
        throw new Error(rowError.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantDocumentsQueryKey(unitId),
      })
    },
  })
}

export function useDeleteTenantDocument(unitId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: TenantDocumentRow) => {
      const supabase = createSupabaseBrowserClient()
      const { error: stError } = await supabase.storage
        .from(TENANT_FILES_BUCKET)
        .remove([doc.storage_path])
      if (stError) {
        throw new Error(stError.message)
      }
      const { error: delError } = await supabase
        .from('tenant_documents')
        .delete()
        .eq('id', doc.id)
      if (delError) {
        throw new Error(delError.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantDocumentsQueryKey(unitId),
      })
    },
  })
}

export async function createTenantFileSignedUrl(
  storagePath: string,
  expiresSec = 3600,
): Promise<string> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.storage
    .from(TENANT_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresSec)
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Could not create download link')
  }
  return data.signedUrl
}
