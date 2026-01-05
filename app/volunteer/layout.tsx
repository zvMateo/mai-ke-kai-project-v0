import type React from "react"
import { requireVolunteer } from "@/lib/auth"
import { VolunteerSidebar } from "@/components/volunteer/sidebar"
import { VolunteerHeader } from "@/components/volunteer/header"

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role } = await requireVolunteer()

  return (
    <div className="min-h-screen bg-background flex">
      <VolunteerSidebar role={role} />
      <div className="flex-1 flex flex-col lg:ml-64">
        <VolunteerHeader user={user} role={role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
