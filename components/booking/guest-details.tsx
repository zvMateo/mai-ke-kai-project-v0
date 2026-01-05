"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, User, Mail, Phone, Globe, Star, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { BookingData } from "./booking-flow"

interface GuestDetailsProps {
  initialData: BookingData["guestInfo"]
  onComplete: (data: BookingData["guestInfo"]) => void
  onBack: () => void
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Spain",
  "Australia",
  "Brazil",
  "Mexico",
  "Costa Rica",
  "Argentina",
  "Chile",
  "Colombia",
  "Other",
]

export function GuestDetails({ initialData, onComplete, onBack }: GuestDetailsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    nationality: initialData?.nationality || "",
    specialRequests: initialData?.specialRequests || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (profile) {
          setIsLoggedIn(true)
          setUserPoints(profile.loyalty_points || 0)

          // Pre-fill form with user data
          const nameParts = (profile.full_name || "").split(" ")
          setFormData((prev) => ({
            ...prev,
            firstName: nameParts[0] || prev.firstName,
            lastName: nameParts.slice(1).join(" ") || prev.lastName,
            email: profile.email || prev.email,
            phone: profile.phone || prev.phone,
            nationality: profile.nationality || prev.nationality,
          }))
        }
      }
      setIsLoadingUser(false)
    }

    fetchUserData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.nationality) newErrors.nationality = "Please select your nationality"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete(formData)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Guest Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isLoadingUser && isLoggedIn && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">You have {userPoints} loyalty points!</p>
              <p className="text-sm text-muted-foreground">Complete this booking to earn more points</p>
            </div>
          </div>
        )}

        {!isLoadingUser && !isLoggedIn && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Already have an account?</p>
                <p className="text-sm text-muted-foreground">Sign in to earn loyalty points with this booking</p>
              </div>
            </div>
            <Link href="/auth/login?redirect=/booking">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                className={`pl-10 ${errors.firstName ? "border-destructive" : ""}`}
                placeholder="John"
              />
            </div>
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              className={errors.lastName ? "border-destructive" : ""}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                placeholder="john@example.com"
                disabled={isLoggedIn} // Disable email field if logged in
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`pl-10 ${errors.phone ? "border-destructive" : ""}`}
                placeholder="+1 234 567 8900"
              />
            </div>
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality *</Label>
          <Select value={formData.nationality} onValueChange={(value) => updateField("nationality", value)}>
            <SelectTrigger className={errors.nationality ? "border-destructive" : ""}>
              <Globe className="mr-2 w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nationality && <p className="text-sm text-destructive">{errors.nationality}</p>}
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
          <Textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => updateField("specialRequests", e.target.value)}
            placeholder="Any dietary restrictions, late arrival, etc."
            rows={3}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleSubmit}>
            Continue to Payment
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
