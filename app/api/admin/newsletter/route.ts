import { NextResponse } from "next/server";
import { createAdminDbClient } from "@/lib/supabase/admin";
import {
  buildNewsletterEmailHtml,
  campaignSchema,
  requireAdminRequest,
  splitInChunks,
} from "@/lib/newsletter";
import { sendNewsletterBatch } from "@/lib/newsletter-email";

export async function GET() {
  const auth = await requireAdminRequest();
  if (!auth.isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const supabaseAdmin = createAdminDbClient();

  const subscriberQuery = await supabaseAdmin
    .from("newsletter_subscribers")
    .select(
      "id, email, full_name, locale, country_code, timezone, location_consent, status, subscribed_at, unsubscribed_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const subscribers = subscriberQuery.error
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

  const campaignQuery = await supabaseAdmin
    .from("newsletter_campaigns")
    .select(
      "id, title, subject, template_type, audience_country_code, status, recipients_count, successful_sends, failed_sends, sent_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(30);

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

  if (subscriberQuery.error && !subscribers.length) {
    return NextResponse.json(
      {
        message:
          subscriberQuery.error?.message || "Failed to load newsletter data",
      },
      { status: 500 },
    );
  }

  if (campaignQuery.error && !campaigns.length) {
    return NextResponse.json(
      {
        message:
          campaignQuery.error?.message || "Failed to load newsletter data",
      },
      { status: 500 },
    );
  }

  const subscribedCount =
    subscribers?.filter((s) => s.status === "subscribed").length || 0;

  return NextResponse.json({
    subscribers: subscribers || [],
    campaigns: campaigns || [],
    stats: {
      totalSubscribers: subscribers?.length || 0,
      activeSubscribers: subscribedCount,
      unsubscribed: (subscribers?.length || 0) - subscribedCount,
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminRequest();
  if (!auth.isAdmin || !auth.userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const parsed = campaignSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid campaign payload" },
        { status: 400 },
      );
    }

    const {
      title,
      subject,
      previewText,
      contentHtml,
      templateType,
      audienceCountry,
      sendNow,
    } = parsed.data;
    const supabaseAdmin = createAdminDbClient();

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("newsletter_campaigns")
      .insert({
        title,
        subject,
        preview_text: previewText || null,
        content_html: contentHtml,
        template_type: templateType,
        audience_country_code: audienceCountry || null,
        status: "draft",
        created_by: auth.userId,
      })
      .select("id")
      .single();

    if (campaignError || !campaign?.id) {
      return NextResponse.json(
        { message: campaignError?.message || "Could not create campaign" },
        { status: 500 },
      );
    }

    if (!sendNow) {
      return NextResponse.json({
        message: "Campaign saved as draft",
        campaignId: campaign.id,
      });
    }

    let subscribersQuery = supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, unsubscribe_token")
      .eq("status", "subscribed");

    if (audienceCountry) {
      subscribersQuery = subscribersQuery.eq("country_code", audienceCountry);
    }

    const { data: subscribers, error: subscribersError } =
      await subscribersQuery;

    if (subscribersError) {
      return NextResponse.json(
        { message: subscribersError.message },
        { status: 500 },
      );
    }

    if (!subscribers?.length) {
      return NextResponse.json(
        { message: "There are no active subscribers" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";
    const batches = splitInChunks(subscribers, 100);

    let successfulSends = 0;
    let failedSends = 0;

    for (const batch of batches) {
      const payloadBatch = batch.map((subscriber) => ({
        to: subscriber.email,
        subject,
        html: buildNewsletterEmailHtml({
          title,
          previewText,
          contentHtml,
          unsubscribeUrl: `${baseUrl}/api/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`,
        }),
      }));

      const response = await sendNewsletterBatch(payloadBatch);
      if (!response.success) {
        failedSends += batch.length;
        continue;
      }

      const ids = Array.isArray(response.data?.data) ? response.data.data : [];
      const errors = Array.isArray(response.data?.errors)
        ? response.data.errors
        : [];

      if (!ids.length && !errors.length) {
        successfulSends += batch.length;
      } else {
        successfulSends += ids.length;
        failedSends += errors.length;
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        recipients_count: subscribers.length,
        successful_sends: successfulSends,
        failed_sends: failedSends,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign.id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Campaign sent",
      campaignId: campaign.id,
      stats: {
        recipients: subscribers.length,
        successfulSends,
        failedSends,
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to create or send campaign" },
      { status: 500 },
    );
  }
}
