import { Suspense } from "react";
import { addDays } from "date-fns";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { BookingFlow } from "@/components/booking/booking-flow";
import { withQueryClient, prefetchBookingFlow } from "@/lib/queries/index.server";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Book Your Stay",
  description:
    "Check availability and book your surf paradise at Mai Ke Kai Surf House.",
};

export default async function BookingPage() {
  const initialCheckIn = addDays(new Date(), 7);
  const initialCheckOut = addDays(new Date(), 10);

  console.log("BookingPage rendering", {
    initialCheckIn: initialCheckIn.toISOString(),
    initialCheckOut: initialCheckOut.toISOString(),
  });

  return withQueryClient({
    prefetch: (queryClient) => {
      console.log("BookingPage prefetching");
      return prefetchBookingFlow(queryClient, initialCheckIn);
    },
    children: (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <BookingFlow
              initialCheckInISO={initialCheckIn.toISOString()}
              initialCheckOutISO={initialCheckOut.toISOString()}
              initialGuests={2}
            />
          </Suspense>
        </main>
        <Footer />
      </div>
    ),
  });
}
