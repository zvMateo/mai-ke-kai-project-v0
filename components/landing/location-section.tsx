import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Plane } from "lucide-react";
import { GoogleMapEmbed } from "@/components/ui/google-map-embed";
import { getTranslations } from "next-intl/server";

export async function LocationSection() {
  const t = await getTranslations("location");
  const tFooter = await getTranslations("footer");

  return (
    <section id="location" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            {t("subtitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Google Maps Embed */}
          <div className="relative h-[280px] sm:h-[350px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
            <GoogleMapEmbed />
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Address */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("address")}
                </h3>
                <p className="text-muted-foreground">
                  Playa Tamarindo, Guanacaste
                  <br />
                  Costa Rica, 50309
                </p>
              </div>
            </div>

            {/* Getting Here */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("gettingHere")}
                </h3>
                <p className="text-muted-foreground">
                  {t("fromLiberia")}
                  <br />
                  {t("fromSanJose")}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("contact")}
                </h3>
                <p className="text-muted-foreground">
                  +506 8606 9355
                  <br />
                  maikekaisurfhouse@gmail.com
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {t("receptionHours")}
                </h3>
                <p className="text-muted-foreground">
                  {t("daily")}: 7:30 AM - 10:30 PM
                  <br />
                  {t("checkInTime")} | {t("checkOutTime")}
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button size="lg" className="w-full sm:w-auto">
                  {t("bookYourStay")}
                </Button>
              </Link>
              <a href="mailto:maikekaisurfhouse@gmail.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {tFooter("contactUs")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}