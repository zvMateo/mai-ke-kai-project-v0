"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Award, ChevronDown } from "lucide-react"
import { useUserStore } from "@/lib/stores/user-store"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export function UserMenu({ isScrolled = false }: { isScrolled?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)
  const { user, profile, isAuthenticated, logout, refreshUser } = useUserStore()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      logout()
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !profile) {
    return null
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || "GU"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-2 pr-2",
            !isScrolled && "text-white hover:text-white hover:bg-white/10"
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold",
                isScrolled
                  ? "bg-primary text-white"
                  : "bg-white text-primary"
              )}
            >
              {initials}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className={cn("text-sm font-medium leading-tight", isScrolled ? "text-foreground" : "text-white")}>
                {profile.full_name?.split(" ")[0] || user?.email?.split("@")[0]}
              </span>
              <span className={cn("text-xs leading-tight", isScrolled ? "text-muted-foreground" : "text-white/70")}>
                {profile.role === "guest" ? `${profile.loyalty_points} pts` : profile.role}
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4", isScrolled ? "text-muted-foreground" : "text-white/70")} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {profile.role === "guest" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" />
                My Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/loyalty" className="cursor-pointer flex items-center gap-2">
                <Award className="w-4 h-4" />
                Loyalty Points ({profile.loyalty_points})
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/bookings" className="cursor-pointer flex items-center gap-2">
                <User className="w-4 h-4" />
                My Bookings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {profile.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer flex items-center gap-2">
              <User className="w-4 h-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        
        {profile.role === "volunteer" && (
          <DropdownMenuItem asChild>
            <Link href="/volunteer" className="cursor-pointer flex items-center gap-2">
              <User className="w-4 h-4" />
              Volunteer Panel
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
