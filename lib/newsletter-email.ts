import "server-only";

import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL =
  process.env.EMAIL_FROM || "Mai Ke Kai <noreply@maikekaihouse.com>";

export interface NewsletterEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendNewsletterBatch(emails: NewsletterEmailPayload[]) {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false as const,
      message: "RESEND_API_KEY is not configured",
    };
  }

  const { data, error } = await resend.batch.send(
    emails.map((email) => ({
      from: FROM_EMAIL,
      to: email.to,
      subject: email.subject,
      html: email.html,
    })),
    { batchValidation: "permissive" },
  );

  if (error) {
    return { success: false as const, message: error.message };
  }

  return { success: true as const, data };
}
