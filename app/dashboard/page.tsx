import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withQueryClient, prefetchUserDashboard } from "@/lib/queries/index.server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return withQueryClient({
    prefetch: (queryClient) => prefetchUserDashboard(queryClient, user.id),
    children: (
      <DashboardClient userId={user.id} userEmail={user.email ?? null} />
    ),
  });
}
