"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Award, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/logout-button";
import { useUserProfile, useUpcomingBookings } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardClientProps {
  userId: string;
  userEmail: string | null;
}

export function DashboardClient({ userId, userEmail }: DashboardClientProps) {
  const { data: profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { data: upcomingBookings, isLoading: isBookingsLoading } =
    useUpcomingBookings(userId);

  const loyaltyPoints = profile?.loyalty_points ?? 0;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Surfer";

  const renderUpcoming = () => {
    if (isBookingsLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 rounded-lg" />
          ))}
        </div>
      );
    }

    if (!upcomingBookings || upcomingBookings.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Sin reservas próximas</h3>
          <p className="text-muted-foreground mb-4">
            ¿Listo para tu próxima aventura de surf?
          </p>
          <Link href="/booking">
            <Button>Reservar Ahora</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {upcomingBookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/dashboard/bookings/${booking.id}`}
            className="block"
          >
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {format(new Date(booking.check_in), "d MMM")} -{" "}
                    {format(new Date(booking.check_out), "d MMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.booking_rooms
                      ?.map((br) => br.rooms?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  booking.status === "confirmed" ? "default" : "secondary"
                }
              >
                {booking.status === "confirmed"
                  ? "Confirmada"
                  : booking.status === "checked_in"
                  ? "En estancia"
                  : "Pendiente"}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/mai-20ke-20kai-20-20isotipo-20-20original.png"
              alt="Mai Ke Kai"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="font-heading font-semibold text-primary">
              Mai Ke Kai
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {userEmail}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {isProfileLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>Hola, {firstName}!</>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus reservas y aventuras de surf
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/booking">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Nueva Reserva</p>
                  <p className="text-sm text-muted-foreground">
                    Reserva tu estancia
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/packages">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-coral/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <p className="font-semibold">Paquetes Surf</p>
                  <p className="text-sm text-muted-foreground">
                    Ahorra hasta 30%
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/loyalty">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-seafoam/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-ocean-dark" />
                </div>
                <div>
                  <p className="font-semibold">Puntos de Fidelidad</p>
                  <p className="text-sm text-muted-foreground">
                    {isProfileLoading ? (
                      <Skeleton className="h-4 w-28" />
                    ) : loyaltyPoints > 0 ? (
                      <span className="text-primary font-medium">
                        {loyaltyPoints.toLocaleString()} puntos
                      </span>
                    ) : (
                      "Empieza a ganar"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-heading flex items-center justify-between">
              Próximas Estancias
              <Link href="/dashboard/bookings">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>{renderUpcoming()}</CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-between hover:bg-muted/50 -m-6 p-6 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Mi Perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu información personal
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
