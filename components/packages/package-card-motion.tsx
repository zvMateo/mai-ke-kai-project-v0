"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PackageCardMotionProps {
  children: ReactNode;
  className?: string;
}

export function PackageCardMotion({ children, className }: PackageCardMotionProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
