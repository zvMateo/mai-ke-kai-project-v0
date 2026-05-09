import { getTranslations } from "next-intl/server";
import { HeroSectionClient } from "@/components/landing/hero-section-client";

/**
 * Hero — server wrapper.
 *
 * Phase 1 redesign: editorial display headline, single-line subhead,
 * asymmetric CTAs, subtle trust line, Cinematic Wave Reveal entrance.
 * All copy comes from `messages/{locale}.json` under the `hero` namespace.
 */
export async function HeroSection() {
  const t = await getTranslations("hero");

  return (
    <HeroSectionClient
      eyebrow={t("eyebrow")}
      headline={t("headline")}
      subheadline={t("subheadline")}
      ctaPrimary={t("ctaPrimary")}
      ctaSecondary={t("ctaSecondary")}
      trustLine={t("trustLine")}
      scrollHint={t("scrollHint")}
    />
  );
}
