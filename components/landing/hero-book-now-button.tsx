"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";

interface HeroBookNowButtonProps {
  label: string;
}

/**
 * Opens the Tab.Travel widget panel.
 * The widget.js script intercepts clicks on any <a> whose href
 * contains checkout.tab.travel and opens the checkout modal instead
 * of navigating away. Falls back to normal navigation if widget
 * hasn't loaded.
 */
export function HeroBookNowButton({ label }: HeroBookNowButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className="bg-primary hover:bg-primary/90 text-white text-lg px-12 py-7 rounded-full shadow-2xl hover:scale-105 active:scale-100 transition-all duration-300 font-bold"
    >
      <a href={TAB_TRAVEL_CHECKOUT_URL}>
        {label}
        <ArrowRight className="ml-2 w-5 h-5" />
      </a>
    </Button>
  );
}
