"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateHotelSettings, type HotelSettings } from "@/lib/actions/settings";

interface SettingsClientProps {
  settings: HotelSettings;
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaved(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateHotelSettings(formData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error ?? "Error saving settings");
      }
    });
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        {saved && (
          <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Cambios guardados
          </span>
        )}
        {error && (
          <span className="text-sm text-destructive">{error}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Hotel */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Hotel</CardTitle>
            <CardDescription>Datos básicos de tu establecimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotel_name">Nombre del Hotel</Label>
                <Input id="hotel_name" name="hotel_name" defaultValue={settings.hotel_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de Contacto</Label>
                <Input id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Teléfono</Label>
                <Input id="contact_phone" name="contact_phone" defaultValue={settings.contact_phone} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" defaultValue={settings.address} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Reservas</CardTitle>
            <CardDescription>Parámetros para nuevas reservas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check_in_time">Hora de Check-in</Label>
                <Input id="check_in_time" name="check_in_time" type="time" defaultValue={settings.check_in_time} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_time">Hora de Check-out</Label>
                <Input id="check_out_time" name="check_out_time" type="time" defaultValue={settings.check_out_time} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iva_rate">Tasa de IVA (%)</Label>
                <Input id="iva_rate" name="iva_rate" type="number" min="0" max="100" step="0.01" defaultValue={settings.iva_rate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" name="currency" defaultValue={settings.currency} maxLength={3} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociales */}
        <Card>
          <CardHeader>
            <CardTitle>Redes Sociales</CardTitle>
            <CardDescription>Enlaces a tus redes sociales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input id="instagram_url" name="instagram_url" placeholder="https://instagram.com/maikekai" defaultValue={settings.instagram_url ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input id="facebook_url" name="facebook_url" placeholder="https://facebook.com/maikekai" defaultValue={settings.facebook_url ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="+506 8888-8888" defaultValue={settings.whatsapp ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input id="youtube_url" name="youtube_url" placeholder="https://youtube.com/@maikekai" defaultValue={settings.youtube_url ?? ""} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Todos los Cambios
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
