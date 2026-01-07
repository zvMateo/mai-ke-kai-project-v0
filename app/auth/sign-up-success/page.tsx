import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight } from "lucide-react"
import { ResendConfirmationButton } from "./resend-button"

export default async function SignUpSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If already confirmed, redirect to login
  if (user?.email_confirmed_at) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <Image
              src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
              alt="Mai Ke Kai"
              width={64}
              height={64}
              className="w-16 h-16 mb-4"
            />
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg text-center">
          <CardHeader className="pb-2">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading">Almost There!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We have sent a confirmation email to your email address.
            </p>

            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-medium">To complete your registration:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Open the email from your inbox</li>
                <li>Click the "Confirm My Account" button</li>
                <li>You are all set!</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground">
              Don't see the email? Check your spam folder or junk mail.
            </p>

            {/* Resend button - always visible */}
            <div className="pt-4 border-t">
              <ResendConfirmationButton userEmail={user?.email || ""} />
            </div>

            {/* Links */}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
