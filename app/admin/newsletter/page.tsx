import { requireAdmin } from "@/lib/auth";
import { createAdminDbClient } from "@/lib/supabase/admin";
import { getHotelSettings } from "@/lib/actions/settings";
import { NewsletterClient } from "./newsletter-client";

export default async function NewsletterPage() {
  await requireAdmin();

  const supabaseAdmin = createAdminDbClient();

  const [subscriberQuery, campaignQuery, hotelSettings] = await Promise.all([
    supabaseAdmin
      .from("newsletter_subscribers")
      .select(
        "id, email, full_name, locale, country_code, timezone, location_consent, status, subscribed_at, unsubscribed_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("newsletter_campaigns")
      .select(
        "id, title, subject, template_type, audience_country_code, status, recipients_count, successful_sends, failed_sends, sent_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(30),
    getHotelSettings(),
  ]);

  const allSubscribers = subscriberQuery.error
    ? (
        await supabaseAdmin
          .from("newsletter_subscribers")
          .select(
            "id, email, full_name, locale, status, subscribed_at, unsubscribed_at",
          )
          .order("created_at", { ascending: false })
          .limit(200)
      ).data?.map((item) => ({
        ...item,
        country_code: null,
        timezone: null,
        location_consent: false,
      })) || []
    : subscriberQuery.data || [];

  const campaigns = campaignQuery.error
    ? (
        await supabaseAdmin
          .from("newsletter_campaigns")
          .select(
            "id, title, subject, status, recipients_count, successful_sends, failed_sends, sent_at, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(30)
      ).data?.map((item) => ({
        ...item,
        template_type: "informative",
        audience_country_code: null,
      })) || []
    : campaignQuery.data || [];

  const activeSubscribers = allSubscribers.filter(
    (item) => item.status === "subscribed",
  ).length;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://maikekaihouse.com";

  return (
    <NewsletterClient
      initialSubscribers={allSubscribers}
      initialCampaigns={campaigns}
      brandDefaults={{
        brandName: hotelSettings.hotel_name || "Mai Ke Kai Surf House",
        logoUrl: `${baseUrl}/images/mai-20ke-20kai-20-20isotipo-20-20original.png`,
        primaryColor: "#0e7490",
        accentColor: "#0f766e",
        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      }}
      stats={{
        totalSubscribers: allSubscribers.length,
        activeSubscribers,
        unsubscribed: allSubscribers.length - activeSubscribers,
      }}
    />
  );
}
