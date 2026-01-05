import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Waves, Bed, Pencil, Star, Users } from "lucide-react"
import Link from "next/link"
import { PackageDeleteButton } from "@/components/admin/package-delete-button"

async function getPackages() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from("surf_packages")
    .select("*")
    .order("display_order", { ascending: true })

  return packages || []
}

export default async function PackagesPage() {
  const packages = await getPackages()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Surf Packages</h1>
          <p className="text-muted-foreground">Manage combined accommodation + surf packages</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/packages/new">
            <Plus className="w-4 h-4" />
            Add Package
          </Link>
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No packages configured yet. Create your first surf package to get started.
            </p>
            <Button asChild>
              <Link href="/admin/packages/new">
                <Plus className="w-4 h-4 mr-2" />
                Create First Package
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((pkg) => {
            const savings = pkg.original_price ? pkg.original_price - pkg.price : 0
            const includes = Array.isArray(pkg.includes) ? pkg.includes : []

            return (
              <Card key={pkg.id} className={`relative overflow-hidden ${pkg.is_popular ? "border-primary" : ""}`}>
                {pkg.is_popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Popular
                  </div>
                )}

                {pkg.image_url && (
                  <div className="aspect-video relative">
                    <img
                      src={pkg.image_url || "/placeholder.svg"}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    {!pkg.is_active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive">Inactive</Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      {pkg.tagline && <p className="text-sm text-muted-foreground">{pkg.tagline}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {pkg.is_for_two && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Para 2
                        </Badge>
                      )}
                      {pkg.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {pkg.nights} nights
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Waves className="w-4 h-4" />
                      {pkg.surf_lessons} lessons
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Bed className="w-4 h-4" />
                      <span className="capitalize">{pkg.room_type}</span>
                    </div>
                  </div>

                  {includes.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Includes:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {includes.slice(0, 3).map((item: string, idx: number) => (
                          <li key={idx} className="truncate">
                            {item}
                          </li>
                        ))}
                        {includes.length > 3 && <li>+{includes.length - 3} more...</li>}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-2 border-t">
                    <div>
                      {pkg.original_price && (
                        <p className="text-sm text-muted-foreground line-through">${pkg.original_price}</p>
                      )}
                      <p className="text-2xl font-bold text-primary">${pkg.price}</p>
                      {savings > 0 && <Badge className="bg-green-100 text-green-800 mt-1">Ahorras ${savings}</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="bg-transparent">
                        <Link href={`/admin/packages/${pkg.id}/edit`}>
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <PackageDeleteButton packageId={pkg.id} packageName={pkg.name} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
