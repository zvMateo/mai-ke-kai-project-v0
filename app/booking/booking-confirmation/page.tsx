import { Suspense } from "react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { BookingConfirmationPage } from "./booking-confirmation-page"

export const metadata = {
  title: "Booking Confirmed",
  description: "Your surf adventure at Mai Ke Kai is confirmed!",
}

export default function BookingConfirmationLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <Suspense fallback={<ConfirmationLoading />}>
          <BookingConfirmationPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

function ConfirmationLoading() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  )
}
