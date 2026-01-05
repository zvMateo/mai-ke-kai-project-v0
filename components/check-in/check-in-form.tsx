"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dessert as Passport, FileSignature, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { updateCheckInData, updateGuestPassportInfo } from "@/lib/actions/check-in"

interface CheckInFormProps {
  booking: any
  user: any
  checkInData: any
  canCheckIn: boolean
}

type Step = "passport" | "signature" | "terms" | "complete"

export function CheckInForm({ booking, user, checkInData, canCheckIn }: CheckInFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("passport")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [passportData, setPassportData] = useState({
    passportNumber: user?.passport_number || "",
    passportExpiry: user?.passport_expiry || "",
    nationality: user?.nationality || "",
    dateOfBirth: user?.date_of_birth || "",
    emergencyContact: user?.emergency_contact || "",
  })
  const [termsAccepted, setTermsAccepted] = useState(false)

  const steps = [
    { key: "passport", label: "Datos Personales", icon: Passport },
    { key: "signature", label: "Firma", icon: FileSignature },
    { key: "terms", label: "Terminos", icon: CheckCircle2 },
  ]

  const handlePassportSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await updateGuestPassportInfo(passportData)
      setCurrentStep("signature")
    } catch (err) {
      setError("Error al guardar los datos. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignatureSubmit = async () => {
    // In production, this would capture a real signature
    setIsLoading(true)
    try {
      await updateCheckInData(booking.id, {
        signatureUrl: "signature_captured",
      })
      setCurrentStep("terms")
    } catch (err) {
      setError("Error al guardar la firma.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermsSubmit = async () => {
    if (!termsAccepted) return

    setIsLoading(true)
    setError(null)

    try {
      await updateCheckInData(booking.id, {
        termsAccepted: true,
      })
      router.push(`/check-in/${booking.id}/complete`)
    } catch (err) {
      setError("Error al completar el check-in.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!canCheckIn) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold mb-2">Check-in No Disponible</h2>
          <p className="text-muted-foreground">
            El check-in online estara disponible cuando tu reserva este confirmada.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Image
          src="/images/mai-20ke-20kai-20-20logo-20original.png"
          alt="Mai Ke Kai"
          width={120}
          height={60}
          className="mx-auto mb-4"
        />
        <h1 className="font-heading text-2xl font-bold text-foreground">Check-in Online</h1>
        <p className="text-muted-foreground">Completa tu registro antes de llegar</p>
      </div>

      {/* Booking Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{user?.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(booking.check_in), "d MMM")} - {format(new Date(booking.check_out), "d MMM yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reserva</p>
              <p className="font-mono text-sm">#{booking.id.slice(0, 8)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, idx) => {
          const StepIcon = step.icon
          const isActive = step.key === currentStep
          const isCompleted = steps.findIndex((s) => s.key === currentStep) > idx

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={`flex flex-col items-center ${isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? "border-primary bg-primary/10"
                      : isCompleted
                        ? "border-green-600 bg-green-100"
                        : "border-muted"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${isCompleted ? "bg-green-600" : "bg-muted"}`} />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === "passport" && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Passport className="w-5 h-5 text-primary" />
              Datos del Pasaporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Numero de Pasaporte *</Label>
                <Input
                  id="passportNumber"
                  value={passportData.passportNumber}
                  onChange={(e) => setPassportData({ ...passportData, passportNumber: e.target.value })}
                  placeholder="AB1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportExpiry">Fecha de Vencimiento *</Label>
                <Input
                  id="passportExpiry"
                  type="date"
                  value={passportData.passportExpiry}
                  onChange={(e) => setPassportData({ ...passportData, passportExpiry: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidad *</Label>
                <Input
                  id="nationality"
                  value={passportData.nationality}
                  onChange={(e) => setPassportData({ ...passportData, nationality: e.target.value })}
                  placeholder="Costa Rica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Fecha de Nacimiento *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={passportData.dateOfBirth}
                  onChange={(e) => setPassportData({ ...passportData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
              <Input
                id="emergencyContact"
                value={passportData.emergencyContact}
                onChange={(e) => setPassportData({ ...passportData, emergencyContact: e.target.value })}
                placeholder="Nombre y telefono"
              />
            </div>

            <Button
              onClick={handlePassportSubmit}
              disabled={isLoading || !passportData.passportNumber || !passportData.nationality}
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Continuar
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "signature" && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-primary" />
              Firma Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Al firmar, confirmas que los datos proporcionados son correctos.
            </p>

            {/* Signature Pad Placeholder */}
            <div className="border-2 border-dashed border-muted rounded-lg h-40 flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-sm">Area de firma (toca para firmar)</p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep("passport")} className="flex-1">
                Atras
              </Button>
              <Button onClick={handleSignatureSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Firma
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "terms" && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Terminos y Condiciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Politica de Check-out:</strong> El check-out es a las 11:00 AM. Late check-out disponible bajo
                solicitud.
              </p>
              <p>
                <strong>Ruido:</strong> Por respeto a otros huespedes, mantener silencio despues de las 10:00 PM.
              </p>
              <p>
                <strong>Fumado:</strong> Mai Ke Kai es un establecimiento libre de humo. Areas designadas disponibles.
              </p>
              <p>
                <strong>Responsabilidad:</strong> Mai Ke Kai no se hace responsable por objetos de valor no depositados
                en caja fuerte.
              </p>
              <p>
                <strong>Danos:</strong> El huesped es responsable por cualquier dano causado a la propiedad durante su
                estancia.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm cursor-pointer">
                He leido y acepto los terminos y condiciones de Mai Ke Kai Surf House
              </label>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep("signature")} className="flex-1">
                Atras
              </Button>
              <Button onClick={handleTermsSubmit} disabled={!termsAccepted || isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Completar Check-in
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
