"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { useUserStore } from "@/lib/stores/user-store"

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { logout } = useUserStore()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      logout()
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoading} className="gap-2">
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">{isLoading ? "Signing out..." : "Sign Out"}</span>
    </Button>
  )
}
