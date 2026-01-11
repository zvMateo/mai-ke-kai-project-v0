"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackagesList } from "@/lib/queries";
import { PackageDeleteButton } from "@/components/admin/package-delete-button";
import { Plus, Calendar, Waves, Bed, Pencil, Star, Users } from "lucide-react";
import type { SurfPackage } from "@/types/database";

function PackagesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, idx) => (
        <Card key={`package-skeleton-${idx}`}>
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-32" />
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
          No packages configured yet. Create your first surf package to get
          started.
        </p>
        <Button asChild>
          <Link href="/admin/packages/new">
            <Plus className="w-4 h-4 mr-2" />
            Create First Package
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PackageCard({ pkg }: { pkg: SurfPackage }) {
  const savings = pkg.original_price ? pkg.original_price - pkg.price : 0;
  const includes = Array.isArray(pkg.includes) ? pkg.includes : [];

  return (
    <Card
      className={`relative overflow-hidden ${
        pkg.is_popular ? "border-primary" : ""
      }`}
    >
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
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-xl">{pkg.name}</CardTitle>
            {pkg.tagline && (
              <p className="text-sm text-muted-foreground">{pkg.tagline}</p>
            )}
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
              {includes.slice(0, 3).map((item, idx) => (
                <li key={`${pkg.id}-include-${idx}`} className="truncate">
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
              <p className="text-sm text-muted-foreground line-through">
                ${pkg.original_price}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">${pkg.price}</p>
            {savings > 0 && (
              <Badge className="bg-green-100 text-green-800 mt-1">
                Ahorras ${savings}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-transparent"
            >
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
  );
}

export function PackagesClient() {
  const {
    data: packages = [],
    isLoading,
    isFetching,
    error,
  } = usePackagesList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Surf Packages</h1>
          <p className="text-muted-foreground">
            Manage combined accommodation + surf packages
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/packages/new">
            <Plus className="w-4 h-4" />
            Add Package
          </Link>
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8">
            <p className="text-destructive">
              Failed to load packages: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <PackagesSkeleton />
      ) : packages.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {isFetching && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Updating latest data…
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
