import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <div className="space-y-6">
        {/* Información del Hotel */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Hotel</CardTitle>
            <CardDescription>Datos básicos de tu establecimiento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Nombre del Hotel</Label>
                <Input id="hotelName" defaultValue="Mai Ke Kai Surf House" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto</Label>
                <Input id="contactEmail" type="email" defaultValue="reservas@maikekai.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono</Label>
                <Input id="contactPhone" defaultValue="+506 8888-8888" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" defaultValue="Playa Tamarindo, Guanacaste, Costa Rica" />
              </div>
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
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
                <Label htmlFor="checkInTime">Hora de Check-in</Label>
                <Input id="checkInTime" type="time" defaultValue="15:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOutTime">Hora de Check-out</Label>
                <Input id="checkOutTime" type="time" defaultValue="11:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ivaRate">Tasa de IVA (%)</Label>
                <Input id="ivaRate" type="number" defaultValue="13" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Input id="currency" defaultValue="USD" />
              </div>
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
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
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" placeholder="https://instagram.com/maikekai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" placeholder="https://facebook.com/maikekai" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" placeholder="+506 8888-8888" />
              </div>
            </div>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
