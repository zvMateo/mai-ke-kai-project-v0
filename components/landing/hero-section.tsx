import { getTranslations } from "next-intl/server";
import { HeroSectionClient } from "@/components/landing/hero-section-client";

export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <HeroSectionClient
      bookLabel={t("bookYourStay")}
      exploreLabel={t("exploreSurfCamps")}
      reviewsLabel={t("reviews")}
      nationalitiesLabel={t("nationalities")}
      surfCampsLabel={t("surfCamps")}
      scrollLabel={t("scrollDown")}
    />
  );
}
