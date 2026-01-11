import { addDays } from "date-fns";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { BookingFlow } from "@/components/booking/booking-flow";
import { withQueryClient, prefetchBookingFlow } from "@/lib/queries/index.server";

export const metadata = {
  title: "Book Your Stay",
  description:
    "Check availability and book your surf paradise at Mai Ke Kai Surf House.",
};

export default async function BookingPage() {
  const initialCheckIn = addDays(new Date(), 7);
  const initialCheckOut = addDays(new Date(), 10);

  return withQueryClient({
    prefetch: (queryClient) => prefetchBookingFlow(queryClient, initialCheckIn),
    children: (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <BookingFlow
            initialCheckInISO={initialCheckIn.toISOString()}
            initialCheckOutISO={initialCheckOut.toISOString()}
            initialGuests={2}
          />
        </main>
        <Footer />
      </div>
    ),
  });
}
