import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withQueryClient, prefetchUserLoyalty } from "@/lib/queries/index.server";
import { LoyaltyClient } from "./loyalty-client";

export default async function LoyaltyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return withQueryClient({
    prefetch: (queryClient) => prefetchUserLoyalty(queryClient, user.id),
    children: <LoyaltyClient userId={user.id} />,
  });
}
