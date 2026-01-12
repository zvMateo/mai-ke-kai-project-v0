import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Waves, Users, Check, ArrowRight } from "lucide-react";
import type { SurfPackage } from "@/types/database";
import { getTranslations } from "next-intl/server";

interface PackagesSectionProps {
  packages: SurfPackage[];
}

// Fallback image for packages without images
const fallbackImage = "/perfect-waves-costa-rica-sunset-surfers-in-water.jpg";

export async function PackagesSection({ packages }: PackagesSectionProps) {
  const t = await getTranslations("packages");
  const tCommon = await getTranslations("common");

  // Show message if no packages configured
  if (packages.length === 0) {
    return (
      <section id="packages" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t("noPackages")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="text-center lg:text-left">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {t("title")}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              {t("sectionTitle")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto lg:mx-0">
              {t("sectionSubtitle")}
            </p>
          </div>
          <Link href="/packages">
            <Button variant="outline" className="group bg-transparent">
              {t("viewAll")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const imageUrl = pkg.image_url || fallbackImage;
            const includes = Array.isArray(pkg.includes)
              ? pkg.includes
              : typeof pkg.includes === "string"
                ? JSON.parse(pkg.includes)
                : [];

            return (
              <Card
                key={pkg.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Popular Badge */}
                {pkg.is_popular && (
                  <Badge className="absolute top-4 left-4 z-10 bg-primary text-white">
                    {t("popular")}
                  </Badge>
                )}

                {/* For Two Badge */}
                {pkg.is_for_two && (
                  <Badge
                    variant="secondary"
                    className="absolute top-4 right-4 z-10"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    {t("forTwo")}
                  </Badge>
                )}

                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-heading text-xl font-bold text-white">
                      {pkg.name}
                    </h3>
                    {pkg.tagline && (
                      <p className="text-white/80 text-sm">{pkg.tagline}</p>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Package Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Moon className="w-4 h-4" />
                      {pkg.nights} {t("nights")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Waves className="w-4 h-4" />
                      {pkg.surf_lessons} {t("lessons")}
                    </span>
                  </div>

                  {/* Description */}
                  {pkg.description && (
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}

                  {/* Includes List */}
                  {includes.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {includes.slice(0, 3).map((item: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {includes.length > 3 && (
                        <li className="text-sm text-primary">
                          +{includes.length - 3} {t("more")}
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {pkg.original_price && pkg.original_price > pkg.price && (
                        <span className="text-muted-foreground line-through text-sm mr-2">
                          ${pkg.original_price}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-primary">
                        ${pkg.price}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {pkg.is_for_two ? ` / ${t("perCouple")}` : ` / ${t("perPerson")}`}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/booking?package=${pkg.id}`} className="block mt-4">
                    <Button className="w-full">{tCommon("bookNow")}</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
