import { requireAdmin } from "@/lib/auth";
import { PackagesClient } from "./packages-client";
import {
  withQueryClient,
  prefetchPackagesList,
} from "@/lib/queries/index.server";

export default async function PackagesPage() {
  await requireAdmin();

  return withQueryClient({
    prefetch: (queryClient) => prefetchPackagesList(queryClient),
    children: <PackagesClient />,
  });
}
