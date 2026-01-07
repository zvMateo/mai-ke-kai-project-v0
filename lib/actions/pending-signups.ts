import { createAdminClient } from '@/lib/supabase/admin'

export async function getPendingSignup(token: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from('pending_signups').select('*').eq('token', token).maybeSingle()
  if (error || !data) return null
  return data
}

export async function markPendingSignupConfirmed(token: string) {
  const admin = createAdminClient()
  await admin.from('pending_signups').update({ confirmed: true }).eq('token', token)
}
