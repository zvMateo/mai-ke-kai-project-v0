"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

export function ResendConfirmationButton({ userEmail }: { userEmail: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleResend = async () => {
    if (!userEmail) return
    
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("¡Email reenviado! Revisa tu bandeja de entrada.")
      } else {
        setMessage(data.error || "Error al reenviar")
      }
    } catch (error) {
      setMessage("Error al reenviar email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button 
        onClick={handleResend} 
        className="w-full"
        disabled={isLoading || !userEmail}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reenviar Email de Confirmación
          </>
        )}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes("¡") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  )
}