import { requireAdmin } from "@/lib/auth";
import { ServicesClient } from "./services-client";
import {
  withQueryClient,
  prefetchServicesList,
} from "@/lib/queries/index.server";

export default async function ServicesPage() {
  await requireAdmin();

  return withQueryClient({
    prefetch: (queryClient) => prefetchServicesList(queryClient),
    children: <ServicesClient />,
  });
}
