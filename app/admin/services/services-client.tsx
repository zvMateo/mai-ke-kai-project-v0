"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useServicesList } from "@/lib/queries";
import {
  Plus,
  Clock,
  Users,
  Waves,
  Ship,
  Car,
  Package,
  Pencil,
} from "lucide-react";
import { ServiceDeleteButton } from "@/components/admin/service-delete-button";
import type { Service } from "@/types/database";

const categoryIcons: Record<string, typeof Waves> = {
  surf: Waves,
  tour: Ship,
  transport: Car,
  other: Package,
};

function ServicesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={`service-skeleton-${idx}`} className="overflow-hidden">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <p className="text-muted-foreground">
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
  );
}

export function ServicesClient() {
  const {
    data: services = [],
    isLoading,
    isFetching,
    error,
  } = useServicesList();

  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || "other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage surf lessons, tours, and transport
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/services/new">
            <Plus className="w-4 h-4" />
            Add Service
          </Link>
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">
              Failed to load services: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <ServicesSkeleton />
      ) : services.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isFetching && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Updating latest data…
            </p>
          )}

          {Object.entries(groupedServices).map(
            ([category, categoryServices]) => {
              const Icon = categoryIcons[category] || Package;

              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                    <h2 className="font-heading text-xl font-semibold capitalize">
                      {category}
                    </h2>
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
                            <CardTitle className="text-lg">
                              {service.name}
                            </CardTitle>
                            {service.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Inactive</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.description}
                          </p>

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
                            <p className="font-bold text-lg">
                              ${service.price}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                            >
                              <Link href={`/admin/services/${service.id}/edit`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </Button>
                            <ServiceDeleteButton
                              serviceId={service.id}
                              serviceName={service.name}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </>
      )}
    </div>
  );
}
