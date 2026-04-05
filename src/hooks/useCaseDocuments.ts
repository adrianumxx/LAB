import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { managerIsFreeTier, type ProfileBillingFields } from '@/lib/billing-plan-policy'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { buildCaseObjectPath, CASE_FILES_BUCKET } from '@/lib/storage/case-files'
import type { CaseDocumentRow } from '@/lib/types/database'
import { isUuid } from '@/lib/validation/uuid'

export const caseDocumentsQueryKey = (caseId: string) =>
  ['case-documents', caseId] as const

async function fetchCaseDocuments(caseId: string): Promise<CaseDocumentRow[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('case_documents')
    .select(
      'id, case_id, storage_path, original_name, content_type, size_bytes, uploaded_by, created_at',
    )
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }
  return (data ?? []) as CaseDocumentRow[]
}

export function useCaseDocuments(caseId: string | undefined) {
  const id = caseId?.trim() ?? ''
  const valid = isUuid(id)

  return useQuery({
    queryKey: caseDocumentsQueryKey(id),
    queryFn: () => fetchCaseDocuments(id),
    enabled: valid && isSupabaseConfigured(),
  })
}

export function useUploadCaseDocument(caseId: string) {
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('billing_plan, stripe_subscription_status')
        .eq('id', user.id)
        .maybeSingle()

      if (managerIsFreeTier(profile as ProfileBillingFields | null)) {
        throw new Error(
          'Case document uploads require an active subscription. Open Billing to subscribe.',
        )
      }

      const path = buildCaseObjectPath(caseId, file.name)

      const { error: upError } = await supabase.storage
        .from(CASE_FILES_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || undefined,
        })

      if (upError) {
        throw new Error(upError.message)
      }

      const { error: rowError } = await supabase.from('case_documents').insert({
        case_id: caseId,
        storage_path: path,
        original_name: file.name,
        content_type: file.type || null,
        size_bytes: file.size,
        uploaded_by: user.id,
      })

      if (rowError) {
        await supabase.storage.from(CASE_FILES_BUCKET).remove([path])
        throw new Error(rowError.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caseDocumentsQueryKey(caseId) })
    },
  })
}

export function useDeleteCaseDocument(caseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: CaseDocumentRow) => {
      const supabase = createSupabaseBrowserClient()
      const { error: stError } = await supabase.storage
        .from(CASE_FILES_BUCKET)
        .remove([doc.storage_path])
      if (stError) {
        throw new Error(stError.message)
      }
      const { error: delError } = await supabase
        .from('case_documents')
        .delete()
        .eq('id', doc.id)
      if (delError) {
        throw new Error(delError.message)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: caseDocumentsQueryKey(caseId) })
    },
  })
}

export async function createCaseFileSignedUrl(
  storagePath: string,
  expiresSec = 3600,
): Promise<string> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.storage
    .from(CASE_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresSec)
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? 'Could not create download link')
  }
  return data.signedUrl
}
