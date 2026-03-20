import type { Metadata } from "next";
import Image from "next/image";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";
import {
  Waves,
  Users,
  MapPin,
  Star,
  Leaf,
  Sun,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Mai Ke Kai Surf House",
  description:
    "Learn the story behind Mai Ke Kai Surf House — founded by surfers, built for adventurers in the heart of Tamarindo, Costa Rica.",
  openGraph: {
    title: "About Us | Mai Ke Kai Surf House",
    description:
      "Learn the story behind Mai Ke Kai Surf House — founded by surfers, built for adventurers in Tamarindo, Costa Rica.",
  },
};

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("about");

  const values = [
    { icon: Waves, title: t("valueSurf"), description: t("valueSurfDesc") },
    { icon: Users, title: t("valueCommunity"), description: t("valueCommunityDesc") },
    { icon: MapPin, title: t("valueLocation"), description: t("valueLocationDesc") },
    { icon: Star, title: t("valueQuality"), description: t("valueQualityDesc") },
    { icon: Leaf, title: t("valueSustainable"), description: t("valueSustainableDesc") },
    { icon: Sun, title: t("valueWaves"), description: t("valueWavesDesc") },
  ];

  const team = [
    {
      initials: "MKK",
      color: "bg-primary",
      name: t("teamFoundersName"),
      role: t("teamFoundersRole"),
      bio: t("teamFoundersBio"),
    },
    {
      initials: "CR",
      color: "bg-seafoam",
      name: t("teamSurfName"),
      role: t("teamSurfRole"),
      bio: t("teamSurfBio"),
    },
    {
      initials: "HT",
      color: "bg-amber-500",
      name: t("teamHostName"),
      role: t("teamHostRole"),
      bio: t("teamHostBio"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main>
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
              alt="Tamarindo beach"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.7) 100%)",
              }}
            />
          </div>
          <div className="relative z-10 text-center text-white px-4 pt-24 pb-16">
            <p className="text-seafoam font-semibold uppercase tracking-wider text-sm mb-4">
              {t("heroTagline")}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
              {t("heroSubtitle")}
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
                  alt="Mai Ke Kai Surf House"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">
                    {t("storyTagline")}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                    {t("storyTitle")}
                  </h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t("storyP1")}</p>
                  <p>{t("storyP2")}</p>
                  <p>{t("storyP3")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">
                {t("valuesTagline")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t("valuesTitle")}
              </h2>
              <p className="text-muted-foreground">
                {t("valuesSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-background rounded-xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">
                {t("teamTagline")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                {t("teamTitle")}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="text-center">
                  <div
                    className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <span className="text-white font-bold text-lg">
                      {member.initials}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-deep text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              {t("ctaSubtitle")}
            </p>
            <a
              href={TAB_TRAVEL_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-10 py-6 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition-transform"
              >
                {t("ctaButton")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
