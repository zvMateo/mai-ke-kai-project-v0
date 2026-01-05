"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Users, ClipboardCheck, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface VolunteerSidebarProps {
  role: string
}

const volunteerNavItems = [
  {
    title: "Today's Overview",
    href: "/volunteer",
    icon: LayoutDashboard,
  },
  {
    title: "Arrivals & Departures",
    href: "/volunteer/arrivals",
    icon: Calendar,
  },
  {
    title: "Current Guests",
    href: "/volunteer/guests",
    icon: Users,
  },
  {
    title: "Check-in Guests",
    href: "/volunteer/check-in",
    icon: ClipboardCheck,
  },
]

export function VolunteerSidebar({ role }: VolunteerSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r border-border transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 border-b border-border flex items-center px-6">
            <Link href="/volunteer" className="flex items-center gap-3">
              <Image
                src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                alt="Mai Ke Kai"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <div>
                <p className="font-heading font-bold text-primary text-sm">Mai Ke Kai</p>
                <p className="text-xs text-muted-foreground">Volunteer Panel</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {volunteerNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/volunteer" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* Footer with role indicator */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  role === "admin" ? "bg-red-500" : role === "staff" ? "bg-blue-500" : "bg-green-500",
                )}
              />
              <span className="text-xs text-muted-foreground capitalize">{role}</span>
            </div>
            {(role === "staff" || role === "admin") && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                → Go to Admin Panel
              </Link>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Website
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
