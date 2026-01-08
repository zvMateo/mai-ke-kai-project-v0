"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { UserMenu } from "@/components/user-menu";
import { UserInitializer } from "@/components/user-initializer";
import { useUserStore } from "@/lib/stores/user-store";

interface HeaderProps {
  locale?: string;
}

export function Header({ locale = "en" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { isAuthenticated } = useUserStore();

  const navLinks = [
    { href: "#rooms", label: t("rooms") },
    { href: "#surf", label: t("surf") },
    { href: "#testimonials", label: "Reviews" },
    { href: "#location", label: t("location") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <UserInitializer />
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent"
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
              !isScrolled && "brightness-0 invert"
            )}
          />
          <div className="flex flex-col">
            <span
              className={cn(
                "font-heading font-bold text-xl leading-tight transition-colors",
                isScrolled ? "text-primary" : "text-white"
              )}
            >
              Mai Ke Kai
            </span>
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider leading-tight transition-colors",
                isScrolled ? "text-muted-foreground" : "text-white/70"
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
                isScrolled
                  ? "text-foreground/80"
                  : "text-white/90 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          {isAuthenticated ? (
            <UserMenu isScrolled={isScrolled} />
          ) : (
            <Link href="/auth/login" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  !isScrolled && "text-white hover:text-white hover:bg-white/10"
                )}
              >
                {t("login")}
              </Button>
            </Link>
          )}
          <Link href="/booking">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white shadow-lg"
            >
              {tCommon("bookNow")}
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  !isScrolled && "text-white hover:text-white hover:bg-white/10"
                )}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background">
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
                    <Button variant="outline" className="w-full bg-transparent">
                      {t("login")}
                    </Button>
                  </Link>
                )}
                <Link href="/booking" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">{tCommon("bookNow")}</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
    </>
  );
}

export { Header as LandingHeader };
