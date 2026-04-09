import "server-only";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminDbClient } from "@/lib/supabase/admin";

const optionalNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return value;
}, z.number().optional());

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  fullName: z.string().trim().max(120).optional(),
  locale: z.string().trim().max(12).optional(),
  source: z.string().trim().max(120).optional(),
  locationConsent: z.boolean().optional(),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  timezone: z.string().trim().max(80).optional(),
  geoLat: optionalNumber,
  geoLng: optionalNumber,
  geoAccuracyMeters: optionalNumber,
});

export const campaignSchema = z.object({
  title: z.string().trim().min(3).max(120),
  subject: z.string().trim().min(3).max(140),
  previewText: z.string().trim().max(200).optional(),
  contentHtml: z.string().trim().min(20),
  templateType: z
    .enum(["promo", "news", "cta", "surf_camp", "accommodation", "informative"])
    .default("informative"),
  audienceCountry: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/)
    .optional(),
  sendNow: z.boolean().default(false),
});

export interface NewsletterSubscriber {
  id: string;
  email: string;
  full_name: string | null;
  locale: string | null;
  country_code: string | null;
  timezone: string | null;
  location_consent: boolean;
  geo_lat: number | null;
  geo_lng: number | null;
  geo_accuracy_meters: number | null;
  geo_captured_at: string | null;
  status: "subscribed" | "unsubscribed";
  unsubscribe_token: string;
  created_at: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  preview_text: string | null;
  content_html: string;
  template_type:
    | "promo"
    | "news"
    | "cta"
    | "surf_camp"
    | "accommodation"
    | "informative";
  audience_country_code: string | null;
  status: "draft" | "sent";
  recipients_count: number;
  successful_sends: number;
  failed_sends: number;
  sent_at: string | null;
  created_at: string;
}

export async function requireAdminRequest() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isAdmin: false as const, userId: null };
  }

  const { data: roleData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    isAdmin: roleData?.role === "admin",
    userId: user.id,
  } as const;
}

export function buildNewsletterEmailHtml(params: {
  title: string;
  previewText?: string;
  contentHtml: string;
  unsubscribeUrl: string;
}): string {
  const preview = params.previewText?.trim()
    ? `<p style="margin:0 0 16px;color:#5b8a9a;">${params.previewText.trim()}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:white;border-radius:12px;padding:28px;border:1px solid #e5e7eb;">
      <h1 style="margin:0 0 12px;color:#0e3244;font-size:26px;line-height:1.2;">${params.title}</h1>
      ${preview}
      <div style="color:#1f2937;font-size:15px;line-height:1.6;">${params.contentHtml}</div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />
      <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">
        You received this because you subscribed to Mai Ke Kai updates.<br />
        <a href="${params.unsubscribeUrl}" style="color:#0e7490;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function splitInChunks<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function upsertSubscriber(input: z.infer<typeof subscribeSchema>) {
  const supabaseAdmin = createAdminDbClient();
  const hasGeoData =
    typeof input.geoLat === "number" && typeof input.geoLng === "number";

  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      {
        email: input.email,
        full_name: input.fullName || null,
        locale: input.locale || null,
        country_code: input.countryCode || null,
        timezone: input.timezone || null,
        location_consent: Boolean(input.locationConsent),
        geo_lat: hasGeoData ? input.geoLat : null,
        geo_lng: hasGeoData ? input.geoLng : null,
        geo_accuracy_meters:
          hasGeoData && typeof input.geoAccuracyMeters === "number"
            ? input.geoAccuracyMeters
            : null,
        geo_captured_at: hasGeoData ? new Date().toISOString() : null,
        source: input.source || "website-footer",
        status: "subscribed",
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    )
    .select("id, email, status")
    .single();

  if (error) {
    return { success: false as const, message: error.message };
  }

  return { success: true as const, data };
}

export async function unsubscribeByToken(token: string) {
  const supabaseAdmin = createAdminDbClient();

  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("unsubscribe_token", token)
    .eq("status", "subscribed")
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false as const, message: error.message };
  }

  if (!data) {
    return {
      success: false as const,
      message: "Subscription not found or already unsubscribed",
    };
  }

  return { success: true as const };
}
