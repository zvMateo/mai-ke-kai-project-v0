import { NextResponse } from 'next/server'
import { getPendingSignup, markPendingSignupConfirmed } from '@/lib/actions/pending-signups'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'token and password required' }, { status: 400 })
    }

    const pending = await getPendingSignup(token)
    if (!pending) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Verify expiry
    const expiresAt = new Date(pending.expires_at)
    if (expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    // Create user in Supabase Auth using Admin client
    const admin = createAdminClient()
    const { data: user, error } = await admin.auth.admin.createUser({
      email: pending.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: pending.full_name }
    })

    if (error) {
      console.error('Finalize signup error', error)
      return NextResponse.json({ error: 'Error creating user' }, { status: 500 })
    }

    // Mark as confirmed
    await admin.from('pending_signups').update({ confirmed: true }).eq('token', token)

    return NextResponse.json({ success: true, redirect: '/auth/login' })
  } catch (err) {
    console.error('finalize-signup error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
