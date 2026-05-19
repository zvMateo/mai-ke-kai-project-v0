"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { HeroBookNowButton } from "@/components/landing/hero-book-now-button";
import { useMotionPolicy } from "@/hooks/use-motion-policy";

interface HeroSectionClientProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  trustLine: string;
  scrollHint: string;
}

/**
 * Hero — Cinematic Surf Magazine.
 *
 * Signature moment #1: "Wave Reveal" — the headline rises out of a clipped
 * baseline on mount, easing-wave for 900ms, while subhead/CTAs fade up on
 * a staggered delay. Uses Framer Motion only; gated by `useMotionPolicy()`
 * so reduced-motion / save-data users get the static final state.
 *
 * Background is a poster JPG with a slow translateY drift; a Cloudinary
 * eco-encoded video crossfades in once `canplay` fires (skipped on
 * `static` policy and on `<480px` to spare battery / data).
 */
export function HeroSectionClient({
  eyebrow,
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  trustLine,
  scrollHint,
}: HeroSectionClientProps) {
  const policy = useMotionPolicy();
  const sectionRef = useRef<HTMLElement>(null);

  // Subtle parallax on poster (desktop only) — mobile keeps it still.
  const { scrollY } = useScroll();
  const posterY = useTransform(scrollY, [0, 600], [0, 80]);

  // Animation gating
  const animate = policy !== "static";
  const allowsHeavy = policy === "full";

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[100svh] max-h-[900px] items-center overflow-hidden bg-deep text-white"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Poster — parallax on desktop, static on mobile */}
        <motion.div
          className="absolute inset-0 hidden md:block"
          style={allowsHeavy ? { y: posterY } : undefined}
        >
          <Image
            src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
            alt=""
            fill
            priority
            quality={88}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 md:hidden">
          <Image
            src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
            alt=""
            fill
            priority
            quality={80}
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Cloudinary eco video — only on `full` policy and md+ viewports */}
        {allowsHeavy && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
            className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-[var(--dur-cinematic)] md:block"
            ref={(el) => {
              if (!el) return;
              el.addEventListener("canplay", () => {
                el.style.opacity = "1";
              });
            }}
          >
            <source
              src="https://res.cloudinary.com/mai-ke-kai/video/upload/q_auto:eco,f_auto,w_1920,c_fill/mai-ke-kai/hero-surf.mp4"
              type="video/mp4"
            />
          </video>
        )}

        {/* Atmospheric gradient — keeps headline contrast above 4.5:1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.20 0.06 230 / 0.55) 0%, oklch(0.20 0.06 230 / 0.20) 38%, oklch(0.20 0.06 230 / 0.78) 100%)",
          }}
        />

        {/* Noise texture — adds film grain for editorial feel */}
        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-overlay opacity-60"
          style={{ backgroundImage: "var(--noise-bg)", backgroundSize: "200px 200px" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative mx-auto w-full max-w-7xl px-[var(--space-gutter)] pt-32 pb-24 sm:pt-36 sm:pb-28">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <FadeUp delay={0.05} animate={animate}>
            <p className="mb-7 inline-flex items-center gap-3 text-[var(--font-eyebrow)] uppercase tracking-[0.28em] text-white/75">
              <span className="h-px w-8 bg-white/40" aria-hidden="true" />
              {eyebrow}
            </p>
          </FadeUp>

          {/* Headline — Wave Reveal */}
          <h1
            className="font-[family-name:var(--font-display)] font-semibold tracking-[-0.02em] leading-[0.98] text-balance"
            style={{ fontSize: "var(--font-display-xl)" }}
          >
            <ClipReveal animate={animate}>{headline}</ClipReveal>
          </h1>

          {/* Subhead */}
          <FadeUp delay={0.55} animate={animate}>
            <p
              className="mt-8 max-w-xl text-white/85 text-balance"
              style={{ fontSize: "var(--font-body-lg)", lineHeight: 1.55 }}
            >
              {subheadline}
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.7} animate={animate}>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <HeroBookNowButton label={ctaPrimary} />
              <Link
                href="#packages"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/[0.04] px-7 py-4 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-[var(--dur-base)] ease-[var(--ease-wave)] hover:border-white/70 hover:bg-white/10 hover:text-white"
                aria-label={ctaSecondary}
              >
                {ctaSecondary}
                <span aria-hidden="true" className="text-base">→</span>
              </Link>
            </div>
          </FadeUp>

          {/* Trust line */}
          <FadeUp delay={0.9} animate={animate}>
            <p className="mt-10 text-sm text-white/65 tracking-wide">
              {trustLine}
            </p>
          </FadeUp>
        </div>
      </div>

      {/* ── Scroll hint ── */}
      <ScrollHint label={scrollHint} animate={animate} />
    </section>
  );
}

/* ──────────────────────────────────────────────
   Building blocks
────────────────────────────────────────────── */

interface FadeUpProps {
  children: React.ReactNode;
  delay: number;
  animate: boolean;
}

function FadeUp({ children, delay, animate }: FadeUpProps) {
  if (!animate) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

interface ClipRevealProps {
  children: string;
  animate: boolean;
}

/**
 * Wave Reveal — the headline lifts out of a clipped baseline.
 * Each whitespace-separated word is wrapped in an overflow-clip span
 * with an inner translate from y=105% to y=0, staggered by 80ms per
 * word so multi-word headlines feel deliberate, not jumpy.
 */
function ClipReveal({ children, animate }: ClipRevealProps) {
  const words = children.split(" ");

  if (!animate) {
    return <span>{children}</span>;
  }

  return (
    <span className="block">
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="relative mr-[0.18em] inline-block overflow-hidden align-baseline"
          style={{ paddingBottom: "0.05em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "105%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15 + i * 0.08,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

interface ScrollHintProps {
  label: string;
  animate: boolean;
}

function ScrollHint({ label, animate }: ScrollHintProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 1400);
    return () => window.clearTimeout(id);
  }, []);

  const handleClick = () => {
    document
      .querySelector("#packages")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/55 transition-opacity duration-[var(--dur-cinematic)] hover:text-white/85 ${
        show && animate ? "opacity-100" : show ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="text-[var(--font-eyebrow)] uppercase tracking-[0.28em]">
        {label}
      </span>
      {animate ? (
        <motion.span
          className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 pt-1.5"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3 w-3 text-white/55" />
        </motion.span>
      ) : (
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/30 pt-1.5">
          <ChevronDown className="h-3 w-3 text-white/55" />
        </span>
      )}
    </button>
  );
}

