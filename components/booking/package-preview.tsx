"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Moon,
  Users,
  Bed,
  Check,
} from "lucide-react";

interface PackagePreviewProps {
  packageData: {
    id: string;
    name: string;
    tagline?: string;
    description?: string;
    nights?: number;
    is_for_two?: boolean;
    room_type?: string;
    includes?: string[];
    price?: number;
    original_price?: number;
    image_url?: string;
  };
  onContinue: () => void;
  onBack: () => void;
}

export function PackagePreview({
  packageData,
  onContinue,
  onBack,
}: PackagePreviewProps) {
  const hasDiscount =
    packageData.original_price &&
    packageData.price &&
    packageData.original_price > packageData.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((packageData.original_price! - packageData.price!) /
          packageData.original_price!) *
          100
      )
    : 0;

  // Check if package has any configuration
  const hasAnyConfig =
    packageData.nights ||
    packageData.is_for_two ||
    packageData.room_type ||
    (packageData.includes && packageData.includes.length > 0);

  return (
    <div className="space-y-6">
      {/* Image */}
      {packageData.image_url && (
        <div className="relative h-64 rounded-lg overflow-hidden">
          <Image
            src={packageData.image_url}
            alt={packageData.name}
            fill
            className="object-cover"
          />
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{discountPercent}%
            </div>
          )}
        </div>
      )}

      {/* Title and Description */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          {packageData.name}
        </h1>
        {packageData.tagline && (
          <p className="text-lg text-primary font-medium">
            {packageData.tagline}
          </p>
        )}
        {packageData.description && (
          <p className="text-muted-foreground mt-4">
            {packageData.description}
          </p>
        )}
      </div>

      {/* Package Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-heading text-lg font-bold mb-4">
            ¿Qué incluye este paquete?
          </h3>

          <div className="space-y-3">
            {/* Nights */}
            {packageData.nights && packageData.nights > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Moon className="w-5 h-5 text-primary" />
                <span className="font-medium">
                  {packageData.nights} {packageData.nights === 1 ? "noche" : "noches"}
                </span>
              </div>
            )}

            {/* Guests */}
            {packageData.is_for_two && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-medium">2 Personas</span>
              </div>
            )}

            {/* Room Type */}
            {packageData.room_type && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Bed className="w-5 h-5 text-primary" />
                <span className="font-medium capitalize">
                  Habitación: {packageData.room_type}
                </span>
              </div>
            )}

            {/* Includes */}
            {packageData.includes && packageData.includes.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase">
                  Servicios Incluidos:
                </h4>
                {packageData.includes.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!hasAnyConfig && (
              <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                <p className="font-medium">
                  Este es un paquete personalizable
                </p>
                <p className="text-sm mt-2">
                  Puedes configurar todos los detalles (fechas, personas,
                  servicios) en los próximos pasos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="space-y-3">
            {hasDiscount && (
              <div>
                <p className="text-sm text-muted-foreground">Precio Original</p>
                <p className="text-lg font-medium line-through text-muted-foreground">
                  ${packageData.original_price}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Precio del Paquete</p>
              <p className="text-3xl font-heading font-bold text-primary">
                ${packageData.price || "Contactar"}
              </p>
            </div>

            {hasDiscount && (
              <p className="text-sm text-green-600 font-medium">
                ¡Ahorras ${packageData.original_price! - packageData.price!}!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          Después de confirmar este paquete, podrás agregar servicios
          adicionales, completar tu información y proceder al pago.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atrás
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Continuar Reserva
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
