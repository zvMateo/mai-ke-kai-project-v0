import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HeroBookNowButton } from "@/components/landing/hero-book-now-button";
import { Button } from "@/components/ui/button";
import { Star, Globe, Waves } from "lucide-react";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
          alt="Costa Rica surf beach"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Heading */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
            {t("title")}
            <br />
            <span className="text-seafoam">{t("titleHighlight")}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8 px-2 text-pretty leading-relaxed">
            {t("subtitle")}
          </p>

          {/* Social proof stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white/90 text-sm font-medium">
                4.9/5 · 213 {t("reviews")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Globe className="w-4 h-4 text-seafoam" />
              <span className="text-white/90 text-sm font-medium">
                30+ {t("nationalities")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Waves className="w-4 h-4 text-seafoam" />
              <span className="text-white/90 text-sm font-medium">
                500+ {t("surfCamps")}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HeroBookNowButton label={t("bookYourStay")} />
            <Link href="#packages">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/60 text-white hover:bg-white/10 bg-transparent hover:text-white px-8 py-6 rounded-full text-base font-semibold transition-all duration-300"
              >
                {t("exploreSurfCamps")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
        <span className="text-xs tracking-wider uppercase">{t("scrollDown")}</span>
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
