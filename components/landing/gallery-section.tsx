import { getTranslations } from "next-intl/server";
import { getGalleryItems } from "@/lib/actions/gallery";
import { GalleryGridClient } from "@/components/landing/gallery-grid-client";

export async function GallerySection() {
  const t = await getTranslations("gallery");
  const items = await getGalleryItems(undefined, 24);

  return (
    <section id="gallery" className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest block mb-3">
            {t("tagline")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        <GalleryGridClient
          items={items}
          labels={{
            all: t("all"),
            surf: t("surf"),
            rooms: t("rooms"),
            community: t("community"),
            nature: t("nature"),
            lifestyle: t("lifestyle"),
            open: t("openPhoto"),
            prev: t("prevPhoto"),
            next: t("nextPhoto"),
            close: t("closeGallery"),
            noPhotos: t("noPhotos"),
          }}
        />
      </div>
    </section>
  );
}
