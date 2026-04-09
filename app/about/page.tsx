import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  Heart,
} from "lucide-react";
import {
  AnimatedCounter,
  ScrollReveal,
  StaggerChildren,
  StaggerItem,
  TimelineItem,
  MeaningQuote,
} from "@/components/about/about-animations";
import { AboutVideoSection } from "@/components/about/about-video-section";
import { getTeamMembers, getTimeline, getSiteContent } from "@/lib/actions/about";

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

// Fallback data when DB is empty
const FALLBACK_TEAM = [
  {
    id: "1",
    name: "The Founders",
    role: "Surf & Hospitality",
    bio: "A group of surfers from different corners of the world who fell in love with Tamarindo and decided to create a home for the surf community.",
    avatar_url: null,
    display_order: 1,
    is_active: true,
    created_at: "",
  },
  {
    id: "2",
    name: "Surf Team",
    role: "Certified Instructors",
    bio: "Passionate local surfers and certified instructors who know every break, every current, and every perfect wave in Tamarindo.",
    avatar_url: null,
    display_order: 2,
    is_active: true,
    created_at: "",
  },
  {
    id: "3",
    name: "Host Team",
    role: "Hospitality",
    bio: "The heart of Mai Ke Kai. Always ready with local tips, a cold drink, and the best smile in Tamarindo.",
    avatar_url: null,
    display_order: 3,
    is_active: true,
    created_at: "",
  },
];

const FALLBACK_TIMELINE = [
  { id: "1", year: "2019", title: "The Dream Begins", description: "A group of surfers from different corners of the world meet in Tamarindo and fall in love with the waves, the people, and the pura vida spirit.", display_order: 1, created_at: "" },
  { id: "2", year: "2020", title: "Building the Home", description: "The idea of creating a surf house where travelers could live the authentic Costa Rica experience takes shape.", display_order: 2, created_at: "" },
  { id: "3", year: "2021", title: "First Guests", description: "Mai Ke Kai opens its doors. First guests arrive from 12 different countries.", display_order: 3, created_at: "" },
  { id: "4", year: "2022", title: "Growing Community", description: "Word spreads. The community grows to 500+ guests from 25+ nationalities.", display_order: 4, created_at: "" },
  { id: "5", year: "2023", title: "Mai Ke Kai Today", description: "Recognized as one of the top surf hostels in Costa Rica, with 30+ nationalities and 2500+ happy guests.", display_order: 5, created_at: "" },
];

// Gradient colors for team avatars (cycles by index)
const AVATAR_GRADIENTS = [
  "from-primary to-ocean-dark",
  "from-seafoam to-ocean",
  "from-amber-400 to-coral",
];

