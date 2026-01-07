"use client" 

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function SignUpStep1() {
  // Step 1: name + email
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'step1'|'step2'>('step1')
  const [token, setToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!fullName || !email) {
      setError('Full name and email are required')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/auth/prepare-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email }),
      })
      const data = await res.json()
      if (res.ok && data.success !== false) {
        // the backend doesn't return token; user checks email
        // show step2 by instructing user to confirm via email
        setStep('step2')
      } else {
        setError(data?.error || 'Error')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="John Doe" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      {error && <div className="p-2 text-sm text-destructive">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full">{loading ? 'Sending…' : 'Send Confirmation'}</Button>
      <p className="text-xs text-muted-foreground">We will send the confirmation email to the address provided.</p>
    </form>
  )
}
