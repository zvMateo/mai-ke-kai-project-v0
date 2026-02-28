import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookingWidget } from "@/components/booking/booking-widget";
import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function HeroSection() {
  const t = await getTranslations("hero");
  const tCommon = await getTranslations("common");
  const tSurf = await getTranslations("surf");

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
        <div className="absolute inset-0 bg-linear-gradient-to-b from-deep/70 via-deep/40 to-deep/80" style={{ background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center text-white mb-12">
          {/* Logo removed as per requirements */}

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight">
            {t("title")}
            <br />
            <span className="text-seafoam">{t("titleHighlight")}</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8 sm:mb-10 px-2 text-pretty leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTA Button - Simplified for single focus */}
          <div className="flex justify-center mb-10 sm:mb-16 px-4">
            <Link href="#surf" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-white/50"
                aria-label={tSurf("lessons")}
              >
                Surf Lessons
              </Button>
            </Link>
          </div>
        </div>

        {/* Booking Widget */}
        <div className="max-w-4xl mx-auto">
          <BookingWidget />
        </div>
      </div>

      {/* Scroll Indicator */}
    </section>
  );
}
