"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  Info,
  CreditCard,
} from "lucide-react"
import { useState } from "react"

interface TabPaymentCardProps {
  bookingReference: string
  totalAmount: number
  guestName: string
  tabPaymentLink: string
}

export function TabPaymentCard({
  bookingReference,
  totalAmount,
  guestName,
  tabPaymentLink,
}: TabPaymentCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(bookingReference)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = bookingReference
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenTab = () => {
    window.open(tabPaymentLink, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-primary-foreground">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5" />
          <h3 className="font-heading text-lg font-semibold">
            Complete Your Payment
          </h3>
        </div>
        <p className="text-sm opacity-90">
          Pay securely through Tab.travel with credit card, bank transfer, or
          local payment methods.
        </p>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Amount & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Amount Due
            </p>
            <p className="text-2xl font-bold text-foreground">
              ${totalAmount.toFixed(2)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                USD
              </span>
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Booking Reference
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold font-mono text-foreground">
                {bookingReference}
              </p>
              <button
                onClick={handleCopyReference}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                title="Copy reference"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            How to Pay
          </h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Badge
                variant="outline"
                className="h-6 w-6 shrink-0 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                1
              </Badge>
              <span>
                Click the <strong>"Pay Now"</strong> button below to open
                Tab.travel
              </span>
            </li>
            <li className="flex gap-3">
              <Badge
                variant="outline"
                className="h-6 w-6 shrink-0 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                2
              </Badge>
              <span>
                Enter the exact amount:{" "}
                <strong>${totalAmount.toFixed(2)} USD</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <Badge
                variant="outline"
                className="h-6 w-6 shrink-0 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                3
              </Badge>
              <span>
                In the payment notes/reference field, enter:{" "}
                <strong className="font-mono">{bookingReference}</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <Badge
                variant="outline"
                className="h-6 w-6 shrink-0 rounded-full p-0 flex items-center justify-center text-xs font-bold"
              >
                4
              </Badge>
              <span>
                We&apos;ll confirm your booking within a few hours after
                verifying your payment
              </span>
            </li>
          </ol>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handleOpenTab}
          size="lg"
          className="w-full text-base h-12"
        >
          <ExternalLink className="mr-2 w-5 h-5" />
          Pay Now on Tab.travel
        </Button>

        {/* Status Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Your booking is reserved for 24 hours
            </p>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
              Please complete payment within 24 hours to secure your
              reservation. If we don&apos;t receive payment, the booking will be
              automatically released.
            </p>
          </div>
        </div>

        {/* Help */}
        <p className="text-xs text-center text-muted-foreground">
          Need help? Contact us at{" "}
          <a
            href="mailto:reservations@maikekaihouse.com"
            className="text-primary hover:underline"
          >
            reservations@maikekaihouse.com
          </a>{" "}
          or WhatsApp{" "}
          <a
            href="https://wa.me/50612345678"
            className="text-primary hover:underline"
          >
            +506 1234 5678
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
