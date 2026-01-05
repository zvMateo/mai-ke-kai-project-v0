import { ServiceForm } from "@/components/admin/service-form"

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Add New Service</h1>
        <p className="text-muted-foreground">Create a new service for guests to book</p>
      </div>

      <ServiceForm mode="create" />
    </div>
  )
}
