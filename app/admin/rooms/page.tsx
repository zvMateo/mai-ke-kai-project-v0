import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Users, DollarSign, Plus, Pencil } from "lucide-react";
import Link from "next/link";

async function getRoomsWithPricing() {
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      `
      *,
      beds (id, bed_number, bed_type, is_active),
      season_pricing (season, base_price, rack_rate)
    `
    )
    .order("name");

  return rooms || [];
}

export default async function RoomsPage() {
  const rooms = await getRoomsWithPricing();

  const roomTypeLabels: Record<string, string> = {
    dorm: "Dormitory",
    private: "Private",
    family: "Family/Group",
    female: "Female Only",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Rooms & Beds</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Button asChild>
          <Link href="/admin/rooms/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Link>
        </Button>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No rooms configured yet. Create your first room to get started.
            </p>
            <Button asChild>
              <Link href="/admin/rooms/new">Create Room</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {rooms.map((room) => {
            const midSeasonPrice = room.season_pricing?.find(
              (p: { season: string }) => p.season === "mid"
            );

            return (
              <Card key={room.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {room.main_image && (
                        <img
                          src={room.main_image || "/placeholder.svg"}
                          alt={room.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <CardTitle className="font-heading text-xl">
                          {room.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            {roomTypeLabels[room.type] || room.type}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            Sell by {room.sell_unit}
                          </Badge>
                          {room.is_active ? (
                            <Badge className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/rooms/${room.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {room.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Capacity
                        </p>
                        <p className="font-semibold">{room.capacity} guests</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Bed className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Beds</p>
                        <p className="font-semibold">
                          {room.beds?.length || 0} configured
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Base Price
                        </p>
                        <p className="font-semibold">
                          ${midSeasonPrice?.base_price || "—"}/night
                        </p>
                      </div>
                    </div>
                  </div>

                  {room.amenities && room.amenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Amenities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="outline">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
