"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/components/user-menu";
import { UserInitializer } from "@/components/user-initializer";
import { useUserStore } from "@/lib/stores/user-store";
import { TAB_TRAVEL_CHECKOUT_URL } from "@/lib/booking-utils";

// Dynamically import LanguageSwitcher to avoid hydration issues
const LanguageSwitcher = dynamic(
  () =>
    import("@/components/language-switcher").then((mod) => ({
      default: mod.LanguageSwitcher,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium h-9 px-3 rounded-md gap-2">
        <div className="h-4 w-4 bg-muted rounded" />
        <span className="hidden sm:inline h-4 w-12 bg-muted rounded" />
      </div>
    ),
  },
);

interface HeaderProps {
  locale?: string;
}

export function Header({ locale = "en" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");

  const { isAuthenticated } = useUserStore();

  const navLinks = [
    { href: "#rooms", label: t("rooms") },
    { href: "#surf", label: t("surf") },
    { href: "#packages", label: t("packages") },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: t("about") },
  ];

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <UserInitializer />
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isClient && isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
              alt="Mai Ke Kai"
              width={48}
              height={48}
              className={cn(
                "w-12 h-12 transition-all",
                !isScrolled && "brightness-0 invert",
              )}
            />
            <div className="flex flex-col">
              <span
                className={cn(
                  "font-heading font-bold text-xl leading-tight transition-colors",
                  isClient && isScrolled ? "text-primary" : "text-white",
                )}
              >
                Mai Ke Kai
              </span>
              <span
                className={cn(
                  "text-xs font-medium uppercase tracking-wider leading-tight transition-colors",
                  isClient && isScrolled
                    ? "text-muted-foreground"
                    : "text-white/70",
                )}
              >
                Surf House
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isClient && isScrolled
                    ? "text-foreground/80"
                    : "text-white/90 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} />
            {isAuthenticated && isClient ? (
              <UserMenu isScrolled={isScrolled} />
            ) : null}
            {isClient && !isAuthenticated && (
              <Link href="/auth/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    !isScrolled &&
                      "text-white hover:text-white hover:bg-white/10",
                  )}
                >
                  {t("login")}
                </Button>
              </Link>
            )}
            {/* Book Now CTA — always visible, uses <a> so widget.js intercepts the click */}
            {isClient && (
              <Button
                asChild
                size="sm"
                className={cn(
                  "hidden sm:inline-flex font-semibold transition-all duration-300",
                  isScrolled
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-white text-primary hover:bg-white/90",
                )}
              >
                <a href={TAB_TRAVEL_CHECKOUT_URL}>
                  {t("bookNow")}
                </a>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    isClient &&
                      !isScrolled &&
                      "text-white hover:text-white hover:bg-white/10",
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-70 sm:w-80 bg-background"
              >
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="border-border" />
                  {isAuthenticated ? (
                    <div className="flex items-center justify-center">
                      <UserMenu />
                    </div>
                  ) : (
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        {t("login")}
                      </Button>
                    </Link>
                  )}
                  <Button asChild className="w-full">
                    <a
                      href={TAB_TRAVEL_CHECKOUT_URL}
                      onClick={() => setIsOpen(false)}
                    >
                      {t("bookNow")}
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

// Export as LandingHeader for dynamic import compatibility
export { Header as LandingHeader };
