"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 100px
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phoneNumber = "+50686069355"; // Update with actual number

  if (!isVisible) return null;

  return (
    <a
      href={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "bg-green-500 hover:bg-green-600 text-white",
        "w-14 h-14 rounded-full",
        "flex items-center justify-center",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:scale-110",
        "focus:outline-none focus:ring-4 focus:ring-green-500/50",
      )}
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
      <span className="sr-only">Contact us on WhatsApp</span>
    </a>
  );
}
