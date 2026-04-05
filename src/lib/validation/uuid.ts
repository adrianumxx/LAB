/** Formato UUID standard (include v4 da Supabase `gen_random_uuid()`). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: string | undefined | null): boolean {
  if (!value) return false
  return UUID_RE.test(value.trim())
}
