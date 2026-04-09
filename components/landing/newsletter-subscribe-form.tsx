"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface NewsletterSubscribeFormProps {
  placeholder: string;
  buttonLabel: string;
  consentLabel: string;
  consentHelp: string;
  source?: string;
}

function getCountryCodeFromLocale(locale: string): string | null {
  const normalized = locale.replace("_", "-");
  const parts = normalized.split("-");
  const possibleRegion = parts[1]?.toUpperCase();
  return possibleRegion && /^[A-Z]{2}$/.test(possibleRegion)
    ? possibleRegion
    : null;
}

function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation API is not available"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 7000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export function NewsletterSubscribeForm({
  placeholder,
  buttonLabel,
  consentLabel,
  consentHelp,
  source = "landing-footer",
}: NewsletterSubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [locationConsent, setLocationConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const locale = navigator.language || "en";
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const countryCode = getCountryCodeFromLocale(locale);

      let geoLat: number | undefined;
      let geoLng: number | undefined;
      let geoAccuracyMeters: number | undefined;

      if (locationConsent) {
        try {
          const position = await requestCurrentPosition();
          geoLat = position.coords.latitude;
          geoLng = position.coords.longitude;
          geoAccuracyMeters = position.coords.accuracy;
        } catch {
          toast.info(
            "Location permission was skipped. You are still subscribed.",
          );
        }
      }

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          locale,
          timezone,
          countryCode,
          locationConsent,
          geoLat,
          geoLng,
          geoAccuracyMeters,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to subscribe");
      }

      toast.success("Thanks for subscribing");
      setEmail("");
      setLocationConsent(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to subscribe right now",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        required
        disabled={isSubmitting}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
      />

      <div className="rounded-md border border-white/15 bg-white/5 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <Checkbox
            id="newsletter-location-consent"
            checked={locationConsent}
            onCheckedChange={(checked) => setLocationConsent(checked === true)}
            className="mt-0.5 border-white/40 data-[state=checked]:bg-primary data-[state=checked]:text-white"
          />
          <label
            htmlFor="newsletter-location-consent"
            className="text-xs text-white/90 leading-5 cursor-pointer"
          >
            {consentLabel}
          </label>
        </div>
        <p className="text-[11px] leading-4 text-white/60">{consentHelp}</p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "..." : buttonLabel}
      </Button>
    </form>
  );
}
