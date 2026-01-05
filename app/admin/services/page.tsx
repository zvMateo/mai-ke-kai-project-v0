import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Clock, Users, Waves, Ship, Car, Package, Pencil } from "lucide-react"
import Link from "next/link"
import { ServiceDeleteButton } from "@/components/admin/service-delete-button"

async function getServices() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  return services || []
}

const categoryIcons: Record<string, typeof Waves> = {
  surf: Waves,
  tour: Ship,
  transport: Car,
  other: Package,
}

const categoryColors: Record<string, string> = {
  surf: "bg-blue-100 text-blue-800",
  tour: "bg-green-100 text-green-800",
  transport: "bg-yellow-100 text-yellow-800",
  other: "bg-gray-100 text-gray-800",
}

export default async function ServicesPage() {
  const services = await getServices()

  // Group services by category
  const groupedServices = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, typeof services>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage surf lessons, tours, and transport</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/services/new">
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No services configured yet. Add your first service to get started.
            </p>
            <Button asChild>
              <Link href="/admin/services/new">
                <Plus className="w-4 h-4 mr-2" />
                Add First Service
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedServices).map(([category, categoryServices]) => {
          const Icon = categoryIcons[category] || Package

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-5 h-5 text-primary" />
                <h2 className="font-heading text-xl font-semibold capitalize">{category}</h2>
                <Badge variant="secondary">{categoryServices.length}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    {service.image_url && (
                      <div className="aspect-video relative">
                        <img
                          src={service.image_url || "/placeholder.svg"}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        {service.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>

                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center gap-4">
                          {service.duration_hours && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {service.duration_hours}h
                            </div>
                          )}
                          {service.max_participants && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Users className="w-4 h-4" />
                              Max {service.max_participants}
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-lg">${service.price}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Link href={`/admin/services/${service.id}/edit`}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </Button>
                        <ServiceDeleteButton serviceId={service.id} serviceName={service.name} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
