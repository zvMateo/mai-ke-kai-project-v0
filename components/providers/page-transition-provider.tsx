"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

/**
 * Applies a subtle fade-in transition on page navigation.
 * Uses CSS opacity instead of a motion.div wrapper to avoid
 * shifting the component tree (which would cause Radix UI
 * aria-controls hydration mismatches).
 */
export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    // Brief fade-out → fade-in on navigation
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease",
      }}
    >
      {children}
    </div>
  );
}
