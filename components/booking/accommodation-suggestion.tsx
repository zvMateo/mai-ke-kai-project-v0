"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Bed, Check, Home, X } from "lucide-react";
import { useRoomsWithPricing } from "@/lib/queries";
import { Loader2, AlertCircle } from "lucide-react";
import type { RoomSelection } from "./base/types";

interface AccommodationSuggestionProps {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  selectedRooms: RoomSelection[];
  onComplete: (rooms: RoomSelection[]) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function AccommodationSuggestion({
  checkIn,
  checkOut,
  guests,
  selectedRooms,
  onComplete,
  onSkip,
  onBack,
}: AccommodationSuggestionProps) {
  const { data: rooms = [], isLoading, error, refetch } = useRoomsWithPricing(checkIn);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Initialize selection if rooms were previously selected
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    selectedRooms[0]?.roomId || null
  );
  const [quantity, setQuantity] = useState(selectedRooms[0]?.quantity || 1);

  const getSellUnit = (roomType: string): "bed" | "room" => {
    // Dorms sell by bed, private/family rooms sell by room
    return roomType === "dorm" ? "bed" : "room";
  };

  const handleAddAccommodation = () => {
    const chosen = rooms.find((r) => r.id === selectedRoomId);
    if (!chosen) return;

    const selection: RoomSelection = {
      roomId: chosen.id,
      roomName: chosen.name,
      quantity: quantity,
      pricePerNight: chosen.price_per_night,
      sellUnit: getSellUnit(chosen.type),
    };

    onComplete([selection]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <p className="text-muted-foreground">Error loading rooms. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Skip
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  const availableRooms = rooms.filter((r) => r.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground">
              Would you like to add accommodation?
            </h2>
            <p className="text-muted-foreground mt-1">
              Since you&apos;re booking services from {checkIn.toLocaleDateString()} to{" "}
              {checkOut.toLocaleDateString()}, why not stay with us? You can skip this if you already have a place to stay.
            </p>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      {availableRooms.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Available Rooms
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {availableRooms.map((room) => {
              const isSelected = selectedRoomId === room.id;
              const totalPrice = room.price_per_night * nights * (isSelected ? quantity : 1);

              return (
                <Card
                  key={room.id}
                  className={`overflow-hidden transition-all border-2 cursor-pointer ${
                    isSelected
                      ? "border-primary shadow-lg"
                      : "border-transparent shadow hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            {getSellUnit(room.type) === "bed" ? "Per Bed" : "Per Room"}
                          </Badge>
                          {isSelected && (
                            <Badge className="bg-primary text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Selected
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-heading text-lg font-semibold text-foreground mt-2">
                          {room.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {room.description || `${room.name} accommodation`}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            Capacity: {room.capacity} {getSellUnit(room.type) === "bed" ? "beds" : "guests"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-primary">
                          ${room.price_per_night}
                        </p>
                        <p className="text-xs text-muted-foreground">per night</p>
                        {isSelected && (
                          <p className="text-sm font-semibold text-foreground mt-2">
                            ${totalPrice} total
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Selector (only when selected) */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {getSellUnit(room.type) === "bed" ? "Number of beds:" : "Number of rooms:"}
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuantity(Math.max(1, quantity - 1));
                              }}
                              disabled={quantity <= 1}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuantity(Math.min(room.capacity, quantity + 1));
                              }}
                              disabled={quantity >= room.capacity}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            No rooms available for these dates. You can skip this step.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          {/* Skip Button */}
          <Button variant="outline" onClick={onSkip} className="hidden sm:flex">
            <X className="mr-2 w-4 h-4" />
            No thanks, I have accommodation
          </Button>

          {/* Add Button (only if room selected) */}
          <Button
            onClick={handleAddAccommodation}
            disabled={!selectedRoomId}
            size="lg"
          >
            Add Accommodation
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Skip Button */}
      <Button variant="outline" onClick={onSkip} className="w-full sm:hidden">
        <X className="mr-2 w-4 h-4" />
        No thanks, skip this step
      </Button>
    </div>
  );
}
