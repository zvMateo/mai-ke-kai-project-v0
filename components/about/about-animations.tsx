"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/* ──────────────────────────────────────────────
   Animated counter — triggers once in viewport
────────────────────────────────────────────── */
export function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2.2,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

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
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Scroll-reveal wrapper — fades in + slides up
────────────────────────────────────────────── */
export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Stagger children — each child appears in sequence
────────────────────────────────────────────── */
export function StaggerChildren({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Timeline item — animates line & dot on scroll
────────────────────────────────────────────── */
export function TimelineItem({
  year,
  title,
  desc,
  isLast = false,
  index = 0,
}: {
  year: string;
  title: string;
  desc: string;
  isLast?: boolean;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="flex gap-6 md:gap-8"
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
    >
      {/* Left — year label */}
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-bold text-xs text-center leading-tight px-1">
            {year}
          </span>
        </div>
        {!isLast && (
          <motion.div
            className="w-0.5 bg-primary/20 flex-1 mt-2"
            initial={{ scaleY: 0, originY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
            style={{ minHeight: "3rem" }}
          />
        )}
      </div>

      {/* Right — content */}
      <div className="pb-10">
        <h4 className="font-heading font-bold text-lg text-foreground mb-1">
          {title}
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Meaning quote — large centered reveal
────────────────────────────────────────────── */
export function MeaningQuote({
  tagline,
  title,
  subtitle,
  text,
}: {
  tagline: string;
  title: string;
  subtitle: string;
  text: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="text-center max-w-2xl mx-auto px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="text-primary text-sm font-semibold uppercase tracking-widest block mb-4">
        {tagline}
      </span>
      <h2 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold text-foreground mb-2 leading-none">
        {title}
      </h2>
      <p className="text-primary font-medium text-lg mb-6">{subtitle}</p>
      {/* Decorative wave divider */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px w-16 bg-border" />
        <svg viewBox="0 0 40 12" className="w-10 h-3 text-primary" fill="currentColor">
          <path d="M0 6 Q5 0 10 6 Q15 12 20 6 Q25 0 30 6 Q35 12 40 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="h-px w-16 bg-border" />
      </div>
      <p className="text-muted-foreground text-lg leading-relaxed italic">{text}</p>
    </motion.div>
  );
}
