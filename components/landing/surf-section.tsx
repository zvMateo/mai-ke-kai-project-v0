import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, ArrowRight } from "lucide-react";
import type { Service } from "@/types/database";
import { getTranslations } from "next-intl/server";

interface SurfSectionProps {
  services: Service[];
}

// Fallback images for services without images
const fallbackImages: Record<string, string> = {
  surf: "/surf-instructor-teaching-beginner-on-beach-costa-r.jpg",
  tour: "/catamaran-sailing-costa-rica-coast-with-tourists-s.jpg",
  transport: "/shuttle-van-on-costa-rica-coastal-road-with-palm-t.jpg",
  other: "/kayaking-through-mangroves-costa-rica-wildlife.jpg",
};

export async function SurfSection({ services }: SurfSectionProps) {
  const t = await getTranslations("surf");
  const tCommon = await getTranslations("common");
  // Show message if no services configured
  if (services.length === 0) {
    return (
      <section id="surf" className="py-24 bg-card">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t("noServices")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="surf" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              {t("title")}
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
              {t("sectionTitle")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t("sectionSubtitle")}
            </p>
          </div>
          <Link href="/services">
            <Button variant="outline" className="group bg-transparent">
              {t("viewAll")}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Services Grid - Now using real data from Supabase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const imageUrl =
              service.image_url ||
              fallbackImages[service.category] ||
              "/placeholder.svg";

            return (
              <Card
                key={service.id}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-heading text-lg font-bold text-white">
                      {service.name}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {service.description || `${service.category} service`}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    {service.duration_hours && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration_hours}h
                      </span>
                    )}
                    {service.max_participants && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {t("max")} {service.max_participants}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      ${service.price}
                    </span>
                    <Link href={`/booking?service=${service.id}`}>
                      <Button size="sm">{tCommon("bookNow")}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Surf Guarantee Banner */}
        <div className="mt-16 relative overflow-hidden rounded-2xl">
          <Image
            src="/perfect-waves-costa-rica-sunset-surfers-in-water.jpg"
            alt="Surf conditions"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative z-10 p-8 md:p-12 text-center text-white">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              {t("bannerTitle")}
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto mb-6">
              {t("bannerSubtitle")}
            </p>
            <Link href="/booking">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90"
              >
                {t("bannerCta")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
