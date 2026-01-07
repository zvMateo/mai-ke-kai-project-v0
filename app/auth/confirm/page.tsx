"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { confirmEmail } from "@/lib/actions/users"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

type Status = "loading" | "success" | "error"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")
  const [showResend, setShowResend] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de confirmación no proporcionado")
      setShowResend(true)
      return
    }

    const verifyToken = async () => {
      try {
        const result = await confirmEmail(token)

        if (result.success) {
          setStatus("success")
          setMessage("¡Tu correo electrónico ha sido confirmado exitosamente!")
          
          setTimeout(() => {
            router.push("/auth/sign-up-success")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(result.error || "Error al confirmar")
          setShowResend(true)
        }
      } catch (error) {
        setStatus("error")
        setMessage("Ocurrió un error inesperado")
        setShowResend(true)
      }
    }

    verifyToken()
  }, [token, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Verificando tu correo electrónico...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          {status === "success" ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-xl">
            {status === "success" ? "¡Confirmado!" : "Error de Confirmación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Redirigiendo a la página de inicio de sesión...
            </p>
          )}

          {showResend && (
            <div className="space-y-4 pt-4 border-t">
              <p className="text-sm">¿No recibiste el email?</p>
              <ConfirmEmailForm initialEmail="" />
            </div>
          )}

          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function ConfirmEmailForm({ initialEmail }: { initialEmail: string }) {
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("¡Email reenviado! Revisa tu bandeja de entrada.")
      } else {
        setMessage(data.error || "Error al reenviar email")
      }
    } catch (error) {
      setMessage("Error al reenviar email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      <input
        type="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-3 py-2 border rounded-lg text-sm"
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reenviar Email
          </>
        )}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("¡") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </form>
  )
}