export default async function AboutPage() {
  const locale = await getLocale();
  const t = await getTranslations("about");

  const [dbTeam, dbTimeline, siteContent] = await Promise.all([
    getTeamMembers(),
    getTimeline(),
    getSiteContent(["about_quote", "about_quote_author", "about_video_id"]),
  ]);

  const team = dbTeam.length > 0 ? dbTeam : FALLBACK_TEAM;
  const timeline = dbTimeline.length > 0 ? dbTimeline : FALLBACK_TIMELINE;

  const beachQuote =
    siteContent["about_quote"] ?? "The ocean is calling — and we must go.";
  const beachQuoteAuthor =
    siteContent["about_quote_author"] ?? "Pura Vida, Costa Rica";
  const videoId = siteContent["about_video_id"] ?? null;

  const values = [
    { icon: Waves, title: t("valueSurf"), description: t("valueSurfDesc"), color: "bg-primary/10", iconColor: "text-primary" },
    { icon: Users, title: t("valueCommunity"), description: t("valueCommunityDesc"), color: "bg-seafoam/20", iconColor: "text-ocean-dark" },
    { icon: MapPin, title: t("valueLocation"), description: t("valueLocationDesc"), color: "bg-coral/10", iconColor: "text-coral" },
    { icon: Star, title: t("valueQuality"), description: t("valueQualityDesc"), color: "bg-amber-50", iconColor: "text-amber-500" },
    { icon: Leaf, title: t("valueSustainable"), description: t("valueSustainableDesc"), color: "bg-green-50", iconColor: "text-green-600" },
    { icon: Sun, title: t("valueWaves"), description: t("valueWavesDesc"), color: "bg-primary/10", iconColor: "text-primary" },
  ];

  const stats = [
    { value: 5, suffix: "+", label: t("statsYearsLabel") },
    { value: 2500, suffix: "+", label: t("statsGuestsLabel") },
    { value: 30, suffix: "+", label: t("statsCountriesLabel") },
    { value: 15000, suffix: "+", label: t("statsSessionsLabel") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader locale={locale} />

      <main>
        {/* ── HERO ── */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
              alt="Tamarindo beach"
              fill
              className="object-cover"
              priority
              quality={90}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%)",
              }}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

          <div className="relative z-10 text-center text-white px-4 pt-28 pb-20 max-w-4xl mx-auto">
            <ScrollReveal delay={0.2}>
              <p className="text-seafoam font-semibold uppercase tracking-[0.3em] text-sm mb-5">
                {t("heroTagline")}
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">
                {t("heroTitle")}
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.6}>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                {t("heroSubtitle")}
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ── MEANING QUOTE ── */}
        <section className="py-24 bg-background">
          <MeaningQuote
            tagline={t("meaningTagline")}
            title={t("meaningTitle")}
            subtitle={t("meaningSubtitle")}
            text={t("meaningText")}
          />
        </section>

        {/* ── STORY ── */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <ScrollReveal className="relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/surf-instructor-teaching-beginner-on-beach-costa-r.jpg"
                    alt="Mai Ke Kai Surf House"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute -bottom-6 -right-4 md:-right-8 bg-primary text-white rounded-2xl px-5 py-4 shadow-xl z-10 max-w-[160px]">
                  <p className="font-heading font-bold text-2xl">4.9 ⭐</p>
                  <p className="text-white/80 text-xs mt-1">Google Reviews</p>
                </div>
              </ScrollReveal>

              <div className="space-y-6">
                <ScrollReveal>
                  <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-2">
                    {t("storyTagline")}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl font-bold">
                    {t("storyTitle")}
                  </h2>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                  <div className="space-y-5 text-muted-foreground leading-relaxed">
                    <p className="text-base">{t("storyP1")}</p>
                    <p className="text-base">{t("storyP2")}</p>
                    <p className="text-base">{t("storyP3")}</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                  <div className="flex items-center gap-3 pt-2">
                    <Heart className="w-5 h-5 text-coral fill-coral" />
                    <span className="text-sm font-medium text-foreground">
                      Tamarindo, Costa Rica — Pura Vida 🌺
                    </span>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS COUNTER BAR ── */}
        <section className="py-16 bg-deep text-white relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-8"
            style={{ background: "var(--color-muted, #f5f5f5)", clipPath: "ellipse(55% 100% at 50% 0%)" }}
          />
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <p className="text-center text-seafoam text-sm font-semibold uppercase tracking-widest mb-12">
                {t("statsTitle")}
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-heading text-4xl sm:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VIDEO ── */}
        {videoId && (
          <AboutVideoSection
            videoId={videoId}
            title={t("videoTitle")}
            subtitle={t("videoSubtitle")}
          />
        )}

        {/* ── TIMELINE ── */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <ScrollReveal className="text-center mb-16">
                <p className="text-primary font-semibold uppercase tracking-widest text-sm mb-3">
                  {t("timelineTagline")}
                </p>
                <h2 className="font-heading text-3xl md:text-4xl font-bold">
                  {t("timelineTitle")}
                </h2>
              </ScrollReveal>

              <div>
                {timeline.map((item, i) => (
                  <TimelineItem
                    key={item.id}
                    year={item.year}
                    title={item.title}
                    desc={item.description}
                    isLast={i === timeline.length - 1}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-3">
                {t("valuesTagline")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t("valuesTitle")}
              </h2>
              <p className="text-muted-foreground">{t("valuesSubtitle")}</p>
            </ScrollReveal>

            <StaggerChildren
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
              staggerDelay={0.08}
            >
              {values.map((value) => (
                <StaggerItem key={value.title}>
                  <div className="group bg-background rounded-2xl p-7 shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full">
                    <div
                      className={`w-14 h-14 rounded-2xl ${value.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <value.icon className={`w-7 h-7 ${value.iconColor}`} />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <ScrollReveal className="text-center mb-16">
              <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-3">
                {t("teamTagline")}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                {t("teamTitle")}
              </h2>
            </ScrollReveal>

            <StaggerChildren
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
              staggerDelay={0.12}
            >
              {team.map((member, idx) => (
                <StaggerItem key={member.id}>
                  <div className="group text-center">
                    <div className="relative mx-auto mb-5 w-24 h-24">
                      {member.avatar_url ? (
                        <Image
                          src={member.avatar_url}
                          alt={member.name}
                          fill
                          className="object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className={`w-24 h-24 rounded-full bg-gradient-to-br ${
                            AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                          } flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                        >
                          <span className="text-white font-bold text-xl">
                            {member.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm font-semibold mb-3">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* ── IMMERSIVE PHOTO DIVIDER ── */}
        <section className="relative h-72 sm:h-96 overflow-hidden">
          <Image
            src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
            alt="Costa Rica waves"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-deep/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScrollReveal>
              <blockquote className="text-center text-white px-6 max-w-2xl">
                <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold italic leading-relaxed">
                  &ldquo;{beachQuote}&rdquo;
                </p>
                <p className="text-white/60 mt-4 text-sm">— {beachQuoteAuthor}</p>
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-28 bg-gradient-to-br from-deep via-primary/90 to-ocean-dark text-white relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-seafoam/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <ScrollReveal>
              <Waves className="w-12 h-12 text-seafoam/80 mx-auto mb-6" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-5">
                {t("ctaTitle")}
              </h2>
              <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                {t("ctaSubtitle")}
              </p>
              <Link
                href={TAB_TRAVEL_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold px-12 py-7 rounded-full text-lg shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  {t("ctaButton")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
