import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, CheckCircle, RefreshCw, ArrowRight } from "lucide-react"
import { ResendConfirmationButton } from "./resend-button"

export default async function SignUpSuccessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si ya confirmó, redirigir al dashboard
  if (user?.email_confirmed_at) {
    redirect("/dashboard")
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
            <CardTitle className="text-2xl font-heading">¡Casi Listo!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Te hemos enviado un email de confirmación a tu correo electrónico.
            </p>

            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-medium">Para completar tu registro:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Abre el email desde tu bandeja de entrada</li>
                <li>Haz clic en el botón "Confirmar Mi Cuenta"</li>
                <li>¡Listo! Tu cuenta estará activa</li>
              </ol>
            </div>

            <p className="text-xs text-muted-foreground">
              ¿No ves el email? Revisa tu carpeta de spam o correo no deseado.
            </p>

            {/* Botón de reenvío - siempre visible */}
            <div className="pt-4 border-t">
              <ResendConfirmationButton userEmail={user?.email || ""} />
            </div>

            {/* Links */}
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Volver a Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
