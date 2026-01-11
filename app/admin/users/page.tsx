import { requireAdmin } from "@/lib/auth";
import { withQueryClient, prefetchUsersList } from "@/lib/queries/index.server";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  await requireAdmin();

  return withQueryClient({
    prefetch: (queryClient) => prefetchUsersList(queryClient),
    children: <UsersClient />,
  });
}
