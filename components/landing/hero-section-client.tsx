"use client";

import Link from "next/link";
import Image from "next/image";
import { HeroBookNowButton } from "@/components/landing/hero-book-now-button";
import { Button } from "@/components/ui/button";
import { Star, Globe, Waves, ChevronDown } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState, type ReactNode } from "react";

/* ──────────────────────────────────────────────
   Animated counter
────────────────────────────────────────────── */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Stagger wrapper
────────────────────────────────────────────── */
function Stagger({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Stat pill
────────────────────────────────────────────── */
function StatPill({
  icon,
  value,
  suffix,
  label,
}: {
  icon: ReactNode;
  value: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 border border-white/10 hover:bg-white/15 transition-colors">
      {icon}
      <span className="text-white/90 text-sm font-medium">
        <AnimatedCounter target={value} suffix={suffix} /> {label}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Hero Section (client component for animations)
────────────────────────────────────────────── */
export function HeroSectionClient({
  bookLabel,
  exploreLabel,
  reviewsLabel,
  nationalitiesLabel,
  surfCampsLabel,
  scrollLabel,
}: {
  bookLabel: string;
  exploreLabel: string;
  reviewsLabel: string;
  nationalitiesLabel: string;
  surfCampsLabel: string;
  scrollLabel: string;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Background: poster image + video overlay ── */}
      <div className="absolute inset-0">
        {/* Poster image (visible immediately, acts as fallback) */}
        <Image
          src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
          alt="Costa Rica surf beach"
          fill
          className="object-cover"
          priority
          quality={90}
        />

        {/* Video background — loaded after poster */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000"
          poster="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
          ref={(el) => {
            if (el) {
              el.addEventListener("canplay", () => {
                el.style.opacity = "1";
              });
            }
          }}
        >
          {/* Cloudinary-optimized WebM (free tier) */}
          <source
            src="https://res.cloudinary.com/mai-ke-kai/video/upload/q_auto:eco,f_auto,w_1920,c_fill/mai-ke-kai/hero-surf.mp4"
            type="video/webm"
          />
          <source
            src="https://res.cloudinary.com/mai-ke-kai/video/upload/q_auto:eco,f_mp4,w_1920,c_fill/mai-ke-kai/hero-surf.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.65) 100%)",
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Heading — clip reveal animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-balance leading-tight"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            >
              YOUR SURF HOUSE IN
              <br />
              <span className="text-seafoam">TAMARINDO COSTA RICA</span>
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <Stagger delay={0.6}>
            <p className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-8 px-2 text-pretty leading-relaxed">
              Surf hotel with world-class waves, expert lessons, and authentic
              pura vida vibes
            </p>
          </Stagger>

          {/* Social proof — animated counters */}
          <Stagger delay={0.9}>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mb-10">
              <StatPill
                icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                value={213}
                label={reviewsLabel}
              />
              <StatPill
                icon={<Globe className="w-4 h-4 text-seafoam" />}
                value={30}
                suffix="+"
                label={nationalitiesLabel}
              />
              <StatPill
                icon={<Waves className="w-4 h-4 text-seafoam" />}
                value={500}
                suffix="+"
                label={surfCampsLabel}
              />
            </div>
          </Stagger>

          {/* CTAs */}
          <Stagger delay={1.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <HeroBookNowButton
                label={bookLabel}
                className="group relative overflow-hidden"
              />
              <Link href="#packages">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/60 text-white hover:bg-white/10 bg-transparent hover:text-white px-8 py-6 rounded-full text-base font-semibold transition-all duration-300 hover:scale-105"
                >
                  {exploreLabel}
                </Button>
              </Link>
            </div>
          </Stagger>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        onClick={() => {
          document
            .querySelector("#rooms")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="text-xs tracking-wider uppercase">{scrollLabel}</span>
        <motion.div
          className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-3 h-3 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
