import { PackageForm } from "@/components/admin/package-form"

export default function NewPackagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Create New Package</h1>
        <p className="text-muted-foreground">Create a new surf + accommodation package</p>
      </div>

      <PackageForm mode="create" />
    </div>
  )
}
