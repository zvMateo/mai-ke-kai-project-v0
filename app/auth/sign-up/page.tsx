"use client"

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenFromURL = searchParams.get('token')

  // Step 1 fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  // Step 2 fields
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step2Error, setStep2Error] = useState<string | null>(null)
  const [mainError, setMainError] = useState<string | null>(null)

  // Step 2 flag when token present in URL
  const isStep2 = Boolean(tokenFromURL)

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setMainError(null)
    if (!fullName.trim() || !email.trim()) {
      setMainError('Please enter your full name and email.')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/auth/prepare-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.success !== false) {
        // Navigate to same route with token to show Step 2
        const t = data.token
        if (t) {
          router.push(`/auth/sign-up?token=${t}`)
        } else {
          setMainError('No token de confirmación recibido.')
        }
      } else {
        setMainError(data.error || 'Error preparando el signup')
      }
    } catch (err) {
      setMainError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep2Error(null)
    if (!tokenFromURL) {
      setStep2Error('Missing token')
      return
    }
    if (!password || password.length < 6) {
      setStep2Error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setStep2Error('Passwords do not match')
      return
    }
    try {
      const res = await fetch('/api/auth/finalize-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenFromURL, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        router.push('/auth/login')
      } else {
        setStep2Error(data.error || 'Error finalizando signup')
      }
    } catch (err) {
      setStep2Error('Network error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image
              src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
              alt="Mai Ke Kai"
              width={64}
              height={64}
              className="w-16 h-16 mb-4"
            />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground">Join Mai Ke Kai</h1>
          <p className="text-muted-foreground text-sm">Create your account to start your surf adventure</p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-heading">Create Account</CardTitle>
            <CardDescription>Enter your details to register</CardDescription>
          </CardHeader>

          {isStep2 ? (
            <CardContent>
              <form onSubmit={submitStep2} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Min 6 characters" required value={password} onChange={(e)=>setPassword(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Re-enter password" required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="h-11" />
                </div>
                {step2Error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{step2Error}</div>}
                <Button type="submit" className="w-full h-11">Create Account</Button>
              </form>
            </CardContent>
          ) : (
            <CardContent>
              <form onSubmit={submitStep1} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" type="text" placeholder="John Doe" required value={fullName} onChange={(e)=>setFullName(e.target.value)} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e)=>setEmail(e.target.value)} className="h-11" />
                </div>
                {mainError && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{mainError}</div>}
                <Button type="submit" className="w-full h-11" disabled={loading}>{'Send Confirmation'}</Button>
              </form>
            </CardContent>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/terms" className="text-primary hover:underline">Terms</Link> — <Link href="/privacy" className="text-primary hover:underline">Privacy</Link>
        </p>
      </div>
    </div>
  )
}
