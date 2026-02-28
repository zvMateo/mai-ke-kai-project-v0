"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Verificar scroll inicial por si ya se hizo scroll antes de recargar
    if (window.scrollY > 100) setIsVisible(true);

    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Número oficial de la Surf House
  const phoneNumber = "50686069355";
  // Mensaje predefinido
  const welcomeMessage = encodeURIComponent("¡Hola! Me gustaría recibir más información sobre Mai Ke Kai Surf House 🤙");

  // Si no está montado o no se ha hecho scroll, no renderizamos nada
  if (!isMounted || !isVisible) return null;

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${welcomeMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        // Posicionamiento: bottom-32 (128px) para saltar los 100px del widget de Tab
        "fixed bottom-32 left-6 z-[100000] pointer-events-auto cursor-pointer",
        "bg-green-500 hover:bg-green-600 text-white",
        "w-14 h-14 rounded-full flex items-center justify-center",
        "shadow-2xl hover:shadow-green-500/40",
        "transition-all duration-300 hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-4 focus:ring-green-500/50",
      )}
      aria-label="Contact us on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
      <span className="sr-only">Contact us on WhatsApp</span>
    </a>
  );
}
