import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Youtube, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tSurf = await getTranslations("surf");

  const footerLinks = {
    explore: [
      { label: tNav("rooms"), href: "/rooms" },
      { label: tSurf("lessons"), href: "/surf" },
      { label: tSurf("tours"), href: "/tours" },
      { label: t("gallery"), href: "/gallery" },
    ],
    info: [
      { label: tNav("about"), href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
      { label: tNav("contact"), href: "/contact" },
    ],
    legal: [
      { label: t("privacy"), href: "/privacy" },
      { label: t("terms"), href: "/terms" },
      { label: t("cancellation"), href: "/cancellation" },
    ],
  };
  return (
    <footer className="bg-deep text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
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
                <li key={link.href}>
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
                <li key={link.href}>
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
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="w-full sm:flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center"
              >
                <Mail className="w-5 h-5" />
              </button>
            </form>
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
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
