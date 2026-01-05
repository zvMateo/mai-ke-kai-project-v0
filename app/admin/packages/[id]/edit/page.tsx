import { createClient } from "@/lib/supabase/server"
import { PackageForm } from "@/components/admin/package-form"
import { notFound } from "next/navigation"

interface EditPackagePageProps {
  params: Promise<{ id: string }>
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pkg, error } = await supabase.from("surf_packages").select("*").eq("id", id).single()

  if (error || !pkg) {
    notFound()
  }

  // Parse includes if it's a string
  const parsedPackage = {
    ...pkg,
    includes: Array.isArray(pkg.includes) ? pkg.includes : JSON.parse(pkg.includes || "[]"),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit Package</h1>
        <p className="text-muted-foreground">Update package details</p>
      </div>

      <PackageForm pkg={parsedPackage} mode="edit" />
    </div>
  )
}
