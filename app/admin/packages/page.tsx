import { PackagesClient } from "./packages-client";
import { withQueryClient, prefetchPackagesList } from "@/lib/queries/index.server";

export default async function PackagesPage() {
  return withQueryClient({
    prefetch: (queryClient) => prefetchPackagesList(queryClient),
    children: <PackagesClient />,
  });
}
