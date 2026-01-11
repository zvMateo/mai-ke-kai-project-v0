import { withQueryClient, prefetchAdminDashboard } from "@/lib/queries/index.server";
import { AdminDashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  return withQueryClient({
    prefetch: (queryClient) => prefetchAdminDashboard(queryClient),
    children: <AdminDashboardClient />,
  });
}
