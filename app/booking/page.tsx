import { Suspense } from "react";
import { addDays } from "date-fns";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { BookingFlow, BookingMode } from "@/components/booking/booking-flow";
import {
  withQueryClient,
  prefetchBookingFlow,
} from "@/lib/queries/index.server";
import { Loader2 } from "lucide-react";

// Helper to parse ISO date string to local Date
const parseISODateToLocal = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("T")[0].split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const metadata = {
  title: "Book Your Stay",
  description:
    "Check availability and book your surf paradise at Mai Ke Kai Surf House.",
};

interface BookingPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  // In Next.js 15+, searchParams is a Promise — must await it
  const rawParams = await searchParams;

  // Parse URL parameters
  const mode = ((rawParams.mode as string) || "accommodation") as BookingMode;
  const packageId = rawParams.packageId as string | undefined;
  const serviceId = rawParams.serviceId as string | undefined;
  const roomId = rawParams.roomId as string | undefined;
  const roomName = rawParams.roomName as string | undefined;
  const checkIn = rawParams.checkIn as string | undefined;
  const checkOut = rawParams.checkOut as string | undefined;
  const guests = rawParams.guests as string | undefined;
  const hasSearchParams = Boolean(checkIn && checkOut);

  const initialCheckIn = checkIn
    ? parseISODateToLocal(checkIn)
    : addDays(new Date(), 7);
  const initialCheckOut = checkOut
    ? parseISODateToLocal(checkOut)
    : addDays(new Date(), 10);
  const initialGuests = guests ? Number.parseInt(guests) : 2;

  console.log("BookingPage rendering", {
    mode,
    packageId,
    initialCheckIn: initialCheckIn.toISOString(),
    initialCheckOut: initialCheckOut.toISOString(),
    initialGuests,
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
              mode={mode}
              packageId={packageId}
              serviceId={serviceId}
              roomId={roomId}
              roomName={roomName}
              initialCheckInISO={initialCheckIn.toISOString()}
              initialCheckOutISO={initialCheckOut.toISOString()}
              initialGuests={initialGuests}
              hasSearchParams={hasSearchParams}
            />
          </Suspense>
        </main>
        <Footer />
      </div>
    ),
  });
}
