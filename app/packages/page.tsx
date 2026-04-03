import Link from "next/link"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Check, Waves, Bed, Calendar, Users, Star, ArrowRight } from "lucide-react"
import { getPackages } from "@/lib/actions/packages"
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils"

export default async function PackagesPage() {
  const packages = await getPackages()
  const t = await getTranslations("packages")

  const roomTypeLabels: Record<string, string> = {
    dorm: t("dorm"),
    private: t("private"),
    family: t("family"),
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-coral text-white">{t("heroBadge")}</Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noPackages")}</p>
              <Link
                href={TAB_TRAVEL_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>{t("bookAccommodation")}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg) => {
                const savings = pkg.original_price ? pkg.original_price - pkg.price : 0
                const includes = Array.isArray(pkg.includes) ? pkg.includes : []

                return (
                  <Card
                    key={pkg.id}
                    className={`relative overflow-hidden ${pkg.is_popular ? "border-primary shadow-xl" : ""}`}
                  >
                    {pkg.is_popular && (
                      <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium">
                        {t("popular")}
                      </div>
                    )}

                    {pkg.image_url && (
                      <div className="aspect-video relative">
                        <Image
                          src={pkg.image_url}
                          alt={pkg.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="font-heading text-2xl">{pkg.name}</CardTitle>
                          {pkg.tagline && <p className="text-muted-foreground">{pkg.tagline}</p>}
                        </div>
                        {pkg.is_for_two && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {t("forTwo")}
                          </Badge>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="flex gap-4 mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{pkg.nights} {t("nights")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Waves className="w-4 h-4 text-primary" />
                          <span>{pkg.surf_lessons} {t("lessons")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Bed className="w-4 h-4 text-primary" />
                          <span className="capitalize">
                            {roomTypeLabels[pkg.room_type] || pkg.room_type}
                          </span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Includes List */}
                      {includes.length > 0 && (
                        <ul className="space-y-2">
                          {includes.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Pricing */}
                      <div className="pt-4 border-t">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            {pkg.original_price && (
                              <p className="text-sm text-muted-foreground line-through">
                                ${pkg.original_price} {pkg.is_for_two ? t("perCouple") : t("perPerson")}
                              </p>
                            )}
                            <p className="text-3xl font-bold text-primary">
                              ${pkg.price}
                              <span className="text-sm font-normal text-muted-foreground">
                                {" "}
                                {pkg.is_for_two ? t("perCouple") : t("perPerson")}
                              </span>
                            </p>
                          </div>
                          {savings > 0 && (
                            <Badge className="bg-green-100 text-green-800">
                              {t("savings").replace("${amount}", String(savings))}
                            </Badge>
                          )}
                        </div>

                        <Link
                          href={TAB_TRAVEL_CHECKOUT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="w-full" size="lg">
                            {t("bookPackage")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Why Packages Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-bold mb-8">{t("whyPackagesTitle")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{t("whySavingsTitle")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("whySavingsDesc")}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-coral" />
                </div>
                <h3 className="font-semibold mb-2">{t("whyOrganizedTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("whyOrganizedDesc")}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-seafoam/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Waves className="w-8 h-8 text-ocean-dark" />
                </div>
                <h3 className="font-semibold mb-2">{t("whyCompleteTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("whyCompleteDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("ctaSubtitle")}</p>
          <Link
            href={TAB_TRAVEL_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              {t("bookA La Carte")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
