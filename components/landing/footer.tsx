import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { NewsletterSubscribeForm } from "@/components/landing/newsletter-subscribe-form";

const socialLinks = [
  {
    icon: Instagram,
    href: "https://www.instagram.com/maikekaisurf/",
    label: "Instagram",
  },
  {
    icon: Facebook,
    href: "https://www.facebook.com/maikekaisurf",
    label: "Facebook",
  },
  {
    icon: Youtube,
    href: "https://www.youtube.com/@maikekaisurf",
    label: "YouTube",
  },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");

  const footerLinks = {
    explore: [
      { label: tNav("rooms"), href: "/#rooms" },
      { label: tNav("packages"), href: "/#packages" },
      { label: tNav("surf"), href: "/#surf" },
      { label: "Blog", href: "/blog" },
    ],
    info: [
      { label: tNav("about"), href: "/about" },
      { label: tNav("location"), href: "/#location" },
      { label: tNav("contact"), href: "/#location" },
    ],
  };

  return (
    <footer className="bg-deep text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image
                src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                alt="Mai Ke Kai"
                width={48}
                height={48}
                className="w-12 h-12 brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl leading-tight">
                  Mai Ke Kai
                </span>
                <span className="text-xs text-white/60 uppercase tracking-wider">
                  {t("surfHouse")}
                </span>
              </div>
            </Link>
            <p className="text-white/70 mb-6 max-w-sm">{t("description")}</p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t("information")}
            </h4>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t("newsletter")}
            </h4>
            <p className="text-white/70 text-sm mb-4">{t("newsletterText")}</p>
            <NewsletterSubscribeForm
              placeholder={t("newsletterPlaceholder")}
              buttonLabel={t("subscribe")}
              consentLabel={t("newsletterLocationConsent")}
              consentHelp={t("newsletterLocationHelp")}
            />
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold mb-4">
              {t("contactUs")}
            </h4>
            <ul className="space-y-3 text-white/70 text-sm">
              <li>Playa Tamarindo, Guanacaste</li>
              <li>Costa Rica, 50309</li>
              <li>
                <a
                  href="tel:+50686069355"
                  className="hover:text-white transition-colors"
                >
                  +506 8606 9355
                </a>
              </li>
              <li>
                <a
                  href="mailto:maikekaisurfhouse@gmail.com"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  maikekaisurfhouse@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 sm:gap-6 text-xs sm:text-sm">
            <span className="text-white/50">{t("privacy")}</span>
            <span className="text-white/50">{t("terms")}</span>
            <span className="text-white/50">{t("cancellation")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
