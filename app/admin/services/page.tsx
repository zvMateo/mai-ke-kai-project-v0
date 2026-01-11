import { ServicesClient } from "./services-client";
import { withQueryClient, prefetchServicesList } from "@/lib/queries/index.server";

export default async function ServicesPage() {
  return withQueryClient({
    prefetch: (queryClient) => prefetchServicesList(queryClient),
    children: <ServicesClient />,
  });
}
