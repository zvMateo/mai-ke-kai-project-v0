import { Suspense } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { BookingFlow } from "@/components/booking/booking-flow"

export const metadata = {
  title: "Book Your Stay",
  description: "Check availability and book your surf paradise at Mai Ke Kai Surf House.",
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <Suspense fallback={<BookingLoading />}>
          <BookingFlow />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

function BookingLoading() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  )
}
