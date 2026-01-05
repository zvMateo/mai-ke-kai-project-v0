import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, CalendarDays, Users, MapPin, Mail, Phone, Download } from "lucide-react"
import { format } from "date-fns"
import type { BookingData } from "./booking-flow"

interface BookingConfirmationProps {
  bookingId: string
  bookingData: BookingData
}

export function BookingConfirmation({ bookingId, bookingData }: BookingConfirmationProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-2">Your surf adventure awaits at Mai Ke Kai</p>
        <p className="text-sm text-muted-foreground mb-8">Confirmation #{bookingId}</p>

        {/* Confirmation Card */}
        <Card className="border-0 shadow-xl mb-8 text-left">
          <CardContent className="p-0">
            {/* Image Header */}
            <div className="relative h-48">
              <Image
                src="/beautiful-costa-rica-surf-beach-with-palm-trees-an.jpg"
                alt="Mai Ke Kai Surf House"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Image
                  src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
                  alt="Mai Ke Kai"
                  width={48}
                  height={48}
                  className="brightness-0 invert"
                />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Dates */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <CalendarDays className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {format(bookingData.checkIn, "EEEE, MMMM d")} - {format(bookingData.checkOut, "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">Check-in: 3:00 PM | Check-out: 11:00 AM</p>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {bookingData.guests} {bookingData.guests === 1 ? "Guest" : "Guests"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.guestInfo?.firstName} {bookingData.guestInfo?.lastName}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Mai Ke Kai Surf House</p>
                  <p className="text-sm text-muted-foreground">Playa Tamarindo, Guanacaste, Costa Rica</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
            <div className="space-y-3 text-left text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  A confirmation email has been sent to{" "}
                  <span className="text-foreground">{bookingData.guestInfo?.email}</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  Need airport transfer? Contact us at <span className="text-foreground">+506 8888-8888</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download Confirmation
          </Button>
          <Link href="/dashboard">
            <Button>View My Bookings</Button>
          </Link>
        </div>

        {/* Back to Home */}
        <div className="mt-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
