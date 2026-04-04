"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Faq {
  q: string;
  a: string;
}

export function PackagesFaqClient({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-border rounded-xl overflow-hidden"
        >
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-medium text-foreground pr-4">{faq.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
