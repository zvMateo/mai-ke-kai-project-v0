"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  CalendarIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { ExtraSelection } from "./booking-flow";
import { useServices } from "@/lib/queries";
import { format } from "date-fns";

interface ServiceDate {
  [serviceId: string]: string; // serviceId -> ISO date
}

interface ServiceOnlySelectorProps {
  serviceId?: string;
  selectedExtras: ExtraSelection[];
  serviceDates?: ServiceDate;
  onComplete: (data: {
    checkIn: Date;
    checkOut: Date;
    extras: ExtraSelection[];
    serviceDates: ServiceDate;
  }) => void;
  onBack: () => void;
}

export function ServiceOnlySelector({
  serviceId,
  selectedExtras: initialExtras,
  serviceDates: initialDates = {},
  onComplete,
  onBack,
}: ServiceOnlySelectorProps) {
  const [selections, setSelections] = useState<ExtraSelection[]>(initialExtras);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [serviceDates, setServiceDates] = useState<ServiceDate>(initialDates);

  const { data: services = [], isLoading, error, refetch } = useServices();

  // Pre-seleccionar servicio si se pasa serviceId
  useEffect(() => {
    if (serviceId && !isLoading && services.length > 0) {
      const service = services.find((s) => s.id === serviceId);
      if (service && !selections.some((s) => s.serviceId === serviceId)) {
        updateSelection(serviceId, 1);
      }
    }
  }, [serviceId, isLoading, services]);

  const updateSelection = (serviceId: string, quantity: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    setSelections((prev) => {
      if (quantity === 0) {
        return prev.filter((s) => s.serviceId !== serviceId);
      }

      const existing = prev.find((s) => s.serviceId === serviceId);
      if (existing) {
        return prev.map((s) =>
          s.serviceId === serviceId ? { ...s, quantity } : s
        );
      }

      return [
        ...prev,
        {
          serviceId: service.id,
          serviceName: service.name,
          quantity,
          price: service.price,
          date: selectedDate.toISOString().split("T")[0],
        },
      ];
    });

    // Auto-assign date if not set
    if (!serviceDates[serviceId] && quantity > 0) {
      setServiceDates((prev) => ({
        ...prev,
        [serviceId]: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  const handleDateChange = (serviceId: string, date: Date) => {
    setServiceDates((prev) => ({
      ...prev,
      [serviceId]: date.toISOString().split("T")[0],
    }));
  };

  const handleComplete = () => {
    if (selections.length === 0) {
      alert("Por favor selecciona al menos un servicio");
      return;
    }

    // Determine checkIn and checkOut based on selected dates
    const dates = Object.values(serviceDates).map((d) => new Date(d)).sort();
    const checkIn = dates.length > 0 ? dates[0] : new Date();
    const checkOut = dates.length > 0 ? dates[dates.length - 1] : new Date();

    onComplete({
      checkIn,
      checkOut,
      extras: selections,
      serviceDates,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading text-2xl font-bold mb-2">
          Selecciona tus Servicios
        </h2>
        <p className="text-muted-foreground">
          Elige los servicios que deseas reservar. Puedes seleccionar servicios
          en diferentes fechas.
        </p>
      </div>

      {/* Date Picker */}
      <div className="bg-card rounded-lg border border-border p-6">
        <label className="text-sm font-medium block mb-3">
          Selecciona una fecha para los servicios:
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-12"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {format(selectedDate, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Services Grid */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading text-lg font-bold mb-4">Servicios Disponibles</h3>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <p>Error al cargar servicios. Intenta de nuevo.</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="ml-auto"
            >
              Reintentar
            </Button>
          </div>
        )}

        {services.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-8">
            No hay servicios disponibles.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const selection = selections.find(
              (s) => s.serviceId === service.id
            );
            const serviceDate = serviceDates[service.id];

            return (
              <Card
                key={service.id}
                className={`overflow-hidden transition-all ${
                  selection ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-heading font-bold text-foreground">
                        {service.name}
                      </h4>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-heading text-lg font-bold text-primary">
                        ${service.price}
                      </p>
                      {service.duration_hours && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {service.duration_hours}h
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateSelection(
                            service.id,
                            (selection?.quantity || 0) - 1
                          )
                        }
                        disabled={!selection || selection.quantity === 0}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {selection?.quantity || 0}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateSelection(
                            service.id,
                            (selection?.quantity || 0) + 1
                          )
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Date for this service */}
                    {selection && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {serviceDate
                              ? format(new Date(serviceDate), "MMM dd")
                              : "Set Date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0"
                          align="end"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              serviceDate ? new Date(serviceDate) : undefined
                            }
                            onSelect={(date) =>
                              date && handleDateChange(service.id, date)
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Selected Services Summary */}
      {selections.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-heading text-lg font-bold mb-4">
            Servicios Seleccionados
          </h3>
          <div className="space-y-3">
            {selections.map((selection) => (
              <div
                key={selection.serviceId}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium">{selection.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {selection.quantity}
                  </p>
                  {serviceDates[selection.serviceId] && (
                    <p className="text-sm text-muted-foreground">
                      Fecha:{" "}
                      {format(
                        new Date(serviceDates[selection.serviceId]),
                        "MMM dd, yyyy"
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold">
                    ${selection.price * selection.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${selection.price} x {selection.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-heading font-bold">Total Servicios:</p>
              <p className="font-heading text-lg font-bold text-primary">
                $
                {selections.reduce(
                  (sum, s) => sum + s.price * s.quantity,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button
          onClick={handleComplete}
          disabled={selections.length === 0}
          className="flex-1"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
