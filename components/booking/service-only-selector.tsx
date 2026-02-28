"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  CalendarIcon,
  Loader2,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import type { ExtraSelection } from "./base/types";
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
  selectedExtras: initialExtras,
  serviceDates: initialDates = {},
  onComplete,
  onBack,
}: ServiceOnlySelectorProps) {
  const [selections, setSelections] = useState<ExtraSelection[]>(initialExtras);
  const [serviceDates, setServiceDates] = useState<ServiceDate>(initialDates);
  const [openDatePicker, setOpenDatePicker] = useState<string | null>(null);

  const { data: services = [], isLoading, error, refetch } = useServices();

  // Helper to normalize date from Calendar (which may return UTC dates)
  // This ensures we work with the correct local date
  const normalizeDate = (date: Date): Date => {
    // Create a new date using local timezone components to avoid UTC issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    // Use the exact local time to preserve the selected date
    return new Date(year, month, day);
  };

  // Helper to format date to YYYY-MM-DD using local time
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper to parse ISO date string to local Date
  const parseISODate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const addServiceWithDate = (serviceId: string, date: Date) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return;

    const dateStr = formatDateToString(date);

    setSelections((prev) => {
      const existing = prev.find((s) => s.serviceId === serviceId);
      if (existing) {
        // Increment quantity if already selected
        return prev.map((s) =>
          s.serviceId === serviceId ? { ...s, quantity: s.quantity + 1 } : s,
        );
      }

      return [
        ...prev,
        {
          serviceId: service.id,
          serviceName: service.name,
          quantity: 1,
          price: service.price,
          date: dateStr,
        },
      ];
    });

    setServiceDates((prev) => ({
      ...prev,
      [serviceId]: dateStr,
    }));

    setOpenDatePicker(null);
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setSelections((prev) => {
      const existing = prev.find((s) => s.serviceId === serviceId);
      if (!existing) return prev;

      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        // Remove service entirely if quantity reaches 0
        const newSelections = prev.filter((s) => s.serviceId !== serviceId);
        // Also remove from serviceDates
        setServiceDates((dates) => {
          const newDates = { ...dates };
          delete newDates[serviceId];
          return newDates;
        });
        return newSelections;
      }

      return prev.map((s) =>
        s.serviceId === serviceId ? { ...s, quantity: newQuantity } : s,
      );
    });
  };

  const removeService = (serviceId: string) => {
    setSelections((prev) => prev.filter((s) => s.serviceId !== serviceId));
    setServiceDates((prev) => {
      const newDates = { ...prev };
      delete newDates[serviceId];
      return newDates;
    });
  };

  const changeServiceDate = (serviceId: string, date: Date) => {
    const dateStr = formatDateToString(date);
    setServiceDates((prev) => ({
      ...prev,
      [serviceId]: dateStr,
    }));
    setSelections((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, date: dateStr } : s,
      ),
    );
  };

  const handleComplete = () => {
    if (selections.length === 0) {
      alert("Please select at least one service");
      return;
    }

    // Determine checkIn and checkOut based on selected dates
    const dates = Object.values(serviceDates)
      .map((d) => new Date(d))
      .sort();
    const checkIn = dates.length > 0 ? dates[0] : new Date();
    const checkOut = dates.length > 0 ? dates[dates.length - 1] : new Date();

    onComplete({
      checkIn,
      checkOut,
      extras: selections,
      serviceDates,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-heading text-2xl font-bold mb-2">
            Select Your Services
          </h2>
          <p className="text-muted-foreground">
            Choose the services you want to book. Each service can be scheduled
            on a different date.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-heading text-2xl font-bold mb-2">
            Select Your Services
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground">
            Failed to load services. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading text-2xl font-bold mb-2">
          Select Your Services
        </h2>
        <p className="text-muted-foreground">
          Choose the services you want to book. Click on a service to select the
          date.
        </p>
      </div>

      {/* Services Grid */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-heading text-lg font-bold mb-4">
          Available Services
        </h3>

        {services.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No services available at the moment.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const selection = selections.find(
              (s) => s.serviceId === service.id,
            );
            const serviceDate = serviceDates[service.id];
            const isSelected = Boolean(selection);

            return (
              <Card
                key={service.id}
                className={`overflow-hidden transition-all ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "border-border"
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {service.duration_hours}h
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date Selection or Quantity Controls */}
                  <div className="pt-3 border-t border-border">
                    {!isSelected ? (
                      // Not selected - show date picker button
                      <Popover
                        open={openDatePicker === service.id}
                        onOpenChange={(open) =>
                          setOpenDatePicker(open ? service.id : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Select Date to Add
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            onSelect={(date) =>
                              date &&
                              addServiceWithDate(
                                service.id,
                                normalizeDate(date),
                              )
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      // Selected - show quantity and date
                      <div className="space-y-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(service.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {selection?.quantity || 0}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(service.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Selected Date with Change Option */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Date:</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary"
                              >
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {serviceDate
                                  ? format(
                                      parseISODate(serviceDate),
                                      "MMM dd, yyyy",
                                    )
                                  : "Select Date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar
                                mode="single"
                                selected={
                                  serviceDate
                                    ? parseISODate(serviceDate)
                                    : undefined
                                }
                                onSelect={(date) =>
                                  date &&
                                  changeServiceDate(
                                    service.id,
                                    normalizeDate(date),
                                  )
                                }
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:text-destructive"
                          onClick={() => removeService(service.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
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
            Selected Services
          </h3>
          <div className="space-y-3">
            {selections.map((selection) => (
              <div
                key={selection.serviceId}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selection.serviceName}</p>
                    <p className="text-sm text-muted-foreground">
                      {serviceDates[selection.serviceId]
                        ? format(
                            parseISODate(serviceDates[selection.serviceId]),
                            "MMM dd, yyyy",
                          )
                        : "No date set"}{" "}
                      × {selection.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-heading font-bold">
                    ${selection.price * selection.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="font-heading font-bold">Total Services:</p>
              <p className="font-heading text-lg font-bold text-primary">
                ${selections.reduce((sum, s) => sum + s.price * s.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={selections.length === 0}
          className="flex-1"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
