"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryItem } from "@/types/database";

interface GalleryLightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
  labels: {
    prev: string;
    next: string;
    close: string;
  };
}

export function GalleryLightbox({
  items,
  initialIndex,
  onClose,
  labels,
}: GalleryLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % items.length),
    [items.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const item = items[current];

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        onClick={onClose}
        aria-label={labels.close}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      <button
        className="absolute left-4 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
        onClick={(e) => { e.stopPropagation(); prev(); }}
        aria-label={labels.prev}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="relative max-w-5xl max-h-[85vh] w-full mx-16"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-[80vh]">
            <Image
              src={item.image_url}
              alt={item.title || "Gallery"}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
          {(item.title || item.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5 rounded-b-xl">
              {item.title && (
                <p className="text-white font-semibold text-lg">{item.title}</p>
              )}
              {item.description && (
                <p className="text-white/70 text-sm mt-1">{item.description}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      <button
        className="absolute right-4 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
        onClick={(e) => { e.stopPropagation(); next(); }}
        aria-label={labels.next}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
        {current + 1} / {items.length}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   GalleryGrid — client wrapper with filter tabs + lightbox
────────────────────────────────────────────── */
interface GalleryGridClientProps {
  items: GalleryItem[];
  labels: {
    all: string;
    surf: string;
    rooms: string;
    community: string;
    nature: string;
    lifestyle: string;
    open: string;
    prev: string;
    next: string;
    close: string;
    noPhotos: string;
  };
}

const CATEGORY_TABS = [
  "all", "surf", "rooms", "community", "nature", "lifestyle",
] as const;

export function GalleryGridClient({ items, labels }: GalleryGridClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (id: string) => {
    setFailedImages((prev) => new Set(prev).add(id));
  };

  const filtered = activeCategory === "all"
    ? items
    : items.filter((i) => i.category === activeCategory);

  const categoryLabel: Record<string, string> = {
    all: labels.all,
    surf: labels.surf,
    rooms: labels.rooms,
    community: labels.community,
    nature: labels.nature,
    lifestyle: labels.lifestyle,
  };

  const openLightbox = (indexInFiltered: number) => {
    // Map filtered index → global items index for lightbox navigation
    const item = filtered[indexInFiltered];
    const globalIndex = items.findIndex((i) => i.id === item.id);
    setLightboxIndex(globalIndex);
  };

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-primary text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {categoryLabel[cat]}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{labels.noPhotos}</p>
      ) : (
        <div
          className="columns-2 md:columns-3 xl:columns-4 gap-3 space-y-3"
          style={{ columnFill: "balance" }}
        >
          <AnimatePresence>
            {filtered.filter((item) => !failedImages.has(item.id)).map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="break-inside-avoid mb-3"
              >
                <button
                  className="group relative w-full overflow-hidden rounded-2xl block focus:outline-none focus:ring-2 focus:ring-primary"
                  onClick={() => openLightbox(i)}
                  aria-label={labels.open}
                >
                  <Image
                    src={item.image_url}
                    alt={item.title || "Gallery photo"}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={() => handleImageError(item.id)}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    {item.title && (
                      <p className="text-white font-medium text-sm line-clamp-2">
                        {item.title}
                      </p>
                    )}
                  </div>
                  {/* Featured badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      ★
                    </div>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <GalleryLightbox
            items={items}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            labels={{ prev: labels.prev, next: labels.next, close: labels.close }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
