import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Bed } from "lucide-react";
import type { Room } from "@/types/database";
import { getTranslations } from "next-intl/server";

interface RoomsSectionProps {
  rooms: Room[];
  totalBeds: number;
  roomTypes: number;
}

// Fallback images for rooms without images
const fallbackImages: Record<string, string> = {
  dorm: "/modern-surf-hostel-dorm-room-with-wooden-bunk-beds.jpg",
  private: "/cozy-private-room-with-king-bed-tropical-decor-and.jpg",
  family: "/spacious-family-room-with-two-beds-tropical-style-.jpg",
  female: "/bright-female-dorm-room-with-curtained-beds-and-pl.jpg",
};

export async function RoomsSection({
  rooms,
  totalBeds,
  roomTypes,
}: RoomsSectionProps) {
  const t = await getTranslations("rooms");
  const tCommon = await getTranslations("common");

  // Mapping for room type badges (translated)
  const roomBadges: Record<string, string | null> = {
    dorm: t("bestValue"),
    private: t("popular"),
    family: null,
    female: t("female"),
  };
  // Show message if no rooms configured
  if (rooms.length === 0) {
    return (
      <section id="rooms" className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t("noRooms")}
          </p>
          <Link href="/booking">
            <Button>{t("checkAvailability")}</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section id="rooms" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            {t("title")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("sectionSubtitle")}
          </p>
        </div>

        {/* Rooms Grid - Now using real data from Supabase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rooms.map((room) => {
            const badge = roomBadges[room.type] || null;
            const imageUrl =
              room.main_image ||
              fallbackImages[room.type] ||
              "/placeholder.svg";
            const amenities = room.amenities || [];

            return (
              <Card
                key={room.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {badge && (
                    <Badge className="absolute top-4 left-4 bg-primary text-white">
                      {badge}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-xl font-bold text-foreground">
                      {room.name}
                    </h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        {tCommon("from")} $
                        {room.sell_unit === "bed" ? "25" : "85"}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        /{room.sell_unit}/{tCommon("perNight")}
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {room.description ||
                      `${
                        room.type === "dorm"
                          ? "Shared dormitory"
                          : "Private room"
                      } with ${room.capacity} capacity.`}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {t("upTo")} {room.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {room.sell_unit === "bed"
                        ? `${room.capacity} ${t("beds")}`
                        : t("private")}
                    </span>
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {amenities.slice(0, 4).map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="secondary"
                          className="text-xs"
                        >
                          {amenity}
                        </Badge>
                      ))}
                      {amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{amenities.length - 4} {t("more")}
                        </Badge>
                      )}
                    </div>
                  )}

                  <Link href={`/booking?room=${room.id}`}>
                    <Button className="w-full bg-transparent" variant="outline">
                      {t("bookRoom")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Bar - Now using real data */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-primary/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              {totalBeds}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">{t("totalBeds")}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              {roomTypes}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">{t("roomTypes")}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary">3pm</p>
            <p className="text-muted-foreground text-xs sm:text-sm">{t("checkIn")}</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary">11am</p>
            <p className="text-muted-foreground text-xs sm:text-sm">{t("checkOut")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
