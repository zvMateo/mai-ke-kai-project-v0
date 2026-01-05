import { createClient } from "@/lib/supabase/server"
import { ServiceForm } from "@/components/admin/service-form"
import { notFound } from "next/navigation"

interface EditServicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: service, error } = await supabase.from("services").select("*").eq("id", id).single()

  if (error || !service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground">Update service details</p>
      </div>

      <ServiceForm service={service} mode="edit" />
    </div>
  )
}
