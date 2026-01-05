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
        <div className="absolute inset-0 bg-gradient-to-b from-deep/70 via-deep/40 to-deep/80" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center text-white mb-12">
          {/* Logo */}
          <Image
            src="/images/mai-20ke-20kai-20-20logo-20-20blanco.png"
            alt="Mai Ke Kai Surf House"
            width={280}
            height={280}
            className="mx-auto mb-8 w-52 md:w-64 lg:w-72"
          />

          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
            {t("title")}
            <br />
            <span className="text-seafoam">{t("titleHighlight")}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/booking">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-10 py-6 text-lg shadow-xl"
              >
                {t("cta")}
              </Button>
            </Link>
            <Link href="#surf">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 bg-transparent px-10 py-6 text-lg"
              >
                {tSurf("lessons")}
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
