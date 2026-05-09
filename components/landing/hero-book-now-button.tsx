"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";

interface HeroBookNowButtonProps {
  label: string;
  className?: string;
}

/**
 * Hero CTA — opens the Tab.Travel widget panel.
 *
 * Phase 1 visual update: coral fill (was ocean primary), large editorial
 * pill, slow shadow lift on hover. The widget.js script intercepts clicks
 * on any <a> whose href contains checkout.tab.travel and opens the
 * checkout modal instead of navigating away. Falls back to normal
 * navigation if the widget script hasn't loaded.
 */
export function HeroBookNowButton({ label, className }: HeroBookNowButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className={`group bg-coral text-white hover:bg-coral-deep px-9 py-7 rounded-full text-base font-semibold tracking-wide shadow-[var(--shadow-cinematic)] transition-all duration-[var(--dur-base)] ease-[var(--ease-wave)] hover:-translate-y-0.5 hover:shadow-[0_40px_100px_oklch(0.20_0.06_230/0.30)] active:translate-y-0 active:shadow-[var(--shadow-card)] ${className || ""}`}
    >
      <a href={TAB_TRAVEL_CHECKOUT_URL}>
        {label}
        <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-[var(--dur-base)] ease-[var(--ease-wave)] group-hover:translate-x-1" />
      </a>
    </Button>
  );
}
