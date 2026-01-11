import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { withQueryClient, prefetchUserBookings } from "@/lib/queries/index.server";
import { UserBookingsClient } from "./bookings-client";

export default async function UserBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return withQueryClient({
    prefetch: (queryClient) => prefetchUserBookings(queryClient, user.id),
    children: <UserBookingsClient userId={user.id} />,
  });
}
