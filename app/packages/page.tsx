export const runtime = "edge";

import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import {
  Check,
  Waves,
  Bed,
  Calendar,
  Users,
  Star,
  ArrowRight,
  Quote,
  Zap,
  Shield,
  Heart,
} from "lucide-react";
import { getPackages } from "@/lib/actions/packages";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";
import { PackagesFaqClient } from "@/components/packages/packages-faq-client";

export default async function PackagesPage() {
  const packages = await getPackages();
  const t = await getTranslations("packages");

  const roomTypeLabels: Record<string, string> = {
    dorm: t("dorm"),
    private: t("private"),
    family: t("family"),
  };

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
    { q: t("faq4q"), a: t("faq4a") },
    { q: t("faq5q"), a: t("faq5a") },
  ];

  const testimonials = [
    {
      name: t("testimonial1name"),
      from: t("testimonial1from"),
      text: t("testimonial1text"),
      rating: 5,
    },
    {
      name: t("testimonial2name"),
      from: t("testimonial2from"),
      text: t("testimonial2text"),
      rating: 5,
    },
    {
      name: t("testimonial3name"),
      from: t("testimonial3from"),
      text: t("testimonial3text"),
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/perfect-waves-costa-rica-sunset-surfers-in-water.jpg"
            alt="Surf packages Costa Rica"
            fill
            className="object-cover brightness-[0.32]"
            priority
          />
        </div>

        <div className="container mx-auto px-4 text-center text-white relative z-10">
          <Badge className="mb-5 bg-coral/90 text-white text-sm px-5 py-1.5 rounded-full border-0 shadow-lg">
            {t("heroBadge")}
          </Badge>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            {t("heroTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {t("heroSubtitle")}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-seafoam" />
              Free cancellation 7 days prior
            </span>
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Instant confirmation
            </span>
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-coral" />
              Expert local guides
            </span>
          </div>
        </div>
      </section>

      {/* ── PACKAGES GRID ── */}
      <section className="py-20 bg-background" id="packages">
        <div className="container mx-auto px-4">
          {packages.length === 0 ? (
            <div className="text-center py-16">
              <Waves className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg mb-6">
                {t("noPackages")}
              </p>
              <Link
                href={TAB_TRAVEL_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg">{t("bookAccommodation")}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg) => {
                const savings = pkg.original_price
                  ? pkg.original_price - pkg.price
                  : 0;
                const includes = Array.isArray(pkg.includes) ? pkg.includes : [];

                return (
                  <div
                    key={pkg.id}
                    className={`relative group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-card ${
                      pkg.is_popular
                        ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                        : "border-border"
                    }`}
                  >
                    {/* Popular ribbon */}
                    {pkg.is_popular && (
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                          ⭐ {t("popular")}
                        </Badge>
                      </div>
                    )}

                    {/* Image with price overlay */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={
                          pkg.image_url ||
                          "/surf-instructor-teaching-beginner-on-beach-costa-r.jpg"
                        }
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                      {/* Price on image */}
                      <div className="absolute bottom-4 left-4 text-white">
                        {pkg.original_price && (
                          <p className="text-xs line-through text-white/60 mb-0.5">
                            ${pkg.original_price}{" "}
                            {pkg.is_for_two ? t("perCouple") : t("perPerson")}
                          </p>
                        )}
                        <p className="text-3xl font-bold font-heading leading-none">
                          ${pkg.price}
                          <span className="text-sm font-normal text-white/75 ml-1">
                            {pkg.is_for_two ? t("perCouple") : t("perPerson")}
                          </span>
                        </p>
                      </div>

                      {/* For Two badge */}
                      {pkg.is_for_two && (
                        <div className="absolute bottom-4 right-4">
                          <Badge className="bg-white/15 border-white/30 text-white text-xs backdrop-blur-sm">
                            <Users className="w-3 h-3 mr-1" />
                            {t("forTwo")}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="flex flex-col flex-1 p-6">
                      <h3 className="font-heading text-xl font-bold text-foreground mb-1">
                        {pkg.name}
                      </h3>
                      {pkg.tagline && (
                        <p className="text-muted-foreground text-sm mb-4 leading-snug">
                          {pkg.tagline}
                        </p>
                      )}

                      {/* Quick stats */}
                      <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-border/60">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {pkg.nights}
                          </span>
                          <span className="text-muted-foreground">
                            {t("nights")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Waves className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {pkg.surf_lessons}
                          </span>
                          <span className="text-muted-foreground">
                            {t("lessons")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Bed className="w-4 h-4 text-primary" />
                          {roomTypeLabels[pkg.room_type] || pkg.room_type}
                        </div>
                      </div>

                      {/* Includes */}
                      {includes.length > 0 && (
                        <ul className="space-y-2.5 mb-6 flex-1">
                          {includes
                            .slice(0, 5)
                            .map((item: string, idx: number) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          {includes.length > 5 && (
                            <li className="text-xs text-primary font-semibold">
                              +{includes.length - 5} {t("more")}
                            </li>
                          )}
                        </ul>
                      )}

                      {/* Savings + CTA */}
                      <div className="mt-auto space-y-3">
                        {savings > 0 && (
                          <div className="flex items-center justify-center bg-green-50 dark:bg-green-950/30 rounded-lg py-2 px-3 border border-green-200 dark:border-green-800">
                            <span className="text-green-700 dark:text-green-400 text-sm font-semibold">
                              🎉{" "}
                              {t("savings").replace(
                                "${amount}",
                                String(savings)
                              )}
                            </span>
                          </div>
                        )}
                        <Link
                          href={TAB_TRAVEL_CHECKOUT_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button
                            className="w-full font-bold rounded-xl py-5 text-base hover:scale-[1.02] transition-transform"
                            size="lg"
                            variant={pkg.is_popular ? "default" : "outline"}
                          >
                            {t("bookPackage")}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY PACKAGES ── */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
              {t("whyPackagesTitle")}
            </h2>
            <p className="text-muted-foreground mb-14 max-w-xl mx-auto">
              {t("sectionSubtitle")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Star className="w-7 h-7 text-primary" />,
                  bg: "bg-primary/10",
                  title: t("whySavingsTitle"),
                  desc: t("whySavingsDesc"),
                },
                {
                  icon: <Calendar className="w-7 h-7 text-coral" />,
                  bg: "bg-coral/10",
                  title: t("whyOrganizedTitle"),
                  desc: t("whyOrganizedDesc"),
                },
                {
                  icon: <Waves className="w-7 h-7 text-ocean-dark" />,
                  bg: "bg-seafoam/20",
                  title: t("whyCompleteTitle"),
                  desc: t("whyCompleteDesc"),
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group text-center p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-deep text-white overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <span className="text-seafoam text-sm font-semibold uppercase tracking-widest">
              Guest Reviews
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2 text-white">
              What Our Surfers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 flex flex-col hover:bg-white/10 transition-colors duration-300"
              >
                <Quote className="w-8 h-8 text-seafoam/60 mb-4" />
                <p className="text-white/85 text-sm leading-relaxed flex-1">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">
                      {item.name}
                    </p>
                    <p className="text-white/50 text-xs">{item.from}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">
                FAQ
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold mt-2">
                {t("faqTitle")}
              </h2>
            </div>
            <PackagesFaqClient faqs={faqs} />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 bg-gradient-to-br from-primary to-ocean-dark text-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-seafoam/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Waves className="w-12 h-12 text-seafoam/80 mx-auto mb-6" />
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-white/75 mb-10 text-lg max-w-xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <Link
            href={TAB_TRAVEL_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-12 py-7 rounded-full text-base shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {t("bookA La Carte")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border md:hidden shadow-xl">
        <Link
          href={TAB_TRAVEL_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full font-bold py-5 text-base rounded-xl shadow-lg">
            {t("bookPackage")} →
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
