"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Centralized motion decision for the cinematic surf-magazine UI.
 *
 * Returns one of three policies that downstream components use to gate
 * animation behavior:
 *
 * - `"full"`     — run signature moments, parallax, scroll-pin, etc.
 * - `"reduced"`  — fade-only, no transforms, short durations
 * - `"static"`   — render final state without animating at all
 *
 * Inputs that drop the policy:
 *   - `prefers-reduced-motion: reduce`           → `static`
 *   - `navigator.connection.saveData === true`   → `static`
 *   - `effectiveType` is `slow-2g` or `2g`       → `reduced`
 *   - `effectiveType` is `3g`                    → `reduced`
 *
 * SSR-safe: starts at `"full"` on the server / first client render and
 * upgrades to the actual policy after mount. Components should treat
 * `policy` as a hint, not a hard barrier — final visual state must always
 * be reachable without the animation running.
 */
export type MotionPolicy = "full" | "reduced" | "static";

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
  mozConnection?: NetworkInformation;
}

function readConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.webkitConnection ?? nav.mozConnection;
}

export function useMotionPolicy(): MotionPolicy {
  const prefersReduced = useReducedMotion();
  const [policy, setPolicy] = useState<MotionPolicy>("full");

  useEffect(() => {
    if (prefersReduced) {
      setPolicy("static");
      return;
    }

    const conn = readConnection();
    if (!conn) {
      setPolicy("full");
      return;
    }

    if (conn.saveData) {
      setPolicy("static");
      return;
    }

    if (conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
      setPolicy("reduced");
      return;
    }

    if (conn.effectiveType === "3g") {
      setPolicy("reduced");
      return;
    }

    setPolicy("full");
  }, [prefersReduced]);

  return policy;
}

/** Convenience predicates for components that read the policy */
export const motionAllowsHeavy = (p: MotionPolicy): boolean => p === "full";
export const motionAllowsBasic = (p: MotionPolicy): boolean => p !== "static";
