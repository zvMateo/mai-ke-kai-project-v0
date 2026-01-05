import { LogoutButton } from "@/components/auth/logout-button"
import type { User as AuthUser } from "@supabase/supabase-js"

interface VolunteerHeaderProps {
  user: AuthUser
  role: string
}

export function VolunteerHeader({ user, role }: VolunteerHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 lg:ml-0 ml-12">
        <h1 className="font-heading font-semibold text-lg">Volunteer Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{role}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  )
}
